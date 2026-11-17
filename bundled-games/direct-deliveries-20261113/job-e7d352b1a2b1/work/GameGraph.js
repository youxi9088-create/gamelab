import Phaser from './_remote/b8c86383a79f25ec/phaser@3.70.0.js';
import { COLORS, getChildCount, getFreeArrows } from './gameLogic.js';
import { createPlayingCardHTML } from './cardRenderer.js';
import {
    CARD_W,
    CARD_H,
    HALF_W,
    HALF_H,
    SIDE_DIR,
    getBasePortLayout,
    getNodeRotation,
    getNodeAabb,
    getPortWorldOffset,
    getPortWorldTipOffset,
    getResolvedParentPortSide
} from './portUtils.js';

function getPortLayout(node) {
    const base = getBasePortLayout(node);
    const rotation = getNodeRotation(node);
    return {
        incoming: base.incoming === null ? null : (((base.incoming + rotation) % 4) + 4) % 4,
        outgoing: base.outgoing.map(side => (((side + rotation) % 4) + 4) % 4)
    };
}

export default class GameGraph extends Phaser.Scene {
    constructor() {
        super('GameGraph');
        this.nodes = {};
        this.links = [];
        this.nodeGraphics = {};
        this.linkGraphics = {};
        this.selectedNodeId = null;
        this.onNodeSelected = null;
        this.onNodeDragged = null;
        this.draggingNodeId = null;
        this.draggingBranchIds = [];
        this.isDragging = false;
        this.dragStartPos = null;
        this.dragOffsets = {};
        this._pendingClickNodeId = null;
        this._pendingClickScreenPos = null;
        this._pendingClickWorldPos = null;
        this.rearrangePreview = null;
        this.rearrangePreviewGraphics = null;
        this._isPanning = false;
        this._lastPanPos = null;
        this.attackingChainIds = [];
        this.biddingTargetId = null;
        this.activeAttackLink = null;
        this.tutorialHighlightId = null;
        this.neutralZoneTarget = null;
        this.neutralZoneIndicator = null;
        this._hasRenderedGraphOnce = false;
    }

    setNeutralZoneTarget(x, y) {
        this.neutralZoneTarget = { x, y };
    }

