navigator.getUserMedia = ( 
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia );

const socket = io()

const myPeer = new Peer()

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
let myStream
let myStreamShareScreen
const btnCamera = $('#btnCamera')
const btnMicro = $('#btnMicro')
const btnShareScreen = $('#btnShareScreen')
let listShareScreen = new Set()

const camMicStatus = {
    cam: true,
    mic: true
}

const PeerStream = {
    outStream: new Map(),
    inStream: new Map(),
    outShareScreen: new Map()
}

navigator.getUserMedia({video: true, audio: true}, stream => {
    myStream = stream
    const prev_video = $('.prev_video')
    if (!prev_video) return // user click nhanh qua dom chua kip loa
    prev_video.srcObject= stream
    prev_video.onloadeddata = function() {
        console.log('play')
        this.play()
    }
}, err => {
    console.log(err)
})


const btnPrevCamera = $('#btnPrevCamera')
btnPrevCamera.addEventListener('click', () => toggleCamera(true))

const btnPrevMicro = $('#btnPrevMicro')
btnPrevMicro.addEventListener('click', () => toggleMicro(true))




function toggleIconPrevCamera() {
    if (btnPrevCamera.children[0].classList.contains('none')) {
        btnPrevCamera.children[0].classList.remove('none')
        btnPrevCamera.children[1].classList.add('none')
        camMicStatus.cam = false
        return 'turn_off'
    } else {
        btnPrevCamera.children[0].classList.add('none')
        btnPrevCamera.children[1].classList.remove('none')
        camMicStatus.cam = true
        return 'turn_on'
    }
}

function toggleCamera(isPreview) {
    if (isPreview) {
        toggleIconPrevCamera()
    } else {
        toggleIconCamera()
    }
    
    if (!myStream) return

    if (camMicStatus.cam === false) {
        console.log('turn off')
        const track = myStream.getVideoTracks()[0]
        track.stop()
        myStream.removeTrack(track)
    } else {
        navigator.getUserMedia({ video: true, audio: false }, 
            stream => {
                myStream.addTrack(stream.getVideoTracks()[0])
                
            }, 
            err => {
                alert('Lỗi r, đọc log')
                console.log(err)
            })
    }
    
}

function toggleMicro(isPreview) {
    console.log('pri', isPreview)
    if (isPreview) {
        toggleIconPrevMicro()
    } else {
        toggleIconMicro()
    }
    if (!myStream) return
    myStream.getAudioTracks()[0].enabled = camMicStatus.mic
    console.log('toggle mic', camMicStatus.mic)
    
}

function toggleIconPrevMicro() {
    if (btnPrevMicro.children[0].classList.contains('none')) {
        btnPrevMicro.children[0].classList.remove('none')
        btnPrevMicro.children[1].classList.add('none')
        camMicStatus.mic = false
        return 'turn_off'
    } else {
        btnPrevMicro.children[0].classList.add('none')
        btnPrevMicro.children[1].classList.remove('none')
        camMicStatus.mic = true
        return 'turn_on'
    }
}



function joinZoom() {
    socket.emit('add_user_to_zoom', location.pathname.substring(1), myPeer.id)
    
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