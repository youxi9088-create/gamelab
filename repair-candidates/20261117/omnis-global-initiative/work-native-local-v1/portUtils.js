export const CARD_W = 240;
export const CARD_H = 340;
export const HALF_W = CARD_W / 2;
export const HALF_H = CARD_H / 2;
export const PORT_OUTFLOW_EXTENT = 14;
export const ATTACH_GAP = -PORT_OUTFLOW_EXTENT;
export const COLLISION_PADDING = 0; // Set to 0 to allow tight grouping around root nodes without corner collisions


export const SIDE_DIR = {
    0: { x: 0, y: -1 },
    1: { x: 1, y: 0 },
    2: { x: 0, y: 1 },
    3: { x: -1, y: 0 }
};

export function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

export function getNodeRotation(node) {
    const rot = node?.rotationSteps || 0;
    return ((rot % 4) + 4) % 4;
}

export function rotateSide(side, steps = 0) {
    return (((side ?? 0) + steps) % 4 + 4) % 4;
}

export function unrotateSide(side, steps = 0) {
    return rotateSide(side, -steps);
}

export function oppositeSide(side) {
    return rotateSide(side, 2);
}

export function rotateVector(vec, steps = 0) {
    const s = ((steps % 4) + 4) % 4;
    if (s === 0) return { x: vec.x, y: vec.y };
    if (s === 1) return { x: -vec.y, y: vec.x };
    if (s === 2) return { x: -vec.x, y: -vec.y };
    return { x: vec.y, y: -vec.x };
}

export function getLocalPortOffset(side) {
    switch (side) {
        case 0: return { x: 0, y: -HALF_H };
        case 1: return { x: HALF_W, y: 0 };
        case 2: return { x: 0, y: HALF_H };
        case 3: return { x: -HALF_W, y: 0 };
        default: return { x: 0, y: 0 };
    }
}

export function getBasePortLayout(node) {
    if (node.type === 'root') {
        return { incoming: null, outgoing: [0, 1, 2, 3] };
    }

    const maxOut = Math.min(node.arrows || 1, 3);
    const sides = [0, 1, 2, 3];
    const h = hashStr(node.id || node.name || 'x');
    const incomingSide = sides[h % 4];
    const remaining = sides.filter(s => s !== incomingSide);

    const shuffled = [...remaining];
    let seed = h;
    for (let i = shuffled.length - 1; i > 0; i--) {
        seed = ((seed * 1103515245 + 12345) >>> 0);
        const j = seed % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return { incoming: incomingSide, outgoing: shuffled.slice(0, maxOut) };
}

export function getWorldIncomingSide(node) {
    const layout = getBasePortLayout(node);
    if (layout.incoming === null) return null;
    return rotateSide(layout.incoming, getNodeRotation(node));
}

export function getWorldOutgoingSides(node) {
    return getBasePortLayout(node).outgoing.map(side => rotateSide(side, getNodeRotation(node)));
}

export function getPortWorldOffset(node, worldSide) {
    const rotation = getNodeRotation(node);
    const baseSide = unrotateSide(worldSide, rotation);
    return rotateVector(getLocalPortOffset(baseSide), rotation);
}

export function getPortWorldTipOffset(node, worldSide, extra = PORT_OUTFLOW_EXTENT) {
    const base = getPortWorldOffset(node, worldSide);
    const dir = SIDE_DIR[worldSide] || { x: 0, y: 0 };
    return { x: base.x + dir.x * extra, y: base.y + dir.y * extra };
}

export function getNodeAabb(node) {
    const rotation = getNodeRotation(node);
    return rotation % 2 === 1
        ? { halfWidth: HALF_H, halfHeight: HALF_W }
        : { halfWidth: HALF_W, halfHeight: HALF_H };
}

export function nodesOverlap(a, b, padding = COLLISION_PADDING) {
    if (!a || !b) return false;
    const aa = getNodeAabb(a);
    const bb = getNodeAabb(b);
    return Math.abs((a.x || 0) - (b.x || 0)) < aa.halfWidth + bb.halfWidth + padding &&
           Math.abs((a.y || 0) - (b.y || 0)) < aa.halfHeight + bb.halfHeight + padding;
}

export function computeRotationForIncomingSide(node, desiredWorldIncomingSide) {
    const layout = getBasePortLayout(node);
    if (layout.incoming === null) return 0;
    return ((desiredWorldIncomingSide - layout.incoming) % 4 + 4) % 4;
}

export function resolveParentPortAssignments(allNodes, parentId, ignoreNodeIds = []) {
    const parent = allNodes[parentId];
    const assignments = new Map();
    if (!parent) return assignments;

    const ignored = new Set(ignoreNodeIds || []);
    const sides = getWorldOutgoingSides(parent);
    const children = Object.values(allNodes)
        .filter(n => n.parentId === parentId && !ignored.has(n.id))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));

    const used = new Set();

    for (const child of children) {
        const explicit = child.parentPortSide;
        if (explicit !== undefined && explicit !== null && sides.includes(explicit) && !used.has(explicit)) {
            assignments.set(child.id, explicit);
            used.add(explicit);
        }
    }

    for (const child of children) {
        if (assignments.has(child.id)) continue;
        const nextSide = sides.find(side => !used.has(side));
        if (nextSide === undefined) continue;
        assignments.set(child.id, nextSide);
        used.add(nextSide);
    }

    return assignments;
}

