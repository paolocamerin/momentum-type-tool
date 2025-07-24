// Vanilla JS port of the p5.js momentum type tool

// Canvas and context
let canvas, ctx;

// UI elements
let phaseSlider, ampSlider, verticalOffsetSlider, marginSlider;
let playPauseBtn, pasteBtn;
let phaseValue, ampValue, verticalOffsetValue, marginValue;
let typingInfo;

// State variables
let words = "Start typing your title";
let userHasTyped = false;
let wdt = 0;
let lineHeight = 0;
let rowPosition = 0;
let frameCount = 0;
let isPlaying = true;
let lastBackspaceTime = 0;
let backspaceDelay = 50;
let keys = {};

function init() {
    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Get UI elements
    phaseSlider = document.getElementById('phaseSlider');
    ampSlider = document.getElementById('ampSlider');
    verticalOffsetSlider = document.getElementById('verticalOffsetSlider');
    marginSlider = document.getElementById('marginSlider');
    playPauseBtn = document.getElementById('playPauseBtn');
    pasteBtn = document.getElementById('pasteBtn');

    // Get value display elements
    phaseValue = document.getElementById('phaseValue');
    ampValue = document.getElementById('ampValue');
    verticalOffsetValue = document.getElementById('verticalOffsetValue');
    marginValue = document.getElementById('marginValue');

    // Get typing info element
    typingInfo = document.querySelector('.typing-info');

    setupCanvas();
    setupEventListeners();
    updateSliderValues();
    animate();
}

function setupCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = (window.innerWidth / 16) * 9;
    updateCanvasWidth();

    // Set canvas style
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = canvas.height + 'px';

    if (!isPlaying) {
        draw();
    }
}

function updateCanvasWidth() {
    const margin = getMarginValue();
    wdt = canvas.width - margin * 2;
}

function setupEventListeners() {
    // Slider events
    phaseSlider.addEventListener('input', () => {
        updateSliderValues();
        if (!isPlaying) draw();
    });

    ampSlider.addEventListener('input', () => {
        updateSliderValues();
        if (!isPlaying) draw();
    });

    verticalOffsetSlider.addEventListener('input', () => {
        updateSliderValues();
        if (!isPlaying) draw();
    });

    marginSlider.addEventListener('input', () => {
        updateSliderValues();
        updateCanvasWidth();
        if (!isPlaying) draw();
    });

    // Button events
    playPauseBtn.addEventListener('click', togglePlayback);
    pasteBtn.addEventListener('click', pasteFromClipboard);

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Focus canvas for keyboard input
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
}

function updateSliderValues() {
    phaseValue.textContent = getPhaseValue().toFixed(2);
    ampValue.textContent = Math.round(getAmplitudeValue());
    verticalOffsetValue.textContent = getVerticalOffsetValue().toFixed(2);
    marginValue.textContent = Math.round(getMarginValue());
}

function handleKeyDown(e) {
    keys[e.code] = true;

    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;

    if (!userHasTyped && e.key.length === 1 && !isModifierKey) {
        words = "";
        userHasTyped = true;
        typingInfo.classList.add('fade-out');
    }

    if (e.key.length === 1 && !isModifierKey) {
        words += e.key;
        if (!isPlaying) draw();
    }

    // Handle Enter for line breaks
    if (e.code === 'Enter') {
        e.preventDefault();
        words += "\n";
        if (!isPlaying) draw();
    }

    // Handle Backspace
    if (e.code === 'Backspace') {
        e.preventDefault();
        if (userHasTyped) {
            const now = Date.now();
            if (now - lastBackspaceTime > backspaceDelay) {
                words = words.slice(0, -1);
                checkIfEmpty();
                lastBackspaceTime = now;
                if (!isPlaying) draw();
            }
        }
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        animate();
    }
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (!userHasTyped) {
            words = "";
            userHasTyped = true;
            typingInfo.classList.add('fade-out');
        }
        words += text;
        if (!isPlaying) draw();
    } catch (err) {
        console.error("Clipboard read failed:", err);
    }
}

function preProcess(inputText) {
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
                    currentLine += (currentLine ? " " : "") + word;
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

function draw() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = userHasTyped ? 'black' : '#e6e6e6';

    const margin = getMarginValue();
    rowPosition = margin;
    lineHeight = canvas.height / 10;
    const ampl = getAmplitudeValue();
    const phase = frameCount * 0.05;
    const additionalPhase = getPhaseValue();
    const rowOffset = getVerticalOffsetValue();
    const rows = preProcess(words);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        for (let i = 0; i < row.length; i++) {
            const c = row[i];
            const v = row.length > 1 ? 1 - Math.abs(map(i, 0, row.length - 1, 1, -1)) : 1;
            const ang = (Math.PI / row.length) * i + phase + additionalPhase + (rowIndex + 1) * rowOffset;
            const sp = Math.sin(ang) * ampl * v;
            const fontSize = canvas.height / (row.length > 20 ? map(row.length, 20, 60, 15, 40) : 15);

            ctx.font = `${fontSize}px Inter, sans-serif`;

            const x = (wdt / (row.length - 1)) * i + sp + margin;
            const y = rowPosition;

            ctx.fillText(c.toUpperCase(), x, y);
        }

        rowPosition += lineHeight;
    }

    // Handle continuous backspace when key is held
    if (keys['Backspace'] && userHasTyped) {
        const now = Date.now();
        if (now - lastBackspaceTime > backspaceDelay) {
            words = words.slice(0, -1);
            checkIfEmpty();
            lastBackspaceTime = now;
        }
    }
}

function animate() {
    if (!isPlaying) return;

    frameCount++;
    draw();
    requestAnimationFrame(animate);
}

// Helper functions to get scaled slider values
function getPhaseValue() {
    return parseFloat(phaseSlider.value) * 10;
}

function getAmplitudeValue() {
    return parseFloat(ampSlider.value) * 400;
}

function getVerticalOffsetValue() {
    return parseFloat(verticalOffsetSlider.value);
}

function getMarginValue() {
    return 50 + parseFloat(marginSlider.value) * 350;
}

// Check if text is empty and restore placeholder
function checkIfEmpty() {
    if (words.length === 0) {
        userHasTyped = false;
        words = "Start typing your title";
        typingInfo.classList.remove('fade-out');
    }
}

// Utility function to map values from one range to another
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
