const Cart = require("../models/cart.model");

// Save or update user cart
const saveCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cart } = req.body;

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { userId, cart },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// Get user cart
const getCart = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const cartData = await Cart.findOne({ userId });
    res.status(200).json({ cart: cartData?.cart || [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCart,
  getCart,
};
