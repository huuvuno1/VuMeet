function handleCredentialResponse(response) {
  // console.log("Encoded JWT ID token: " + response.credential);

  fetch("/api/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: response.credential,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      location.reload();
    })
    .catch((err) => console.log(err));
}
window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      "190359929605-db8140sku5ogdcl8mfkjjueubo49st8g.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(
    document.getElementById("btnLoginWithGG"),
    { theme: "outline", size: "large" } // customization attributes
  );
  google.accounts.id.prompt(); // also display the One Tap dialog
};

function logout() {
  location.href = "/logout";
}

function createZoom() {
  fetch("/api/zooms", { method: "POST" })
    .then((response) => response.json())
    .then((data) => (location.href = `/${data.zoom_id}`))
    .catch((err) => {
      console.log(err);
      alert("Login đã bro ơi, bên trên góc phải màn hình á");
    });
}
