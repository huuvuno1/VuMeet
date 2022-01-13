const socket = io()
const $ = document.querySelector.bind(document)
const wrapUsers = $('#wrap_users')

socket.emit('add_user_to_zoom', location.pathname.substring(1))

let UsersInRoom
socket.on('list_users_in_room', users_str => {
    UsersInRoom = new Map(Object.entries(users_str))
    wrapUsers.innerHTML = ''
    
    if (UsersInRoom.size < 2) {
        wrapUsers.classList.remove('grid_1_2', 'grid_2_2', 'grid_3_4')
    } else if (UsersInRoom.size == 2) {
        wrapUsers.classList.remove('grid_2_2', 'grid_3_4')
        wrapUsers.classList.add('grid_1_2')
    } else if (UsersInRoom.size <= 4) {
        wrapUsers.classList.remove('grid_1_2', 'grid_3_4')
        wrapUsers.classList.add('grid_2_2')
    } else if (UsersInRoom.size <= 12) {
        wrapUsers.classList.remove('grid_2_2', 'grid_1_2')
        wrapUsers.classList.add('grid_3_4')
    }
    UsersInRoom.forEach((v, k) => {
        const userDom = createUserCard({...v.info}, k)
        wrapUsers.appendChild(userDom)
    })
    console.log('script')
})


function createUserCard({name, picture}, key) {
    const div = document.createElement('div')
    div.classList.add('user_card', 'h-full', 'w-full', 'relative')
    let html = `<div class="user_mic absolute">
                    <i class='bx bxs-microphone-off' ></i>
                </div>
                <div class="user_item w-full h-full flex align-center center">
                    <video class="user_content none" src="" autoplay id="my_video"></video>
                    <img class="user_content" src="${picture}" alt="">
                </div>
                <div class="user_name absolute">
                    <h1>${socket.id == key ? 'Bạn' : name}</h1>
                </div>`
    div.innerHTML = html
    return div
}