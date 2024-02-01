import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";

function VideoCard({ id, title, url, upvotes, downvotes }) {
  const [votes, setVotes] = useState(calculateVotes(upvotes, downvotes));
  const videoId = url.split("v=")[1];

  // Function to calculate votes
  function calculateVotes(up, down) {
    const upVotes = parseInt(up) || 0;
    const downVotes = parseInt(down) || 0;
    return upVotes - downVotes;
  }

  useEffect(() => {
    // Recalculate votes when ratings change
    setVotes(calculateVotes(upvotes, downvotes));
  }, [upvotes, downvotes]);

  const deleteHandler = async () => {
    try {
      console.log("Deleting video with id:", id);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      console.log(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const voteHandler = async (type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/rating${type}/${id}`,
        { method: "PUT" }
      );
      if (!response.ok) {
        throw new Error(`Failed to ${type} the video`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const voteUpHandler = () => voteHandler("up");
  const voteDownHandler = () => voteHandler("down");

  return (
    <div className="video-card">
      <div className="video-content">
        <h3 className="video-title">{title}</h3>
        <div className="video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="video-rating">
          <p>Rating: {votes}</p>
          <div className="vote-buttons">
            <button onClick={voteUpHandler}>
              <FontAwesomeIcon icon={faThumbsUp} size="1x" />
              <span className="rate">{votes}</span>
            </button>
            <button onClick={voteDownHandler}>
              <FontAwesomeIcon icon={faThumbsDown} />
              <span className="rate">{votes}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm remove-button"
          onClick={() => deleteHandler(id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default VideoCard;
