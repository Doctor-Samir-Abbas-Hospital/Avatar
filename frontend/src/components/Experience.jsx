import { CameraControls, Environment, Gltf, useGLTF } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Avatar } from "./Avatar_Ali"

export const Experience =()=>{
    return (
        <>
        <Canvas camera={{position:[-1.2,0,0.0001],}}>
            <CameraManager/>
            <Environment preset="sunset"/>
            <ambientLight intensity={0.8} color="pink"/>
            <Avatar position={[3.5,-1.7,-0.5]} scale={1} rotation-y={-1.5}/>   
            <Gltf  src="models/classroom_default.glb" position={[0.2,-1.7,-2]}/>
        </Canvas>
        </>
    )
}
const CameraManager =()=>{
    return <CameraControls
       minZoom={1}
       maxZoom={5}
       polarRotateSpeed={-0.1}
       azimuthRotateSpeed={0.1}
       mouseButtons={{
        left:1, 
        wheel:16,
       }}
       touches={{
        one:32,
        two:512,
       }}
    />
}
useGLTF.preload('models/classroom_default.glb')