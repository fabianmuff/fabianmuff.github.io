




let camera, scene, renderer;
let controller;
var geometry, material, cube;

var controller1, controller2;
var controllerGrip1, controllerGrip2;

var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();

var controls;
var group = [];

init();
animate();

function init() {

    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    

    //

    

    //


    geometry = new THREE.BoxGeometry();
    material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    cube = new THREE.Mesh(geometry, material);
    cube.position.z = -3;
    scene.add(cube);



    geometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

    function onSelect() {

        material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0).applyMatrix4(controller.matrixWorld);
        mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(mesh);

    }



    //


    var groundGeometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
    var groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.name = 'Ground';
    ground.position.x = 0;
    ground.position.y = 0;
    ground.position.z = -10;
    scene.add(ground);

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load('../three/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', function (map) {

        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set(4, 4);
        groundMaterial.map = map;
        groundMaterial.needsUpdate = true;


    });



    window.addEventListener('resize', onWindowResize, false);

    let timerId = setInterval(() => update(), 10);

    // controllers

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    //

    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    var line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    //





}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function update() {

    //tempMatrix.getInverse(controller1.matrixWorld);

    var object = cube;
    //object.matrix.premultiply(tempMatrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);

    object.rotation.x += 0.02;
    object.rotation.y += 0.01;
    object.rotation.z += 0.03
    //object.position.x += 0.001;

    //controller.add(object);
}

function animate() {


    renderer.setAnimationLoop(render);
    //requestAnimationFrame(animate);


    //cube.material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });


}

function render() {
    renderer.render(scene, camera);
}











function onSelectStart(event) {

    var controller = event.target;

    var intersections = getIntersections(controller);

    if (intersections.length > 0) {

        var intersection = intersections[0];

        tempMatrix.getInverse(controller.matrixWorld);

        var object = intersection.object;
        object.matrix.premultiply(tempMatrix);
        object.matrix.decompose(object.position, object.quaternion, object.scale);
        object.material.emissive.b = 1;
        controller.add(object);

        controller.userData.selected = object;

    }

}

function onSelectEnd(event) {

    var controller = event.target;

    if (controller.userData.selected !== undefined) {

        var object = controller.userData.selected;
        object.matrix.premultiply(controller.matrixWorld);
        object.matrix.decompose(object.position, object.quaternion, object.scale);
        object.material.emissive.b = 0;
        scene.add(object);

        controller.userData.selected = undefined;

    }


}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(scene.children);

}

function intersectObjects(controller) {

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    var line = controller.getObjectByName('line');
    var intersections = getIntersections(controller);

    if (intersections.length > 0) {

        var intersection = intersections[0];

        var object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while (intersected.length) {

        var object = intersected.pop();
        object.material.emissive.r = 0;

    }

}
