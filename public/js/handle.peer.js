const iconCamOff = `<i class='bx bxs-camera-off' ></i>`
const iconCamOn = `<i class='bx bxs-camera-movie' ></i>`
const iconMicOff = `<i class='bx bx-microphone-off' ></i>`
const iconMicOn = `<i class='bx bxs-microphone' ></i>`


myPeer.on('open', function(id) {
    
})

let testOnCall

myPeer.on('call', (call) => {
    console.log('co ng goi den', call)
    call.answer(myStream)
    call.on('stream', (stream) => {

        console.log('vao stream')
        testOnCall = stream

        // phòng tránh tự call chính mình(đã xử lý k để xảy ra)
        if (call.peer == myPeer.id)
            call.close()

        // // nếu đã kết nối rồi mà vẫn có video đến thì là share screen
        // if ($('.flag__' + call.peer)) {
        //     renderShareScreenDom(call.peer, stream, false)
        // }
        //  giải pháp, socket bắn noti tạo card share screen, bên kia tạo card
        // sau đấy call sang bên kia, bên kia check nếu trong slideshow chưa cho thì bỏ vào

        if (listShareScreen.has(call.peer)) {
            $('#___sharescreen_' + call.peer).srcObject = stream
            return
        }

        let video = $('#___' + call.peer)
        
        // show video
        video.classList.remove('none')
        
        // set flag to video
        video.classList.add('flag__' + call.peer)

        video.srcObject = stream
        video.parentElement.children[1].classList.add('none')
    })

    call.on('error', err => {
        console.log('err', err)
    })


    PeerStream.inStream.set(call.peer, call)
})


btnCamera.addEventListener('click', () => {

    toggleCamera()

    const myVideo = $('#___' + myPeer.id)
    let img = myVideo.parentElement.children[1]

    if (camMicStatus.cam) {
        myVideo.classList.remove('none')
        myVideo.srcObject = myStream
        img.classList.add('none')
    } else {
        myVideo.classList.add('none')
        img.classList.remove('none')
    }
        
})

btnMicro.addEventListener('click', () => toggleMicro())

function addStreamToView(id_dom, stream) {
    const video = $('#___' + id_dom)
    video.srcObject = stream
    video.classList.remove('none')
    video.parentElement.children[1].classList.add('none')
    video.onloadeddata = function() {
        console.log('video play')
        video.play()
    }

}

// nên tạo element mới
btnShareScreen.addEventListener('click', () => {
    if (myStreamShareScreen) {
        myStreamShareScreen.getTracks().forEach(track => {
            track.dispatchEvent(new Event('ended'))
            track.stop()
        });
        return
    }


    navigator.mediaDevices.getDisplayMedia({})
        .then(stream => {
            // const shareDom = createUserCard({name: '', picture: ''}, socket.id, 'sharescreen_' + myPeer.id)
            // const video = shareDom.querySelector('video')
            // video.srcObject = stream
            // video.classList.remove('none')
            // video.parentElement.children[1].classList.add('none')
            // $('.slideshow').appendChild(shareDom)
            // $('.main_views').classList.add('slideshow_active')
            // btnShareScreen.classList.add('bg-green')

            socket.emit('start_share_screen')

            socket.on('start_share_screen_reply', () => {
                shareScreenToAllUsers(stream)
            })
            
            renderShareScreenDom(myPeer.id, stream, true)

            myStreamShareScreen = stream
            
        })
        .catch(err => {
            console.log(err)
        })
})


function shareScreenToAllUsers(stream) {
    const _stream = stream || myStreamShareScreen
    UsersInRoom.forEach((value, key) => {
        if (key == socket.id) return

        // share 1 way
        const call = myPeer.call(value.peer, _stream)
        PeerStream.outShareScreen.set(value.peer, call)
    })
}

function renderShareScreenDom(peer_id, stream, isMyShare) {
    const shareDom = createUserCard({name: '', picture: ''}, socket.id, 'sharescreen_' + peer_id)
    const video = shareDom.querySelector('video')
    if (stream)
        video.srcObject = stream
    video.classList.remove('none')
    video.parentElement.children[1].classList.add('none')
    
    const slideshow = $('.slideshow')
    if (isMyShare) {
        btnShareScreen.classList.add('bg-green')
        const childE = slideshow.children[0]
        if (childE) {
            slideshow.removeChild(childE)
            wrapUsers.appendChild(childE)
        }
        slideshow.appendChild(shareDom)
        btnShareScreen.classList.add('bg-green')
        $('.main_views').classList.add('slideshow_active')

        // event ended
        stream.getVideoTracks()[0].onended = function () {
            $('.slideshow').removeChild(shareDom)
            $('.main_views').classList.remove('slideshow_active')
            btnShareScreen.classList.remove('bg-green')
            stopShareScreen()
        };
    } else {
        console.log('handle share screen', slideshow.childElementCount)
        if (slideshow.childElementCount === 0) {
            $('.slideshow').appendChild(shareDom)
            $('.main_views').classList.add('slideshow_active')
        } else {
            wrapUsers.appendChild(shareDom)
        }
    }
}

function stopShareScreen() {
    myStreamShareScreen = null
    socket.emit('stop_share_screen')
    PeerStream.outShareScreen.forEach((call, k) => {
        call.close()
    })
}

function toggleIconCamera() {
    if (btnCamera.children[0].classList.contains('none')) {
        btnCamera.children[0].classList.remove('none')
        btnCamera.children[1].classList.add('none')
        camMicStatus.cam = false
        return 'turn_off'
    } else {
        btnCamera.children[0].classList.add('none')
        btnCamera.children[1].classList.remove('none')
        camMicStatus.cam = true
        return 'turn_on'
    }
}

function toggleIconMicro() {
    if (btnMicro.children[0].classList.contains('none')) {
        btnMicro.children[0].classList.remove('none')
        btnMicro.children[1].classList.add('none')
        camMicStatus.mic = false 
        return 'turn_off'
    } else {
        btnMicro.children[0].classList.add('none')
        btnMicro.children[1].classList.remove('none')
        camMicStatus.mic = true
        return 'turn_on'
    }
}

function isBothOpen() {
    return btnMicro.children[0].classList.contains('none') && btnCamera.children[0].classList.contains('none')
}

function isBothStop() {
    return btnMicro.children[1].classList.contains('none') && btnCamera.children[1].classList.contains('none')
}