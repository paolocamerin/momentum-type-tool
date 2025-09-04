// Animation Engine - Handles drawing, animation, and text processing

// Animation state
let animationStartTime = 0;
let pausedTime = 0;
let isPlaying = true;
let isLeftAligned = false;

// FPS tracking
let frameCount = 0;
let lastFPSTime = 0;
let currentFPS = 0;

// Frame rate limiting
let targetFPS = 30;
let lastFrameTime = 0;
let frameInterval = 1000 / targetFPS;

// Function to set target FPS and update frame interval
function setTargetFPS(fps) {
    targetFPS = Math.max(1, Math.min(120, fps)); // Clamp between 1-120 fps
    frameInterval = 1000 / targetFPS;
    console.log(`[AnimationEngine] Target FPS set to ${targetFPS}, frame interval: ${frameInterval.toFixed(2)}ms`);
}


// Internal margins (in pixels at render resolution)
let internalHorizontalMargin = 120; // left/right margin
let internalVerticalMargin = 120;   // top/bottom margin
let internalLineHeightMultiplier = 1.25; // line height = fontSize * multiplier

// Canvas and context will be accessed through CanvasManager

// Get current animation time in seconds
function getAnimationTime() {
    if (!isPlaying) {
        return pausedTime;
    }
    return (performance.now() - animationStartTime) / 1000;
}

// Text processing
function preProcess(inputText) {
    // console.log('preProcess called with:', inputText);
    const paragraphs = inputText.split("\n");
    const allRows = [];

    for (let paragraph of paragraphs) {
        const words = paragraph.trim().split(/\s+/);
        let currentLine = "";

        for (let word of words) {
            if (word.length > 20) {
                if (currentLine) {
                    allRows.push(currentLine.trim());
                    currentLine = "";
                }
                allRows.push(word);
            } else {
                if ((currentLine + " " + word).trim().length <= 20) {
                    if (currentLine) {
                        currentLine += " " + word;
                    } else {
                        currentLine += word;
                    }
                } else {
                    if (currentLine) {
                        allRows.push(currentLine.trim());
                    }
                    currentLine = word;
                }
            }
        }

        if (currentLine) {
            allRows.push(currentLine.trim());
        }
    }

    return allRows;
}

// Utility function to map values from one range to another
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Helper function to render a single character
function renderCharacter(character, x, y, fontSize, userHasTyped) {
    const fillColor = UIController.getFillColor();
    const renderCtx = CanvasManager.getRenderContext();

    if (FontManager.hasFont()) {
        // Use OpenType.js for custom fonts
        const font = FontManager.getFont();
        const path = font.getPath(character.toUpperCase(), x, y, fontSize);
        renderCtx.fillStyle = userHasTyped ? fillColor : '#e6e6e6';
        renderCtx.beginPath();
        path.commands.forEach(cmd => {
            switch (cmd.type) {
                case 'M': renderCtx.moveTo(cmd.x, cmd.y); break;
                case 'L': renderCtx.lineTo(cmd.x, cmd.y); break;
                case 'C': renderCtx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y); break;
                case 'Q': renderCtx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y); break;
                case 'Z': renderCtx.closePath(); break;
            }
        });
        renderCtx.fill();
    } else {
        // Use basic text rendering
        renderCtx.textAlign = isLeftAligned ? 'left' : 'center';
        renderCtx.textBaseline = 'alphabetic';
        renderCtx.fillStyle = userHasTyped ? fillColor : '#e6e6e6';
        renderCtx.font = `${fontSize}px Inter, sans-serif`;
        renderCtx.fillText(character.toUpperCase(), x, y);
    }
}

// Helper function to get character width
function getCharacterWidth(character, fontSize) {
    if (FontManager.hasFont()) {
        const font = FontManager.getFont();
        const glyph = font.charToGlyph(character.toUpperCase());
        return glyph.advanceWidth * (fontSize / font.unitsPerEm);
    } else {
        const renderCtx = CanvasManager.getRenderContext();
        renderCtx.font = `${fontSize}px Inter, sans-serif`;
        return renderCtx.measureText(character.toUpperCase()).width;
    }
}

