const express = require('express')
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
const passport = require('../config/passport')
const generateToken = require('../utils/generateToken')


router.post('/register', registerController)
router.post('/login', loginController)
router.post('/logout', logoutController)
router.post('/forgot-password', forgotPasswordController)
router.post('/verify-otp', verifyOtpController)
router.post('/reset-password', resetPasswordController)

router.get('/authme', protect, AuthMeController)
router.put('/profile', protect, updateProfile)

// Google OAuth login route - redirects to Google's consent screen
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google OAuth callback route - handles response from Google
router.get('/google/callback', (req, res, next) => {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: `${frontendUrl}/login?error=GoogleAuthFailed` 
    })(req, res, next);
}, (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id, req.user.role);

    const isProduction = process.env.NODE_ENV === "production";
    // Set the cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax"
    });

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    // Redirect to frontend auth-success page with the token
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
})

// Google OAuth failure callback route
router.get('/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: "Google Authentication failed"
    });
})

module.exports = router