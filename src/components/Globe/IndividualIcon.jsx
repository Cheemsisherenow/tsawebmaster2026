import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const IndividualIcon = ({ skill, position, onHover }) => {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    // 1. Create a custom curved geometry based on the sphere's radius
    const curvedGeometry = useMemo(() => {
        // args: [width, height, widthSegments, heightSegments]
        // The 16x16 segments give the plane the "joints" it needs to bend smoothly
        const geo = new THREE.PlaneGeometry(2, 1, 16, 16);
        
        // Find the radius by checking how far this card is placed from the origin (0,0,0)
        const radius = new THREE.Vector3(...position).length();
        const positions = geo.attributes.position;

        // Loop through every vertex and wrap it mathematically
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            
            // Map flat coordinates to spherical angles (phi and theta)
            const phi = x / radius;
            const theta = y / radius;
            
            // Calculate new 3D positions to curve the edges backward along the Z axis
            const newZ = radius * Math.cos(theta) * Math.cos(phi) - radius;
            const newX = radius * Math.cos(theta) * Math.sin(phi);
            const newY = radius * Math.sin(theta);
            
            positions.setXYZ(i, newX, newY, newZ);
        }
        
        // Recalculate normals so lighting behaves correctly on the new curve
        geo.computeVertexNormals();
        return geo;
    }, [position]);

    // 2. WRAPPING MATH: Make the card lay flat against the sphere's curve
    useEffect(() => {
        if (meshRef.current) {
            // To ensure the card faces perfectly outward from the center of the sphere,
            // we multiply its position by 2. This gives the mesh a target further out to look at.
            const targetVector = new THREE.Vector3(...position).multiplyScalar(2);
            meshRef.current.lookAt(targetVector);
        }
    }, [position]);

    useFrame(() => {
        if (!groupRef.current) return
        const target = hovered ? 1.25 : 1
        const cur = groupRef.current.scale.x
        const next = cur + (target - cur) * 0.15
        groupRef.current.scale.setScalar(next)
    })
    
    return (
        <group ref={groupRef} position={position}>
            <mesh
                ref={meshRef}
                geometry={curvedGeometry} // Apply the curved geometry here
                onPointerOver={(e) => {
                    e.stopPropagation()
                    setHovered(true)
                    onHover(skill.name)
                    document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                    setHovered(false)
                    onHover(null)
                    document.body.style.cursor = ''
                }}
            >
                {/* Notice: <planeGeometry /> is removed because we use the 'geometry' prop above */}
                <meshBasicMaterial 
                    map={null}  
                    transparent 
                    alphaTest={0.05}
                    color={'#4b5563'} 
                    side={THREE.DoubleSide} 
                />
            </mesh>
        </group>
    )
}

export default IndividualIcon