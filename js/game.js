'use strict';
var elImg = document.querySelector('.status')
var elMines = document.querySelector('.mine-count')

var MINE = '💣';
var FLAG = '🚩';
var EMPTY = ' ';
var gBoard;
var gclicks = 0;
var ghintIsOn = false;
var gUsedHints = 0;
var gCurrHint;

var gfirstClick = false
var gLevel = {
    ROWSIZE: 4,
    COLUMNSIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    // lives: 3,
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
            gLevel.ROWSIZE = 8;
            gLevel.COLUMNSIZE = 8;
            gLevel.MINES = 12;
            break;
        case (3):
            gLevel.ROWSIZE = 12;
            gLevel.COLUMNSIZE = 12;
            gLevel.MINES = 30;
            break;
        default:
            gLevel.ROWSIZE = 4;
            gLevel.COLUMNSIZE = 4;
            gLevel.MINES = 2;
    }

    restart();
}

function restart() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        // lives: 3,
        secsPassed: 0
    }
    clearInterval(gTimeInterval)
    gclicks = 0;
    gUsedHints = 0;
    gfirstClick = false;
    revealHints();
    init()
}

function init() {
    elImg.src = "img/duringGame.png";
    gBoard = buildBoard();
    printMat(gBoard, '.board-container');
    disableMenu();
    gGame.markedCount = gLevel.MINES;
    elMines.innerText = gGame.markedCount
    elTime.innerText = '000'
}

function startGame() {
    setMines();
    setMinesNegsCount(gBoard);
}

function setMines() {
    var mine = gLevel.MINES;
    while (mine > 0) {
        var cell = getRandomCell();
        var idx = cell.i
        var jdx = cell.j

        if (gBoard[idx][jdx].isShown) continue
        if (gBoard[idx][jdx].isMine) getRandomCell();
        else {
            gBoard[idx][jdx].isMine = true;
            gBoard[idx][jdx].value = MINE;
            mine--
        }
    }
}


function cellClicked(ev, elemnt, i, j) {

    var cellLocation = { i, j }

    if (!gfirstClick) {
        gGame.isOn = true;
        if (ev.button === 0 && !ghintIsOn) {
            gTimeInterval = setInterval(timeCounter, 1000)
            renderCell(cellLocation, gBoard[i][j].value, true)
            startGame()
            gfirstClick = true;
        }
    }

    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return

    if (ev.button === 0) {
        if (gBoard[i][j].isMarked) return

        if (ghintIsOn) {
            revealNeighbors(i, j)
            setTimeout(function () {
                hideNeighbors(i, j)
                hideHints(gCurrHint)
            }, 1000)
            ghintIsOn = false
            return
        }
        else gBoard[i][j].isShown = true;

        gGame.shownCount++
        if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) markNeighbors(i, j)
        renderCell(cellLocation, gBoard[i][j].value, true)
        if (gBoard[i][j].isMine) {
            gGame.isOn = false;
            gameOver(0)
        }
    }

    if (ev.button === 2) {
        if (gBoard[i][j].isMarked) {
            gBoard[i][j].isMarked = false;
            gGame.markedCount++
            renderCell(cellLocation, EMPTY, false)
        }
        else {
            if (!gfirstClick && gUsedHints !== 0) {
                renderCell(cellLocation, gBoard[i][j].value, false)
                startGame()
                gfirstClick = true;
            }
            gBoard[i][j].isMarked = true;
            gGame.markedCount--
            renderCell(cellLocation, FLAG, false);
        }
    }
    elMines.innerText = gGame.markedCount
    if (gGame.isOn) gclicks++
    if (gGame.shownCount === gLevel.ROWSIZE * gLevel.COLUMNSIZE - gLevel.MINES && gGame.isOn) gameOver(1);
}


function gameOver(status) {
    var elImg = document.querySelector('.status')
    clearInterval(gTimeInterval)

    if (status === 0) elImg.src = "img/gameOver.png"
    else elImg.src = "img/win.png"
}

function useHint(element) {
    ghintIsOn = true;
    gCurrHint = element
    gCurrHint.className += ' used-hint'
}

function hideHints(element) {
    for (var i = 1; i <= 3; i++) {
        var currHint = 'hint' + (i) + ' used-hint';
        if (element.className === (currHint)) {
            document.querySelector('.hint' + i).style.display = 'none'
            break;
        }
    }
    gUsedHints++
}