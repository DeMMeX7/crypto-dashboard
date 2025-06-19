// src/components/CryptoCard.js
import React from "react";
import "../styles/CryptoCard.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CryptoCard({ crypto }) {
  const priceChange24h = crypto.price_change_percentage_24h_in_currency;
  const priceChange7d = crypto.price_change_percentage_7d_in_currency;
  const isPositive24h = priceChange24h >= 0;
  const isPositive7d = priceChange7d >= 0;

  const formatMarketCap = (num) => {
    if (!num) return "N/A";
    if (num >= 1_000_000_000_000)
      return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    return num.toLocaleString();
  };

  const generateSparklineLabels = () => {
    const labels = [];
    const now = new Date();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < crypto.sparkline_in_7d.price.length; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 60 * 60 * 1000);
      labels.push(date);
    }
    return labels;
  };

  const chartData = {
    labels: generateSparklineLabels(),
    datasets: [
      {
        data: crypto.sparkline_in_7d.price,
        borderColor: isPositive24h ? "#00e676" : "#ff1744",
        borderWidth: 1.5,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(
            0,
            isPositive24h ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 23, 68, 0.1)"
          );
          gradient.addColorStop(
            1,
            isPositive24h ? "rgba(0, 230, 118, 0.0)" : "rgba(255, 23, 68, 0.0)"
          );
          return gradient;
        },
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        displayColors: false,
        callbacks: {
          title: function (tooltipItems) {
            if (tooltipItems.length > 0) {
              const date = new Date(tooltipItems[0].label);
              return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
            return "";
          },

          label: function (context) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
        backgroundColor: "rgba(30, 30, 30, 0.8)",
        titleColor: "#e0e0e0",
        bodyColor: "#e0e0e0",
        borderColor: "#555",
        borderWidth: 1,
        caretPadding: 10,
        xAlign: "center",
        yAlign: "bottom",
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: {
        tension: 0.3,
      },
    },
    hover: {
      mode: "nearest",
      intersect: false,
    },
  };
  // --- Конец изменений для графика ---

  return (
    <div className="crypto-card">
      <div className="card-header">
        <img src={crypto.image} alt={crypto.name} className="crypto-icon" />
        <div className="crypto-info">
          <h3 className="crypto-name">{crypto.name}</h3>
          <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span>
        </div>
        <p className="crypto-rank">#{crypto.market_cap_rank}</p>
      </div>
      <div className="card-price-section">
        <p className="current-price">${crypto.current_price.toFixed(2)}</p>
        <div
          className={`price-change ${isPositive24h ? "positive" : "negative"}`}
        >
          {priceChange24h ? priceChange24h.toFixed(2) : "0.00"}%
        </div>
      </div>

      <div className="card-chart-container">
        {crypto.sparkline_in_7d && crypto.sparkline_in_7d.price.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p className="no-chart-data">No chart data available</p>
        )}
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Market Cap:</span>
          <span className="detail-value">
            ${formatMarketCap(crypto.market_cap)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">24h Volume:</span>
          <span className="detail-value">
            ${formatMarketCap(crypto.total_volume)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">7d Change:</span>
          <span
            className={`detail-value ${isPositive7d ? "positive" : "negative"}`}
          >
            {priceChange7d ? priceChange7d.toFixed(2) : "0.00"}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default CryptoCard;
