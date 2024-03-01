const ProductSchema: Realm.ObjectSchema = {
  name: 'Product',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    productCode: 'string',
    stock: 'int',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export default ProductSchema;