export function getResolvedParentPortSide(allNodes, childNode) {
    if (!childNode?.parentId) return null;
    const assignments = resolveParentPortAssignments(allNodes, childNode.parentId);
    return assignments.get(childNode.id) ?? null;
}

export function getOccupiedWorldOutgoingSides(allNodes, parentId, ignoreNodeIds = []) {
    const assignments = resolveParentPortAssignments(allNodes, parentId, ignoreNodeIds);
    return new Set(assignments.values());
}

export function findAllAttachmentSolutions(allNodes, parentNode, childNode, options = {}) {
    if (!parentNode || !childNode || childNode.type === 'root') return [];

    const ignoreNodeIds = new Set(options.ignoreNodeIds || []);
    ignoreNodeIds.add(childNode.id);
    ignoreNodeIds.add(parentNode.id);

    // Allow callers to override collision padding (default COLLISION_PADDING = 8).
    // Move operations use reduced padding because dense networks legitimately
    // have cards placed adjacent to non-parent neighbors.
    const padding = options.collisionPadding ?? COLLISION_PADDING;

    const occupied = getOccupiedWorldOutgoingSides(allNodes, parentNode.id, [...ignoreNodeIds]);
    let candidateSides = getWorldOutgoingSides(parentNode).filter(side => !occupied.has(side));
    if (Array.isArray(options.allowedParentPortSides) && options.allowedParentPortSides.length > 0) {
        const allowed = new Set(options.allowedParentPortSides);
        candidateSides = candidateSides.filter(side => allowed.has(side));
    }
    if (candidateSides.length === 0) return [];

    const preferPoint = options.preferPoint || { x: childNode.x ?? parentNode.x, y: childNode.y ?? parentNode.y };
    const solutions = [];

    for (const parentPortSide of candidateSides) {
        const desiredIncoming = oppositeSide(parentPortSide);
        const rotationSteps = computeRotationForIncomingSide(childNode, desiredIncoming);
        const placedNode = { ...childNode, rotationSteps };
        const incomingSide = getWorldIncomingSide(placedNode);
        if (incomingSide !== desiredIncoming) continue;

        const parentTip = getPortWorldTipOffset(parentNode, parentPortSide, PORT_OUTFLOW_EXTENT);
        const childIncomingOffset = getPortWorldOffset(placedNode, incomingSide);
        const dir = SIDE_DIR[parentPortSide];

        const x = parentNode.x + parentTip.x + dir.x * ATTACH_GAP - childIncomingOffset.x;
        const y = parentNode.y + parentTip.y + dir.y * ATTACH_GAP - childIncomingOffset.y;

        const trial = { ...placedNode, x, y };
        let collision = false;
        for (const other of Object.values(allNodes)) {
            if (!other || ignoreNodeIds.has(other.id)) continue;
            if (nodesOverlap(trial, other, padding)) {
                collision = true;
                break;
            }
        }
        if (collision) continue;

        const dx = x - (preferPoint.x ?? x);
        const dy = y - (preferPoint.y ?? y);
        solutions.push({
            x,
            y,
            rotationSteps,
            parentPortSide,
            incomingSide,
            score: (dx * dx) + (dy * dy)
        });
    }

    return solutions.sort((a, b) => a.score - b.score);
}

export function findAttachmentSolution(allNodes, parentNode, childNode, options = {}) {
    return findAllAttachmentSolutions(allNodes, parentNode, childNode, options)[0] || null;
}
