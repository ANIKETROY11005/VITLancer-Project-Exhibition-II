const mongoose = require("mongoose")


const UserGigSchema = new mongoose.Schema(
    {

        userName: { type: String, required: true },
        userID: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        UPI_id: { type: String, required: true },
        img: { type: String, required: true },


    },
    { timestamps: true }
);

module.exports = mongoose.model("UserGig", UserGigSchema);