// Canvas Manager - Handles dual canvas system for responsive display and high-res exports
// Display canvas: Scaled for screen display
// Render canvas: Full resolution (1920x1080) for exports

let displayCanvas, displayCtx;
let renderCanvas, renderCtx;
let scaleFactor = 1;
let isInitialized = false;

// Target resolution for exports
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT;

// Initialize canvas system
function initCanvas(canvasElement) {
    displayCanvas = canvasElement;
    displayCtx = displayCanvas.getContext('2d');

    // Create render canvas (hidden, full resolution)
    renderCanvas = document.createElement('canvas');
    renderCtx = renderCanvas.getContext('2d');
    renderCanvas.width = TARGET_WIDTH;
    renderCanvas.height = TARGET_HEIGHT;
    renderCanvas.style.display = 'none';
    document.body.appendChild(renderCanvas);

    // Set initialized before first resize so it doesn't early-return
    isInitialized = true;
    // Setup initial sizing
    resizeCanvas();

    console.log('Canvas system initialized:', {
        display: { width: displayCanvas.width, height: displayCanvas.height },
        render: { width: renderCanvas.width, height: renderCanvas.height },
        scaleFactor
    });
}

// Calculate optimal display size while maintaining aspect ratio
function calculateDisplaySize() {
    // Reserve space for controls if present
    const controlsEl = document.querySelector('.controls');
    const controlsHeight = controlsEl ? controlsEl.getBoundingClientRect().height + 24 : 0;

    const availableWidth = Math.floor(window.innerWidth * 0.95);
    const availableHeight = Math.floor((window.innerHeight - controlsHeight) * 0.9);

    // Fit 16:9 inside available area
    const widthByHeight = Math.floor(availableHeight * TARGET_ASPECT);
    const heightByWidth = Math.floor(availableWidth / TARGET_ASPECT);

    if (widthByHeight <= availableWidth) {
        return { width: widthByHeight, height: availableHeight };
    } else {
        return { width: availableWidth, height: heightByWidth };
    }
}

// Resize canvas system
function resizeCanvas() {
    if (!isInitialized) {
        console.log('Canvas not initialized yet');
        return;
    }

    const { width, height } = calculateDisplaySize();
    console.log('Calculated display size:', { width, height });

    // Set display canvas size (attributes control drawing buffer)
    displayCanvas.width = width;
    displayCanvas.height = height;
    // Also set CSS size to ensure proper layout
    displayCanvas.style.width = width + 'px';
    displayCanvas.style.height = height + 'px';

    // Calculate scale factor
    scaleFactor = width / TARGET_WIDTH;

    // Center the canvas
    displayCanvas.style.position = 'absolute';
    displayCanvas.style.left = '50%';
    displayCanvas.style.top = '20%';
    displayCanvas.style.transform = 'translate(-50%, -25%)';
    displayCanvas.style.border = '1px solid #ddd';
    displayCanvas.style.borderRadius = '8px';
    displayCanvas.style.zIndex = '1';

    console.log('Canvas resized:', {
        width,
        height,
        scaleFactor,
        canvasWidth: displayCanvas.width,
        canvasHeight: displayCanvas.height,
        windowSize: { width: window.innerWidth, height: window.innerHeight }
    });
}

// Get display canvas (what user sees)
function getDisplayCanvas() {
    return displayCanvas;
}

// Get render canvas (full resolution for exports)
function getRenderCanvas() {
    return renderCanvas;
}

// Get display context
function getDisplayContext() {
    return displayCtx;
}

// Get render context
function getRenderContext() {
    return renderCtx;
}

// Get current scale factor
function getScaleFactor() {
    return scaleFactor;
}

// Scale coordinates from render space to display space
function scaleToDisplay(x, y) {
    return {
        x: x * scaleFactor,
        y: y * scaleFactor
    };
}

// Scale coordinates from display space to render space
function scaleToRender(x, y) {
    return {
        x: x / scaleFactor,
        y: y / scaleFactor
    };
}

// Copy render canvas to display canvas
function copyToDisplay() {
    if (!isInitialized) return;

    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    displayCtx.drawImage(renderCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
}

// Get target resolution
function getTargetResolution() {
    return { width: TARGET_WIDTH, height: TARGET_HEIGHT };
}

// Check if canvas system is initialized
function isCanvasInitialized() {
    return isInitialized;
}

// Export functions
window.CanvasManager = {
    initCanvas,
    resizeCanvas,
    getDisplayCanvas,
    getRenderCanvas,
    getDisplayContext,
    getRenderContext,
    getScaleFactor,
    scaleToDisplay,
    scaleToRender,
    copyToDisplay,
    getTargetResolution,
    isCanvasInitialized
};
