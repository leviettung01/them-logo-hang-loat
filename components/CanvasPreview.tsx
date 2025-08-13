
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import type { LogoOptions, TextOptions, FilterOptions, FixedPosition } from '../types';

interface CanvasPreviewProps {
    sourceImage: HTMLImageElement | null;
    logoImage: HTMLImageElement | null;
    logoOptions: LogoOptions;
    textOptionsList: TextOptions[];
    filterOptions: FilterOptions;
    selectedTextId: string | null;
    onLogoOptionsChange: (options: LogoOptions) => void;
    onTextOptionsChange: (id: string, options: Partial<TextOptions>) => void;
    onSelectText: (id: string | null) => void;
}

type DragTarget = { type: 'logo' | 'text'; id: string } | null;

// Helper to calculate coordinates for fixed positioning
const calculateDynamicPosition = (
    imageWidth: number, imageHeight: number,
    elementWidth: number, elementHeight: number,
    position: FixedPosition, margin: number,
    initialX: number, initialY: number
) => {
    let x = initialX;
    let y = initialY;

    if (position === 'absolute') return { x, y };

    // Y-axis
    if (position.startsWith('top-')) {
        y = margin;
    } else if (position.startsWith('middle-') || position === 'center') {
        y = (imageHeight - elementHeight) / 2;
    } else if (position.startsWith('bottom-')) {
        y = imageHeight - elementHeight - margin;
    }

    // X-axis
    if (position.endsWith('-left')) {
        x = margin;
    } else if (position.endsWith('-center') || position === 'center') {
        x = (imageWidth - elementWidth) / 2;
    } else if (position.endsWith('-right')) {
        x = imageWidth - elementWidth - margin;
    }

    return { x, y };
};

