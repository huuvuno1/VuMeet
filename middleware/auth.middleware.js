const { verifyToken } = require("../utils/jwt.util")

const AuthMiddleware = {}

AuthMiddleware.auth = async (req, res, next) => {
    const token = req.cookies.token || ''
    try {
        const payload = await verifyToken(token)
        req.payload = payload
        next()
    } catch (err){
        res.render('index', {email: ''})
    }
}

module.exports = AuthMiddleware