'use strict'
const MINE = '&#128163;'

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}

const gLevel = {
    SIZE: 4,
    MINES: 2
}

var gBoard

function onInit() {

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

    board[2][3].isMine = true
    board[0][1].isMine = true
    // addRandomMine(board, gLevel.MINES)
    setMinesNegsCountForBoard(board)
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
            strHTML += `<td onclick="onCellClicked(this, ${i}, ${j})" 
            class="${className}">
            ${cellContent}
            </td>`
        }
        strHTML += `</tr>`
    }
    const elContainer = document.querySelector('.board-container')
    elContainer.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    gBoard[i][j].isRevealed = true
    renderBoard(gBoard)
}

function onCellMarked(elCell, i, j) {

}

function checkGameOver() {

}

function expandReveal(board, elCell, i, j) {

}
