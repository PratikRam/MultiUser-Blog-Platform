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
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=GoogleAuthFailed' }), (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id, req.user.role);

    // Set the cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // localhost
        sameSite: "none"
    });

    // Redirect to frontend auth-success page with the token
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
})

// Google OAuth failure callback route
router.get('/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: "Google Authentication failed"
    });
})

module.exports = router