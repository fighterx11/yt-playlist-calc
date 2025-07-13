import React, { useEffect, useState } from 'react';
import { Youtube } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 500; // 0.5 seconds
    const frames = 30; // 30 frames for smooth animation
    const increment = 100 / frames;
    const frameTime = duration / frames;

    let currentFrame = 0;

    const animationFrame = () => {
      currentFrame++;
      const newProgress = Math.min(currentFrame * increment, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        setTimeout(animationFrame, frameTime);
      } else {
        // Fade out and complete
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 150);
        }, 100);
      }
    };

    // Start animation after a brief delay
    setTimeout(animationFrame, 50);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm mx-auto px-6">
        {/* Logo with glow effect */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-30 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-primary glow-primary">
            <Youtube className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold gradient-text">
            YouTube Playlist Calculator
          </h1>
          <p className="text-muted-foreground text-sm">
            Initializing...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-75 ease-out transform origin-left"
              style={{
                width: `${progress}%`,
                transform: `scaleX(${progress / 100})`
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center font-medium">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;