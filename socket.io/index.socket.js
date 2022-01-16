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

        socket.on('add_user_to_zoom', (zoom_id, peer_id) => {
            console.log('peerid', peer_id)
            socket.zoom_id = zoom_id
            socket.peer_id = peer_id
            socket.join(zoom_id)
            Zoom.addUserToZoom({...socket})
            
            const usersInZoom =  Zoom.getData().get(socket.zoom_id)
            console.log('user in zoom', usersInZoom)
            if (!usersInZoom) return
            const data = Object.fromEntries(usersInZoom)
            socket.to(zoom_id).emit('list_users_in_room', data)
            socket.emit('list_users_in_room', data)
        })

        socket.on('start_share_screen', () => {
            // console.log('payload', socket.payload)
            socket.to(socket.zoom_id).emit('user_share_screen', socket.peer_id, socket.user.name)
            socket.emit('start_share_screen_reply')
        })

        socket.on('stop_share_screen', () => {
            socket.to(socket.zoom_id).emit('stop_share_screen', socket.peer_id)
        })

        socket.on('send_chat', text => {
            socket.to(socket.zoom_id).emit('receive_chat', socket.user.name, text)
        })

        socket.on('disconnect', zoom_id => {
            Zoom.outRoom({...socket})
            console.log(socket.user.email + " out phong")
            const usersInZoom = Zoom.getData().get(socket.zoom_id)
            if (!usersInZoom)
                return
            if (usersInZoom.size == 0) {
                usersInZoom.delete(socket.zoom_id)
                console.log('delete zoom')
                return
            }

            const data = Object.fromEntries(Zoom.getData().get(socket.zoom_id))
            socket.to(socket.zoom_id).emit('list_users_in_room', data, socket.peer_id)
        })
    })
}

module.exports = socketConfig