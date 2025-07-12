const YOUTUBE_API_KEY = ''; // This should be stored securely
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface VideoData {
  id: string;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
  position: number;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  channelTitle: string;
  videoCount: number;
  videos: VideoData[];
}

// Parse ISO 8601 duration format (PT1H2M3S) to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
};

// Extract playlist ID from various YouTube URL formats
export const extractPlaylistId = (url: string): string | null => {
  // Direct playlist ID
  if (/^[A-Za-z0-9_-]{34}$/.test(url)) {
    return url;
  }

  // URL patterns
  const patterns = [
    /[&?]list=([^&]+)/,
    /playlist\?list=([^&]+)/,
    /embed\/videoseries\?list=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// Fetch playlist metadata
const fetchPlaylistInfo = async (playlistId: string) => {
  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch playlist info');
  }

  const data = await response.json();

  if (data.items.length === 0) {
    throw new Error('Playlist not found or is private');
  }

  return data.items[0];
};

// Fetch all video IDs from playlist with pagination
const fetchPlaylistVideos = async (playlistId: string): Promise<string[]> => {
  const videoIds: string[] = [];
  let nextPageToken = '';

  do {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist videos');
    }

    const data = await response.json();

    videoIds.push(...data.items.map((item: any) => item.contentDetails.videoId));
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return videoIds;
};

// Fetch video details in batches
const fetchVideoDetails = async (videoIds: string[]): Promise<VideoData[]> => {
  const videos: VideoData[] = [];
  const batchSize = 50;

  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${batch.join(',')}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();

    const batchVideos = data.items.map((item: any, index: number) => ({
      id: item.id,
      title: item.snippet.title,
      duration: parseDuration(item.contentDetails.duration),
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      position: i + index + 1
    }));

    videos.push(...batchVideos);
  }

  return videos;
};

// Main function to fetch complete playlist data
export const fetchPlaylistData = async (
  playlistUrl: string,
  fromVideo?: number,
  toVideo?: number
): Promise<PlaylistInfo> => {
  const playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    throw new Error('Invalid YouTube playlist URL or ID');
  }

  try {
    // Fetch playlist metadata
    const playlistInfo = await fetchPlaylistInfo(playlistId);

    // Fetch all video IDs
    const videoIds = await fetchPlaylistVideos(playlistId);

    if (videoIds.length === 0) {
      throw new Error('No videos found in playlist');
    }

    // Apply range filter if specified
    let selectedVideoIds = videoIds;
    if (fromVideo !== undefined || toVideo !== undefined) {
      const startIndex = Math.max(0, (fromVideo || 1) - 1);
      const endIndex = Math.min(videoIds.length, toVideo || videoIds.length);

      if (startIndex >= endIndex) {
        throw new Error('Invalid video range');
      }

      selectedVideoIds = videoIds.slice(startIndex, endIndex);
    }

    // Fetch video details
    const videos = await fetchVideoDetails(selectedVideoIds);

    return {
      id: playlistId,
      title: playlistInfo.snippet.title,
      channelTitle: playlistInfo.snippet.channelTitle,
      videoCount: videos.length,
      videos
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch playlist data');
  }
};