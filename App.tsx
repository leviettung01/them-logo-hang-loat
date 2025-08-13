
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { CanvasPreview } from './components/CanvasPreview';
import { ResultsGallery } from './components/ResultsGallery';
import type { LogoOptions, TextOptions, FilterOptions, FixedPosition } from './types';
import { Header } from './components/Header';
import { Toaster, toast } from 'react-hot-toast';

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


// Helper function to render everything on a canvas
const drawCanvasContent = (
    ctx: CanvasRenderingContext2D,
    sourceImage: HTMLImageElement,
    logoImage: HTMLImageElement | null,
    textOptionsList: TextOptions[],
    logoOptions: LogoOptions,
    filterOptions: FilterOptions
) => {
    // Set canvas size to match image
    ctx.canvas.width = sourceImage.width;
    ctx.canvas.height = sourceImage.height;

    // Apply filters
    ctx.filter = `brightness(${filterOptions.brightness}%) contrast(${filterOptions.contrast}%) grayscale(${filterOptions.grayscale}%) sepia(${filterOptions.sepia}%)`;
    
    // Draw source image
    ctx.drawImage(sourceImage, 0, 0);

    // Reset filter before drawing other elements
    ctx.filter = 'none';

    // Draw Logo
    if (logoImage) {
        let finalLogo: HTMLImageElement | HTMLCanvasElement = logoImage;
        if(logoOptions.removeWhiteBg || logoOptions.removeGreenScreen){
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = logoImage.width;
            tempCanvas.height = logoImage.height;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            if(tempCtx){
               tempCtx.drawImage(logoImage, 0, 0);
               const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
               const data = imageData.data;
               for (let i = 0; i < data.length; i += 4) {
                   const r = data[i];
                   const g = data[i + 1];
                   const b = data[i + 2];
                   if (logoOptions.removeWhiteBg && r > 220 && g > 220 && b > 220) data[i + 3] = 0;
                   if (logoOptions.removeGreenScreen && g > r && g > b && g > 100) data[i + 3] = 0;
               }
               tempCtx.putImageData(imageData, 0, 0);
               finalLogo = tempCanvas;
            }
        }
        const w = finalLogo.width * logoOptions.scale;
        const h = finalLogo.height * logoOptions.scale;
        
        const { x, y } = calculateDynamicPosition(
            sourceImage.width, sourceImage.height,
            w, h,
            logoOptions.position, logoOptions.margin,
            logoOptions.x, logoOptions.y
        );

        ctx.drawImage(finalLogo, x, y, w, h);
    }

    // Draw All Text items
    textOptionsList.forEach(options => {
        ctx.save();
        ctx.font = `${options.size}px ${options.font}`;
        ctx.textBaseline = 'top';

        const lines = options.text.split('\n');
        const textHeight = lines.length * options.size * options.lineHeight;
        
        let maxWidth = 0;
        lines.forEach(line => {
            const lineWidth = ctx.measureText(line).width;
            if (lineWidth > maxWidth) {
                maxWidth = lineWidth;
            }
        });

        const textBlockWidth = maxWidth + options.padding * 2;
        const textBlockHeight = textHeight + options.padding * 2 - ((options.size * options.lineHeight) - options.size) ;
        
        const { x, y } = calculateDynamicPosition(
            sourceImage.width, sourceImage.height,
            textBlockWidth, textBlockHeight,
            options.position, options.margin,
            options.x, options.y
        );

        // Draw background
        if (options.backgroundColor !== 'transparent') {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(x, y, textBlockWidth, textBlockHeight);
        }

        // Draw text
        ctx.fillStyle = options.color;
        if (options.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }

        if (options.stroke) {
            ctx.strokeStyle = options.strokeColor;
            ctx.lineWidth = options.strokeWidth;
        }

        lines.forEach((line, i) => {
            let lineX = x + options.padding;
            const lineWidth = ctx.measureText(line).width;
            if (options.alignment === 'center') {
                lineX = x + textBlockWidth / 2 - lineWidth / 2;
            } else if (options.alignment === 'right') {
                lineX = x + textBlockWidth - lineWidth - options.padding;
            }
            const lineY = y + options.padding + (i * options.size * options.lineHeight);
            
            if (options.stroke) {
                ctx.strokeText(line, lineX, lineY);
            }
            ctx.fillText(line, lineX, lineY);
        });
        
        ctx.restore();
    });
};


