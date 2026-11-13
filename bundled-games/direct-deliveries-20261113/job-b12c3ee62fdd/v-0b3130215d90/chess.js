// Position-aware chess rules for standard legal play (without variants).
export const VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const PROMOTION_TYPES = ['q', 'r', 'b', 'n'];
const opposite = color => color === 'w' ? 'b' : 'w';
const inside = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8;

function emptyCastlingRights() {
    return { w: { k: false, q: false }, b: { k: false, q: false } };
}

function copyCastlingRights(rights) {
    const copy = emptyCastlingRights();
    for (const color of ['w', 'b']) {
        copy[color].k = Boolean(rights?.[color]?.k);
        copy[color].q = Boolean(rights?.[color]?.q);
    }
    return copy;
}

function copyPawnDoubleStepAvailability(availability) {
    return {
        w: availability?.w !== false,
        b: availability?.b !== false,
    };
}

function attachState(board, source = {}) {
    board.castlingRights = copyCastlingRights(source.castlingRights);
    board.pawnDoubleStepAvailable = copyPawnDoubleStepAvailability(source.pawnDoubleStepAvailable);
    board.enPassant = source.enPassant ? { ...source.enPassant } : null;
    board.halfmoveClock = Number.isInteger(source.halfmoveClock) ? source.halfmoveClock : 0;
    board.fullmoveNumber = Number.isInteger(source.fullmoveNumber) ? source.fullmoveNumber : 1;
    return board;
}

function cloneBoard(board) {
    const next = board.map(row => row.map(piece => piece ? { ...piece } : null));
    return attachState(next, board);
}

export function initialBoard() {
    const order = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    const board = Array.from({ length: 8 }, () => new Array(8).fill(null));
    for (let x = 0; x < 8; x++) {
        board[0][x] = { t: order[x], c: 'w' };
        board[1][x] = { t: 'p', c: 'w', hasMoved: false };
        board[6][x] = { t: 'p', c: 'b', hasMoved: false };
        board[7][x] = { t: order[x], c: 'b' };
    }
    board.castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
    board.pawnDoubleStepAvailable = { w: true, b: true };
    board.enPassant = null;
    board.halfmoveClock = 0;
    board.fullmoveNumber = 1;
    return board;
}

function pieceAttacksSquare(board, x, y, tx, ty) {
    const piece = board[y][x];
    if (!piece || (x === tx && y === ty)) return false;
    const dx = tx - x;
    const dy = ty - y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (piece.t === 'p') return ax === 1 && dy === (piece.c === 'w' ? 1 : -1);
    if (piece.t === 'n') return (ax === 1 && ay === 2) || (ax === 2 && ay === 1);
    if (piece.t === 'k') return Math.max(ax, ay) === 1;

    let sliding = false;
    if (piece.t === 'r') sliding = dx === 0 || dy === 0;
    else if (piece.t === 'b') sliding = ax === ay;
    else if (piece.t === 'q') sliding = dx === 0 || dy === 0 || ax === ay;
    if (!sliding) return false;

    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    let cx = x + stepX;
    let cy = y + stepY;
    while (cx !== tx || cy !== ty) {
        if (board[cy][cx]) return false;
        cx += stepX;
        cy += stepY;
    }
    return true;
}

function isSquareAttacked(board, x, y, byColor) {
    for (let sy = 0; sy < 8; sy++) {
        for (let sx = 0; sx < 8; sx++) {
            const piece = board[sy][sx];
            if (piece?.c === byColor && pieceAttacksSquare(board, sx, sy, x, y)) return true;
        }
    }
    return false;
}

function addCastleMoves(board, x, y, piece, moves) {
    const homeY = piece.c === 'w' ? 0 : 7;
    if (x !== 4 || y !== homeY || inCheck(board, piece.c)) return;
    const rights = board.castlingRights?.[piece.c];
    if (!rights) return;

    for (const side of ['k', 'q']) {
        if (!rights[side]) continue;
        const rookX = side === 'k' ? 7 : 0;
        const rook = board[homeY][rookX];
        if (rook?.t !== 'r' || rook.c !== piece.c) continue;
        const emptyFiles = side === 'k' ? [5, 6] : [1, 2, 3];
        if (emptyFiles.some(file => board[homeY][file])) continue;
        const kingPath = side === 'k' ? [5, 6] : [3, 2];
        const enemy = opposite(piece.c);
        let safePath = true;
        for (const file of kingPath) {
            const transitBoard = board.map(row => row.slice());
            transitBoard[homeY][x] = null;
            transitBoard[homeY][file] = { ...piece };
            if (isSquareAttacked(transitBoard, file, homeY, enemy)) {
                safePath = false;
                break;
            }
        }
        if (!safePath) continue;
        moves.push({ fx: x, fy: y, tx: side === 'k' ? 6 : 2, ty: homeY, castle: side });
    }
}

