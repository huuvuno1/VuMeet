const { verifyToken } = require("../utils/jwt.util")

const HomeController = {}

HomeController.getHomePage = async (req, res) => {
    const token = req.cookies.token || ''
    try {
        const payload = await verifyToken(token)
        res.render('index', payload)
    }
    catch {
        res.render('index', {email: ''})
    }
}

HomeController.logout = async (req, res) => {
    res.cookie('token', '');
    res.redirect('/')
}

module.exports = HomeController