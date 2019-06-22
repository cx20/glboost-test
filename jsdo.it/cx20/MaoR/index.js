let width = window.innerWidth;
let height = window.innerHeight;

// setup GLBoost renderer
var canvas = document.getElementById("world");
var glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);

var renderer = glBoostContext.createRenderer({
  clearColor: {
    red: 0.0,
    green: 0.0,
    blue: 0.0,
    alpha: 1
  }
});
renderer.resize(width, height);

// make a scene
var scene = glBoostContext.createScene();

// setup material
var material = glBoostContext.createClassicMaterial();
var texture = glBoostContext.createTexture('earth.jpg');
material.setTexture(texture);
material.shaderClass = GLBoost.PhongShader;

// createPlane(width, height, uSpan, vSpan, customVertexAttributes, isUVRepeat
var geometryPlane = glBoostContext.createPlane(1, 1, 1, 1);
var meshPlane = glBoostContext.createMesh(geometryPlane, material);
meshPlane.translate = new GLBoost.Vector3(-1.5, 1.5, 0.0);

// createCube(widthVector, vertexColor)
var geometryCube = glBoostContext.createCube(new GLBoost.Vector3(1,1,1), new GLBoost.Vector4(1,1,1,1));
var meshCube = glBoostContext.createMesh(geometryCube, material);
meshCube.translate = new GLBoost.Vector3(0.0, 1.5, 0.0);

// createSphere(radius, widthSegments, heightSegments, vertexColor)
var geometrySphere = glBoostContext.createSphere(0.5, 24, 24, null);
var meshSphere = glBoostContext.createMesh(geometrySphere, material);
meshSphere.translate = new GLBoost.Vector3(1.5, 1.5, 0.0);

// createAxisGizmo(length)
var meshAxis = glBoostContext.createAxisGizmo(0.5);
meshAxis.translate = new GLBoost.Vector3(-1.5, -0.5, 0.0);

// createGridGizmo(length, division, isXZ, isXY, isYZ, colorVec)
var meshGrid = glBoostContext.createGridGizmo(0.5, 2, true, true, false, new GLBoost.Vector4(1, 1, 1, 1));
meshGrid.translate = new GLBoost.Vector3(0.0, -0.5, 0.0);

var materialB = glBoostContext.createClassicMaterial();
var textureB = glBoostContext.createTexture('earth.jpg');
materialB.setTexture(textureB);
materialB.shaderClass = GLBoost.PhongShader;


var wide = 1.0;
var particlesPosition = [];
for (var i=0; i<100; i++) {
  particlesPosition.push([(Math.random() - 0.5)*wide, (Math.random() - 0.5)*wide, (Math.random() - 0.5)*wide]);
}
// createParticle(centerPointData, particleWidth, particleHeight, customVertexAttributes, performanceHint)
var geometryParticle = glBoostContext.createParticle({position: particlesPosition}, 0.1, 0.1, null, GLBoost.DYNAMIC_DRAW);
var meshParticle = glBoostContext.createMesh(geometryParticle, materialB);
meshParticle.translate = new GLBoost.Vector3(1.5, -0.5, 0.0);

scene.addChild(meshPlane);
scene.addChild(meshSphere);
scene.addChild(meshCube);
scene.addChild(meshAxis);
scene.addChild(meshGrid);
scene.addChild(meshParticle);

var directionalLight1 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(60, 30, 30));
scene.addChild( directionalLight1 );
var directionalLight2 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(-60, -30, -30));
scene.addChild( directionalLight2 );

var camera = glBoostContext.createPerspectiveCamera({
  eye: new GLBoost.Vector3(0.0, 0.0, 3.0),
  center: new GLBoost.Vector3(0.0, 0.0, 0.0),
  up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
  fovy: 45.0,
  aspect: width/height,
  zNear: 0.1,
  zFar: 1000.0
});
camera.cameraController = glBoostContext.createCameraController();
scene.addChild(camera);

var expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

var angle = 0;
var axis = new GLBoost.Vector3(0,1,0);

var render = function() {
  renderer.clearCanvas();
  renderer.draw(expression);

  //meshPlane.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshPlane.rotate = new GLBoost.Vector3(90, 0, GLBoost.MathUtil.radianToDegree(-angle));
  meshSphere.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshCube.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshAxis.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshGrid.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshParticle.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));

  angle += 0.02;
    
  requestAnimationFrame(render);
};

render();
