import * as fabric from 'fabric';

/**
 * Initialize alignment guidelines and distance indicators for a Fabric canvas.
 * Based on the official Fabric.js aligning_guidelines.js but adapted for TypeScript and enhanced with distance indicators.
 */
export const initAlignmentGuidelines = (canvas: fabric.Canvas) => {
    const aligningLineOffset = 5;
    const aligningLineMargin = 2;
    const aligningLineWidth = 1;
    const aligningLineColor = '#FF0078';
    const distanceLineColor = '#1E88E5';

    let verticalLines: { x: number; y1: number; y2: number }[] = [];
    let horizontalLines: { y: number; x1: number; x2: number }[] = [];
    let distanceLines: { x1: number; y1: number; x2: number; y2: number; text: string }[] = [];

    // Helper to draw lines
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string, isDistance = false) => {
        const ctx = canvas.getSelectionContext();
        if (!ctx) return;
        const viewportTransform = canvas.viewportTransform;
        if (!viewportTransform) return;

        // Transform coordinates to canvas space
        const p1 = fabric.util.transformPoint(new fabric.Point(x1, y1), viewportTransform);
        const p2 = fabric.util.transformPoint(new fabric.Point(x2, y2), viewportTransform);

        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        if (isDistance) {
            const headSize = 4;
            ctx.beginPath();
            // Draw simple arrow heads
            if (Math.abs(x1 - x2) < 0.1) { // Vertical
                ctx.moveTo(p1.x - headSize, p1.y);
                ctx.lineTo(p1.x + headSize, p1.y);
                ctx.moveTo(p2.x - headSize, p2.y);
                ctx.lineTo(p2.x + headSize, p2.y);
            } else { // Horizontal
                ctx.moveTo(p1.x, p1.y - headSize);
                ctx.lineTo(p1.x, p1.y + headSize);
                ctx.moveTo(p2.x, p2.y - headSize);
                ctx.lineTo(p2.x, p2.y + headSize);
            }
            ctx.stroke();
        }

        ctx.restore();
    };

    const drawVerticalLine = (coords: { x: number; y1: number; y2: number }) => {
        drawLine(
            coords.x,
            coords.y1 > coords.y2 ? coords.y2 : coords.y1,
            coords.x,
            coords.y2 > coords.y1 ? coords.y2 : coords.y1,
            aligningLineColor
        );
    };

    const drawHorizontalLine = (coords: { y: number; x1: number; x2: number }) => {
        drawLine(
            coords.x1 > coords.x2 ? coords.x2 : coords.x1,
            coords.y,
            coords.x2 > coords.x1 ? coords.x2 : coords.x1,
            coords.y,
            aligningLineColor
        );
    };

    const drawText = (x: number, y: number, text: string) => {
        const ctx = canvas.getSelectionContext();
        if (!ctx) return;
        const viewportTransform = canvas.viewportTransform;
        if (!viewportTransform) return;

        const p = fabric.util.transformPoint(new fabric.Point(x, y), viewportTransform);

        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(text);
        const padding = 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(p.x - metrics.width / 2 - padding, p.y - 10, metrics.width + padding * 2, 20);

        ctx.fillStyle = distanceLineColor;
        ctx.fillText(text, p.x, p.y);
        ctx.restore();
    };

    const handleObjectMoving = (e: any) => {
        const activeObject = e.target;
        const canvasObjects = canvas.getObjects();
        const activeObjectCenter = activeObject.getCenterPoint();
        const activeObjectBoundingRect = activeObject.getBoundingRect();
        const activeObjectHeight = activeObjectBoundingRect.height;
        const activeObjectWidth = activeObjectBoundingRect.width;

        verticalLines = [];
        horizontalLines = [];
        distanceLines = [];

        const transform = canvas.viewportTransform;
        if (!transform) return;

        const canvasWidth = canvas.width! / canvas.getZoom();
        const canvasHeight = canvas.height! / canvas.getZoom();
        const canvasCenter = new fabric.Point(canvasWidth / 2, canvasHeight / 2);

        // Collect snap candidates (now just for visual guides)
        const verticalCandidates: { dist: number, line: any }[] = [];
        const horizontalCandidates: { dist: number, line: any }[] = [];

        const addVerticalCandidate = (target: number, current: number, line: any) => {
            const dist = Math.abs(target - current);
            if (dist <= aligningLineMargin) {
                verticalCandidates.push({ dist, line });
            }
        };

        const addHorizontalCandidate = (target: number, current: number, line: any) => {
            const dist = Math.abs(target - current);
            if (dist <= aligningLineMargin) {
                horizontalCandidates.push({ dist, line });
            }
        };

        // --- VISUAL GUIDES TO CANVAS CENTER ---
        addVerticalCandidate(canvasCenter.x, activeObjectCenter.x, { x: canvasCenter.x, y1: 0, y2: canvasHeight });
        addHorizontalCandidate(canvasCenter.y, activeObjectCenter.y, { y: canvasCenter.y, x1: 0, x2: canvasWidth });

        // --- VISUAL GUIDES TO OBJECTS & DISTANCE ---
        for (let i = canvasObjects.length; i--;) {
            if (canvasObjects[i] === activeObject) continue;
            if (canvasObjects[i].excludeFromExport || !canvasObjects[i].visible) continue;
            if (activeObject instanceof fabric.ActiveSelection && (activeObject as any)._objects?.includes(canvasObjects[i])) continue;

            const objectCenter = canvasObjects[i].getCenterPoint();
            const objectBoundingRect = canvasObjects[i].getBoundingRect();
            const objectHeight = objectBoundingRect.height;
            const objectWidth = objectBoundingRect.width;

            // VISUAL GUIDES VERTICAL
            // Center - Center
            addVerticalCandidate(objectCenter.x, activeObjectCenter.x, {
                x: objectCenter.x,
                y1: Math.min(objectBoundingRect.top, activeObjectBoundingRect.top) - aligningLineOffset,
                y2: Math.max(objectBoundingRect.top + objectHeight, activeObjectBoundingRect.top + activeObjectHeight) + aligningLineOffset
            });

            // Left - Left
            addVerticalCandidate(objectBoundingRect.left, activeObjectBoundingRect.left, {
                x: objectBoundingRect.left,
                y1: Math.min(objectBoundingRect.top, activeObjectBoundingRect.top) - aligningLineOffset,
                y2: Math.max(objectBoundingRect.top + objectHeight, activeObjectBoundingRect.top + activeObjectHeight) + aligningLineOffset
            });

            // Right - Right
            addVerticalCandidate(objectBoundingRect.left + objectWidth, activeObjectBoundingRect.left + activeObjectWidth, {
                x: objectBoundingRect.left + objectWidth,
                y1: Math.min(objectBoundingRect.top, activeObjectBoundingRect.top) - aligningLineOffset,
                y2: Math.max(objectBoundingRect.top + objectHeight, activeObjectBoundingRect.top + activeObjectHeight) + aligningLineOffset
            });

            // VISUAL GUIDES HORIZONTAL
            // Center - Center
            addHorizontalCandidate(objectCenter.y, activeObjectCenter.y, {
                y: objectCenter.y,
                x1: Math.min(objectBoundingRect.left, activeObjectBoundingRect.left) - aligningLineOffset,
                x2: Math.max(objectBoundingRect.left + objectWidth, activeObjectBoundingRect.left + activeObjectWidth) + aligningLineOffset
            });

            // Top - Top
            addHorizontalCandidate(objectBoundingRect.top, activeObjectBoundingRect.top, {
                y: objectBoundingRect.top,
                x1: Math.min(objectBoundingRect.left, activeObjectBoundingRect.left) - aligningLineOffset,
                x2: Math.max(objectBoundingRect.left + objectWidth, activeObjectBoundingRect.left + activeObjectWidth) + aligningLineOffset
            });

            // Bottom - Bottom
            addHorizontalCandidate(objectBoundingRect.top + objectHeight, activeObjectBoundingRect.top + activeObjectHeight, {
                y: objectBoundingRect.top + objectHeight,
                x1: Math.min(objectBoundingRect.left, activeObjectBoundingRect.left) - aligningLineOffset,
                x2: Math.max(objectBoundingRect.left + objectWidth, activeObjectBoundingRect.left + activeObjectWidth) + aligningLineOffset
            });

            // DISTANCE INDICATORS
            // Horizontal Distance
            if (Math.abs(activeObjectCenter.y - objectCenter.y) < (activeObjectHeight + objectHeight) / 2) {
                let gap = 0, x1 = 0, x2 = 0;
                if (activeObjectBoundingRect.left > objectBoundingRect.left + objectWidth) {
                    gap = activeObjectBoundingRect.left - (objectBoundingRect.left + objectWidth);
                    x1 = objectBoundingRect.left + objectWidth;
                    x2 = activeObjectBoundingRect.left;
                } else if (activeObjectBoundingRect.left + activeObjectWidth < objectBoundingRect.left) {
                    gap = objectBoundingRect.left - (activeObjectBoundingRect.left + activeObjectWidth);
                    x1 = activeObjectBoundingRect.left + activeObjectWidth + 0;
                    x2 = objectBoundingRect.left;
                }
                if (gap > 0 && gap < 500) {
                    distanceLines.push({ x1, y1: activeObjectCenter.y, x2, y2: activeObjectCenter.y, text: Math.round(gap).toString() });
                }
            }
            // Vertical Distance
            if (Math.abs(activeObjectCenter.x - objectCenter.x) < (activeObjectWidth + objectWidth) / 2) {
                let gap = 0, y1 = 0, y2 = 0;
                if (activeObjectBoundingRect.top > objectBoundingRect.top + objectHeight) {
                    gap = activeObjectBoundingRect.top - (objectBoundingRect.top + objectHeight);
                    y1 = objectBoundingRect.top + objectHeight;
                    y2 = activeObjectBoundingRect.top;
                } else if (activeObjectBoundingRect.top + activeObjectHeight < objectBoundingRect.top) {
                    gap = objectBoundingRect.top - (activeObjectBoundingRect.top + activeObjectHeight);
                    y1 = activeObjectBoundingRect.top + activeObjectHeight;
                    y2 = objectBoundingRect.top;
                }
                if (gap > 0 && gap < 500) {
                    distanceLines.push({ x1: activeObjectCenter.x, y1, x2: activeObjectCenter.x, y2, text: Math.round(gap).toString() });
                }
            }
        }

        // Show Visual Guides (NO SNAPPING)
        if (verticalCandidates.length > 0) {
            verticalCandidates.sort((a, b) => a.dist - b.dist);
            // Show lines for all close candidates to give feedback
            for (const c of verticalCandidates) {
                // Only show if very close to the best match to avoid clutter
                if (Math.abs(c.dist - verticalCandidates[0].dist) < 1) {
                    verticalLines.push(c.line);
                }
            }
        }

        if (horizontalCandidates.length > 0) {
            horizontalCandidates.sort((a, b) => a.dist - b.dist);
            for (const c of horizontalCandidates) {
                if (Math.abs(c.dist - horizontalCandidates[0].dist) < 1) {
                    horizontalLines.push(c.line);
                }
            }
        }

        // Force render to show lines immediately
        canvas.requestRenderAll();
    };

    const handleBeforeRender = () => {
        const ctx = canvas.getSelectionContext();
        if (!ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    };

    const handleAfterRender = () => {
        for (let i = verticalLines.length; i--;) drawVerticalLine(verticalLines[i]);
        for (let i = horizontalLines.length; i--;) drawHorizontalLine(horizontalLines[i]);
        for (let i = distanceLines.length; i--;) {
            const line = distanceLines[i];
            drawLine(line.x1, line.y1, line.x2, line.y2, distanceLineColor, true);
            drawText((line.x1 + line.x2) / 2, (line.y1 + line.y2) / 2, line.text);
        }
    };

    const handleMouseUp = () => {
        verticalLines = [];
        horizontalLines = [];
        distanceLines = [];
        canvas.requestRenderAll();
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('before:render', handleBeforeRender);
    canvas.on('after:render', handleAfterRender);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
        canvas.off('object:moving', handleObjectMoving);
        canvas.off('before:render', handleBeforeRender);
        canvas.off('after:render', handleAfterRender);
        canvas.off('mouse:up', handleMouseUp);
    };
};
