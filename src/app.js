import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Perlin } from 'three-noise/build/three-noise.module';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0,-0.1);
let planeIntersect = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const currentM = new THREE.Matrix4();

//https://www.npmjs.com/package/three-noise
const perlin = new Perlin(Math.random())

//Texture 
const textureloader = new THREE.TextureLoader();
const matCapTexture = textureloader.load("/MatCap/green.jpg")
const matCapTexture3 = textureloader.load("/MatCap/matcap8.jpg")
const matCapTexture5 = textureloader.load("/MatCap/skin2.png")
const matCapTexture9 = textureloader.load("/MatCap/m1.jpeg")

/**
 * Object
 */
//MeshMatcapMaterial
const sizeBoxInstance = 10
const geometry = new THREE.BoxGeometry(sizeBoxInstance, sizeBoxInstance, 1);
const material = new THREE.MeshMatcapMaterial({ color: 0xffffff, wireframe: false, matcap: matCapTexture3 });

const sizeField = 50;

const instances = sizeField * sizeField;
const mesh = new THREE.InstancedMesh(geometry, material, instances);
let count = 0;

for (let i = 0; i < sizeField; i++) {

    for (let j = 0; j < sizeField; j++) {

        let matrix = new THREE.Matrix4(); 
        matrix.setPosition(new THREE.Vector3(i * (sizeBoxInstance + 1) - sizeField / 2 * sizeBoxInstance, j * (sizeBoxInstance + 1) - sizeField / 2 * sizeBoxInstance, 0));
        mesh.setMatrixAt(count, matrix);
        count ++    
    }
}

scene.add(mesh);

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
scene.add(plane)

const pointerCenter = new THREE.Object3D();
scene.add(pointerCenter)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth, // 800
    height: window.innerHeight // 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 120
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

canvas.addEventListener('pointermove', onPointerMove);
window.addEventListener('resize', onResize);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias : true
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // // calculate objects intersecting the picking ray
    raycaster.ray.intersectPlane(plane, planeIntersect);
    
    //testRedBox
    const distPointerCenter = planeIntersect.distanceTo(pointerCenter.position); 
    pointerCenter.position.lerp(planeIntersect, Math.sign(distPointerCenter) * 0.01); 

    //instances
    for (let i = 0; i < instances -1; i++) {
    
        mesh.getMatrixAt(i, currentM);
        let positionInstans = new Vector3();  
        positionInstans.setFromMatrixPosition(currentM);  
        const dist = pointerCenter.position.distanceTo(positionInstans);
        tmpM.makeRotationX(0);
        tmpM.copyPosition(currentM);
        currentM.copy(tmpM);

        let nd = 100 * perlin.get3(new Vector3(positionInstans.y + elapsedTime * 0.1, positionInstans.x + elapsedTime * 0.1, elapsedTime * 0.1  + 0.5)) 
    
        if (dist < 100 + nd) {

            let d = 1 - THREE.MathUtils.smoothstep(dist, 25, 100 + nd);
        
            tmpM.makeRotationX(Math.PI * d);
            tmpM.copyPosition(currentM);
            currentM.copy(tmpM);
        }
        mesh.setMatrixAt(i, currentM);
    }

    mesh.instanceMatrix.needsUpdate = true;


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / sizes.width) * 2 - 1;
    pointer.y = - (event.clientY / sizes.height) * 2 + 1;

}

function onResize(event) {
    sizes.width = window.innerWidth; 
    sizes.height =  window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
}
