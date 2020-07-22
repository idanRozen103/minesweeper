'use strict';
var elImg = document.querySelector('.status')
var elMines = document.querySelector('.mine-count')


var MINE = '💣';
var FLAG = '🚩';
var EMPTY = ' ';
var gBoard;
var markedCells = []

var gLevel = {
    ROWSIZE: 4,
    COLUMNSIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function setLevel(matSize) {

    switch (matSize) {
        case (1):
            gLevel.ROWSIZE = 4;
            gLevel.COLUMNSIZE = 4;
            gLevel.MINES = 2;
            break;
        case (2):
            gLevel.ROWSIZE = 9;
            gLevel.COLUMNSIZE = 9;
            gLevel.MINES = 10;
            break;
        case (3):
            gLevel.ROWSIZE = 16;
            gLevel.COLUMNSIZE = 16;
            gLevel.MINES = 40;
            break;
        default:
            gLevel.ROWSIZE = 4;
            gLevel.COLUMNSIZE = 4;
            gLevel.MINES = 2;
    }
    restart();
}

function init() {
    elMines.innerText = gLevel.MINES;
    elImg.src = "img/duringGame.png";
    gBoard = buildBoard();
    setMines();
    setMinesNegsCount(gBoard);
    printMat(gBoard, '.board-container');
    disableMenu();
    gGame.isOn = true;

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.ROWSIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.COLUMNSIZE; j++) {
            board[i][j] = {
                value: EMPTY,
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board
}

function setMines() {
    var mine = gLevel.MINES;
    while (mine > 0) {
        var cell = getRandomCell();
        var idx = cell.i
        var jdx = cell.j

        if (gBoard[idx][jdx].isMine) getRandomCell();
        else {
            gBoard[idx][jdx].isMine = true;
            gBoard[idx][jdx].value = MINE;
            mine--
        }
    }
}


function cellClicked(ev, elemnt, i, j) {

    if (!gTimeInterval) timeCounter();


    if (!gGame.isOn) return

    if (gBoard[i][j].isShown) return


    var cellLocation = { i, j }

    if (ev.button === 2) {
        if (gBoard[i][j].isMarked) {
            gBoard[i][j].isMarked = false;
            elMines.innerText++;
            gGame.markedCount--
            renderCell(cellLocation, EMPTY, false)
        }
        else {
            gBoard[i][j].isMarked = true;
            elMines.innerText--;
            gGame.markedCount++
            renderCell(cellLocation, FLAG, false);
        }
    }

    if (ev.button === 0) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++
        if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) markNeighbors(i, j)
        renderCell(cellLocation, gBoard[i][j].value, true)
        if (gBoard[i][j].isMine) gameOver(0)
    }
    console.log(gGame);

}




function gameOver(status) {
    gGame.isOn = false;
    var elImg = document.querySelector('.status')
    if (status === 0) elImg.src = "img/gameOver.png"
    else elImg.src = "img/win.png"
    clearInterval(gTimeInterval)
}

function checkVictory() {
}

function restart() {
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    clearInterval(gTimeInterval)
    elTime.innerText = '000'
    init()
}