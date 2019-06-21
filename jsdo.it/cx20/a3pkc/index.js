let width = window.innerWidth;
let height = window.innerHeight;
let canvas = document.getElementById("world");
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({
    clearColor: {red: 0.0, green: 0.0, blue: 0.0, alpha: 1}
});
renderer.resize(width, height);

let scene = glBoostContext.createScene();

let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1.0, 1.0, 1.0), new GLBoost.Vector3(50, -50, -100));
scene.addChild( directionalLight );

let material1 = glBoostContext.createClassicMaterial();
let texture1 = glBoostContext.createTexture('mars_atmos_1024.jpg'); // mars_atmos_1024.jpg
material1.setTexture(texture1);
material1.shaderClass = GLBoost.PhongShader;
let geometry1 = glBoostContext.createSphere(20, 24, 24);
let mars = glBoostContext.createMesh(geometry1, material1);
scene.addChild(mars);

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

// rendering loop
renderer.doConvenientRenderLoop(expression, function(){

    // quaternion による回転
    mars.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
    angle += 0.005;

    //cloud.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle2));
    //angle2 += 0.0075;
});
