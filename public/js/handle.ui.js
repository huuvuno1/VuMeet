
const zoom_id = location.pathname.substring(1)
$('title').innerText = "VuMeet - " + zoom_id
$('#link_zoom').innerText = location.href
$('.left_option .zoom_id').innerText = zoom_id
$('.left_option .present_time').innerText = getTime()


setInterval(() => {
    $('.left_option .present_time').innerText = getTime()
}, 60000)

// ui
function toggleSideBar2(_this) {
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
            _this.classList.remove('option_item-active')
        }, 300)


    } else {
        sidebar_content.classList.add('content_none')
        div.classList.add('sidebar_active')
        content.classList.remove('none')
        setTimeout(() => {
            _this.classList.add('option_item-active')
            sidebar_content.classList.remove('content_none')
        }, 600)
    }
}

function toggleSideBar3(_this) {
    const sidebar_item = _this.dataset.sidebar_item
    console.log($('.' + sidebar_item))
    const isHidden =$('.' + sidebar_item).classList.contains('none')
    const div = document.querySelector('.div_top')
    const prevSidebar = $('option_item-active')

    // dang active thi thoi, chua thi show ra
    if (isHidden) {
        // show sidebar
        // sidebar_content.classList.add('content_none')
        // dang active thi thoi, chua thi show ra
        if (!div.classList.contains('sidebar_active')) {
            div.classList.add('sidebar_active')
        }

        setTimeout(() => {
            $('.' + sidebar_item).classList.remove('none')
            highLightIconSidebar(sidebar_item)
        }, 600)

    } else {



        // hidden sidebar
        div.classList.remove('sidebar_active')
    }


    if (prevSidebar.dataset.sidebar_item == sidebar_item) {

    }
}


function toggleSideBar(_this) {
    const name = _this.dataset.sidebar_item
    const div = document.querySelector('.div_top')
    const sidebar = document.querySelector('.sidebar')
    if (div.classList.contains('sidebar_active')) {
        const prevSidebar = $('.option_item-active')
        if (!prevSidebar) return // user spam click
        const prevName = prevSidebar.dataset.sidebar_item
        if (prevName == name) {
            showContentSidebar()
            sidebar.classList.remove('slide_in')
            sidebar.classList.add('slide_out')
            
            setTimeout(() => {
                div.classList.remove('sidebar_active')
                sidebar.classList.add('slide_in')
                highLightIconSidebar()
            }, 300)
        } else {
            highLightIconSidebar(name)
            showContentSidebar(name)
        }

    } else {
        div.classList.add('sidebar_active')
        setTimeout(() => {
            highLightIconSidebar(name)
            showContentSidebar(name)
        }, 600)
    }
}

function highLightIconSidebar(name) {
    $$('.option_item').forEach(e => e.classList.remove('option_item-active'))
    if (name) {
        $('.icon__' + name).classList.add('option_item-active')
    }
}


function showContentSidebar(name) {
    $$('.sidebar_content-item').forEach(e => {
        e.classList.add('none')
    })
    if (name) {
        $('.' + name).classList.remove('none')
    }
}

function renderDevices(_this) {
    if (_this.checked) {
        navigator.mediaDevices.enumerateDevices()
            .then((mediaDevices) => {
                mediaDevices.forEach(mediaDevice => {
                    if (mediaDevice.kind == 'audiooutput' && mediaDevice.deviceId == 'default')
                        $('#list_audio_output').innerText = mediaDevice.label
                })
            });
        $('#list_audio_input').innerText = myStream.getAudioTracks()[0].label
        $('#list_video_input').innerText = myStream.getVideoTracks()[0].label
    }
}

function showSettingOption(_this) {
    // reset 
    const sidebar = $('.modal_setting-sidebar_item').children
    for (let item of sidebar) {
        item.classList.remove('setting_item-active')
    }
    _this.classList.add('setting_item-active')
    $$('.modal_setting-content_wrappers').forEach(element => {
        element.classList.add('none')
    })
    $('.' + _this.dataset.setting_option).classList.remove('none')
}


function pinOrUnpinContent(_this) {
    const card = _this.parentElement.parentElement
    const type = card.parentElement.classList.contains('slideshow') ? 'unpin' : 'pin'
    return [type, card.parentElement.removeChild(card)]
}

function togglePin(_this) {
    const [type, element] = [...pinOrUnpinContent(_this)]
    const slideShow = $('.slideshow')

    if (type == 'unpin') {
        $('.main_views').classList.remove('slideshow_active')
        wrapUsers.appendChild(element)
        updateGridView(wrapUsers.childElementCount)
    } else {
        if (slideShow.childElementCount == 0) {
            $('.main_views').classList.add('slideshow_active')
            slideShow.appendChild(element)
        }
        else {
            const dom = slideShow.removeChild(slideShow.children[0])
            slideShow.appendChild(element)
            wrapUsers.appendChild(dom)
        }
    }
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

function renderUserToBox(user, k) {
    console.log('render user to sidebar')
    const wrapper = $('.wrap_box-users')
    const { name, picture, admin, peer } = { ...user.info, ...user }
    if ($('#' + prevUserBox + peer))
        return

    const div = document.createElement('div')
    div.classList.add('flex', 'align-center')
    div.id = prevUserBox + peer
    let html = `
        <div class="box_user-avatar round-full b-1">
            <img src="${picture}" class="w-full h-full round-full" alt="" srcset="">
        </div>
        <div class="box_user-info flex-1 ml-15">
            <div class="box_user-name">
                ${name + (k == socket.id ? ' (Bạn)' : '')}
            </div>
            <div class="box_user-role ${admin === socket.id ? '' : 'none'}">
                Người tổ chức cuộc họp
            </div>
        </div>
        <div class="box_user-pin flex cursor-pointer align-center round-full center mr-10" 
            data-user_box="${prevUserPin + peer}"
            onclick="pinUserFromBox(this)"
        >
            <i class='bx bx-pin text-24'></i>
        </div>
    `
    div.innerHTML = html

    wrapper.appendChild(div)
}

function pinUserFromBox(_this) {
    togglePin($('.' + _this.dataset.user_box))
}


$('#inpSearchUsers').addEventListener('input', e => {
    const result = []
    UsersInRoom.forEach((v, k) => {
        if (v.info.name.toLowerCase().includes(e.target.value.toLowerCase())) 
            result.push({k, v})
    })
    $('.wrap_box-users').innerHTML = ''
    result.forEach(value => {
        renderUserToBox(value.v, value.k)
    })
})