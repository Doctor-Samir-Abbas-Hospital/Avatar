
import create from 'zustand'

const useCameraStore = create((set) => ({
  isChatActive: false, // Indicates chat activity
  cameraSettings: {
    position: [-1.2, 0, 0.0001], // Default camera position
    zoom: 1, // Default zoom
  },
  setChatActivity: (isActive) =>
    set((state) => ({
      isChatActive: isActive,
      cameraSettings: isActive
        ? {
            position: [-1.1884501857792147, 0.05921124770613276, 0.15517794323431375],
            zoom: 8,
          }
        : {
            position: [-1.2, 0, 0.0001],
            zoom: 1,
          },
    })),
}));

export default useCameraStore;