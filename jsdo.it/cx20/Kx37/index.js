// glboost var
let width = window.innerWidth;
let height = window.innerHeight;
let canvas = document.getElementById("world");
let renderer;
let camera;
let scene;
let groupMeshs = [];
let wireMeshs = [];

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

    scene = new GLBoost.Scene();
    renderer = new GLBoost.Renderer({
        canvas: canvas,
        clearColor: {red: 0, green: 0, blue: 0, alpha: 1}
    });
    renderer.resize(width, height);
    camera = new GLBoost.Camera({
        eye: new GLBoost.Vector3(0, 200, 400),
        center: new GLBoost.Vector3(0.0, 0.0, 0.0),
        up: new GLBoost.Vector3(0.0, 1.0, 0.0)
    }, {
        fovy: 70.0,
        aspect: width/height,
        zNear: 1,
        zFar: 1000.0
    });
    scene.add(camera);

    let directionalLight = new GLBoost.DirectionalLight(new GLBoost.Vector3(1.2, 1.2, 1.2), new GLBoost.Vector3(-1, -1, -1));
    scene.add( directionalLight );

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
    let shader = new GLBoost.LambertShader();    

    let i = max;
    
    let glTFLoader = GLBoost.GLTFLoader.getInstance();
    //let promise = glTFLoader.loadGLTF('duck.gltf', 50); // duck.gltf
    let promise = glTFLoader.loadGLTF('https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/77f1a295e65c3a59c7131e6a15552c69817c9449/1.0/Duck/glTF/Duck.gltf', 50); // duck.gltf

    promise.then(function(mesh) {
        let mesh0 = mesh.searchElement("LOD3spShape-lib");
        
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
            let geometry = new GLBoost.Sphere(w*0.5, 12, 12);
            geometry._primitiveType = GLBoost.LINE_STRIP;
            wireMeshs[i] = new GLBoost.Mesh(geometry, mesh0.material);
            wireMeshs[i].opacity = 0.5;
            let mesh = new GLBoost.Mesh(mesh0.geometry, mesh0.material);
            mesh.translate = new GLBoost.Vector3(-w*0.1, -w*0.35, 0);
            groupMeshs[i] = new GLBoost.Group();
            groupMeshs[i].addChild(mesh);
            scene.add(groupMeshs[i]);
            scene.add(wireMeshs[i]);
        }

        // loop
        scene.prepareForRender();
        loop();
    });
}

function addStaticBox(size, position, rotation, spec) {
    let geo1 = new GLBoost.Cube(new GLBoost.Vector3(size[0], size[1], size[2]), new GLBoost.Vector3(0.5, 0.5, 0.5));
    let shader = new GLBoost.LambertShader();    
    let material = new GLBoost.ClassicMaterial();
    material.shader = shader;
    let mground1 = new GLBoost.Mesh(geo1, material);
    mground1.translate = new GLBoost.Vector3(position[0], position[1], position[2]);
    if ( spec ) {
        mground1.opacity = 0.5;
    }
    mground1.dirty = true;
    scene.add( mground1 );
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
    renderer.draw(scene);
    
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