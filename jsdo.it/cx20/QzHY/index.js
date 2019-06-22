let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;

let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({
    clearColor: {red: 0.6, green: 0.6, blue: 0.6, alpha: 1}
});
renderer.resize(width, height);

let scene = glBoostContext.createScene();

let pointLight = glBoostContext.createPointLight(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
pointLight.translate = new GLBoost.Vector3(10, 10, 10);
scene.addChild(pointLight);
let camera = glBoostContext.createPerspectiveCamera({
    eye: new GLBoost.Vector3(0, 5, 15),
    center: new GLBoost.Vector3(0.0, 0.0, 0.0),
    up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
    fovy: 60.0,
    aspect: width/height,
    zNear: 0.001,
    zFar: 30000.0
});
camera.cameraController = glBoostContext.createCameraController();
scene.addChild(camera);

let axisGizmo = glBoostContext.createAxisGizmo(100);
scene.addChild(axisGizmo);

let gtime = 0;
let glTF2Loader = GLBoost.GLTF2Loader.getInstance();
let modelConverter = GLBoost.ModelConverter.getInstance();
let scale = 0.01*2;
//let url = "https://rawcdn.githack.com/cx20/gltf-test/76d1b697d35b11ca0f8da089606bba928594724d/tutorialModels/FlightHelmet/glTF/FlightHelmet.gltf";
let url = "https://rawcdn.githack.com/BabylonJS/Exporters/9bc140006be149687be045f60b4a25cdb45ce4fc/Maya/Samples/glTF 2.0/T-Rex/trex_running.gltf";

let promise = glTF2Loader.loadGLTF(url, {
        loaderExtension: null,
        isNeededToMultiplyAlphaToColorOfPixelOutput: true,
        isTextureImageToLoadPreMultipliedAlphaAsDefault: false,
        isExistJointGizmo: false,
        isBlend: true,
        isDepthTest: true,
        defaultShaderClass: null,
        isMeshTransparentAsDefault: true
    });
      
promise.then(function(gltfObj) {
    let group = modelConverter.convertToGLBoostModel(glBoostContext, gltfObj);
    //camera.cameraController.target = group;
    console.log(group);
    group.scale = new GLBoost.Vector3(scale, scale, scale);
    group.translate = new GLBoost.Vector3(0, 0, 0);
    scene.addChild(group);

    let expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();
    
    let render = function() {
        scene.setCurrentAnimationValue('time', gtime);
        renderer.clearCanvas();
        renderer.update(expression); 
        renderer.draw(expression);
        gtime += 0.02;
        if (gtime > 8) {
            gtime = 0.0;
        }
        let rotateMatrix = GLBoost.Matrix33.rotateY(0.5);
        let rotatedVector = rotateMatrix.multiplyVector(camera.eye);
        camera.eye = rotatedVector;
        requestAnimationFrame(render);
    };
    render();
});