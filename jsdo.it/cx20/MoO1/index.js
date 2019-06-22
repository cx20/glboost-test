async function webgl() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvas = document.getElementById("world");
    let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
    let renderer = glBoostContext.createRenderer({
        clearColor: {red: 0.0, green: 0.0, blue: 0.0, alpha: 1}
    });
    renderer.resize(width, height);
    
    let scene = glBoostContext.createScene();
    
    let directionalLight1 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(0.4, 0.4, 0.4), new GLBoost.Vector3(-10, -1, -10));
    scene.addChild( directionalLight1 );
    let directionalLight2 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1.0, 1.0, 1.0), new GLBoost.Vector3(50, -50, -100));
    scene.addChild( directionalLight2 );
    
    let material1 = glBoostContext.createClassicMaterial();
    let texture1 = glBoostContext.createVideoTexture("MyVideoTexture");
    await texture1.generateTextureFromVideoUri(
        "./jupiter.mp4", // jupiter.mp4
        document.getElementById("playButton"),
        true
    );
    texture1.playbackRate = 0.5;
    material1.setTexture(texture1);
    material1.shaderClass = GLBoost.LambertShader;
    let geometry1 = glBoostContext.createSphere(20, 24, 24);
    let jupiter = glBoostContext.createMesh(geometry1, material1);
    scene.addChild(jupiter);
    
    let camera = glBoostContext.createPerspectiveCamera({
        eye: new GLBoost.Vector3(0.0, 0.0, 30.0),
        center: new GLBoost.Vector3(0.0, 0.0, 0.0),
        up: new GLBoost.Vector3(0.0, 1.0, 0.0)
    }, {
        fovy: 45.0,
        aspect: width/height,
        zNear: 0.01,
        zFar: 10000.0
    });
    camera.cameraController = glBoostContext.createCameraController();
    scene.addChild(camera);
    
    let expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();
    
    let angle = 1;
    let angle2 = 1;
    let axis = new GLBoost.Vector3(0,1,0);
    
    // rendering loop
    renderer.doConvenientRenderLoop(expression, function() {
        jupiter.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
        angle += 0.005;
    });
}

webgl();
