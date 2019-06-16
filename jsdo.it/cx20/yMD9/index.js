// setup GLBoost renderer
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

// make a scene
let scene = glBoostContext.createScene();

let geometryCube = glBoostContext.createCube(new GLBoost.Vector3(3, 3, 3), new GLBoost.Vector4(1, 1, 1, 1));

// setup material
let material = glBoostContext.createPBRMetallicRoughnessMaterial();
material.shaderClass = GLBoost.PBRPrincipledShader;
// https://www.cgbookcase.com/textures/brick-wall-02
let urlBase = "https://rawcdn.githack.com/cx20/jsdo-static-contents/89194aefe92cf7111cbac116f6f0bfb194b65503/";
let texture          = glBoostContext.createTexture(urlBase + 'textures/Brick_wall_02_1K_Base_Color.jpg');
let textureAO        = glBoostContext.createTexture(urlBase + 'textures/Brick_wall_02_1K_AO.jpg');
let textureNormal    = glBoostContext.createTexture(urlBase + 'textures/Brick_wall_02_1K_Normal.jpg');
//let textureRoughness = glBoostContext.createTexture(urlBase + 'textures/Brick_wall_02_1K_Roughness.jpg');
let textureORM = glBoostContext.createTexture(urlBase + 'textures/Brick_wall_02_1K_ORM.jpg');
material.setTexture(texture);
material.setTexture(textureAO, GLBoost.TEXTURE_PURPOSE_OCCLUSION);
material.setTexture(textureNormal, GLBoost.TEXTURE_PURPOSE_NORMAL);
material.setTexture(textureORM, GLBoost.TEXTURE_PURPOSE_METALLIC_ROUGHNESS);

let meshCube = glBoostContext.createMesh(geometryCube, material);
//meshSphere.translate = new GLBoost.Vector3((r-0.5)*4, (m-0.5)*4, 0.0);

scene.addChild(meshCube);

let pointLight = glBoostContext.createPointLight(new GLBoost.Vector3(1.0, 1.0, 1.0));
pointLight.translate = new GLBoost.Vector3(10, 10, 10);
scene.addChild(pointLight);

//let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(0, 0, -1));
let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(90, 0, 0));
//directionalLight.rotate = new GLBoost.Vector3(90,0,0);
scene.addChild( directionalLight );

let camera = glBoostContext.createPerspectiveCamera({
  eye: new GLBoost.Vector3(0.0, 0.0, 2.7),
  center: new GLBoost.Vector3(0.0, 0.0, 0.0),
  up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
  fovy: 45.0,
  aspect: 1.0,
  zNear: 0.1,
  zFar: 1000.0
});
camera.cameraController = glBoostContext.createCameraController();
scene.addChild(camera);

let expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

let angle = 0;
let axis = new GLBoost.Vector3(0,1,0);

let render = function() {
  renderer.clearCanvas();
  renderer.draw(expression);

  meshCube.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));

  angle += 0.005;
    
  requestAnimationFrame(render);
};

render();