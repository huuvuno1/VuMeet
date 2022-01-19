
const wrapUsers = $('#wrap_users')



let UsersInRoom

let testStream

let call_all_zoom = true


socket.on('request_to_join', data => {
    if (data == 'OK') {
        startJoinRoom()
    } else if (data == 'DENIED') {
        $('#btnCreateZoom').classList.remove('none')
        $('#btnCreateZoom').innerText = 'Ai đó đã từ chối bạn - Yêu cầu lại'
        $('.loadding').classList.add('none')
    } else {
        socket.emit('add_user_to_zoom', myPeer.id, data)
    }
})

socket.on('listen_request_to_join', (user, requestID) => {
    const data = JSON.parse(user)

    // show noti
    $('#modal_alert_checkbox').checked = true
    $('.modal_alert-avatar_i').src = data.picture

    let div = document.createElement('div')
    div.classList.add('modal_join-user')
    let html = `
                    <p class="text-gray">${data.name}</p>
                    <div class="modal_wrap-option flex flex-end align-center mt-15">
                        <div for="modal_alert_checkbox" 
                            class="modal_alert-button_item cursor-pointer round-7 text-center p-5"
                            onclick="allowEnterRoom(this, '${requestID}', false)"    
                        >
                            Từ chối
                        </div>
                        <div for="modal_alert_checkbox" 
                            class="modal_alert-button_item cursor-pointer round-7 text-center p-5 ml-20 mr-20"
                            onclick="allowEnterRoom(this, '${requestID}', true)"
                        >
                            Chấp nhận                    
                        </div>
                    </div>
                `
    div.innerHTML = html
    $('.modal_join-users').appendChild(div)
    if ($('.modal_join-users').childElementCount > 1) {
        $('.modal_users_join_room').classList.add('muilti_user_join')
    }
})

function startJoinRoom() {
    console.log('join zoom')
    socket.emit('add_user_to_zoom', myPeer.id)
    $('body').removeChild($('#app_prev'))
    $('#app').classList.remove('none')
    $('body').id = 'zoom_page'

    // by default, icon cam/mic set to off
    if (camMicStatus.cam) {
        toggleIconCamera()
        
    }
    if (camMicStatus.mic)
        toggleIconMicro()
}


function allowEnterRoom(element, requestID, ok) {
    if (ok) {
        console.log('duyet')
        socket.emit('reply_request_to_join', requestID, 'OK')
    } else {
        console.log('denied')
        socket.emit('reply_request_to_join', requestID, 'DENIED')
    }

    $('.modal_join-users').removeChild(element.parentElement.parentElement)

    if ($('.modal_join-users').childElementCount == 0)
        $('#modal_alert_checkbox').checked = false

    if ($('.modal_join-users').childElementCount <= 1) {
        $('.modal_users_join_room').classList.remove('muilti_user_join')
    }
}

socket.on('list_users_in_room', (users_str, peer_id) => {
    const data = new Map(Object.entries(users_str))

    // chay 1 lan duy nhat
    if (call_all_zoom) {
        callAllUsers(data)
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

        // remove div in sidebar
        const user_box = $('#' + prevUserBox + peer_id)
        if (user_box) {
            $('.wrap_box-users').removeChild(user_box)
        }

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
        // update user in sidebar
        renderUserToBox(v, k)


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

socket.on('camera_is_off', peer_id => {
    console.log('user cam off', new Date().getTime())
    $('#___' + peer_id).classList.add('none')
    $('#___' + peer_id).parentElement.children[1].classList.remove('none')
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

socket.on('disconnect', () => {
    console.log('disconnect to server')
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



function createUserCard({name, picture}, key, peer_id) {
    const div = document.createElement('div')
    const my_div_class_name = socket.id == key && !peer_id.includes('sharescreen') ? 'my_div' : 'abc'

    div.classList.add('user_card', 'h-full', 'w-full', 'relative', my_div_class_name)
    div.id = '__' + peer_id
    let html = `<div class="user_mic absolute">
                    ${camMicStatus.mic ? `<i class='bx bx-microphone'></i>` : `<i class="bx bxs-microphone-off"></i>`}
                </div>
                <div class="user_item w-full h-full flex align-center center">
                    <video class="user_content none" src=""  id="___${peer_id}" autoplay ${socket.id == key ? 'muted' : ''}></video>
                    <img class="user_content" src="${picture}" alt="">
                </div>
                <div class="card_option flex align-center center absolute">
                        <div class="card_option_item ${prevUserPin + peer_id}" onclick="togglePin(this)">
                            <i class='bx bx-pin'></i>
                        </div>
                        <div class="card_option_item">
                            <i class='bx bx-block' title='Chưa code' style='color: gray; cursor: not-allowed;'></i>
                        </div>
                    </div>
                <div class="user_name absolute">
                    <h1>${(socket.id == key ? 'Bạn' : name) + (peer_id.includes('sharescreen') ? ' đang chia sẻ màn hình' : '')}</h1>
                </div>`
    div.innerHTML = html
    return div
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


socket.on('user_toggle_micro', (peer_id, status) => {
    const wrap = $('#__' + peer_id)
    if (!wrap) return
    
    const video =  $('#___' + peer_id)
    const wrapMic = video.parentElement.parentElement.children[0]
    if (status){
        wrapMic.innerHTML = `<i class='bx bx-microphone'></i>`
    } else {
        wrapMic.innerHTML = `<i class="bx bxs-microphone-off"></i>`
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