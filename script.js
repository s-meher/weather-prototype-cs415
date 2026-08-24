// Chicago coordinates
const latitude = 41.8781;
const longitude = -87.6298;


// Open-Meteo API
const apiURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code` +
    `&hourly=precipitation_probability` +
    `&temperature_unit=fahrenheit` +
    `&timezone=America%2FChicago`;


// Turn weather code into readable text
function getWeatherCondition(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (code === 1 || code === 2) {
        return "Partly cloudy";
    }

    if (code === 3) {
        return "Cloudy";
    }

    if (code === 45 || code === 48) {
        return "Foggy";
    }

    if (code >= 51 && code <= 67) {
        return "Rainy";
    }

    if (code >= 71 && code <= 77) {
        return "Snowy";
    }

    if (code >= 80 && code <= 82) {
        return "Rain showers";
    }

    if (code >= 95) {
        return "Thunderstorms";
    }

    return "Mixed conditions";
}


// Get highest chance of rain during next 4 hours
function getNextFewHoursRain(times, probabilities) {

    const now = new Date();
    let upcomingRain = [];

    for (let i = 0; i < times.length; i++) {

        const hour = new Date(times[i]);

        if (hour >= now) {
            upcomingRain.push(probabilities[i]);
        }

        if (upcomingRain.length === 4) {
            break;
        }
    }

    if (upcomingRain.length === 0) {
        return 0;
    }

    return Math.max(...upcomingRain);
}


// Need 3: walking to class
function getWalkingRecommendation(temp, rainChance) {

    if (rainChance >= 50) {
        return "I'd probably take transit. Rain is likely.";
    }

    if (temp > 88) {
        return "Walking might be uncomfortable because it's hot.";
    }

    if (temp < 35) {
        return "Walking might be uncomfortable because it's cold.";
    }

    return "Yes, it looks comfortable enough to walk.";
}


// Need 4: water bottle
function getWaterRecommendation(temp) {

    if (temp >= 75) {
        return "Yes, I'd bring a water bottle.";
    }

    return "Probably not necessary for a short trip.";
}


// Main function
async function getWeather() {

    try {

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();


        const temperature =
            Math.round(data.current.temperature_2m);

        const feelsLike =
            Math.round(data.current.apparent_temperature);

        const weatherCode =
            data.current.weather_code;

        const rainChance =
            getNextFewHoursRain(
                data.hourly.time,
                data.hourly.precipitation_probability
            );


        // NEED 1: CURRENT TEMPERATURE
        document.getElementById("temperature").textContent =
            `${temperature}°F`;

        document.getElementById("condition").textContent =
            getWeatherCondition(weatherCode);

        document.getElementById("feels-like").textContent =
            `Feels like ${feelsLike}°F`;


        // NEED 2: UMBRELLA
        if (rainChance >= 40) {

            document.getElementById("umbrella-answer").textContent =
                "Yes, bring an umbrella.";

        } else {

            document.getElementById("umbrella-answer").textContent =
                "No umbrella needed.";

        }

        document.getElementById("rain-chance").textContent =
            `Rain chance in the next few hours: ${rainChance}%`;


        // NEED 3: WALK TO CLASS
        document.getElementById("walk-answer").textContent =
            getWalkingRecommendation(feelsLike, rainChance);

        document.getElementById("walk-detail").textContent =
            `Feels like ${feelsLike}°F with a ${rainChance}% chance of rain.`;


        // NEED 4: WATER BOTTLE
        document.getElementById("water-answer").textContent =
            getWaterRecommendation(feelsLike);

        document.getElementById("water-detail").textContent =
            `Based on a feels-like temperature of ${feelsLike}°F.`;


        // UPDATE TIME
        const currentTime =
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        document.getElementById("updated-time").textContent =
            `Updated at ${currentTime}`;

    }

    catch (error) {

        console.error(error);

        document.getElementById("temperature").textContent =
            "Weather unavailable";

        document.getElementById("condition").textContent =
            "Please try again.";
    }
}


// Refresh button
document
    .getElementById("refresh-button")
    .addEventListener("click", getWeather);


// Load immediately
getWeather();