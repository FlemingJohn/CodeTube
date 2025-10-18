'use client';

import YouTube from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  onReady: (event: any) => void;
}

export default function VideoPlayer({ videoId, onReady }: VideoPlayerProps) {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_params
      autoplay: 0,
    },
  };

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <YouTube videoId={videoId} opts={opts} onReady={onReady} className="w-full h-full" />
    </div>
  );
}
