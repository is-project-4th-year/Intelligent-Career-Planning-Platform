import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import "../styles/Auth.css";

const images = [
  "/images/auth-bg1.jpeg",
  "/images/auth-bg2.jpeg",
  "/images/auth-bg3.jpeg",
];

const AuthBackground = () => {
  const [currentImage, setCurrentImage] = useState(0);

  // Function to change image manually
  const changeImage = (index) => {
    setCurrentImage(index);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Swipe handlers (left & right)
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentImage((prev) => (prev + 1) % images.length),
    onSwipedRight: () =>
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length),
  });

  return (
    <div className="auth-left" {...handlers}>
      <div
        className="auth-slide-container"
        style={{ transform: `translateX(-${currentImage * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="auth-slide"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
      </div>

      {/* Overlay Text */}
      <div className="auth-overlay">KenSAP Careers System</div>

      {/* Navigation Dots */}
      <div className="auth-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentImage ? "active" : ""}`}
            onClick={() => changeImage(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default AuthBackground;

