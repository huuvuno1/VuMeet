const DB = new Map()

// Map {
//     zoomid: Map{
//         "socketid_sdkafjsdkaf": {
//             info: {
//                 name: "Nguyen Van A",
//                 avatar: "https://photo.com/idid",
//                 email: "mail@gmail.com"
//             },
//             peer: ["peerid1", "peerid2"]
//         }
//     },
//     zoomid2: Map{
//         "socketid_sdkafjsdkaf": {
//             info: {
//                 name: "Nguyen Van A",
//                 avatar: "https://photo.com/idid",
//                 email: "mail@gmail.com"
//             },
//             peer: ["peerid1", "peerid2"]
//         }
//     }
// }

/**
 * // users.set(user.email, {
    //     info: user,
    //     peer: new Set()
    // })
 */

const Zoom = {}

Zoom.addZoom = (user, zoom_id) => {
    const users = new Map()
    DB.set(zoom_id, users)
}

Zoom.addUserToZoom = ({id, user, zoom_id}) => {
    const users = DB.get(zoom_id)
    if (!users) return
    users.set(id, {
        info: user,
        peer: new Set()
    })
}

Zoom.outRoom = ({id, zoom_id}) => {
    const users = DB.get(zoom_id)
    if (!users) return
    users.delete(id)
}

Zoom.getData = () => DB

module.exports = Zoom