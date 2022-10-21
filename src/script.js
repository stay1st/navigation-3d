import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()
const parameters = {
    materialColor: '#06a2e5'
}
gui
    .addColor(parameters, 'materialColor')
    .onChange(() => 
    {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })


/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture
//const matcapLoader = new THREE.MeshMatcapMaterial()
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/5.jpg')
const matcapTexture = textureLoader.load('materials/golden.png')
gradientTexture.magFilter = THREE.NearestFilter

// Meshes
const material = new THREE.MeshMatcapMaterial()
material.matcap = matcapTexture
const objectsDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
// The canvas should be positioned as such: 
// Y axis: our plot for our 3 geometrical objects/meshes
// X axis: will be used to spread our particles to the width of the client side window
// Z axis: will be used as our depth variable of our particles and Geometrical Meshes
mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 1.75
mesh2.position.x = - 1.75
mesh3.position.x = 1.75

scene.add(mesh1, mesh2, mesh3)
const sectionMeshes = [ mesh1, mesh2, mesh3 ]

/**
 * Particles
 */
const particlesCount = 200
/* 3 because we are solving for 3 cordinates x y and z */
const positions = new Float32Array(particlesCount * 3)
/* initiating a for loop that renders out
200  particles to add to the scene */
for(let i = 0; i < particlesCount; i++)
{
    /* Setting the particle coordinates xyz */
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    /* The position below is to get the particles to 
    render along the entire page's Y axis */
    positions[i * 3 + 1] = objectsDistance * 0.4 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
/* Particle inhertiance of the BufferAttribute constructor method.
the Method parameters take the amount of coorinates to be set along with the position*/
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
/* Generating the particle Mesh Materials */
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.04
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)



/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight()
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
/* Updating sizes upon window resizing with the event listener */
window.addEventListener('resize', () =>
{
    // Update sizes. for mathmatical expressions
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Group. The camera is in a group so that the camera will move upon scroll.
// without this, the camera will stay stagnant
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
// Firstly, the global 'scrollY' must be defined and declared in case
// the page renders and is already scrolling
let scrollY = window.scrollY
let meshSection = 0
// Second, this event listener will catch the event and render out the methods below.
window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    // Creating Mesh Spin. Utilizing the preferred method of
    // utilizing the viewport section heght. With this, we will
    // be able to get a value of 0 to 2. Since there are 3 sections
    const newSection = Math.round(scrollY / sizes.height)
    
    if (newSection != meshSection) {
        meshSection = newSection
/*---------------------------------------------console.log('currentSection:', meshSection);----*/
/* gsap will add to the rotation that is already being rendered to the mesh */
        gsap.to(
            sectionMeshes[meshSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                z: '+=3',
            }
        )
    }
})

/**
 * Cursor
 */
// declaring the cursor object for the 3Dimensional depth effect on the particles
const cursor = {}
cursor.x = 0
cursor.y = 0
// This event listener is to get a value that is the same. Whether it be 
// a user with a higher frequency monitor or higher resolution... WIll be able to have
// the same User Experience regardless of hardware specifications. Explanation of this
// is because of the high unpredicatable values upon mousemove.
window.addEventListener('mousemove', (event) => 
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})


/**
 * Animate
 */
// Initiating the Vector 3 clock to count time for our cameraGroup
// in order to utilize the received time value that will render the same arguments
// upon scroll
const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // Animate Camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
    
    
    //Animate Meshes
    for (const mesh of sectionMeshes)
    {
        /* Here we utilize the time between the current frame 
         and the next frame to add to the x and y coordinates for 
         the mesh to do a full rotation. */
        mesh.rotation.x = elapsedTime * 0.1 
        mesh.rotation.y = elapsedTime * 0.13
    }

    // Render
    renderer.render(scene, camera)

    // Calling tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()