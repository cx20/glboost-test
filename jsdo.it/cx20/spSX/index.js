"use strict";

// for liquidfun.js
let world = null;
let timeStep = 1.0 / 60.0;
let velocityIterations = 8;
let positionIterations = 3;
let g_groundBody = null;
let test;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
//let METER = 100;
let METER = 200;
let OFFSET_X = -windowWidth / 2;
let OFFSET_Y = -windowHeight / 2;

function WaveMachine() {
    let bdDef = new b2BodyDef();
    let bobo = world.CreateBody(bdDef);
    let wg = new b2PolygonShape();
    wg.SetAsBoxXYCenterAngle(
        windowWidth / METER / 2,
        0.05,
        new b2Vec2(windowWidth / METER / 2, windowHeight / METER + 0.05),
        0
    );
    bobo.CreateFixtureFromShape(wg, 5);
    let wgl = new b2PolygonShape();
    wgl.SetAsBoxXYCenterAngle(
        0.05,
        windowHeight / METER / 2,
        new b2Vec2(-0.05, windowHeight / METER / 2),
        0
    );
    bobo.CreateFixtureFromShape(wgl, 5);
    let wgr = new b2PolygonShape();
    wgr.SetAsBoxXYCenterAngle(
        0.05,
        windowHeight / METER / 2,
        new b2Vec2(windowWidth / METER + 0.05, windowHeight / METER / 2),
        0
    );
    bobo.CreateFixtureFromShape(wgr, 5);
    let psd = new b2ParticleSystemDef();
    //psd.radius = 0.025;
    psd.radius = 0.025 * 2;
    psd.dampingStrength = 0.2;
    let particleSystem = world.CreateParticleSystem(psd);
    let box = new b2PolygonShape();
    box.SetAsBoxXYCenterAngle(
        1,
        2,
        new b2Vec2(windowWidth / METER / 2, -windowHeight / METER / 2),
        0
    );
    let particleGroupDef = new b2ParticleGroupDef();
    particleGroupDef.shape = box;
    let particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
}

WaveMachine.prototype.Step = function() {
    world.Step(timeStep, velocityIterations, positionIterations);
    this.time += timeStep;
}

function testSwitch(testName) {
    world.SetGravity(new b2Vec2(0, 10));
    let bd = new b2BodyDef;
    g_groundBody = world.CreateBody(bd);
    test = new window[testName];
}

// for glboost.js
let canvas;
let glBoostContext;
let renderer;
let scene;
let camera;
let particlesPosition = [];
let particlesColors = [];
let particleGeometry;
let expression;

function init() {
    testSwitch("WaveMachine");
    canvas = document.getElementById("world");
    glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);

    renderer = glBoostContext.createRenderer({
        canvas: canvas,
        clearColor: {red: 0, green: 0, blue: 0, alpha: 1}
    });
    renderer.resize(windowWidth, windowHeight);
    let gl = renderer.glContext;
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    scene = glBoostContext.createScene();

    camera = glBoostContext.createPerspectiveCamera({
        eye: new GLBoost.Vector3(0.0, 1.5, 10.0),
        center: new GLBoost.Vector3(0.0, 1.5, 0.0),
        up: new GLBoost.Vector3(0.0, 1.0, 0.0)
    }, {
        fovy: 45.0,
        aspect: windowWidth/windowHeight,
        zNear: 0.1,
        zFar: 500.0
    });
    scene.addChild(camera);

    let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(0.3, 0.3, 0.3), new GLBoost.Vector3(0, 0, -1));
    scene.addChild(directionalLight);

    let particles = world.particleSystems[0].GetPositionBuffer();

    let wide = 10;
    particlesPosition = [];
    particlesColors = [];
    for (let i = 0; i < particles.length; i++) {
        particlesColors.push(new GLBoost.Vector4(Math.random(), Math.random(), Math.random(), 1));
        particlesPosition.push(new GLBoost.Vector3((Math.random() - 0.5) * wide, (Math.random() - 0.5) * wide, (Math.random() - 0.5) * 0));
        //particlesPosition.push(new GLBoost.Vector3((Math.random() - 0.5) * wide, (Math.random() - 0.5) * wide, (Math.random() - 0.5) * wide));
    }

    particleGeometry = glBoostContext.createParticle({
        position: particlesPosition,
        color: particlesColors
    }, 0.2, 0.2, null, GLBoost.DYNAMIC_DRAW);

    let material = glBoostContext.createClassicMaterial();
    let texture = glBoostContext.createTexture('../../assets/4/a/w/f/4awfi.png'); // ball.png
    material.setTexture(texture);
    let particle = glBoostContext.createMesh(particleGeometry, material);
    scene.addChild(particle);

    expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();
}


let render = function() {
    renderer.clearCanvas();
    renderer.draw(expression);
    
    //let rotateMatrix = GLBoost.Matrix33.rotateY(-0.01);
    let rotateMatrix = GLBoost.Matrix33.rotateY(0);
    let rotatedVector = rotateMatrix.multiplyVector(camera.eye);
    camera.eye = rotatedVector;

    world.Step(timeStep, velocityIterations, positionIterations);
    let particles = world.particleSystems[0].GetPositionBuffer();

    for (let i = 0; i < particles.length; i++) {
        let x = particles[i * 2] * METER + OFFSET_X;
        let y = windowHeight - particles[(i * 2) + 1] * METER + OFFSET_Y;
        let z = 0;
        particlesPosition[i].x = x / 100;
        particlesPosition[i].y = y / 100;
    }

    particleGeometry.updateVerticesData({
        position: particlesPosition
    }, 0.2, 0.2, null);

    requestAnimationFrame(render);
};

let gravity = new b2Vec2(0, 10);
world = new b2World(gravity);

window.onload = function() {
    init();
    render();
}