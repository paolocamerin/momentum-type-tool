// UI Controller - Handles all UI interactions and state management

// UI elements
let phaseSlider, ampSlider, verticalOffsetSlider, marginSlider;
let playPauseBtn, alignmentCheckbox, shaderModeCheckbox, textInput, fontUploadBtn, fontFile, fontSelect, exportSVGBtn;
let phaseValue, ampValue, verticalOffsetValue, marginValue;
let typingInfo;

// Color picker elements
let bgColorPicker, textColorPicker, swapColorsBtn;
let bgPickr, textPickr, colorValue1Picker, colorValue2Picker, colorValue3Picker, colorValue4Picker;

// Color state
let backgroundColor = '#ffffff';
let textColor = '#000000';
let color1 = '#6C2EA9';
let color2 = '#1F123C';
let color3 = '#250844';
let color4 = '#495C91';

// State variables (managed by main.js)
// These are initialized by main.js and passed to initUI()

// Initialize UI elements
function initUI(initialWords, initialUserHasTyped, initialWdt) {
    // Initialize state variables
    words = initialWords;
    userHasTyped = initialUserHasTyped;
    wdt = initialWdt;

    // Get UI elements
    phaseSlider = document.getElementById('phaseSlider');
    ampSlider = document.getElementById('ampSlider');
    verticalOffsetSlider = document.getElementById('verticalOffsetSlider');
    marginSlider = document.getElementById('marginSlider');
    playPauseBtn = document.getElementById('playPauseBtn');
    alignmentCheckbox = document.getElementById('alignmentCheckbox');
    shaderModeCheckbox = document.getElementById('shaderModeCheckbox');
    textInput = document.getElementById('textInput');
    fontUploadBtn = document.getElementById('fontUploadBtn');
    fontFile = document.getElementById('fontFile');
    fontSelect = document.getElementById('fontSelect');
    exportSVGBtn = document.getElementById('exportSVGBtn');

    // Get value display elements
    phaseValue = document.getElementById('phaseValue');
    ampValue = document.getElementById('ampValue');
    verticalOffsetValue = document.getElementById('verticalOffsetValue');
    marginValue = document.getElementById('marginValue');

    // Get typing info element
    typingInfo = document.querySelector('.typing-info');

    // Get color picker elements
    bgColorPicker = document.getElementById('bgColorPicker');
    textColorPicker = document.getElementById('textColorPicker');
    swapColorsBtn = document.getElementById('swapColorsBtn');

    colorValue1Picker = document.getElementById('colorValue1Picker');
    colorValue2Picker = document.getElementById('colorValue2Picker');
    colorValue3Picker = document.getElementById('colorValue3Picker');
    colorValue4Picker = document.getElementById('colorValue4Picker');

    // Initialize text input with default text
    textInput.value = words;

    // Initialize alignment state from checkbox
    window.RenderPipeline.setTextAlignment(alignmentCheckbox.checked);

    // Initialize color pickers
    initColorPickers();
}

// Setup all event listeners
function setupEventListeners() {
    // Slider events
    phaseSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    ampSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    verticalOffsetSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    marginSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    // Button events
    playPauseBtn.addEventListener('click', () => {
        window.AnimationEngine.togglePlayback();
    });

    alignmentCheckbox.addEventListener('change', () => {
        window.RenderPipeline.setTextAlignment(alignmentCheckbox.checked);
    });

    shaderModeCheckbox.addEventListener('change', () => {
        window.RenderPipeline.setShaderMode(shaderModeCheckbox.checked);
    });

    fontUploadBtn.addEventListener('click', () => fontFile.click());

    // Font file upload
    fontFile.addEventListener('change', FontManager.handleFontUpload);

    // Font selection
    fontSelect.addEventListener('change', FontManager.handleFontChange);

    // Export functionality
    exportSVGBtn.addEventListener('click', ExportManager.exportToSVG);
    document.getElementById('exportPNGBtn').addEventListener('click', ExportManager.exportToPNG);
    document.getElementById('exportVideoBtn').addEventListener('click', handleVideoExport);
    document.getElementById('recordLiveBtn').addEventListener('click', handleLiveRecording);

    // Text input events
    textInput.addEventListener('input', handleTextInput);

    // Focus text input for immediate use
    textInput.focus();

    // Color picker events
    swapColorsBtn.addEventListener('click', swapColors);
}

