import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddVideo from "./components/AddVideo";
import VideoCards from "./components/VideoCards";

const baseUrl = "http://ec2-34-226-208-118.compute-1.amazonaws.com:3000";

function App() {
  const [videos, setVideos] = useState([]);
  const [search, setNewSearch] = useState("");

  useEffect(() => {
    fetch(`${baseUrl}`)
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

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
        console.log("Video added successfully with ID:", data.id);
        console.log("Server Response:", data);
      })
      .catch((error) => console.error("Error adding video:", error));
  };

  const handleRemove = async (id) => {
    const updatedVideos = videos.filter((video) => video.id !== id);
    setVideos(updatedVideos);

    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete video.";

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

      const successData = await response.json(); // Parse success response if available
      console.log(
        `Video deleted successfully with ID: ${id}. Server Response:`,
        successData
      );
    } catch (error) {
      console.error("Error deleting video:", error.message);
    }
  };

  const handleSearch = (event) => {
    const newSearch = event.target.value;
    setNewSearch(newSearch);
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
