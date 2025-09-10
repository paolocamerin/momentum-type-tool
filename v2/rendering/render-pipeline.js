// Render Pipeline - Coordinates all rendering operations

class RenderPipeline {
    constructor() {
        this.textRenderer = null;
        this.backgroundRenderer = null;
        this.isInitialized = false;
    }

    // Initialize the render pipeline
    init() {
        this.textRenderer = window.TextRenderer;
        this.backgroundRenderer = window.BackgroundRenderer;
        this.isInitialized = true;
        console.log('[RenderPipeline] Render pipeline initialized');
    }

    // Render a complete frame
    render(words, userHasTyped, animationTime, canvasWidth, canvasHeight, backgroundColor, fillColor) {
        if (!this.isInitialized) return;

        const displayCtx = window.CanvasManager.getDisplayContext();

        // Clear canvas
        displayCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Render background
        this.backgroundRenderer.render(displayCtx, canvasWidth, canvasHeight, backgroundColor, animationTime);

        // Render text
        this.textRenderer.render(displayCtx, words, userHasTyped, animationTime, canvasWidth, canvasHeight, fillColor);
    }

    // Set shader mode
    setShaderMode(enabled) {
        this.backgroundRenderer.setShaderMode(enabled);
        window.ShaderManager.setMode(enabled);
    }

    // Get shader mode
    getShaderMode() {
        return this.backgroundRenderer.getShaderMode();
    }

    // Set text alignment
    setTextAlignment(isLeftAligned) {
        this.textRenderer.setAlignment(isLeftAligned);
    }

    // Get text alignment
    getTextAlignment() {
        return this.textRenderer.getAlignment();
    }

    // Get render pipeline status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            shaderMode: this.getShaderMode(),
            textAlignment: this.getTextAlignment()
        };
    }
}

// Export singleton instance
window.RenderPipeline = new RenderPipeline();
