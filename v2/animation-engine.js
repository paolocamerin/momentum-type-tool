// Animation Engine - Handles drawing, animation, and text processing

// Animation state
let frameCount = 0;
let isPlaying = true;
let isLeftAligned = false;

// Canvas and context (will be set by init)
let canvas, ctx;

// Text processing
function preProcess(inputText) {
    console.log('preProcess called with:', inputText);
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
    if (FontManager.hasFont()) {
        // Use OpenType.js for custom fonts
        const font = FontManager.getFont();
        const path = font.getPath(character.toUpperCase(), x, y, fontSize);
        ctx.fillStyle = userHasTyped ? 'black' : '#e6e6e6';
        ctx.beginPath();
        path.commands.forEach(cmd => {
            switch (cmd.type) {
                case 'M': ctx.moveTo(cmd.x, cmd.y); break;
                case 'L': ctx.lineTo(cmd.x, cmd.y); break;
                case 'C': ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y); break;
                case 'Q': ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y); break;
                case 'Z': ctx.closePath(); break;
            }
        });
        ctx.fill();
    } else {
        // Use basic text rendering
        ctx.textAlign = isLeftAligned ? 'left' : 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = userHasTyped ? 'black' : '#e6e6e6';
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillText(character.toUpperCase(), x, y);
    }
}

// Helper function to get character width
function getCharacterWidth(character, fontSize) {
    if (FontManager.hasFont()) {
        const font = FontManager.getFont();
        const glyph = font.charToGlyph(character.toUpperCase());
        return glyph.advanceWidth * (fontSize / font.unitsPerEm);
    } else {
        ctx.font = `${fontSize}px Inter, sans-serif`;
        return ctx.measureText(character.toUpperCase()).width;
    }
}

function draw(words, userHasTyped) {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = UIController.getMarginValue();
    let rowPosition = margin;
    const lineHeight = canvas.height / 10;
    const ampl = UIController.getAmplitudeValue();
    const phase = frameCount * 0.05;
    const additionalPhase = UIController.getPhaseValue();
    const rowOffset = UIController.getVerticalOffsetValue();
    const rows = preProcess(words);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        // Calculate font size for the row
        let fontSize;
        if (row.length > 20) {
            fontSize = canvas.height / map(row.length, 20, 60, 15, 40);
        } else {
            fontSize = canvas.height / 15;
        }

        if (isLeftAligned) {
            // Left alignment: clean cumulative approach
            let x = margin;
            let oscillationOffset = 1;

            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];
                const currentCharWidth = getCharacterWidth(character, fontSize);

                const finalX = charIndex == 0 ? margin : x + ((Math.sin(phase + additionalPhase) * .5 + .5) * ampl * 0.05) * oscillationOffset * 1 / row.length * charIndex;

                // Render character using unified function
                renderCharacter(character, finalX, rowPosition, fontSize, userHasTyped);

                // Move to next character position and increase oscillation offset
                x += currentCharWidth;
                oscillationOffset *= 1.4;
            }
        } else {
            // Center alignment: original behavior
            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];

                // Calculate base wave angle and sine value
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

                const x = (UIController.getWdt() / (row.length - 1)) * charIndex + horizontalOffset + margin;

                // Render character using unified function
                renderCharacter(character, x, rowPosition, fontSize, userHasTyped);
            }
        }

        rowPosition += lineHeight;
    }
}

function animate() {
    if (!isPlaying) return;

    frameCount++;
    // Get fresh values from UIController on each frame
    const currentWords = UIController.getWords();
    const currentUserHasTyped = UIController.getUserHasTyped();
    draw(currentWords, currentUserHasTyped);
    requestAnimationFrame(animate);
}

// Animation control functions
function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        // Animation will restart when draw is called
    }
}

function toggleAlignment() {
    isLeftAligned = !isLeftAligned;
}

// Export animation engine functions
window.AnimationEngine = {
    init: (canvasElement, context) => {
        canvas = canvasElement;
        ctx = context;
    },
    draw,
    animate,
    togglePlayback,
    toggleAlignment,
    setAlignment: (aligned) => { isLeftAligned = aligned; },
    getAlignment: () => isLeftAligned,
    isPlaying: () => isPlaying,
    getFrameCount: () => frameCount,
    getCanvas: () => canvas,
    map,
    preProcess
};
