export class WebGLCanvas {
    canvasWidth = 640
    canvasHeight = 480
    wrapper: HTMLDivElement
    canvas: HTMLCanvasElement

    gl: WebGLRenderingContext
    programInfo?: object

    constructor() {
        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("canvas-wrapper")

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.canvasWidth
        this.canvas.height = this.canvasHeight
        this.canvas.style.width = this.canvasWidth + "px"
        this.canvas.style.height = this.canvasHeight + "px"
        this.gl = this.canvas.getContext("webgl")!

        this.wrapper.append(this.canvas)

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

    }
    init() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const shaderProgram = this.initShaderProgram()
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        }
    }

    initBuffers(gl: WebGLRenderingContext = this.gl) {
        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Now create an array of positions for the square.
        const positions = [
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);
        return {
            position: positionBuffer,
        };
    }

    drawScene(gl: WebGLRenderingContext, programInfo: any, buffers: any) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0) //Clear to black, fully opaque
        gl.clearDepth(1.0) // Clear everything
        gl.enable(gl.DEPTH_TEST) // Enable depth testing
        gl.depthFunc(gl.LEQUAL) // Near things obscure far things
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        const fieldOfView = 45 * Math.PI / 180 // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1
        const zFar = 100.0

    }

    loadShader(type: GLenum, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            throw "An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(shader)
        }
        return shader
    }

    initShaderProgram(): WebGLProgram {
        const vsSource = `
            attribute vec4 aVertexPosition;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `
        const fsSource = `
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource)
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource)

        const shaderProgram = this.gl.createProgram()!
        this.gl.attachShader(shaderProgram, vertexShader)
        this.gl.attachShader(shaderProgram, fragmentShader)

        if(!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            throw "Unable to initialize the shader program: " + this.gl.getProgramInfoLog(shaderProgram)
        }

        return shaderProgram
    }

}