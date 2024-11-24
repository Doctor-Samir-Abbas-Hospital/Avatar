import React, { useState, useEffect } from "react";
import Loader from "./components/Loader";
import { Experience } from "./components/Experience";
import Chat from "./components/Chat";
import LanguageSelector from "./components/LanguageSelector"; // Import Language Selector
import useLanguageStore from "./components/store/useLanguageStore"; // Import Zustand store
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loaderDuration = 9000; // Increased duration for slower animation

  const { selectedLanguage, setSelectedLanguage } = useLanguageStore(); // Access Zustand store

  useEffect(() => {
    const loadComponents = async () => {
      await new Promise((resolve) => setTimeout(resolve, loaderDuration)); // Simulated delay for model loading
      setIsLoading(false);
      console.log("All components loaded");
    };

    loadComponents();
  }, [loaderDuration]);

  return (
    <>
      {isLoading && <Loader isLoading={isLoading} duration={loaderDuration} />}
      {!isLoading && (
        <div className="App">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
          <Experience />
          <Chat /> {/* ChatInputWidget accesses language from Zustand */}
        </div>
      )}
    </>
  );
}

export default App;

