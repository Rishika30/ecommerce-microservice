const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            productId: String
        }
    ],
    user: String,
    totalPrice: Number,
    createdAt:{
        type: Date,
        default: Date.now()
    }
});

module.exports = Order = mongoose.model("Order", orderSchema);