function pseudoMoves(board, x, y) {
    const piece = board[y][x];
    if (!piece) return [];
    const moves = [];
    const add = (tx, ty) => {
        if (!inside(tx, ty)) return false;
        const target = board[ty][tx];
        if (target?.c === piece.c || target?.t === 'k') return false;
        moves.push({ fx: x, fy: y, tx, ty });
        return !target;
    };
    const slide = directions => {
        for (const [dx, dy] of directions) {
            let distance = 1;
            while (add(x + dx * distance, y + dy * distance)) distance++;
        }
    };
    const straight = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const diagonal = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

    if (piece.t === 'p') {
        const direction = piece.c === 'w' ? 1 : -1;
        const oneAhead = y + direction;
        const twoAhead = y + direction * 2;
        const homeRank = piece.c === 'w' ? 1 : 6;
        const canDoubleStep = board.pawnDoubleStepAvailable?.[piece.c] !== false
            && piece.hasMoved === false
            && y === homeRank;
        const addPawnMove = (tx, ty, special = {}) => {
            if (ty === 0 || ty === 7) {
                for (const promoteTo of PROMOTION_TYPES) moves.push({ fx: x, fy: y, tx, ty, promoteTo, ...special });
            } else {
                moves.push({ fx: x, fy: y, tx, ty, ...special });
            }
        };
        if (inside(x, oneAhead) && !board[oneAhead][x]) {
            addPawnMove(x, oneAhead);
            if (canDoubleStep && inside(x, twoAhead) && !board[twoAhead][x]) {
                addPawnMove(x, twoAhead);
            }
        }
        for (const dx of [-1, 1]) {
            const tx = x + dx;
            if (!inside(tx, oneAhead)) continue;
            const target = board[oneAhead][tx];
            if (target && target.c !== piece.c && target.t !== 'k') addPawnMove(tx, oneAhead);
            const ep = board.enPassant;
            const capturedPawn = board[y]?.[tx];
            if (ep?.x === tx && ep.y === oneAhead && !target && capturedPawn?.t === 'p' && capturedPawn.c !== piece.c) {
                addPawnMove(tx, oneAhead, { enPassant: true });
            }
        }
    } else if (piece.t === 'n') {
        for (const [dx, dy] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
            add(x + dx, y + dy);
        }
    } else if (piece.t === 'k') {
        for (const [dx, dy] of [...straight, ...diagonal]) add(x + dx, y + dy);
        addCastleMoves(board, x, y, piece, moves);
    } else if (piece.t === 'r') {
        slide(straight);
    } else if (piece.t === 'b') {
        slide(diagonal);
    } else {
        slide([...straight, ...diagonal]);
    }
    return moves;
}

function clearRookRight(rights, color, x, y) {
    const homeY = color === 'w' ? 0 : 7;
    if (y !== homeY) return;
    if (x === 0) rights[color].q = false;
    if (x === 7) rights[color].k = false;
}

export function applyMove(board, move) {
    const next = cloneBoard(board);
    const source = next[move.fy]?.[move.fx];
    if (!source) return next;
    const piece = { ...source };
    const captured = move.enPassant ? next[move.fy]?.[move.tx] : next[move.ty]?.[move.tx];
    const rights = next.castlingRights;

    if (piece.t === 'k') {
        rights[piece.c].k = false;
        rights[piece.c].q = false;
    } else if (piece.t === 'r') {
        clearRookRight(rights, piece.c, move.fx, move.fy);
    }
    if (captured?.t === 'r') {
        const capturedX = move.enPassant ? move.tx : move.tx;
        const capturedY = move.enPassant ? move.fy : move.ty;
        clearRookRight(rights, captured.c, capturedX, capturedY);
    }

    next.enPassant = null;
    if (piece.t === 'p') {
        piece.hasMoved = true;
        next.pawnDoubleStepAvailable[piece.c] = false;
        if (Math.abs(move.ty - move.fy) === 2) {
            next.enPassant = { x: move.fx, y: (move.fy + move.ty) / 2 };
        }
    }
    next[move.fy][move.fx] = null;
    if (move.enPassant) next[move.fy][move.tx] = null;
    next[move.ty][move.tx] = piece;

    if (move.castle) {
        const rookFromX = move.castle === 'k' ? 7 : 0;
        const rookToX = move.castle === 'k' ? 5 : 3;
        const rook = next[move.fy][rookFromX];
        if (rook) {
            next[move.fy][rookFromX] = null;
            next[move.fy][rookToX] = rook;
        }
    }
    if (piece.t === 'p' && (move.ty === 7 || move.ty === 0)) {
        next[move.ty][move.tx] = { t: PROMOTION_TYPES.includes(move.promoteTo) ? move.promoteTo : 'q', c: piece.c };
    }

    next.halfmoveClock = piece.t === 'p' || captured ? 0 : next.halfmoveClock + 1;
    if (piece.c === 'b') next.fullmoveNumber += 1;
    return next;
}

