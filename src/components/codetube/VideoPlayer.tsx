
'use client';

import YouTube from 'react-youtube';
import { useCreatorStudio } from '@/hooks/use-creator-studio';

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const { setPlayer } = useCreatorStudio();
  
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_params
      autoplay: 0,
      rel: 0, // Do not show related videos when playback ends
    },
  };

  const onReady = (event: any) => {
    setPlayer(event.target);
  };

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <YouTube videoId={videoId} opts={opts} onReady={onReady} className="w-full h-full" />
    </div>
  );
}
