let BtnSearch = document.querySelector('#searchBtn');
let search = document.querySelector('#search');
let unit = document.querySelector('.unit-btn');
let menu = document.querySelector('.dropdown-menu');
let city = document.querySelector('#cityName');
let todayDate = document.querySelector('#dateNow');
let temp = document.querySelector('#temp');
let feelsLike = document.querySelector('#feelsLike');
let humidity = document.querySelector('#humidity');
let wind = document.querySelector('#wind');
let precip = document.querySelector('#precip');
let dailyList = document.querySelector('#dailyList');
let hourlyList = document.querySelector('#hourlyList')


async function getweatherData(cityName) {
   showLoading();
   searchStatus.textContent = 'Search in progress...';

   try {
      let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
      let geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
         searchStatus.textContent = '';
         showNoResults();
         return;
      }

      let lat = geoData.results[0].latitude;
      let lon = geoData.results[0].longitude;

      let weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      let weatherData = await weatherResponse.json();

      renderCurrent(geoData, weatherData);
      renderDaily(weatherData);
      renderHourly(weatherData);

      searchStatus.textContent = '';
      hideStateMessage();

   } catch (error) {
      searchStatus.textContent = '';
      showError();
      console.log(error);
   }
   let lastCity = '';
}


function renderDaily(data) {
   dailyList.innerHTML = "";

   for (let i = 0; i < data.daily.time.length; i++) {
      let dayCard = document.createElement('div');
      dayCard.classList.add('day-card');

      let dateObj = new Date(data.daily.time[i]);
      let dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      let maxTemp = Math.round(data.daily.temperature_2m_max[i]);
      let minTemp = Math.round(data.daily.temperature_2m_min[i]);

     let iconSrc = getWeatherIcon(data.daily.weather_code[i]);

    dayCard.innerHTML = `
        <p>${dayName}</p>
        <img src="${iconSrc}" alt="weather icon">
        <div class="day-temps">
            <span>${maxTemp}°</span>
            <span>${minTemp}°</span>
        </div>
        `;
      dailyList.appendChild(dayCard);
   }
}

function getWeatherIcon(code) {
   if (code === 0) return 'img/icon-sunny.webp';
   if (code === 1 || code === 2) return 'img/icon-partly-cloudy.webp';
   if (code === 3) return 'img/icon-overcast.webp';
   if (code === 45 || code === 48) return 'img/icon-fog.webp';
   if (code >= 51 && code <= 57) return 'img/icon-drizzle.webp';
   if (code >= 61 && code <= 67) return 'img/icon-rain.webp';
   if (code >= 71 && code <= 77) return 'img/icon-snow.webp';
   if (code >= 80 && code <= 82) return 'img/icon-rain.webp';
   if (code >= 85 && code <= 86) return 'img/icon-snow.webp';
   if (code >= 95) return 'img/icon-storm.webp';
   return 'img/icon-sunny.webp';
}

unit.addEventListener('click', function(e) {
    e.stopPropagation();
    menu.classList.toggle('show');
});

document.addEventListener('click', function(e) {
    if (!unit.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
    }
})

BtnSearch.addEventListener('click', function() {
   let cityName = search.value;
   if (cityName === '') {
    alert('Please enter a city name.');
    } else {
    lastCity = cityName;
    getweatherData(cityName);
    }
});

function renderCurrent(geoData, weatherData) {
   city.textContent = geoData.results[0].name + ', ' + geoData.results[0].country;
   
   let now = new Date();
   todayDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
   
   temp.textContent = Math.round(weatherData.current_weather.temperature) + '°';
   
   humidity.textContent = weatherData.hourly.relative_humidity_2m[0] + '%';
   wind.textContent = weatherData.current_weather.windspeed + ' km/h';
   precip.textContent = weatherData.hourly.precipitation[0] + ' mm';
   feelsLike.textContent = Math.round(weatherData.hourly.apparent_temperature[0]) + '°';
}

function renderHourly(data) {
   hourlyList.innerHTML = "";

   for (let i = 0; i < 24; i++) {
      let hourRow = document.createElement('div');
      hourRow.classList.add('hour-row');

      let timeObj = new Date(data.hourly.time[i]);
      let hourLabel = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

      let hourTemp = Math.round(data.hourly.temperature_2m[i]);
      let iconSrc = getWeatherIcon(data.hourly.weather_code[i]); 

      hourRow.innerHTML = `
         <div class="hour-left">
            <img src="${iconSrc}" alt="weather icon">
            <p>${hourLabel}</p>
         </div>
         <p>${hourTemp}°</p>
      `;

      hourlyList.appendChild(hourRow);
   }
}

let stateMessage = document.querySelector('#stateMessage');
let searchStatus = document.querySelector('#searchStatus');
let weatherLayout = document.querySelector('#weatherResult');

function showLoading() {
   searchStatus.textContent = '';
   stateMessage.style.display = 'none';
   weatherLayout.style.display = 'none';
   stateMessage.innerHTML = `<p>Loading...</p>`;
   stateMessage.style.display = 'flex';
}

function showNoResults() {
   weatherLayout.style.display = 'none';
   stateMessage.innerHTML = `<h2>No search result found!</h2>`;
   stateMessage.style.display = 'flex';
}

function showError() {
    weatherLayout.style.display = 'none';

    stateMessage.innerHTML = `
        <h2>Something went wrong</h2>
        <p>We couldn't connect to the server (API error). Please try again in a few moments.</p>
        <button id="retryBtn">Retry</button>
    `;

    stateMessage.style.display = 'flex';

    let retryBtn = document.querySelector('#retryBtn');

    retryBtn.addEventListener('click', function() {
        getweatherData(lastCity);
    });
}

function hideStateMessage() {
   stateMessage.style.display = 'none';
   weatherLayout.style.display = 'flex';
}