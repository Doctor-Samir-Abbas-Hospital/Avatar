import { useGLTF } from "@react-three/drei"
export const teachers=["Ali","Sarah"]
export const Teacher =({teacher, ...props}) => {
    const {scene}=useGLTF(`/models/Teacher_${teacher}.glb`)
    return (
        <group {...props}>
            <primitive object={scene}/>
        </group>
    )
};
teachers.forEach((teacher)=>{
  useGLTF.preload(`/models/Teacher_${teacher}.glb`)
})