const iconCamOff = `<i class='bx bxs-camera-off' ></i>`
const iconCamOn = `<i class='bx bxs-camera-movie' ></i>`
const iconMicOff = `<i class='bx bx-microphone-off' ></i>`
const iconMicOn = `<i class='bx bxs-microphone' ></i>`


myPeer.on('open', function(id) {
    
})

myPeer.on('call', (call) => {
    console.log('co ng goi den', call)
    call.answer(myStream)
    call.on('stream', (stream) => {
        console.log('aswer', stream)
        if (call.peer == myPeer.id)
            return

        let my_video = $('#___' + call.peer)
        my_video.classList.remove('none')
        
        my_video.srcObject = stream
        my_video.parentElement.children[1].classList.add('none')
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
    navigator.mediaDevices.getDisplayMedia({})
        .then(stream => {
            console.log('share screen', stream)
            $('#___' + myPeer.id).srcObject = stream
            $('#___' + myPeer.id).classList.remove('none')
            $('#___' + myPeer.id).parentElement.children[1].classList.add('none')
            
        })
        .catch(err => {
            console.log(err)
        })
})

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