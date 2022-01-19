const iconCamOff = `<i class='bx bxs-camera-off' ></i>`
const iconCamOn = `<i class='bx bxs-camera-movie' ></i>`
const iconMicOff = `<i class='bx bx-microphone-off' ></i>`
const iconMicOn = `<i class='bx bxs-microphone' ></i>`


myPeer.on('open', function(id) {
    
})

let testOnCall

myPeer.on('call', (call) => {

    call.answer(myStream)

    
    
    call.on('stream', (stream) => {

        // bên kia biết cam off mà bật ảnh lên thay thế video đen
        if (!camMicStatus.cam) {
            setTimeout(() => {
                socket.emit('camera_is_off', call.peer)
            }, 1000)
        }

        testOnCall = stream

        // phòng tránh tự call chính mình(đã xử lý k để xảy ra)
        if (call.peer == myPeer.id)
            call.close()

        if (call.metadata.type == 'shareScreen') {
            console.log('co user share screen')
            if (listShareScreen.has(call.peer))
                return
            call.on('close', () => {
                console.log('user stop share')
            })
            listShareScreen.add(call.peer)
            renderShareScreenDom(call.peer, stream, false)
            // $('#___sharescreen_' + call.peer).srcObject = stream
            return
        }

        let video = $('#___' + call.peer)
        video.srcObject = stream
        if (call.metadata.type == 'on') {
            video.parentElement.children[1].classList.add('none')
            video.classList.remove('none')
        }
        
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

btnShareScreen.addEventListener('click', () => {
    // tat share
    if (myStreamShareScreen) {
        myStreamShareScreen.getTracks().forEach(track => {
            track.dispatchEvent(new Event('ended'))
            track.stop()
        });
        return
    }


    // bat share
    navigator.mediaDevices.getDisplayMedia({})
        .then(stream => {
            myStreamShareScreen = stream

            shareScreenToAllUsers(stream)
            
            renderShareScreenDom(myPeer.id, stream, true)

            
        })
        .catch(err => {
            console.log(err)
        })
})

function shareScreenToAllUsers(stream) {
    const _stream = stream || myStreamShareScreen
    if (!_stream) return
    const options = {
        'constraints': {
          'mandatory': {
            'OfferToReceiveAudio': false,
            'OfferToReceiveVideo': false
          },
          offerToReceiveAudio: 0,
          offerToReceiveVideo: 0,
        },
        'metadata': {"type": "shareScreen"}
      }
    UsersInRoom.forEach((value, key) => {
        console.log('share di vao')
        if (key == socket.id || PeerStream.outShareScreen.has(value.peer)) return
        console.log('share start')

        // share 1 way
        const call = myPeer.call(value.peer, _stream, options)
        PeerStream.outShareScreen.set(value.peer, call)
    })
}

function renderShareScreenDom(peer_id, stream, isMyShare) {
    let name = getName(peer_id)
    const shareDom = createUserCard({name, picture: ''}, isMyShare ? socket.id : '', 'sharescreen_' + peer_id)
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
            try {
                $('.slideshow').removeChild(shareDom)
                $('.main_views').classList.remove('slideshow_active')
            } catch {
                wrapUsers.removeChild(shareDom)
            }
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

function callAllUsers(data) {
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


function stopShareScreen() {
    myStreamShareScreen = null
    socket.emit('stop_share_screen')
    PeerStream.outShareScreen.forEach((call, k) => {
        call.close()
        PeerStream.outShareScreen.delete(k)
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

function getName(peer_id) {
    let name = ''
    UsersInRoom.forEach((v, k) => {
        if (v.peer == peer_id)
            name = v.info.name
    })
    return name
}