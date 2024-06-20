import conditions from './conditions.js';

// console.log(conditions);

const apiKey = '615be588bf1a41cdb6a160615241306';

// Элементы на странице
const header = document.querySelector('.header');
const form = document.querySelector('#form');
const input = document.querySelector('#inputCity');

const inputCity = document.getElementById('inputCity');
const suggestions = document.getElementById('suggestions');
const showWeatherBtn = document.getElementById('showWeatherBtn');
const weatherForecast = document.getElementById('weatherForecast');

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude.toFixed(2);
            const lon = position.coords.longitude.toFixed(2);
            const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&lang=ru`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                inputCity.value = data.location.name;
            } catch (error) {
                console.error('Error fetching location data:', error);
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

inputCity.addEventListener('input', async () => {
    const query = inputCity.value;
    if (query.length < 2) {
        suggestions.innerHTML = '';
        return;
    }

    const url = `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        suggestions.innerHTML = '';
        data.forEach(city => {
            const li = document.createElement('li');
            li.classList.add('suggestions');
            li.textContent = city.name;
            li.addEventListener('click', () => {
                inputCity.value = city.name;
                suggestions.innerHTML = '';
            });
            suggestions.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

showWeatherBtn.addEventListener('click', async () => {
    const city = inputCity.value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        showForecast();
        displayForecast(data.forecast.forecastday);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
});

const iconMap = {
    "Sunny": "img/day/Sunny.png",
    "Partly Сloudy": "img/day/Partly Сloudy.png",
    "Cloudy": "img/day/Cloudy.png",
    "Overcast": "img/day/Overcast.png",
    "Light rain": "img/day/Light rain.png",
};

function displayForecast(forecastDays) {
    weatherForecast.innerHTML = '';
    forecastDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        
        const date = new Date(day.date);
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateStr = date.toLocaleDateString('ru-RU', options);

        const condition = day.day.condition.text;
        const iconUrl = iconMap[condition] || day.day.condition.icon;
        
        dayElement.innerHTML = `<div class="weather-forecast">
            <h3 class="weather-degrees">${dateStr}</h3>
            <div class="weather-forecast">
            <div class="weather-forecast">Сред: ${day.day.avgtemp_c}<sup>°C</sup></div>
            <div class="weather-degrees">Днём: ${day.day.maxtemp_c}<sup>°C</sup></div>
            <div class="weather-forecast">Ночью: ${day.day.mintemp_c}<sup>°C</sup></div>
            <img class="card-img" src="${iconUrl}" alt="Weather">
            </div>
            <div class="weather-forecast>Условия: ${day.day.condition.text}</>
            </div>
        `;

        weatherForecast.appendChild(dayElement);
    });
}
async function showForecast(e) {
    // Отменяем отправку формы
    // e.preventDefault();

    // Берем значение из инпута, обрезаем пробелы
    let city = input.value.trim();

    // Получаем данные с сервера
    const data = await getWeather(city);

    if (data.error) {
        removeCard();
        showError(data.error.message);
    } else {
        removeCard();

        // console.log(data.current.condition.code);

        const info = conditions.find(
            (obj) => obj.code === data.current.condition.code
        );
        // console.log(info);
        // console.log(info.languages[23]['day_text']);

        const filePath = './img/' + (data.current.is_day ? 'day' : 'night') + '/';
        const fileName = (data.current.is_day ? info.day : info.night) + '.png';
        const imgPath = filePath + fileName;
        // console.log('filePath', filePath + fileName);

        const weatherData = {
            name: data.location.name,
            country: data.location.country,
            temp: data.current.temp_c,
            condition: data.current.is_day
                ? info.languages[23]['day_text']
                : info.languages[23]['night_text'],
            imgPath,
        };

        showCard(weatherData);
    }

};
function removeCard() {
	const prevCard = document.querySelector('.card');
	if (prevCard) prevCard.remove();
    const prevSug = document.querySelector('.suggestion')
    if (prevSug) prevSug.remove();
}

function showError(errorMessage) {
	// Отобразить карточку с ошибкой
	const html = `<div class="card">${errorMessage}</div>`;

	// Отображаем карточку на странице
	header.insertAdjacentHTML('afterend', html);
}

function showCard({ name, country, temp, condition, imgPath }) {
	// Разметка для карточки
	const html = `<div class="card">
                                <h2 class="card-city">${name} <span>${country}</span></h2>

                                <div class="card-weather">
                                    <div class="card-value">${temp}<sup>°c</sup></div>
                                    <img class="card-img" src="${imgPath}" alt="Weather">
                                </div>

                                <div class="card-description">${condition}</div>
                            </div>`;

	// Отображаем карточку на странице
	header.insertAdjacentHTML('afterend', html);
}

async function getWeather(city) {
	const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
	const response = await fetch(url);
	const data = await response.json();
	// console.log(data);
    return data;
}

// Слушаем отправку формы
form.onsubmit = async function (e) {
	// Отменяем отправку формы
	e.preventDefault();

	// Берем значение из инпута, обрезаем пробелы
	let city = input.value.trim();

    // Получаем данные с сервера
    const data = await getWeather(city);

    if (data.error) {
		removeCard();
		showError(data.error.message);
	} else {
		removeCard();

		// console.log(data.current.condition.code);

		const info = conditions.find(
			(obj) => obj.code === data.current.condition.code
		);
		// console.log(info);
		// console.log(info.languages[23]['day_text']);

        const filePath = './img/' + (data.current.is_day ? 'day' : 'night') + '/';
		const fileName = (data.current.is_day ? info.day : info.night) + '.png';
        const imgPath = filePath + fileName;
        // console.log('filePath', filePath + fileName);

		const weatherData = {
			name: data.location.name,
			country: data.location.country,
			temp: data.current.temp_c,
			condition: data.current.is_day
				? info.languages[23]['day_text']
				: info.languages[23]['night_text'],
			imgPath,
		};
        
        displayForecast(data.forecast.forecastday);
		showCard(weatherData);
	}

};