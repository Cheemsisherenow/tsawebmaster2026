import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import IndividualIcon from './IndividualIcon'
import * as THREE from 'three'

const Sphere = ({ onHover }) => {
    const groupRef = useRef(null);
    const { gl } = useThree();
    
    function gridSphere(radius, numRows = 5, cardWidth = 2.0, horizontalGap = 0.1, verticalSqueeze = 0.6, spacingFactor = 1.3) {
        const points = [];
        const rowCounts = [];
        
        // Step 1: Calculate the radius and circumference of each horizontal row
        for (let r = 0; r < numRows; r++) {
            // Normalized row position between -1 (top row) and 1 (bottom row)
            const normalizedRow = (r - (numRows - 1) / 2) / ((numRows - 1) / 2 || 1);
            
            // Apply the vertical squeeze factor. Lower values squeeze rows tightly around the equator.
            const squeezedRow = normalizedRow * (verticalSqueeze);
            
            // Map the squeezed layout safely into the sphere's vertical arc (phi)
            // This centers your 5 rows around the equator (Math.PI / 2)
            const phi = Math.acos(-squeezedRow);
            
            // The actual radius of this specific horizontal slice of the sphere
            const rowRadius = radius * Math.sin(phi);
            const rowCircumference = 2 * Math.PI * rowRadius;
            
            // Trick the math into allocating more space per card, resulting in fewer cards fitting per row
            const spaceNeededPerCard = (cardWidth + horizontalGap) * spacingFactor;
            const maxCardsInRow = Math.floor(rowCircumference / spaceNeededPerCard);
            
            rowCounts.push({
                phi,
                count: Math.max(1, maxCardsInRow)
            });
        }
    
        // Step 2: Generate the exact 3D points based on the row-by-row capacities
        rowCounts.forEach(({ phi, count }) => {
            for (let i = 0; i < count; i++) {
                // Because we divide the full 360 degrees (Math.PI * 2) by the exact card count,
                // the gaps will automatically remain perfectly equal, just wider.
                const theta = (i / count) * (Math.PI * 2);
                
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi); // Squeezing phi scales down this Y component!
                const z = radius * Math.sin(phi) * Math.sin(theta);
                
                points.push([x, y, z]);
            }
        });
    
        return points;
    }
  
    // --- Layout Constants ---
    const SPHERE_RADIUS = 5.5; 
    const CARD_WIDTH = 2.0;    
    const CARD_GAP = 0.15;     
    const NUM_ROWS = 5;
    const VERTICAL_SQUEEZE = 0.65; 

    // CARD DENSITY CONTROL
    // 1.0 = Packed tight (your original layout)
    // 1.3 = Spaces them out, dropping a few cards per row and making the gaps larger but equal
    // Increase this further to take even more cards out
    const CARD_SPACING_FACTOR = 1.3; 
  
    const positions = useMemo(() => {
        return gridSphere(SPHERE_RADIUS, NUM_ROWS, CARD_WIDTH, CARD_GAP, VERTICAL_SQUEEZE, CARD_SPACING_FACTOR);
    }, [SPHERE_RADIUS, NUM_ROWS, CARD_WIDTH, CARD_GAP, VERTICAL_SQUEEZE, CARD_SPACING_FACTOR]);
  
    const dragState = useRef({
        dragging: false,
        lastX: 0,
        lastY: 0,
        velX: 0.002, 
        velY: 0.001,
    });
  
    useEffect(() => {
        const el = gl.domElement;
        
        const onDown = (e) => {
            dragState.current.dragging = true;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;
        };
        
        const onMove = (e) => {
            if (!dragState.current.dragging) return;
            const dx = e.clientX - dragState.current.lastX;
            const dy = e.clientY - dragState.current.lastY;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;
            dragState.current.velX = dx * 0.005;
            dragState.current.velY = dy * 0.005;
        };
        
        const onUp = () => {
            dragState.current.dragging = false;
        };

        el.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        
        return () => {
            el.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [gl]);

    useFrame(() => {
        if (!groupRef.current) return;
        
        groupRef.current.rotation.y += dragState.current.velX;
        
        if (!dragState.current.dragging) {
            dragState.current.velX += (0.002 - dragState.current.velX) * 0.04;
            dragState.current.velY += (0.001 - dragState.current.velY) * 0.04;
        }
    });
  
    return (
      <group ref={groupRef}>
        {positions.map((pos, i) => (
          <IndividualIcon 
            key={`blank-icon-${i}`} 
            skill={{ name: `Box ${i + 1}` }} 
            position={pos} 
            onHover={onHover} 
          />
        ))}
      </group>
    );
}

export default Sphere;