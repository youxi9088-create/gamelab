function placeWordsLeft(szWord, iStartRow, iStartCol, aGrid) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishID = iStartCol - szWord.length;

    if (iFinishID < 0) {
        return {success: false};
    }

    for (var j = iStartCol; j > iFinishID; j--) {
        if (aGrid[iStartRow] !== undefined && aGrid[iStartRow][j] !== undefined) {
            if (aGrid[iStartRow][j].getChar() === "" || szWord.charAt(iChar) === aGrid[iStartRow][j].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[iStartRow][j].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[iStartRow][j].getChar();
                }
                aListCell.push({r: iStartRow, c: j, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsRight(szWord, iStartRow, iStartCol, aGrid, iTotCol) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishID = iStartCol + szWord.length;

    if (iFinishID > iTotCol) {
        return {success: false};
    }

    for (var j = iStartCol; j < iFinishID; j++) {
        if (aGrid[iStartRow] !== undefined && aGrid[iStartRow][j] !== undefined) {
            if (aGrid[iStartRow][j].getChar() === "" || szWord.charAt(iChar) === aGrid[iStartRow][j].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[iStartRow][j].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[iStartRow][j].getChar();
                }
                aListCell.push({r: iStartRow, c: j, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsUp(szWord, iStartRow, iStartCol, aGrid) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishID = iStartRow - szWord.length;

    if (iFinishID < 0) {
        return {success: false};
    }

    for (var i = iStartRow; i > iFinishID; i--) {
        if (aGrid[i] !== undefined && aGrid[i][iStartCol] !== undefined) {
            if (aGrid[i][iStartCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iStartCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iStartCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iStartCol].getChar();
                }
                aListCell.push({r: i, c: iStartCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsDown(szWord, iStartRow, iStartCol, aGrid, iTotRow) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishID = iStartRow + szWord.length;

    if (iFinishID > iTotRow) {
        return {success: false};
    }

    for (var i = iStartRow; i < iFinishID; i++) {
        if (aGrid[i] !== undefined && aGrid[i][iStartCol] !== undefined) {
            if (aGrid[i][iStartCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iStartCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iStartCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iStartCol].getChar();
                }
                aListCell.push({r: i, c: iStartCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsUpLeft(szWord, iStartRow, iStartCol, aGrid) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishRowID = iStartRow - szWord.length;
    var iFinishColID = iStartCol - szWord.length;

    if (iFinishRowID < 0 && iFinishColID < 0) {
        return {success: false};
    }
    var iTmpCol = iStartCol;

    for (var i = iStartRow; i > iFinishRowID; i--) {
        if (aGrid[i] !== undefined && aGrid[i][iTmpCol] !== undefined) {
            if (aGrid[i][iTmpCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iTmpCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iTmpCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iTmpCol].getChar();
                }
                aListCell.push({r: i, c: iTmpCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                iTmpCol--;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsUpRight(szWord, iStartRow, iStartCol, aGrid, iTotCol) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishRowID = iStartRow - szWord.length;
    var iFinishColID = iStartCol + szWord.length;

    if (iFinishRowID < 0 && iFinishColID > iTotCol) {
        return {success: false};
    }
    var iTmpCol = iStartCol;

    for (var i = iStartRow; i > iFinishRowID; i--) {
        if (aGrid[i] !== undefined && aGrid[i][iTmpCol] !== undefined) {
            if (aGrid[i][iTmpCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iTmpCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iTmpCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iTmpCol].getChar();
                }
                aListCell.push({r: i, c: iTmpCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                iTmpCol++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsDownLeft(szWord, iStartRow, iStartCol, aGrid, iRowTot) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishRowID = iStartRow + szWord.length;
    var iFinishColID = iStartCol - szWord.length;

    if (iFinishRowID > iRowTot && iFinishColID < 0) {
        return {success: false};
    }
    var iTmpCol = iStartCol;

    for (var i = iStartRow; i < iFinishRowID; i++) {
        if (aGrid[i] !== undefined && aGrid[i][iTmpCol] !== undefined) {
            if (aGrid[i][iTmpCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iTmpCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iTmpCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iTmpCol].getChar();
                }
                aListCell.push({r: i, c: iTmpCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                iTmpCol--;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}

function placeWordsDownRight(szWord, iStartRow, iStartCol, aGrid, iTotRow, iTotCol) {
    var aListCell = new Array();
    var iChar = 0;
    var iWeight = 0;
    var bAlmostOneWord = false;
    var iFinishRowID = iStartRow + szWord.length;
    var iFinishColID = iStartCol + szWord.length;

    if (iFinishRowID > iTotRow && iFinishColID > iTotCol) {
        return {success: false};
    }
    var iTmpCol = iStartCol;

    for (var i = iStartRow; i < iFinishRowID; i++) {
        if (aGrid[i] !== undefined && aGrid[i][iTmpCol] !== undefined) {
            if (aGrid[i][iTmpCol].getChar() === "" || szWord.charAt(iChar) === aGrid[i][iTmpCol].getChar()) {
                var szCharCompare = "";
                if (szWord.charAt(iChar) !== aGrid[i][iTmpCol].getChar()) {
                    iWeight++;
                } else {
                    szCharCompare = aGrid[i][iTmpCol].getChar();
                }
                aListCell.push({r: i, c: iTmpCol, char: szWord.charAt(iChar), char_compare: szCharCompare});
                iChar++;
                iTmpCol++;
                if (szWord.length === iChar) {
                    bAlmostOneWord = true;
                }
            } else {
                return {success: false};
            }
        } else {
            return {success: false};
        }
    }
    return {list_cell: aListCell, weight: iWeight, success: bAlmostOneWord};
}