import { React, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";

const CrimeData = ({ district, state }) => {
  // const [district, setDistrict] = useState("");
  // const [state, setState] = useState("");
  const [crimeData, setCrimeData] = useState(null);
  // let crimeData = null;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/crime_data/${state}/${district}`
        );
        let data = await response.json();
        data = JSON.parse(data);
        console.log("API Response:", data);
        setCrimeData(data);
        console.log(data.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when component mounts or when state/district changes

    // Optionally, you can clean up the effect by cancelling any ongoing requests
    return () => {
      // Cleanup logic (e.g., cancel ongoing requests)
    };
  }, [state, district]); // Add state and district as dependencies

  const categories = {
    "Crime Against Women": [
      "RAPE",
      "ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY",
      "DOWRY DEATHS",
      "INSULT TO MODESTY OF WOMEN",
      "CRUELTY BY HUSBAND OR HIS RELATIVES",
    ],
    "Economic Crime": ["CHEATING", "COUNTERFIETING"],
    "Property Crime": [
      "DACOITY",
      "ROBBERY",
      "BURGLARY",
      "THEFT",
      "AUTO THEFT",
      "OTHER THEFT",
      "RIOTS",
      "CRIMINAL BREACH OF TRUST",
      "ARSON",
    ],
    "Violent Crime": [
      "MURDER",
      "ATTEMPT TO MURDER",
      "CULPABLE HOMICIDE NOT AMOUNTING TO MURDER",
      "KIDNAPPING & ABDUCTION",
      "KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS",
      "KIDNAPPING AND ABDUCTION OF OTHERS",
      "HURT/GREVIOUS HURT",
      "RIOTS",
    ],
  };
  const classifyDataByCategory = (data) => {
    const classifiedData = [];
    const categories = {
      "Crime Against Women": [
        "RAPE",
        "ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY",
        "DOWRY DEATHS",
        "INSULT TO MODESTY OF WOMEN",
        "CRUELTY BY HUSBAND OR HIS RELATIVES",
      ],
      "Economic Crime": ["CHEATING", "COUNTERFIETING"],
      "Property Crime": [
        "DACOITY",
        "ROBBERY",
        "BURGLARY",
        "THEFT",
        "AUTO THEFT",
        "OTHER THEFT",
        "RIOTS",
        "CRIMINAL BREACH OF TRUST",
        "ARSON",
      ],
      "Violent Crime": [
        "MURDER",
        "ATTEMPT TO MURDER",
        "CULPABLE HOMICIDE NOT AMOUNTING TO MURDER",
        "KIDNAPPING & ABDUCTION",
        "KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS",
        "KIDNAPPING AND ABDUCTION OF OTHERS",
        "HURT/GREVIOUS HURT",
        "RIOTS",
      ],
    };

    Object.keys(categories).forEach((category) => {
      const categoryCrimes = categories[category];
      const categoryData = data.filter((item) =>
        categoryCrimes.some((crime) => item[crime])
      );

      if (categoryData.length > 0) {
        classifiedData.push({ category, data: categoryData });
      }
    });

    return classifiedData;
  };

  const renderTable = (classifiedData) => {
    if (!classifiedData) return null;

    const years = [...new Set(crimeData.map((data) => data.YEAR))];

    return (
      <div className="mt-4">
        <table className="min-w-full table-auto border border-collapse border-gray-800">
          <thead>
            <tr>
              <th className="border p-2">Crime Category</th>
              {years.map((year) => (
                <th key={year} className="border p-2">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classifiedData.map((categoryData) => (
              <tr key={categoryData.category} className="text-center">
                <td className="border p-2">{categoryData.category}</td>
                {years.map((year) => (
                  <td
                    key={`${categoryData.category}-${year}`}
                    className="border p-2"
                  >
                    {categoryData.data
                      .filter((data) => data.YEAR === year)
                      .reduce(
                        (sum, data) => sum + data["TOTAL IPC CRIMES"],
                        0
                      ) || "0.0"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGraphAll = (classifiedData) => {
    if (!classifiedData || classifiedData.length === 0) {
      console.error("No classified data available");
      return null;
    }

    const years = classifiedData[0]?.data?.map((data) => data.YEAR) || [];
    console.log("Years:", years);

    const datasets = classifiedData.map((categoryData) => {
      const crimeCounts =
        categoryData?.data?.map((data) => data["TOTAL IPC CRIMES"]) || [];

      console.log(`Crime Counts for ${categoryData.category}:`, crimeCounts);

      return {
        label: categoryData.category,
        data: crimeCounts,
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1,
      };
    });

    if (years.length === 0) {
      console.error("No years available");
      return null;
    }

    console.log("Datasets:", datasets); // Add this line for debugging

    const data = {
      labels: years,
      datasets: datasets,
    };

    const options = {
      scales: {
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
        y: {
          title: {
            display: true,
            text: "Total IPC Crimes",
          },
        },
      },
    };

    console.log("Render Graph Data:", data); // Add this line for debugging

    return <Bar data={data} options={options} />;
  };
  // this shows multiple graphs for multiple categories
  const renderGraph = (classifiedData) => {
    if (!classifiedData || classifiedData.length === 0) {
      console.error("No classified data available");
      return null;
    }

    return classifiedData.map((categoryData) => {
      const years = categoryData.data.map((data) => data.YEAR);
      const totalIPCData = categoryData.data.map(
        (data) => data["TOTAL IPC CRIMES"]
      );

      const dataset = {
        label: categoryData.category,
        data: totalIPCData,
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1,
      };

      const data = {
        labels: years,
        datasets: [dataset],
      };

      const options = {
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Total IPC Crime",
            },
          },
        },
      };

      return <Bar key={categoryData.category} data={data} options={options} />;
    });
  };

  const getRandomColor = () => {
    // Generate a random color for chart datasets
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  return (
    <div>
      {crimeData && crimeData.length > 0 ? (
        <div>
          {renderTable(classifyDataByCategory(crimeData))}
          {renderGraphAll(classifyDataByCategory(crimeData))}
          {renderGraph(classifyDataByCategory(crimeData))}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default CrimeData;
