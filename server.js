const express = require('express')                                //modules and dependencies
const app = express()
const http = require('http').Server(app)                         //supply app to the http server
const io = require('socket.io')(http)                            //passing http to socket.io
const port = process.env.PORT || 3000                            //setting to any port available or 3000 port

app.use(express.static(__dirname + "/public"))                  //static files to load 
let clients = 0                                                   //no clients initially

io.on('connection', function (socket) {                         //run when the connection between front and back end is made            
    socket.on("NewClient", function () {
        if (clients < 2) {                                     //check if there is one client then create peer
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')                        //else send the session active message
        clients++;
    })
   
    socket.on('Offer', SendOffer)                            //if offer coming from frontend, send to backend
    socket.on('Answer', SendAnswer)                         //if answer is coming, send to backend
    socket.on('disconnect', Disconnect)
})

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer) {                              //send offer to the other user
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}
http.listen(port, () => console.log(`Active on ${port} port`))      //server to listen to the port
