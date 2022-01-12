const fetch = require('node-fetch')

const ApiController = {}

/**
 * 
 * @param {*} Post Method
 */
ApiController.login = async (req, res) => {
    const token = req.body.token || ''
    fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
        .then(response => response.json())
        .then(data => {
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

module.exports = ApiController