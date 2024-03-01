export const PurchaseItemSchema: Realm.ObjectSchema = {
  name: 'PurchaseItem',
  properties: {
    productCode: 'string',
    price: 'int',
    quantity: 'int',
  },
};

const PurchaseSchema: Realm.ObjectSchema = {
  name: 'Purchase',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    items: {type: 'list', objectType: 'PurchaseItem'},
    notes: 'string?',
    purchaser: 'string?',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export default PurchaseSchema;
