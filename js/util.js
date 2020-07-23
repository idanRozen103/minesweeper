'use strict';

var gTimeInterval;
var elTime = document.querySelector('.timer')

//exclusive:
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function getRandomCell() {
    var idx = getRandomInt(1, gBoard.length)
    var jdx = getRandomInt(1, gBoard[0].length)

    var randCell = { i: idx, j: jdx }
    return randCell;
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


function setMinesNegsCount(board) {
    var currCellNeighbors;
    var board = gBoard;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine === true) continue;
            currCellNeighbors = countNeighbors(i, j, board);

            board[i][j].minesAroundCount = currCellNeighbors;
            board[i][j].value = (currCellNeighbors === 0) ? EMPTY : currCellNeighbors;
        }
    }
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j].isMine === true) neighborsSum++;
        }
    }
    return neighborsSum;
}

function printMat(mat, selector) {
    var strHTML = `<table border="1"><tbody>`;
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < mat[0].length; j++) {
            var className = `"cell cell-${i}-${j}"`;
            strHTML += `<td class=${className} onclick="cellClicked(event, this, ${i}, ${j})" 
            oncontextmenu="cellClicked(event, this, ${i}, ${j})">
             </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


function disableMenu() {
    var elCells = document.querySelectorAll('td');
    for (var i = 0; i < elCells.length; i++) {
        var cell = elCells[i];
        cell.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    }
}


function renderCell(location, value, isShown) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    if (isShown) elCell.classList.add('shown')
    else elCell.classList.remove('shown')
    elCell.innerHTML = value;
}


function markNeighbors(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var location = { i, j }
            if (gBoard[i][j].isMarked) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true
            gGame.shownCount++
            renderCell(location, gBoard[i][j].value, true)
        }
    }
}

function timeCounter() {
    gGame.secsPassed++
    elTime.innerText = (gGame.secsPassed <= 9 ? "00" + gGame.secsPassed :
        (gGame.secsPassed > 99 ? gGame.secsPassed : "0" + gGame.secsPassed))
    if (gGame === 999) clearInterval(gTimeInterval)
}

function revealNeighbors(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var location = { i, j }
            if (gBoard[i][j].isShown) continue;

            renderCell(location, gBoard[i][j].value, true)
        }
    }
}

function hideNeighbors(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown) continue
            var location = { i, j }
            if (gBoard[i][j].isMarked) renderCell(location, FLAG, false)

            else renderCell(location, EMPTY, false)
        }
    }
}

function revealHints() {
    for (var i = 1; i <= 3; i++) {
        document.querySelector('.hint' + i).style.display = 'inline'
        document.querySelector('.hint' + i).classList.remove('used-hint')

    }
}