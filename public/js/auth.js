function handleCredentialResponse(response) {
    // console.log("Encoded JWT ID token: " + response.credential);
    
    fetch('/api/login', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: response.credential
        })
    })
        .then(response => response.json())
        .then(data => {
            location.reload()
        })
        .catch(err => console.log(err))
}
window.onload = function () {
    google.accounts.id.initialize({
    client_id: "60630415904-95rejsmmjkgb7ffgsvc0mme7u0ar1ujt.apps.googleusercontent.com",
    callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
    document.getElementById("btnLoginWithGG"),
    { theme: "outline", size: "large" }  // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
}

function logout() {
    location.href = '/logout'
}

function createZoom() {
    fetch('/api/zooms', {method: 'POST'})
        .then(response => response.json())
        .then(data => location.href = `/${data.zoom_id}`)
        .catch(err => {
            console.log(err)
            alert('loi roi, doc log di')
        })
}