
import React from 'react';

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center text-center">
                <PhotoIcon className="w-10 h-10 text-blue-400 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Trình Chỉnh Sửa Ảnh Hàng Loạt</h1>
                    <p className="text-gray-400 mt-1 tracking-wider">LÊ VIỆT TÙNG - PHÒNG CNTT & CĐS</p>
                </div>
            </div>
        </header>
    );
};