function kingSquare(board, color) {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (piece?.t === 'k' && piece.c === color) return { x, y };
        }
    }
    return null;
}

export function checkingPieces(board, color) {
    const king = kingSquare(board, color);
    if (!king) return [];
    const attackers = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (piece?.c === opposite(color) && pieceAttacksSquare(board, x, y, king.x, king.y)) {
                attackers.push({ x, y });
            }
        }
    }
    return attackers;
}

export function checkingPieceCount(board, color) {
    return checkingPieces(board, color).length;
}

export function inCheck(board, color) {
    const king = kingSquare(board, color);
    return !king || isSquareAttacked(board, king.x, king.y, opposite(color));
}

export function legalMoves(board, color) {
    const result = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (!piece || piece.c !== color) continue;
            for (const move of pseudoMoves(board, x, y)) {
                if (!inCheck(applyMove(board, move), color)) result.push(move);
            }
        }
    }
    return result;
}

function hasLegalEnPassant(board, color) {
    const target = board.enPassant;
    if (!target) return false;
    const direction = color === 'w' ? 1 : -1;
    const sourceY = target.y - direction;
    for (const sourceX of [target.x - 1, target.x + 1]) {
        if (!inside(sourceX, sourceY)) continue;
        const pawn = board[sourceY][sourceX];
        if (pawn?.t !== 'p' || pawn.c !== color) continue;
        const move = pseudoMoves(board, sourceX, sourceY).find(candidate => candidate.enPassant && candidate.tx === target.x && candidate.ty === target.y);
        if (move && !inCheck(applyMove(board, move), color)) return true;
    }
    return false;
}

export function positionKey(board, sideToMove) {
    const placement = board.map(row => row.map(piece => piece ? `${piece.c}${piece.t}` : '--').join('')).join('/');
    const rights = board.castlingRights || emptyCastlingRights();
    let castling = '';
    if (rights.w?.k) castling += 'K';
    if (rights.w?.q) castling += 'Q';
    if (rights.b?.k) castling += 'k';
    if (rights.b?.q) castling += 'q';
    const pawnDouble = board.pawnDoubleStepAvailable || { w: true, b: true };
    const pawnRights = `${pawnDouble.w === false ? '-' : 'w'}${pawnDouble.b === false ? '-' : 'b'}`;
    const ep = hasLegalEnPassant(board, sideToMove) ? `${board.enPassant.x},${board.enPassant.y}` : '-';
    return `${placement} ${sideToMove} ${castling || '-'} ${pawnRights} ${ep}`;
}

export function isInsufficientMaterial(board) {
    const minors = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (!piece || piece.t === 'k') continue;
            if (piece.t === 'p' || piece.t === 'r' || piece.t === 'q') return false;
            minors.push({ type: piece.t, squareColor: (x + y) % 2 });
        }
    }
    if (minors.length <= 1) return true;
    return minors.every(piece => piece.type === 'b')
        && minors.every(piece => piece.squareColor === minors[0].squareColor);
}

export function getClaimableDraws(board, sideToMove, positionCounts = new Map()) {
    const claims = [];
    const key = positionKey(board, sideToMove);
    const repetitions = positionCounts.get(key) || 1;
    if (repetitions >= 3) claims.push('Threefold repetition');
    if ((board.halfmoveClock || 0) >= 100) claims.push('Fifty-move rule');
    return claims;
}

export function getGameResult(board, sideToMove, positionCounts = new Map()) {
    const moves = legalMoves(board, sideToMove);
    const check = inCheck(board, sideToMove);
    if (moves.length === 0) {
        return check
            ? { type: 'checkmate', winner: opposite(sideToMove), inCheck: true, legalMoves: moves }
            : { type: 'stalemate', winner: null, inCheck: false, legalMoves: moves };
    }
    if (isInsufficientMaterial(board)) {
        return { type: 'draw', reason: 'insufficient-material', winner: null, inCheck: check, legalMoves: moves };
    }
    const repetitions = positionCounts.get(positionKey(board, sideToMove)) || 1;
    if (repetitions >= 5) {
        return { type: 'draw', reason: 'fivefold-repetition', winner: null, inCheck: check, legalMoves: moves };
    }
    if ((board.halfmoveClock || 0) >= 150) {
        return { type: 'draw', reason: 'seventy-five-move-rule', winner: null, inCheck: check, legalMoves: moves };
    }
    return { type: 'ongoing', winner: null, inCheck: check, legalMoves: moves };
}

