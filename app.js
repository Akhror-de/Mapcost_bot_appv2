All('.filter-button');

// Кастомные иконки для категорий
const categoryIcons = {
    'restaurants': 'islands#darkGreenDotIcon',
    'beauty': 'islands#pinkDotIcon',
    'auto': 'islands#darkOrangeDotIcon',
    'flowers': 'islands#violetDotIcon',
    'medical': 'islands#redDotIcon',
    'all': 'islands#blueDotIcon'
};

// Функции для показа/скрытия лоадера
function showLoader() {
    loaderOverlay.classList.add('visible');
}

function hideLoader() {
    loaderOverlay.classList.remove('visible');
}

// Функция для получения геолокации пользователя и инициализации карты
async function initMapAndFetchData() {
    showLoader();
    // Проверяем существование контейнера карты
    if (!document.getElementById('map')) {
        console.error('Контейнер #map не найден!');
        hideLoader();
        // Fallback-интерфейс: показать сообщение об ошибке
        offersListDiv.innerHTML = '<p style="text-align: center;">К сожалению, не удалось загрузить карту. Пожалуйста, убедитесь, что контейнер карты присутствует в HTML.</p>';
        return;
    }

    try {
        if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            userLocation = [position.coords.latitude, position.coords.longitude];
        } else {
            console.warn("Геолокация не поддерживается браузером. Используем местоположение по умолчанию.");
            userLocation = [55.75, 37.57]; // Местоположение по умолчанию (Москва)
            offersListDiv.innerHTML = '<p style="text-align: center;">Геолокация не поддерживается или запрещена. Используем местоположение по умолчанию.</p>';
        }

        // Инициализация карты
        if (!myMap) {
            myMap = new ymaps.Map("map", {
                center: userLocation,
                zoom: 12,
                type: 'yandex#dark', // Темная тема карты
                controls: ['zoomControl', 'fullscreenControl']
            });
        } else {
            myMap.setCenter(userLocation, 12); // Обновить центр карты
            myMap.geoObjects.removeAll(); // Очистить все объекты, кроме маркера пользователя
        }

        // Добавляем маркер пользователя
        myMap.geoObjects.add(new ymaps.Placemark(userLocation, { hintContent: 'Вы здесь!' }, { preset: 'islands#dotIcon', iconColor: '#ff0000' }));

        await fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);

    } catch (error) {
        console.error('Ошибка при получении геолокации или инициализации карты:', error);
        userLocation = [55.75, 37.57]; // Местоположение по умолчанию (Москва)
        if (!myMap) {
            myMap = new ymaps.Map("map", {
                center: userLocation,
                zoom: 12,
                type: 'yandex#dark',
                controls: ['zoomControl', 'fullscreenControl']
            });
        }
        myMap.geoObjects.add(new ymaps.Placemark(userLocation, { hintContent: 'Местоположение по умолчанию' }, { preset: 'islands#dotIcon', iconColor: '#ff0000' }));
        offersListDiv.innerHTML = '<p style="text-align: center;">Не удалось получить ваше местоположение. Отображены предложения для Москвы.</p>';
        await fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);
    } finally {
        hideLoader();
    }
}

