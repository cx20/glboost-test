let X_START_POS = 0;
let Y_START_POS = 0;
let Z_START_POS = 0;

// ‥‥‥‥〓〓〓〓〓〓〓‥‥□□□
// ‥‥○○〓〓〓〓〓〓〓〓‥□□□
// ‥‥○○‥○○○○○○○○○□□
// ‥‥‥‥‥■■■□□■□‥○○○
// ‥‥‥‥■□■□□□■□□■■■
// ‥‥‥‥■□■■□□□■□□□■
// ‥‥‥‥■■□□□□■■■■■‥
// ‥‥‥‥‥‥□□□□□□□■‥‥
// ‥‥■■■■■■■○■■■‥‥‥
// ‥○■■■■■■■■■■■‥‥■
// □□○■■■■■■○■■■‥‥■
// □□□‥■■■■■■■○○■■■
// ‥□‥○○○○○○○○■■■■■
// ‥‥■■■■■■■■■■■■■■
// ‥■■■■■■■■■■‥‥‥‥‥
// ‥■‥‥■■■■‥‥‥‥‥‥‥‥
let dataSet = [
    "無","無","無","無","赤","赤","赤","赤","赤","赤","赤","無","無","肌","肌","肌",
    "無","無","白","白","赤","赤","赤","赤","赤","赤","赤","赤","無","肌","肌","肌",
    "無","無","白","白","無","白","白","白","白","白","白","白","白","赤","肌","肌",
    "無","無","無","無","無","茶","茶","茶","肌","肌","茶","肌","無","白","白","白",
    "無","無","無","無","茶","肌","茶","肌","肌","肌","茶","肌","肌","赤","赤","赤",
    "無","無","無","無","茶","肌","茶","茶","肌","肌","肌","茶","肌","肌","肌","赤",
    "無","無","無","無","茶","茶","肌","肌","肌","肌","茶","茶","茶","茶","赤","無",
    "無","無","無","無","無","無","肌","肌","肌","肌","肌","肌","肌","赤","無","無",
    "無","無","赤","赤","赤","赤","赤","赤","赤","赤","白","赤","赤","無","無","無",
    "無","白","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","無","茶",
    "肌","肌","白","赤","赤","赤","赤","赤","赤","赤","白","赤","赤","無","無","茶",
    "肌","肌","肌","無","赤","赤","赤","赤","赤","赤","赤","赤","白","白","茶","茶",
    "無","肌","無","白","白","白","白","白","白","白","白","白","赤","赤","茶","茶",
    "無","無","茶","茶","茶","赤","赤","赤","赤","赤","赤","赤","赤","赤","茶","茶",
    "無","茶","茶","茶","赤","赤","赤","赤","赤","赤","赤","無","無","無","無","無",
    "無","茶","無","無","赤","赤","赤","赤","無","無","無","無","無","無","無","無"
];

function getRgbColor( c )
{
    let colorHash = {
        "無":"#000000",
        "白":"#ffffff",
        "肌":"#ffcccc",
        "茶":"#800000",
        "赤":"#ff0000",
        "黄":"#ffff00",
        "緑":"#00ff00",
        "水":"#00ffff",
        "青":"#0000ff",
        "紫":"#800080"
    };
    return colorHash[ c ];
}

function getSingleColorDepth( c, rgbType )
{
    let result = 0;
    let rgb = getRgbColor( c );
    rgb = rgb.replace("#", "");
    let r = parseInt( "0x" + rgb.substr( 0, 2 ), 16 );
    let g = parseInt( "0x" + rgb.substr( 2, 2 ), 16 );
    let b = parseInt( "0x" + rgb.substr( 4, 2 ), 16 );
    switch ( rgbType )
    {
    case 'r':
        result = r / 255;
        break;
    case 'g':
        result = g / 255;
        break;
    case 'b':
        result = b / 255;
        break;
    }
    return result;
}

let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:0, green:0, blue:0, alpha:1}});
renderer.resize(width, height);

let scene = glBoostContext.createScene();
let positions = [];
let colors = [];

for ( let i = 0; i < 100000; i++ ) {
    let x = (Math.random() - 0.5) * 2 * 10;
    let y = (Math.random() - 0.5) * 2 * 10;
    let z = (Math.random() - 0.5) * 2 * 10;
    let vector = new  GLBoost.Vector3(x, y, z);
    if ( vector.length() < 10 ) {
        let vectorA = new GLBoost.Vector3(x + Math.random() * 1 -0.5, y + Math.random() * 1 -0.5, z + Math.random() * 1 -0.5);
        let vectorB = new GLBoost.Vector3(x + Math.random() * 1 -0.5, y + Math.random() * 1 -0.5, z + Math.random() * 1 -0.5);
        let vectorC = new GLBoost.Vector3(x + Math.random() * 1 -0.5, y + Math.random() * 1 -0.5, z + Math.random() * 1 -0.5);
        let colorA = new GLBoost.Vector3(Math.random(), Math.random(), Math.random());
        let colorB = new GLBoost.Vector3(Math.random(), Math.random(), Math.random());
        let colorC = new GLBoost.Vector3(Math.random(), Math.random(), Math.random());
        positions.push( vectorA );
        positions.push( vectorB );
        positions.push( vectorC );
        let x0 = (Math.floor(x*1.5) + 10);
        let y0 = (Math.floor(y*1.5) + 10);
        let z0 = (Math.floor(z*1.5) + 10);
        //console.log( x0 + ", " + y0 + ", " + z0 );
        if ( x0 >= (0+X_START_POS) && y0 >= (0+Y_START_POS) 
          && x0 < (16+X_START_POS) && y0 < (16+Y_START_POS) ) {
            let pos = (x0-X_START_POS) + ((15-y0)-Y_START_POS) * 16;
            if ( dataSet[pos] != "無") {
                let c = dataSet[pos];
                colorA.x = getSingleColorDepth(c, "r" );
                colorA.y = getSingleColorDepth(c, "g" );
                colorA.z = getSingleColorDepth(c, "b" );
                colorB.x = getSingleColorDepth(c, "r" );
                colorB.y = getSingleColorDepth(c, "g" );
                colorB.z = getSingleColorDepth(c, "b" );
                colorC.x = getSingleColorDepth(c, "r" );
                colorC.y = getSingleColorDepth(c, "g" );
                colorC.z = getSingleColorDepth(c, "b" );
            }
        }
        colors.push( colorA );
        colors.push( colorB );
        colors.push( colorC );
    }
}

let geometry = glBoostContext.createGeometry();
geometry.setVerticesData({
    position: positions,
    color: colors
});

let mesh = glBoostContext.createMesh(geometry);
scene.addChild(mesh);

let camera = glBoostContext.createPerspectiveCamera({
    eye: new GLBoost.Vector3(0.0, 0.0, 30.0),
    center: new GLBoost.Vector3(0.0, 0.0, 0.0),
    up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
    fovy: 45.0,
    aspect: width/height,
    zNear: 0.1,
    zFar: 1000.0
});

scene.addChild( camera );

let expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

(function(){
    //renderer.clearCanvas();
    renderer.draw(expression);

    let rotateMatrixX = GLBoost.Matrix33.rotateX(0.0);
    let rotateMatrixY = GLBoost.Matrix33.rotateY(-0.5);
    let rotatedVector = rotateMatrixX.multiplyVector(camera.eye);
    rotatedVector = rotateMatrixY.multiplyVector(rotatedVector);
    camera.eye = rotatedVector;

    requestAnimationFrame(arguments.callee);
})();