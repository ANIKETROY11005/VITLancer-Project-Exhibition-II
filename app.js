const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");

const path = require('path');
dotenv.config();

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DBConnection success full!"))
    .catch((err) => {
        console.log(err);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);


app.set('views', './pages')
app.set('view engine', 'ejs')



app.listen(process.env.PORT || 5000, () => {
    console.log("server is running")
});

