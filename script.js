'use strict';

const API_URL = "";

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

    searchButton.addEventListener("click", async () => {
        setWeatherByCity(searchBarElement.value);
    });

    currentLocationButton.addEventListener("click", async () => {
        getCoords().then((position) => {
            setWeatherByCoords(position);
        })    
    });

    celsiusButton.addEventListener("click", () => {
        units = "METRIC";
        setWeather(weather);
    });

    fahrenheitButton.addEventListener("click", () => {
        units = "IMPERIAL";
        setWeather(weather);
    });

    async function setWeatherByCity(city) {
        const json = await (await fetch(`${API_URL}/combined?city=${city}`)).json();

        setWeather(json);
    }

    async function setWeatherByCoords(position) {
        const lon = position.coords.longitude;
        const lat = position.coords.latitude;

        const json = await (await fetch(`${API_URL}/combined?lat=${lat}&lon=${lon}`)).json();

        console.log(json);

        setWeather(json);
    }

    async function setWeather(json) {
        weather = json;

        cityName.innerText = json.name;
        if (selectedDay != 0) {
            const selectedDayForecast = json.future[selectedDay];
            setDayInfo(selectedDayForecast, false);
        } else {
            setDayInfo(json, true);
        }

        for (let i = 0; i < 5; i++) {
            const forecast = json.future[i];

            const forecastElement = dailyForecast[i];

            const forecastDate = forecastElement.getElementsByClassName("date")[0];
            const forecastIcon = forecastElement.getElementsByClassName("forecast-icon")[0];
            const forecastWeather = forecastElement.getElementsByClassName("forecast-weather")[0];
            const forecastDayTemp = forecastElement.getElementsByClassName("forecast-day-temp")[0];
            const forecastNightTemp = forecastElement.getElementsByClassName("forecast-night-temp")[0];

            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + i);
            const dateOptions = {weekday: 'short', day: 'numeric'};
            const dateString = currentDate.toLocaleString("en-UK", dateOptions);

            forecastDate.innerText = dateString;
            forecastIcon.src = forecast.status.icon + "2x.png";
            forecastWeather.innerText = forecast.status.description;
            forecastDayTemp.innerText = convertTempFromKelvin(forecast.day.temp, units) + "°";
            forecastNightTemp.innerText = convertTempFromKelvin(forecast.night.temp, units) + "°";
        }
    }

    function setDayInfo(json, isCurrent = true) {
        weatherIconMain.src = json.status.icon + "4x.png";
        weatherTypeMain.innerText = json.status.description;
        tempMain.innerText = convertTempFromKelvin(isCurrent? json.temp.temp : json.day.temp, units) + "°";
        cloudinessElement.innerText = json.other.clouds + "%";
        humidityElement.innerText = json.other.humidity + "%";
        rainElement.innerText = json.other.rain + "%";
    }

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

    function selectDay(index) {
        selectedDay = index;

        if (index == 0) {
            setDayInfo(weather, true);
            return;
        } else {
            const forecast = weather.future[index];
            setDayInfo(forecast, false);
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