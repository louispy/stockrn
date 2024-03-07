export const OrderItemSchema: Realm.ObjectSchema = {
  name: 'OrderItem',
  properties: {
    productCode: 'string',
    price: 'int',
    quantity: 'int',
  },
};

const OrderSchema: Realm.ObjectSchema = {
  name: 'Order',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    items: {type: 'list', objectType: 'OrderItem'},
    notes: 'string?',
    admin: 'string?',
    buyer: 'string?',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export default OrderSchema;
