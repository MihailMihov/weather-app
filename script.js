'use strict';

const API_KEY = "d4cbbf5ab2a7e513566740bf5e303e12";
const API_LOCALIZATION = "bg";
const API_LOCATION_LIMIT = 1
const API_OPTIONS = `&appid=${API_KEY}&lang=${API_LOCALIZATION}&limit=${API_LOCATION_LIMIT}`;

class Weather {
    constructor(tempK, humidity, feelsLikeTemp, weather, icon, units) {
        this.tempK = tempK;
        this.humidity = humidity;
        this.feelsLikeTemp = feelsLikeTemp;
        this.weather = weather;
        this.icon = icon;
        this.units = units;
    }
    
    getTemp() {
        return Math.round(convertTempFromKelvin(this.tempK, this.units));
    }

    getFeelsLikeTemp() {
        return Math.round(convertTempFromKelvin(this.feelsLikeTemp, this.units));
    }

    async getTempByGeolocation(geolocation) {
        // OpenWeatherMap Current Weather API
        // https://openweathermap.org/current
        const query = `https://api.openweathermap.org/data/2.5/weather?lat=${geolocation.lat}&lon=${geolocation.lon}` + API_OPTIONS;
        const response = await (await fetch(query)).json();

        this.tempK = response["main"]["temp"];
        this.feelsLikeTemp = response["main"]["feels_like"];
        this.humidity = response["main"]["humidity"];
        this.icon = response["weather"][0]["icon"];
        this.weather = response["weather"][0]["main"];
        this.units = "METRIC";
    }
}

class Geolocation {
    constructor(lat, lon, city) {
        this.lat = lat;
        this.lon = lon;
        this.city = city;
    }

    async setByCoords(coords) {
        this.lat = coords.latitude;
        this.lon = coords.longitude;

        // OpenWeatherMap Reverse Geocoding API
        // https://openweathermap.org/api/geocoding-api
        const query = `https://api.openweathermap.org/geo/1.0/reverse?lat=${this.lat}&lon=${this.lon}` + API_OPTIONS;
        const response = await (await fetch(query)).json();
        this.city = response[0]["local_names"][API_LOCALIZATION];
    }

    async setByCity(city) {
        this.city = city;

        // OpenWeatherMap Direct Geocoding API
        // https://openweathermap.org/api/geocoding-api
        const query = `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}` + API_OPTIONS;
        const response = await (await fetch(query)).json();
        this.lat = response[0]["lat"];
        this.lon = response[0]["lon"];
    }
}

const WEATHER = new Weather();
const GEOLOCATION = new Geolocation();

window.onload = () => {
    const searchBarElement = document.getElementById("searchbar");
    const searchButton = document.getElementById("search");
    const currentLocationButton = document.getElementById("current-location");
    const weatherIcon = document.getElementById("weather-image");
    const tempElement = document.getElementById("temp");
    const humidityElement = document.getElementById("humidity");
    const feelsLikeElement = document.getElementById("feels-like");
    const infoWrapper = document.getElementById("info-wrapper");
    const unitsCheckbox = document.getElementById("units-checkbox");
    
    searchButton.addEventListener("click", async () => {
        await GEOLOCATION.setByCity(searchBarElement.value);

        await WEATHER.getTempByGeolocation(GEOLOCATION);

        syncWeather();
    });

    currentLocationButton.addEventListener("click", async () => {
        if('geolocation' in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(async (position) => {
                await GEOLOCATION.setByCoords(position.coords);
                searchBarElement.value = GEOLOCATION.city;
            }, (error) => {
                console.warn(`GEOLOCATION ERROR(${error.code}): ${error.message}`);
            });
        } else {
            /* geolocation IS NOT available */
            console.warn("GEOLOCATION IS NOT AVAILABLE");
        }
        

    });

    unitsCheckbox.addEventListener("change", () => {
        WEATHER.units = unitsCheckbox.checked ? "IMPERIAL" : "METRIC";
        
        syncWeather();
    })

    function syncWeather() {
        if (infoWrapper.hasAttribute("id")) {
            infoWrapper.removeAttribute("id");
        }

        const unitSymbol = getUnitSymbol(WEATHER.units);

        tempElement.innerHTML = WEATHER.getTemp() + unitSymbol;
        feelsLikeElement.innerHTML= WEATHER.getFeelsLikeTemp() + unitSymbol;
        humidityElement.innerHTML = WEATHER.humidity + "%";
        weatherIcon.src = `https://openweathermap.org/img/wn/${WEATHER.icon}@2x.png`
    }
};

function convertTempFromKelvin(temp, units) {
    switch(units) {
        case "METRIC":
            return temp - 273.15;
        case "IMPERIAL":
            return 1.8 * (temp - 273.15) + 32;
        default:
            return temp;
    }
}

function getUnitSymbol(units) {
    switch(units) {
        case 'METRIC':
            return "°C";
        case "IMPERIAL":
            return "°F";
        default:
            return "K";
    }
}