import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddVideo from "./components/AddVideo";
import VideoCards from "./components/VideoCards";

const baseUrl = process.env.REACT_APP_API_URL;

function App() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");

  const handleAddVideo = (newVideo) => {
    fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVideo),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server Response:", data);
        refreshVideoList();
      })
      .catch((error) => console.error("Error adding video:", error));
  };

  const refreshVideoList = () => {
    fetch(`${baseUrl}`)
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error("Error fetching videos:", error));
  };

  const handleVote = async (id, type) => {
    try {
      const response = await fetch(`${baseUrl}/rating${type}/${id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${type} the video.`;

        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage += ` Server Error: ${errorData.message}`;
          }
        } catch (jsonError) {
          console.error("Error parsing JSON error response:", jsonError);
        }

        throw new Error(errorMessage);
      }

      refreshVideoList();
    } catch (error) {
      console.error(`Error ${type} the video:`, error.message);
    }
  };

  useEffect(() => {
    refreshVideoList();
  }, []);

  return (
    <div className="App">
      <Header search={search} onSearch={(newSearch) => setSearch(newSearch)} />
      <AddVideo onAddVideo={handleAddVideo} />
      <VideoCards videos={videos} onVote={handleVote} />
    </div>
  );
}

export default App;