// Функция для получения предложений с API
async function fetchOffers(lat, lon, radius) {
    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers?lat=// Инициализация Telegram WebApp
Telegram.WebApp.ready();
Telegram.WebApp.expand();

const YANDEX_MAPS_API_KEY = '07b74146-5f5a-46bf-a2b1-cf6d052a41bb'; // Реальный ключ
const API_BASE_URL = window.location.origin; // Динамическое определение базового URL API
const DEFAULT_SEARCH_RADIUS = 5; // Радиус поиска предложений в км

let userLocation = null;
let myMap = null;
let currentOffers = []; // Здесь будут храниться загруженные предложения

const loaderOverlay = document.getElementById('loaderOverlay');
const findOffersBtn = document.getElementById('findOffersBtn');
const refreshLocationBtn = document.getElementById('refreshLocationBtn');
const floatingChatBtn = document.getElementById('floatingChatBtn');
const offerDetailsPopup = document.getElementById('offerDetailsPopup');
const popupCloseBtn = offerDetailsPopup.querySelector('.popup-close');
const popupContactBtn = offerDetailsPopup.querySelector('#popupContactBtn');
const offersListDiv = document.querySelector('.offers-list');
const filterButtons = document.querySelector${lat}&lon=${lon}&radius=${radius}`);
        const data = await response.json();
        if (response.ok) {
            currentOffers = data;
            displayOffers(currentOffers); // Отображаем полученные предложения
        } else {
            console.error('Ошибка при получении предложений:', data.error);
            offersListDiv.innerHTML = '<p style="text-align: center;">Ошибка при загрузке предложений.</p>';
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса к API для предложений:', error);
        offersListDiv.innerHTML = '<p style="text-align: center;">Не удалось соединиться с сервером предложений.</p>';
    } finally {
        hideLoader();
    }
}

// Функция для отображения предложений на карте и в списке
function displayOffers(filteredOffers) {
    offersListDiv.innerHTML = ''; // Очищаем список

    if (myMap) {
        myMap.geoObjects.each(obj => {
            if (obj.properties.get('isUserMarker') !== true) {
                myMap.geoObjects.remove(obj);
            }
        });
    }

    filteredOffers.forEach((offer, index) => {
        // Добавляем маркер на карту
        if (myMap) {
            const placemark = new ymaps.Placemark(offer.coords, {
                hintContent: offer.name,
                balloonContentHeader: offer.name,
                balloonContentBody: `
                    <p class="category">${offer.category}</p>
                    <p>${offer.description}</p>
                    <p><strong>Адрес:</strong> ${offer.address}</p>
                    <p><strong>Телефон:</strong> ${offer.phone}</p>
                `,
                balloonContentFooter: '<button class="contact-button" id="balloonContactBtn">Перейти в чат с бизнесом</button>',
                clusterCaption: offer.name,
                offerId: offer.id // Передаем ID предложения для попапа
            }, {
                preset: categoryIcons[offer.category] || categoryIcons.all,
                hideIconOnBalloonOpen: false,
                balloonOffset: [3, -40]
            });
            placemark.properties.set('offerData', offer);
            placemark.events.add('click', function (e) {
                showOfferDetailsPopup(e.get('target').properties.get('offerData'));
            });
            myMap.geoObjects.add(placemark);
        }

        // Добавляем карточку в список
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.style.animationDelay = `${index * 0.05}s`; // Анимация появления
        offerCard.innerHTML = `
            <h2>${offer.name}</h2>
            <p class="category">Категория: ${offer.category}</p>
            <p>${offer.description}</p>
            <p><strong>Адрес:</strong> ${offer.address}</p>
            <p><strong>Телефон:</strong> ${offer.phone}</p>
            <button class="contact-button" data-offer-id="${offer.id}">Перейти в чат с бизнесом</button>
        `;
        offerCard.addEventListener('click', () => showOfferDetailsPopup(offer));
        offersListDiv.appendChild(offerCard);
    });
}

// Функция для открытия чата с бизнесом (Telegram Deep Linking)
function openBusinessChat(offerData) {
    const message = `Здравствуйте, меня интересует ваше предложение в MapCost: ${offerData.name} по адресу ${offerData.address}. Мой телефон: ${Telegram.WebApp.initDataUnsafe?.user?.phone_number || 'не указан'}.`;
    // Здесь можно использовать Telegram.WebApp.openTelegramLink для открытия чата с ботом или конкретным пользователем
    // Например: Telegram.WebApp.openTelegramLink(`https://t.me/your_bot_username?start=${encodeURIComponent(message)}`);
    alert(`Реализация deep linking для ${offerData.name} с номером ${offerData.phone} будет здесь. Сообщение: "${message}"`);
}

// Функция для показа попапа с деталями предложения
function showOfferDetailsPopup(offer) {
    document.getElementById('popupOfferName').textContent = offer.name;
    document.getElementById('popupOfferCategory').textContent = `Категория: ${offer.category}`;
    document.getElementById('popupOfferDescription').textContent = offer.description;
    document.getElementById('popupOfferAddress').textContent = offer.address;
    document.getElementById('popupOfferPhone').textContent = offer.phone;

    // Обновляем обработчик кнопки в попапе, чтобы он обращался к текущему предложению
    popupContactBtn.onclick = () => openBusinessChat(offer);

    offerDetailsPopup.classList.add('visible');
}

// Функция для скрытия попапа
function hideOfferDetailsPopup() {
    offerDetailsPopup.classList.remove('visible');
}

// Обработчики событий

// Кнопка "Найти предложения рядом"
findOffersBtn.addEventListener('click', () => {
    if (userLocation) {
        fetchOffers(userLocation[0], userLocation[1], DEFAULT_SEARCH_RADIUS);
    } else {
        alert('Не удалось определить ваше текущее местоположение.');
        initMapAndFetchData(); // Попробуем получить геолокацию снова
    }
});

// Кнопка "Обновить геолокацию"
refreshLocationBtn.addEventListener('click', initMapAndFetchData);

// Кнопки фильтрации по категориям
filterButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        const category = event.target.dataset.category;
        const filtered = category === 'all' ? currentOffers : currentOffers.filter(offer => offer.category === category);
        displayOffers(filtered);
    });
});

// Плавающая кнопка чата (пример)
floatingChatBtn.addEventListener('click', () => {
    alert('Открытие общего чата или помощи. Реализация deep linking здесь.');
    // Telegram.WebApp.openTelegramLink(`https://t.me/your_support_bot?start=help`);
});

// Закрытие попапа
popupCloseBtn.addEventListener('click', hideOfferDetailsPopup);
offerDetailsPopup.addEventListener('click', (e) => {
    if (e.target === offerDetailsPopup) {
        hideOfferDetailsPopup();
    }
});

// Запускаем получение геолокации и инициализацию карты только после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    ymaps.ready(initMapAndFetchData);
});



