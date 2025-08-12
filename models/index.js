const { Sequelize } = require('sequelize');
const config = require('../config/db');

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: 'postgres',
        logging: false,
    }
);

// Import models
const User = require('./user')(sequelize);
const Product = require('./product')(sequelize);
const Category = require('./category')(sequelize);
const Order = require('./order')(sequelize);
const OrderItem = require('./orderItem')(sequelize);
const Cart = require('./cart')(sequelize);
const CartItem = require('./cartItem')(sequelize);
const Wishlist = require('./wishlist')(sequelize);
const Review = require('./review')(sequelize);
const Payment = require('./payment')(sequelize);

// Define associations
User.hasMany(Order);
Order.belongsTo(User);

User.hasOne(Cart);
Cart.belongsTo(User);

User.hasOne(Wishlist);
Wishlist.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

Product.hasMany(Review);
Review.belongsTo(Product);

Product.belongsToMany(Category, { through: 'ProductCategories' });
Category.belongsToMany(Product, { through: 'ProductCategories' });

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

OrderItem.belongsTo(Product);
Product.hasMany(OrderItem);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

CartItem.belongsTo(Product);
Product.hasMany(CartItem);

Wishlist.belongsToMany(Product, { through: 'WishlistItems' });
Product.belongsToMany(Wishlist, { through: 'WishlistItems' });

Order.hasOne(Payment);
Payment.belongsTo(Order);

module.exports = {
    sequelize,
    User,
    Product,
    Category,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Wishlist,
    Review,
    Payment
};
