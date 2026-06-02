const express = require('express')
const { registerController, loginController, logoutController } = require('../controllers/Auth.Controller')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const AuthMeController = require('../controllers/AuthMe.Controller')


router.post('/register', registerController)
router.post('/login', loginController)
router.post('/logout', logoutController)

router.get('/authme', protect, AuthMeController)

module.exports = router