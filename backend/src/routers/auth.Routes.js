const express = require('express')
const passport = require('passport')
const {
    registerController,
    loginController,
    logoutController,
    updateProfile,
    forgotPasswordController,
    verifyOtpController,
    resetPasswordController
} = require('../controllers/Auth.Controller')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const AuthMeController = require('../controllers/AuthMe.Controller')
const generateToken = require('../utils/generateToken')


router.post('/register', registerController)
router.post('/login', loginController)
router.post('/logout', logoutController)
router.post('/forgot-password', forgotPasswordController)
router.post('/verify-otp', verifyOtpController)
router.post('/reset-password', resetPasswordController)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
    '/google/callback',
    (req, res, next) => {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        passport.authenticate('google', { 
            session: false, 
            failureRedirect: `${frontendUrl}/login?error=OAuthFailed` 
        })(req, res, next);
    },
    (req, res) => {
        try {
            const token = generateToken(req.user._id, req.user.role);

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            });

            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            res.redirect(`${frontendUrl}/auth-success?token=${token}`);
        } catch (error) {
            console.error("Google Auth redirect error:", error);
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
    }
);

router.get('/authme', protect, AuthMeController)
router.put('/profile', protect, updateProfile)



module.exports = router