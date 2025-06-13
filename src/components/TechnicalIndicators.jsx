import React from "react";
import "./TechnicalIndicators.css";

const TechnicalIndicators = ({ indicators }) => {
  if (!indicators || Object.keys(indicators).length === 0) {
    return (
      <div className="technical-indicators">
        <h4>📈 Technical Indicators</h4>
        <p className="no-indicators">No technical indicators available</p>
      </div>
    );
  }

  const getIndicatorColor = (key, value) => {
    switch (key) {
      case "rsi":
        if (value > 70) return "#ef4444"; // Overbought - Red
        if (value < 30) return "#22c55e"; // Oversold - Green
        return "#3b82f6"; // Normal - Blue

      case "stochastic_k":
      case "stochastic_d":
        if (value > 80) return "#ef4444"; // Overbought
        if (value < 20) return "#22c55e"; // Oversold
        return "#3b82f6";

      case "bollinger_position":
        if (value > 0.8) return "#ef4444"; // Near upper band
        if (value < 0.2) return "#22c55e"; // Near lower band
        return "#3b82f6";

      case "macd":
        return value > 0 ? "#22c55e" : "#ef4444";

      case "momentum_5":
        return value > 1 ? "#22c55e" : "#ef4444";

      case "roc":
        return value > 0 ? "#22c55e" : "#ef4444";

      default:
        return "#6b7280";
    }
  };

  const getIndicatorStatus = (key, value) => {
    switch (key) {
      case "rsi":
        if (value > 70) return "Overbought";
        if (value < 30) return "Oversold";
        return "Normal";

      case "stochastic_k":
        if (value > 80) return "Overbought";
        if (value < 20) return "Oversold";
        return "Normal";

      case "bollinger_position":
        if (value > 0.8) return "Upper Band";
        if (value < 0.2) return "Lower Band";
        return "Middle Range";

      case "macd":
        return value > 0 ? "Bullish" : "Bearish";

      case "momentum_5":
        return value > 1 ? "Upward" : "Downward";

      case "roc":
        return value > 0 ? "Positive" : "Negative";

      default:
        return "";
    }
  };

  const formatValue = (key, value) => {
    if (typeof value !== "number") return "N/A";

    switch (key) {
      case "rsi":
      case "stochastic_k":
      case "stochastic_d":
        return value.toFixed(1);

      case "bollinger_position":
      case "price_position":
        return (value * 100).toFixed(1) + "%";

      case "momentum_5":
        return ((value - 1) * 100).toFixed(2) + "%";

      case "volume_ratio":
        return value.toFixed(2) + "x";

      case "roc":
        return value.toFixed(2) + "%";

      default:
        return value.toFixed(6);
    }
  };

  const getIndicatorName = (key) => {
    const names = {
      rsi: "RSI (14)",
      macd: "MACD",
      macd_signal: "MACD Signal",
      sma_10: "SMA 10",
      sma_20: "SMA 20",
      sma_50: "SMA 50",
      ema_12: "EMA 12",
      ema_26: "EMA 26",
      bollinger_position: "Bollinger Position",
      bollinger_width: "Bollinger Width",
      stochastic_k: "Stochastic %K",
      stochastic_d: "Stochastic %D",
      atr: "ATR",
      momentum_5: "Momentum (5)",
      roc: "ROC (12)",
      price_position: "Price Position",
      volume_ratio: "Volume Ratio",
    };
    return names[key] || key.replace(/_/g, " ").toUpperCase();
  };

  const getIndicatorDescription = (key) => {
    const descriptions = {
      rsi: "Relative Strength Index - momentum oscillator (0-100)",
      macd: "Moving Average Convergence Divergence - trend indicator",
      bollinger_position: "Position within Bollinger Bands (0-1)",
      stochastic_k: "Stochastic %K - momentum indicator (0-100)",
      atr: "Average True Range - volatility measure",
      momentum_5: "5-period momentum - price velocity",
      roc: "Rate of Change - price momentum over 12 periods",
    };
    return descriptions[key] || "";
  };

  // Group indicators by category
  const oscillators = [
    "rsi",
    "stochastic_k",
    "stochastic_d",
    "bollinger_position",
  ];
  const trendIndicators = [
    "macd",
    "macd_signal",
    "sma_10",
    "sma_20",
    "sma_50",
    "ema_12",
    "ema_26",
  ];
  const momentum = ["momentum_5", "roc"];
  const volatility = ["atr", "bollinger_width"];
  const volume = ["volume_ratio"];
  const other = ["price_position"];

  const renderIndicatorGroup = (title, keys, icon) => {
    const groupIndicators = keys.filter((key) => indicators[key] !== undefined);

    if (groupIndicators.length === 0) return null;

    return (
      <div className="indicator-group">
        <h5 className="group-title">
          <span className="group-icon">{icon}</span>
          {title}
        </h5>
        <div className="indicators-grid">
          {groupIndicators.map((key) => {
            const value = indicators[key];
            const color = getIndicatorColor(key, value);
            const status = getIndicatorStatus(key, value);

            return (
              <div
                key={key}
                className="indicator-item"
                style={{ borderLeftColor: color }}
              >
                <div className="indicator-header">
                  <span className="indicator-name">
                    {getIndicatorName(key)}
                  </span>
                  {status && (
                    <span className="indicator-status" style={{ color }}>
                      {status}
                    </span>
                  )}
                </div>
                <div className="indicator-value" style={{ color }}>
                  {formatValue(key, value)}
                </div>
                {getIndicatorDescription(key) && (
                  <div className="indicator-description">
                    {getIndicatorDescription(key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="technical-indicators">
      <h4>📈 Technical Indicators Analysis</h4>

      {renderIndicatorGroup("Oscillators", oscillators, "🌊")}
      {renderIndicatorGroup("Trend Indicators", trendIndicators, "📈")}
      {renderIndicatorGroup("Momentum", momentum, "⚡")}
      {renderIndicatorGroup("Volatility", volatility, "📊")}
      {renderIndicatorGroup("Volume", volume, "📦")}
      {renderIndicatorGroup("Price Position", other, "🎯")}
    </div>
  );
};

export default TechnicalIndicators;
