import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import "./Loader.scss";

const eases = {
  power4InOut: [0.77, 0.0, 0.175, 1.0],
};

const CountAnimation = ({ duration }) => {
  const [count, setCount] = useState(0);
  const intervalDuration = 50;

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setCount(Math.round(percentage));

      if (percentage >= 100) {
        clearInterval(interval);
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [duration]);

  return <div className="count loader-type">{count}%</div>;
};

const Loader = ({ isLoading, duration }) => {
  const controlOverlay = useAnimation();

  useEffect(() => {
    if (!isLoading) {
      controlOverlay.start({
        y: "-100vh",
        transition: { duration: 2, ease: eases.power4InOut }, // Slower overlay transition
      });
    }
  }, [isLoading, controlOverlay]);

  if (!isLoading) return null;

  return (
    <motion.div className="loading-wrapper" animate={controlOverlay}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: eases.power4InOut, delay: 0.3 }} // Slower fade-in
        className="loader-container"
      >
        <div className="loader-type">
          Loading..<span className="pulsing">.</span>
        </div>
        <div className="loader-bands">
          <div className="loader-count">
            <CountAnimation duration={duration} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Loader;



