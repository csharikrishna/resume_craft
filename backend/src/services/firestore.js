const { db, admin } = require('./firebase');

function toPlain(value) {
  if (value instanceof admin.firestore.Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlain);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, item]) => {
      acc[key] = toPlain(item);
      return acc;
    }, {});
  }

  return value;
}

function withId(doc) {
  return { id: doc.id, ...toPlain(doc.data()) };
}

async function getById(collection, id) {
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists) return null;
  return withId(snap);
}

async function createDoc(collection, data, id) {
  const ref = id ? db.collection(collection).doc(id) : db.collection(collection).doc();
  await ref.set(data);
  return { id: ref.id, ...toPlain(data) };
}

async function updateDoc(collection, id, data) {
  await db.collection(collection).doc(id).update(data);
  return getById(collection, id);
}

async function deleteDoc(collection, id) {
  await db.collection(collection).doc(id).delete();
}

async function findAllByField(collection, field, value) {
  const snap = await db.collection(collection).where(field, '==', value).get();
  return snap.docs.map(withId);
}

async function findOneByField(collection, field, value) {
  const snap = await db.collection(collection).where(field, '==', value).limit(1).get();
  if (snap.empty) return null;
  return withId(snap.docs[0]);
}

module.exports = {
  db,
  admin,
  getById,
  createDoc,
  updateDoc,
  deleteDoc,
  findAllByField,
  findOneByField,
  toPlain
};
