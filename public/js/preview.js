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
const prevUserBox = '__user_box_'
const prevUserPin = '__user_pin_'

const camMicStatus = {
    cam: true,
    mic: true,
    camNoPermission: false,
    micNoPermission: false
}

const PeerStream = {
    outStream: new Map(),
    inStream: new Map(),
    outShareScreen: new Map()
}

navigator.getUserMedia({video: { width: 1280, height: 720 }, audio: true}, stream => {
    myStream = stream
    const prev_video = $('.prev_video')
    if (!prev_video) return // user click nhanh qua dom chua kip loa
    prev_video.srcObject= stream
    prev_video.onloadeddata = function() {
        this.play()
    }
}, async err => {
    let checkCam = await checkPermission('camera')
    let checkMic = await checkPermission('microphone')

    if (!checkCam && !checkMic) {
        showAlert({
            title: 'Bạn đang chặn quyền camera và mic',
            messsage: 'Vui lòng cấp ít nhất một quyền và tải lại trang'
        })
        return
    }

    let isShow = false

    if (checkCam && checkMic) {
        showAlert({
            title: 'Không thể khởi động camera',
            messsage: 'Máy bạn không có cam hoặc camera đang bị ứng dụng khác đang sử dụng'
        })
        checkCam = false
        isShow = true
    }

    camMicStatus.camNoPermission = !checkCam
    camMicStatus.micNoPermission = !checkMic

    navigator.getUserMedia({audio: checkMic, video: checkCam}, stream => {
        myStream = stream
        const prev_video = $('.prev_video')
        if (!prev_video) return // user click nhanh qua dom chua kip loa
        prev_video.srcObject= stream
        prev_video.onloadeddata = function() {
            this.play()
        }

        checkCam || toggleCamera(true)
        checkMic || toggleMicro(true)

        isShow || showAlert({
            title: 'Camera hoặc mic không có quyền',
            messsage: 'Để trải nghiệm tốt hơn bạn nên cấp cả 2 quyền và tải lại trang'
        })
        
    }, err => {
        console.log(err)
        showAlert({
            title: 'Chưa nghĩ ra',
            messsage: 'Chả biết lỗi gì, đọc log xem'
        })
    })
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
    if (camMicStatus.camNoPermission) {
        try {
            $('#btnPrevCamera').style.backgroundColor = 'gray'
        } catch {}
        try {
            $('#btnCamera').style.backgroundColor = 'gray'
        } catch {}
        return
    }

    if (isPreview) {
        toggleIconPrevCamera()
    } else {
        toggleIconCamera()
    }
    
    if (!myStream) return

    if (camMicStatus.cam === false) {
        console.log('turn off cam')
        const track = myStream.getVideoTracks()[0]
        if (track) {
            track.enabled = false
            track.stop()
        }
    } else {
        // bat cam
        navigator.getUserMedia({ video: { width: 1280, height: 720 }, audio: false }, 
            stream => {
                myStream.removeTrack(myStream.getVideoTracks()[0])
                myStream.addTrack(stream.getVideoTracks()[0])
                socket.emit('toggle_camera', camMicStatus.cam)
                replaceTrackCamera()
            }, 
            err => {
                alert('Bạn vui lòng cấp quyền cho camera, nếu đã cấp thử refresh')
            })
    }

    // thong bao cho users de hien thi avatar thay th
    if ((PeerStream.inStream.size > 0 || PeerStream.outStream.size > 0) && socket) {
        socket.emit('toggle_camera', camMicStatus.cam)
    }
    
}

function replaceTrackCamera() {
    const merge = new Map([...PeerStream.inStream, ...PeerStream.outStream])
    merge.forEach((value, k) => {
        value.peerConnection.getSenders().forEach(sender => {
            if (sender.track?.kind == 'video')
                sender.replaceTrack(myStream.getVideoTracks()[0])
        })
    })
}

function replaceTrackMicro() {
    const merge = new Map([...PeerStream.inStream, ...PeerStream.outStream])
    merge.forEach((value, k) => {
        value.peerConnection.getSenders().forEach(sender => {
            if (sender.track?.kind == 'audio')
                sender.replaceTrack(myStream.getAudioTracks()[0])
        })
    })
}

function toggleMicro(isPreview) {
    if (camMicStatus.micNoPermission) {
        try {
            $('#btnPrevMicro').style.backgroundColor = 'gray'
        } catch {}
        try {
            $('#btnMicro').style.backgroundColor = 'gray'
        } catch {}
        return
    }

    if (isPreview) {
        toggleIconPrevMicro()
    } else {
        toggleIconMicro()
    }
    if (!myStream) return
    
    
    myStream.getAudioTracks()[0] && (myStream.getAudioTracks()[0].enabled = camMicStatus.mic)
    
    if ($('#__' + myPeer.id))
        $('#__' + myPeer.id).children[0].innerHTML = camMicStatus.mic ? `<i class='bx bx-microphone'></i>` : `<i class="bx bxs-microphone-off"></i>`
    
    // thong bao cho users de hien thi avatar thay th
    if ((PeerStream.inStream.size > 0 || PeerStream.outStream.size > 0) && socket) {
        console.log('emit togglemic', camMicStatus.mic)
        socket.emit('toggle_micro', camMicStatus.mic)
    }
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
    if (!myStream) {
        alert('từ từ bro ơi, load cam & mic đã')
        return
    }

    socket.emit('request_to_join', location.pathname.substring(1))

    $('#btnCreateZoom').classList.add('none')
    $('.loadding').classList.remove('none')

    // socket.emit('add_user_to_zoom', location.pathname.substring(1), myPeer.id)
    
    

    
}


function checkPermission(name) {
    return new Promise((resolve, reject) => {
        navigator.permissions.query({name})
        .then((permissionObj) => {
            resolve(permissionObj.state == 'granted')
        })
        .catch(err => {
            console.log(err)
            reject(false)
        })
    })
}