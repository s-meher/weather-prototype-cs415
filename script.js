// Chicago coordinates
const latitude = 41.8781;
const longitude = -87.6298;


// Open-Meteo weather API
const apiURL =
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
  `&current=temperature_2m,apparent_temperature,weather_code` +
  `&hourly=precipitation_probability` +
  `&temperature_unit=fahrenheit` +
  `&timezone=America%2FChicago`;


// Convert weather codes into readable text
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


// Decide what clothing to recommend
function getClothingRecommendation(temp, rainChance) {

  let recommendation = "";

  if (temp < 40) {
    recommendation = "Wear a warm coat and layers.";
  }

  else if (temp < 50) {
    recommendation = "Wear a jacket.";
  }

  else if (temp < 65) {
    recommendation = "A light jacket or sweatshirt should be comfortable.";
  }

  else if (temp <= 80) {
    recommendation = "A T-shirt should be comfortable.";
  }

  else {
    recommendation = "Wear light, breathable clothes.";
  }


  if (rainChance >= 40) {
    recommendation += " Bring a rain jacket or umbrella.";
  }

  return recommendation;
}


// Decide whether running conditions are good
function getRunningRecommendation(temp, rainChance) {

  if (
    rainChance < 40 &&
    temp >= 45 &&
    temp <= 80
  ) {
    return "Good conditions for a run.";
  }

  if (rainChance >= 40) {
    return "Rain could make running unpleasant.";
  }

  if (temp > 80) {
    return "It may be too hot for a comfortable run.";
  }

  if (temp < 45) {
    return "It may be too cold for a comfortable run.";
  }

  return "Running conditions are okay.";
}


// Get the highest rain probability
// during roughly the next four hours
function getNextFewHoursRain(hourlyTimes, probabilities) {

  const now = new Date();

  let upcomingRain = [];

  for (let i = 0; i < hourlyTimes.length; i++) {

    const hour = new Date(hourlyTimes[i]);

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


// Main weather function
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


    // CURRENT WEATHER
    document.getElementById("temperature").textContent =
      `${temperature}°F`;

    document.getElementById("condition").textContent =
      getWeatherCondition(weatherCode);

    document.getElementById("feels-like").textContent =
      `Feels like ${feelsLike}°F`;


    // UMBRELLA
    document.getElementById("rain-chance").textContent =
      `Highest rain chance in the next few hours: ${rainChance}%`;

    if (rainChance >= 40) {

      document.getElementById("umbrella-answer").textContent =
        "Bring an umbrella.";

    }

    else {

      document.getElementById("umbrella-answer").textContent =
        "No umbrella needed.";

    }


    // RUNNING
    document.getElementById("run-answer").textContent =
      getRunningRecommendation(
        temperature,
        rainChance
      );

    document.getElementById("run-detail").textContent =
      `${temperature}°F with a ${rainChance}% rain chance.`;


    // CLOTHING
    document.getElementById("clothing-answer").textContent =
      getClothingRecommendation(
        temperature,
        rainChance
      );

    document.getElementById("clothing-detail").textContent =
      `Based on the current temperature and rain forecast.`;


    // UPDATED TIME
    const currentTime =
      new Date().toLocaleTimeString(
        [],
        {
          hour: "numeric",
          minute: "2-digit"
        }
      );

    document.getElementById("updated-time").textContent =
      `Last updated at ${currentTime}`;

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
  .addEventListener(
    "click",
    getWeather
  );


// Load weather immediately
getWeather();