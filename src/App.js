import React, { useState, useEffect } from 'react';
import WeatherCards from "./Components/WeatherCards";
import WeatherToday from "./Components/WeatherToday";
import {
  Button,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react"
import axios from 'axios'
import './App.scss';

function App() {
  const [loading, setLoading] = useState(false);
  const [isLocationExist, setIsLocationExist] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationError, setLocationError] = useState("");
  const [weatherData, setWeatherData] = useState([]);

  const onSuccessLocation = async (position) => {
    const location = `${position.coords.latitude}%2C${position.coords.longitude}`;
    console.log(location);
    localStorage.setItem('location', location);
    setIsLocationExist(true);
    await getWeatherData(location);
  }

  const onErrorLocation = (err) => {
    setLoading(false)
    setLocationError(`Failed to locate. Error: ${err.code}`);

  }

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation);
    } else {
      setLocationError('Sorry. Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }

  const getWeatherData = async (location) => {
    setLoading(true);
    const url = `https://data.climacell.co/v4/timelines?location=${location}&fields=temperature&fields=weatherCode&timesteps=1d&units=metric&apikey=fmqXDGLaGG7rhK7il3jfQ0XZotU3vDVb`;
    try {
      const response = await axios.get(url);
      if (response.data) {
        setWeatherData(response.data.data.timelines[0].intervals.slice(0, 7));
        setLoading(false);
      }
      else {
        setLoading(false);
        setErrorMessage("Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }

  }

  useEffect(() => {
    setLoading(true);
    const location = localStorage.getItem('location');
    if (location) {
      setIsLocationExist(true);
      getWeatherData(location);
    }
    setLoading(false);
  }, [])

  return (
    <div className="weather-app">
      {
        loading === true ?
          (
            <div className="weather-app-loader">
              <Progress isIndeterminate hasStripe value={44} size="md" />
            </div>
          ) :
          !isLocationExist ?
            (
              <>
                <div className="weather-app-home">
                  <Button colorScheme="teal" variant="outline" onClick={() => getLocation()}>
                    Get Current Location Weather
                </Button>
                {
                  locationError !== "" && (
                    <div className="location-error">
                      <Alert status="error">
                        <AlertIcon />
                        <AlertTitle mr={2}>{"An Error Ocurred"}.</AlertTitle>
                        <AlertDescription>{errorMessage.split(".")[1]}.</AlertDescription>
                        <CloseButton position="absolute" right="8px" top="8px" />
                      </Alert>
                    </div>
                  )
                }
                </div>
                
              </>
            ) :
            weatherData.length ?
              (
                <>
                  <div className="weather-today">
                    <WeatherToday currentWeather={weatherData[0]} />
                  </div>
                  <div className="weather-cards">
                    <div><WeatherCards weatherData={weatherData.slice(1, 7)} /></div>
                  </div>
                </>
              ) :
              (
                <div className="weather-app-error">
                  <p>{errorMessage}. Please try reloading the page</p>
                </div>
              )
      }
    </div>
  )
}

export default App;
