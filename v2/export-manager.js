// Export Manager - Handles SVG export functionality

function exportToSVG() {
    if (!FontManager.hasFont()) {
        console.warn('No font loaded for SVG export');
        return;
    }

    const font = FontManager.getFont();
    const state = UIController.getCurrentState();

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', (window.innerWidth / 16) * 9);
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${(window.innerWidth / 16) * 9}`);

    // Create main group for all text
    const group = document.createElementNS(svgNS, 'g');
    svg.appendChild(group);

    // Get current animation state
    const margin = state.margin;
    const ampl = state.amplitude;
    const phase = state.phase;
    const additionalPhase = state.additionalPhase;
    const rowOffset = state.rowOffset;
    const rows = AnimationEngine.preProcess(state.words);
    const isLeftAligned = state.isLeftAligned;

    let rowPosition = margin;
    const lineHeight = ((window.innerWidth / 16) * 9) / 10;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        // Calculate font size for the row
        let fontSize;
        if (row.length > 20) {
            fontSize = ((window.innerWidth / 16) * 9) / AnimationEngine.map(row.length, 20, 60, 15, 40);
        } else {
            fontSize = ((window.innerWidth / 16) * 9) / 15;
        }

        if (isLeftAligned) {
            // Left alignment SVG export
            let x = margin;
            let oscillationOffset = 1;

            for (let charIndex = 0; charIndex < row.length; charIndex++) {
                const character = row[charIndex];
                const glyph = font.charToGlyph(character.toUpperCase());
                const currentCharWidth = glyph.advanceWidth * (fontSize / font.unitsPerEm);

                const finalX = charIndex == 0 ? margin : x + ((Math.sin(phase + additionalPhase) * .5 + .5) * ampl) * oscillationOffset * 1 / row.length * charIndex;

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
                svgPath.setAttribute('fill', state.userHasTyped ? 'black' : '#e6e6e6');
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
                    centerAlignmentIntensity = 1 - Math.abs(AnimationEngine.map(charIndex, 0, row.length - 1, 1, -1));
                } else {
                    centerAlignmentIntensity = 1;
                }
                const horizontalOffset = baseSineValue * centerAlignmentIntensity;

                const x = (state.wdt / (row.length - 1)) * charIndex + horizontalOffset + margin;

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
                svgPath.setAttribute('fill', state.userHasTyped ? 'black' : '#e6e6e6');
                group.appendChild(svgPath);
            }
        }

        rowPosition += lineHeight;
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

// Export export manager functions
window.ExportManager = {
    exportToSVG
};
