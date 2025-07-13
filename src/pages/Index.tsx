import React from 'react';
import { Youtube, Calculator, Clock, Zap, Sparkles } from 'lucide-react';
import { useGSAPAnimations } from '@/hooks/useGSAPAnimations';
import { useLocomotiveScroll } from '@/hooks/useLocomotiveScroll';
import { ThemeToggle } from '@/components/ThemeToggle';
import PlaylistCalculator from '@/components/PlaylistCalculator';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { containerRef } = useGSAPAnimations();
  const { scrollRef } = useLocomotiveScroll();

  return (
    <div ref={scrollRef} className="overflow-x-hidden">
      <div ref={containerRef} className="min-h-screen bg-gradient-hero">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50" data-gsap="fade-in">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 bg-gradient-glow opacity-30" />
          <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              {/* Hero Image */}
              <div className="flex justify-center mb-8" data-gsap="fade-in">
                <div className="relative animate-float">
                  <img
                    src={heroImage}
                    alt="YouTube Playlist Calculator"
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl glow-primary object-cover"
                    data-gsap="glow"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-primary rounded-full p-2 lg:p-3 animate-glow">
                    <Calculator className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Hero Title */}
              <div data-gsap="fade-in">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 gradient-text leading-tight">
                  YouTube Playlist Duration Calculator
                </h1>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-lg sm:text-xl font-medium text-primary">Playlist Analytics</span>
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>

              {/* Hero Description */}
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed" data-gsap="fade-in">
                Calculate the total watch time of any YouTube playlist with precision and style.
                Perfect for planning study sessions, binge-watching, or content analysis.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
                <div className="flex items-center gap-2 glass px-4 py-3 rounded-full border-glow">
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-primary glow-primary" />
                  <span className="text-sm sm:text-base font-medium">YouTube Data API</span>
                </div>
                <div className="flex items-center gap-2 glass px-4 py-3 rounded-full border-glow">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary glow-primary" />
                  <span className="text-sm sm:text-base font-medium">Multiple Playback Speeds</span>
                </div>
                <div className="flex items-center gap-2 glass px-4 py-3 rounded-full border-glow">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary glow-primary" />
                  <span className="text-sm sm:text-base font-medium">Range Selection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-primary opacity-10 blur-xl animate-float" />
            <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-primary opacity-10 blur-xl" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-gradient-primary opacity-5 blur-lg animate-float" style={{ animationDelay: '4s' }} />
          </div>
        </section>

        {/* Calculator Section */}
        <section className="relative py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-gsap="fade-in">
            <PlaylistCalculator />
          </div>
        </section>

        {/* Footer */}
        <footer className="glass border-t border-glow mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Youtube className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold gradient-text">Playlist Calculator</span>
              </div>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">
                Built with YouTube Data API v3
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground opacity-75">
                This tool respects YouTube's Terms of Service and privacy policies.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;