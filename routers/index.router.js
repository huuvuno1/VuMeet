const ApiController = require("../controllers/api.controller")
const HomeController = require("../controllers/home.controller")
const ZoomController = require("../controllers/zoom.controller")
const AuthMiddleware = require("../middleware/auth.middleware")

function routerConfig(app) {
    app.get('/', AuthMiddleware.auth,  HomeController.getHomePage)
    app.get('/logout', HomeController.logout)
    app.get('/404-not-found', ZoomController.notFound)
    app.get('/:id', AuthMiddleware.auth, ZoomController.getPage)

    
    app.post('/api/login', ApiController.login)
    app.post('/api/zooms', AuthMiddleware.auth, ApiController.createZoom)
}

module.exports = routerConfig