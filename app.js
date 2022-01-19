require('dotenv').config()
const express =require('express');
const fs = require('fs');
const routerConfig = require('./routers/index.router');
const cookieParser = require('cookie-parser');
const socketConfig = require('./socket.io/index.socket');
const app = express()

const privateKey  = fs.readFileSync('./ssl/private_key.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/certificate.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const server = require("http").Server(app);
const serverSsl = require("https").Server(credentials, app);
const io = require("socket.io")(server);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(cookieParser());

routerConfig(app)
socketConfig(io)

server.listen(3000, () => {
    console.log('server is running on port 3000')
})

serverSsl.listen(3443, () => {
    console.log('server is running on port 443')
})