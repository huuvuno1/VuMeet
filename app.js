const express =require('express');
const routerConfig = require('./routers/index.router');
const app = express()
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json())
routerConfig(app)

server.listen(3000, () => {
    console.log('server is running on port 3000')
})