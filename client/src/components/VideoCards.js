import React, { useState, useMemo } from "react";
import VideoCard from "./VideoCard";

function VideoCards({ videos, deleteHandler }) {
  const [sortOrder, setSortOrder] = useState("desc");

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedVideos = useMemo(() => {
    return videos.slice().sort((a, b) => {
      const votesA = a.upvotes - a.downvotes;
      const votesB = b.upvotes - b.downvotes;
      return sortOrder === "asc" ? votesA - votesB : votesB - votesA;
    });
  }, [videos, sortOrder]);

  return (
    <>
      <button onClick={toggleSortOrder} className="btn btn-secondary">
        Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
      </button>
      <div className="video-grid">
        {sortedVideos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            url={video.url}
            upvotes={video.upvotes}
            downvotes={video.downvotes}
            deleteHandler={() => deleteHandler(video.id)}
          />
        ))}
      </div>
    </>
  );
}

export default VideoCards;
