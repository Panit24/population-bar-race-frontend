import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import Ruler from './Ruler'; // Import the Ruler component
import axios from 'axios';
import 'chart.js/auto'; // For Chart.js integration

function App() {
  const [populationData, setPopulationData] = useState([]);
  const [currentYear, setCurrentYear] = useState(1950);
  const chartRef = useRef(null); // Create a ref to the canvas element
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [filteredData, setFilteredData] = useState([]);

  const years = [
    1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961,
    1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973,
    1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985,
    1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997,
    1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
    2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
  ];
  const countryRegions = {
    China: 'Asia',
    India: 'Asia',
    'United States': 'Americas',
    Indonesia: 'Asia',
    Pakistan: 'Asia',
    Brazil: 'Americas',
    Nigeria: 'Africa',
    Bangladesh: 'Asia',
    Russia: 'Europe',
    Mexico: 'Americas',
    Japan: 'Asia',
    Philippines: 'Asia',
    Egypt: 'Africa',
    Vietnam: 'Asia',
    'DR Congo': 'Africa',
    Turkey: 'Europe',
    Germany: 'Europe',
    Italy: 'Europe',
    France: 'Europe',
    'United Kingdom': 'Europe',
    Australia: 'Oceania',
    'New Zealand': 'Oceania',
    Fiji: 'Oceania',
    // Add more country-region mappings as needed
  };

  // Function to get flag URL
  const getFlagURL = async (countryName) => {
    try {
      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${countryName}?fullText=true`
      );
      return response.data[0]?.flags?.svg || ''; // Use the country name to fetch flag
    } catch (error) {
      console.error('Error fetching flag for ${countryName}:', error);
      return ''; // Return an empty string if there's an error
    }
  };
  //--------------------------------------------------------
  //--------------------------------------------------------
  function filterByRegion(region) {
    // Filter the countries by the selected region
    let filteredCountries = populationData.filter(
      (country) => country.region === region
    );
    // Sort the countries by population in descending order
    let sortedCountries = filteredCountries.sort(
      (a, b) => b.population - a.population
    );
    // Select the top 12 highest populated countries
    let top12Countries = sortedCountries.slice(0, 12);
    setFilteredData(top12Countries);
    // Update the chart with the new data
    // updateChart(top12Countries);
  }
  //--------------------------------------------------------
  // Fetch population data from backend
  const fetchPopulationData = async (year) => {
    try {
      const response = await axios.get(
        `http://tuksom.shop:8008/api/population/${year}`
      );
      const dataWithRegions = await Promise.all(
        response?.data?.rows?.map(async (country) => {
          const flagUrl = await getFlagURL(country.CountryName);
          let countryInfoResponse = await axios.get(
            `https://restcountries.com/v3.1/name/${country.CountryName}?fullText=true`
          );
          return {
            ...country,
            region:
              countryRegions[country.CountryName] ||
              countryInfoResponse.region ||
              'Unknown',
            flagUrl: flagUrl,
          };
        })
      );
      setPopulationData(dataWithRegions);
    } catch (error) {
      console.error('Error fetching population data:', error);
    }
  };

  // Fetch population data and set interval for year changes
  useEffect(() => {
    fetchPopulationData(currentYear);
    const interval = setInterval(() => {
      setCurrentYear((prevYear) => {
        const nextYear = years[years.indexOf(prevYear) + 1];
        if (nextYear && nextYear <= 2021) {
          fetchPopulationData(nextYear); // Fetch new data for the next year
          return nextYear;
        } else {
          // clearInterval(interval);
          // return prevYear;
          fetchPopulationData(years[0]); // Fetch new data for the first year
          return years[0]; // Reset to the first year
        }
      });
    }, 500); // Update every 2 seconds

    return () => clearInterval(interval); // Cleanup interval
  }, [currentYear]);

  // Prepare chart data
  const prepareChartData = () => {
    if (filteredData.length > 0) {
      const labels = filteredData.slice(0, 12).map((item) => item.CountryName);
      const populations = filteredData
        .slice(0, 12)
        .map((item) => item.Population);

      return {
        labels: labels,
        datasets: [
          {
            label: '',
            data: populations,
            backgroundColor: getColors(filteredData),
            image: filteredData,
          },
        ],
      };
    }
    if (filteredData.length === 0) {
      const labels = populationData
        .slice(0, 12)
        .map((item) => item.CountryName);
      const populations = populationData
        .slice(0, 12)
        .map((item) => item.Population);

      return {
        labels: labels,
        datasets: [
          {
            label: '',
            data: populations,
            backgroundColor: getColors(populationData),
            image: populationData,
          },
        ],
      };
    }
  };
  //------------------------------------------------
  //------------------------------------------------
  const getColors = (data) => {
    const colors = {
      Asia: 'blue',
      Europe: 'purple',
      Africa: 'pink',
      Oceania: 'orange',
      Americas: 'yellow',
    };
    return data?.map((country) => colors[country.region] || 'gray'); // Default to gray if region is unknown
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true, // Ensure the chart is responsive
    maintainAspectRatio: true, // Disable aspect ratio for better responsiveness
    plugins: {
      legend: {
        // position: 'right',
        display: false,
      },
      tooltip: {
        callbacks: {
          // label: (tooltipItem) => {
          //   console.log('tooltipItem', tooltipItem);
          //   let index = tooltipItem.dataIndex;
          //   console.log('index in tooltip', index);
          //   return [
          //     `${tooltipItem.label}`,
          //     `Population: ${tooltipItem.raw}`,
          //     `Flag: ${populationData[index].flagUrl}`,
          //   ];
          // },
          label: function (tooltipItem) {
            console.log('tooltipItem', tooltipItem);

            // Get the index for populationData
            const index = tooltipItem.dataIndex;

            // Make sure populationData is accessible here
            const countryData = populationData[index];

            if (!countryData) {
              return `Data not available`;
            }

            console.log('index in tooltip', index);

            return [
              `Country: ${tooltipItem.label}`,
              `Population: ${tooltipItem.raw.toLocaleString()}`, // Display formatted population number
              `Flag: ${countryData.flagUrl}`, // Display the flag URL
            ];
          },
        },
      },
    },
    scales: {
      x: {
        position: 'top',
        title: {
          display: true,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          stepSize: 200000000,
        },
        grace: 200000000,
      },
      y: {
        title: {
          display: true,
        },
      },
    },
  };

  const calculateTotalPopulation = async () => {
    // Calculate the total population
    let summation = populationData.reduce((sum, country) => {
      // Convert population from string to number before summing
      // console.log('populationData', populationData);
      return sum + Number(country.Population);
    }, 0); // Initialize sum to 0
    setTotalPopulation(summation);
  };

  useEffect(() => {
    calculateTotalPopulation();
  }, [currentYear]);

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const bgImage = {
    id: 'bgImage',
    afterDatasetDraw(chart, args, plugin) {
      const { ctx, data } = chart;
      data.datasets[0].image.forEach((image, index) => {
        // Get the positions of the bars
        const meta = chart.getDatasetMeta(0);
        const xPos = chart.getDatasetMeta(0).data[index].x;
        const yPos = chart.getDatasetMeta(0).data[index].y;
        let chartImage = new Image();
        chartImage.src = image.flagUrl;
        // Set flag image dimensions and radius for circle
        let size = 29; // Diameter of the circle
        let radius = size / 2;
        if (window.innerWidth < 1140) {
          // Reduce the size and radius for small screens
          size = 25; // Adjust size for smaller screens
          radius = size / 2;
        }
        if (window.innerWidth < 1040) {
          // Reduce the size and radius for small screens
          size = 22; // Adjust size for smaller screens
          radius = size / 2;
        }
        if (window.innerWidth < 785) {
          // Reduce the size and radius for small screens
          size = 11; // Adjust size for smaller screens
          radius = size / 2;
        }
        if (window.innerWidth < 500) {
          // Reduce the size and radius for small screens
          size = 7; // Adjust size for smaller screens
          radius = size / 2;
        }
        let xModi = 18;
        let xArc = 18;
        if (window.innerWidth < 1020) {
          xModi = -20;
          xArc = -20;
        }
        // Save the canvas state
        ctx.save();
        // Draw a circular path for clipping
        ctx.beginPath();
        ctx.arc(xPos - xArc, yPos, radius, 0, Math.PI * 2); // Circle above the bar
        ctx.clip(); // Clip the image to this circular region
        // Draw the image inside the clipped circular region
        ctx.drawImage(
          chartImage,
          xPos - xModi - radius,
          yPos - radius,
          size,
          size
        );
        // Restore the canvas state so the next item isn’t affected by clipping
        ctx.restore();
        // ctx.drawImage(chartImage, xPos - 35, yPos - 13, 31, 28);
        // Set the font for the population number and country name
        ctx.beginPath();
        ctx.arc(xPos - xArc, yPos, radius, 0, Math.PI * 2); // Circle above the bar
        ctx.strokeStyle = 'black'; // Set the stroke color to black
        ctx.lineWidth = 1; // Set the line width for the border
        ctx.stroke(); // Draw the circular border
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black'; // Set the text color
        // Draw the population number next to the flag
        let xTextModi = 20;
        if (window.innerWidth < 777) {
          xTextModi = 30;
        }
        if (777 < window.innerWidth < 1020) {
          xTextModi = 35;
        }

        let formattedPopulation = numberWithCommas(image.Population);
        ctx.fillText(
          `${formattedPopulation}`, // Dynamic country name and population
          xPos + xTextModi, // X position to the right of the flag
          yPos + 4 // Y position (centered with the flag)
        );
      });
    },
  };

  // console.log('populationData', populationData);
  return (
    <div style={{ padding: '16px', height: '50%', position: 'relative' }}>
      <h2 className='font-bold text-[18px] sm:text-[24px]'>
        Population growth per country, 1950 to 2021
      </h2>
      <p>Click on the legend below to filter by continent &#128071;</p>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}
      >
        <div className=''>
          <p className='font-bold'>Regions </p>
        </div>
        <div
          className='ml-2'
          style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}
        >
          <div
            className='cursor-pointer'
            onClick={() => {
              filterByRegion('Asia');
            }}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'blue',
              marginRight: '5px',
            }}
          ></div>
          <span>Asia</span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}
        >
          <div
            className='cursor-pointer'
            onClick={() => {
              filterByRegion('Europe');
            }}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'purple',
              marginRight: '5px',
            }}
          ></div>
          <span>Europe</span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}
        >
          <div
            className='cursor-pointer'
            onClick={() => {
              filterByRegion('Africa');
            }}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'pink',
              marginRight: '5px',
            }}
          ></div>
          <span>Africa</span>
        </div>
        {/* <div
          className='cursor-pointer'
          onClick={() => {
            filterByRegion('Oceania');
          }}
          style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'orange',
              marginRight: '5px',
            }}
          ></div>
          <span>Oceania</span>
        </div> */}
        <div
          style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}
        >
          <div
            className='cursor-pointer'
            onClick={() => {
              filterByRegion('Americas');
            }}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'yellow',
              marginRight: '5px',
            }}
          ></div>
          <span>Americas</span>
        </div>
      </div>
      <div
        className='cursor-pointer'
        onClick={() => {
          filterByRegion('All');
        }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <div
          className='sm:w-[20px] sm:h-[20px] w-[20px] h-[20px] rounded-full'
          style={{
            backgroundColor: 'gray',
          }}
        ></div>
        <span className='px-2'>Reset Filter</span>
      </div>
      <h1
        className='text-[17px] sm:text-[45px] font-extrabold'
        style={{
          position: 'absolute',
          bottom: '155px',
          right: '80px',
          zIndex: 10, // Ensure it appears above other elements
          color: 'gray',
        }}
      >
        {currentYear}
      </h1>
      <p
        className='text-[12px] sm:text-[30px]'
        style={{
          position: 'absolute',
          bottom: '130px',
          right: '80px',
          zIndex: 10, // Ensure it appears above other elements
          color: 'gray',
        }}
      >
        {totalPopulation.toLocaleString()}
      </p>
      {populationData.length > 0 ? (
        <>
          <Bar
            data={prepareChartData()}
            options={chartOptions}
            style={{ height: '50%' }}
            plugins={[bgImage]}
          />
          <Ruler currentYear={currentYear} />

          <div className='flex gap-2 py-3'>
            <p>Source</p>
            <a
              href='https://ourworldindata.org'
              target='_blank' // Opens the link in a new tab
              className='underline cursor-pointer'
            >
              Our World In Data
            </a>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
  //--------------------------------------------------------------
}

export default App;
