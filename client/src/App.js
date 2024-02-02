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

  return (
    <div className="App">
      <Header
        search={search}
        onSearch={(newSearch) => setNewSearch(newSearch)}
      />
      <AddVideo onAddVideo={handleAddVideo} />
      <VideoCards videos={videos} onRemove={handleRemove} search={search} />
    </div>
  );
}

export default App;
