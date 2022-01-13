const ApiController = require("../controllers/api.controller")
const HomeController = require("../controllers/home.controller")

function routerConfig(app) {
    app.get('/', HomeController.getHomePage)
    app.get('/logout', HomeController.logout)

    // api
    app.post('/api/login', ApiController.login)
}

module.exports = routerConfig