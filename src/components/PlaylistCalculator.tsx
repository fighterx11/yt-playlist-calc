import React, { useState } from 'react';
import { Calculator, Clock, Play, Youtube, AlertCircle, CheckCircle, ExternalLink, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchPlaylistData, extractPlaylistId } from '@/services/youtubeApi';

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
      const playlistInfo = await fetchPlaylistData(playlistUrl);

      if (fromVideo || toVideo) {
        const rangeValidation = validateRange(fromVideo, toVideo, playlistInfo.videos.length);
        if (!rangeValidation.valid) {
          setError(rangeValidation.error);
          setLoading(false);
          return;
        }
      }

      const fromNum = fromVideo ? parseInt(fromVideo, 10) : undefined;
      const toNum = toVideo ? parseInt(toVideo, 10) : undefined;

      const filteredPlaylistInfo = await fetchPlaylistData(playlistUrl, fromNum, toNum);
      const totalDuration = filteredPlaylistInfo.videos.reduce((sum, video) => sum + video.duration, 0);

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
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Input Card */}
      <Card className="glass border-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            Playlist Calculator
          </CardTitle>
          <CardDescription>
            Enter a YouTube playlist URL and optional video range to calculate total duration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Playlist URL */}
          <div className="space-y-2">
            <Label htmlFor="playlist-url" className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-primary" />
              YouTube Playlist URL or ID
            </Label>
            <div className="flex gap-3">
              <Input
                id="playlist-url"
                placeholder="https://www.youtube.com/playlist?list=... or PLrAXtmRdnEQy..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="bg-gradient-primary hover:opacity-90"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                <span className="ml-2">Calculate</span>
              </Button>
            </div>
          </div>

          {/* Video Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-video" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
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
              <Label htmlFor="to-video" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
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
            <Button onClick={handleClear} variant="outline" size="sm">
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
        </CardContent>
      </Card>

      {/* Results */}
      {playlistData && (
        <div className="space-y-6">
          {/* Playlist Info */}
          <Card className="glass border-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Playlist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-xl gradient-text">{playlistData.title}</h3>
                <p className="text-muted-foreground">by {playlistData.channel}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Play className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{playlistData.actualVideoCount}</div>
                    <div className="text-sm text-muted-foreground">Videos</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{formatDuration(playlistData.totalDuration)}</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Hash className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {playlistData.range ? `${playlistData.range.from}-${playlistData.range.to}` : 'Full'}
                    </div>
                    <div className="text-sm text-muted-foreground">Range</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration Display */}
          <Card className="glass border-glow bg-gradient-glow">
            <CardContent className="text-center p-8">
              <div className="text-5xl sm:text-6xl font-bold gradient-text mb-2">
                {formatDuration(playlistData.totalDuration)}
              </div>
              <p className="text-muted-foreground text-lg">Total Duration at 1x speed</p>
            </CardContent>
          </Card>

          {/* Playback Speeds */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0.75, 1.25, 1.5, 2].map((speed) => (
              <Card key={speed} className="glass border-glow hover:bg-primary/5 transition-colors">
                <CardContent className="text-center p-4">
                  <div className="text-sm text-muted-foreground mb-1">{speed}x speed</div>
                  <div className="font-bold text-primary">
                    {formatDuration(Math.round(playlistData.totalDuration / speed))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Thumbnails */}
          {playlistData.startVideo && playlistData.endVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Play className="h-5 w-5 text-primary" />
                    Starting Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative group overflow-hidden rounded-lg">
                    <img
                      src={playlistData.thumbnails.start.replace('hqdefault', 'maxresdefault')}
                      alt="Starting video"
                      className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('maxresdefault')) {
                          target.src = playlistData.thumbnails.start;
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {playlistData.startVideo.title}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={playlistData.startVideo.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Ending Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative group overflow-hidden rounded-lg">
                    <img
                      src={playlistData.thumbnails.end.replace('hqdefault', 'maxresdefault')}
                      alt="Ending video"
                      className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('maxresdefault')) {
                          target.src = playlistData.thumbnails.end;
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {playlistData.endVideo.title}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={playlistData.endVideo.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistCalculator;