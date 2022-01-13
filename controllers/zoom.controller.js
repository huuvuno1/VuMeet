const { verifyToken } = require("../utils/jwt.util")

const ZoomController = {}

ZoomController.getPage = async (req, res) => {
    res.render('zoom')
}


module.exports = ZoomController