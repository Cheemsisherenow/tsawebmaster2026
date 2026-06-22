import Sphere from "./Sphere";
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import clsx from "clsx";

const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

const FinalSphere = ({ onSelect }) => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const MIN_MS = 800;
    const start = Date.now();
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(async (data) => {
        const wait = MIN_MS - (Date.now() - start);
        if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        setResources(data);
        setIsLoading(false);
      })
      .catch((err) => { console.error('Failed to fetch resources:', err); setIsLoading(false); });
  }, []);

  return (
    <div className="sphere">
      <Canvas camera={{ position: [0, 0, 14], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1} />
        <Sphere resources={resources} onHover={setHovered} onSelect={onSelect} />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-transparent">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#286A6C]/20 border-t-[#286A6C] animate-spin" />
            <p className="text-[#286A6C] font-semibold tracking-wide">Loading resources…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSphere;