import React, { useState } from 'react';
import { Calculator, Clock, Play, Youtube, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  CalculatorCard,
  CalculatorCardHeader,
  CalculatorCardTitle,
  CalculatorCardDescription,
  CalculatorCardContent,
} from '@/components/ui/calculator-card';
import { fetchPlaylistData, extractPlaylistId, type PlaylistInfo } from '@/services/youtubeApi';

interface PlaylistData {
  title: string;
  channel: string;
  videoCount: number;
  totalDuration: number;
  actualVideoCount: number;
  thumbnails: {
    start: string;
    end: string;
  };
  startVideo?: {
    title: string;
    url: string;
  };
  endVideo?: {
    title: string;
    url: string;
  };
  range?: {
    from: number;
    to: number;
  };
}

const PlaylistCalculator = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [fromVideo, setFromVideo] = useState('');
  const [toVideo, setToVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const { toast } = useToast();

  const validatePlaylistUrl = (url: string) => {
    return extractPlaylistId(url) !== null;
  };

  const validateRange = (from: string, to: string, maxVideos: number) => {
    const fromNum = from ? parseInt(from, 10) : 1;
    const toNum = to ? parseInt(to, 10) : maxVideos;

    if (isNaN(fromNum) || isNaN(toNum)) {
      return { valid: false, error: 'Please enter valid numbers for video range' };
    }

    if (fromNum < 1 || toNum < 1) {
      return { valid: false, error: 'Video numbers must be greater than 0' };
    }

    if (fromNum > maxVideos || toNum > maxVideos) {
      return { valid: false, error: `Video numbers cannot exceed ${maxVideos}` };
    }

    if (fromNum > toNum) {
      return { valid: false, error: 'From video number must be less than or equal to To video number' };
    }

    return { valid: true, from: fromNum, to: toNum };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleCalculate = async () => {
    if (!playlistUrl.trim()) {
      setError('Please enter a YouTube playlist URL or ID');
      return;
    }

    if (!validatePlaylistUrl(playlistUrl)) {
      setError('Please enter a valid YouTube playlist URL or ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, fetch basic playlist info to get total video count
      const playlistInfo = await fetchPlaylistData(playlistUrl);

      // Validate range if provided
      if (fromVideo || toVideo) {
        const rangeValidation = validateRange(fromVideo, toVideo, playlistInfo.videos.length);
        if (!rangeValidation.valid) {
          setError(rangeValidation.error);
          setLoading(false);
          return;
        }
      }

      // Fetch playlist data with range
      const fromNum = fromVideo ? parseInt(fromVideo, 10) : undefined;
      const toNum = toVideo ? parseInt(toVideo, 10) : undefined;

      const filteredPlaylistInfo = await fetchPlaylistData(playlistUrl, fromNum, toNum);

      // Calculate total duration
      const totalDuration = filteredPlaylistInfo.videos.reduce((sum, video) => sum + video.duration, 0);

      // Get start and end videos
      const startVideo = filteredPlaylistInfo.videos[0];
      const endVideo = filteredPlaylistInfo.videos[filteredPlaylistInfo.videos.length - 1];

      const processedData: PlaylistData = {
        title: filteredPlaylistInfo.title,
        channel: filteredPlaylistInfo.channelTitle,
        videoCount: filteredPlaylistInfo.videoCount,
        actualVideoCount: filteredPlaylistInfo.videos.length,
        totalDuration,
        thumbnails: {
          start: startVideo?.thumbnail || '/placeholder.svg',
          end: endVideo?.thumbnail || '/placeholder.svg'
        },
        startVideo: startVideo ? {
          title: startVideo.title,
          url: `https://www.youtube.com/watch?v=${startVideo.id}`
        } : undefined,
        endVideo: endVideo ? {
          title: endVideo.title,
          url: `https://www.youtube.com/watch?v=${endVideo.id}`
        } : undefined,
        range: (fromNum || toNum) ? {
          from: fromNum || 1,
          to: toNum || filteredPlaylistInfo.videos.length
        } : undefined
      };

      setPlaylistData(processedData);

      toast({
        title: "Success!",
        description: `Calculated duration for ${processedData.actualVideoCount} videos`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch playlist data. Please check your URL and try again.';
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPlaylistUrl('');
    setFromVideo('');
    setToVideo('');
    setPlaylistData(null);
    setError('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" data-gsap="fade-in">
      {/* Main Calculator Card */}
      <CalculatorCard className="glass border-glow">
        <CalculatorCardHeader>
          <CalculatorCardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary glow-primary" />
            YouTube Playlist Calculator
          </CalculatorCardTitle>
          <CalculatorCardDescription className="text-base sm:text-lg">
            Calculate the total duration of any YouTube playlist with optional video range selection
          </CalculatorCardDescription>
        </CalculatorCardHeader>

        <CalculatorCardContent className="space-y-6">
          {/* Playlist URL Input */}
          <div className="space-y-3">
            <Label htmlFor="playlist-url" className="text-sm sm:text-base font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4 text-primary" />
              YouTube Playlist URL or ID
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="playlist-url"
                placeholder="https://www.youtube.com/playlist?list=... or playlist ID"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="flex-1 glass border-glow text-sm sm:text-base"
              />
              <Button
                onClick={handleCalculate}
                disabled={loading}
                variant="youtube"
                className="px-6 py-2 sm:py-3 bg-gradient-primary hover:opacity-90 transition-all duration-300 glow-primary"
                size="lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="hidden sm:inline ml-2">Calculate</span>
                <span className="sm:hidden">Calculate</span>
              </Button>
            </div>
          </div>

          {/* Video Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label htmlFor="from-video" className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                From Video # (Optional)
              </Label>
              <Input
                id="from-video"
                type="number"
                placeholder="1"
                value={fromVideo}
                onChange={(e) => setFromVideo(e.target.value)}
                min="1"
                className="glass border-glow"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="to-video" className="text-sm sm:text-base font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                To Video # (Optional)
              </Label>
              <Input
                id="to-video"
                type="number"
                placeholder="Last video"
                value={toVideo}
                onChange={(e) => setToVideo(e.target.value)}
                min="1"
                className="glass border-glow"
              />
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="glass border-glow hover:bg-muted/20"
            >
              Clear All
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
            </Alert>
          )}
        </CalculatorCardContent>
      </CalculatorCard>

      {/* Results Card */}
      {playlistData && (
        <CalculatorCard className="glass border-glow" data-gsap="fade-in">
          <CalculatorCardHeader>
            <CalculatorCardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 glow-primary" />
              Playlist Results
            </CalculatorCardTitle>
          </CalculatorCardHeader>

          <CalculatorCardContent className="space-y-8">
            {/* Playlist Info */}
            <div className="glass border-glow rounded-xl p-4 sm:p-6 space-y-4">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg sm:text-xl lg:text-2xl gradient-text mb-2">{playlistData.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">by {playlistData.channel}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm sm:text-base">
                <div className="flex items-center justify-center sm:justify-start gap-3 glass border-glow rounded-lg p-3">
                  <Play className="h-5 w-5 text-primary glow-primary" />
                  <span className="font-medium">{playlistData.actualVideoCount} videos calculated</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 glass border-glow rounded-lg p-3">
                  <Clock className="h-5 w-5 text-primary glow-primary" />
                  <span className="font-medium">{formatDuration(playlistData.totalDuration)}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 glass border-glow rounded-lg p-3 sm:col-span-2 lg:col-span-1">
                  <Calculator className="h-5 w-5 text-primary glow-primary" />
                  <span className="font-medium">
                    {playlistData.range
                      ? `Videos ${playlistData.range.from}-${playlistData.range.to}`
                      : 'Full playlist'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Thumbnails */}
            {playlistData.startVideo && playlistData.endVideo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-gsap="stagger">
                <div className="glass border-glow rounded-xl p-4 sm:p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-3 text-base sm:text-lg">
                    <Play className="h-5 w-5 text-primary glow-primary" />
                    Starting Video
                  </h4>
                  <div className="space-y-4">
                    <div className="relative group overflow-hidden rounded-lg">
                      <img
                        src={playlistData.thumbnails.start.replace('hqdefault', 'maxresdefault')}
                        alt="Starting video thumbnail"
                        className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to hq if maxres fails
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('maxresdefault')) {
                            target.src = playlistData.thumbnails.start;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2" title={playlistData.startVideo.title}>
                      {playlistData.startVideo.title}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full glass border-glow hover:bg-primary/10 transition-all duration-300"
                    >
                      <a href={playlistData.startVideo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Watch on YouTube
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="glass border-glow rounded-xl p-4 sm:p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-3 text-base sm:text-lg">
                    <CheckCircle className="h-5 w-5 text-primary glow-primary" />
                    Ending Video
                  </h4>
                  <div className="space-y-4">
                    <div className="relative group overflow-hidden rounded-lg">
                      <img
                        src={playlistData.thumbnails.end.replace('hqdefault', 'maxresdefault')}
                        alt="Ending video thumbnail"
                        className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to hq if maxres fails
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('maxresdefault')) {
                            target.src = playlistData.thumbnails.end;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2" title={playlistData.endVideo.title}>
                      {playlistData.endVideo.title}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full glass border-glow hover:bg-primary/10 transition-all duration-300"
                    >
                      <a href={playlistData.endVideo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Watch on YouTube
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Display */}
            <div className="glass border-glow rounded-xl p-6 sm:p-8 text-center bg-gradient-glow">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-3 animate-glow">
                {formatDuration(playlistData.totalDuration)}
              </div>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Total Duration at 1x speed</p>
            </div>

            {/* Playback Speeds */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" data-gsap="stagger">
              {[0.75, 1.25, 1.5, 2].map((speed) => (
                <div key={speed} className="glass border-glow rounded-lg p-3 sm:p-4 text-center hover:bg-primary/5 transition-all duration-300">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">{speed}x speed</div>
                  <div className="font-bold text-sm sm:text-base text-primary">
                    {formatDuration(Math.round(playlistData.totalDuration / speed))}
                  </div>
                </div>
              ))}
            </div>
          </CalculatorCardContent>
        </CalculatorCard>
      )}
    </div>
  );
};

export default PlaylistCalculator;