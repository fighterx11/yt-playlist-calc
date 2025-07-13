import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Youtube, Calculator } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out loading screen
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: onComplete
        });
      }
    });

    // Animate logo
    tl.from(logoRef.current, {
      scale: 0,
      rotation: 180,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    // Animate text
    .from(textRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
    // Animate progress bar
    .from(progressRef.current, {
      scaleX: 0,
      duration: 1.5,
      ease: "power2.out"
    }, "-=0.2")
    // Hold for a moment
    .to({}, { duration: 0.5 });

    // Glow animation for logo
    gsap.to(logoRef.current, {
      filter: "drop-shadow(0 0 30px hsl(217 91% 60% / 0.8))",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

  }, [onComplete]);

  return (
    <div ref={loadingRef} className="loading-screen">
      <div className="text-center">
        <div ref={logoRef} className="mb-8 relative">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-primary">
            <Youtube className="w-8 h-8 text-white absolute" />
            <Calculator className="w-6 h-6 text-white absolute translate-x-3 translate-y-3" />
          </div>
        </div>

        <div ref={textRef} className="mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">
            YouTube Playlist Calculator
          </h1>
          <p className="text-muted-foreground">Loading your modern experience...</p>
        </div>

        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-primary origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;