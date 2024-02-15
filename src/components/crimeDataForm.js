import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";

const CrimeDataForm = ({ state, district, year }) => {
  // const [state, setState] = useState("");
  // const [district, setDistrict] = useState("");
  // const [year, setYear] = useState("");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const getCrimeData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_crime_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state, district, year }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setChartData(data);

        // Render chart using Chart.js
        renderChart(data);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    getCrimeData(); // Call getCrimeData when component mounts or when state/district/year changes

    // Optionally, you can clean up the effect by cancelling any ongoing requests
    return () => {
      // Cleanup logic (e.g., cancel ongoing requests)
    };
  }, [state, district, year]); // Add state, district, and year as dependencies

  //
  const renderChart = (data) => {
    // Get the canvas element
    const crimeChartCanvas = document.getElementById("crimeChart");

    // Check if a chart already exists
    const existingChart = Chart.getChart(crimeChartCanvas);

    // If a chart exists, destroy it
    if (existingChart) {
      existingChart.destroy();
    }

    // Filter out data points you want to exclude (e.g., "state ut", "district", "year")
    const filteredLabels = Object.keys(data[0]).filter(
      (label) =>
        label !== "STATE/UT" && label !== "DISTRICT" && label !== "YEAR"
    );

    // Create a new Chart.js chart
    new Chart(crimeChartCanvas, {
      type: "bar",
      data: {
        labels: filteredLabels,
        datasets: [
          {
            label: "Crime Data",
            data: filteredLabels.map((label) => data[0][label]),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",
              "rgb(255, 159, 64)",
              "rgb(255, 205, 86)",
              "rgb(75, 192, 192)",
              "rgb(54, 162, 235)",
              "rgb(153, 102, 255)",
              "rgb(201, 203, 207)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  return (
    <div>
      <canvas id="crimeChart"></canvas>
    </div>
  );
};

export default CrimeDataForm;
