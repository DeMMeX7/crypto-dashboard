// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import CryptoCard from "./CryptoCard";
import "../styles/Dashboard.css";

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

function Dashboard() {
  const [cryptos, setCryptos] = useState([]);
  const [globalMarketData, setGlobalMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCryptos(data);

        const globalResponse = await fetch(
          "https://api.coingecko.com/api/v3/global"
        );
        if (!globalResponse.ok) {
          throw new Error(`HTTP error! status: ${globalResponse.status}`);
        }
        const globalData = await globalResponse.json();
        setGlobalMarketData(globalData.data);
      } catch (e) {
        setError(e);
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Help func for formatting numbers f.e market cap, volume
  const formatLargeNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1_000_000_000_000)
      return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    return num.toLocaleString();
  };

  if (loading) return <div className="dashboard-loading">Loading data...</div>;
  if (error)
    return (
      <div className="dashboard-error">
        Error: {error.message}. Please try again later.
      </div>
    );

  // Data for top gainers/losers

  const topGainers = [...cryptos]
    .sort(
      (a, b) =>
        (b.price_change_percentage_24h_in_currency || 0) -
        (a.price_change_percentage_24h_in_currency || 0)
    )
    .slice(0, 5); // Show top 5 gainers

  const topLosers = [...cryptos]
    .sort(
      (a, b) =>
        (a.price_change_percentage_24h_in_currency || 0) -
        (b.price_change_percentage_24h_in_currency || 0)
    )
    .slice(0, 5); // Show top 5 losers

  return (
    <div className="dashboard-container">
      {globalMarketData && (
        <div className="market-overview-card">
          <h2>Market Overview</h2>
          <div className="overview-grid">
            <div className="overview-item">
              <span>Total Market Cap:</span>
              <span className="value">
                ${formatLargeNumber(globalMarketData.total_market_cap.usd)}
              </span>
            </div>
            <div className="overview-item">
              <span>24h Volume:</span>
              <span className="value">
                ${formatLargeNumber(globalMarketData.total_volume.usd)}
              </span>
            </div>
            <div className="overview-item">
              <span>BTC Dominance:</span>
              <span className="value">
                {globalMarketData.market_cap_percentage.btc.toFixed(2)}%
              </span>
            </div>
            <div className="overview-item">
              <span>Active Cryptos:</span>
              <span className="value">
                {globalMarketData.active_cryptocurrencies.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <h2>Popular Cryptocurrencies</h2>
      <div className="crypto-list">
        {cryptos.map((crypto) => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>

      <div className="additional-sections-grid">
        <div className="additional-block">
          <h3>Top Gainers (24h)</h3>
          <ul className="performer-list">
            {topGainers.map((c) => (
              <li key={c.id + "-gain"} className="performer-item gain">
                <img src={c.image} alt={c.name} className="performer-icon" />
                <span className="name">{c.name}</span>
                <span className="percentage">
                  {(c.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="additional-block">
          <h3>Top Losers (24h)</h3>
          <ul className="performer-list">
            {topLosers.map((c) => (
              <li key={c.id + "-lose"} className="performer-item lose">
                <img src={c.image} alt={c.name} className="performer-icon" />
                <span className="name">{c.name}</span>
                <span className="percentage">
                  {(c.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
