const socket = io()


function createCanvas(width, height, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.style.width= `${width}px`;
    canvas.style.height=`${height}px`;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    if (set2dTransform) {
      canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return canvas;
}
const {username, roomName} = Qs.parse(location.search, {ignoreQueryPrefix : true})

let xo = ""
let ox = ""

socket.emit('join', {username, roomName}, (error) =>{
    if(error) console.log(error)
})

let canMove = false

socket.on('assign', (XO)=>{
    if(!xo){
        console.log(XO)
        xo = XO
        ox = xo == 'X' ? 'O' :'X'
        if(xo == 'X') canMove = true
    }

})
// x -> t f t
// o -> f t f

const W = 450

const canvas = createCanvas(W , W , true)
const ctx = canvas.getContext('2d')
document.body.appendChild(canvas)
canvas.id ='board'


const SQ = 150
let game = true
let N = 3

const board = []
for(let i =0; i< SQ ; ++i) {
    board.push([])
    for(let j =0; j< SQ; ++j) {
        board[i].push(" ")
    }
}


const drawSquare = (x, y )=>{
    ctx.strokeRect(x, y , SQ, SQ)
}


const drawBoard = ()=>{
    ctx.clearRect(0,0, W, W)
    let y =0;
    while(y < SQ){
        let x =0;
        while(x < SQ){
            board[y][x] = ""
            drawSquare(x*SQ , y*SQ)
            x++
        }
        y++
    }
}
drawBoard()

const leftGap =SQ/10
const topGap = SQ/10

let drawxo = (x, y, val)=>{
    if(val == 'X'){
        ctx.fillStyle = 'red'
        board[y][x] = 'X'
        ctx.fillRect(x*SQ, y*SQ, SQ, SQ)
    }else{
        ctx.fillStyle ='blue'
        board[y][x] = 'O'
        ctx.fillRect(x*SQ, y*SQ, SQ, SQ)
    }
}
let moves = 0

window.addEventListener('mousedown', (ev)=>{
    if(game && canMove){
        let x= Math.floor((ev.x-canvas.offsetLeft)/SQ);
        let y= Math.floor((ev.y- canvas.offsetTop)/SQ);
    
        let coords = {x, y, xo}
        drawxo(x, y, xo)
        moves++
        winCheck()
        socket.emit('move', coords )
        canMove = !canMove
        console.log(canMove)
    }
})


socket.on('move',  (val)=>{
    moves++
    drawxo(val.x, val.y, val.xo)
    canMove = !canMove

})
let players = 1

socket.on('newPlayerJoined', ()=>{
    players++
    drawBoard()
    game = true
    if(xo == 'X') canMove = true
    else canMove = false
})

// winning logic

const winCheck = ()=>{
    if(moves >=5){
        let winner = checkWinner()
        if(winner){
            game = false
            socket.emit('winner', winner)
        }
    }
}

socket.on('winner', (winner)=>{
    console.log(winner)
})

const checkWinner = ()=>{
    let champ = checkwinner(xo)
    if(!champ) champ = checkwinner(ox)

    return champ
}

let checkwinner = (val) =>{
    for(let i =0; i< N ; ++i) {
        let cnt =0;
        for(let j =0; j< N ; ++j) {
            if(board[i][j] != val) break;
            cnt++;
        }
        if(cnt == 3) return val
    }
    for(let i =0; i< N ; ++i) {
        let cnt =0;
        for(let j =0; j< N ; ++j) {
            if(board[j][i] != val) break;
            cnt++;
        }
        if(cnt == 3) return val
    }

    let cntd =0 , cntad = 0

    for(let i = 0; i< N ; ++i){
        for(let j =0; j< N ; ++j){
            if(i == j && board[i][j] == val) cntd++
            if(i +j == N-1 && board[i][j] == val) cntad++; 
        }
    }

    if(cntd == 3 || cntad == 3) return val

    return ""
}
socket.on('roomData' , (roomData)=>{
    if(players == 2 && roomData.participants.length == 1) {
        console.log(`Winner is ${xo}`)
        game = false
    }
})


