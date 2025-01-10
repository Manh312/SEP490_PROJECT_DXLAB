const mongoose = require("mongoose");

const db = {};


db.connectDB = () => mongoose
    .connect(process.env.MONGO_URL, { dbName: process.env.DB_NAME })
    .then(() => console.log("Connect to MongoDB"))
    .catch((err) => {console.log("Connect fail: ", err)});

module.exports = { db };