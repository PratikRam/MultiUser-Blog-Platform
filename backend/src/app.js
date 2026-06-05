const express = require("express");
const app = express();
const authRoutes = require("./routers/auth.Routes");
const postRoutes = require("./routers/post.Routes");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const passport = require("./config/passport");

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);


module.exports = app;