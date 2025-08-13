
import React, { useState } from 'react';

interface ResultsGalleryProps {
    processedImages: string[];
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);


export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ processedImages }) => {
    const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

    if (processedImages.length === 0) {
        return null;
    }

    const handleDownload = (dataUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `processed_image_${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const openModal = (src: string) => {
      setModalImageSrc(src);
    };

    const closeModal = () => {
      setModalImageSrc(null);
    };

    return (
        <>
        <footer className="bg-gray-800 mt-8 py-6">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">Kết Quả Đã Xử Lý</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {processedImages.map((imageSrc, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-lg aspect-square cursor-pointer" onClick={() => openModal(imageSrc)}>
                            <img src={imageSrc} alt={`Processed ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDownload(imageSrc, index); }}
                                    className="p-3 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all"
                                    title="Tải ảnh này"
                                >
                                    <DownloadIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </footer>

        {modalImageSrc && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity"
              onClick={closeModal}
            >
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <img src={modalImageSrc} alt="Xem trước ảnh" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"/>
                    <button 
                      onClick={closeModal} 
                      className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl hover:bg-gray-200 transition-colors"
                      aria-label="Đóng"
                    >
                        &times;
                    </button>
                </div>
            </div>
        )}
        </>
    );
};
