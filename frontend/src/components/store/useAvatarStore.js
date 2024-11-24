import create from "zustand";

const useAvatarStore = create((set) => ({
  audio: null,
  visemes: [],
  setAudioVisemes: (audio, visemes) => set({ audio, visemes }),
}));

export default useAvatarStore;
