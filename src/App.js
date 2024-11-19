import React, { useState, useEffect } from "react";
import Loader from "./components/Loader";
import { Experience } from "./components/Experience";
import Chat from "./components/Chat";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loaderDuration = 9000; // Increased duration for slower animation

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
          <Experience />
          <Chat />
        </div>
      )}
    </>
  );
}

export default App;