// Approximate font metrics (ascent/descent) for baseline placement
function getFontMetrics(fontSize) {
    if (FontManager.hasFont()) {
        const font = FontManager.getFont();
        const unitsPerEm = font.unitsPerEm || 1000;
        const ascent = (font.ascender || 0.8 * unitsPerEm) * (fontSize / unitsPerEm);
        const descent = Math.abs(font.descender || 0.2 * unitsPerEm) * (fontSize / unitsPerEm);
        return { ascent, descent };
    } else {
        const renderCtx = CanvasManager.getRenderContext();
        renderCtx.font = `${fontSize}px Inter, sans-serif`;
        const metrics = renderCtx.measureText('Mg');
        const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
        return { ascent, descent };
    }
}

function draw(words, userHasTyped) {
    const renderCanvas = CanvasManager.getRenderCanvas();
    const renderCtx = CanvasManager.getRenderContext();

    // Clear render canvas with background color
    renderCtx.fillStyle = UIController.getBackgroundColor();
    renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    // Get character positions from centralized engine
    const characters = calculateCharacterPositions(words, userHasTyped, getAnimationTime(), renderCanvas.width, renderCanvas.height);

    // Render all characters to render canvas
    for (const char of characters) {
        renderCharacter(char.character, char.x, char.y, char.fontSize, char.userHasTyped);
    }

    // Copy render canvas to display canvas
    CanvasManager.copyToDisplay();
}

function animate() {
    if (!isPlaying) return;

    const now = performance.now();

    // Frame rate limiting: only render if enough time has passed
    const deltaTime = now - lastFrameTime;
    if (deltaTime >= frameInterval) {
        // Count only actual rendered frames for FPS tracking
        frameCount++;
        if (now - lastFPSTime >= 1000) { // Update FPS every second
            currentFPS = Math.round((frameCount * 1000) / (now - lastFPSTime));
            frameCount = 0;
            lastFPSTime = now;

            // Update current FPS display in UI
            const currentFpsElement = document.getElementById('currentFpsValue');
            if (currentFpsElement) {
                currentFpsElement.textContent = currentFPS;
            }
        }

        // Get fresh values from UIController on each frame
        const currentWords = UIController.getWords();
        const currentUserHasTyped = UIController.getUserHasTyped();
        draw(currentWords, currentUserHasTyped);

        lastFrameTime = now;
    }

    requestAnimationFrame(animate);
}

// Animation control functions
function togglePlayback() {
    if (isPlaying) {
        // Pausing: save current time
        pausedTime = getAnimationTime();
        isPlaying = false;
    } else {
        // Resuming: adjust start time to account for paused duration
        animationStartTime = performance.now() - (pausedTime * 1000);
        isPlaying = true;
    }
}

function toggleAlignment() {
    isLeftAligned = !isLeftAligned;
}

