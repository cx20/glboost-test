let stats;
let width = window.innerWidth;
let height = window.innerHeight;

let canvas = document.getElementById("world");
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);

let renderer = glBoostContext.createRenderer({
  clearColor: {
    red: 0.0,
    green: 0.0,
    blue: 0.0,
    alpha: 1
  }
});
renderer.resize(width, height);

stats = new Stats();
stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
stats.domElement.style.position = "fixed";
stats.domElement.style.left     = "5px";
stats.domElement.style.top      = "5px";
document.body.appendChild(stats.domElement);

let scene = glBoostContext.createScene();

let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(0.4, 0.4, 0.4), new GLBoost.Vector3(-10, -1, -10));
scene.addChild( directionalLight );
let pointLight1 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(0.6, 0.6, 0.6), new GLBoost.Vector3(0, -100, -100));
scene.addChild( pointLight1 );
let pointLight2 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(0.5, 0.5, 0.5), new GLBoost.Vector3(50, 50, -100));
scene.addChild( pointLight2 );

let material1 = glBoostContext.createClassicMaterial();
material1.shaderClass = GLBoost.PhongShader;
let texture1 = glBoostContext.createTexture('earth_atmos_1024.jpg'); // earth_atmos_1024.jpg
material1.setTexture(texture1);
material1.specularColor = new GLBoost.Vector4(0.5, 0.5, 0.5, 1);
let geometry1 = glBoostContext.createSphere(20, 24, 24);
let earth = glBoostContext.createMesh(geometry1, material1);
scene.addChild(earth);

let material2 = glBoostContext.createClassicMaterial();
material1.shaderClass = GLBoost.HalfLambertShader;
let texture2 = glBoostContext.createTexture('earth_clouds_1024.png'); // earth_clouds_1024.png
material2.setTexture(texture2);
let geometry2 = glBoostContext.createSphere(20*1.01, 24, 24);
let cloud = glBoostContext.createMesh(geometry2, material2);
scene.addChild(cloud);

let camera = glBoostContext.createPerspectiveCamera({
    eye: new GLBoost.Vector3(0.0, 0.0, 60.0),
    center: new GLBoost.Vector3(0.0, 0.0, 0.0),
    up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
    fovy: 45.0,
    aspect: width/height,
    zNear: 0.1,
    zFar: 1000.0
});

scene.addChild(camera);
let expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

let angle = 1;
let angle2 = 1;
let axis = new GLBoost.Vector3(0,1,0);

let render = function() {
    renderer.clearCanvas();
    renderer.draw(expression);

    // quaternion による回転
    earth.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
    angle += 0.01;

    cloud.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle2));
    angle2 += 0.015;
    
    stats.update();

    requestAnimationFrame(render);
};

render();
