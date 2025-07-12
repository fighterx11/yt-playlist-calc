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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Calculator Card */}
      <CalculatorCard>
        <CalculatorCardHeader>
          <CalculatorCardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            YouTube Playlist Duration Calculator
          </CalculatorCardTitle>
          <CalculatorCardDescription>
            Calculate the total duration of any YouTube playlist with optional video range selection
          </CalculatorCardDescription>
        </CalculatorCardHeader>

        <CalculatorCardContent>
          {/* Playlist URL Input */}
          <div className="space-y-2">
            <Label htmlFor="playlist-url" className="text-sm font-medium">
              YouTube Playlist URL or ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="playlist-url"
                placeholder="https://www.youtube.com/playlist?list=... or playlist ID"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCalculate}
                disabled={loading}
                variant="youtube"
                className="px-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Youtube className="h-4 w-4" />
                )}
                Calculate
              </Button>
            </div>
          </div>

          {/* Video Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-video" className="text-sm font-medium">
                From Video # (Optional)
              </Label>
              <Input
                id="from-video"
                type="number"
                placeholder="1"
                value={fromVideo}
                onChange={(e) => setFromVideo(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-video" className="text-sm font-medium">
                To Video # (Optional)
              </Label>
              <Input
                id="to-video"
                type="number"
                placeholder="Last video"
                value={toVideo}
                onChange={(e) => setToVideo(e.target.value)}
                min="1"
              />
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CalculatorCardContent>
      </CalculatorCard>

      {/* Results Card */}
      {playlistData && (
        <CalculatorCard>
          <CalculatorCardHeader>
            <CalculatorCardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Playlist Results
            </CalculatorCardTitle>
          </CalculatorCardHeader>

          <CalculatorCardContent>
            {/* Playlist Info */}
            <div className="bg-gradient-hero rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{playlistData.title}</h3>
                <p className="text-muted-foreground">by {playlistData.channel}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  <span>{playlistData.actualVideoCount} videos calculated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{formatDuration(playlistData.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span>
                    {playlistData.range 
                      ? `Videos ${playlistData.range.from}-${playlistData.range.to}` 
                      : 'Full playlist'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Thumbnails */}
            {playlistData.startVideo && playlistData.endVideo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-card border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    Starting Video
                  </h4>
                  <div className="space-y-2">
                    <img 
                      src={playlistData.thumbnails.start} 
                      alt="Starting video thumbnail"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm text-muted-foreground truncate" title={playlistData.startVideo.title}>
                      {playlistData.startVideo.title}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="w-full"
                    >
                      <a href={playlistData.startVideo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Watch on YouTube
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-card border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Ending Video
                  </h4>
                  <div className="space-y-2">
                    <img 
                      src={playlistData.thumbnails.end} 
                      alt="Ending video thumbnail"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm text-muted-foreground truncate" title={playlistData.endVideo.title}>
                      {playlistData.endVideo.title}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="w-full"
                    >
                      <a href={playlistData.endVideo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Watch on YouTube
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Display */}
            <div className="bg-primary-muted rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatDuration(playlistData.totalDuration)}
              </div>
              <p className="text-muted-foreground">Total Duration at 1x speed</p>
            </div>

            {/* Playback Speeds */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0.75, 1.25, 1.5, 2].map((speed) => (
                <div key={speed} className="bg-gradient-card border rounded-lg p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-1">{speed}x speed</div>
                  <div className="font-semibold">
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