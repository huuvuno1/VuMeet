const { verifyToken } = require("../utils/jwt.util")
const Zoom = require('../utils/mockdb.util')

const ZoomController = {}

ZoomController.getPage = async (req, res) => {
    res.render('zoom', {...req.payload, })
}


module.exports = ZoomController