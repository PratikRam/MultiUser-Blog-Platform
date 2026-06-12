const express = require("express");
const app = express();
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routers/auth.Routes");
const postRoutes = require("./routers/post.Routes");
const cookieParser = require('cookie-parser')
const cors = require('cors')


app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(cors({
    origin: function (origin, callback) {
        const frontendUrl = process.env.FRONTEND_URL;
        if (
            !origin ||
            origin.includes("localhost") ||
            origin.endsWith(".vercel.app") ||
            (frontendUrl && origin === frontendUrl)
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);


module.exports = app;