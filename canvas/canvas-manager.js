// Canvas Manager - Handles display and shader canvas management

class CanvasManager {
    constructor() {
        this.displayCanvas = null;
        this.displayCtx = null;
        this.shaderCanvas = null;
        this.shaderCtx = null;
        this.isInitialized = false;
    }

    // Initialize both canvases
    init(displayCanvasId, shaderCanvasId) {
        this.displayCanvas = document.getElementById(displayCanvasId);
        this.shaderCanvas = document.getElementById(shaderCanvasId);

        if (!this.displayCanvas || !this.shaderCanvas) {
            throw new Error('Canvas elements not found');
        }

        // Get contexts
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.shaderCtx = this.shaderCanvas.getContext('webgl') || this.shaderCanvas.getContext('experimental-webgl');

        if (!this.displayCtx) {
            throw new Error('2D context not supported');
        }

        // Set up canvas positioning
        this.setupCanvasPositioning();

        // Initial resize
        this.resize();

        this.isInitialized = true;
        console.log('[CanvasManager] Canvas system initialized');
    }

    // Set up canvas positioning and layering
    setupCanvasPositioning() {
        // Both canvases should be positioned absolutely within the container
        // and centered using the same logic

        // Shader canvas (background layer)
        this.shaderCanvas.style.position = 'absolute';
        this.shaderCanvas.style.zIndex = '1';
        this.shaderCanvas.style.pointerEvents = 'none';

        // Display canvas (text layer on top)
        this.displayCanvas.style.position = 'absolute';
        this.displayCanvas.style.zIndex = '2';
        this.displayCanvas.style.pointerEvents = 'none';
    }

    // Resize both canvases to fit within the 70% allocated space
    resize() {
        if (!this.isInitialized) return;

        // Get the canvas container dimensions (70% of viewport height)
        const container = document.querySelector('.canvas-container');
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate canvas size maintaining 16:9 aspect ratio
        const aspectRatio = 16 / 9;
        let canvasWidth, canvasHeight;

        // Fit by width or height, whichever is more restrictive
        if (containerWidth / containerHeight > aspectRatio) {
            // Container is wider than 16:9, fit by height
            canvasHeight = containerHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            // Container is taller than 16:9, fit by width
            canvasWidth = containerWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }

        // Ensure we don't exceed container bounds
        canvasWidth = Math.min(canvasWidth, containerWidth);
        canvasHeight = Math.min(canvasHeight, containerHeight);

        // Calculate centered position within container
        const leftOffset = (containerWidth - canvasWidth) / 2;
        const topOffset = (containerHeight - canvasHeight) / 2;

        // Set display canvas size and position
        this.displayCanvas.width = canvasWidth;
        this.displayCanvas.height = canvasHeight;
        this.displayCanvas.style.width = canvasWidth + 'px';
        this.displayCanvas.style.height = canvasHeight + 'px';
        this.displayCanvas.style.left = leftOffset + 'px';
        this.displayCanvas.style.top = topOffset + 'px';

        // Set shader canvas to match exactly (same size and position)
        this.shaderCanvas.width = canvasWidth;
        this.shaderCanvas.height = canvasHeight;
        this.shaderCanvas.style.width = canvasWidth + 'px';
        this.shaderCanvas.style.height = canvasHeight + 'px';
        this.shaderCanvas.style.left = leftOffset + 'px';
        this.shaderCanvas.style.top = topOffset + 'px';

        console.log(`[CanvasManager] Canvas resized: ${canvasWidth}x${canvasHeight} (16:9 aspect ratio within ${containerWidth}x${containerHeight} container)`);
        console.log(`[CanvasManager] Canvas position: left=${leftOffset}px, top=${topOffset}px`);
        console.log(`[CanvasManager] Display canvas position:`, this.displayCanvas.style.left, this.displayCanvas.style.top);
        console.log(`[CanvasManager] Shader canvas position:`, this.shaderCanvas.style.left, this.shaderCanvas.style.top);
    }

    // Get display canvas and context
    getDisplayCanvas() {
        return this.displayCanvas;
    }

    getDisplayContext() {
        return this.displayCtx;
    }

    // Get shader canvas and context
    getShaderCanvas() {
        return this.shaderCanvas;
    }

    getShaderContext() {
        return this.shaderCtx;
    }

    // Get canvas dimensions
    getDimensions() {
        return {
            width: this.displayCanvas.width,
            height: this.displayCanvas.height
        };
    }

    // Check if WebGL is available
    hasWebGL() {
        return !!this.shaderCtx;
    }

    // Get initialization status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasDisplayCanvas: !!this.displayCanvas,
            hasShaderCanvas: !!this.shaderCanvas,
            hasWebGL: this.hasWebGL()
        };
    }
}

// Export singleton instance
console.log('[CanvasManager] Creating instance...');
window.CanvasManager = new CanvasManager();
console.log('[CanvasManager] Instance created:', window.CanvasManager);
console.log('[CanvasManager] init method:', typeof window.CanvasManager.init);
