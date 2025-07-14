import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import PlaylistCalculator from '@/components/PlaylistCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">YT</span>
              </div>
              <span className="font-semibold text-lg gradient-text">Playlist Calculator</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:flex items-center gap-2 glass border-glow"
              >
                <a
                  href="https://developers.google.com/youtube/v3/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  API Docs
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text leading-[1.1] pb-2">
                  YouTube Playlist
                  <br />
                  Length Calculator
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                  Calculate the total watch time of any YouTube playlist with precision.
                  Perfect for planning study sessions or content analysis.
                </p>
              </div>

              {/* Mobile API Link */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="glass border-glow"
                >
                  <a
                    href="https://developers.google.com/youtube/v3/getting-started"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    YouTube API Documentation
                  </a>
                </Button>
              </div>
            </section>

            {/* Calculator Section */}
            <section>
              <PlaylistCalculator />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="glass border-glow"
                >
                  <a
                    href="https://github.com/fighterx11/yt-playlist-calc"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Built with YouTube Data API v3 • Respects YouTube's Terms of Service</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;