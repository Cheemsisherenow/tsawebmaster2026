import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import IndividualIcon from './IndividualIcon'

const Sphere = ({ resources = [], onHover, onSelect }) => {
    const groupRef = useRef(null);
    const { gl } = useThree();

    function gridSphere(radius, numRows = 5, cardWidth = 2.0, horizontalGap = 0.1, verticalSqueeze = 0.6, spacingFactor = 1.3) {
        const points = [];
        const rowCounts = [];
        for (let r = 0; r < numRows; r++) {
            const normalizedRow = (r - (numRows - 1) / 2) / ((numRows - 1) / 2 || 1);
            const squeezedRow = normalizedRow * (verticalSqueeze);
            const phi = Math.acos(-squeezedRow);
            const rowRadius = radius * Math.sin(phi);
            const rowCircumference = 2 * Math.PI * rowRadius;
            const spaceNeededPerCard = (cardWidth + horizontalGap) * spacingFactor;
            const maxCardsInRow = Math.floor(rowCircumference / spaceNeededPerCard);
            rowCounts.push({ phi, count: Math.max(1, maxCardsInRow) });
        }
        rowCounts.forEach(({ phi, count }) => {
            for (let i = 0; i < count; i++) {
                const theta = (i / count) * (Math.PI * 2);
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                points.push([x, y, z]);
            }
        });
        return points;
    }

    const SPHERE_RADIUS = 5.5;
    const CARD_WIDTH = 2.0;
    const CARD_GAP = 0.15;
    const NUM_ROWS = 5;
    const VERTICAL_SQUEEZE = 0.65;
    const CARD_SPACING_FACTOR = 1.3;

    // fixed slots — the globe is always full; resources fill them, the rest stay gray
    const positions = useMemo(
        () => gridSphere(SPHERE_RADIUS, NUM_ROWS, CARD_WIDTH, CARD_GAP, VERTICAL_SQUEEZE, CARD_SPACING_FACTOR),
        []
    );

    const dragState = useRef({ dragging: false, lastX: 0, lastY: 0, velX: 0.002, velY: 0.001 });

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
        const onUp = () => { dragState.current.dragging = false; };
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
                    key={i}
                    resource={resources[i]}   // undefined => gray filler
                    position={pos}
                    onHover={onHover}
                    onSelect={onSelect}
                />
            ))}
        </group>
    );
}

export default Sphere;