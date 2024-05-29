const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function redirectToProfileIfLoggedIn(req, res, next) {
  if (req.cookies.token) {
    try {
      jwt.verify(req.cookies.token, "mgmgmg");
      return res.redirect("/profile");
    } catch (error) {
      console.error(error);
      res.cookie("token", "");
    }
  }
  next();
}

app.get("/", redirectToProfileIfLoggedIn, (req, res) => {
  res.render("index");
});

app.get("/login", redirectToProfileIfLoggedIn, (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    console.log(user);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("profile", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req, res) => {
  let { email, password, username, mobile } = req.body;

  let user = await userModel.findOne({ email });
  if (user)
    return res
      .status(500)
      .send(
        `User already registered <button onclick="window.history.back();">Back</button>`
      );
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        mobile,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "mgmgmg");
      res.cookie("token", token);
      res.redirect("/profile");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) {
    return res
      .status(500)
      .send(
        `Something went wrong <button onclick="window.history.back();">Back</button>`
      );
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "mgmgmg");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect("/login");
  }
  try {
    let data = jwt.verify(req.cookies.token, "mgmgmg");
    req.user = data;
    next();
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.redirect("/login");
  }
}

app.listen(1100, () => {
  console.log("server is running on port 1100");
});
