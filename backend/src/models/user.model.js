const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ["visitor", "creator"],
        default: "visitor"
    }
});

module.exports = mongoose.model("User", userSchema);