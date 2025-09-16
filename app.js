// Инициализация Telegram WebApp
Telegram.WebApp.ready();
Telegram.WebApp.expand();

const YANDEX_MAPS_API_KEY = '07b74146-5f5a-46bf-a2b1-cf6d052a41bb'; // Реальный ключ
const API_BASE_URL = window.location.origin; // Динамическое определение базового URL API
const DEFAULT_SEARCH_RADIUS = 5; // Радиус поиска предложений в км

let userLocation = null;
let myMap = null;
let currentOffers = []; // Здесь будут храниться загруженные предложения

// Функция для получения геолокации пользователя
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            initMap();
            fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);
        }, () => {
            console.error("Не удалось получить геолокацию пользователя. Используем местоположение по умолчанию.");
            userLocation = [55.75, 37.57]; // Местоположение по умолчанию (Москва)
            initMap();
            fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);
        });
    } else {
        console.error("Геолокация не поддерживается браузером. Используем местоположение по умолчанию.");
        userLocation = [55.75, 37.57]; // Местоположение по умолчанию (Москва)
        initMap();
        fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);
    }
}

// Инициализация Яндекс.Карты
function initMap() {
    if (userLocation && ymaps) {
        myMap = new ymaps.Map('map', {
            center: userLocation,
            zoom: 12,
            type: 'yandex#dark', // Темная тема карты
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем маркер пользователя
        myMap.geoObjects.add(new ymaps.Placemark(userLocation, { hintContent: 'Вы здесь!' }, { preset: 'islands#dotIcon', iconColor: '#ff0000' }));
    }
}

// Функция для получения предложений с API
async function fetchOffers(lat, lon, radius) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers?lat=${lat}&lon=${lon}&radius=${radius}`);
        const data = await response.json();
        if (response.ok) {
            currentOffers = data;
            displayOffers(currentOffers); // Отображаем полученные предложения
        } else {
            console.error('Ошибка при получении предложений:', data.error);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса к API для предложений:', error);
    }
}

// Функция для отображения предложений на карте и в списке
function displayOffers(filteredOffers) {
    const offersListDiv = document.querySelector('.offers-list');
    offersListDiv.innerHTML = ''; // Очищаем список

    if (myMap) {
        myMap.geoObjects.removeAll(); // Очищаем старые маркеры
        // Добавляем маркер пользователя обратно
        myMap.geoObjects.add(new ymaps.Placemark(userLocation, { hintContent: 'Вы здесь!' }, { preset: 'islands#dotIcon', iconColor: '#ff0000' }));
    }

    filteredOffers.forEach(offer => {
        // Добавляем маркер на карту
        if (myMap) {
            const placemark = new ymaps.Placemark(offer.coords, {
                hintContent: offer.name,
                balloonContent: `
                    <div class="offer-balloon">
                        <h2>${offer.name}</h2>
                        <p>${offer.description}</p>
                        <p><strong>Адрес:</strong> ${offer.address}</p>
                        <p><strong>Телефон:</strong> ${offer.phone}</p>
                        <button class="contact-button" onclick="openBusinessChat('${offer.name}', '${offer.phone}')">Перейти в чат с бизнесом</button>
                    </div>
                `
            }, {
                preset: 'islands#blueDotIcon'
            });
            myMap.geoObjects.add(placemark);
        }

        // Добавляем карточку в список
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <h2>${offer.name}</h2>
            <p class="category">Категория: ${offer.category}</p>
            <p>${offer.description}</p>
            <p><strong>Адрес:</strong> ${offer.address}</p>
            <p><strong>Телефон:</strong> ${offer.phone}</p>
            <button class="contact-button" onclick="openBusinessChat('${offer.name}', '${offer.phone}')">Перейти в чат с бизнесом</button>
        `;
        offersListDiv.appendChild(offerCard);
    });
}

// Функция для открытия чата с бизнесом (Telegram Deep Linking)
function openBusinessChat(businessName, phoneNumber) {
    const message = `Здравствуйте, меня интересует ваше предложение в MapCost: ${businessName}.`;
    alert(`Реализация deep linking для ${businessName} с номером ${phoneNumber} будет здесь.`);
}

// Обработчики для кнопок фильтрации
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', (event) => {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        const category = event.target.dataset.category;
        const filtered = category === 'all' ? currentOffers : currentOffers.filter(offer => offer.category === category);
        displayOffers(filtered);
    });
});

// Функция для проверки ИНН через API
async function checkInn(inn) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/check-inn?inn=${inn}`);
        const data = await response.json();
        if (response.ok) {
            console.log('Результат проверки ИНН:', data);
            return data;
        } else {
            console.error('Ошибка проверки ИНН:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса к API для проверки ИНН:', error);
        return null;
    }
}

// Запускаем получение геолокации и инициализацию карты
ymaps.ready(getUserLocation);
