'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function setMinesNegsCountForBoard(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
        }
    }
}

function getEmptyCell(board) {
    var mines = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine === false) {
                mines.push({ i, j })
            }
        }
    }

    const idx = getRandomIntInclusive(0, mines.length - 1)
    const randomCell = mines[idx]
    return randomCell
}

function addRandomMine(board, num) {
    for (var i = 0; i < num; i++) {
        var emptyCell = getEmptyCell(board)
        if (emptyCell.i === firstI && emptyCell.j === firstJ) {
            board[emptyCell.i][emptyCell.j].isMine = false
        } else {
            board[emptyCell.i][emptyCell.j].isMine = true
        }
    }
}

