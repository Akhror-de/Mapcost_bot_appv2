import fetch from 'node-fetch';

export default async function handler(req, res) {
  // API-ключ для api-fns.ru, должен быть установлен как переменная окружения в Vercel
  const FNS_API_KEY = process.env.FNS_API_KEY || 'Ocda37fe74232b4d3fdaf80b13d5fc1f6b98fcd3'; // Используем ключ из памяти, если ENV не установлен (для локальной разработки)

  if (req.method === 'GET') {
    try {
      const { inn } = req.query;
      
      // Проверка валидности ИНН
      if (!inn || (inn.length !== 10 && inn.length !== 12)) {
        return res.status(400).json({ error: 'Неверный формат ИНН. ИНН должен состоять из 10 или 12 цифр.' });
      }

      // Запрос к API-FNS.ru
      const response = await fetch(`https://api-fns.ru/api/egr?req=${inn}&key=${FNS_API_KEY}`);
      const data = await response.json();

      // Парсинг ответа и проверка статуса
      // Предполагаем, что data.items[0].СвЮЛ.СвРег.НаимЮЛСокр содержит название компании
      // и data.items[0].СвЮЛ.СостЮЛ.НаимСостЮЛ содержит статус, например, 'Действующее'
      let companyName = null;
      let status = 'Неизвестно';
      let isActive = false;

      if (data && data.items && data.items.length > 0) {
        const businessInfo = data.items[0];
        if (businessInfo.СвЮЛ && businessInfo.СвЮЛ.НаимЮЛСокр) {
          companyName = businessInfo.СвЮЛ.НаимЮЛСокр;
        }
        if (businessInfo.СвЮЛ && businessInfo.СвЮЛ.СостЮЛ && businessInfo.СвЮЛ.СостЮЛ.НаимСостЮЛ) {
          status = businessInfo.СвЮЛ.СостЮЛ.НаимСостЮЛ;
          isActive = (status === 'Действующее');
        }
      }

      res.status(200).json({
        valid: true,
        active: isActive,
        status: status,
        companyName: companyName,
        rawData: data // Для отладки, можно удалить в продакшене
      });
      
    } catch (error) {
      console.error('Ошибка в Serverless Function verify-inn:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера при проверке ИНН.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Метод ${req.method} не разрешен`);
  }
}
