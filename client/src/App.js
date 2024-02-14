import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddVideo from "./components/AddVideo";
import VideoCards from "./components/VideoCards";

const baseUrl = "http://ec2-54-89-4-250.compute-1.amazonaws.com:3000";

function App() {
  const [videos, setVideos] = useState([]);
  const [search, setNewSearch] = useState("");

  useEffect(() => {
    fetch(`${baseUrl}`)
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddVideo = async (newVideo) => {
    try {
      const response = await fetch(`${baseUrl}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVideo),
      });

      if (!response.ok) {
        throw new Error("Failed to add video");
      }

      const addedVideo = await response.json();

      setVideos((prevVideos) => [...prevVideos, addedVideo]);
    } catch (error) {
      console.error("Error adding video:", error.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error.message);
    }
  };

  const handleUpVote = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/${id}/upvotes`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to upvote video");
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === id ? { ...video, upvotes: video.upvotes + 1 } : video
        )
      );
    } catch (error) {
      console.error("Error upvoting video:", error.message);
    }
  };

  const handleDownVote = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/${id}/downvotes`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to downvote video");
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === id ? { ...video, downvotes: video.downvotes + 1 } : video
        )
      );
    } catch (error) {
      console.error("Error downvoting video:", error.message);
    }
  };

  return (
    <div className="App">
      <Header
        search={search}
        onSearch={(newSearch) => setNewSearch(newSearch)}
      />
      <AddVideo onAddVideo={handleAddVideo} />
      <VideoCards
        videos={filteredVideos}
        onRemove={handleRemove}
        search={search}
        onUpVote={handleUpVote}
        onDownVote={handleDownVote}
        setVideos={setVideos}
      />
    </div>
  );
}

export default App;
