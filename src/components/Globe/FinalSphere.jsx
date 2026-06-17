import Sphere from "./Sphere"
import { React, useRef, useState, useEffect} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
const FinalSphere = () => {
    const [hovered, setHovered] = useState(null)
  
    return (
      <div className="relative w-full h-[400px] sm:h-[460px]">
        <Canvas
          camera={{ position: [0, 0, 14], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1} />
          <Sphere onHover={setHovered} />
        </Canvas>
  
        <div
          className={`absolute left-1/2 bottom-4 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 bg-black/40 dark:bg-white/5 backdrop-blur text-white pointer-events-none transition-opacity duration-200 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {hovered ?? ''}
        </div>
      </div>
    )
  }

  export default FinalSphere