// WatchYouTube.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { API } from "../constants";

export default function WatchYouTube() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    api.get(API.VIDEO_DETAIL(id)).then(res => setVideo(res.data.data));
  }, [id]);

  if (!video) return null;

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
        title={video.title}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />
    </div>
  );
}