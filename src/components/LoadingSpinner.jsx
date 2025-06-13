import React, { useState, useEffect } from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Fetching data...");

  const stages = [
    "Fetching market data...",
    "Calculating technical indicators...",
    "Preprocessing features...",
    "Training LSTM model...",
    "Generating predictions...",
    "Analyzing signals...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;

        // Update stage based on progress
        const stageIndex = Math.floor((newProgress / 100) * stages.length);
        if (stageIndex < stages.length) {
          setStage(stages[stageIndex]);
        }

        return Math.min(newProgress, 95); // Cap at 95% to avoid reaching 100%
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner-container">
          <div className="neural-network">
            <div className="node node-1"></div>
            <div className="node node-2"></div>
            <div className="node node-3"></div>
            <div className="node node-4"></div>
            <div className="connection con-1"></div>
            <div className="connection con-2"></div>
            <div className="connection con-3"></div>
            <div className="connection con-4"></div>
          </div>
        </div>

        <div className="loading-text">
          <h3>🧠 AI Model Training in Progress</h3>
          <p className="stage-text">{stage}</p>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.floor(progress)}%</span>
          </div>

          <div className="loading-stats">
            <div className="stat">
              <span className="stat-icon">📊</span>
              <span>Processing market data</span>
            </div>
            <div className="stat">
              <span className="stat-icon">⚡</span>
              <span>Training neural network</span>
            </div>
            <div className="stat">
              <span className="stat-icon">🎯</span>
              <span>Generating predictions</span>
            </div>
          </div>

          <div className="time-estimate">
            <p>⏱️ Estimated time: 30-120 seconds</p>
            <p className="tip">💡 Higher epochs = more accurate predictions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
