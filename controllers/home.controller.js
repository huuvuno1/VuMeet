const HomeController = {}

HomeController.getHomePage = (req, res) => {
    res.render('index')
}

module.exports = HomeController