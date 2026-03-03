const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const authMiddleware = require('../middleware/auth');
const { createDoc, findOneByField, updateDoc } = require('../services/firestore');

const router = express.Router();

const PRICE_MAP = {
  pdf_export: { amount: 4900, currency: 'INR', label: 'PDF Export' },
  premium_template: { amount: 9900, currency: 'INR', label: 'Premium Template' },
  cover_letter: { amount: 7900, currency: 'INR', label: 'AI Cover Letter' }
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(200).json({ received: true });

    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (signature !== expected) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(req.body.toString('utf8'));
    if (payload?.event === 'payment.captured') {
      const orderId = payload?.payload?.payment?.entity?.order_id;
      const paymentId = payload?.payload?.payment?.entity?.id;
      if (orderId && paymentId) {
        const existing = await findOneByField('payments', 'orderId', orderId);
        if (existing && existing.status !== 'success') {
          await updateDoc('payments', existing.id, {
            status: 'success',
            paymentId,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
});

router.use(authMiddleware);

router.post('/create-order', async (req, res) => {
  try {
    const { actionType, resumeId } = req.body;

    if (!actionType || !resumeId) {
      return res.status(400).json({ error: 'actionType and resumeId are required' });
    }

    const pricing = PRICE_MAP[actionType];
    if (!pricing) {
      return res.status(400).json({ error: 'Invalid actionType' });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({ error: 'Payment gateway is not configured' });
    }

    const order = await razorpay.orders.create({
      amount: pricing.amount,
      currency: pricing.currency,
      receipt: `rc_${req.user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        resumeId,
        actionType
      }
    });

    await createDoc('payments', {
      userId: req.user.id,
      resumeId,
      actionType,
      amount: pricing.amount,
      currency: pricing.currency,
      label: pricing.label,
      orderId: order.id,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.json({
      orderId: order.id,
      amount: pricing.amount,
      currency: pricing.currency,
      label: pricing.label,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'Payment gateway is not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const payment = await findOneByField('payments', 'orderId', razorpay_order_id);

    if (!payment || payment.userId !== req.user.id) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const updatedPayment = await updateDoc('payments', payment.id, {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'success',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      actionType: updatedPayment.actionType,
      resumeId: updatedPayment.resumeId,
      paymentId: razorpay_payment_id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;
