import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./PredictionChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PredictionChart = ({ prediction }) => {
  if (!prediction) return null;

  // Generate mock historical data for visualization
  const generateHistoricalData = () => {
    const points = 30;
    const data = [];
    const current = prediction.current_price;
    const volatility = current * 0.005; // 0.5% volatility

    for (let i = points; i >= 0; i--) {
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = current + randomChange * (i / points);
      data.push(price);
    }

    // Add the predicted price
    data.push(prediction.predicted_price);

    return data;
  };

  const historicalData = generateHistoricalData();
  const labels = [
    ...Array(31)
      .fill(0)
      .map((_, i) => `T-${30 - i}`),
    "Predicted",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Historical Price",
        data: historicalData.slice(0, -1),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Current Price",
        data: [...Array(30).fill(null), prediction.current_price],
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false,
        pointStyle: "circle",
      },
      {
        label: "Predicted Price",
        data: [...Array(31).fill(null), prediction.predicted_price],
        borderColor: prediction.change > 0 ? "#22c55e" : "#ef4444",
        backgroundColor: prediction.change > 0 ? "#22c55e" : "#ef4444",
        pointRadius: 10,
        pointHoverRadius: 12,
        showLine: false,
        pointStyle: "triangle",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      title: {
        display: true,
        text: `${prediction.symbol.replace("=X", "")} Price Prediction`,
        font: {
          size: 16,
          weight: "700",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function (context) {
            const label = context[0].label;
            if (label === "Predicted") {
              return "Prediction";
            }
            return label;
          },
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(5);
            }
            return label;
          },
          afterBody: function (context) {
            const dataIndex = context[0].dataIndex;
            if (dataIndex === 31) {
              // Predicted price
              const change = prediction.change;
              const changePercent = prediction.change_percent;
              return [
                `Change: ${change > 0 ? "+" : ""}${change.toFixed(5)}`,
                `Percentage: ${
                  changePercent > 0 ? "+" : ""
                }${changePercent.toFixed(2)}%`,
                `Confidence: ${prediction.confidence}%`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(5);
          },
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const getPredictionSummary = () => {
    const change = prediction.change;
    const changePercent = prediction.change_percent;
    const isPositive = change > 0;

    return {
      direction: isPositive ? "upward" : "downward",
      color: isPositive ? "#22c55e" : "#ef4444",
      icon: isPositive ? "📈" : "📉",
      magnitude: Math.abs(changePercent) > 1 ? "significant" : "moderate",
    };
  };

  const summary = getPredictionSummary();

  return (
    <div className="prediction-chart">
      <div className="chart-header">
        <h4>📊 Price Prediction Visualization</h4>
        <div className="prediction-summary">
          <span className="summary-icon">{summary.icon}</span>
          <span className="summary-text" style={{ color: summary.color }}>
            {summary.direction.charAt(0).toUpperCase() +
              summary.direction.slice(1)}{" "}
            movement expected
          </span>
          <span className="summary-magnitude">
            ({summary.magnitude} change)
          </span>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>

      <div className="chart-footer">
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Timeframe:</span>
            <span className="stat-value">{prediction.timeframe}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Model Confidence:</span>
            <span className="stat-value">{prediction.confidence}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Training Data:</span>
            <span className="stat-value">{prediction.data_points} points</span>
          </div>
        </div>

        <div className="prediction-details">
          <div className="detail-row">
            <span>Expected Move:</span>
            <span className={prediction.change > 0 ? "positive" : "negative"}>
              {prediction.change > 0 ? "+" : ""}
              {prediction.change.toFixed(5)}(
              {prediction.change_percent > 0 ? "+" : ""}
              {prediction.change_percent.toFixed(2)}%)
            </span>
          </div>
          <div className="detail-row">
            <span>Signal Strength:</span>
            <span className={`strength-${summary.magnitude}`}>
              {summary.magnitude.charAt(0).toUpperCase() +
                summary.magnitude.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
