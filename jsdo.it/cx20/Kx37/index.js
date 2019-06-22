// glboost var
let width = window.innerWidth;
let height = window.innerHeight;
let canvas = document.getElementById("world");
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer;
let camera;
let scene;
let groupMeshs = [];
let wireMeshs = [];
let expression;

//oimo var
let world;
let G = -10, nG = -10;
let wakeup = false;
let bodys = [];
let stats;

init();

function init() {
    stats = new Stats();
    stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    stats.domElement.style.position = "fixed";
    stats.domElement.style.left     = "5px";
    stats.domElement.style.top      = "5px";
    document.body.appendChild(stats.domElement);

    scene = glBoostContext.createScene();
    renderer  = glBoostContext.createRenderer({
      clearColor: {red: 0.0, green: 0.0, blue: 0.0, alpha: 1}
    });
    renderer.resize(width, height);
    camera = glBoostContext.createPerspectiveCamera({
        eye: new GLBoost.Vector3(0, 150, 300),
        center: new GLBoost.Vector3(0.0, 0.0, 0.0),
        up: new GLBoost.Vector3(0.0, 1.0, 0.0)
    }, {
        fovy: 70.0,
        aspect: width/height,
        zNear: 0.01,
        zFar: 10000.0
    });
    camera.cameraController = glBoostContext.createCameraController();
    scene.addChild(camera);

    let directionalLight1 = glBoostContext.createDirectionalLight(new GLBoost.Vector4(1, 1, 1, 1), new GLBoost.Vector3(-30, -30, -30));
    scene.addChild( directionalLight1 );
    let directionalLight2 = glBoostContext.createDirectionalLight(new GLBoost.Vector4(1, 1, 1, 1), new GLBoost.Vector3(30, 30, 30));
    scene.addChild( directionalLight2 );

    // oimo init
    world = new OIMO.World();
    populate();
}

function populate() {
    
    // The Bit of a collision group
    let group1 = 1 << 0;  // 00000000 00000000 00000000 00000001
    let group2 = 1 << 1;  // 00000000 00000000 00000000 00000010
    let group3 = 1 << 2;  // 00000000 00000000 00000000 00000100
    let all = 0xffffffff; // 11111111 11111111 11111111 11111111

    //let max = 256;
    let max = 20;

    // reset old
    clearMesh();
    world.clear();

    // Is all the physics setting for rigidbody
    let config = [
        1,   // 密度
        0.4, // 摩擦係数
        0.6, // 反発係数
        1,   // 所属する衝突グループのビット
        all  // 衝突する衝突グループのビット
    ];
    
    let ground2 = new OIMO.Body({size:[400, 40, 400], pos:[0,-20,0], world:world, config:config});
    addStaticBox([400, 40, 400], [0,-20,0], [0,0,0]);
    
    let w;
    let h;
    let d;

    let i = max;
    let scale = 0.5;
    
    let glTF2Loader = GLBoost.GLTF2Loader.getInstance();
    let modelConverter = GLBoost.ModelConverter.getInstance();
    var url = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/77f1a295e65c3a59c7131e6a15552c69817c9449/2.0/Duck/glTF/Duck.gltf";
    let promise = glTF2Loader.loadGLTF(url, {
          extensionLoader: null,
          defaultShader: GLBoost.PhongShader,
          isNeededToMultiplyAlphaToColorOfPixelOutput: true,
          isTextureImageToLoadPreMultipliedAlpha: false,
          isExistJointGizmo: false,
          isBlend: false,
          isDepthTest: true,
          isAllMeshesTransparent: false
        });

    promise.then(function(gltfObj) {
        let group0 = modelConverter.convertToGLBoostModel(glBoostContext, gltfObj);
        let mesh0 = group0.allMeshes[0];
        mesh0.scale = new GLBoost.Vector3(scale, scale, scale);

        while (i--){
            x = -50 + Math.random()*100;
            y = 200 + Math.random()*100;
            z = -50 + Math.random()*100;
            w = 20 + Math.random()*10;
            h = 10 + Math.random()*10;
            d = 10 + Math.random()*10;
            w = 100;
            bodys[i] = new OIMO.Body({
                type: 'sphere',
                size: [w*0.5],
                pos: [x, y, z],
                move: true,
                world: world
            });
            let geometry = glBoostContext.createSphere(w*0.5, 12, 12);
            geometry._primitiveType = GLBoost.LINE_STRIP;
            wireMeshs[i] = glBoostContext.createMesh(geometry);
            wireMeshs[i].opacity = 0.5;
            let mesh = glBoostContext.createMesh(mesh0.geometry);
            mesh.scale = new GLBoost.Vector3(scale, scale, scale);
            mesh.translate = new GLBoost.Vector3(-w*0.1, -w*0.35, 0);
            groupMeshs[i] = glBoostContext.createGroup();
            groupMeshs[i].addChild(mesh);
            scene.addChild(groupMeshs[i]);
            scene.addChild(wireMeshs[i]);
        }
        // loop
        expression = glBoostContext.createExpressionAndRenderPasses(1);
        expression.renderPasses[0].scene = scene;
        expression.prepareToRender();
        loop();
    });
}

function addStaticBox(size, position, rotation, spec) {
    let geo1 = glBoostContext.createCube(new GLBoost.Vector3(size[0], size[1], size[2]), new GLBoost.Vector4(0.5, 0.5, 0.5, 1.0));
    let material = glBoostContext.createClassicMaterial();
    material.shaderClass = GLBoost.LambertShader;
    let mground1 = glBoostContext.createMesh(geo1, material);
    mground1.translate = new GLBoost.Vector3(position[0], position[1], position[2]);
    if ( spec ) {
        mground1.opacity = 0.5;
    }
    mground1.dirty = true;
    scene.addChild( mground1 );
}

function clearMesh(){
/*
    let i=meshs.length;
    while (i--){scene.remove(meshs[ i ]);}
*/
}

// MAIN LOOP

function loop() {
    renderer.clearCanvas();
    renderer.draw(expression);
    
    world.step();
    
    let p, r, m, x, y, z;
    let i = bodys.length;
    let mesh;
    let wireMesh;
    wakeup = false;

    if (G !== nG) {
        wakeup = true;
        G = nG;
    }

    while (i--) {
        let body = bodys[i].body;
        mesh = groupMeshs[i];
        wireMesh = wireMeshs[i];
        if (wakeup) bodys[i].body.awake();
        if (!body.sleeping) {
            let p = body.getPosition();
            mesh.translate = new GLBoost.Vector3(p.x, p.y, p.z);
            wireMesh.translate = new GLBoost.Vector3(p.x, p.y, p.z);
            let q = body.getQuaternion();
            mesh.quaternion = new GLBoost.Quaternion(q.x, q.y, q.z, q.w);
            wireMesh.quaternion = new GLBoost.Quaternion(q.x, q.y, q.z, q.w);
            if ( p.y < -300 ) {
                x = -50 + Math.random()*100;
                y = 200 + Math.random()*100;
                z = -50 + Math.random()*100;
                bodys[i].resetPosition(x, y, z);
            }
        }
    }

    let rotateMatrixY = GLBoost.Matrix33.rotateY(1);
    let rotatedVector = rotateMatrixY.multiplyVector(camera.eye);
    camera.eye = rotatedVector;

    stats.update();

    requestAnimationFrame(loop);
}