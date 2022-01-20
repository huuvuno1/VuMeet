require('dotenv').config()
const express =require('express');
const routerConfig = require('./routers/index.router');
const cookieParser = require('cookie-parser');
const socketConfig = require('./socket.io/index.socket');
const app = express()

const server = require("http").Server(app);
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