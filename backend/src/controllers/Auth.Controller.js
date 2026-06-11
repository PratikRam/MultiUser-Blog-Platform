const User = require('../models/user.model.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const generateToken = require('../utils/generateToken.js')
const cookieParser = require('cookie-parser')
const sendEmail = require('../utils/sendEmail.js')


const registerController = async (req, res) => {
    const { name, email, password, role } = req.body
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    try {
        let userExistes = await User.findOne({ email })
        if (userExistes) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: role ? role.toLowerCase() : 'visitor'
        })
        const token = generateToken(user._id, user.role)

        console.log("user one");
        console.log(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,       // false on localhost
            sameSite: "none"
        })
        res.status(201).json({
            message: "User registered successfully",
            user,
            token
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' })
    }
}

const loginController = async (req, res) => {

    try {
        const { email, password } = req.body
        const userOne = await User.findOne({
            email
        })
        console.log(userOne);

        if (!userOne) {
            res.status(401).json({
                message: "unauthorized..! please check your email"
            })
            return
        }

        if (!userOne.password) {
            res.status(400).json({
                message: "This account was registered using Google OAuth. Please log in using Google."
            })
            return
        }

        const userPassword = await bcrypt.compare(password, userOne.password)

        if (!userPassword) {
            res.status(401).json({
                message: "Password invalide"
            })
            return
        }

        // const token = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET)
        // res.cookie('token', token)
        const token = generateToken(userOne._id, userOne.role)

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: false,       // ❗ false in localhost
        //     sameSite: "Lax"      // or "Strict"
        // })

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,       // false on localhost
            sameSite: "none"
        })

        res.status(200).json({
            user: userOne,
            message: "logged in succesfully",
            token
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const logoutController = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Logout failed",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, role, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If email is changing, verify if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already taken" });
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        if (role) {
            const normalizedRole = role.toLowerCase(); 
            if (normalizedRole === 'visitor' || normalizedRole === 'creator') {
                user.role = normalizedRole;
            } else {
                return res.status(400).json({ message: "Invalid role value" });
            }
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // Regenerate JWT token since details like role might have changed
        const token = generateToken(user._id, user.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // localhost
            sameSite: "none"
        });

        // Exclude password from the returned user
        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
            token
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error during profile update" });
    }
};

const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Account not found with this email" });
        }

        // Generate a 6-digit OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and 10 minutes expiry to user
        user.otpCode = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP via Email
        const emailSent = await sendEmail({
            email: user.email,
            subject: "Your OTP for Password Reset",
            text: `Hello ${user.name},\n\nYou requested a password reset. Your 6-digit verification OTP code is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
        });

        res.status(200).json({
            success: true,
            message: emailSent 
                ? "OTP sent successfully to your email address!" 
                : "OTP generated successfully (printed to server log).",
            otp: emailSent ? undefined : otp // Expose OTP only if email dispatch was skipped/failed
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error during forgot password" });
    }
};

const verifyOtpController = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({
            success: true,
            message: "OTP verified successfully!"
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ message: "Server error during OTP verification" });
    }
};

const resetPasswordController = async (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, and Password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP session" });
        }

        // Hash new password and save
        user.password = await bcrypt.hash(password, 10);
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully! You can now log in."
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error during password reset" });
    }
};

module.exports = { 
    registerController, 
    loginController, 
    logoutController, 
    updateProfile,
    forgotPasswordController,
    verifyOtpController,
    resetPasswordController
};
