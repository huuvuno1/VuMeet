const DB = new Map()

// Map {
//     zoomid: Map{
//         "mail@gmail.com": {
//             info: {
//                 name: "Nguyen Van A",
//                 avatar: "https://photo.com/idid",
//                 email: "mail@gmail.com"
//             },
//             peer: ["peerid1", "peerid2"]
//         }
//     },
//     zoomid2: Map{
//         "mail@gmail.com": {
//             info: {
//                 name: "Nguyen Van A",
//                 avatar: "https://photo.com/idid",
//                 email: "mail@gmail.com"
//             },
//             peer: ["peerid1", "peerid2"]
//         }
//     }
// }

const Zoom = {}

Zoom.addZoom = (user, zoom_id) => {
    const users = new Map()
    // users.set(user.email, {
    //     info: user,
    //     peer: new Set()
    // })
    DB.set(zoom_id, users)
}

Zoom.getData = () => DB

module.exports = Zoom