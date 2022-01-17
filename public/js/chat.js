const btnSend = $('#btnSendChat')
const inpChat = $('#inpChat')


inpChat.addEventListener('keydown', e => {
    if (e.which == 13 || e.keyCode == 13) {
        sendChat()
    }
})

inpChat.addEventListener('keyup', e => {
    if (e.target.value.trim() == '') {
        btnSend.classList.remove('text-blue')
    } else {
        btnSend.classList.add('text-blue')
    }
})

btnSend.addEventListener('click', sendChat)

socket.on('receive_chat', (name, content) => {
    renderContentChat(name, content)
})

function sendChat() {
    if (inpChat.value.trim() == '')
    return

    socket.emit('send_chat', inpChat.value)
    renderContentChat('Bạn', inpChat.value)
    inpChat.value = ''
}

function renderContentChat(name, content) {
    let time = new Date();
    let time_c = time.getHours() + ":" + time.getMinutes()

    const div = document.createElement('div')
    div.classList.add('wrap_chat')
    div.innerHTML = `
        <div class="flex align-center">
            <h1 class="chat_name">${name}</h1>
            <span class="chat_time">${time_c}</span>
        </div>
        <div class="chat_content">
            
        </div>
    `
    div.querySelector('.chat_content').innerText = content

    $('.box_chat-content').appendChild(div)
}