const App: React.FC = () => {
    const [sourceFiles, setSourceFiles] = useState<File[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
    const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const [logoOptions, setLogoOptions] = useState<LogoOptions>({
        x: 10, y: 10, scale: 0.2, removeWhiteBg: false, removeGreenScreen: false,
        position: 'absolute', margin: 20,
    });
    
    const [textOptionsList, setTextOptionsList] = useState<TextOptions[]>([]);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        brightness: 100, contrast: 100, grayscale: 0, sepia: 0
    });

    const [processedImages, setProcessedImages] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
       if (currentImageIndex >= sourceFiles.length) {
          setCurrentImageIndex(Math.max(0, sourceFiles.length - 1));
       }
    }, [sourceFiles, currentImageIndex]);

    // Load current source image for preview
    useEffect(() => {
        if (sourceFiles.length > 0 && currentImageIndex < sourceFiles.length) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => setSourceImage(img);
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(sourceFiles[currentImageIndex]);
        } else {
            setSourceImage(null);
        }
    }, [sourceFiles, currentImageIndex]);

    // Load logo image
    useEffect(() => {
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => setLogoImage(img);
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(logoFile);
        } else {
            setLogoImage(null);
        }
    }, [logoFile]);

    const handleUpdateTextOptions = useCallback((id: string, newOptions: Partial<TextOptions>) => {
        setTextOptionsList(prev => prev.map(opt => opt.id === id ? { ...opt, ...newOptions } : opt));
    }, []);
    
    const handleRemoveSourceFile = useCallback((indexToRemove: number) => {
        setSourceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleProcessBatch = useCallback(async () => {
        if (sourceFiles.length === 0) {
            toast.error('Vui lòng tải lên ít nhất một ảnh nguồn.');
            return;
        }

        setIsProcessing(true);
        setProcessedImages([]);
        toast.loading('Đang xử lý hàng loạt... Vui lòng chờ.', { duration: Infinity });
        
        const newProcessedImages: string[] = [];
        const canvas = document.createElement('canvas'); // Use an offscreen canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast.error("Lỗi: Không thể tạo context cho canvas.");
            setIsProcessing(false);
            toast.dismiss();
            return;
        }
        
        for (const file of sourceFiles) {
            try {
                const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = e.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                drawCanvasContent(ctx, img, logoImage, textOptionsList, logoOptions, filterOptions);
                newProcessedImages.push(canvas.toDataURL('image/jpeg', 1.0));

            } catch (error) {
                console.error("Lỗi xử lý ảnh:", error);
                toast.error(`Lỗi khi xử lý ảnh: ${file.name}`);
            }
        }
        
        setProcessedImages(newProcessedImages);
        setIsProcessing(false);
        toast.dismiss();
        toast.success(`Đã xử lý xong ${newProcessedImages.length} ảnh!`);
    }, [sourceFiles, logoImage, textOptionsList, logoOptions, filterOptions]);

    const selectedTextOptions = textOptionsList.find(t => t.id === selectedTextId) || null;

    return (
        <div className="min-h-screen flex flex-col">
            <Toaster position="bottom-center" toastOptions={{ className: '!bg-gray-700 !text-white' }}/>
            <Header />
            <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 lg:max-h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
                        <ControlsPanel
                            sourceFiles={sourceFiles}
                            logoFile={logoFile}
                            logoOptions={logoOptions}
                            textOptionsList={textOptionsList}
                            selectedTextOptions={selectedTextOptions}
                            filterOptions={filterOptions}
                            onLogoOptionsChange={setLogoOptions}
                            onTextOptionsChange={(updated) => handleUpdateTextOptions(updated.id, updated)}
                            onAddText={() => {
                                const newId = `text_${Date.now()}`;
                                setTextOptionsList(prev => [...prev, {
                                    id: newId, text: 'Văn bản mới', x: 50, y: 100, size: 48, color: '#FFFFFF',
                                    font: 'Arial', shadow: true, lineHeight: 1.2, backgroundColor: 'transparent',
                                    padding: 10, alignment: 'left', position: 'absolute', margin: 20,
                                    stroke: false, strokeColor: '#000000', strokeWidth: 2
                                }]);
                                setSelectedTextId(newId);
                            }}
                            onRemoveText={(id) => {
                                setTextOptionsList(prev => prev.filter(t => t.id !== id));
                                if (selectedTextId === id) setSelectedTextId(null);
                            }}
                            onSelectText={(id) => setSelectedTextId(id)}
                            onFilterChange={setFilterOptions}
                            onSourceFilesSelect={setSourceFiles}
                            onRemoveSourceFile={handleRemoveSourceFile}
                            onLogoFileSelect={setLogoFile}
                            onProcessBatch={handleProcessBatch}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
                <div className="lg:w-2/3 lg:sticky lg:top-4 h-fit">
                    <CanvasPreview
                        ref={canvasRef}
                        sourceImage={sourceImage}
                        logoImage={logoImage}
                        logoOptions={logoOptions}
                        textOptionsList={textOptionsList}
                        filterOptions={filterOptions}
                        selectedTextId={selectedTextId}
                        onLogoOptionsChange={setLogoOptions}
                        onTextOptionsChange={handleUpdateTextOptions}
                        onSelectText={setSelectedTextId}
                    />
                    {sourceFiles.length > 1 && (
                      <div className="flex items-center justify-center mt-4 space-x-4">
                        <button 
                          onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentImageIndex === 0}
                          className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-600 hover:bg-blue-700 transition-colors"
                        >
                          Ảnh Trước
                        </button>
                        <span>{`Ảnh ${currentImageIndex + 1} / ${sourceFiles.length}`}</span>
                        <button 
                          onClick={() => setCurrentImageIndex(prev => Math.min(sourceFiles.length - 1, prev + 1))}
                          disabled={currentImageIndex === sourceFiles.length - 1}
                          className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-600 hover:bg-blue-700 transition-colors"
                        >
                          Ảnh Kế
                        </button>
                      </div>
                    )}
                </div>
            </main>
            <ResultsGallery processedImages={processedImages} />
        </div>
    );
};

export default App;
