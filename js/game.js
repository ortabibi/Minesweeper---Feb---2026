'use strict'
const MINE = '&#128163;'
const FLAG = '&#9873;'
const NORMAL = '&#128512;'
const SAD = '&#128534;'
const WIN = '&#128526;'
const FIRE = '&#128293;'

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hints: 3
}

const gLevel = {
    SIZE: 4,
    MINES: 3
}

const gUndoStack = []

var gBoard
var firstClick = false
var firstI
var firstJ
var gIntervalId
var gStartTime
var hintClicked = false
var megaHintClicked = false
var isBlack = false
var firstMegaI = null
var firstMegaJ = null


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
                isMarked: false,
                isFire: false
            }
        }
    }

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
            const className = `cell cell-${i}-${j}${cell.isRevealed ? ' on' : ''}`

            if (cell.isRevealed) {
                if (cell.isMine) {
                    cellContent = MINE
                } else {
                    cellContent = cell.minesAroundCount
                    if (cell.minesAroundCount === 0) {
                        cellContent = ''
                    }
                }
            }
            if (cell.isMarked) {
                cellContent = FLAG
            } else if (cell.isFire) {
                cellContent = FIRE
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
    gUndoStack.push({ board: copyBoard(), game: copyGame() })

    if (!gGame.isOn) return
    if (gBoard[i][j].isRevealed) return
    if (gBoard[i][j].isMarked) return
    elCell.classList.add('on')

    if (hintClicked) {
        console.log('entered');

        getHints(gBoard, i, j)
        return
    }

    if (megaHintClicked) {
        if (firstMegaI === null) {
            firstMegaI = i
            firstMegaJ = j
        } else {
            console.log(i);
            console.log(j);

            getMegaHint(gBoard, firstMegaI, i, firstMegaJ, j)

            firstMegaI = null
            firstMegaJ = null
            megaHintClicked = false
        }
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
            // console.log(elCell)
            expandReveal(gBoard, i, j)
        } else {
            // console.log(elCell)
            gBoard[i][j].isRevealed = true
            if (gBoard[i][j].isRevealed) gGame.revealedCount++
        }
    }

    checkGameOver()
    renderBoard(gBoard)
}

function onCellMarked(event, elCell, i, j) {
    gUndoStack.push({ board: copyBoard(), game: copyGame() })

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
    const bestTime = gGame.secsPassed
    console.log(bestTime)
    const currScore = localStorage.getItem("bestScore")
    console.log(currScore);

    if (currScore === null || bestTime < +currScore) {
        console.log('hi');

        localStorage.setItem("bestScore", bestTime)

        const elTime = document.querySelector('.result span')
        elTime.innerHTML = bestTime
    }

    gIntervalId = null
}

function expandReveal(board, rowIdx, colIdx,) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isRevealed) continue
            var cell = board[i][j]
            cell.isRevealed = true
            if (cell.minesAroundCount === 0) {
                expandReveal(board, i, j)
            }
        }
    }
}

function getUndoButton() {
    if (gUndoStack.length === 0) return
    var lastPlay = gUndoStack.pop()
    gBoard = lastPlay.board
    gGame = lastPlay.game

document.querySelector('.lives span').innerHTML = gGame.lives
document.querySelector('.flags').innerHTML = gLevel.MINES

    renderBoard(gBoard)
}

function copyBoard() {
    const boardSize = gLevel.SIZE
    const copyBoard = []

    for (var i = 0; i < boardSize; i++) {
        copyBoard.push([])

        for (var j = 0; j < boardSize; j++) {
            copyBoard[i][j] = {
                minesAroundCount: gBoard[i][j].minesAroundCount,
                isRevealed: gBoard[i][j].isRevealed,
                isMine: gBoard[i][j].isMine,
                isMarked: gBoard[i][j].isMarked,
                isFire: gBoard[i][j].isFire
            }
        }
    }

    return copyBoard
}

function copyGame() {
    return {
        isOn: gGame.isOn,
        revealedCount: gGame.revealedCount,
        markedCount: gGame.markedCount,
        lives: gGame.lives,
        hints: gGame.hints
    }
}

function getHints(board, i, j) {
    if (!hintClicked) return

    gGame.hints--
    const elButtonSpan = document.querySelector('.hint-btn span')
    elButtonSpan.innerHTML = gGame.hints

    var hintArray = getHintsCells(board, i, j)
    // renderBoard(board)

    setTimeout(() => {
        for (var k = 0; k < hintArray.length; k++) {
            let hint = hintArray[k]
            board[hint.i][hint.j].isRevealed = false
        }
        const elButton = document.querySelector('.hint-btn')
        elButton.classList.remove('active')
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
            // if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isRevealed) continue
            var cell = board[i][j]
            cell.isRevealed = true
            hints.push({ i, j })
        }
    }
    renderBoard(board)
    return hints
}

function onHintButtonClicked() {
    if (!firstClick) return
    if (gGame.hints === 0) return
    hintClicked = true

    const elButton = document.querySelector('.hint-btn')
    elButton.classList.add('active')

}

function getMineExterminator() {
    if (!firstClick) return

    var count = 0
    while (count < 3) {
        var mineCell = getMinesIdx(gBoard)
        gBoard[mineCell.i][mineCell.j].isMine = false
        gBoard[mineCell.i][mineCell.j].isFire = true
        gBoard[mineCell.i][mineCell.j].isRevealed = true
        count++
    }
    setMinesNegsCountForBoard(gBoard)
    renderBoard(gBoard)

    const elFire = document.querySelector('.mine-destroyer')
    elFire.disabled = true
}

function getMinesIdx(board) {
    var minesIdx = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine) {
                minesIdx.push({ i, j })
            }
        }
    }

    const idx = getRandomIntInclusive(0, minesIdx.length - 1)
    const randomCell = minesIdx[idx]
    minesIdx.splice(idx, 1)
    return randomCell
}

function onMegaHintButtonClicked() {
    megaHintClicked = true
}

function getMegaHint(board, rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    var megaHintCells = []
    for (let i = rowIdxStart; i <= rowIdxEnd; i++) {
        for (let j = colIdxStart; j <= colIdxEnd; j++) {
            // if (board[i][j].isRevealed) continue
            if (board[i][j].isRevealed && !(rowIdxStart === i && colIdxStart === j)) continue

            var cell = board[i][j]
            cell.isRevealed = true
            megaHintCells.push({ i, j })
            console.log(i,j);

        }
    }

    renderBoard(board)

    setTimeout(() => {
        for (let i = 0; i < megaHintCells.length; i++) {
            const hintCell = megaHintCells[i]
            const cell = board[hintCell.i][hintCell.j]
            cell.isRevealed = false
        }
        renderBoard(board)
    }, 2000);
}