export const CanvasPreview = forwardRef<HTMLCanvasElement, CanvasPreviewProps>(({
    sourceImage, logoImage, logoOptions, textOptionsList, filterOptions, selectedTextId,
    onLogoOptionsChange, onTextOptionsChange, onSelectText
}, ref) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    
    const [dragging, setDragging] = useState<DragTarget>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Clear and set size
        if (sourceImage) {
            canvas.width = sourceImage.width;
            canvas.height = sourceImage.height;

            // Apply filters
            ctx.filter = `brightness(${filterOptions.brightness}%) contrast(${filterOptions.contrast}%) grayscale(${filterOptions.grayscale}%) sepia(${filterOptions.sepia}%)`;
            ctx.drawImage(sourceImage, 0, 0);
            ctx.filter = 'none'; // Reset filter

        } else {
            canvas.width = 800; canvas.height=600;
            ctx.fillStyle = '#2d3748'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#a0aec0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '24px Arial'; ctx.fillText('Vui lòng chọn ảnh nguồn để bắt đầu', canvas.width / 2, canvas.height / 2);
            return; // Don't draw elements if no source image
        }

        // Draw Logo
        if (logoImage) {
            let finalLogo: HTMLImageElement | HTMLCanvasElement = logoImage;
             if(logoOptions.removeWhiteBg || logoOptions.removeGreenScreen){
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = logoImage.width; tempCanvas.height = logoImage.height;
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                if(tempCtx){
                   tempCtx.drawImage(logoImage, 0, 0);
                   const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                   const data = imageData.data;
                   for (let i = 0; i < data.length; i += 4) {
                       const r = data[i], g = data[i+1], b = data[i+2];
                       if (logoOptions.removeWhiteBg && r > 220 && g > 220 && b > 220) data[i+3] = 0;
                       if (logoOptions.removeGreenScreen && g > r && g > b && g > 100) data[i+3] = 0;
                   }
                   tempCtx.putImageData(imageData, 0, 0);
                   finalLogo = tempCanvas;
                }
            }
            const w = finalLogo.width * logoOptions.scale;
            const h = finalLogo.height * logoOptions.scale;
            const { x, y } = calculateDynamicPosition(
                canvas.width, canvas.height, w, h,
                logoOptions.position, logoOptions.margin,
                logoOptions.x, logoOptions.y
            );
            ctx.drawImage(finalLogo, x, y, w, h);
        }
        
        // Draw Text items
        textOptionsList.forEach(options => {
            ctx.save();
            ctx.font = `${options.size}px ${options.font}`;
            ctx.textBaseline = 'top';

            const lines = options.text.split('\n');
            const textHeight = lines.length * options.size * options.lineHeight;
            let maxWidth = 0;
            lines.forEach(line => {
                const lineWidth = ctx.measureText(line).width;
                if (lineWidth > maxWidth) maxWidth = lineWidth;
            });
            const textBlockWidth = maxWidth + options.padding * 2;
            const textBlockHeight = textHeight + options.padding * 2 - ((options.size * options.lineHeight) - options.size);

            const { x, y } = calculateDynamicPosition(
                canvas.width, canvas.height, textBlockWidth, textBlockHeight,
                options.position, options.margin,
                options.x, options.y
            );

            if (options.backgroundColor !== 'transparent') {
                ctx.fillStyle = options.backgroundColor;
                ctx.fillRect(x, y, textBlockWidth, textBlockHeight);
            }
            
            ctx.fillStyle = options.color;
            if (options.shadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
            }

            if (options.stroke) {
                ctx.strokeStyle = options.strokeColor;
                ctx.lineWidth = options.strokeWidth;
            }

            lines.forEach((line, i) => {
                let lineX = x + options.padding;
                const lineWidth = ctx.measureText(line).width;
                if (options.alignment === 'center') lineX = x + textBlockWidth / 2 - lineWidth / 2;
                else if (options.alignment === 'right') lineX = x + textBlockWidth - lineWidth - options.padding;
                const lineY = y + options.padding + (i * options.size * options.lineHeight);
                
                if (options.stroke) {
                    ctx.strokeText(line, lineX, lineY);
                }
                ctx.fillText(line, lineX, lineY);
            });
            
            // Draw selection box
            if (options.id === selectedTextId) {
                ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 3]);
                ctx.strokeRect(x, y, textBlockWidth, textBlockHeight);
                ctx.setLineDash([]);
            }
            ctx.restore();
        });
    };

    useEffect(draw, [sourceImage, logoImage, logoOptions, textOptionsList, filterOptions, selectedTextId]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        const ctx = canvasRef.current?.getContext('2d');
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        
        let hit = false;
        // Check for text hit (in reverse order to select top-most element)
        for (let i = textOptionsList.length - 1; i >= 0; i--) {
            const options = textOptionsList[i];
            ctx.font = `${options.size}px ${options.font}`;
            const lines = options.text.split('\n');
            const textHeight = lines.length * options.size * options.lineHeight;
            let maxWidth = 0;
            lines.forEach(line => { const lineWidth = ctx.measureText(line).width; if (lineWidth > maxWidth) maxWidth = lineWidth; });
            const textBlockWidth = maxWidth + options.padding * 2;
            const textBlockHeight = textHeight + options.padding * 2 - ((options.size * options.lineHeight) - options.size);

            const { x, y } = calculateDynamicPosition(canvas.width, canvas.height, textBlockWidth, textBlockHeight, options.position, options.margin, options.x, options.y);

            if (pos.x >= x && pos.x <= x + textBlockWidth && pos.y >= y && pos.y <= y + textBlockHeight) {
                onSelectText(options.id);
                if (options.position === 'absolute') { // Only allow dragging if position is absolute
                    setDragging({ type: 'text', id: options.id });
                    setDragStart({ x: pos.x - options.x, y: pos.y - options.y });
                }
                hit = true;
                return;
            }
        }
        
        // Check for logo hit
        if (logoImage) {
            const logoW = logoImage.width * logoOptions.scale;
            const logoH = logoImage.height * logoOptions.scale;
            const { x, y } = calculateDynamicPosition(canvas.width, canvas.height, logoW, logoH, logoOptions.position, logoOptions.margin, logoOptions.x, logoOptions.y);

            if (pos.x >= x && pos.x <= x + logoW && pos.y >= y && pos.y <= y + logoH) {
                onSelectText(null);
                if (logoOptions.position === 'absolute') { // Only allow dragging if position is absolute
                    setDragging({ type: 'logo', id: 'logo' });
                    setDragStart({ x: pos.x - logoOptions.x, y: pos.y - logoOptions.y });
                }
                hit = true;
                return;
            }
        }
        
        if (!hit) onSelectText(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragging) return;
        const pos = getMousePos(e);
        const newX = pos.x - dragStart.x;
        const newY = pos.y - dragStart.y;
        if (dragging.type === 'logo') {
            onLogoOptionsChange({ ...logoOptions, x: newX, y: newY });
        } else if (dragging.type === 'text') {
            onTextOptionsChange(dragging.id, { x: newX, y: newY });
        }
    };

    const handleMouseUp = () => setDragging(null);
    const handleMouseLeave = () => setDragging(null);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-inner flex justify-center items-center">
            <canvas ref={canvasRef} className="max-w-full max-h-[75vh] object-contain rounded-md cursor-grab"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
            ></canvas>
        </div>
    );
});
