import React from 'react';
import { Youtube, Calculator, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlaylistCalculator from '@/components/PlaylistCalculator';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-youtube-red-light to-background opacity-50" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="YouTube Playlist Calculator"
                  className="w-32 h-32 rounded-2xl shadow-youtube"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-float">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              YouTube Playlist Duration Calculator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Calculate the total watch time of any YouTube playlist with precision. 
              Perfect for planning study sessions, binge-watching, or content analysis.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
                <Youtube className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">YouTube Data API</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Multiple Playback Speeds</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Range Selection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="container mx-auto px-4 pb-16">
        <PlaylistCalculator />
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Built with YouTube Data API v3</p>
            <p className="text-sm">
              This tool respects YouTube's Terms of Service and privacy policies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
