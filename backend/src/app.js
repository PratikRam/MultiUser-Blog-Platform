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
    origin: function (origin, callback) {
        const clientUrl = process.env.CLIENT_URL;
        if (
            !origin ||
            origin.includes("localhost") ||
            origin.endsWith(".vercel.app") ||
            (clientUrl && (origin === clientUrl || origin === clientUrl.replace(/\/$/, '')))
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);


module.exports = app;