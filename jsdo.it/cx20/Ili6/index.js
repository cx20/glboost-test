let DOT_SIZE = 16;

// glboost var
let width = window.innerWidth;
let height = window.innerHeight;
let canvas = document.getElementById("world");
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer;
let camera;
let scene;
let meshs = [];
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

    renderer = glBoostContext.createRenderer({
        canvas: canvas,
        clearColor: {red: 0, green: 0, blue: 0, alpha: 1}
    });
    renderer.resize(width, height);
    scene = glBoostContext.createScene();
    camera = glBoostContext.createPerspectiveCamera({
        eye: new GLBoost.Vector3(0, 300, 0),
        center: new GLBoost.Vector3(0.0, 0.0, 0.0),
        up: new GLBoost.Vector3(1.0, 0.0, 0.0)
    }, {
        fovy: 70.0,
        aspect: width/height,
        zNear: 1,
        zFar: 1000.0
    });
    scene.addChild(camera);

    let directionalLight1 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(30, 30, 30));
    scene.addChild( directionalLight1 );
    let directionalLight2 = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(-30, -30, -30));
    scene.addChild( directionalLight2 );
    
    let geo1 = glBoostContext.createCube(new GLBoost.Vector3(200, 20, 200), new GLBoost.Vector4(0.7, 0.7, 0.7, 1.0));
    let material = glBoostContext.createClassicMaterial();
    material.shaderClass = GLBoost.PhongShader;
    let mground1 = glBoostContext.createMesh(geo1, material);
    //mground1.translate.y = -50;
    let tmpVector3 = mground1.translate;
    mground1.translate = new GLBoost.Vector3(tmpVector3.x, tmpVector3.y - 50, tmpVector3.z);
    mground1.dirty = true;
    scene.addChild( mground1 );

    // oimo init
    world = new OIMO.World();
    populate();

    // loop
    //scene.prepareForRender();
    expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();
    
    loop();
}

function populate() {
    
    let max = 500;

    // reset old
    clearMesh();
    world.clear();

    let ground2 = new OIMO.Body({size:[200, 20, 200], pos:[0,-50,0], world:world});

    let w = DOT_SIZE * 0.8;
    let h = DOT_SIZE * 0.8;
    let d = DOT_SIZE * 0.8;

    for (let i = 0; i < max; i++) {
        let x = (Math.random() * 16) - 8;
        let y = (Math.random() * 16*2) + 10;
        let z = (Math.random() * 16) - 8;
        bodys[i] = new OIMO.Body({
            type: 'box',
            size: [w, h, d],
            pos: [x * DOT_SIZE, y * DOT_SIZE, z * DOT_SIZE],
            move: true,
            world: world
        });
        let material = glBoostContext.createClassicMaterial();
        material.shaderClass = GLBoost.PhongShader;
        let color = new GLBoost.Vector4(Math.random(), Math.random(), Math.random(), 1.0);
        let geoBox = glBoostContext.createCube(new GLBoost.Vector3(w, h, d), color);
        meshs[i] = glBoostContext.createMesh(geoBox, material);
        meshs[i].translate = new GLBoost.Vector3(x * DOT_SIZE, y * DOT_SIZE, z * DOT_SIZE);
        scene.addChild(meshs[i]);
    }
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
    let mesh;
    wakeup = false;

    if (G !== nG) {
        wakeup = true;
        G = nG;
    }

    for ( let i = 0; i < bodys.length; i++ ) {
        let body = bodys[i].body;
        mesh = meshs[i];
        if (wakeup) bodys[i].body.awake();
        if (!body.sleeping) {
            let p = body.getPosition();
            mesh.translate = new GLBoost.Vector3(p.x, p.y, p.z);
            let q = body.getQuaternion();
            mesh.quaternion = new GLBoost.Quaternion(q.x, q.y, q.z, q.w);
            if ( p.y < -300 ) {
                let x = (Math.random() * 16) - 8;
                let y = (Math.random() * 16*2) + 10;
                let z = (Math.random() * 16) - 8;
                bodys[i].resetPosition(x * DOT_SIZE, y * DOT_SIZE, z * DOT_SIZE);
            }
        }
    }

    let rotateMatrixY = GLBoost.Matrix33.rotateY(1);
    let rotatedVector = rotateMatrixY.multiplyVector(camera.eye);
    camera.eye = rotatedVector;

    stats.update();

    requestAnimationFrame(loop);
}
