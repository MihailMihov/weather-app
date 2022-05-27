'use strict';

let UNITS;

window.onload = () => {
    const searchBarElement = document.getElementById("searchbar");
    const searchButton = document.getElementById("search-button");
    const currentLocationButton = document.getElementById("current-location");
    const cityName = document.getElementById("city-name");
    const weatherIconMain = document.getElementById("icon-main");
    const weatherTypeMain = document.getElementById("weatherType");
    const tempMain = document.getElementById("temp-main");
    const cloudinessElement = document.getElementById("cloudiness-value");
    const humidityElement = document.getElementById("humidity-value");
    const rainElement = document.getElementById("rain-value");
    const dailyForecast = document.getElementsByClassName("forecast");
    
    for (let i = 0; i < dailyForecast.length; i++) {
        dailyForecast.item(i).addEventListener("click", () => {
            for (let j = 0; j < dailyForecast.length; j++) {
                if (dailyForecast.item(j).hasAttribute("selected")) {
                    dailyForecast.item(j).removeAttribute("selected");
                    break;
                }
            }

            dailyForecast.item(i).setAttribute("selected", "true");
            
            //TODO

            syncWeather();
        });
    }

    searchButton.addEventListener("click", async () => {
        //TODO 

        syncWeather();
    });

    currentLocationButton.addEventListener("click", async () => {
        if('geolocation' in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(async (position) => {
                //TODO 
            }, (error) => {
                console.warn(`GEOLOCATION ERROR(${error.code}): ${error.message}`);
            });
        } else {
            /* geolocation IS NOT available */
            console.warn("GEOLOCATION IS NOT AVAILABLE");
        }
    });

    function syncWeather() {
        //TODO


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