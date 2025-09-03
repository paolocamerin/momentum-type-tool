// Font Manager - Handles font loading, storage, and management

// Font system constants
const DB_NAME = 'MomentumTypeToolV2DB';
const STORE_NAME = 'fonts';
const DB_VERSION = 1;
const MAX_STORED_FONTS = 10;
const LAST_FONT_KEY = 'lastUsedFontV2';

// Global font state
let font;
let db;

// IndexedDB functions
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'name' });
            }
        };
    });
}

async function storeFont(file, arrayBuffer) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check how many fonts we currently have
            const existingFonts = await listStoredFonts();

            // If we're at or over the limit, remove the oldest fonts
            if (existingFonts.length >= MAX_STORED_FONTS) {
                existingFonts.sort((a, b) => a.timestamp - b.timestamp);
                const fontsToRemove = existingFonts.slice(0, existingFonts.length - MAX_STORED_FONTS + 1);

                for (const fontToRemove of fontsToRemove) {
                    await removeFont(fontToRemove.name);
                }
            }

            // Store the new font
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const fontData = {
                name: file.name,
                data: arrayBuffer,
                timestamp: new Date().getTime()
            };

            const request = store.put(fontData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
}

async function loadStoredFont(fontName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(fontName);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function listStoredFonts() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function removeFont(fontName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(fontName);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function processFontData(arrayBuffer, fileName, shouldStoreAsLast = true) {
    try {
        const loadedFont = opentype.parse(arrayBuffer);
        font = loadedFont;

        // Store as last used font
        if (shouldStoreAsLast) {
            localStorage.setItem(LAST_FONT_KEY, fileName);
        }
    } catch (err) {
        console.error('Error processing font:', err);
        throw err;
    }
}

async function loadLastUsedFont() {
    const lastFontName = localStorage.getItem(LAST_FONT_KEY);
    if (lastFontName) {
        try {
            const fontData = await loadStoredFont(lastFontName);
            if (fontData) {
                await processFontData(fontData.data, fontData.name);
                const fontSelect = document.getElementById('fontSelect');
                if (fontSelect) {
                    fontSelect.value = lastFontName;
                }
                return true;
            }
        } catch (err) {
            console.warn('Could not load last used font:', err);
            localStorage.removeItem(LAST_FONT_KEY);
        }
    }
    return false;
}

async function loadDefaultFont() {
    try {
        // First try to load the last used font
        const lastFontLoaded = await loadLastUsedFont();
        if (lastFontLoaded) {
            return;
        }

        // If no stored font, load Inter as default
        const interURL = '../Assets/Inter_28pt-Regular.ttf';
        const response = await fetch(interURL);
        const buffer = await response.arrayBuffer();
        await processFontData(buffer, 'Inter (default)', false);
    } catch (err) {
        console.error('Error loading default font:', err);
    }
}

async function createFontSelector() {
    const fonts = await listStoredFonts();
    const select = document.getElementById('fontSelect');

    if (!select) return;

    // Clear existing options except the first default one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Add stored fonts as options
    fonts.forEach(fontData => {
        const option = document.createElement('option');
        option.value = fontData.name;
        option.textContent = fontData.name;
        select.appendChild(option);
    });

    // Set the current selection
    const lastFontName = localStorage.getItem(LAST_FONT_KEY);
    if (lastFontName) {
        select.value = lastFontName;
    }

    // Show/hide the font selector based on available fonts
    const container = document.querySelector('.font-selector-container');
    if (container) {
        if (fonts.length > 0) {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }
}

// Font event handlers
async function handleFontUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExt = /\.(ttf|otf|woff)$/i;
    if (!allowedExt.test(file.name)) {
        console.warn('Unsupported file type:', file.name);
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        await processFontData(buffer, file.name);
        await storeFont(file, buffer);
        await createFontSelector();
        console.log(`Font stored: ${file.name}`);
    } catch (err) {
        console.error('Error processing font:', err);
    }
}

async function handleFontChange(e) {
    if (!e.target.value) return;

    try {
        const fontData = await loadStoredFont(e.target.value);
        await processFontData(fontData.data, fontData.name);
    } catch (err) {
        console.error('Error loading stored font:', err);
    }
}

// Export font manager functions
window.FontManager = {
    initDB,
    loadDefaultFont,
    createFontSelector,
    handleFontUpload,
    handleFontChange,
    getFont: () => font,
    hasFont: () => !!font
};