// Centralized animation calculation engine
function calculateCharacterPositions(words, userHasTyped, animationTime, canvasWidth, canvasHeight, overridePhase) {
    const margin = internalHorizontalMargin;
    const ampl = UIController.getAmplitudeValue();
    const speed = UIController.getSpeedValue();
    const phase = (typeof overridePhase === 'number') ? overridePhase : (animationTime * speed);
    const additionalPhase = UIController.getPhaseValue();
    const rowOffset = UIController.getVerticalOffsetValue();
    const factor = UIController.getFactorValue();
    const rows = preProcess(words);
    const usableWidth = canvasWidth - internalHorizontalMargin * 2;

    const characters = [];
    // Top-aligned block: advance by per-row line height using baseline/ascent
    let rowPosition = 0;
    const usableHeight = canvasHeight - internalVerticalMargin * 2;
    let prevRowLineHeight = 0;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        // Calculate font size for the row
        let fontSize;
        if (row.length > 20) {
            fontSize = canvasHeight / map(row.length, 20, 60, 15, 40);
        } else {
            fontSize = canvasHeight / 15;
        }

        const rowMetrics = getFontMetrics(fontSize);
        if (rowIndex === 0) {
            rowPosition = internalVerticalMargin + rowMetrics.ascent;
        } else {
            rowPosition += prevRowLineHeight;
        }

        if (isLeftAligned) {
            // Left alignment: clean cumulative approach
            let x = margin;
            let oscillationOffset = 1;

            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];
                const currentCharWidth = getCharacterWidth(character, fontSize);

                const finalX = charIndex == 0 ? margin : x + ((Math.sin(phase + additionalPhase + (rowIndex + 1) * rowOffset) * .5 + .5) * ampl * 0.05) * oscillationOffset * 1 / row.length * charIndex;

                characters.push({
                    character: character.toUpperCase(),
                    x: finalX,
                    y: rowPosition,
                    fontSize: fontSize,
                    userHasTyped: userHasTyped
                });

                // Move to next character position and increase oscillation offset
                x += currentCharWidth;
                oscillationOffset *= factor;
            }
        } else {
            // Edge-locked justification: first char at left margin, last char at right margin
            // 1) Measure widths for each character
            const rowWidths = [];
            let rowTotalWidth = 0;
            for (let i = 0; i < row.length; i++) {
                const width = getCharacterWidth(row[i], fontSize);
                rowWidths.push(width);
                rowTotalWidth += width;
            }

            // 2) Compute extra spacing to distribute between characters (gaps)
            const gaps = Math.max(row.length - 1, 1);
            const extraSpace = Math.max(usableWidth - rowTotalWidth, 0);
            const gapIncrement = extraSpace / gaps;

            // 3) Start at left margin and lay out with distributed gaps
            let cumulativeX = internalHorizontalMargin;

            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];

                // Wave phase for this character/row
                const waveAngle = (Math.PI / Math.max(row.length, 1)) * charIndex + phase + additionalPhase + (rowIndex + 1) * rowOffset;
                const baseSineValue = Math.sin(waveAngle) * ampl;

                // Taper interior characters; lock first and last to edges
                let centerAlignmentIntensity;
                if (row.length > 1) {
                    centerAlignmentIntensity = 1 - Math.abs(map(charIndex, 0, row.length - 1, 1, -1));
                } else {
                    centerAlignmentIntensity = 1;
                }

                let horizontalOffset = baseSineValue * centerAlignmentIntensity;
                if (charIndex === 0 || charIndex === row.length - 1) {
                    // keep edges locked
                    horizontalOffset = 0;
                }

                const x = cumulativeX + horizontalOffset;

                characters.push({
                    character: character.toUpperCase(),
                    x: x,
                    y: rowPosition,
                    fontSize: fontSize,
                    userHasTyped: userHasTyped
                });

                // advance: width + gap (no gap after last char)
                cumulativeX += rowWidths[charIndex] + (charIndex < row.length - 1 ? gapIncrement : 0);
            }
        }

        // store line height for next baseline position
        prevRowLineHeight = Math.max(fontSize * internalLineHeightMultiplier, 10);
    }

    return characters;
}

// Deterministic draw for a specific global phase (radians), ignoring time/speed
function drawForPhase(words, userHasTyped, phase) {
    const renderCanvas = CanvasManager.getRenderCanvas();
    const renderCtx = CanvasManager.getRenderContext();

    renderCtx.fillStyle = UIController.getBackgroundColor();
    renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    const characters = calculateCharacterPositions(
        words,
        userHasTyped,
        0,
        renderCanvas.width,
        renderCanvas.height,
        phase
    );

    for (const char of characters) {
        renderCharacter(char.character, char.x, char.y, char.fontSize, char.userHasTyped);
    }

    CanvasManager.copyToDisplay();
}

// Export animation engine functions
window.AnimationEngine = {
    init: (canvasElement, context) => {
        // Canvas references are now managed by CanvasManager
        // Initialize animation time
        animationStartTime = performance.now();
        // Initialize FPS tracking
        lastFPSTime = performance.now();
        lastFrameTime = performance.now();
    },
    draw,
    animate,
    togglePlayback,
    toggleAlignment,
    setAlignment: (aligned) => { isLeftAligned = aligned; },
    // Setters/getters for internal margins
    setHorizontalMargin: (px) => { internalHorizontalMargin = Math.max(0, px); },
    setVerticalMargin: (px) => { internalVerticalMargin = Math.max(0, px); },
    getHorizontalMargin: () => internalHorizontalMargin,
    getVerticalMargin: () => internalVerticalMargin,
    // Line height controls (unexposed)
    setLineHeightMultiplier: (mult) => { internalLineHeightMultiplier = Math.max(0.5, mult); },
    getLineHeightMultiplier: () => internalLineHeightMultiplier,
    getAlignment: () => isLeftAligned,
    isPlaying: () => isPlaying,
    getAnimationTime,
    getCanvas: () => CanvasManager.getRenderCanvas(),
    getFPS: () => currentFPS,
    getTargetFPS: () => targetFPS,
    setTargetFPS,
    map,
    preProcess,
    calculateCharacterPositions,
    drawForPhase
};
