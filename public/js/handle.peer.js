navigator.getUserMedia = ( 
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia );


const btnCamera = $('#btnCamera')
const btnMicro = $('#btnMicro')

const iconCamOff = `<i class='bx bxs-camera-off' ></i>`
const iconCamOn = `<i class='bx bxs-camera-movie' ></i>`
const iconMicOff = `<i class='bx bx-microphone-off' ></i>`
const iconMicOn = `<i class='bx bxs-microphone' ></i>`
let myStream

btnCamera.addEventListener('click', () => {
    toggleIconCamera()
    const myVideo = $('#my_video')
    let img = myVideo.parentElement.children[1]
    if (myStream) {
        myVideo.classList.add('none')
        img.classList.remove('none')
        myStream.getTracks().forEach(function(track) {
            if (track.kind === 'video')
                track.stop();
        });
        myStream = null
        return
    }

    navigator.getUserMedia({
        video: true,
        audio: false
    }, stream => {
        console.log('sdlfkjsdflkj')
        myStream = stream
        myVideo.classList.remove('none')
        myVideo.srcObject = stream
        img.classList.add('none')
    }, err => {
        console.log('mo cam fail', err)
    })

})

btnMicro.addEventListener('click', () => {
    const myVideo = $('#my_video')
    toggleIconMicro()
    

    if (myStream && btnMicro.children[1].classList.contains('none')) {
        myStream.getTracks().forEach(function(track) {
            if (track.kind === 'audio')
                track.stop();
        });
        myStream = null
        return
    }

    navigator.getUserMedia({
        video: false,
        audio: true
    }, stream => {
        myStream = stream
        myVideo.srcObject = stream
    }, err => {
        console.log('mo mic fail', err)
    })
    
})


myVideo.onplay = () => {
    console.log('play')
}

function toggleIconCamera() {
    if (btnCamera.children[0].classList.contains('none')) {
        btnCamera.children[0].classList.remove('none')
        btnCamera.children[1].classList.add('none')
    } else {
        btnCamera.children[0].classList.add('none')
        btnCamera.children[1].classList.remove('none')
    }
}

function toggleIconMicro() {
    if (btnMicro.children[0].classList.contains('none')) {
        btnMicro.children[0].classList.remove('none')
        btnMicro.children[1].classList.add('none')
    } else {
        btnMicro.children[0].classList.add('none')
        btnMicro.children[1].classList.remove('none')
    }
}

function isBothOpen() {
    return btnMicro.children[0].classList.contains('none') && btnCamera.children[0].classList.contains('none')
}

function isBothStop() {
    return btnMicro.children[1].classList.contains('none') && btnCamera.children[1].classList.contains('none')
}