// Initialize color pickers
function initColorPickers() {
    // Initialize background color picker
    bgPickr = Pickr.create({
        el: '#bgColorPicker',
        theme: 'classic',
        default: backgroundColor,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });




    // Initialize text color picker
    textPickr = Pickr.create({
        el: '#textColorPicker',
        theme: 'classic',
        default: textColor,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Initialize color 1 picker

    colorValue1Picker = Pickr.create({
        el: '#colorValue1Picker',
        theme: 'classic',
        default: color1,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });
    // Initialize color 2 picker

    colorValue2Picker = Pickr.create({
        el: '#colorValue2Picker',
        theme: 'classic',
        default: color2,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Initialize color 3 picker

    colorValue3Picker = Pickr.create({
        el: '#colorValue3Picker',
        theme: 'classic',
        default: color3,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Initialize color 4 picker

    colorValue4Picker = Pickr.create({
        el: '#colorValue4Picker',
        theme: 'classic',
        default: color4,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Set initial colors
    bgPickr.setColor(backgroundColor);
    textPickr.setColor(textColor);
    colorValue1Picker.setColor(color1);
    colorValue2Picker.setColor(color2);
    colorValue3Picker.setColor(color3);
    colorValue4Picker.setColor(color4);
    // Add event listeners
    bgPickr.on('change', (color) => {
        backgroundColor = color.toHEXA().toString();
    });

    textPickr.on('change', (color) => {
        textColor = color.toHEXA().toString();
    });

    colorValue1Picker.on('change', (color) => {
        color1 = color.toHEXA().toString();
    });

    colorValue2Picker.on('change', (color) => {
        color2 = color.toHEXA().toString();
    });

    colorValue3Picker.on('change', (color) => {
        color3 = color.toHEXA().toString();
    });

    colorValue4Picker.on('change', (color) => {
        color4 = color.toHEXA().toString();
    });
}

// Swap colors function
function swapColors() {
    const tempColor = backgroundColor;
    backgroundColor = textColor;
    textColor = tempColor;

    // Update pickers
    bgPickr.setColor(backgroundColor);
    textPickr.setColor(textColor);
    colorValue1Picker.setColor(color1);
    colorValue2Picker.setColor(color2);
    colorValue3Picker.setColor(color3);
    colorValue4Picker.setColor(color4);
}

// Update slider value displays
function updateSliderValues() {
    phaseValue.textContent = getPhaseValue().toFixed(2);
    ampValue.textContent = Math.round(getAmplitudeValue());
    verticalOffsetValue.textContent = getVerticalOffsetValue().toFixed(2);
    marginValue.textContent = Math.round(getMarginValue());
}

// Handle text input changes
function handleTextInput() {
    const inputText = textInput.value;

    if (inputText.trim() === '') {
        words = "Start typing your title";
        userHasTyped = false;
        if (typingInfo) {
            typingInfo.classList.remove('fade-out');
        }
    } else {
        words = inputText;
        if (!userHasTyped) {
            userHasTyped = true;
            if (typingInfo) {
                typingInfo.classList.add('fade-out');
            }
        }
    }

    // Text changes are handled by the animation loop
}

// Canvas width management (handled by main.js)

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

// Get current state for other modules
function getCurrentState() {
    return {
        words,
        userHasTyped,
        wdt,
        phase: window.AnimationEngine.getFrameCount() * 0.05,
        additionalPhase: getPhaseValue(),
        amplitude: getAmplitudeValue(),
        rowOffset: getVerticalOffsetValue(),
        margin: getMarginValue(),
        isLeftAligned: window.RenderPipeline.getTextAlignment()
    };
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Get background color
function getBackgroundColor() {
    return backgroundColor;
}

// Get fill color
function getFillColor() {
    return textColor;
}

// Get speed value
function getSpeedValue() {
    return 1.0;
}

// Get factor value
function getFactorValue() {
    return 1.4;
}

// Get color 1 value
function getColor1Value() {
    const color = hexToRgb(color1);
    return color;
}

// Get color 2 value
function getColor2Value() {
    const color = hexToRgb(color2);
    return color;
}

// Get color 3 value
function getColor3Value() {
    const color = hexToRgb(color3);
    return color;
}

// Get color 4 value
function getColor4Value() {
    const color = hexToRgb(color4);
    return color;
}

// Video export handlers
async function handleVideoExport() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        alert('Canvas not found');
        return;
    }

    // Wait for VideoExport to be available
    if (!window.VideoExport || !window.VideoExport.exportCanvasToMP4) {
        alert('Video export module not loaded yet. Please try again in a moment.');
        return;
    }

    try {
        await window.VideoExport.exportCanvasToMP4({
            canvas: canvas,
            durationSec: 5,
            quality: 'high',
            onProgress: (progress) => {
                console.log(`Export progress: ${Math.round(progress * 100)}%`);
            }
        });
    } catch (error) {
        console.error('Video export failed:', error);
        alert(`Video export failed: ${error.message}`);
    }
}

async function handleLiveRecording() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        alert('Canvas not found');
        return;
    }

    // Wait for VideoExport to be available
    if (!window.VideoExport || !window.VideoExport.startLiveRecording) {
        alert('Video export module not loaded yet. Please try again in a moment.');
        return;
    }

    const recordBtn = document.getElementById('recordLiveBtn');

    if (!window.currentRecording) {
        // Start recording
        try {
            window.currentRecording = await window.VideoExport.startLiveRecording({
                canvas: canvas,
                fps: 30,
                quality: 'high'
            });

            recordBtn.textContent = 'Stop Recording';
            console.log('Live recording started');
        } catch (error) {
            console.error('Start recording failed:', error);
            alert(`Start recording failed: ${error.message}`);
        }
    } else {
        // Stop recording
        try {
            await window.VideoExport.stopLiveRecording();
            recordBtn.textContent = 'Record Live';
            window.currentRecording = null;
        } catch (error) {
            console.error('Stop recording failed:', error);
            alert(`Stop recording failed: ${error.message}`);
        }
    }
}

// Export UI controller functions
window.UIController = {
    init: initUI,
    setupEventListeners,
    updateSliderValues,
    getCurrentState,
    getPhaseValue,
    getAmplitudeValue,
    getVerticalOffsetValue,
    getMarginValue,
    getBackgroundColor,
    getFillColor,
    getSpeedValue,
    getFactorValue,
    getColor1Value,
    getColor2Value,
    getColor3Value,
    getColor4Value,
    getWords: () => words,
    getUserHasTyped: () => userHasTyped,
    getWdt: () => wdt,
    setWdt: (value) => { wdt = value; }
};
