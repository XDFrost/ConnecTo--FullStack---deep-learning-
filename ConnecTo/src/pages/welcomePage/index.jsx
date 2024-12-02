import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';

const WelcomePage = () => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera( 
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000 
    )

    const renderer = new THREE.WebGLRenderer({      // for rendering
        antialias: true,     // for smooth rendering
    })
    renderer.setPixelRatio( window.devicePixelRatio )       // for detailed rendering
    renderer.setSize( window.innerWidth, window.innerHeight )       // for full screen rendering
    document.body.appendChild( renderer.domElement )
    
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: {
                value: new THREE.TextureLoader().load('/globe.jpeg')
            }
        }
    }))
    // console.log(sphere);
    scene.add(sphere);

    // atmosphere
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    }))
    atmosphere.scale.set(1.2, 1.2, 1.2);
    scene.add(atmosphere);

    const group = new THREE.Group();
    group.add(sphere);
    scene.add(group);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff
    })

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = -Math.random() * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 15

    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
        sphere.rotation.y += 0.002;
        gsap.to(group.rotation, {
            x: -mouse.y * 0.5,
            y: mouse.x * 0.5,
        })
    }

    const mouse = {
        x: undefined,
        y: undefined
    }

    addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / innerHeight) * 2 + 1;
        // console.log(mouse);
    });

    
    
    return (
    <div className='flex'>
        <div>{animate()}</div>
    </div>
  )
}

export default WelcomePage;