function capturedPiece(board, move) {
    return move.enPassant ? board[move.fy]?.[move.tx] : board[move.ty]?.[move.tx];
}

function moveOrderValue(board, move) {
    const victim = capturedPiece(board, move);
    return (victim ? VALUES[victim.t] * 10 : 0)
        + (move.promoteTo ? (VALUES[move.promoteTo] - VALUES.p) * 10 : 0)
        + (move.castle ? 2 : 0);
}

function chooseIntermediateMove(board, color, moves) {
    const enemy = opposite(color);
    let best = null;
    let bestScore = -Infinity;
    for (const move of moves) {
        const victim = capturedPiece(board, move);
        let score = victim ? VALUES[victim.t] * 10 : 0;
        if (move.promoteTo) score += (VALUES[move.promoteTo] - VALUES.p) * 10;
        if (move.castle) score += 2;
        const after = applyMove(board, move);
        const replies = legalMoves(after, enemy);
        if (replies.length === 0 && inCheck(after, enemy)) score += 10000;
        let worst = 0;
        for (const reply of replies) {
            const threatened = capturedPiece(after, reply) || after[reply.ty][reply.tx];
            if (threatened) worst = Math.max(worst, VALUES[threatened.t] * 10);
        }
        score -= worst + Math.random() * 3;
        if (score > bestScore) {
            bestScore = score;
            best = move;
        }
    }
    return best;
}

function evaluateBoard(board, perspective) {
    let score = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (!piece) continue;
            const sign = piece.c === perspective ? 1 : -1;
            const center = 3.5 - (Math.abs(x - 3.5) + Math.abs(y - 3.5)) * 0.5;
            let value = VALUES[piece.t] * 100 + center * (piece.t === 'p' ? 2 : 4);
            if (piece.t === 'p') value += (piece.c === 'w' ? y : 7 - y) * 5;
            score += sign * value;
        }
    }
    return score;
}

function advancedSearch(board, side, perspective, depth, alpha, beta, ply, positionCounts) {
    const moves = legalMoves(board, side);
    const check = inCheck(board, side);
    if (moves.length === 0) {
        if (!check) return 0;
        return side === perspective ? -100000 + ply : 100000 - ply;
    }

    const repetitions = positionCounts.get(positionKey(board, side)) || 1;
    if (isInsufficientMaterial(board) || repetitions >= 3 || (board.halfmoveClock || 0) >= 100) return 0;
    if (depth === 0) return evaluateBoard(board, perspective);

    moves.sort((a, b) => moveOrderValue(board, b) - moveOrderValue(board, a));
    const maximizing = side === perspective;
    let best = maximizing ? -Infinity : Infinity;
    for (const move of moves) {
        const next = applyMove(board, move);
        const nextSide = opposite(side);
        const key = positionKey(next, nextSide);
        const previousCount = positionCounts.get(key) || 0;
        positionCounts.set(key, previousCount + 1);
        const score = advancedSearch(next, nextSide, perspective, depth - 1, alpha, beta, ply + 1, positionCounts);
        if (previousCount) positionCounts.set(key, previousCount);
        else positionCounts.delete(key);
        if (maximizing) {
            best = Math.max(best, score);
            alpha = Math.max(alpha, best);
        } else {
            best = Math.min(best, score);
            beta = Math.min(beta, best);
        }
        if (beta <= alpha) break;
    }
    return best;
}

function chooseAdvancedMove(board, color, moves, sourceCounts) {
    const enemy = opposite(color);
    const counts = new Map(sourceCounts);
    const currentKey = positionKey(board, color);
    if (!counts.has(currentKey)) counts.set(currentKey, 1);
    const ordered = [...moves].sort((a, b) => moveOrderValue(board, b) - moveOrderValue(board, a));
    let best = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    for (const move of ordered) {
        const next = applyMove(board, move);
        const key = positionKey(next, enemy);
        const previousCount = counts.get(key) || 0;
        counts.set(key, previousCount + 1);
        const score = advancedSearch(next, enemy, color, 2, alpha, Infinity, 1, counts);
        if (previousCount) counts.set(key, previousCount);
        else counts.delete(key);
        if (score > bestScore) {
            bestScore = score;
            best = move;
        }
        alpha = Math.max(alpha, bestScore);
    }
    return best;
}

export function chooseAiMove(board, color, skill = 'intermediate', positionCounts = new Map()) {
    const result = getGameResult(board, color, positionCounts);
    if (result.type !== 'ongoing' || getClaimableDraws(board, color, positionCounts).length) return null;
    const moves = result.legalMoves;
    if (skill === 'beginner') return moves[Math.floor(Math.random() * moves.length)];
    if (skill === 'advanced') return chooseAdvancedMove(board, color, moves, positionCounts);
    return chooseIntermediateMove(board, color, moves);
}
