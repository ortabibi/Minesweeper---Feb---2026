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
    mines.splice(idx,1)
    return randomCell
}

function addRandomMines(board, num) {
    for (var i = 0; i < num; i++) {
        var emptyCell = getEmptyCell(board)
        if (emptyCell.i === firstI && emptyCell.j === firstJ) {
            board[emptyCell.i][emptyCell.j].isMine = false
        }
        if (emptyCell.i !== firstI || emptyCell.j !== firstJ) {
            board[emptyCell.i][emptyCell.j].isMine = true
        }
    }
}

// לתקן תבאג
function updateLives(diff) {
    gGame.lives -= diff

    const elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}

function startStoper() {
    gStartTime = Date.now();

    gIntervalId = setInterval(() => {
        const diff = Date.now() - gStartTime;

        const seconds = Math.floor(diff / 1000);
        const milliseconds = diff % 1000;

        const elStopper = document.querySelector('.stoper');
        elStopper.innerText = seconds + '.' + milliseconds;
    }, 10);
}

function resetGame() {
    console.log('the game has restarted');
    document.querySelector('.reset').innerHTML = NORMAL
    document.querySelector('.stoper').innerHTML = '00:00'
    firstI = null
    firstJ = null
    firstClick = false
    document.querySelector('.lives span').innerHTML = 3
    gGame.lives = 3
    clearInterval(gIntervalId)
    gIntervalId = null
    gGame.revealedCount = 0
    gGame.markedCount = 0
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    document.querySelector('.flags').innerHTML = gLevel.MINES
    onInit()
}