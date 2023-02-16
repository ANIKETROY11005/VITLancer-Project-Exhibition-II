const router = require("express").Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile")
const UserGig = require("../models/UserGig")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const e = require("express");

//HOME




//REGISTER

router.route("/register")
    .get(async (req, res) => {
        res.render("Login-Registration", { message: "", type: "active" })
    })
    .post(async (req, res) => {



        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(
                req.body.password,
                process.env.PASS_SEC)
                .toString(),

        });

        console.log(newUser);


        try {
            const savedUser = await newUser.save();


            res.render("newProfilePage", { username: savedUser.username, email: savedUser.email, id: savedUser._id })

        }
        catch (err) {
            const error = err;
            if (error.keyPattern.username === 1) {
                res.render("Login-Registration", { message: "Username already present! ", type: "active" })
            } else if (error.keyPattern.email === 1) {
                res.render("Login-Registration", { message: "Email already registered!", type: "active" })

            }
        }

    });

// router.get("/register", async (req, res) => {
//     res.render("Register", { message: "" })
// })
// router.post("/register", async (req, res) => {



//     const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: CryptoJS.AES.encrypt(
//             req.body.password,
//             process.env.PASS_SEC)
//             .toString(),

//     });


//     try {
//         const savedUser = await newUser.save();


//         res.render("newProfilePage", { username: savedUser.username, id: savedUser._id })

//     }
//     catch (err) {
//         const error = err;
//         if (error.keyPattern.username === 1) {
//             res.render("Register", { message: "Username already present!" })
//         } else if (error.keyPattern.email === 1) {
//             res.render("Register", { message: "Email already registered!" })

//         }
//     }

// });



//LOGIN
router.route("/login")
    .get(async (req, res) => {
        res.render("Login-Registration", { message: "", type: "" })
    })
    .post(async (req, res) => {
        try {


            const user = await User.findOne({ username: req.body.username });
            console.log(user)


            if (!user) {

                res.render("Login-Registration", { message: "wrong username!", type: "" });
                return;
            }

            const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
            const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
            console.log(OriginalPassword)
            if (OriginalPassword !== req.body.password) {
                res.render("Login-Registration", { message: "wrong password!", type: "" });
                return;
            }

            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin,
            }, process.env.JWT_SEC,
                { expiresIn: "3d" }
            );

            // const { password, ...others } = user._doc;


            const userProfile = await UserProfile.findOne({ _id: user.id });

            if (!userProfile) {
                console.log("No user profile")
                res.render("newProfilePage", { username: user.username, id: user._id, email: user.email });

            }
            else {
                const workData = await UserGig.find({ userID: user.id })
                console.log(workData)
                res.render("existingProfilePage", {
                    fullName: userProfile.fullName, id: userProfile._id, email: user.email, username: user.username,
                    gender: userProfile.gender, city: userProfile.city, phoneNumber: userProfile.phoneNumber,
                    img: userProfile.profile_img, bio: userProfile.bio, data: workData
                })
            }

            // else {
            //     var date = userProfile.year
            //     var datePattern = String(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (String(date.getDate()).padStart(2, '0')));
            //     console.log(datePattern)
            //     console.log(userProfile);
            //     res.render("existingProfilePage", {
            //         username: user.username, id: userProfile._id, firstName: userProfile.firstName, lastName: userProfile.lastName, gender: userProfile.gender,
            //         city: userProfile.city, phoneNumber: userProfile.phoneNumber, year: datePattern, bio: userProfile.bio
            //     });
            //     // res.render("existingProfilePage", { username: userprofile.username, id: userprofile._id, firstName: userProfile.firstName, lastName: userProfile.lastName, gender: userProfile.gender, city: userProfile.city, phoneNumber: userProfile.phoneNumber, year: userProfile.year, bio: userProfile.bio })
            // }

            // res.status(200).json({ ...others, accessToken });

        } catch (err) {
            res.status(500).json(err);
        }
    });



router.get("/Home", async (req, res) => {
    res.render("Home")
})

router.post("/services", async (req, res) => {
    // const profileID = req.body.userid;
    const user = await User.findOne({ _id: profileID });
    res.render("Services", { user_id: user._id });
})


router.get("/:id", async (req, res) => {
    const profileID = req.params.id
    try {
        const userProfile = await UserProfile.findOne({ _id: profileID });
        const user = await User.findOne({ _id: profileID });
        // res.send(updatedUserProfile);

        if (!userProfile) {
            res.render("newProfilePage", { username: user.username, id: user._id });

        }
        else {
            res.render("ProfilePage", {
                username: user.username, id: userProfile._id, firstName: userProfile.firstName, lastName: userProfile.lastName, gender: userProfile.gender,
                city: userProfile.city, phoneNumber: userProfile.phoneNumber, bio: userProfile.bio
            });
        }
    }

    catch (err) {
        res.status(500).json(err);
    }
})



