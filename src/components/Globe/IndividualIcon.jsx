import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// cover-fit the image onto a 2:1 canvas so it isn't stretched — image only
function buildImageCanvas(image) {
  const W = 1024, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const ir = image.width / image.height;
  const br = W / H;
  let sx, sy, sw, sh;
  if (ir > br) { sh = image.height; sw = sh * br; sx = (image.width - sw) / 2; sy = 0; }
  else { sw = image.width; sh = sw / br; sx = 0; sy = (image.height - sh) / 2; }
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, W, H);
  return canvas;
}

const IndividualIcon = ({ resource, position, onHover, onSelect }) => {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const matRef = useRef(null);
  const texRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);

  const interactive = !!resource;

  // your original curve, unchanged
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

  // your original orientation, unchanged
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(new THREE.Vector3(...position).multiplyScalar(2));
    }
  }, [position]);

  // load only the cover image; no resource (filler) or failed load => stay gray
  useEffect(() => {
    if (!resource?.img_url) { setTexture(null); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';        // needs CORS headers from the image host
    img.onload = () => {
      if (cancelled) return;
      const tex = new THREE.CanvasTexture(buildImageCanvas(img));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      texRef.current?.dispose();
      texRef.current = tex;
      setTexture(tex);
    };
    img.onerror = () => { if (!cancelled) setTexture(null); };
    img.src = resource.img_url;
    return () => { cancelled = true; };
  }, [resource]);

  useEffect(() => () => { texRef.current?.dispose(); }, []);
  
  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.map = texture || null;
    m.color.set(texture ? '#ffffff' : '#cbd5e1');
    m.needsUpdate = true;               // <- the line that actually fixes it
  }, [texture]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = hovered ? 1.25 : 1;
    const cur = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(cur + (target - cur) * 0.15);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        geometry={curvedGeometry}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
          onHover?.(resource.title);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!interactive) return;
          setHovered(false);
          onHover?.(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          if (!interactive) return;
          console.log("card clicked")
          e.stopPropagation();
          onSelect?.(resource);
        }}
      >
        <meshBasicMaterial
          map={texture}
          ref={matRef}  
          color={texture ? '#ffffff' : '#cbd5e1'}  // gray until loaded / for fillers
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default IndividualIcon;