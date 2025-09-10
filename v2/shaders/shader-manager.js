// Shader Manager - Handles WebGL shader compilation, loading, and rendering

class ShaderManager {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.programs = new Map();
        this.uniforms = new Map();
        this.isEnabled = false;
        this.isReady = false;
        this.noise = null;
        this.points = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ];
        this.timeOffset = 0;
    }

    // Initialize WebGL context and load shaders
    async init(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.error('[ShaderManager] WebGL not supported');
            return false;
        }

        try {
            await this.loadShaders();
            this.isReady = true;
            console.log('[ShaderManager] Shader system initialized successfully');
            return true;
        } catch (error) {
            console.error('[ShaderManager] Failed to initialize shaders:', error);
            return false;
        }
    }

    // Load and compile shaders
    async loadShaders() {
        const [vertSrc, fragSrc] = await Promise.all([
            this.loadShaderFile('shaders/main.vert'),
            this.loadShaderFile('shaders/main.frag')
        ]);

        const program = this.createShaderProgram(vertSrc, fragSrc);
        this.programs.set('main', program);

        // Set up uniforms
        this.uniforms.set('u_resolution', this.gl.getUniformLocation(program, 'u_resolution'));
        this.uniforms.set('u_time', this.gl.getUniformLocation(program, 'u_time'));
        this.uniforms.set('u_point1', this.gl.getUniformLocation(program, 'u_point1'));
        this.uniforms.set('u_point2', this.gl.getUniformLocation(program, 'u_point2'));
        this.uniforms.set('u_point3', this.gl.getUniformLocation(program, 'u_point3'));
        this.uniforms.set('u_point4', this.gl.getUniformLocation(program, 'u_point4'));

        // Set up vertex buffer
        this.setupVertexBuffer();

        // Initialize noise-based points
        this.initNoisePoints();
    }

    // Load shader source from file
    async loadShaderFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`[ShaderManager] Failed to load ${url}, using fallback:`, error);
            return this.getFallbackShader(url);
        }
    }

    // Get fallback shader source
    getFallbackShader(url) {
        if (url.includes('vert')) {
            return `
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;
        } else {
            return `
                precision mediump float;
                uniform vec2 u_resolution;
                uniform float u_time;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
                }
            `;
        }
    }

    // Create and compile shader program
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program link error: ${log}`);
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    }

    // Create and compile individual shader
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${log}`);
        }

        return shader;
    }

    // Set up vertex buffer for full-screen quad
    setupVertexBuffer() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                1, 1
            ]),
            gl.STATIC_DRAW
        );
        this.vertexBuffer = buffer;
    }

    // Initialize noise-based points
    initNoisePoints() {
        // Initialize noise function
        if (typeof SimplexNoise !== 'undefined') {
            try {
                this.noise = new SimplexNoise();
                console.log('[ShaderManager] SimplexNoise loaded successfully');
            } catch (e) {
                console.warn('[ShaderManager] SimplexNoise constructor failed, using fallback');
                this.initFallbackNoise();
            }
        } else {
            console.warn('[ShaderManager] SimplexNoise not available, using fallback');
            this.initFallbackNoise();
        }

        // Initialize points at corners
        this.points = [
            { x: -0.5, y: 0.5 },   // Top Left
            { x: 0.5, y: 0.5 },    // Top Right  
            { x: -0.5, y: -0.5 },  // Bottom Left
            { x: 0.5, y: -0.5 }    // Bottom Right
        ];
    }

    // Initialize fallback noise function
    initFallbackNoise() {
        this.noise = {
            noise2D: (x, y) => {
                // Improved pseudo-random noise function
                const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
                return (n - Math.floor(n)) * 2.0 - 1.0;
            }
        };
        console.log('[ShaderManager] Using fallback noise function');
    }

    // Update noise-based points
    updateNoisePoints(time) {
        if (!this.noise) return;

        this.timeOffset = time * 0.1; // Slow movement

        // Update each point with noise
        for (let i = 0; i < this.points.length; i++) {
            const baseX = i * 10.0; // Different starting positions
            const baseY = i * 15.0;

            // Generate noise-based offset
            const noiseX = this.noise.noise2D(baseX + this.timeOffset, baseY);
            const noiseY = this.noise.noise2D(baseX + this.timeOffset + 100, baseY + 100);

            // Apply offset with range -1 to 1 (can go outside canvas)
            this.points[i].x = noiseX * 1.5; // Range: -1.5 to 1.5
            this.points[i].y = noiseY * 1.5; // Range: -1.5 to 1.5
        }
    }

    // Render shader background
    render(time) {
        if (!this.isReady || !this.isEnabled) return;

        const gl = this.gl;
        const program = this.programs.get('main');

        if (!program) return;

        // Update noise-based points
        this.updateNoisePoints(time);

        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Clear canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use shader program
        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(this.uniforms.get('u_resolution'), this.canvas.width, this.canvas.height);
        gl.uniform1f(this.uniforms.get('u_time'), time);

        // Set point uniforms
        gl.uniform2f(this.uniforms.get('u_point1'), this.points[0].x, this.points[0].y);
        gl.uniform2f(this.uniforms.get('u_point2'), this.points[1].x, this.points[1].y);
        gl.uniform2f(this.uniforms.get('u_point3'), this.points[2].x, this.points[2].y);
        gl.uniform2f(this.uniforms.get('u_point4'), this.points[3].x, this.points[3].y);

        // Set up vertex attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Enable/disable shader mode
    setMode(enabled) {
        this.isEnabled = enabled;
        if (this.canvas) {
            this.canvas.style.display = enabled ? 'block' : 'none';
        }
    }

    // Get shader status
    getStatus() {
        return {
            isReady: this.isReady,
            isEnabled: this.isEnabled,
            hasWebGL: !!this.gl
        };
    }
}

// Export singleton instance
window.ShaderManager = new ShaderManager();
