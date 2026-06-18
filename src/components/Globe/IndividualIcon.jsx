import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const IndividualIcon = ({ skill, position, onHover }) => {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    const curvedGeometry = useMemo(() => {

        const geo = new THREE.PlaneGeometry(2, 1, 16, 16);
        

        const radius = new THREE.Vector3(...position).length();
        const positions = geo.attributes.position;


        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            

            const phi = x / radius;
            const theta = y / radius;
            

            const newZ = radius * Math.cos(theta) * Math.cos(phi) - radius;
            const newX = radius * Math.cos(theta) * Math.sin(phi);
            const newY = radius * Math.sin(theta);
            
            positions.setXYZ(i, newX, newY, newZ);
        }
        

        geo.computeVertexNormals();
        return geo;
    }, [position]);


    useEffect(() => {
        if (meshRef.current) {

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
                geometry={curvedGeometry} 
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