    setTutorialHighlight(nodeId) {
        this.tutorialHighlightId = nodeId || null;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

        // Setup zoom (uses Phaser's wheel event — the domContainer has
        // pointer-events:none so wheel events reach the canvas fine)
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom - deltaY * 0.001, 0.3, 2);
            this.cameras.main.zoom = newZoom;
        });

        // ══════════════════════════════════════════════════════════════
        //  ALL pointer interaction is driven by NATIVE DOM events.
        //  Phaser's dom.createContainer places a <div> on top of the
        //  canvas that can swallow pointer events before Phaser sees
        //  them.  Native listeners on the parent container bypass this.
        // ══════════════════════════════════════════════════════════════

        // Ensure the Phaser DOM container doesn't block mouse events:
        const domContainer = this.game.domContainer;
        if (domContainer) {
            domContainer.style.pointerEvents = 'none';
        }

        // Helper: convert screen (clientX/Y) → Phaser world coords
        const screenToWorld = (clientX, clientY) => {
            const cam = this.cameras.main;
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = cam.width / rect.width;
            const scaleY = cam.height / rect.height;
            const canvasX = (clientX - rect.left) * scaleX;
            const canvasY = (clientY - rect.top) * scaleY;
            return {
                worldX: canvasX / cam.zoom + cam.worldView.x,
                worldY: canvasY / cam.zoom + cam.worldView.y,
                canvasX, canvasY
            };
        };

        const parentEl = this.game.canvas.parentElement;
        if (parentEl) {
            // Helper: check if pointer event was blocked by an overlay/modal
            const isBlockedByUI = (e) => {
                // 1) If any full-screen modal is currently active, block board interactions
                const modals = document.querySelectorAll('.modal-overlay');
                for (let i = 0; i < modals.length; i++) {
                    const display = window.getComputedStyle(modals[i]).display;
                    if (display !== 'none' && modals[i].style.display !== 'none') {
                        return true;
                    }
                }
                // 2) Block if any reveal/tutorial/full-screen overlay exists in the DOM
                //    (these aren't .modal-overlay but still cover the viewport)
                const blockingOverlaySelectors = [
                    '.card-reveal-overlay',
                    '.tutorial-overlay',
                    '#tutorial-overlay'
                ];
                for (const sel of blockingOverlaySelectors) {
                    const el = document.querySelector(sel);
                    if (el && el.offsetParent !== null) {
                        const cs = window.getComputedStyle(el);
                        if (cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05) {
                            return true;
                        }
                    }
                }
                // 3) Block if the event explicitly originated from the details panel or side tabs
                if (e.target && e.target.closest && (e.target.closest('#details-panel') || e.target.closest('.panel-tab'))) {
                    return true;
                }
                // 4) Defense in depth: if the top-most element under the pointer is NOT the
                //    canvas (or a transparent descendant of phaser-container), block.
                //    This catches every visible UI panel — modal or otherwise — that the user
                //    is actually pointing at.
                try {
                    const cx = (e.clientX != null) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
                    const cy = (e.clientY != null) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
                    if (cx != null && cy != null) {
                        const top = document.elementFromPoint(cx, cy);
                        if (top) {
                            // If the top element is neither the canvas nor inside #phaser-container, it's UI
                            const inGraph = top === this.game.canvas
                                || top.id === 'phaser-container'
                                || (top.closest && top.closest('#phaser-container'));
                            if (!inGraph) return true;
                        }
                    }
                } catch (_) { /* noop */ }
                return false;
            };

            // ── MOUSEDOWN: start pending click or camera-pan ──
            parentEl.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Left-click only
                if (isBlockedByUI(e)) return; // Ignore if clicking on UI/Modals
                if (!this._lastGraphData) return;

                const { worldX, worldY } = screenToWorld(e.clientX, e.clientY);
                const hitNodeId = this._hitTestNodes(worldX, worldY);

                // Hide hover tooltip during click
                if (this.hoveredNodeId) {
                    this.hoveredNodeId = null;
                    if (this.onNodeUnhovered) this.onNodeUnhovered();
                }

                if (hitNodeId) {
                    // Start long-press timer for mobile tooltips
                    this.holdTimer = this.time.delayedCall(400, () => {
                        if (!this.isDragging) {
                            const liveNode = this._lastGraphData?.nodes[hitNodeId];
                            if (!liveNode) return;
                            this.hoveredNodeId = hitNodeId;
                            this.isHoldingTooltip = true;
                            if (this.onNodeHovered) {
                                this.onNodeHovered(liveNode, e.clientX, e.clientY);
                            }
                        }
                    });

                    this._pendingClickNodeId = hitNodeId;
                    this._pendingClickScreenPos = { x: e.clientX, y: e.clientY };
                    this._pendingClickWorldPos = { x: worldX, y: worldY };
                } else {
                    // Clicked empty space — start camera pan
                    this._isPanning = true;
                    this._lastPanPos = { x: e.clientX, y: e.clientY };
                }
            });

            // ── MOUSEMOVE: hover, drag promotion, camera pan ──
            parentEl.addEventListener('mousemove', (e) => {
                if (isBlockedByUI(e)) {
                    // Force clear hover if UI is blocking to prevent stuck tooltips over modals
                    if (this.hoveredNodeId) {
                        this.hoveredNodeId = null;
                        if (this.onNodeUnhovered) this.onNodeUnhovered();
                    }
                    return;
                }
                if (!this._lastGraphData) return;
                const { worldX, worldY } = screenToWorld(e.clientX, e.clientY);

                // ── Camera pan (dragging empty space) ──
                if (this._isPanning && this._lastPanPos) {
                    const cam = this.cameras.main;
                    const rect = this.game.canvas.getBoundingClientRect();
                    const scaleX = cam.width / rect.width;
                    const scaleY = cam.height / rect.height;
                    const dx = (e.clientX - this._lastPanPos.x) * scaleX / cam.zoom;
                    const dy = (e.clientY - this._lastPanPos.y) * scaleY / cam.zoom;
                    cam.scrollX -= dx;
                    cam.scrollY -= dy;
                    this._lastPanPos = { x: e.clientX, y: e.clientY };
                    return;
                }

                // ── Promote pending click to drag ──
                if (this._pendingClickNodeId && !this.isDragging) {
                    const dx = e.clientX - this._pendingClickScreenPos.x;
                    const dy = e.clientY - this._pendingClickScreenPos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 20) {
                        const pendingId = this._pendingClickNodeId;
                        const pendingNode = this._lastGraphData?.nodes[pendingId];

                        // Don't drag root nodes
                        if (pendingNode && pendingNode.type === 'root') {
                            // Cancel pending click so it doesn't block hover
                            this._pendingClickNodeId = null;
                            return;
                        }

                        this.draggingNodeId = pendingId;
                        this.draggingBranchIds = this._getDescendantIds(pendingId);
                        this.isDragging = true;
                        this.dragOffsets = {};
                        const allIds = [pendingId, ...this.draggingBranchIds];
                        allIds.forEach(id => {
                            const branchG = this.nodeGraphics[id];
                            if (!branchG) return;
                            this.dragOffsets[id] = {
                                x: branchG.container.x - this._pendingClickWorldPos.x,
                                y: branchG.container.y - this._pendingClickWorldPos.y
                            };
                        });

                        if (this.holdTimer) { this.holdTimer.remove(); this.holdTimer = null; }
                        if (this.isHoldingTooltip) { this.isHoldingTooltip = false; }
                        if (this.hoveredNodeId) {
                            this.hoveredNodeId = null;
                            if (this.onNodeUnhovered) this.onNodeUnhovered();
                        }
                    }
                }

                // ── Active drag ──
                if (this.isDragging && this.draggingNodeId) {
                    this._positionDraggedBranch(worldX, worldY);
                    const rootGraphic = this.nodeGraphics[this.draggingNodeId];
                    const rootX = rootGraphic?.container?.x ?? worldX;
                    const rootY = rootGraphic?.container?.y ?? worldY;
                    let preview = null;
                    if (this.onNodeDragged) {
                        preview = this.onNodeDragged(this.draggingNodeId, rootX, rootY, { previewOnly: true });
                    }
                    if (preview?.snapped && preview.previewNodes) {
                        this._positionDraggedBranchToPreview(preview.previewNodes);
                    }
                    this._redrawLinksLive();
                    return;
                }

                // ── Hover detection (only when not dragging/clicking) ──
                if (!this.isDragging && !this._pendingClickNodeId) {
                    const hitNodeId = this._hitTestNodes(worldX, worldY);
                    this.game.canvas.style.cursor = hitNodeId ? 'pointer' : 'default';

                    if (hitNodeId !== this.hoveredNodeId) {
                        if (this.hoveredNodeId) {
                            this.hoveredNodeId = null;
                            if (this.onNodeUnhovered) this.onNodeUnhovered();
                        }
                        if (hitNodeId) {
                            const liveNode = this._lastGraphData.nodes[hitNodeId];
                            if (liveNode) {
                                this.hoveredNodeId = hitNodeId;
                                if (this.onNodeHovered) this.onNodeHovered(liveNode, e.clientX, e.clientY);
                            }
                        }
                    } else if (this.hoveredNodeId) {
                        const liveNode = this._lastGraphData.nodes[this.hoveredNodeId];
                        if (liveNode && this.onNodeHoverMoved) {
                            this.onNodeHoverMoved(liveNode, e.clientX, e.clientY);
                        }
                    }
                }
            });

            // ── MOUSEUP: commit click or end drag ──
            // Listen on window so we catch mouseup even if cursor leaves game area
            window.addEventListener('mouseup', (e) => {
                if (e.button !== 0) return;
                // Allow mouseup to complete drag even if on UI, 
                // but don't count as a click on a node if it was blocked
                const blocked = isBlockedByUI(e);

                // End camera pan
                if (this._isPanning) {
                    this._isPanning = false;
                    this._lastPanPos = null;
                    return;
                }

                if (this.holdTimer) { this.holdTimer.remove(); this.holdTimer = null; }
                const wasHoldingTooltip = this.isHoldingTooltip;
                this.isHoldingTooltip = false;

                const wasDragging = this.draggingNodeId && this.isDragging;

                if (wasDragging) {
                    const g = this.nodeGraphics[this.draggingNodeId];
                    if (g && this.onNodeDragged) {
                        this.onNodeDragged(this.draggingNodeId, g.container.x, g.container.y, { previewOnly: false });
                    }
                } else if (this._pendingClickNodeId && !blocked) {
                    // Mouse was pressed on a node but never moved far enough to drag → it's a click
                    this.selectNode(this._pendingClickNodeId);
                    if (this.onNodeSelected) this.onNodeSelected(this._pendingClickNodeId);
                }

                // Reset ALL interaction state
                this._pendingClickNodeId = null;
                this._pendingClickScreenPos = null;
                this._pendingClickWorldPos = null;
                this.draggingNodeId = null;
                this.draggingBranchIds = [];
                this.dragOffsets = {};
                this.isDragging = false;
                this.dragStartPos = null;

                // After clearing drag, force-reset all node positions from game state
                if (wasDragging && this._lastGraphData) {
                    Object.values(this._lastGraphData.nodes).forEach(node => {
                        const g = this.nodeGraphics[node.id];
                        if (g) {
                            g.container.setPosition(node.x, node.y);
                            g.container.setRotation((getNodeRotation(node) * Math.PI) / 2);
                        }
                    });
                }

                // Restore hover after interaction ends
                const { worldX, worldY } = screenToWorld(e.clientX, e.clientY);
                const hitNodeId = this._hitTestNodes(worldX, worldY);
                if (hitNodeId) {
                    const liveNode = this._lastGraphData?.nodes[hitNodeId];
                    if (liveNode) {
                        this.hoveredNodeId = hitNodeId;
                        if (this.onNodeHovered) this.onNodeHovered(liveNode, e.clientX, e.clientY);
                    }
                }
            });

            // ── MOUSELEAVE: hide tooltip ──
            parentEl.addEventListener('mouseleave', () => {
                if (this.hoveredNodeId) {
                    this.hoveredNodeId = null;
                    if (this.onNodeUnhovered) this.onNodeUnhovered();
                }
            });

            // ── TOUCH support ──
            parentEl.addEventListener('touchstart', (e) => {
                if (isBlockedByUI(e)) {
                    if (this.hoveredNodeId) {
                        this.hoveredNodeId = null;
                        if (this.onNodeUnhovered) this.onNodeUnhovered();
                    }
                    return;
                }
                if (!this._lastGraphData) return;
                
                // Pinch-to-zoom support
                if (e.touches.length === 2) {
                    this._isPinching = true;
                    this._lastPinchDist = Phaser.Math.Distance.Between(
                        e.touches[0].clientX, e.touches[0].clientY,
                        e.touches[1].clientX, e.touches[1].clientY
                    );
                    
                    // Cancel any pending drag/click/hover
                    this._pendingClickNodeId = null;
                    if (this.holdTimer) { this.holdTimer.remove(); this.holdTimer = null; }
                    this.isHoldingTooltip = false;
                    this.isDragging = false;
                    this.draggingNodeId = null;
                    return;
                }

                if (e.touches.length > 1) return;

                const touch = e.touches[0];
                const { worldX, worldY } = screenToWorld(touch.clientX, touch.clientY);
                const hitNodeId = this._hitTestNodes(worldX, worldY);

                if (hitNodeId) {
                    this._pendingClickNodeId = hitNodeId;
                    this._pendingClickScreenPos = { x: touch.clientX, y: touch.clientY };
                    this._pendingClickWorldPos = { x: worldX, y: worldY };

                    this.holdTimer = this.time.delayedCall(400, () => {
                        if (!this.isDragging) {
                            const liveNode = this._lastGraphData?.nodes[hitNodeId];
                            if (!liveNode) return;
                            this.hoveredNodeId = hitNodeId;
                            this.isHoldingTooltip = true;
                            if (this.onNodeHovered) {
                                this.onNodeHovered(liveNode, touch.clientX, touch.clientY);
                            }
                        }
                    });
                } else {
                    this._isPanning = true;
                    this._lastPanPos = { x: touch.clientX, y: touch.clientY };
                }
            }, { passive: false });

            parentEl.addEventListener('touchmove', (e) => {
                if (isBlockedByUI(e)) {
                    if (this.hoveredNodeId) {
                        this.hoveredNodeId = null;
                        if (this.onNodeUnhovered) this.onNodeUnhovered();
                    }
                    return;
                }
                if (!this._lastGraphData) return;
                
                // Prevent default scrolling/rubber-banding on the game board
                if (e.cancelable && (this._isPinching || this._isPanning || this.isDragging || this._pendingClickNodeId)) {
                    e.preventDefault();
                }

                // Handle pinch-to-zoom
                if (this._isPinching && e.touches.length === 2) {
                    const dist = Phaser.Math.Distance.Between(
                        e.touches[0].clientX, e.touches[0].clientY,
                        e.touches[1].clientX, e.touches[1].clientY
                    );
                    const zoomDelta = (dist - this._lastPinchDist) * 0.005;
                    const cam = this.cameras.main;
                    cam.zoom = Phaser.Math.Clamp(cam.zoom + zoomDelta, 0.3, 2);
                    this._lastPinchDist = dist;
                    return;
                }

                if (e.touches.length > 1) return;

                const touch = e.touches[0];
                const { worldX, worldY } = screenToWorld(touch.clientX, touch.clientY);

                if (this._isPanning && this._lastPanPos) {
                    const cam = this.cameras.main;
                    const rect = this.game.canvas.getBoundingClientRect();
                    const scaleX = cam.width / rect.width;
                    const scaleY = cam.height / rect.height;
                    const dx = (touch.clientX - this._lastPanPos.x) * scaleX / cam.zoom;
                    const dy = (touch.clientY - this._lastPanPos.y) * scaleY / cam.zoom;
                    cam.scrollX -= dx;
                    cam.scrollY -= dy;
                    this._lastPanPos = { x: touch.clientX, y: touch.clientY };
                    return;
                }

                if (this._pendingClickNodeId && !this.isDragging) {
                    const dx = touch.clientX - this._pendingClickScreenPos.x;
                    const dy = touch.clientY - this._pendingClickScreenPos.y;
                    if (Math.sqrt(dx * dx + dy * dy) > 20) {
                        const pendingId = this._pendingClickNodeId;
                        const pendingNode = this._lastGraphData?.nodes[pendingId];
                        if (pendingNode && pendingNode.type === 'root') {
                            this._pendingClickNodeId = null;
                            return;
                        }
                        this.draggingNodeId = pendingId;
                        this.draggingBranchIds = this._getDescendantIds(pendingId);
                        this.isDragging = true;
                        this.dragOffsets = {};
                        [pendingId, ...this.draggingBranchIds].forEach(id => {
                            const branchG = this.nodeGraphics[id];
                            if (!branchG) return;
                            this.dragOffsets[id] = {
                                x: branchG.container.x - this._pendingClickWorldPos.x,
                                y: branchG.container.y - this._pendingClickWorldPos.y
                            };
                        });
                        if (this.holdTimer) { this.holdTimer.remove(); this.holdTimer = null; }
                        this.isHoldingTooltip = false;
                        this.hoveredNodeId = null;
                        if (this.onNodeUnhovered) this.onNodeUnhovered();
                    }
                }

                if (this.isDragging && this.draggingNodeId) {
                    this._positionDraggedBranch(worldX, worldY);
                    const rootG = this.nodeGraphics[this.draggingNodeId];
                    const rootX = rootG?.container?.x ?? worldX;
                    const rootY = rootG?.container?.y ?? worldY;
                    let preview = null;
                    if (this.onNodeDragged) {
                        preview = this.onNodeDragged(this.draggingNodeId, rootX, rootY, { previewOnly: true });
                    }
                    if (preview?.snapped && preview.previewNodes) {
                        this._positionDraggedBranchToPreview(preview.previewNodes);
                    }
                    this._redrawLinksLive();
                }
            }, { passive: false });

            parentEl.addEventListener('touchend', (e) => {
                const blocked = isBlockedByUI(e);
                if (this._isPinching) {
                    if (e.touches.length < 2) {
                        this._isPinching = false;
                        this._lastPinchDist = null;
                    }
                    return;
                }

                if (this._isPanning) {
                    this._isPanning = false;
                    this._lastPanPos = null;
                    return;
                }
                if (this.holdTimer) { this.holdTimer.remove(); this.holdTimer = null; }
                const wasHoldingTooltip = this.isHoldingTooltip;
                this.isHoldingTooltip = false;

                const wasDragging = this.draggingNodeId && this.isDragging;
                if (wasDragging) {
                    const g = this.nodeGraphics[this.draggingNodeId];
                    if (g && this.onNodeDragged) {
                        this.onNodeDragged(this.draggingNodeId, g.container.x, g.container.y, { previewOnly: false });
                    }
                } else if (this._pendingClickNodeId && !wasHoldingTooltip && !blocked) {
                    this.selectNode(this._pendingClickNodeId);
                    if (this.onNodeSelected) this.onNodeSelected(this._pendingClickNodeId);
                }

                this._pendingClickNodeId = null;
                this._pendingClickScreenPos = null;
                this._pendingClickWorldPos = null;
                this.draggingNodeId = null;
                this.draggingBranchIds = [];
                this.dragOffsets = {};
                this.isDragging = false;

                if (wasDragging && this._lastGraphData) {
                    Object.values(this._lastGraphData.nodes).forEach(node => {
                        const g = this.nodeGraphics[node.id];
                        if (g) {
                            g.container.setPosition(node.x, node.y);
                            g.container.setRotation((getNodeRotation(node) * Math.PI) / 2);
                        }
                    });
                }

                this.hoveredNodeId = null;
                if (this.onNodeUnhovered) this.onNodeUnhovered();
            });
        }

        // Keep Phaser's pointermove for drag operations that need pointer.worldX
        // (this fires when pointer is captured after Phaser pointerdown on hitArea)
        this.input.on('pointermove', (pointer) => {
            // Only used as fallback if native events don't fire during drag
            if (!pointer.isDown || !this.isDragging) return;
            this._positionDraggedBranch(pointer.worldX, pointer.worldY);
            const rootGraphic = this.nodeGraphics[this.draggingNodeId];
            const rootX = rootGraphic?.container?.x ?? pointer.worldX;
            const rootY = rootGraphic?.container?.y ?? pointer.worldY;
            let preview = null;
            if (this.onNodeDragged) {
                preview = this.onNodeDragged(this.draggingNodeId, rootX, rootY, { previewOnly: true });
            }
            if (preview?.snapped && preview.previewNodes) {
                this._positionDraggedBranchToPreview(preview.previewNodes);
            }
            this._redrawLinksLive();
        });

        // Background grid
        this.add.grid(960, 540, 6000, 6000, 100, 100, 0x000000, 0, 0x2d3748, 0.15).setOrigin(0.5);

        // Generate simple particle texture
        const pt = this.add.graphics();
        pt.fillStyle(0xffffff, 1);
        pt.fillCircle(8, 8, 8);
        pt.generateTexture('particle_dot', 16, 16);
        pt.destroy();

        // Attack link graphics
        this.attackLinkGraphics = this.add.graphics();
        this.attackLinkGraphics.setDepth(1);

        this.rearrangePreviewGraphics = this.add.graphics();
        this.rearrangePreviewGraphics.setDepth(1.5);

        // Neutral Zone Indicator container (on top of graph but below UI)
        this.neutralZoneIndicator = this.add.container(0, 0);
        this.neutralZoneIndicator.setScrollFactor(0); // Fixed to screen
        this.neutralZoneIndicator.setDepth(100);
        this.neutralZoneIndicator.setVisible(false);

        const nzCircle = this.add.circle(0, 0, 40, 0x3b82f6, 0.2);
        nzCircle.setStrokeStyle(2, 0x3b82f6, 0.8);
        const nzArrow = this.add.triangle(0, 0, 0, -15, -10, 5, 10, 5, 0x3b82f6);
        nzArrow.setY(-45);
        const nzText = this.add.text(0, 25, 'NEUTRAL ZONE', {
            fontFamily: 'Share Tech Mono',
            fontSize: '14px',
            color: '#3b82f6'
        }).setOrigin(0.5);
        
        this.neutralZoneIndicator.add([nzCircle, nzArrow, nzText]);

        // Keyboard panning
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    // ═══════════════════════════════════════
    //  UPDATE LOOP — glows, highlights, bidding arrows
    // ═══════════════════════════════════════
    update(time, delta) {
        if (!this._lastGraphData) return;

        // Pulsing Neutral Zone Indicator
        if (this.neutralZoneIndicator && this.neutralZoneIndicator.visible) {
            const pulse = 0.8 + Math.sin(time * 0.005) * 0.2;
            this.neutralZoneIndicator.setScale(pulse);
            
            // Scanning effect on the circle
            const circle = this.neutralZoneIndicator.list[0];
            if (circle) {
                circle.setAlpha(0.2 + Math.sin(time * 0.01) * 0.1);
            }
        }

        // Camera keyboard panning
        const cam = this.cameras.main;
        const panSpeed = 600 * (delta / 1000); // 600px per second (adjusts for framerate)
        let panX = 0;
        let panY = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) panX -= panSpeed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) panX += panSpeed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) panY -= panSpeed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) panY += panSpeed;

        if (panX !== 0 || panY !== 0) {
            cam.scrollX += panX / cam.zoom;
            cam.scrollY += panY / cam.zoom;
        }

        this.attackLinkGraphics.clear();
        if (this.rearrangePreviewGraphics) this.rearrangePreviewGraphics.clear();

        if (this.rearrangePreview?.solution && this.rearrangePreviewGraphics) {
            const previewColor = this.rearrangePreview.snapped ? 0x22c55e : 0x3b82f6;
            Object.values(this.rearrangePreview.previewNodes || {}).forEach(node => {
                // Use rotation-aware AABB so rotated cards preview with correct dimensions
                const aabb = getNodeAabb(node);
                this.rearrangePreviewGraphics.lineStyle(3, previewColor, 0.95);
                this.rearrangePreviewGraphics.strokeRoundedRect(
                    node.x - aabb.halfWidth,
                    node.y - aabb.halfHeight,
                    aabb.halfWidth * 2,
                    aabb.halfHeight * 2,
                    10
                );
            });

            const parentG = this.nodeGraphics[this.rearrangePreview.parentId];
            const rootPreview = this.rearrangePreview.previewNodes?.[this.rearrangePreview.nodeId];
            if (parentG && rootPreview) {
                this.rearrangePreviewGraphics.lineStyle(3, previewColor, 0.85);
                this.rearrangePreviewGraphics.beginPath();
                this.rearrangePreviewGraphics.moveTo(parentG.container.x, parentG.container.y);
                this.rearrangePreviewGraphics.lineTo(rootPreview.x, rootPreview.y);
                this.rearrangePreviewGraphics.strokePath();
            }
        }

        if (this.biddingTargetId) {
            if (this.attackingChainIds.length > 0) {
                this._drawBiddingArrow(this.attackingChainIds[0], this.biddingTargetId, 0xfb923c, 0);
            }
            if (this.activeBidders) {
                this.activeBidders.forEach((bidder, idx) => {
                    if (bidder.id === this.biddingTargetId) return;
                    let color = 0xfacc15;
                    if (bidder.role === 'attacker') color = 0xfb923c;
                    else if (bidder.role === 'defender') color = 0x22c55e;
                    this._drawBiddingArrow(bidder.id, this.biddingTargetId, color, idx * 0.2);
                });
            }
        }

        Object.values(this._lastGraphData.nodes).forEach(node => {
            const g = this.nodeGraphics[node.id];
            if (!g || !g.domElement || !g.glow) return;

            const isHighlightedPlayer = this.highlightedPlayerId && node.owner === this.highlightedPlayerId;
            const isSelected = this.selectedNodeId === node.id;
            const isAttacker = this.attackingChainIds.includes(node.id);
            const isBiddingTarget = this.biddingTargetId === node.id;
            const isTutorialHighlight = this.tutorialHighlightId === node.id;

            let isBidder = false;
            let bidderStance = 'defend';
            if (this.activeBidders) {
                const b = this.activeBidders.find(b => b.id === node.id);
                if (b) { isBidder = true; bidderStance = b.stance; }
            }

            if (isTutorialHighlight) {
                // Strong, slow pulse in tutorial accent green so the player can't miss it
                const pulse = 0.55 + Math.sin(this.time.now * 0.006) * 0.3;
                g.glow.fillAlpha = pulse;
                g.glow.fillColor = 0x4ade80;
            } else if (isAttacker || isBidder) {
                const pulse = 0.3 + Math.sin(this.time.now * 0.01) * 0.2;
                g.glow.fillAlpha = pulse;
                g.glow.fillColor = isAttacker ? 0xfb923c : (bidderStance === 'support' ? 0x22c55e : 0xfacc15);
            } else if (isBiddingTarget) {
                const pulse = 0.3 + Math.sin(this.time.now * 0.01 + Math.PI) * 0.2;
                g.glow.fillAlpha = pulse;
                let origColor = COLORS.NODE_NEUTRAL;
                if (node.owner === this._lastPlayerId) origColor = COLORS.NODE_CONTROLLED;
                else if (node.owner) origColor = COLORS.NODE_ENEMY;
                g.glow.fillColor = origColor;
            } else if (isHighlightedPlayer) {
                g.glow.fillAlpha = 0.4 + Math.sin(this.time.now * 0.01) * 0.1;
                g.glow.fillColor = node.owner === this._lastPlayerId ? COLORS.NODE_CONTROLLED : COLORS.NODE_ENEMY;
            } else if (isSelected) {
                g.glow.fillAlpha = 0.4;
                g.glow.fillColor = 0xffd700; // Gold halo for selected
            } else {
                if (node.owner === this._lastPlayerId) {
                    g.glow.fillAlpha = 0.15;
                    g.glow.fillColor = COLORS.NODE_CONTROLLED;
                } else if (node.owner) {
                    g.glow.fillAlpha = 0.15;
                    g.glow.fillColor = COLORS.NODE_ENEMY;
                } else {
                    g.glow.fillAlpha = 0;
                    g.glow.fillColor = COLORS.NODE_NEUTRAL;
                }
            }
            
            // Set the DOM element's border shadow instead of drawing a canvas stroke
            if (g.glow.fillAlpha > 0) {
                const hexColor = '#' + g.glow.fillColor.toString(16).padStart(6, '0');
                const opacity = Math.min(1, g.glow.fillAlpha + 0.3); // Boost opacity slightly for the CSS shadow
                g.domElement.node.style.boxShadow = `0 0 25px 5px rgba(${parseInt(hexColor.slice(1,3),16)}, ${parseInt(hexColor.slice(3,5),16)}, ${parseInt(hexColor.slice(5,7),16)}, ${opacity})`;
                g.domElement.node.style.borderColor = hexColor;
            } else {
                g.domElement.node.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.5)';
                g.domElement.node.style.borderColor = '#111';
            }
        });
    }

    // ═══════════════════════════════════════
    //  BIDDING WAR ARROWS
    // ═══════════════════════════════════════
    _drawBiddingArrow(sourceId, targetId, color, timeOffset = 0) {
        const srcG = this.nodeGraphics[sourceId];
        const tgtG = this.nodeGraphics[targetId];
        if (!srcG || !tgtG) return;

        const sx = srcG.container.x;
        const sy = srcG.container.y;
        const tx = tgtG.container.x;
        const ty = tgtG.container.y;

        this.attackLinkGraphics.lineStyle(4, color, 0.8);
        this.attackLinkGraphics.beginPath();
        this.attackLinkGraphics.moveTo(sx, sy);
        this.attackLinkGraphics.lineTo(tx, ty);
        this.attackLinkGraphics.strokePath();

        const t = ((this.time.now * 0.002) + timeOffset) % 1;
        const ax = sx + (tx - sx) * t;
        const ay = sy + (ty - sy) * t;
        const angle = Math.atan2(ty - sy, tx - sx);
        this.attackLinkGraphics.fillStyle(color, 1);
        this.attackLinkGraphics.beginPath();
        this.attackLinkGraphics.moveTo(ax + Math.cos(angle) * 15, ay + Math.sin(angle) * 15);
        this.attackLinkGraphics.lineTo(ax + Math.cos(angle + 2.5) * 15, ay + Math.sin(angle + 2.5) * 15);
        this.attackLinkGraphics.lineTo(ax + Math.cos(angle - 2.5) * 15, ay + Math.sin(angle - 2.5) * 15);
        this.attackLinkGraphics.closePath();
        this.attackLinkGraphics.fillPath();
    }

    setCallbacks(onNodeSelected, onNodeDragged, onNodeHovered, onNodeUnhovered, onNodeHoverMoved) {
        this.onNodeSelected = onNodeSelected;
        this.onNodeDragged = onNodeDragged || null;
        this.onNodeHovered = onNodeHovered || null;
        this.onNodeUnhovered = onNodeUnhovered || null;
        this.onNodeHoverMoved = onNodeHoverMoved || null;
    }

    /**
     * Hit-test all node graphics against a world position.
     * Returns the nodeId of the topmost node under (worldX, worldY), or null.
     */
    _hitTestNodes(worldX, worldY) {
        if (!this._lastGraphData) return null;
        // Iterate all nodes; if multiple overlap, the last one wins (highest depth)
        let hitId = null;
        for (const [nodeId, g] of Object.entries(this.nodeGraphics)) {
            if (!g.container) continue;
            const cx = g.container.x;
            const cy = g.container.y;
            const liveNode = this._lastGraphData.nodes[nodeId];
            const aabb = liveNode ? getNodeAabb(liveNode) : { halfWidth: HALF_W, halfHeight: HALF_H };
            if (worldX >= cx - aabb.halfWidth && worldX <= cx + aabb.halfWidth &&
                worldY >= cy - aabb.halfHeight && worldY <= cy + aabb.halfHeight) {
                hitId = nodeId;
            }
        }
        return hitId;
    }

    _getDescendantIds(nodeId) {
        const ids = [];
        const stack = [nodeId];
        while (stack.length > 0) {
            const currentId = stack.pop();
            const children = Object.values(this._lastGraphData?.nodes || {}).filter(n => n.parentId === currentId);
            children.forEach(child => {
                ids.push(child.id);
                stack.push(child.id);
            });
        }
        return ids;
    }

    _positionDraggedBranch(rootX, rootY) {
        if (!this.draggingNodeId) return;

        const allIds = [this.draggingNodeId, ...this.draggingBranchIds];
        allIds.forEach(id => {
            const g = this.nodeGraphics[id];
            const offset = this.dragOffsets[id];
            if (!g || !offset) return;
            g.container.setPosition(rootX + offset.x, rootY + offset.y);
        });
    }

    _positionDraggedBranchToPreview(previewNodes) {
        if (!previewNodes) return;
        Object.entries(previewNodes).forEach(([id, previewNode]) => {
            const g = this.nodeGraphics[id];
            if (!g || !previewNode) return;
            g.container.setPosition(previewNode.x, previewNode.y);
            g.container.setRotation((getNodeRotation(previewNode) * Math.PI) / 2);
        });
    }

    setRearrangePreview(preview) {
        this.rearrangePreview = preview || null;
    }

    clearRearrangePreview() {
        this.rearrangePreview = null;
        if (this.rearrangePreviewGraphics) {
            this.rearrangePreviewGraphics.clear();
        }
    }

    // ═══════════════════════════════════════
    //  DRAW PORT ARROWS ON CARD EDGES
    // ═══════════════════════════════════════
    drawArrowSlots(graphicsObj, node, allNodes, color) {
        // We're delegating arrow and slot rendering entirely to the CSS/DOM layer now.
        // We just clear out any old graphics objects that might remain.
        if (graphicsObj.arrowSlots) {
            graphicsObj.arrowSlots.clear();
        }
    }

    // ═══════════════════════════════════════
    //  LINK ENDPOINT CALCULATION
    //  Connects outgoing port of source → incoming port of target
    // ═══════════════════════════════════════
    _getLinkEndpoints(srcNode, tgtNode, srcG, tgtG) {
        const srcCx = srcG ? srcG.container.x : srcNode.x;
        const srcCy = srcG ? srcG.container.y : srcNode.y;
        const tgtCx = tgtG ? tgtG.container.x : tgtNode.x;
        const tgtCy = tgtG ? tgtG.container.y : tgtNode.y;

        const resolvedParentSide = getResolvedParentPortSide(this._lastGraphData?.nodes || {}, tgtNode);
        const srcSide = resolvedParentSide ?? getPortLayout(srcNode).outgoing[0] ?? 2;
        const tgtSide = getPortLayout(tgtNode).incoming;

        const srcPort = getPortWorldTipOffset(srcNode, srcSide);
        const tgtPort = tgtSide !== null ? getPortWorldOffset(tgtNode, tgtSide) : { x: 0, y: 0 };

        return {
            sx: srcCx + srcPort.x,
            sy: srcCy + srcPort.y,
            tx: tgtCx + tgtPort.x,
            ty: tgtCy + tgtPort.y
        };
    }

    // ═══════════════════════════════════════
    //  MAIN GRAPH UPDATE
    // ═══════════════════════════════════════
    updateGraph(graphData, myPlayerId) {
        // Clean up destroyed nodes
        Object.keys(this.nodeGraphics).forEach(nodeId => {
            if (!graphData.nodes[nodeId]) {
                this.nodeGraphics[nodeId].container.destroy();
                delete this.nodeGraphics[nodeId];
            }
        });

        // Clean up removed links
        const activeLinkIds = new Set(graphData.links.map(l => `${l.source}-${l.target}`));
        Object.keys(this.linkGraphics).forEach(linkId => {
            if (!activeLinkIds.has(linkId)) {
                this.linkGraphics[linkId].destroy();
                delete this.linkGraphics[linkId];
            }
        });

        // Draw Links
        graphData.links.forEach(link => {
            const id = `${link.source}-${link.target}`;
            if (!this.linkGraphics[id]) {
                const line = this.add.graphics();
                line.setDepth(1);
                this.linkGraphics[id] = line;
            }

            const src = graphData.nodes[link.source];
            const tgt = graphData.nodes[link.target];

            if (src && tgt) {
                const lineG = this.linkGraphics[id];
                lineG.clear();
                // Attached cards now physically touch via ports, so network links are implied by contact.
                // Keep the graphics object alive for live refresh bookkeeping, but don't draw the old connector lines.
            }
        });

        // Store for live redraw during drag
        this._lastGraphData = graphData;
        this._lastPlayerId = myPlayerId;

        // Draw Nodes
        Object.values(graphData.nodes).forEach(node => {
            const isNewNode = !this.nodeGraphics[node.id];
            if (isNewNode) {
                const container = this.add.container(node.x, node.y);
                container.setDepth(2);
                container.setSize(CARD_W, CARD_H);
                
                // Create an invisible hit area for mouse interaction
                const hitArea = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x000000, 0);
                hitArea.setInteractive({ useHandCursor: true });

                const glow = this.add.rectangle(0, 0, CARD_W + 16, CARD_H + 16, 0xffffff, 0);
                
                const isRoot = node.type === 'root';
                const isAction = node.type === 'action';
                const cardHtml = createPlayingCardHTML(node, isAction, isRoot);

                const domElement = this.add.dom(0, 0, 'div');
                domElement.node.innerHTML = cardHtml;
                domElement.setClassName('playing-card');
                const styleMarker = domElement.node.querySelector('.card-alignment-style');
                if (styleMarker?.dataset?.cardStyle) domElement.node.style.cssText += styleMarker.dataset.cardStyle;
                // Phaser DOM elements need explicit sizing if their contents use percentages
                domElement.node.style.width = `${CARD_W}px`;
                domElement.node.style.height = `${CARD_H}px`;
                domElement.node.style.transform = 'translate(-50%, -50%)'; // Center origin behavior
                domElement.node.style.pointerEvents = 'none'; // CRITICAL: Let Phaser canvas receive pointer events

                container.add([glow, domElement, hitArea]);

                const nodeId = node.id;

                // All pointer interaction (hover, click, drag) is handled by native
                // DOM events on the parent container. The hitArea is kept for visual
                // bounds reference only. No Phaser pointer events needed.

                hitArea._nodeId = nodeId; // Tag for hit-testing lookups
                this.nodeGraphics[node.id] = { container, domElement, glow, hitArea };

                if (this._hasRenderedGraphOnce && node.type !== 'root') {
                    const fromX = node.owner ? node.x - 120 : (this.neutralZoneTarget?.x ?? node.x);
                    const fromY = node.owner ? node.y - 180 : (this.neutralZoneTarget?.y ?? node.y - 260);
                    container.setPosition(fromX, fromY);
                    container.setAlpha(0);
                    container.setScale(0.72);
                    domElement.node.classList.add('board-card-drawing');
                    this.tweens.add({
                        targets: container,
                        x: node.x,
                        y: node.y,
                        alpha: 1,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 620,
                        ease: 'Back.Out',
                        onComplete: () => {
                            domElement.node.classList.remove('board-card-drawing');
                        }
                    });
                    this.tweens.add({
                        targets: glow,
                        alpha: { from: 0.8, to: 0 },
                        duration: 780,
                        ease: 'Sine.Out'
                    });
                }
            }

            const g = this.nodeGraphics[node.id];

            // Update HTML inside the DOM element based on any state changes
            const isRoot = node.type === 'root';
            const isAction = node.type === 'action';
            const cardHtml = createPlayingCardHTML(node, isAction, isRoot);
            
            // Simple string replacement if the content changed
            if (g.domElement.node.innerHTML !== cardHtml) {
                g.domElement.node.innerHTML = cardHtml;
            }
            const styleMarker = g.domElement.node.querySelector('.card-alignment-style');
            g.domElement.node.style.background = '';
            g.domElement.node.style.borderColor = '';
            g.domElement.node.style.boxShadow = '';
            if (styleMarker?.dataset?.cardStyle) g.domElement.node.style.cssText += styleMarker.dataset.cardStyle;

            // Don't override position while dragging, pending-clicking, or while a new card is flying in
            const isBeingDragged = this.draggingNodeId === node.id || (this.draggingBranchIds && this.draggingBranchIds.includes(node.id));
            if (!isNewNode && !isBeingDragged && this._pendingClickNodeId !== node.id) {
                g.container.setPosition(node.x, node.y);
            }
            // Lock rotation while dragging too — otherwise an incoming network sync
            // or action card that flips a node's rotation mid-drag can make the
            // dragged sub-tree spin under the cursor.
            if (!isBeingDragged) {
                g.container.setRotation((getNodeRotation(node) * Math.PI) / 2);
            }

            let color = COLORS.NODE_NEUTRAL;
            if (node.owner === myPlayerId) {
                color = COLORS.NODE_CONTROLLED;
            } else if (node.owner) {
                color = COLORS.NODE_ENEMY;
            }

            if (node.id === this.selectedNodeId) {
                g.domElement.node.style.transform = 'translate(-50%, -50%) translateY(-5px)';
            } else {
                g.domElement.node.style.transform = 'translate(-50%, -50%)';
            }

            this.drawArrowSlots(g, node, graphData.nodes, color);

            // Update rotation of the arrows inside the card HTML so they rotate with the card
            const rotSteps = getNodeRotation(node);
            const domArrowContainer = g.domElement.node.querySelector('.card-arrows-container');
            if (domArrowContainer) {
                // If the card is rotated in Phaser, the internal DOM needs counter-rotation? 
                // Actually the whole DOM element is rotated by Phaser, but the arrows are placed via CSS.
                // Phaser rotates the container, which rotates the DOM element. The CSS arrows are already inside it.
                // But the visual arrows need to represent the layout.
            }

            // Dim nodes that have already acted this round (deployed)
            if (!isNewNode) {
                if (node.hasActedThisRound && node.owner === myPlayerId) {
                    g.container.setAlpha(0.45);
                } else {
                    g.container.setAlpha(1);
                }
            }
        });

        this._hasRenderedGraphOnce = true;
    }

    // ═══════════════════════════════════════
    //  DRAW A SINGLE LINK
    // ═══════════════════════════════════════
    _drawLink(g, sx, sy, tx, ty, srcNode, tgtNode, myPlayerId) {
        g.clear();

        let linkColor = COLORS.LINK;
        let alpha = 0.5;
        if (srcNode.owner === myPlayerId && tgtNode.owner === myPlayerId) {
            linkColor = COLORS.LINK_ACTIVE;
            alpha = 0.8;
        } else if (srcNode.owner && tgtNode.owner && srcNode.owner === tgtNode.owner) {
            linkColor = COLORS.NODE_ENEMY;
            alpha = 0.8;
        }

        g.lineStyle(3, linkColor, alpha);

        if (linkColor !== COLORS.LINK) {
            g.beginPath();
            g.moveTo(sx, sy);
            g.lineTo(tx, ty);
            g.strokePath();

            const dx = tx - sx;
            const dy = ty - sy;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                const nx = dx / len;
                const ny = dy / len;
                const arrowX = sx + nx * len * 0.65;
                const arrowY = sy + ny * len * 0.65;
                const arrowSize = 12;
                const perpX = -ny;
                const perpY = nx;

                g.fillStyle(linkColor, alpha);
                g.fillTriangle(
                    arrowX + nx * arrowSize, arrowY + ny * arrowSize,
                    arrowX + perpX * arrowSize * 0.5, arrowY + perpY * arrowSize * 0.5,
                    arrowX - perpX * arrowSize * 0.5, arrowY - perpY * arrowSize * 0.5
                );
            }
        } else {
            g.lineStyle(3, COLORS.LINK, 0.4);
            const line = new Phaser.Geom.Line(sx, sy, tx, ty);
            const points = line.getPoints(Math.floor(Phaser.Geom.Line.Length(line) / 20));
            for (let i = 0; i < points.length - 1; i += 2) {
                g.beginPath();
                g.moveTo(points[i].x, points[i].y);
                g.lineTo(points[i + 1].x, points[i + 1].y);
                g.strokePath();
            }
        }
    }

    // ═══════════════════════════════════════
    //  LIVE REDRAW DURING DRAG
    // ═══════════════════════════════════════
    _redrawLinksLive() {
        if (!this._lastGraphData) return;
        const graphData = this._lastGraphData;
        const myPlayerId = this._lastPlayerId;

        graphData.links.forEach(link => {
            const id = `${link.source}-${link.target}`;
            const lineG = this.linkGraphics[id];
            if (!lineG) return;

            const src = graphData.nodes[link.source];
            const tgt = graphData.nodes[link.target];
            if (!src || !tgt) return;

            const srcG = this.nodeGraphics[link.source];
            const tgtG = this.nodeGraphics[link.target];
            const ep = this._getLinkEndpoints(src, tgt, srcG, tgtG);
            this._drawLink(lineG, ep.sx, ep.sy, ep.tx, ep.ty, src, tgt, myPlayerId);
        });
    }

    setBiddingWarHighlights(attackingChainIds, targetNodeId, activeBidders = []) {
        this.attackingChainIds = attackingChainIds || [];
        this.biddingTargetId = targetNodeId;
        this.activeBidders = activeBidders;

        if ((this.attackingChainIds.length > 0 || this.activeBidders.length > 0) && targetNodeId) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const ids = [...this.attackingChainIds, targetNodeId];
            this.activeBidders.forEach(b => ids.push(b.id));
            let foundCount = 0;

            ids.forEach(id => {
                const g = this.nodeGraphics[id];
                if (g) {
                    minX = Math.min(minX, g.container.x);
                    minY = Math.min(minY, g.container.y);
                    maxX = Math.max(maxX, g.container.x);
                    maxY = Math.max(maxY, g.container.y);
                    foundCount++;
                }
            });

            if (foundCount > 0) {
                const width = Math.max(1200, (maxX - minX) * 2.5);
                const height = Math.max(800, (maxY - minY) * 2.5);
                const cx = (minX + maxX) / 2;
                const cy = (minY + maxY) / 2;
                const zoomX = this.cameras.main.width / width;
                const zoomY = this.cameras.main.height / height;
                const targetZoom = Phaser.Math.Clamp(Math.min(zoomX, zoomY), 0.3, 0.8);
                this.cameras.main.pan(cx, cy, 500, 'Power2');
                this.cameras.main.zoomTo(targetZoom, 500, 'Power2');
            }
        } else {
            this.cameras.main.zoomTo(0.9, 500, 'Power2');
        }
    }

    setPlayerHighlight(playerId) {
        this.highlightedPlayerId = playerId;
    }

    centerCameraOn(x, y, duration = 500) {
        const cam = this.cameras.main;
        cam.stopFollow();
        cam.pan(x, y, duration, 'Power2');
    }

    zoomCameraTo(zoom, duration = 500) {
        this.cameras.main.zoomTo(zoom, duration, 'Power2');
    }

    snapCameraTo(x, y, zoom = null) {
        const cam = this.cameras.main;
        cam.stopFollow();
        if (cam.panEffect?.isRunning) cam.panEffect.reset();
        if (cam.zoomEffect?.isRunning) cam.zoomEffect.reset();
        if (zoom !== null && zoom !== undefined) cam.setZoom(zoom);
        cam.centerOn(x, y);
    }

    selectNode(id) {
        this.selectedNodeId = id;
    }

    // ═══════════════════════════════════════
    //  PARTICLE EFFECTS
    // ═══════════════════════════════════════
    playNodeEffect(nodeId, type) {
        const nodeG = this.nodeGraphics[nodeId];
        if (!nodeG) return;

        const x = nodeG.container.x;
        const y = nodeG.container.y;

        let color = 0xffffff;
        let speed = 200;
        let scale = { start: 0.5, end: 0 };
        let count = 20;

        switch (type) {
            case 'attack':
                color = 0xeab308; speed = { min: 100, max: 300 }; scale = { start: 0.8, end: 0 }; count = 30; break;
            case 'debuff':
                color = 0xef4444; speed = { min: 50, max: 250 }; scale = { start: 0.6, end: 0 }; count = 25; break;
            case 'buff':
                color = 0x3b82f6; speed = { min: 50, max: 200 }; scale = { start: 0.7, end: 0 }; count = 25; break;
            case 'economy':
                color = 0x22c55e; speed = { min: 20, max: 150 }; scale = { start: 0.5, end: 0 }; count = 40; break;
            case 'special':
                color = 0xa855f7; speed = { min: 100, max: 400 }; scale = { start: 0.4, end: 0 }; count = 50; break;
            case 'neutralize':
                color = 0xf59e0b; speed = { min: 150, max: 400 }; scale = { start: 0.8, end: 0.1 }; count = 40; break;
            case 'destroy':
                color = 0x7f1d1d; speed = { min: 200, max: 500 }; scale = { start: 1.0, end: 0 }; count = 60; break;
        }

        const emitter = this.add.particles(x, y, 'particle_dot', {
            speed, scale, blendMode: 'ADD', tint: color, lifespan: 800, gravityY: 0, quantity: count, emitting: false
        });
        emitter.setDepth(10);
        emitter.explode();
        this.time.delayedCall(1000, () => { emitter.destroy(); });
    }

    playBiddingBlast(nodeId, overrideColor = null) {
        const nodeG = this.nodeGraphics[nodeId];
        if (!nodeG) return;

        const x = nodeG.container.x;
        const y = nodeG.container.y;

        const blastColor = overrideColor || 0xfacc15;

        // Create a dramatic shockwave effect
        const circle = this.add.circle(x, y, 10, blastColor, 0.8);
        circle.setDepth(15);
        this.tweens.add({
            targets: circle,
            radius: 300,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => circle.destroy()
        });

        // Add some burst particles
        const emitter = this.add.particles(x, y, 'particle_dot', {
            speed: { min: 200, max: 600 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            tint: [blastColor, 0xffffff],
            lifespan: 800,
            quantity: 40,
            emitting: false
        });
        emitter.setDepth(16);
        emitter.explode();
        this.time.delayedCall(1000, () => emitter.destroy());
    }

    playGlitchEffect(nodeId) {
        const nodeG = this.nodeGraphics[nodeId];
        if (!nodeG) return;

        const dom = nodeG.domElement.node;
        // Basic CSS glitch effect using filters and offsets
        const originalFilter = dom.style.filter;
        const originalTransform = dom.style.transform;

        let frames = 0;
        const interval = setInterval(() => {
            frames++;
            if (frames > 15) {
                clearInterval(interval);
                dom.style.filter = originalFilter;
                dom.style.transform = originalTransform;
                return;
            }

            const offX = (Math.random() - 0.5) * 10;
            const offY = (Math.random() - 0.5) * 10;
            const hue = Math.floor(Math.random() * 360);
            
            dom.style.filter = `hue-rotate(${hue}deg) brightness(1.5) contrast(1.2) drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))`;
            dom.style.transform = `translate(-50%, -50%) translate(${offX}px, ${offY}px) scale(${1 + Math.random() * 0.1})`;
        }, 40);
    }
}
