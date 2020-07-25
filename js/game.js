'use strict';
var elImg = document.querySelector('.status')
var elMines = document.querySelector('.mine-count')
var gElSafeCell = document.querySelector('.safe-cell span')


var MINE = '💣';
var FLAG = '🚩';
var EMPTY = ' ';
var gBoard;
var gclicks = 0;
var ghintIsOn = false;
var gUsedHints = 0;
var gSafeCellsLeft = 3;
var gCurrHint;

var gfirstClick = true;

var gLevel = {
    ROWSIZE: 4,
    COLUMNSIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    livesLeft: 3,
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
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        livesLeft: 3,
        secsPassed: 0
    }
    clearInterval(gTimeInterval)
    gclicks = 0;
    gUsedHints = 0;
    gfirstClick = true;
    gSafeCellsLeft = 3;
    gElSafeCell.innerText = gSafeCellsLeft;
    revealHints();
    restartLives();
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
    gTimeInterval = setInterval(timeCounter, 1000)
    gfirstClick = false;
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
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return

    if (ev.button === 2) rightClicked(i, j)
    if (ev.button === 0) leftClicked(i, j)

    if (gGame.shownCount === gLevel.ROWSIZE * gLevel.COLUMNSIZE - gLevel.MINES) checkVictory();
}

function leftClicked(i, j) {
    var cellLocation = { i, j }
    if (gBoard[i][j].isMarked) return

    if (ghintIsOn) {
        useHint(i, j)
        return
    }
    gBoard[i][j].isShown = true;
    if (!gBoard[i][j].isMine) gGame.shownCount++

    if (gfirstClick) startGame();
    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) markNeighbors(i, j)

    renderCell(cellLocation, gBoard[i][j].value, true)
    if (gBoard[i][j].isMine) {
        if (gGame.livesLeft === 1) gameOver(0)
        else {
            usedLives()
            gGame.livesLeft--
        }
    }
}

function rightClicked(i, j) {
    var cellLocation = { i, j }

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount++
        renderCell(cellLocation, EMPTY, false)
    } else {
        gBoard[i][j].isMarked = true;
        gGame.markedCount--
        renderCell(cellLocation, FLAG, false);
    }
    elMines.innerText = gGame.markedCount
    if (gGame.markedCount === 0) checkFlagMineMatch()
}


function checkFlagMineMatch() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {

            if (!gBoard[i][j].isMine && gBoard[i][j].isMarked) return false
            if (gBoard[i][j].value === MINE && (!gBoard[i][j].isMarked)) return false
        }
    }
    gameOver(1)
}

function gameOver(status) {
    if (status === 1) {
        revealMines()
        revealAllCells()
        elImg.src = "img/hula-minion.png"
    }
    else {
        if (gGame.livesLeft !== 1) {
            usedLives();
            return
        } else {
            elImg.src = "img/lose.jpg"
        }
    }
    clearInterval(gTimeInterval)
    gGame.isOn = false;
}


function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].value !== MINE && !(gBoard[i][j].isShown)) return false;
        }
    }
    gameOver(1)
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var location = { i, j }
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                renderCell(location, FLAG, false)
            }
        }
    }
}

function revealAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var location = { i, j }

            if (gBoard[i][j].value !== MINE && !(gBoard[i][j].isShown)) {
                renderCell(location, gBoard[i][j].value, true)
            }
        }
    }
}

function hintClicked(element) {
    if (gfirstClick) return;
    if (!gGame.isOn) return
    ghintIsOn = true;
    gCurrHint = element
    gCurrHint.className += ' used-hint'
    gCurrHint.src = "img/idea1.png"
}

function useHint(i, j) {
    revealNeighbors(i, j)
    setTimeout(function () {
        hideNeighbors(i, j)
        gUsedHints++
        hideHints(gCurrHint)
    }, 1000)
    ghintIsOn = false
}

function hideHints(element) {
    for (var i = 1; i <= 3; i++) {
        var currHint = 'hint' + (i) + ' used-hint';
        if (element.className === (currHint)) {
            document.querySelector('.hint' + i).style.display = 'none';
            if (gUsedHints === 3) document.querySelector('.hints').style.cursor = 'default';
            break;
        }
    }
}

function usedLives() {
    document.querySelector(`.lives img:nth-child(${gGame.livesLeft})`).style.display = 'none'
}

function restartLives() {
    for (var i = 1; i <= 3; i++) {
        document.querySelector(`.lives img:nth-child(${i})`).style.display = 'inline'
    }
}

function useSafeCell() {
    if (!gGame.isOn) return
    if (gSafeCellsLeft === 0) return
    var randCell = getRandomCell()
    if (gBoard[randCell.i][randCell.j].isMine || gBoard[randCell.i][randCell.j].isShown) {
        useSafeCell()
        return
    }
    renderCell(randCell, gBoard[randCell.i][randCell.j].value, true)
    setTimeout(function () { renderCell(randCell, EMPTY, false) }, 1000)
    gSafeCellsLeft--
    document.querySelector('.safe-cell span').innerText = gSafeCellsLeft;
}