
export type FixedPosition = 
    | 'absolute' 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'middle-left' | 'center' | 'middle-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface LogoOptions {
    x: number;
    y: number;
    scale: number;
    removeWhiteBg: boolean;
    removeGreenScreen: boolean;
    position: FixedPosition;
    margin: number;
}

export interface TextOptions {
    id: string; // Khóa định danh duy nhất
    text: string;
    x: number;
    y: number;
    size: number;
    color: string;
    font: string;
    shadow: boolean;
    stroke: boolean;
    strokeColor: string;
    strokeWidth: number;
    lineHeight: number;
    backgroundColor: string; // ví dụ 'rgba(0, 0, 0, 0.5)' hoặc 'transparent'
    padding: number;
    alignment: 'left' | 'center' | 'right';
    position: FixedPosition;
    margin: number;
}

export interface FilterOptions {
    brightness: number; // 100 là mặc định
    contrast: number;   // 100 là mặc định
    grayscale: number;  // 0 là mặc định
    sepia: number;      // 0 là mặc định
}
