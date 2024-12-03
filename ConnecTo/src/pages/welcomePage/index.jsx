import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import "@fontsource/exo-2"; // Defaults to weight 400
import "@fontsource/exo-2/400.css"; // Specify weight
import "@fontsource/exo-2/400-italic.css"; // Specify weight and style
import "./index.css"

const WelcomePage = () => {
    const containerRef = useRef(null); // Ref for the container
    // const leftContainerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
    
        // Set up scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
    
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(5, 50, 50),
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    globeTexture: {
                        value: new THREE.TextureLoader().load('/globe.jpeg'),
                    },
                },
            })
        );
        scene.add(sphere);
    
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(5, 50, 50),
            new THREE.ShaderMaterial({
                vertexShader: atmosphereVertexShader,
                fragmentShader: atmosphereFragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
            })
        );
        atmosphere.scale.set(1.2, 1.2, 1.2);
        scene.add(atmosphere);
    
        const group = new THREE.Group();
        group.add(sphere);
        scene.add(group);
    
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
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
    
        camera.position.z = 15;
    
        const mouse = { x: undefined, y: undefined };
    
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    
        // Animate function
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            sphere.rotation.y += 0.002;
            gsap.to(group.rotation, {
                x: -mouse.y * 0.5,
                y: mouse.x * 0.5,
            });
        }
        animate();
    
        // Handle window resize
        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);
    
        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);
    

    return (
        <div className="flex fonts">
            <div className='w-1/2 bg-black flex flex-col justify-center px-8'>
                <img src='/ConnecTo.svg' height={70} width={70} className='absolute top-10 left-10'/>
                
                <h1 className="text-4xl font-bold text-white">
                    ConnecTo: Your own Social Media NFT Marketplace
                </h1>
                <br/>
                <p className='text-white'>
                Welcome to ConnecTo, where social networking meets the world of NFTs! Create, connect, and trade digital assets while enjoying the features of a modern social media platform. Each account comes with a unique, AI-generated NFT, making your journey truly one of a kind. Explore, share, and be part of the next big innovation in social networking!
                </p>
                <br/>
                
                <div>
                    <Link to = "/auth">
                        <Button
                        className="mr-6 px-9 py-6 text-lg hover:bg-blue-500 transition-colors duration-300">
                            Login
                        </Button>
                    </Link>
                    <Link to = "/auth">
                        <Button className="px-9 py-6 text-lg hover:bg-blue-500 transition-colors duration-300">
                            Signup
                        </Button>
                    </Link>
                </div>
            </div>

            
            <div className="w-1/2">
                <div ref={containerRef} style={{ width: '100%', height: '100vh' }}></div>
            </div>
        </div>
    );
};

export default WelcomePage;
