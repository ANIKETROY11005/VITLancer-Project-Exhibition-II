const mongoose = require("mongoose")


const UserProfileSchema = new mongoose.Schema(
    {

        fullName: { type: String, required: true },
        gender: { type: String, required: true },
        city: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        profile_img: { type: String, required: true },
        bio: { type: String, required: true }


    },
    { timestamps: true }
);

module.exports = mongoose.model("UserProfile", UserProfileSchema);