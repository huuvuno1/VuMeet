const cookie = require("cookie");
const { verifyToken, generateToken } = require("../utils/jwt.util");
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
            console.log('add peer id')
            Zoom.addZoom(payload)
        })

        socket.on('request_to_join', (zoom_id) => {
            console.log('user request', socket.user.email)
            socket.zoom_id = zoom_id
            const room = Zoom.getZoom(zoom_id)
            if (!room) return

            if (room.admin.email == socket.user.email) {
                socket.admin = room.admin
                socket.emit('request_to_join', 'OK')
                socket.auth = true
                return
            }

            room.admin.socket_ids.forEach(id => {
                io.to(id).emit('listen_request_to_join', JSON.stringify(socket.user), socket.id)
            })
        })

        socket.on('reply_request_to_join', async (requestID, answer) => {
            if (answer == 'OK') {
                try {
                    const token = await generateToken({
                        name: socket.zoom_id,
                        email: requestID
                    }, '7d')
                    io.to(requestID).emit('request_to_join', token)
                }
                catch (err) {
                    console.log(err)
                }
            }
            else {
                io.to(requestID).emit('request_to_join', 'DENIED')
            }
        })

        socket.on('add_user_to_zoom', async (peer_id, token) => {
            if (!socket.auth) {
                try {
                    const payload = await verifyToken(token)
                    console.log(payload)
                    if (payload.name == socket.zoom_id && payload.email == socket.id) {
                        socket.auth = true
                        socket.emit('request_to_join', 'OK')
                    }
                    else
                        throw new Error('Invalid token')
                } catch {
                    socket.emit('request_to_join', 'DENIED')
                    return
                }
            }

            socket.peer_id = peer_id
            socket.join(socket.zoom_id)
            Zoom.addUserToZoom({...socket})

            const zoom = Zoom.getZoom(socket.zoom_id)
            
            const usersInZoom =  zoom.users
            if (!zoom) return

            if (zoom.admin.email == socket.user.email)
                zoom.admin.socket_ids.push(socket.id)


            const data = Object.fromEntries(usersInZoom)
            socket.to(socket.zoom_id).emit('list_users_in_room', data)
            socket.emit('list_users_in_room', data)
        })

        socket.on('camera_is_off', receiver => {
            Zoom.getZoom(socket.zoom_id).users.forEach((value, socket_id) => {
                if (value.peer == receiver)
                    io.to(socket_id).emit('camera_is_off', socket.peer_id)
            });
        })

        socket.on('stop_share_screen', () => {
            socket.to(socket.zoom_id).emit('stop_share_screen', socket.peer_id)
        })

        socket.on('send_chat', text => {
            socket.to(socket.zoom_id).emit('receive_chat', socket.user.name, text)
        })


        socket.on('toggle_camera', status => {
            socket.to(socket.zoom_id).emit('user_toggle_camera', socket.peer_id, status)
        })

        socket.on('toggle_micro', status => {
            socket.to(socket.zoom_id).emit('user_toggle_micro', socket.peer_id, status)
        })

        socket.on('disconnect', zoom_id => {
            Zoom.outRoom({...socket})
            const usersInZoom = Zoom.getData().get(socket.zoom_id)?.users
            if (!usersInZoom)
                return
            if (usersInZoom.size == 0) {
                usersInZoom.delete(socket.zoom_id)
                console.log('delete zoom')
                return
            }
            
            socket.to(socket.zoom_id).emit('stop_share_screen', socket.peer_id)
            const data = Object.fromEntries(Zoom.getZoom(socket.zoom_id).users)
            socket.to(socket.zoom_id).emit('list_users_in_room', data, socket.peer_id)
        })
    })
}

module.exports = socketConfig