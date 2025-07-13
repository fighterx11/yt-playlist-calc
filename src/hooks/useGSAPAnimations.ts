import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fade in animations for sections
    const sections = container.querySelectorAll('[data-gsap="fade-in"]');

    sections.forEach((section, index) => {
      gsap.fromTo(section,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
          delay: index * 0.1
        }
      );
    });

    // Parallax effects for cards
    const cards = container.querySelectorAll('[data-gsap="parallax"]');

    cards.forEach((card) => {
      gsap.fromTo(card,
        {
          y: 100
        },
        {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });

    // Stagger animations for grid items
    const gridItems = container.querySelectorAll('[data-gsap="stagger"]');

    if (gridItems.length > 0) {
      gsap.fromTo(gridItems,
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: gridItems[0],
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Glow animations for interactive elements
    const glowElements = container.querySelectorAll('[data-gsap="glow"]');

    glowElements.forEach((element) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(element, {
        filter: "drop-shadow(0 0 30px hsl(217 91% 60% / 0.6))",
        duration: 2,
        ease: "power2.inOut"
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return { containerRef };
};