import { FullWeatherData, UnitSystem } from '../types/weather';
import { celsiusToFahrenheit, kmhToMph } from './utils';

export function exportWeatherCSV(data: FullWeatherData, unit: UnitSystem) {
  const { location, current, daily, lastUpdated } = data;
  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const speedUnit = unit === 'imperial' ? 'mph' : 'km/h';

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += `MausamLive Real-Time Weather Report Export\n`;
  csvContent += `Location,${location.name},Country,${location.country}\n`;
  csvContent += `Latitude,${location.latitude},Longitude,${location.longitude}\n`;
  csvContent += `Last Updated,${lastUpdated},Source,Open-Meteo Weather API\n\n`;

  csvContent += `CURRENT WEATHER METRICS\n`;
  csvContent += `Temperature (${tempUnit}),Feels Like (${tempUnit}),Condition,Rain Probability (%),Precipitation (mm),Humidity (%),Wind Speed (${speedUnit}),UV Index\n`;
  csvContent += `${current.temperature},${current.feelsLike},"${current.condition}",${current.rainProbability},${current.rainfall},${current.humidity},${current.windSpeed},${current.uvIndex}\n\n`;

  csvContent += `7-DAY FORECAST\n`;
  csvContent += `Date,Day,Condition,Max Temp (${tempUnit}),Min Temp (${tempUnit}),Rain Probability (%)\n`;
  daily.forEach((d) => {
    csvContent += `${d.date},${d.dayName},"${d.condition}",${d.tempMax},${d.tempMin},${d.rainProbability}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MausamLive_${location.name}_Weather_Report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportWeatherPDF(data: FullWeatherData, unit: UnitSystem) {
  const { location, current, daily, lastUpdated } = data;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MausamLive Report - ${location.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0369a1; }
          .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 20px; }
          .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
          .metric-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; }
          .metric-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .metric-val { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f1f5f9; }
          .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MausamLive 🌍 Weather Report</div>
          <div class="meta">Location: <strong>${location.name}, ${location.country}</strong> | Coordinates: ${location.latitude}°, ${location.longitude}° | Generated: ${lastUpdated}</div>
        </div>

        <div class="card">
          <div style="font-size: 14px; font-weight: bold; color: #0369a1;">Current Weather Conditions</div>
          <div class="metric-grid">
            <div class="metric-box"><div class="metric-label">Temperature</div><div class="metric-val">${current.temperature}°C</div></div>
            <div class="metric-box"><div class="metric-label">Feels Like</div><div class="metric-val">${current.feelsLike}°C</div></div>
            <div class="metric-box"><div class="metric-label">Condition</div><div class="metric-val">${current.condition}</div></div>
            <div class="metric-box"><div class="metric-label">Rain Prob.</div><div class="metric-val">${current.rainProbability}%</div></div>
            <div class="metric-box"><div class="metric-label">Humidity</div><div class="metric-val">${current.humidity}%</div></div>
            <div class="metric-box"><div class="metric-label">Wind Speed</div><div class="metric-val">${current.windSpeed} km/h</div></div>
            <div class="metric-box"><div class="metric-label">UV Index</div><div class="metric-val">${current.uvIndex}</div></div>
            <div class="metric-box"><div class="metric-label">Air Quality</div><div class="metric-val">${data.airQuality?.aqiStatus || 'Good'}</div></div>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 14px; font-weight: bold; color: #0369a1; margin-bottom: 10px;">7-Day Weather Forecast</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Condition</th>
                <th>Max Temp (°C)</th>
                <th>Min Temp (°C)</th>
                <th>Rain Probability (%)</th>
              </tr>
            </thead>
            <tbody>
              ${daily
                .map(
                  (d) => `
                <tr>
                  <td>${d.date}</td>
                  <td>${d.dayName}</td>
                  <td>${d.condition}</td>
                  <td>${d.tempMax}°C</td>
                  <td>${d.tempMin}°C</td>
                  <td>${d.rainProbability}%</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Source: Open-Meteo Weather API | Exported from MausamLive Real-Time Weather Application
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
