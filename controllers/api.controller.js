const fetch = require('node-fetch')
const { generateToken } = require('../utils/jwt.util')
const { randomUUID } = require('crypto');
const Zoom = require('../utils/mockdb.util');

const ApiController = {}

/**
 * 
 * @param {*} Post Method => verify token gg
 */
ApiController.login = async (req, res) => {
    const token = req.body.token || ''
    fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
        .then(response => response.json())
        .then(async data => {
            const jwtToken = await generateToken(data, '7d')
            res.cookie('token', jwtToken, { maxAge: 604800*1000, httpOnly: true, sameSite: 'strict', secure: true });
            res.status(200).json(data)
        })
        .catch(err => {
            console.log(err)
            res.status(501).json({
                status: 501,
                message: "Fail"
            })
        })
}


ApiController.createZoom = (req, res) => {
    const uuid = randomUUID()

    

    Zoom.addZoom(req.payload, uuid)
    console.log(Zoom.getData())

    res.json({
        status: 200,
        zoom_id: uuid
    })
}

module.exports = ApiController