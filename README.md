# MausamLive 🌍 — Worldwide Real-Time Weather Application

"MausamLive is a responsive worldwide real-time weather application that retrieves live weather data for locations across the globe. It provides current conditions, rainfall probability, precipitation, hourly forecasts, multi-day forecasts, weather details, location-based weather detection, weather alerts, and browser notifications. The application uses a modern React/Next.js frontend, Node.js/Express backend, real weather APIs, and a lightweight SQLite database."

---

## 🌟 Key Features

1. **Worldwide Geocoding Search**: Search any city across India (Visakhapatnam, Mumbai, Delhi, Bengaluru) and internationally (London, New York, Tokyo, Sydney, Dubai, Paris, etc.).
2. **Current Geolocation Detection**: Click "Use My Location" to detect coordinates via Browser Geolocation API.
3. **100% Real Weather Data**: Powered by the Open-Meteo live API. Zero hardcoded or random values.
4. **Rainfall & Precipitation Engine**: Real-time rain probability percentage (%), precipitation volume (mm/inches), cloud cover, and rain intensity indicators.
5. **24-Hour Forecast & Recharts Chart**: Interactive temperature and rain probability charts with hourly card sliders.
6. **7-Day Forecast**: Multi-day high/low temperature bar visualizers and condition badges.
7. **Air Quality Index (AQI)**: US AQI standard status (Good, Moderate, Poor, Very Poor, Hazardous) with PM2.5, PM10, CO, NO2, O3 metrics.
8. **Real Browser Web Push Notifications**: Web Push API + Service Worker implementation with an instant **"Send Test Notification"** feature.
9. **Automated Weather Alerts Cron**: `node-cron` background scheduler running every 5 minutes to evaluate weather conditions (Heavy Rain, Thunderstorm, Extreme Temperature, High Wind, Poor Air Quality) and push alert notifications to subscribers.
10. **Timezone Aware**: Displays local date and time relative to the searched city's timezone.
11. **Unit Switcher & Dark Mode**: Easily toggle between °C (Metric) / °F (Imperial) and Light / Dark glassmorphic UI.
12. **SQLite Database Caching**: SQLite + Prisma caching layer (5-minute TTL) to prevent excessive API requests.

---

## 📂 Project Architecture

```
mausamlive/
├── frontend/                  # Next.js 14+ / React / Tailwind CSS
│   ├── app/                   # App Router pages & globals.css
│   ├── components/            # Header, CurrentWeather, RainCard, HourlyForecast, etc.
│   ├── services/              # API REST client
│   ├── types/                 # Weather interfaces
│   ├── lib/                   # Unit formatting & utilities
│   └── public/
│       └── sw.js              # Push Notification Service Worker
│
├── backend/                   # Node.js / Express / TypeScript
│   ├── src/
│   │   ├── controllers/       # Location, Weather, and Push Controllers
│   │   ├── providers/         # Open-Meteo Provider & WMO decoder
│   │   ├── notifications/     # Web Push Service & node-cron Alert Scheduler
│   │   ├── services/          # SQLite & Memory Cache Service
│   │   └── database/          # Prisma Client setup
│   ├── prisma/
│   │   └── schema.prisma      # SQLite Database Schema
│   └── .env                   # Server port & VAPID keys
│
├── README.md
├── .env.example
└── .gitignore
```

---

## 🚀 Beginner-Friendly How To Run Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Start Backend Server (Express + SQLite)

Open a terminal window and execute:

```bash
cd backend
npm install
npm run prisma:push
npm run dev
```

The backend server will launch on `http://localhost:5000`.

### 3. Start Frontend App (Next.js)

Open a second terminal window and execute:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Testing Checklist & Demonstration

- [x] **Indian City Search**: Type `Visakhapatnam, India` or `Hyderabad` -> Live weather & local time displayed.
- [x] **International Search**: Type `London, UK` or `Tokyo, Japan` -> Local London/Tokyo time & forecast displayed.
- [x] **Current Location**: Click `Use My Location` -> Geolocation coordinates fetched.
- [x] **Rainfall & Rain Chance**: Real precipitation volume & probability bar displayed.
- [x] **24-Hour Hourly Chart**: Recharts temperature & rain probability trend graph.
- [x] **7-Day Forecast**: Multi-day min/max temperature visualizer.
- [x] **Real Push Notifications**: Click the notification bell, click `Enable Weather Notifications`, then click **`Send Test Notification`** to receive a native desktop browser push alert!
