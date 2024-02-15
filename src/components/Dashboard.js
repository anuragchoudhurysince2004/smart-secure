import React, { useState, useEffect } from "react";
import IndiaMap from "./IndiaMap"; // Assuming you have a separate IndiaMap component
// import mockData from "./mockData"; // Assuming you have a separate mockData file
import CrimeDataForm from "./crimeDataForm";
import CrimeData from "./CrimeData";

const Dashboard = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [prediction, setPrediction] = useState(0);
  // Mock data based on selected state and district
  // const crimeData = mockData[selectedState]?.[selectedDistrict] || {};

  useEffect(() => {
    const getPrediction = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            state: selectedState,
            district: selectedDistrict,
            year: selectedYear,
          }),
        });
        if (!response.ok) {
          throw new Error("HTTP error ! status: ", response.status);
        }
        let data = await response.json();
        setPrediction(data.predictions);
      } catch (error) {}
    };
    getPrediction();
  }, [selectedYear, selectedDistrict, selectedState]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = () => {
    // Add any form submission logic here
    setFormSubmitted(true);
    return;
  };

  return (
    <div className={`bg-gray-900 text-white ${darkMode ? "dark" : ""}`}>
      <div className="container mx-auto flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-semibold">Crime Dashboard</h1>
          <p className="mb-2">Select your State and District:</p>
          {/* Add your state and district selection logic here */}
          {/* For simplicity, using a simple text input for now */}
          <form>
            <input
              type="text"
              placeholder="Enter State"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-2 mb-2 bg-gray-800 rounded"
            />
            <input
              type="text"
              placeholder="Enter District"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-2 mb-2 bg-gray-800 rounded"
            />
            <input
              type="text"
              placeholder="Enter Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 mb-2 bg-gray-800 rounded"
            />
            <button type="button" onClick={handleSubmit}>
              button
            </button>
          </form>
        </div>
        <div className="flex items-center">
          <label className="switch mr-2">
            <input type="checkbox" onChange={toggleDarkMode} />
            <span className="slider"></span>
          </label>
          <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>
      </div>
      {/* Display crime statistics based on the selected state and district */}
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Crime Statistics</h2>
        {/* Display your crime statistics here based on crimeData */}
        <p>Predicted Total IPC Crimes: {prediction || 0}</p>
        {/* <p>Violent Crimes: {crimeData.violentCrimes || 0}</p> */}
        {/* Add more crime statistics based on your data */}
      </div>

      {/* Render CrimeDataForm or CrimeData based on form submission */}
      {formSubmitted &&
        (selectedYear ? (
          <CrimeDataForm
            state={selectedState}
            district={selectedDistrict}
            year={selectedYear}
          />
        ) : (
          <CrimeData state={selectedState} district={selectedDistrict} />
        ))}
      {/* Display the interactive map of India */}
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
        <IndiaMap />
      </div>
    </div>
  );
};

export default Dashboard;
