
const wrapUsers = $('#wrap_users')



let UsersInRoom

let testStream

let call_all_zoom = true

socket.on('list_users_in_room', (users_str, peer_id) => {
    const data = new Map(Object.entries(users_str))
    if (call_all_zoom) {
        data.forEach((v, k) => {
            if (!PeerStream.outStream.get(v.peer) && !PeerStream.inStream.get(v.peer) && v.peer != myPeer.id) {
                const call = myPeer.call(v.peer, myStream)
                call.on('stream', stream => {
                    testStream = stream
                    console.log('peer', stream)
                    addStreamToView(v.peer, stream)
                    stream.getVideoTracks()[0].addEventListener('ended', () => console.log('change cam envent'))
                })
                PeerStream.outStream.set(v.peer, call)
            }
        })
        call_all_zoom = false
    }
    
    
    console.log('sdlkfj')
    

    // neu co peer id thi user nay moi thoat <-> nguoc lai undefined
    if (peer_id) {
        console.log(peer_id)
        wrapUsers.removeChild($('#__' + peer_id))
        updateGridView(data.size)

        // show toast
        UsersInRoom.forEach((v, k) => {
            if (v.peer == peer_id) {
                const toast = createToastUserOut(v.info.name)
                $('body').appendChild(toast)
                setTimeout(() => {
                    $('body').removeChild(toast)
                }, 3000)
            }
        })
        return
    }

    UsersInRoom = data

    if ($('#temp_user_data')) {
        wrapUsers.innerHTML = ''
    }
    updateGridView(UsersInRoom.size)
    UsersInRoom.forEach((v, k) => {
        let check = $('#__' + v.peer)
        if (check) return
        const userDom = createUserCard({...v.info}, k, v.peer)
        wrapUsers.appendChild(userDom)
    })
    
// lung tung
    if (camMicStatus.cam) {
        const myVideo = $('#___' + myPeer.id)
        let img = myVideo.parentElement.children[1]
        myVideo.classList.remove('none')
        myVideo.srcObject = myStream
        img.classList.add('none')
    }


    // UsersInRoom.forEach((v, k) => {
    //     if (k == socket.id || PeerStream.outStream.get(v.peer))
    //         return

    //     const call = myPeer.call(v.peer, myStream)
    //     call.on('stream', stream => {
    //         console.log(stream)
    //     })
    //     PeerStream.outStream.set(v.peer, call)

    // })
})

function createToastUserOut(name) {
    const div = document.createElement('div')
    div.classList.add('toast_user_out', 'fixed')
    div.innerHTML = `
                        <h1>${name}</h1>
                        <span>đã rời khỏi cuộc họp</span>
                    `
    return div
}

function updateGridView(num) {
    if (num < 2) {
        wrapUsers.classList.remove('grid_1_2', 'grid_2_2', 'grid_3_4')
    } else if (num == 2) {
        wrapUsers.classList.remove('grid_2_2', 'grid_3_4')
        wrapUsers.classList.add('grid_1_2')
    } else if (num <= 4) {
        wrapUsers.classList.remove('grid_1_2', 'grid_3_4')
        wrapUsers.classList.add('grid_2_2')
    } else if (num <= 12) {
        wrapUsers.classList.remove('grid_2_2', 'grid_1_2')
        wrapUsers.classList.add('grid_3_4')
    }
}

function createUserCard({name, picture}, key, peer_id) {
    const div = document.createElement('div')
    div.classList.add('user_card', 'h-full', 'w-full', 'relative', `${socket.id == key ? 'my_div' : 'abc'}`)
    div.id = '__' + peer_id
    let html = `<div class="user_mic absolute">
                    <i class='bx bxs-microphone-off' ></i>
                </div>
                <div class="user_item w-full h-full flex align-center center">
                    <video class="user_content none" src=""  id="___${peer_id}" autoplay ${socket.id == key ? 'muted' : ''}></video>
                    <img class="user_content" src="${picture}" alt="">
                </div>
                <div class="user_name absolute">
                    <h1>${socket.id == key ? 'Bạn' : name}</h1>
                </div>`
    div.innerHTML = html
    return div
}