router.get("/profile", async (req, res) => {
    res.render("Login-Registration", { message: "", type: "" })
})
router.post("/profile", async (req, res) => {
    console.log(req.body.user_id);
    console.log(req.body.user_work_id);
    const modType = req.body.modType;

    // console.log(req.body.id);


    try {

        if (modType == "delete") {
            const userprofile = await UserProfile.findById({ _id: req.body.user_id });
            const user = await User.findOne({ _id: req.body.user_id });


            const deletedData = await UserGig.findByIdAndDelete({ _id: req.body.user_work_id });
            console.log(deletedData);

            const workData = await UserGig.find({ userID: req.body.user_id })

            res.render("existingProfilePage", {
                fullName: userprofile.fullName, id: userprofile._id, email: user.email, username: user.username,
                gender: userprofile.gender, city: userprofile.city, phoneNumber: userprofile.phoneNumber,
                img: userprofile.profile_img, bio: userprofile.bio, data: workData
            });
            return;


        }

        if (modType == "edit") {
            const userprofile = await UserProfile.findById({ _id: req.body.user_id });
            const user = await User.findOne({ _id: req.body.user_id });

            const singleWorkData = await UserGig.findById({ _id: req.body.user_work_id })

            res.render("editPage", {
                user_id: user._id, work_id: singleWorkData._id,
                userName: singleWorkData.userName, title: singleWorkData.title, category: singleWorkData.category, price: singleWorkData.price,
                upiID: singleWorkData.UPI_id, img: singleWorkData.img, description: singleWorkData.description,



                id: userprofile._id,
            });
            return;


        }
        if (modType == "edited") {
            // const userprofile = await UserProfile.findById({ _id: req.body.user_id });
            // const user = await User.findOne({ _id: req.body.user_id });

            // const singleWorkData = await UserGig.findById({ _id: req.body.user_work_id })

            // res.render("editPage", {
            //     user_id: user._id, work_id: singleWorkData._id,
            //     userName: singleWorkData.userName, title: singleWorkData.title, category: singleWorkData.category, price: singleWorkData.price,
            //     upiID: singleWorkData.UPI_id, img: singleWorkData.img, description: singleWorkData.description,



            //     id: userprofile._id,
            // });
            return;


        }


        const userprofile = await UserProfile.findById({ _id: req.body.id })
        const user = await User.findOne({ _id: req.body.id });
        const workData = await UserGig.find({ userID: req.body.id })

        // console.log(workData)
        if (!userprofile) {
            const userProfile = new UserProfile({
                _id: req.body.id,
                fullName: req.body.fullName,
                gender: req.body.gender,
                city: req.body.city,
                phoneNumber: req.body.phoneNumber,
                profile_img: req.body.img,

                bio: req.body.bio


            });



            // console.log(userProfile);
            const savedUserProfile = await userProfile.save();

            // const { password, ...others } = userprofile._doc;

            res.render("existingProfilePage", {
                fullName: savedUserProfile.fullName, id: savedUserProfile._id, email: user.email, username: user.username,
                gender: savedUserProfile.gender, city: savedUserProfile.city, phoneNumber: savedUserProfile.phoneNumber,
                img: savedUserProfile.profile_img, bio: savedUserProfile.bio, data: workData
            });

        }
        else if (req.body.type == "back") {
            const existingProfile = await UserProfile.findById({ _id: req.body.id })
            res.render("existingProfilePage", {

                fullName: existingProfile.fullName, id: existingProfile._id, email: user.email, username: user.username,
                gender: existingProfile.gender, city: existingProfile.city, phoneNumber: existingProfile.phoneNumber,
                img: existingProfile.profile_img, bio: existingProfile.bio, data: workData,
            });
        }

        else {
            const updatedUserProfile = await UserProfile.findByIdAndUpdate(req.body.id, {
                $set: req.body
            }, { new: true });
            // res.send(updatedUserProfile);
            const user = await User.findOne({ _id: req.body.id });

            res.render("existingProfilePage", {
                fullName: updatedUserProfile.fullName, id: updatedUserProfile._id, email: user.email, username: user.username,
                gender: updatedUserProfile.gender, city: updatedUserProfile.city, phoneNumber: updatedUserProfile.phoneNumber,
                img: updatedUserProfile.profile_img, bio: updatedUserProfile.bio, data: workData,
            });
        }


    } catch (err) {
        res.status(500).json(err);
    }




});


//add work




module.exports = router;
// .post(async (req, res) => {



//     const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: CryptoJS.AES.encrypt(
//             req.body.password,
//             process.env.PASS_SEC)
//             .toString(),

//     });

//     console.log(newUser);


//     try {
//         const savedUser = await newUser.save();


//         res.render("newProfilePage", { email: savedUser.email, id: savedUser._id })

//     }
//     catch (err) {
//         const error = err;
//         if (error.keyPattern.username === 1) {
//             res.render("Login-Registration", { message: "Username already present! ", type: "active" })
//         } else if (error.keyPattern.email === 1) {
//             res.render("Login-Registration", { message: "Email already registered!", type: "active" })

//         }
//     }

// });



// router.route("/b")
//     .get(async (req, res) => {



//     })
//
//     });


