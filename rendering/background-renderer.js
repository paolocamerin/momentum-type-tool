// Background Renderer - Handles background rendering (solid color or shader)

class BackgroundRenderer {
    constructor() {
        this.shaderMode = false;
    }

    // Set shader mode
    setShaderMode(enabled) {
        this.shaderMode = enabled;
    }

    // Get shader mode
    getShaderMode() {
        return this.shaderMode;
    }

    // Render background
    render(ctx, canvasWidth, canvasHeight, backgroundColor, time) {
        if (this.shaderMode) {
            // Shader mode: render shader background
            window.ShaderManager.render(time);
            // Clear 2D canvas to show shader through
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        } else {
            // Solid color mode: render solid background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    }

    // Render background for export at fixed resolution
    renderForExport(ctx, exportWidth, exportHeight, backgroundColor, time) {
        if (this.shaderMode) {
            // For shader mode, we need to render the shader at export resolution
            // Create a temporary shader canvas at export resolution
            const tempShaderCanvas = document.createElement('canvas');
            tempShaderCanvas.width = exportWidth;
            tempShaderCanvas.height = exportHeight;

            // Render shader at export resolution
            window.ShaderManager.renderToCanvas(tempShaderCanvas, time);

            // Draw the shader output to the export canvas
            ctx.drawImage(tempShaderCanvas, 0, 0, exportWidth, exportHeight);
        } else {
            // Solid color mode: render solid background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, exportWidth, exportHeight);
        }
    }

    // Get background type
    getBackgroundType() {
        return this.shaderMode ? 'shader' : 'solid';
    }
}

// Export singleton instance
window.BackgroundRenderer = new BackgroundRenderer();
