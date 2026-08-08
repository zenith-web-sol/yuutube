"use client";

import { useMemo, useRef } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const videoSrc = useMemo(() => {
    if (!video?.filepath) return "";

    const cleanedPath = String(video.filepath).replace(/\\/g, "/");
    const uploadsPath = cleanedPath.includes("/uploads/")
      ? cleanedPath.replace(/^.*\/uploads\//, "uploads/")
      : cleanedPath.replace(/^\/+/, "");
    const normalizedPath = uploadsPath.startsWith("uploads/")
      ? uploadsPath
      : `uploads/${uploadsPath.replace(/^uploads\//, "")}`;

    return `${backendBase}/${normalizedPath.replace(/^\/+/, "")}`;
  }, [backendBase, video?.filepath]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        poster={`/placeholder.svg?height=480&width=854`}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
