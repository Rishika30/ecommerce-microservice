const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Product = mongoose.model("Product", productSchema);
