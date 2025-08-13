
import React, { useRef } from 'react';
import type { LogoOptions, TextOptions, FilterOptions, FixedPosition } from '../types';

// Icons
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 px-2 text-lg font-bold text-blue-300 hover:bg-gray-700/50 rounded-md">
                <span>{title}</span>
                <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};


interface ControlsPanelProps {
    sourceFiles: File[];
    logoFile: File | null;
    logoOptions: LogoOptions;
    textOptionsList: TextOptions[];
    selectedTextOptions: TextOptions | null;
    filterOptions: FilterOptions;
    onLogoOptionsChange: (options: LogoOptions) => void;
    onTextOptionsChange: (options: TextOptions) => void;
    onAddText: () => void;
    onRemoveText: (id: string) => void;
    onSelectText: (id: string | null) => void;
    onFilterChange: (options: FilterOptions) => void;
    onSourceFilesSelect: (files: File[]) => void;
    onRemoveSourceFile: (index: number) => void;
    onLogoFileSelect: (file: File | null) => void;
    onProcessBatch: () => void;
    isProcessing: boolean;
}

const fontOptions = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact', 'Roboto'];
const positionOptions: { value: FixedPosition, label: string }[] = [
    { value: 'absolute', label: 'Tùy chỉnh (Kéo thả)' },
    { value: 'top-left', label: 'Trên - Trái' },
    { value: 'top-center', label: 'Trên - Giữa' },
    { value: 'top-right', label: 'Trên - Phải' },
    { value: 'middle-left', label: 'Giữa - Trái' },
    { value: 'center', label: 'Giữa - Trung tâm' },
    { value: 'middle-right', label: 'Giữa - Phải' },
    { value: 'bottom-left', label: 'Dưới - Trái' },
    { value: 'bottom-center', label: 'Dưới - Giữa' },
    { value: 'bottom-right', label: 'Dưới - Phải' },
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    sourceFiles, logoFile, logoOptions, textOptionsList, selectedTextOptions, filterOptions,
    onLogoOptionsChange, onTextOptionsChange, onAddText, onRemoveText, onSelectText,
    onFilterChange, onSourceFilesSelect, onRemoveSourceFile, onLogoFileSelect, onProcessBatch,
    isProcessing
}) => {
    const sourceInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) onSourceFilesSelect(Array.from(e.target.files));
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onLogoFileSelect(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null);
    };
    
    return (
        <div className="space-y-1">
            <Accordion title="1. Tải Dữ Liệu" defaultOpen>
                <div className="space-y-3">
                    <button onClick={() => sourceInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all">
                        <UploadIcon className="w-5 h-5"/> Chọn Ảnh Nguồn ({sourceFiles.length})
                    </button>
                    <input type="file" multiple accept="image/*" ref={sourceInputRef} onChange={handleSourceFileChange} className="hidden" />

                    {sourceFiles.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border border-gray-600 rounded-md p-2">
                            {sourceFiles.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex justify-between items-center p-2 rounded bg-gray-700/50">
                                    <p className="truncate pr-2 text-sm">{file.name}</p>
                                    <button onClick={() => onRemoveSourceFile(index)} className="text-red-400 hover:text-red-600 p-1 rounded-full flex-shrink-0"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all">
                       <UploadIcon className="w-5 h-5"/> Chọn Logo
                    </button>
                    <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoFileChange} className="hidden" />
                    {logoFile?.name && <p className="text-sm text-center text-gray-400 truncate">Logo: {logoFile.name}</p>}
                </div>
            </Accordion>
            
            <Accordion title="2. Tùy Chỉnh Logo">
                <div className="space-y-3">
                    <label className="block">Vị trí cố định:</label>
                    <select value={logoOptions.position} onChange={e => onLogoOptionsChange({...logoOptions, position: e.target.value as FixedPosition})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {positionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {logoOptions.position !== 'absolute' ? (
                        <div>
                          <label className="block">Khoảng cách lề (px):</label>
                          <input type="number" value={logoOptions.margin} onChange={e => onLogoOptionsChange({...logoOptions, margin: +e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
                        </div>
                    ) : (
                         <p className="text-xs text-gray-500">Kéo thả logo trên ảnh để đổi vị trí.</p>
                    )}
                    <label className="block">Kích thước: <span className="font-mono text-blue-300">{(logoOptions.scale * 100).toFixed(0)}%</span></label>
                    <input type="range" min="0.01" max="1" step="0.01" value={logoOptions.scale} onChange={e => onLogoOptionsChange({...logoOptions, scale: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                    <div className="flex items-center"><input type="checkbox" id="remove-white" checked={logoOptions.removeWhiteBg} onChange={e => onLogoOptionsChange({...logoOptions, removeWhiteBg: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"/><label htmlFor="remove-white" className="ml-2">Xóa nền trắng</label></div>
                    <div className="flex items-center"><input type="checkbox" id="remove-green" checked={logoOptions.removeGreenScreen} onChange={e => onLogoOptionsChange({...logoOptions, removeGreenScreen: e.target.checked})} className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"/><label htmlFor="remove-green" className="ml-2">Xóa phông xanh</label></div>
                </div>
            </Accordion>
            
            <Accordion title="3. Tùy Chỉnh Văn Bản">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Danh sách văn bản:</span>
                        <button onClick={onAddText} className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                            <AddIcon className="w-4 h-4" /> Thêm mới
                        </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {textOptionsList.map(opt => (
                            <div key={opt.id} onClick={() => onSelectText(opt.id)} className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${selectedTextOptions?.id === opt.id ? 'bg-blue-900/50' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>
                                <p className="truncate pr-2">{opt.text || "..."}</p>
                                <button onClick={(e) => { e.stopPropagation(); onRemoveText(opt.id); }} className="text-red-400 hover:text-red-600 p-1"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    {selectedTextOptions && (
                        <div className="space-y-3 pt-4 border-t border-gray-600">
                             <label className="block">Vị trí cố định:</label>
                             <select value={selectedTextOptions.position} onChange={e => onTextOptionsChange({...selectedTextOptions, position: e.target.value as FixedPosition})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                               {positionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                             </select>
                            {selectedTextOptions.position !== 'absolute' ? (
                                <div>
                                  <label className="block">Khoảng cách lề (px):</label>
                                  <input type="number" value={selectedTextOptions.margin} onChange={e => onTextOptionsChange({...selectedTextOptions, margin: +e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Kéo thả văn bản trên ảnh để đổi vị trí.</p>
                            )}
                            <label className="block">Nội dung:</label>
                            <textarea value={selectedTextOptions.text} onChange={e => onTextOptionsChange({...selectedTextOptions, text: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}/>
                            <label className="block">Kích thước chữ: <span className="font-mono text-blue-300">{selectedTextOptions.size}px</span></label>
                            <input type="range" min="8" max="256" step="1" value={selectedTextOptions.size} onChange={e => onTextOptionsChange({...selectedTextOptions, size: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <label className="block">Phông chữ:</label>
                            <select value={selectedTextOptions.font} onChange={e => onTextOptionsChange({...selectedTextOptions, font: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {fontOptions.map(font => <option key={font} value={font} style={{fontFamily: font}}>{font}</option>)}
                            </select>
                            <label className="block">Màu chữ:</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={selectedTextOptions.color} onChange={e => onTextOptionsChange({...selectedTextOptions, color: e.target.value})} className="p-1 h-10 w-14 block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg" />
                              <input type="text" value={selectedTextOptions.color} onChange={e => onTextOptionsChange({...selectedTextOptions, color: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                            </div>
                            <label className="block">Màu nền:</label>
                             <div className="flex items-center gap-2">
                                <input type="color" value={selectedTextOptions.backgroundColor === 'transparent' ? '#000000' : selectedTextOptions.backgroundColor.slice(0, 7)} onChange={e => onTextOptionsChange({...selectedTextOptions, backgroundColor: e.target.value})} className="p-1 h-10 w-14 block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg" />
                                <button onClick={() => onTextOptionsChange({...selectedTextOptions, backgroundColor: 'transparent'})} className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">Trong suốt</button>
                            </div>
                            <label className="block">Căn lề:</label>
                            <select value={selectedTextOptions.alignment} onChange={e => onTextOptionsChange({...selectedTextOptions, alignment: e.target.value as any})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                                <option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option>
                            </select>
                            <div className="flex items-center"><input type="checkbox" id="text-shadow" checked={selectedTextOptions.shadow} onChange={e => onTextOptionsChange({...selectedTextOptions, shadow: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"/><label htmlFor="text-shadow" className="ml-2">Đổ bóng</label></div>
                            
                            <div className="pt-3 border-t border-gray-600/50">
                                <div className="flex items-center">
                                    <input type="checkbox" id="text-stroke" checked={selectedTextOptions.stroke} onChange={e => onTextOptionsChange({...selectedTextOptions, stroke: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"/>
                                    <label htmlFor="text-stroke" className="ml-2">Viền chữ</label>
                                </div>
                                {selectedTextOptions.stroke && (
                                    <div className="space-y-3 mt-3 pl-6">
                                        <label className="block">Màu viền:</label>
                                        <div className="flex items-center gap-2">
                                          <input type="color" value={selectedTextOptions.strokeColor} onChange={e => onTextOptionsChange({...selectedTextOptions, strokeColor: e.target.value})} className="p-1 h-10 w-14 block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg" />
                                          <input type="text" value={selectedTextOptions.strokeColor} onChange={e => onTextOptionsChange({...selectedTextOptions, strokeColor: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 font-mono" />
                                        </div>
                                        <label className="block">Độ dày viền: <span className="font-mono text-blue-300">{selectedTextOptions.strokeWidth}px</span></label>
                                        <input type="range" min="1" max="20" step="0.5" value={selectedTextOptions.strokeWidth} onChange={e => onTextOptionsChange({...selectedTextOptions, strokeWidth: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </Accordion>
            
            <Accordion title="4. Bộ Lọc Ảnh">
                 <div className="space-y-3">
                    <label className="block">Độ sáng: <span className="font-mono text-blue-300">{filterOptions.brightness}%</span></label>
                    <input type="range" min="0" max="200" value={filterOptions.brightness} onChange={e => onFilterChange({...filterOptions, brightness: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <label className="block">Tương phản: <span className="font-mono text-blue-300">{filterOptions.contrast}%</span></label>
                    <input type="range" min="0" max="200" value={filterOptions.contrast} onChange={e => onFilterChange({...filterOptions, contrast: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <label className="block">Thang độ xám: <span className="font-mono text-blue-300">{filterOptions.grayscale}%</span></label>
                    <input type="range" min="0" max="100" value={filterOptions.grayscale} onChange={e => onFilterChange({...filterOptions, grayscale: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <label className="block">Hoài cổ (Sepia): <span className="font-mono text-blue-300">{filterOptions.sepia}%</span></label>
                    <input type="range" min="0" max="100" value={filterOptions.sepia} onChange={e => onFilterChange({...filterOptions, sepia: +e.target.value})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                     <button onClick={() => onFilterChange({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0 })} className="text-sm text-blue-400 hover:underline">Đặt lại bộ lọc</button>
                 </div>
            </Accordion>

            <div className="space-y-4 pt-4 mt-4 border-t border-gray-700">
                <button 
                    onClick={onProcessBatch} 
                    disabled={isProcessing || sourceFiles.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-all disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang xử lý...</>) : 'Áp Dụng & Xử Lý Hàng Loạt'}
                </button>
            </div>
        </div>
    );
};
