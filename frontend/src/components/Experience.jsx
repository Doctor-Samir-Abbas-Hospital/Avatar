import { CameraControls, Environment, Gltf } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import { Leva } from "leva";
import { useRef, useEffect } from "react";
import useCameraStore from "./store/useCameraStore";

export const Experience = () => {
  return (
    <>
      <Leva />
      <Canvas camera={{ position: [-1.2, 0, 0.0001] }}>
        <CameraManager />
        <Environment preset="sunset" />
        <ambientLight intensity={0.8} color="pink" />
        <Avatar position={[3.5, -1.7, -0.5]} scale={1} rotation-y={-1.5} fov={3} />
        <Gltf src="models/classroom_default.glb" position={[0.2, -1.7, -2]} />
      </Canvas>
    </>
  );
};

const CameraManager = () => {
  const controls = useRef();
  const { cameraSettings } = useCameraStore();

  useEffect(() => {
    if (controls.current) {
      // Smoothly transition to new camera settings
      controls.current.setLookAt(
        cameraSettings.position[0],
        cameraSettings.position[1],
        cameraSettings.position[2],
        0,
        0,
        0, // Target look-at position
        true // Enable animation
      );
      controls.current.zoomTo(cameraSettings.zoom, true); // Smooth zoom
    }
  }, [cameraSettings]);

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={8}
      polarRotateSpeed={-0.1}
      azimuthRotateSpeed={0.1}
      mouseButtons={{
        left: 1,
        wheel: 16,
      }}
      touches={{
        one: 32,
        two: 512,
      }}
    />
  );
};