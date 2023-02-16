const User = require("../models/User");


const UserProfile = require("../models/UserProfile")
const UserGig = require("../models/UserGig")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const e = require("express");

const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC)
            .toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });
        res.status(200).json(updatedUser);

    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted...")
    } catch (err) {
        res.status(500).json(err)
    }
});

//GET USER

router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const { password, ...others } = user._doc;

        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err)
    }
});

//GET ALL USER

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {

        const users = query ? await User.find().sort({ _id: -1 }).limit(1) : await User.find();


        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err)
    }
});


router.route("/addWork")
    .post(async (req, res) => {
        // console.log(req.body.user_id)
        const user = await User.findOne({ _id: req.body.user_id });
        // console.log(user)
        res.render("work", { user_id: user._id, username: user.username, message: "" });

    })

router.route("/addingWork")
    .post(async (req, res) => {

        try {
            console.log(req.body.user_id)
            console.log(req.body.userName)
            const newWork = new UserGig({
                userID: req.body.user_id,
                userName: req.body.userName,
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                UPI_id: req.body.UPI_id,
                category: req.body.category,
                img: req.body.img,
            });
            // console.log(newWork)
            const savedWork = await newWork.save();
            // console.log(savedWork);
            res.render("work", { user_id: savedWork.userID, username: savedWork.userName, message: "Work Added Successfully" })

            //             // const user = await User.findOne({ _id: req.body.id });

            //             // console.log(userProfile);
            //             // const savedUserProfile = await userProfile.save();

            //             // // const { password, ...others } = userprofile._doc;

            //             // res.render("existingProfilePage", {
            //             //     fullName: savedUserProfile.fullName, id: savedUserProfile._id, email: user.email, username: user.username,
            //             //     gender: savedUserProfile.gender, city: savedUserProfile.city, phoneNumber: savedUserProfile.phoneNumber, year: datePattern, bio: savedUserProfile.bio
            //             // });



        } catch (err) {
            res.status(500).json(err);
        }



    });

//User Profile




module.exports = router;