export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Логика регистрации бизнеса
    const { inn, name, category, description, promoStartDate, promoEndDate, address, phone, telegram, logo, coords } = req.body;

    // В реальном приложении здесь будет логика сохранения в БД
    // и возможно, интеграция с сервисом уведомлений для админа

    // Для примера, имитация сохранения и возврата успеха
    console.log('Получены данные для регистрации бизнеса:', { inn, name, category, description, address });
    
    // Здесь нужно добавить бизнес в pendingBusinesses в персистентное хранилище
    // В данном серверлесс контексте, прямой доступ к массивам pendingBusinesses из api/index.js невозможен.
    // Нужно будет либо настроить общую базу данных, либо передавать данные через другие механизмы.
    // Пока просто возвращаем успех.

    return res.status(200).json({ success: true, message: 'Заявка на регистрацию принята.' });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
