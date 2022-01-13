const cookie = require("cookie");
const { verifyToken } = require("../utils/jwt.util");

function socketConfig(io) {
    io.on('connect', async socket => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            const payload = await verifyToken(cookies.token)
            console.log(payload)
        } catch (err){
            console.log('dis')
            socket.disconnect()
        }
    })
}

module.exports = socketConfig