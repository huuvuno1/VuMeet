const { verifyToken } = require("../utils/jwt.util")
const Zoom = require('../utils/mockdb.util')

const ZoomController = {}

ZoomController.getPage = async (req, res) => {
    const zoom_id = req.params.id 
    if (!Zoom.getData().get(zoom_id))
        res.redirect('/404-not-found')
    else
        res.render('zoom', {...req.payload})
}

ZoomController.notFound = async (req, res) => {
    res.render('404-not-found', {email: ''})
}


module.exports = ZoomController