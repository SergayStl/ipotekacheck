# Деплой InsureCheck на Vercel

## 1. Создай аккаунты (если ещё нет)

- **GitHub**: https://github.com/signup
- **Vercel**: https://vercel.com → "Continue with GitHub"

## 2. Создай GitHub репозиторий

1. Зайди на github.com → кнопка "+" → New repository
2. Имя: `insurecheck`
3. Private или Public — на твой выбор
4. Нажми "Create repository"

## 3. Загрузи код на GitHub

Открой PowerShell в папке C:\Claude\InsureCheck\ и выполни:

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_USERNAME/insurecheck.git
git branch -M main
git push -u origin main
```

## 4. Подключи к Vercel

1. Зайди на vercel.com
2. "Add New Project"
3. Выбери репозиторий `insurecheck`
4. Нажми "Deploy" — Vercel сам всё соберёт

## 5. Добавь переменные окружения в Vercel

В панели Vercel → Settings → Environment Variables добавь:

| Имя | Значение |
|-----|---------|
| `DATABASE_URL` | `postgresql://ins_monitor:ins_secure_2024@5.253.188.44:5433/insurance_monitor` |
| `JWT_SECRET` | `insurecheck-jwt-secret-2024-change-in-production-min32chars` |
| `NEXT_PUBLIC_API_URL` | `https://insurecheck.vercel.app` |

После добавления — **Redeploy** (кнопка в Deployments).

## 6. Проверь

Открой https://insurecheck.vercel.app — должен работать сайт.

---

## Локальный запуск (для разработки)

```powershell
cd C:\Claude\InsureCheck
npm install
npm run dev
```

Откроется на http://localhost:3000

---

## Настройка парсера на VPS

Парсер находится в D:\Sergey_sigma\Parser_saitov_gg\insurance_monitor\
Для деплоя на VPS — отдельная инструкция.
