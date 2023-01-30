// import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0,-0.1);
let planeIntersect = new THREE.Vector3();



//Texture 

const textureloader = new THREE.TextureLoader();
const matCapTexture = textureloader.load("/MatCap/green.jpg")
const matCapTexture3 = textureloader.load("/MatCap/clay.jpg")

/**
 * Object
 */
//MeshMatcapMaterial


for (let i = 0; i < 50; i++) {
    
    for (let j = 0; j < 50; j++) {
    
        const geometry = new THREE.BoxGeometry(10, 10, 1)
        const material = new THREE.MeshMatcapMaterial({ color: 0xffffff, wireframe: false, matcap: matCapTexture })
        geometry.translate(0,5,0);
        const mesh = new THREE.Mesh(geometry, material)
    
        mesh.translateX(i * 11)
        mesh.translateY(j * 11)
        scene.add(mesh)     
        
    }
    
}

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
scene.add(plane)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth, //
    height: window.innerHeight //
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 120
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
// controls.target.y = 2
controls.enableDamping = true

canvas.addEventListener('pointermove', onPointerMove);

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

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);
    raycaster.ray.intersectPlane(plane, planeIntersect);

    for (let index = 0; index < scene.children.length - 1; index++) {
        let element = scene.children[index];
        element.material.color.set(0xffffff);
        element.position.z = 0.0
        element.rotation.x = 0;

        const dist = planeIntersect.distanceTo(element.position) 
        if (dist < 100) {
        
            let d = 1 - THREE.MathUtils.smoothstep(dist, 25, 100);
            element.position.z = 10 * d;
            element.rotation.x = Math.PI * d;
            // element.material.color.set(new THREE.Color(1 - d, 0, d));
        }

    }
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