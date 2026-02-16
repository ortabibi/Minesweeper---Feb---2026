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
var gIntervalId
var gStartTime
var hintClicked = false



function onInit() {
    document.querySelector('.flags').innerHTML = gLevel.MINES
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

    if (hintClicked) {
        console.log('entered');
        
        getHints(gBoard, i, j)
        return
    }

    if (!firstClick) {
        startStoper()
        firstClick = true
        firstI = i
        firstJ = j
        addRandomMines(gBoard, gLevel.MINES)
        setMinesNegsCountForBoard(gBoard)
    }

    if (gBoard[i][j].isMine) {
        updateLives(1)
        gBoard[i][j].isRevealed = true
        renderBoard(gBoard)

        if (gGame.lives === 0) {
            clearInterval(gIntervalId)
            gIntervalId = null
            document.querySelector('.reset').innerHTML = SAD
            console.log('game over!')
            gGame.isOn = false
            return
        }
        setTimeout(() => {
            gBoard[i][j].isRevealed = false
            renderBoard(gBoard)
        }, 1000)

        return

    } else {
        if (gBoard[i][j].minesAroundCount === 0) {
            gBoard[i][j].isRevealed = true
            expandReveal(gBoard, i, j)
        } else {
            gBoard[i][j].isRevealed = true
            if (gBoard[i][j].isRevealed) gGame.revealedCount++
        }
    }

    renderBoard(gBoard)
    checkGameOver()
}

function onCellMarked(event, elCell, i, j) {
    const elFlag = document.querySelector('.flags')

    if (!gGame.isOn) return

    event.preventDefault()
    var minesLeft = gLevel.MINES - gGame.markedCount
    ///לשאול על אופציה שנייה///
    if (minesLeft === 0 && !gBoard[i][j].isMarked) return


    if (event.button === 2) {
        if (gBoard[i][j].isRevealed) return
        // gBoard[i][j].isMarked = !gBoard[i][j].isMarked

        if (gBoard[i][j].isMarked) {
            gBoard[i][j].isMarked = false
            gGame.markedCount--
        } else {
            gGame.markedCount++
            gBoard[i][j].isMarked = true
        }
    }
    elFlag.innerHTML = gLevel.MINES - gGame.markedCount
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
    clearInterval(gIntervalId)
    gIntervalId = null
}

function expandReveal(board, rowIdx, colIdx) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            // cell = board[i][j]
            // if (board[i][j].isMine || board[i][j].isMarked || board[i][j].isRevealed) continue

            board[i][j].isRevealed = true
        }
    }
}

function getHints(board, i, j) {
    if (!hintClicked) return
    hintClicked = true

    var hintArray = getHintsCells(board, i, j)
    // renderBoard(board)

    setTimeout(() => {
        for (var k = 0; k < hintArray.length; k++) {
            let hint = hintArray[k]
            board[hint.i][hint.j].isRevealed = false
        }
        renderBoard(board)
        hintClicked = false
    }, 1000);
}

function getHintsCells(board, rowIdx, colIdx) {
    var hints = []
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            cell.isRevealed = true
            hints.push({ i, j })
        }
    }
    renderBoard(board)
    return hints
}

function onHintButtonClicked() {
    hintClicked = true
}
