const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./product");
const isAuthenticated = require("../isAuthenticated");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT_ONE || 8080;

app.use(express.json());
var channel, connection, order;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true},
 ()=> {
       console.log("Product-service db connected");
});

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}

connect();

//Create product
//Buy a product
app.post("/product/create", isAuthenticated ,async(req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price
    });
    newProduct.save();
    return res.json(newProduct);
})

//User sends product ids for buying
//Create an order with those products and total of all those product's prices
app.post("/product/buy", isAuthenticated, async(req, res)=> {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids} });

    channel.sendToQueue("ORDER", Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email
    })));
        channel.consume("PRODUCT", data =>{
        console.log("Consuming Product queue");
        order = JSON.parse(data.content);
        channel.ack(data);
    });
    return res.json(order);
})
app.listen(PORT, ()=> {
    console.log(`Product service listening at port ${PORT}`);
});
