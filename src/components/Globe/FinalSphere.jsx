import Sphere from "./Sphere"
import { React, useRef, useState, useEffect} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import clsx from "clsx";
const FinalSphere = () => {
    const [hovered, setHovered] = useState(null)
  
    return (
      <div className="sphere">
        <Canvas
          camera={{ position: [0, 0, 14], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1} />
          <Sphere onHover={setHovered} />
        </Canvas>
  
        <div className={clsx(`title`, { 'opacity-100': hovered, 'opacity-0': !hovered })}>
          {hovered ?? ''}
        </div>
      </div>
    )
  }

  export default FinalSphere