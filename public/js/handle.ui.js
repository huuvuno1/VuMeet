const zoom_id = location.pathname.substring(1)
$('title').innerText = "VuMeet - " + zoom_id
$('#link_zoom').innerText = location.href
$('.left_option .present_time').innerText = getTime()
$('.left_option .zoom_id').innerText = zoom_id


// ui
function toggleSideBar(_this) {
    console.log(_this)
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

function renderDevices(_this) {
    if (_this.checked) {
        navigator.mediaDevices.enumerateDevices()
        .then( (mediaDevices) => { 
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
    } else{
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