// Export Manager - Handles SVG export functionality

// Utility function for mapping values
function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function exportToSVG() {
    if (!FontManager.hasFont()) {
        console.warn('No font loaded for SVG export');
        return;
    }

    const font = FontManager.getFont();
    const state = UIController.getCurrentState();

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');

    // Fixed export dimensions (1920x1080)
    const exportWidth = 1920;
    const exportHeight = 1080;
    svg.setAttribute('width', exportWidth);
    svg.setAttribute('height', exportHeight);
    svg.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);

    // Add background rectangle
    const backgroundRect = document.createElementNS(svgNS, 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');

    // Check if shader mode is enabled
    const isShaderMode = window.RenderPipeline.getShaderMode();
    if (isShaderMode) {
        // For shader mode, capture the shader canvas and embed it as an image
        const shaderCanvas = document.getElementById('shader-canvas');
        if (shaderCanvas) {
            // Ensure shader is rendered with current state
            const animationTime = window.AnimationEngine.getAnimationTime();
            window.ShaderManager.render(animationTime);

            // Convert shader canvas to data URL
            const shaderDataURL = shaderCanvas.toDataURL('image/png');

            // Create image element for the shader
            const shaderImage = document.createElementNS(svgNS, 'image');
            shaderImage.setAttribute('href', shaderDataURL);
            shaderImage.setAttribute('width', '100%');
            shaderImage.setAttribute('height', '100%');
            shaderImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            svg.appendChild(shaderImage);
        } else {
            // Fallback to solid color if shader canvas not available
            backgroundRect.setAttribute('fill', UIController.getBackgroundColor());
            svg.appendChild(backgroundRect);
        }
    } else {
        backgroundRect.setAttribute('fill', UIController.getBackgroundColor());
        svg.appendChild(backgroundRect);
    }

    // Create main group for all text
    const group = document.createElementNS(svgNS, 'g');
    svg.appendChild(group);

    // Get current animation state
    const margin = state.margin;
    const ampl = state.amplitude;
    const phase = state.phase;
    const additionalPhase = state.additionalPhase;
    const rowOffset = state.rowOffset;
    const rows = window.TextRenderer.preProcess(state.words);
    const isLeftAligned = state.isLeftAligned;

    // Use fixed export dimensions for calculations
    const canvasWidth = exportWidth;
    const canvasHeight = exportHeight;

    let rowPosition = 0;
    const lineHeightMultiplier = 1.25; // Match text renderer

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        // Calculate font size for the row using fixed dimensions
        let fontSize;
        if (row.length > 20) {
            fontSize = canvasHeight / map(row.length, 20, 60, 15, 40);
        } else {
            fontSize = canvasHeight / 15;
        }

        // Calculate row position using font metrics (matching text renderer)
        if (rowIndex === 0) {
            // Get font metrics for first row
            const glyph = font.charToGlyph('M');
            const ascent = (font.ascender || 0.8 * font.unitsPerEm) * (fontSize / font.unitsPerEm);
            rowPosition = margin + ascent;
        } else {
            // Add line height for subsequent rows
            const prevFontSize = rowIndex === 1 ? fontSize : canvasHeight / 15; // Approximate previous font size
            rowPosition += Math.max(prevFontSize * lineHeightMultiplier, 10);
        }

        if (isLeftAligned) {
            // Left alignment SVG export
            let x = margin;
            let oscillationOffset = 1;

            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];
                const glyph = font.charToGlyph(character.toUpperCase());
                const currentCharWidth = glyph.advanceWidth * (fontSize / font.unitsPerEm);

                const angle = phase + additionalPhase + (rowIndex + 1) * rowOffset;
                const finalX = charIndex == 0 ? margin : x + ((Math.sin(angle) * .5 + .5) * ampl * 0.1) * oscillationOffset * 1 / row.length * charIndex;

                // Create SVG path element
                const path = font.getPath(character.toUpperCase(), finalX, rowPosition, fontSize);
                const svgPath = document.createElementNS(svgNS, 'path');

                // Convert path commands to SVG path data
                const pathData = path.commands.map(cmd => {
                    switch (cmd.type) {
                        case 'M': return `M ${cmd.x} ${cmd.y}`;
                        case 'L': return `L ${cmd.x} ${cmd.y}`;
                        case 'C': return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`;
                        case 'Q': return `Q ${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`;
                        case 'Z': return 'Z';
                        default: return '';
                    }
                }).join(' ');

                svgPath.setAttribute('d', pathData);
                svgPath.setAttribute('fill', state.userHasTyped ? UIController.getFillColor() : '#e6e6e6');
                group.appendChild(svgPath);

                // Move to next character position
                x += currentCharWidth;
                oscillationOffset *= 1.4;
            }
        } else {
            // Center alignment SVG export
            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];

                // Calculate wave angle and sine value
                const waveAngle = (Math.PI / row.length) * charIndex + phase + additionalPhase + (rowIndex + 1) * rowOffset;
                const baseSineValue = Math.sin(waveAngle) * ampl;

                // Apply center alignment intensity reduction
                let centerAlignmentIntensity;
                if (row.length > 1) {
                    centerAlignmentIntensity = 1 - Math.abs(map(charIndex, 0, row.length - 1, 1, -1));
                } else {
                    centerAlignmentIntensity = 1;
                }
                const horizontalOffset = baseSineValue * centerAlignmentIntensity;

                // Calculate row width for center alignment using fixed dimensions
                const rowWidths = [];
                let rowTotalWidth = 0;
                for (let i = 0; i < row.length; i++) {
                    const glyph = font.charToGlyph(row[i].toUpperCase());
                    const width = glyph.advanceWidth * (fontSize / font.unitsPerEm);
                    rowWidths.push(width);
                    rowTotalWidth += width;
                }

                const gaps = Math.max(row.length - 1, 1);
                const extraSpace = Math.max(canvasWidth - margin * 2 - rowTotalWidth, 0);
                const gapIncrement = extraSpace / gaps;

                let cumulativeX = margin;
                for (let i = 0; i < charIndex; i++) {
                    cumulativeX += rowWidths[i] + (i < row.length - 1 ? gapIncrement : 0);
                }

                const x = cumulativeX + horizontalOffset;

                // Create SVG path element
                const path = font.getPath(character.toUpperCase(), x, rowPosition, fontSize);
                const svgPath = document.createElementNS(svgNS, 'path');

                // Convert path commands to SVG path data
                const pathData = path.commands.map(cmd => {
                    switch (cmd.type) {
                        case 'M': return `M ${cmd.x} ${cmd.y}`;
                        case 'L': return `L ${cmd.x} ${cmd.y}`;
                        case 'C': return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`;
                        case 'Q': return `Q ${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`;
                        case 'Z': return 'Z';
                        default: return '';
                    }
                }).join(' ');

                svgPath.setAttribute('d', pathData);
                svgPath.setAttribute('fill', state.userHasTyped ? UIController.getFillColor() : '#e6e6e6');
                group.appendChild(svgPath);
            }
        }
    }

    // Create and download the SVG file
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'momentum-type-animation.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportToPNG() {
    // Get the canvas element
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.warn('Canvas not found for PNG export');
        return;
    }

    // Create a temporary canvas for fixed 1920x1080 export
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Set fixed export dimensions (1920x1080)
    const exportWidth = 1920;
    const exportHeight = 1080;
    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;

    // Get current state
    const state = UIController.getCurrentState();
    const backgroundColor = UIController.getBackgroundColor();
    const fillColor = UIController.getFillColor();

    // Render at export resolution using RenderPipeline
    const animationTime = window.AnimationEngine.getAnimationTime();

    console.log('[PNG Export] Starting export with dimensions:', exportWidth, 'x', exportHeight);
    console.log('[PNG Export] Background color:', backgroundColor);
    console.log('[PNG Export] Shader mode:', window.RenderPipeline.getShaderMode());

    // Use RenderPipeline to render directly to the export canvas at 1920x1080
    window.RenderPipeline.renderForExport(tempCtx, exportWidth, exportHeight, animationTime);

    console.log('[PNG Export] Render complete, creating blob...');

    // Convert to PNG and download
    tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'momentum-type-animation.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Export export manager functions
window.ExportManager = {
    exportToSVG,
    exportToPNG
};
