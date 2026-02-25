import React from "react";
import { WeatherData, WeatherError } from "../../api/weather";
import SectionTitle from "../layout/SectionTitle";

type Props = {
  data: WeatherData | null;
  error?: WeatherError | null;
};

const weatherMap: Record<
  string,
  { emoji: string; label: string }
> = {
  sunny: { emoji: "☀️", label: "晴れ" },
  clear: { emoji: "☀️", label: "晴れ" },
  cloudy: { emoji: "☁️", label: "くもり" },
  overcast: { emoji: "☁️", label: "くもり" },
  rain: { emoji: "🌧️", label: "雨" },
  rainy: { emoji: "🌧️", label: "雨" },
  snow: { emoji: "❄️", label: "雪" },
  snowy: { emoji: "❄️", label: "雪" },
};

function getWeatherInfo(weather: string) {
  const key = weather.toLowerCase();
  return weatherMap[key] ?? { emoji: "☁️", label: "くもり" };
}

function interpretPressure(
  pressure: number,
  level?: WeatherData["pressureLevel"]
): string {
  if (level === "low") return "低め → 不調が出やすい";
  if (level === "high") return "安定";
  if (level === "normal") return "やや安定";

  if (pressure > 1020) return "安定";
  if (pressure >= 1007) return "やや安定";
  return "低め → 不調が出やすい";
}

function buildAdvice(weather: string, pressure: number): string {
  const info = getWeatherInfo(weather);
  const lowPressure = pressure < 1007;
  const rainy = info.label === "雨";
  const cloudy = info.label === "くもり";

  if (rainy || lowPressure) {
    return "今日は気圧が低め。ゆっくり深呼吸して、早めの休息を意識してみましょう。";
  }
  if (cloudy) {
    return "光を少し浴びると気分転換に。こまめな水分補給も忘れずに。";
  }
  return "穏やかなお天気です。気持ち良い時間を上手に使ってリラックスを。";
}

const WeatherCard: React.FC<Props> = ({ data, error }) => {
  if (error) {
    return (
      <div className="bg-white/70 border border-white/20 rounded-card p-5 shadow-sm text-brandText space-y-2">
        <SectionTitle className="mb-1">お天気</SectionTitle>
        <div className="text-sm text-brandMuted">
          Weather unavailable: {error.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/70 border border-white/20 rounded-card p-5 shadow-sm text-brandText space-y-2">
        <SectionTitle className="mb-1">お天気</SectionTitle>
        <div className="text-sm text-brandMuted">天気を取得しています...</div>
      </div>
    );
  }

  const info = getWeatherInfo(data.condition);
  const advice = buildAdvice(data.condition, data.surface_pressure);
  const pressureStatus = interpretPressure(data.surface_pressure, data.pressureLevel);
  const cityLabel = "札幌市";

  return (
    <div className="bg-white/70 border border-white/20 rounded-card p-5 shadow-sm text-brandText space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{data.icon ?? info.emoji}</div>
        <div>
          <div className="text-sm text-brandMuted">{cityLabel}</div>
          <div className="text-lg font-semibold">{info.label}</div>
        </div>
      </div>

      <div className="flex items-baseline gap-4">
        <div className="text-3xl font-bold">{Math.round(data.temperature_2m)}°C</div>
        <div className="text-sm text-brandMuted">
          体感 {Math.round(data.apparent_temperature)}°C
        </div>
      </div>

      <div className="text-sm text-brandText flex items-center gap-2">
        <span className="px-2 py-1 bg-brandBubble rounded-full text-xs text-brandText">
          気圧 {Math.round(data.surface_pressure)} hPa
        </span>
        <span className="text-brandMuted">{pressureStatus}</span>
      </div>

      <div className="text-sm leading-normal text-brandText">{advice}</div>
    </div>
  );
};

export default WeatherCard;
