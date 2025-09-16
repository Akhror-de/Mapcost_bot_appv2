const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const offersData = [
  {
      id: 1,
      name: "Ресторан 'Вкус Востока'",
      description: "Уютный ресторан восточной кухни. Насладитесь нашими лучшими блюдами!",
      address: "Улица Ленина, 10",
      phone: "+79001234567",
      category: "restaurants",
      coords: [55.751244, 37.618423] // Примерные координаты для Москвы
  },
  {
      id: 2,
      name: "Салон красоты 'Гармония'",
      description: "Широкий спектр услуг по уходу за собой. Опытные мастера.",
      address: "Проспект Мира, 25",
      phone: "+79007654321",
      category: "beauty",
      coords: [55.762986, 37.644177]
  },
  {
      id: 3,
      name: "Автосервис 'Быстрые колеса'",
      description: "Качественный ремонт и обслуживание автомобилей любой марки.",
      address: "Шоссе Энтузиастов, 50",
      phone: "+79001112233",
      category: "auto",
      coords: [55.740237, 37.712176]
  },
  {
      id: 4,
      name: "Магазин цветов 'Флора'",
      description: "Свежие цветы и оригинальные букеты на любой случай.",
      address: "Бульвар Дмитрия Донского, 1",
      phone: "+79004445566",
      category: "flowers",
      coords: [55.570185, 37.594726]
  },
  {
      id: 5,
      name: "Медицинский центр 'Здоровье'",
      description: "Современное оборудование и высококвалифицированные специалисты.",
      address: "Улица Академика Королева, 12",
      phone: "+79007778899",
      category: "medical",
      coords: [55.820063, 37.604778]
  }
];

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS
const allowedOrigins = [
  'https://mapcost-bot-appv2.vercel.app',
  /^https:\/\/[a-zA-Z0-9\-]+\.vercel\.app$/,
  'http://localhost:3000' // Для локальной разработки
];

app.use(cors({
  origin: function (origin, callback) {
    // Разрешить запросы без origin (например, с Postman или curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(pattern => typeof pattern === 'string' ? pattern === origin : pattern.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Обслуживание статических файлов из корневой директории

// Главный API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MapCost API!',
    version: '1.0.0'
  });
});

// Endpoint для проверки ИНН
app.get('/api/check-inn', async (req, res) => {
  const { inn } = req.query;
  const API_KEY = 'Ocda37fe74232b4d3fdaf80b13d5fc1f6b98fcd3'; // Ваш API ключ
  const FNS_API_URL = 'https://api-fns.ru/api/egr';

  if (!inn) {
    return res.status(400).json({ error: 'ИНН не указан' });
  }

  try {
    const response = await axios.get(`${FNS_API_URL}?req=${inn}&key=${API_KEY}`);
    const data = response.data;

    // Проверка статуса компании (примерная логика, может потребоваться уточнение)
    let status = 'Неизвестно';
    if (data && data.items && data.items.length > 0) {
      const company = data.items[0].ЮЛ || data.items[0].ИП;
      if (company) {
        status = company.Статус || 'Действующее'; // Предположим, что если статус не указан, то действующее
      }
    }

    res.status(200).json({
      inn: inn,
      status: status,
      details: data // Возвращаем полные данные для отладки
    });
  } catch (error) {
    console.error('Ошибка при запросе к API-FNS.ru:', error.message);
    res.status(500).json({ error: 'Ошибка при проверке ИНН', details: error.message });
  }
});

// Функция для расчета расстояния между двумя координатами (формула Хаверсина)
function haversineDistance(coords1, coords2) {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371; // Радиус Земли в километрах

  const lat1 = toRad(coords1[0]);
  const lon1 = toRad(coords1[1]);
  const lat2 = toRad(coords2[0]);
  const lon2 = toRad(coords2[1]);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в километрах
}

// Endpoint для получения предложений по координатам и радиусу
app.get('/api/offers', (req, res) => {
  const { lat, lon, radius } = req.query;

  if (!lat || !lon || !radius) {
    return res.status(400).json({ error: 'Необходимо указать широту (lat), долготу (lon) и радиус (radius).' });
  }

  const userCoords = [parseFloat(lat), parseFloat(lon)];
  const searchRadius = parseFloat(radius); // Радиус в километрах

  const filteredOffers = offersData.filter(offer => {
    const distance = haversineDistance(userCoords, offer.coords);
    return distance <= searchRadius;
  });

  res.status(200).json(filteredOffers);
});

// Обработка всех остальных GET запросов (для Vercel Functions)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Запуск сервера только при непосредственном выполнении файла (не в Vercel Functions)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // Экспорт для Vercel Serverless Functions
