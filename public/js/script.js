
const wrapUsers = $('#wrap_users')



let UsersInRoom

let testStream

let call_all_zoom = true

socket.on('list_users_in_room', (users_str, peer_id) => {
    const data = new Map(Object.entries(users_str))

    // chay 1 lan duy nhat
    if (call_all_zoom) {
        data.forEach((v, k) => {
            const type = myStream.getVideoTracks()[0].enabled ? 'on' : 'off'
            const options = {
                'constraints': {
                  'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true
                  },
                  offerToReceiveAudio: 1,
                  offerToReceiveVideo: 1,
                },
                'metadata': {"type":type}
              }
        
            if (!PeerStream.outStream.get(v.peer) && !PeerStream.inStream.get(v.peer) && v.peer != myPeer.id) {
                
                const call = myPeer.call(v.peer, myStream, options)
                console.log("call to user")
                call.on('stream', stream => {
                    testStream = stream
                    console.log('peer', stream)
                    addStreamToView(v.peer, stream)
                })
                PeerStream.outStream.set(v.peer, call)
            }
        })
        call_all_zoom = false
    }
    

    // share screen cho user moi
    data.forEach((v, k) => {
        // khog lien quan code tren
        if (!PeerStream.outShareScreen.get(v.peer) && myStreamShareScreen && v.peer != myPeer.id) {
            socket.emit('start_share_screen')

            socket.on('start_share_screen_reply', () => {
                const call = myPeer.call(v.peer, myStreamShareScreen)
                PeerStream.outShareScreen.set(v.peer, call)
            })
            
        }
    })
    
    
    console.log('sdlkfj')
    

    // neu co peer id thi user nay moi thoat <-> nguoc lai undefined
    if (peer_id) {
        console.log(peer_id)
        wrapUsers.removeChild($('#__' + peer_id))
        updateGridView(data.size)

        // show toast
        UsersInRoom.forEach((v, k) => {
            if (v.peer == peer_id) {
                makeToastUserOut(v.info.name, 1)
            }
        })

        // close and remove peer connection
        let call = PeerStream.inStream.get(peer_id) || PeerStream.outStream.get(peer_id) || PeerStream.outShareScreen.get(peer_id)
        if (call) call.close()
        PeerStream.inStream.delete(peer_id)
        PeerStream.outStream.delete(peer_id)
        PeerStream.outShareScreen.delete(peer_id)
        console.log('disconnect with peer: ', peer_id)
    }

    UsersInRoom = data

    if ($('#temp_user_data')) {
        wrapUsers.innerHTML = ''
    }

    // render
    updateGridView(UsersInRoom.size)
    UsersInRoom.forEach((v, k) => {
        let check = $('#__' + v.peer)
        if (check) return
        const userDom = createUserCard({...v.info}, k, v.peer)
        wrapUsers.appendChild(userDom)
        makeToastUserOut(v.info.name, 2)
    })

    shareScreenToAllUsers()
    
// lung tung
    if (camMicStatus.cam) {
        console.log('vao day')
        const myVideo = $('#___' + myPeer.id)
        myVideo.srcObject = myStream
        let img = myVideo.parentElement.children[1]
        myVideo.classList.remove('none')
        img.classList.add('none')
    }
})

// thong bao co user moi share
socket.on('user_share_screen', (peer_id, name) => {
    
})


socket.on('stop_share_screen', peer_id => {
    listShareScreen.delete(peer_id)
    const div = $('#__sharescreen_' + peer_id)
    if (!div) return
    const parent = div.parentElement

    // đang được ghim
    if (parent.classList.contains('slideshow')) {
        $('.main_views').classList.remove('slideshow_active')
    }
    parent.removeChild(div)
})
/**
 * 
 * @param {*} name 
 * @param {*} id_message 1: out, 2 in
 * @returns 
 */
function makeToastUserOut(name, id_message) {
    const div = document.createElement('div')
    div.classList.add('toast_user_out', 'fixed')
    div.innerHTML = `
                        <h1>${name}</h1>
                        <span>${id_message == 1 ? 'đã rời khỏi cuộc họp' : 'đã tham gia cuộc họp'}</span>
                    `
    $('body').appendChild(div)
    setTimeout(() => {
        $('body').removeChild(div)
    }, 3000)
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
                <div class="card_option flex align-center center absolute">
                        <div class="card_option_item">
                            <i class='bx bx-pin'></i>
                        </div>
                        <div class="card_option_item">
                            <i class='bx bx-pin'></i>
                        </div>
                    </div>
                <div class="user_name absolute">
                    <h1>${socket.id == key ? 'Bạn' : name}</h1>
                </div>`
    div.innerHTML = html
    return div
}



// ui
function toggleSideBar(_this) {
    const content = $('.' + _this.dataset.sidebar_item)

    const div = document.querySelector('.div_top')
    const sidebar = document.querySelector('.sidebar')
    const sidebar_content = document.querySelector('.sidebar_content')
    if (div.classList.contains('sidebar_active')) {
        sidebar.classList.remove('slide_in')
        sidebar_content.classList.add('content_none')
        sidebar.classList.add('slide_out')

        setTimeout(() => {
            div.classList.remove('sidebar_active')
            sidebar.classList.remove('slide_out')
            sidebar.classList.add('slide_in')
            sidebar_content.classList.remove('content_none')
            content.classList.add('none')
        }, 300)
        
        
    } else {
        sidebar_content.classList.add('content_none')
        div.classList.add('sidebar_active')
        content.classList.remove('none')
        setTimeout(() => {
            sidebar_content.classList.remove('content_none')
        }, 600)
    }
}

// function toggleSideBar(_this) {
//     const div = document.querySelector('.div_top')
//     if (div.classList.contains('sidebar_active')) {
//         div.classList.remove('sidebar_active')
//     } else {
//         div.classList.add('sidebar_active')
//     }
// }

function pinOrUpinContent(_this) {
    const card = _this.parentElement.parentElement
    return card.parentElement.removeChild(card)
}



socket.on('user_toggle_camera', (peer_id, status) => {
    const wrap = $('#__' + peer_id)
    if (!wrap) return
    
    const video =  $('#___' + peer_id)
    if (status){
        video.classList.remove('none')
        video.parentElement.children[1].classList.add('none')
    } else {
        video.classList.add('none')
        video.parentElement.children[1].classList.remove('none')
    }
})


function copy(text) {
    var text = text || location.href
    navigator.clipboard.writeText(text).then(function() {
        makeToast("Đã copy vào bộ nhớ")
    }, function(err) {
        makeToast("Có lỗi xảy ra khi copy")
    });
    
 }


 function makeToast(message) {
    const div = document.createElement('div')
    div.classList.add('toast_user_out', 'fixed')
    div.innerHTML = `
                        <span>${message}</span>
                    `
    $('body').appendChild(div)
    setTimeout(() => {
        $('body').removeChild(div)
    }, 3000)
}