import React, { useEffect,  useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import useAvatarStore from "./store/useAvatarStore";



// Map viseme IDs to their corresponding blend shapes
const visemeToBlendShape = {
  0: "viseme_sil",
  1: "viseme_PP",
  2: "viseme_FF",
  3: "viseme_TH",
  4: "viseme_DD",
  5: "viseme_kk",
  6: "viseme_CH",
  7: "viseme_SS",
  8: "viseme_nn",
  9: "viseme_RR",
  10: "viseme_aa",
  11: "viseme_E",
  12: "viseme_I",
  13: "viseme_O",
  14: "viseme_U",
};

export function Avatar(props) {
  const { nodes, materials, scene } = useGLTF("models/6736f0df26de9597a16bb237.glb");
  const { animations } = useGLTF("models/animations2.glb");
  const { ref, actions, names } = useAnimations(animations);
  const { audio, visemes } = useAvatarStore(); // Access Zustand state
  const [blink, setBlink] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    if (actions && names.includes("idleStanding")) {
      actions["idleStanding"].play();
    }
  }, [actions, names]);

  // Handle blinking
  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200); // Blink duration
      }, MathUtils.randInt(1000, 5000)); // Random interval between blinks
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Handle audio playback and viseme sync
  useEffect(() => {
    if (audio) {
      const audioInstance = new Audio(`data:audio/mpeg;base64,${audio}`);
      setAudioElement(audioInstance);
      setIsTalking(true);

      audioInstance.play();
      audioInstance.onended = () => setIsTalking(false);
    }
  }, [audio]);

  useFrame(() => {
    // Continuous blinking logic
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    if (!isTalking || !audioElement || visemes.length === 0) {
      return;
    }

    const currentAudioTime = audioElement.currentTime * 1000; // Convert to milliseconds

    // Reset all morph targets
    resetAllMorphTargets();

    // Apply viseme influences based on timestamps
    const activeBlendShapes = new Set();
    for (let i = visemes.length - 1; i >= 0; i--) {
      const [timestamp, visemeId] = visemes[i];
      if (currentAudioTime >= timestamp) {
        const blendShape = visemeToBlendShape[visemeId];
        if (blendShape) {
          activeBlendShapes.add(blendShape);
          lerpMorphTarget(blendShape, 1, 0.2); // Apply the corresponding morph target
        }
        break;
      }
    }

    // Reset unused blend shapes
    Object.keys(visemeToBlendShape).forEach((key) => {
      if (!activeBlendShapes.has(visemeToBlendShape[key])) {
        lerpMorphTarget(visemeToBlendShape[key], 0, 0.1);
      }
    });
  });

  const resetAllMorphTargets = () => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        Object.keys(child.morphTargetDictionary).forEach((key) => {
          lerpMorphTarget(key, 0, 0.1); // Reset morph target influences smoothly
        });
      }
    });
  };

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index !== undefined &&
          child.morphTargetInfluences[index] !== undefined
        ) {
          child.morphTargetInfluences[index] = MathUtils.lerp(
            child.morphTargetInfluences[index],
            value,
            speed
          );
        }
      }
    });
  };

  return (
    <group ref={ref} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload("models/6736f0df26de9597a16bb237.glb");
useGLTF.preload("models/animations2.glb")
