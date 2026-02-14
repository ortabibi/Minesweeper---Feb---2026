'use strict'
const MINE = '&#128163;'
const FLAG = '&#9873;'
const NORMAL = '&#128512;'
const SAD = '&#128534;'
const WIN = '&#128526;'


const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

const gLevel = {
    SIZE: 4,
    MINES: 3
}

var gBoard
var firstClick = false
var firstI
var firstJ


function onInit() {
    resetGame()
    gGame.isOn = true
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    const boardSize = gLevel.SIZE
    const board = []

    for (var i = 0; i < boardSize; i++) {
        board.push([])

        for (var j = 0; j < boardSize; j++) {
            board[i][j] = {
                minesAroundCount: 4,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    // board[2][3].isMine = true
    // board[0][1].isMine = true
    return board
}

function setMinesNegsCount(rowIdx, colIdx, board) {
    var neighborsCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (board[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}

function renderBoard(board) {
    var strHTML = ''

    for (let i = 0; i < board.length; i++) {
        strHTML += `<tr>`

        for (let j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            var cellContent = ''
            const className = `cell cell-${i}-${j}`

            if (cell.isRevealed) {
                if (cell.isMine) {
                    cellContent = MINE
                } else {
                    cellContent = cell.minesAroundCount
                }
            }
            if (cell.isMarked) {
                cellContent = FLAG
            }
            strHTML += `<td onclick="onCellClicked(this, ${i}, ${j})" 
            class="${className}">
            ${cellContent}
            </td>`
        }
        strHTML += `</tr>`
    }
    const elContainer = document.querySelector('.board-container')
    elContainer.innerHTML = strHTML

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.addEventListener('contextmenu', (event) => {
                onCellMarked(event, elCell, i, j)
            })
        }
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isRevealed) return
    if (gBoard[i][j].isMarked) return

    if (!firstClick) {
        firstClick = true
        firstI = i
        firstJ = j
        addRandomMine(gBoard, gLevel.MINES)
        setMinesNegsCountForBoard(gBoard)
    }

    gBoard[i][j].isRevealed = true

    if (gBoard[i][j].isMine) {
        updateLives(1)
        gBoard[i][j].isRevealed = false

        if (gGame.lives === 0) {
            document.querySelector('.reset').innerHTML = SAD
            console.log('game over!')
            gGame.isOn = false
            return
        }
    }

    renderBoard(gBoard)
    checkGameOver()
}

function onCellMarked(event, elCell, i, j) {
    if (!gGame.isOn) return
    event.preventDefault()
    if (event.button === 2) {
        if (gBoard[i][j].isRevealed) return
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked

    }
    renderBoard(gBoard)
    checkGameOver()
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isRevealed && !cell.isMine) return
        }
    }
    gGame.isOn = false
    document.querySelector('.reset').innerHTML = WIN
    console.log('you win!')
}

function expandReveal(board, elCell, i, j) {

}

function resetGame() {
    console.log('the game has restarted');
    document.querySelector('.reset').innerHTML = NORMAL
    firstI = null
    firstJ = null
    firstClick = false
    document.querySelector('.lives span').innerHTML = 3
    gGame.lives = 3
}
