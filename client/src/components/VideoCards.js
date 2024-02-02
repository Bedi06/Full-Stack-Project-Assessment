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

  const apiUrl = process.env.REACT_APP_URL;
  const handleUpVote = () => {
    setUpVoteCount(upVoteCount + 1);
    onUpVote(id);
    console.log("Upvoting video..." + id);

    (async () => {
      try {
        // Make an API request to save the upvote
        const response = await fetch(`${apiUrl}/upvotes/${id}`, {
          method: "POST",
        });

        if (!response.ok) {
          // Handle server-side errors
          throw new Error("Failed to upvote video");
        }
      } catch (error) {
        console.error("Error upvoting video:", error.message);
        // Handle client-side errors (e.g., network issues)
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
            src={`https://www.youtube.com/embed/${url.split("v=")[1]}`}
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
  const [sortedVideos, setSortedVideos] = useState(videos);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";

    const sortedVideos = [...videos]
      .filter((video) =>
        video.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const votesA = (a.upvotes || 0) - (a.downvotes || 0);
        const votesB = (b.upvotes || 0) - (b.downvotes || 0);

        if (newSortOrder === "asc") {
          return votesA - votesB;
        } else {
          return votesB - votesA;
        }
      });

    setSortOrder(newSortOrder);
    setSortedVideos(sortedVideos);
  };

  return (
    <>
      <button onClick={toggleSortOrder} className="btn btn-secondary">
        Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
      </button>
      <div className="video-grid">
        {sortedVideos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            url={video.url}
            upvotes={video.upvotes}
            downvotes={video.downvotes}
            onRemove={() => onRemove(video.id)}
            onUpVote={onUpVote}
            onDownVote={onDownVote}
          />
        ))}
      </div>
    </>
  );
}

export default VideoCards;
