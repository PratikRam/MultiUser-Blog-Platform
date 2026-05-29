const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log(decoded);

        req.user = await User.findById(decoded.id).select(
            "-password"
        );

        next();
    } catch (error) {
        console.log("this is error", error);
        res.status(401).json({
            message: "Token failed",
        });
    }
};

module.exports = protect;