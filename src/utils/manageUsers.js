'use strict'
const DB = new Map()
// new Map<Room , set<UserName>>() // for now
let {User} = require('../models/user')
let userDB = new Map() // just to implement the disconnect 
let xoMap = new Map()

// new Map<userName, User>>

const addUserToRoom = (user, room, id) =>{
    room = room.trim().toLowerCase()
    user = user.trim()
    console.log(id)

    if(!room || !user) return {'error' : 'UserName or RoomName is empty'}


    if(DB.has(room) &&  DB.get(room).has(user)) return {'error' : 'User with same name already present in chat'}


    if(!DB.has(room)) {
        DB.set(room, new Set())
        xoMap.set(room, [])
    }


    let sz = [...DB.get(room)].length 
    
    if(sz == 2 ) return {'error' : 'Room full', val : null}

    DB.get(room).add(user)

    let v= ""
    
    
    if(xoMap.get(room).includes('X')) {
        v= 'O'
        if(!xoMap.get(room).includes('O')) xoMap.get(room).push('O')
    }
    else if(xoMap.get(room).includes('O')) {
        v= 'X'
        if(!xoMap.get(room).includes('X')) xoMap.get(room).push('X')
    }
    else {
        if(xoMap.get(room).length == 0) {
            xoMap.get(room).push('X')
            v= 'X'
        }
    }
    if(!userDB.has(id)) userDB.set(id, new User(room, user, v) ) // one to one mapping
      
    
    return {'error' : null, val : v}
}

const getUserFromSocketId = (id) =>{
    return userDB.get(id)
}

const removeUserFromRoom = (id) =>{
    if(!userDB.get(id)) return {userName : null, roomname : null}
   let user = userDB.get(id)
   DB.get(user.roomName).delete(user.userName)
   userDB.delete(id)

   let len = xoMap.get(user.roomName).length

   
   if(len == 2){
       let q = user.xo == 'X' ? ['O'] : ['X']
       xoMap.set(user.roomName, q)
   }else if(len == 1){
       xoMap.set(user.roomName , [] )
   }

   return {userName : user.userName, roomName : user.roomName}
}

const getroomList = (user) =>{
    let roomList =[]
    DB.forEach(Room =>{
        if(Room.has(user)) roomList.push(Room)
    })
    
    return roomList   
}
const getAllUsers = (room) =>{
   if(room && DB.has(room)) return [...DB.get(room)]
}

module.exports = {
    addUserToRoom, removeUserFromRoom, getroomList, getAllUsers, getUserFromSocketId
}
