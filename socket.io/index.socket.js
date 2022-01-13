const cookie = require("cookie");
const { verifyToken } = require("../utils/jwt.util");
const Zoom = require("../utils/mockdb.util");

function socketConfig(io) {
    io.on('connect', async socket => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            const payload = await verifyToken(cookies.token)
            socket.user = payload
        } catch (err){
            console.log('disconnect')
            socket.disconnect()
        }


        socket.on('add_peer_id', (id) => {
            Zoom.addZoom(payload)
        })

        socket.on('add_user_to_zoom', zoom_id => {
            socket.zoom_id = zoom_id
            socket.join(zoom_id)
            Zoom.addUserToZoom({...socket})
            const data = Object.fromEntries(Zoom.getData().get(socket.zoom_id))
            socket.to(zoom_id).emit('list_users_in_room', data)
            socket.emit('list_users_in_room', data)
        })

        socket.on('disconnect', zoom_id => {
            Zoom.outRoom({...socket})
            console.log(socket.user.email + " out phong")
            if (!Zoom.getData().get(socket.zoom_id))
                return
            const data = Object.fromEntries(Zoom.getData().get(socket.zoom_id))
            socket.to(socket.zoom_id).emit('list_users_in_room', data)
            socket.emit('list_users_in_room', data)
        })
    })
}

module.exports = socketConfig