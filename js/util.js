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
    mines.splice(idx, 1)
    return randomCell
}

// function addRandomMines(board, num) {
//     for (var i = 0; i < num; i++) {
//         var emptyCell = getEmptyCell(board)
//         if (emptyCell.i === firstI && emptyCell.j === firstJ) {
//             board[emptyCell.i][emptyCell.j].isMine = false
//         }
//         if (emptyCell.i !== firstI || emptyCell.j !== firstJ) {
//             board[emptyCell.i][emptyCell.j].isMine = true
//         }
//     }
// }

function addRandomMines(board, num) {
    var count = 0
    while (count < num) {
        var emptyCell = getEmptyCell(board)
        if (!(emptyCell.i === firstI && emptyCell.j === firstJ)
            && !board[emptyCell.i][emptyCell.j].isMine) {
            board[emptyCell.i][emptyCell.j].isMine = true
            count++
        }
    }
}

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
        gGame.secsPassed = seconds
    }, 10);
}

function resetGame() {
    // console.log('the game has restarted');
    document.querySelector('.reset').innerHTML = NORMAL
    document.querySelector('.stoper').innerHTML = '00:00'
    document.querySelector('.lives span').innerHTML = 3
    document.querySelector('.hint-btn span').innerText = 3
    document.querySelector('.mine-destroyer').disabled = false
    firstI = null
    firstJ = null
    firstClick = false
    gGame.lives = 3
    clearInterval(gIntervalId)
    gIntervalId = null
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.hints = 3
    gUndoStack.length = 0
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    document.querySelector('.flags').innerHTML = gLevel.MINES
    onInit()
}

function getDarkMode() {
    var elColor = document.querySelector('.dark-btn')

    if (!isBlack) {
        document.querySelector('body').style.backgroundColor = 'black'
        document.querySelector('body').style.color = 'white'
        elColor.innerHTML = 'on'
        isBlack = true
    } else {
        document.querySelector('body').style.backgroundColor = 'lightcyan'
        document.querySelector('body').style.color = 'black'
        elColor.innerHTML = 'off'
        isBlack = false
    }
}