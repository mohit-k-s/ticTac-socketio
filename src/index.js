const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const colors = require('colors')
const {getAllUsers, addUserToRoom, getroomList, removeUserFromRoom, getUserFromSocketId} =require('./utils/manageUsers')


const PORT = process.env.PORT || 5000
const app = express()


const server = http.createServer(app)

const io = socketio(server)

const publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir))




io.on('connection' , (socket)=>{
    
    console.log('new User joined'.gray)


    socket.on('join', (options, cb)=>{
        console.log(options)
        socket.join(options.roomName)
        let {error, val} = addUserToRoom(options.username, options.roomName, socket.id)
        console.log(val)
        if(error) return cb(error)

        io.to(options.roomName).emit('assign', val)

        io.to(options.roomName).emit('roomData', {
            roomName : options.roomName,
            participants  : getAllUsers(options.roomName)
        })
        socket.broadcast.to(options.roomName).emit('newPlayerJoined')
        

        cb()
    })
    socket.on('disconnect', () =>{
        let {userName, roomName} = removeUserFromRoom(socket.id)
       
        io.to(roomName).emit('roomData', {
         roomName : roomName,
         participants  : getAllUsers(roomName)
         })
     })

    

    socket.on('move', (val)=>{
        let user = getUserFromSocketId(socket.id)
        socket.broadcast.to(user.roomName).emit('move', val)
    })


    socket.on('winner', (winner)=>{
        io.emit('winner', winner)
    })

})


server.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`)
})