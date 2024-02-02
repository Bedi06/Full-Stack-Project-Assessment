import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";

function VideoCard({
  id,
  title,
  url,
  upvotes,
  downvotes,
  onRemove,
  onUpVote,
  onDownVote,
}) {
  const [upVoteCount, setUpVoteCount] = useState(upvotes);
  const [downVoteCount, setDownVoteCount] = useState(downvotes);

  const apiUrl = "http://ec2-54-89-4-250.compute-1.amazonaws.com:3000";
  // process.env.REACT_APP_URL;
  const handleUpVote = () => {
    setUpVoteCount(upVoteCount + 1);
    onUpVote(id);
    console.log("Upvoting video..." + id);

    (async () => {
      try {
        const response = await fetch(`${apiUrl}/upvotes/${id}`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to upvote video");
        }
      } catch (error) {
        console.error("Error upvoting video:", error.message);
      }
    })();
  };

  const handleDownVote = () => {
    setDownVoteCount(downVoteCount + 1);
    onDownVote(id);
    console.log("Downvoting video..." + id);

    (async () => {
      try {
        const response = await fetch(`${apiUrl}/downvotes/${id}`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to downvote video");
        }
      } catch (error) {
        console.error("Error downvoting video:", error.message);
        // Handle client-side errors (e.g., network issues)
      }
    })();
  };

  return (
    <div className="video-card">
      <div className="video-content">
        <h3 className="video-title">{title}</h3>
        <div className="video-container">
          <iframe
            src={url && `https://www.youtube.com/embed/${url.split("v=")[1]}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="video-rating">
          <p>Upvotes: {upVoteCount}</p>
          <div className="vote-buttons">
            <button onClick={handleUpVote}>
              <FontAwesomeIcon icon={faThumbsUp} />
            </button>
            <p>Downvotes: {downVoteCount}</p>
            <button onClick={handleDownVote}>
              <FontAwesomeIcon icon={faThumbsDown} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm remove-button"
          onClick={() => onRemove(id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
function VideoCards({ videos, onRemove, search, onUpVote, onDownVote }) {
  const [sortOrder, setSortOrder] = useState("desc");

  const toggleSortOrder = () => {
    const sortedVideos = [...videos]
      .filter((video) =>
        video.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const votesA = (a.upvotes || 0) - (a.downvotes || 0);
        const votesB = (b.upvotes || 0) - (b.downvotes || 0);

        if (sortOrder === "asc") {
          return votesA - votesB; // Ascending order
        } else {
          return votesB - votesA; // Descending order
        }
      });

    console.log("Filtered Videos:", sortedVideos);

    setSortOrder(sortedVideos);
  };

  return (
    <>
      <button onClick={toggleSortOrder} className="btn btn-secondary">
        Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
      </button>
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            url={video.url}
            upvotes={video.upvotes}
            downvotes={video.downvotes}
            id={video.id}
            onRemove={() => onRemove(video.id)}
            onUpVote={() => onUpVote(video.id)}
            onDownVote={() => onDownVote(video.id)}
          />
        ))}
      </div>
    </>
  );
}

export default VideoCards;
