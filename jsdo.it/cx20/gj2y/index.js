"use strict";

let mx = 0;
let my = 0;
let canvas = document.getElementById("world");
canvas.addEventListener('mousemove', mouseMove, true);
let width = window.innerWidth;
let height = window.innerHeight;
let cw = width;
let ch = height;

let renderer = new GLBoost.Renderer({
    canvas: canvas,
    clearColor: {red: 0.0, green: 0.0, blue: 0.0, alpha: 1}
});
renderer.resize(width, height);
let gl = renderer.glContext;
gl.disable(gl.DEPTH_TEST);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

let scene = new GLBoost.Scene();

let camera = new GLBoost.Camera({
    eye: new GLBoost.Vector3(0.0, 1.5, 10.0),
    center: new GLBoost.Vector3(0.0, 1.5, 0.0),
    up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
    fovy: 45.0,
    aspect: width/height,
    zNear: 0.1,
    zFar: 500.0
});
scene.add(camera);

let directionalLight = new GLBoost.DirectionalLight(new GLBoost.Vector3(0.5, 0.5, 0.5), new GLBoost.Vector3(0, 0, -200), '#world');
scene.add(directionalLight);

let attributeName = 'particlesVelocity';
class MyCustomShaderSource {

    VSDefine_MyCustomShaderSource(in_, out_, f, lights) {
        let shaderText = '';

        shaderText += `${in_} vec3 aVertex_${attributeName};\n`;
        shaderText += `uniform float time;\n`;
        shaderText += `uniform vec2 mouse;\n`;
        shaderText += `uniform float endHeight;\n`;

        return shaderText;
    }

    VSTransform_MyCustomShaderSource(existCamera_f, f, lights) {
        let shaderText = '';
        shaderText += '  vec3 cameraPos = cameraEachPointPos.xyz;\n';
        shaderText += '  gl_Position = projectionMatrix * vec4(cameraPos.x+mouse.x*5.0, cameraPos.y-mouse.y*5.0, cameraPos.z, 1.0);\n';

        return shaderText;
    }

    FSShade_MyCustomShaderSource(f, gl, lights) {
        let shaderText = '';
        //shaderText += '  rt1 = vec4(1.0 - rt1.x, 1.0 - rt1.y, 1.0 - rt1.z, 1.0);\n';
        return shaderText;
    }

    prepare_MyCustomShaderSource(gl, shaderProgram, vertexAttribs, existCamera_f, lights) {

        let vertexAttribsAsResult = [];

        shaderProgram['vertexAttribute_' + attributeName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attributeName);
        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attributeName]);
        vertexAttribsAsResult.push(attributeName);

        shaderProgram.time = gl.getUniformLocation(shaderProgram, 'time');
        shaderProgram.mouse = gl.getUniformLocation(shaderProgram, 'mouse');
        shaderProgram.endHeight = gl.getUniformLocation(shaderProgram, 'endHeight');

        return vertexAttribsAsResult;
    }
}

class MyCustomShader extends GLBoost.HalfLambertShader {
    constructor(canvas, ParticleShaderSource) {
        super(canvas);
        if (ParticleShaderSource) {
            MyCustomShader.mixin(ParticleShaderSource);
            MyCustomShader.mixin(MyCustomShaderSource);
        }

        this._time = 0;
        this._mx = 0;
        this._my = 0;
    }
    setUniforms(gl, glslProgram, material) {
        super.setUniforms(gl, glslProgram, material);

        gl.uniform1f(glslProgram.time, this._time);
        gl.uniform2fv(glslProgram.mouse, [this._mx, this._my]);
        gl.uniform1f(glslProgram.endHeight, -3.5);

        return true;
    }

    increaseTime(delta) {
        this._time += delta;
    }

    setMousePosition(x, y) {
        this._mx = x;
        this._my = y;
    }
}

let particlesPosition = [];
let particlesVelocity = [];
let particlesColors = [];

for (let i = 0; i < 3000; i++) {
    let x = Math.random() * 10 - 5;
    let y = Math.random() * 10 - 5;
    let z = Math.random() * 10 - 5;
    let vertex = new GLBoost.Vector3(x, y, z);

    if (vertex.length() < 5) {
        particlesColors.push(new GLBoost.Vector4(Math.random(), Math.random(), Math.random(), 1));
        particlesPosition.push(new GLBoost.Vector3(x * 0.5, y * 0.5 + 2, z * 0.5));
        particlesVelocity.push(new GLBoost.Vector3((Math.random() - 0.5) * 4 / 10, Math.random() * 10 / 10, (Math.random() - 0.5) * 4 / 10));
    }
}

/*
let particleGeometry = new GLBoost.Particle({
    position: particlesPosition,
    particlesVelocity: particlesVelocity,
    color: particlesColors
}, 0.3, 0.3, null, '#world');
*/
let particleGeometry = new GLBoost.Particle({
    position: particlesPosition,
    particlesVelocity: particlesVelocity,
    color: particlesColors
}, 0.3, 0.3, null, GLBoost.DYNAMIC_DRAW, '#world');

let material = new GLBoost.ClassicMaterial('#world');
material.shader = new MyCustomShader('#world');

let texture = new GLBoost.Texture('../../assets/4/a/w/f/4awfi.png', '#world'); // ball.png
//let texture = new GLBoost.Texture('ball.png', '#world'); // ball.png
material.diffuseTexture = texture;
let particle = new GLBoost.Mesh(particleGeometry, material);

scene.add(particle);

scene.prepareForRender();

// mouse
function mouseMove(e){
    mx = (e.offsetX / cw) * 2.0 - 1.0;
    my = (e.offsetY / ch) * 2.0 - 1.0;
}

let render = function() {
    renderer.clearCanvas();
    renderer.draw(scene);

    //let rotateMatrix = GLBoost.Matrix33.rotateY(-0.10);
    let rotateMatrix = GLBoost.Matrix33.rotateY(-0.05);
    let rotatedVector = rotateMatrix.multiplyVector(camera.eye);
    camera.eye = rotatedVector;

    let myCustomShader = particle.material.shader;
    myCustomShader.increaseTime(0.016);
    myCustomShader.setMousePosition(mx, my);
    //myCustomShader.dirty = true;

    requestAnimationFrame(render);
};
render();
