'use strict';

const API_URL = "https://weather-api-py.herokuapp.com/weather";

window.onload = async () => {
    const searchBarElement = document.getElementById("searchbar");
    const searchButton = document.getElementById("search-button");
    const currentLocationButton = document.getElementById("current-location");
    const cityName = document.getElementById("city-name");
    const weatherIconMain = document.getElementById("icon-main");
    const weatherTypeMain = document.getElementById("weather-type");
    const tempMain = document.getElementById("temp-main");
    const cloudinessElement = document.getElementById("cloudiness-value");
    const humidityElement = document.getElementById("humidity-value");
    const rainElement = document.getElementById("rain-value");
    const dailyForecast = document.getElementsByClassName("forecast");
    const celsiusButton = document.getElementById("celsius-button");
    const fahrenheitButton = document.getElementById("fahrenheit-button");

    let weather;
    let units = "METRIC";
    let selectedDay = 0;

    getCoords().then((position) => {
        setWeatherByCoords(position);
    })

    for (let i = 0; i < dailyForecast.length; i++) {
        dailyForecast.item(i).addEventListener("click", () => {
            for (let j = 0; j < dailyForecast.length; j++) {
                if (dailyForecast.item(j).hasAttribute("selected")) {
                    dailyForecast.item(j).removeAttribute("selected");
                    break;
                }
            }

            dailyForecast.item(i).setAttribute("selected", "true");

            selectDay(i);
        });
    }

    searchButton.addEventListener("click", () => {
        setWeatherByCity(searchBarElement.value);
    });

    currentLocationButton.addEventListener("click", () => {
        getCoords().then((position) => {
            setWeatherByCoords(position);
        })    
    });

    async function setWeatherByCity(city) {
        const json = await (await fetch(`${API_URL}?city=${city}`)).json();

        json.current.other.rain = json.forecast[0].other.rain;

        setWeather(json);
    }

    async function setWeatherByCoords(position) {
        const lon = position.coords.longitude;
        const lat = position.coords.latitude;

        const json = await (await fetch(`${API_URL}?lat=${lat}&lon=${lon}`)).json();

        json.current.other.rain = json.forecast[0].other.rain;

        setWeather(json);
    }

    async function setWeather(json) {
        weather = json;

        cityName.innerText = json.city.name;
        if (selectedDay !== 0) {
            const selectedDayForecast = json.forecast[selectedDay];
            setDayInfo(selectedDayForecast, false);
        } else {
            setDayInfo(json.current, true);
        }

        for (let i = 0; i < 5; i++) {
            const forecast = json.forecast[i];

            const forecastElement = dailyForecast[i];

            const forecastDate = forecastElement.getElementsByClassName("date")[0];
            const forecastIcon = forecastElement.getElementsByClassName("forecast-icon")[0];
            const forecastWeather = forecastElement.getElementsByClassName("forecast-weather")[0];
            const forecastDayTemp = forecastElement.getElementsByClassName("forecast-day-temp")[0];
            const forecastNightTemp = forecastElement.getElementsByClassName("forecast-night-temp")[0];

            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + i);
            const dateOptions = {weekday: 'short', day: 'numeric'};

            forecastDate.innerText = currentDate.toLocaleString("en-UK", dateOptions);
            forecastIcon.src = `https://openweathermap.org/img/wn/${forecast.status.icon}@2x.png`;
            forecastWeather.innerText = capitalizeFirstLetter(forecast.status.description);
            forecastDayTemp.innerText = convertTempFromKelvin(forecast.day.temp, units) + "°";
            forecastNightTemp.innerText = convertTempFromKelvin(forecast.night.temp, units) + "°";
        }
    }

    function selectDay(index) {
        selectedDay = index;

        if (index === 0) {
            setDayInfo(weather.current, true);
        } else {
            setDayInfo(weather.forecast[index], false);
        }
    }

    function setDayInfo(json, isCurrent = true) {
        weatherIconMain.src = `https://openweathermap.org/img/wn/${json.status.icon}@4x.png`;
        weatherTypeMain.innerText = capitalizeFirstLetter(json.status.description);
        tempMain.innerText = convertTempFromKelvin(isCurrent? json.temp.temp : json.day.temp, units) + "°";
        cloudinessElement.innerText = json.other.clouds + "%";
        humidityElement.innerText = json.other.humidity + "%";
        rainElement.innerText = json.other.rain * 100 + "%";
    }

    celsiusButton.addEventListener("click", () => {
        units = "METRIC";
        setWeather(weather);
    });

    fahrenheitButton.addEventListener("click", () => {
        units = "IMPERIAL";
        setWeather(weather);
    });

    function getCoords() {
        if('geolocation' in navigator) {
            /* geolocation is available */
            return new Promise((success, error) => {
                navigator.geolocation.getCurrentPosition(success, error);
            });
        } else {
            /* geolocation IS NOT available */
            console.warn("GEOLOCATION IS NOT AVAILABLE");
        }
    }
};

function convertTempFromKelvin(temp, units) {
    switch(units) {
        case "METRIC":
            return Math.round(temp - 273.15);
        case "IMPERIAL":
            return Math.round(1.8 * (temp - 273.15) + 32);
        default:
            return temp;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }