import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ForexDashboard.css";
import TechnicalIndicators from "./TechnicalIndicators";
import PredictionChart from "./PredictionChart";
import LoadingSpinner from "./LoadingSpinner";

const ForexDashboard = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [indicators, setIndicators] = useState({});
  const [progress, setProgress] = useState("");

  // Form state with cloud-optimized defaults
  const [formData, setFormData] = useState({
    symbol: "EURUSD=X",
    timeframe: "1d",
    period: "3mo", // Reduced from 1y
    look_back: 30, // Reduced from 60
    epochs: 8, // Reduced from 10
    feature_set: "basic", // Changed from standard
  });

  const API_BASE = "https://trading-bot-595h.onrender.com";

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pairsRes, indicatorsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/pairs`),
          axios.get(`${API_BASE}/api/indicators`),
        ]);
        setPairs(pairsRes.data);
        setIndicators(indicatorsRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError(
          "Failed to connect to API. Please check your internet connection."
        );
      }
    };

    fetchInitialData();
  }, []);

  // Log formData changes for debugging
  useEffect(() => {
    console.log("📊 FormData updated:", formData);
  }, [formData]);

  // Main prediction function with extended timeout
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setProgress("Connecting to server...");

    // LOG THE REQUEST DATA
    console.log("🚀 Sending request to:", `${API_BASE}/api/predict`);
    console.log("📤 Request data:", formData);
    console.log("🌐 API_BASE:", API_BASE);

    try {
      const response = await axios.post(`${API_BASE}/api/predict`, formData, {
        timeout: 600000, // 10 minutes
        headers: {
          "Content-Type": "application/json",
        },
        onUploadProgress: () => setProgress("Sending request..."),
        onDownloadProgress: () => setProgress("Processing prediction..."),
      });

      console.log("✅ Response received:", response.data);
      setProgress("Finalizing results...");

      if (response.data.success) {
        setPrediction(response.data);
        setProgress("");
      } else {
        setError(response.data.error || "Prediction failed");
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      console.error("❌ Error response:", err.response?.data);
      setProgress("");

      if (err.code === "ECONNABORTED") {
        setError(
          `Request timeout after ${Math.round(
            600000 / 1000 / 60
          )} minutes. Try reducing epochs to 5 or using 'basic' feature set.`
        );
      } else if (err.response) {
        setError(err.response.data?.error || "Server error");
      } else {
        setError("Connection failed: " + err.message);
      }
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  // Ultra-fast prediction with minimal parameters
  const handleUltraQuickPredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setProgress("Running ultra-fast analysis...");

    const quickParams = {
      symbol: formData.symbol,
      timeframe: "1d",
      period: "1mo",
      look_back: 15,
      epochs: 3,
      feature_set: "basic",
    };

    console.log("⚡ Ultra-quick prediction params:", quickParams);

    try {
      const response = await axios.post(
        `${API_BASE}/api/predict`,
        quickParams,
        {
          timeout: 60000, // 1 minute for ultra-quick
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error("⚡ Ultra-quick prediction failed:", err);
      if (err.code === "ECONNABORTED") {
        setError(
          "Even the quick prediction timed out. Server may be overloaded."
        );
      } else {
        setError(
          "Ultra-quick prediction failed: " +
            (err.response?.data?.error || err.message)
        );
      }
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  // Quick prediction for specific pairs
  const handleQuickPredict = async (symbol) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setProgress(`Quick analysis for ${symbol}...`);

    try {
      const response = await axios.get(`${API_BASE}/api/predict/${symbol}`, {
        timeout: 120000, // 2 minutes for quick predictions
      });

      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(`Quick prediction failed for ${symbol}:`, err);
      setError(
        `Quick prediction failed for ${symbol}: ` +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  // Helper functions
  const getSignalColor = (signal) => {
    switch (signal) {
      case "BUY":
        return "#22c55e";
      case "SELL":
        return "#ef4444";
      case "HOLD":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case "BUY":
        return "📈";
      case "SELL":
        return "📉";
      case "HOLD":
        return "⏸️";
      default:
        return "❓";
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 80) return "Very High";
    if (confidence >= 60) return "High";
    if (confidence >= 40) return "Medium";
    if (confidence >= 20) return "Low";
    return "Very Low";
  };

  const getEstimatedTime = () => {
    const { epochs, look_back, feature_set } = formData;
    let baseTime = 2; // Base 2 minutes

    if (epochs > 15) baseTime += 3;
    if (look_back > 50) baseTime += 2;
    if (feature_set === "comprehensive") baseTime += 4;
    if (feature_set === "advanced") baseTime += 2;

    return `${baseTime}-${baseTime + 3} minutes`;
  };

  return (
    <div className="forex-dashboard">
      {/* Header */}
      <div className="header">
        <h1>🤖 Enhanced LSTM Forex Predictor</h1>
        <p>
          AI-powered currency trading signals with advanced technical analysis
        </p>
        <div className="api-status">
          <span
            className={`status-dot ${pairs.length > 0 ? "online" : "offline"}`}
          ></span>
          API Status: {pairs.length > 0 ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Control Panel */}
        <div className="control-panel">
          <h2>⚙️ Trading Parameters</h2>

          {/* Timing Information */}
          <div className="timing-info">
            <h4>⏱️ Processing Time Estimates</h4>
            <div className="timing-options">
              <div className="timing-option">
                <strong>Ultra-Fast:</strong> 30-60 seconds
                <br />
                <small>Basic analysis, 3 epochs, limited accuracy</small>
              </div>
              <div className="timing-option">
                <strong>Current Settings:</strong> {getEstimatedTime()}
                <br />
                <small>Based on your selected parameters</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>💱 Market Selection</h3>
            <div className="form-group">
              <label>Currency Pair:</label>
              <select
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
              >
                {pairs.map((pair) => (
                  <option key={pair.symbol} value={pair.symbol}>
                    {pair.name} ({pair.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Timeframe:</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) =>
                    setFormData({ ...formData, timeframe: e.target.value })
                  }
                >
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                  <option value="1wk">1 Week</option>
                </select>
              </div>

              <div className="form-group">
                <label>Period:</label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                >
                  <option value="1mo">1 Month (Fast)</option>
                  <option value="3mo">3 Months (Recommended)</option>
                  <option value="6mo">6 Months</option>
                  <option value="1y">1 Year (Slow)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>🔧 Technical Analysis</h3>
            <div className="form-group">
              <label>Feature Set:</label>
              <select
                value={formData.feature_set}
                onChange={(e) =>
                  setFormData({ ...formData, feature_set: e.target.value })
                }
              >
                <option value="basic">Basic (4 indicators) - Fast</option>
                <option value="standard">Standard (7 indicators)</option>
                <option value="advanced">Advanced (9 indicators) - Slow</option>
                <option value="comprehensive">
                  Comprehensive (17+ indicators) - Very Slow
                </option>
              </select>
            </div>

            {indicators[formData.feature_set] && (
              <div className="feature-preview">
                <small>
                  Features: {indicators[formData.feature_set].join(", ")}
                </small>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>🧠 Model Settings</h3>
            <div className="form-group">
              <label>Look-back Periods: {formData.look_back}</label>
              <input
                type="range"
                min="10"
                max="100" // Reduced from 200
                value={formData.look_back}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    look_back: parseInt(e.target.value),
                  })
                }
              />
              <div className="range-labels">
                <span>10 (Fast)</span>
                <span>100 (Slow)</span>
              </div>
            </div>

            <div className="form-group">
              <label>Training Epochs: {formData.epochs}</label>
              <input
                type="range"
                min="3"
                max="20" // Reduced from 50
                value={formData.epochs}
                onChange={(e) =>
                  setFormData({ ...formData, epochs: parseInt(e.target.value) })
                }
              />
              <div className="range-labels">
                <span>3 (Fast)</span>
                <span>20 (Accurate)</span>
              </div>
            </div>
          </div>

          {/* Prediction Buttons */}
          <div className="prediction-buttons">
            <button
              className="ultra-quick-btn"
              onClick={handleUltraQuickPredict}
              disabled={loading}
              style={{
                backgroundColor: "#10b981",
                marginBottom: "10px",
                width: "100%",
              }}
            >
              {loading ? "⚡ Processing..." : "⚡ Ultra-Quick (1 min)"}
            </button>

            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading
                ? `🔄 ${progress || "Training Model..."}`
                : `🚀 Full Analysis (${getEstimatedTime()})`}
            </button>
          </div>

          <div className="quick-actions">
            <h3>⚡ Quick Pair Analysis</h3>
            <div className="quick-buttons">
              <button
                onClick={() => handleQuickPredict("EURUSD")}
                disabled={loading}
              >
                EUR/USD
              </button>
              <button
                onClick={() => handleQuickPredict("GBPUSD")}
                disabled={loading}
              >
                GBP/USD
              </button>
              <button
                onClick={() => handleQuickPredict("USDJPY")}
                disabled={loading}
              >
                USD/JPY
              </button>
              <button
                onClick={() => handleQuickPredict("BTCUSD")}
                disabled={loading}
              >
                BTC/USD
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <h2>📊 Analysis Results</h2>

          {error && (
            <div className="error-card">
              <h3>❌ Error</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={() => setError(null)}>Dismiss</button>
                <button onClick={handleUltraQuickPredict} disabled={loading}>
                  Try Ultra-Quick
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <LoadingSpinner />
              <p>{progress || "Training AI model..."}</p>
              <small>
                {progress.includes("ultra-fast")
                  ? "This should complete in under 1 minute"
                  : `Estimated time: ${getEstimatedTime()}`}
              </small>
              <div className="loading-tips">
                <p>
                  <strong>💡 Tips while waiting:</strong>
                </p>
                <ul>
                  <li>Lower epochs (3-8) for faster results</li>
                  <li>Use "Basic" feature set for speed</li>
                  <li>Shorter periods (1-3 months) process faster</li>
                </ul>
              </div>
            </div>
          )}

          {prediction && !loading && (
            <div className="prediction-results">
              {/* Main Signal Card */}
              <div
                className="main-signal"
                style={{ borderColor: getSignalColor(prediction.signal) }}
              >
                <div className="signal-header">
                  <span className="signal-icon">
                    {getSignalIcon(prediction.signal)}
                  </span>
                  <div className="signal-info">
                    <span
                      className="signal-text"
                      style={{ color: getSignalColor(prediction.signal) }}
                    >
                      {prediction.signal}
                    </span>
                    <span className="pair-name">
                      {prediction.symbol.replace("=X", "")}
                    </span>
                  </div>
                  <div className="confidence-badge">
                    <span className="confidence-value">
                      {prediction.confidence}%
                    </span>
                    <span className="confidence-level">
                      {getConfidenceLevel(prediction.confidence)}
                    </span>
                  </div>
                </div>

                {prediction.confirmations &&
                  prediction.confirmations.length > 0 && (
                    <div className="confirmations">
                      <strong>Confirmations:</strong>
                      <div className="confirmation-tags">
                        {prediction.confirmations.map((conf, idx) => (
                          <span key={idx} className="confirmation-tag">
                            {conf.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Price Information */}
              <div className="price-info">
                <div className="price-card">
                  <h4>Current Price</h4>
                  <p className="price">{prediction.current_price}</p>
                </div>
                <div className="price-card">
                  <h4>Predicted Price</h4>
                  <p className="price">{prediction.predicted_price}</p>
                </div>
                <div className="price-card">
                  <h4>Expected Change</h4>
                  <p
                    className={`change ${
                      prediction.change > 0 ? "positive" : "negative"
                    }`}
                  >
                    {prediction.change > 0 ? "+" : ""}
                    {prediction.change}
                  </p>
                  <p
                    className={`change-percent ${
                      prediction.change_percent > 0 ? "positive" : "negative"
                    }`}
                  >
                    ({prediction.change_percent > 0 ? "+" : ""}
                    {prediction.change_percent}%)
                  </p>
                </div>
              </div>

              {/* Technical Indicators */}
              <TechnicalIndicators
                indicators={prediction.technical_indicators}
              />

              {/* Prediction Chart */}
              <PredictionChart prediction={prediction} />

              {/* Model Information */}
              <div className="model-info">
                <h4>🧠 Model Performance</h4>
                <div className="model-stats">
                  <div className="stat">
                    <span>Data Points:</span>
                    <span>{prediction.data_points}</span>
                  </div>
                  <div className="stat">
                    <span>Training Samples:</span>
                    <span>{prediction.training_samples}</span>
                  </div>
                  <div className="stat">
                    <span>Features Used:</span>
                    <span>{prediction.features_used}</span>
                  </div>
                  <div className="stat">
                    <span>Feature Set:</span>
                    <span>{prediction.feature_set}</span>
                  </div>
                  <div className="stat">
                    <span>Timeframe:</span>
                    <span>{prediction.timeframe}</span>
                  </div>
                  <div className="stat">
                    <span>Generated:</span>
                    <span>
                      {new Date(prediction.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {prediction.model_performance?.cloud_optimized && (
                    <div className="stat">
                      <span>Mode:</span>
                      <span>Cloud Optimized ☁️</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!prediction && !loading && !error && (
            <div className="welcome-card">
              <h3>👋 Welcome to Enhanced Forex Analysis</h3>
              <p>
                Select your trading parameters and choose your analysis speed:
              </p>
              <div className="features-list">
                <div className="feature">⚡ Ultra-Quick: 30-60 seconds</div>
                <div className="feature">🚀 Full Analysis: 2-10 minutes</div>
                <div className="feature">✅ LSTM Neural Networks</div>
                <div className="feature">✅ 20+ Technical Indicators</div>
                <div className="feature">✅ Signal Confirmations</div>
                <div className="feature">✅ Multiple Timeframes</div>
              </div>

              <div className="welcome-tips">
                <h4>💡 Pro Tips:</h4>
                <ul>
                  <li>Start with "Ultra-Quick" to test the system</li>
                  <li>Use "Basic" feature set for faster processing</li>
                  <li>Lower epochs (3-8) for development/testing</li>
                  <li>Full analysis gives more accurate predictions</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>
          ⚠️ This tool is for educational purposes only. Always do your own
          research before trading.
        </p>
      </div>
    </div>
  );
};

export default ForexDashboard;
