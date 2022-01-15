const { verifyToken } = require("../utils/jwt.util")

const HomeController = {}

HomeController.getHomePage = async (req, res) => {
    res.render('index', req.payload)
}

HomeController.logout = async (req, res) => {
    res.cookie('token', '');
    res.redirect('/')
}

module.exports = HomeController