// src/pages/PredictionCenter.tsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, Play, Rocket } from 'lucide-react';

// Loading spinner
const Loader = () => (
  <div className="flex items-center gap-2 text-slate-500 mb-4">
    <RefreshCw className="animate-spin w-4 h-4" /> Loading prediction…
  </div>
);

// Mock data generator (used for demo & fallback)
const generateMockData = (category: string) => {
  const rand = (max: number, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    category,
    kpis: { current: rand(120, 80), projected: rand(150, 100), variance: rand(30, -20) },
    chartData: Array.from({ length: 12 }, () => rand(100, 20)),
    forecast: `${category} trend expected to ${rand(1) ? 'rise' : 'fall'} in next 12h.`,
    riskScore: rand(100) / 100,
    confidenceScore: (rand(95, 60) / 100),
    recommendation: `Adjust ${category.toLowerCase()} operations based on latest AI insight.`,
  };
};

export const PredictionCenter: React.FC = () => {
  const { predictionState, updatePrediction, addNotification } = useAppContext();
  const categories = ['Traffic', 'Flood', 'Power', 'Waste'];
  const [activeTab, setActiveTab] = useState<string>(categories[0]);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialise data for the active category if missing
  useEffect(() => {
    if (!predictionState[activeTab]) {
      const mock = generateMockData(activeTab);
      updatePrediction(activeTab, mock);
    }
  }, [activeTab, predictionState, updatePrediction]);

  const data = predictionState[activeTab];

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const mock = generateMockData(activeTab);
    updatePrediction(activeTab, mock);
    setLoading(false);
    addNotification({ message: `${activeTab} prediction refreshed.` });
  };

  const handleGenerateForecast = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const mock = generateMockData(activeTab);
    updatePrediction(activeTab, mock);
    setLoading(false);
    addNotification({ message: `${activeTab} forecast generated.` });
  };

  const handleDeployRecommendation = () => {
    if (!data) return;
    addNotification({ message: `${activeTab} recommendation deployed to operations dashboard.` });
  };

  // Simple bar‑style chart using divs – smooth transition via Tailwind utilities
  const Chart = () => (
    <div className="flex items-end gap-1 h-32 bg-slate-100 dark:bg-slate-800 rounded p-2 transition-all duration-500">
      {data?.chartData?.map((val, i) => (
        <div
          key={i}
          className="bg-blue-500 dark:bg-blue-400 rounded-sm"
          style={{ height: `${val}%`, width: '8%' }}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded transition-colors ${cat === activeTab ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Prediction
        </button>
        <button
          onClick={handleGenerateForecast}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          <Play className="w-4 h-4" /> Generate Forecast
        </button>
        <button
          onClick={handleDeployRecommendation}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
        >
          <Rocket className="w-4 h-4" /> Deploy Recommendation
        </button>
      </div>

      {loading && <Loader />}

      {data && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
              <h4 className="text-sm font-medium text-slate-500">Current KPI</h4>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{data.kpis.current}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
              <h4 className="text-sm font-medium text-slate-500">Projected KPI</h4>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{data.kpis.projected}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
              <h4 className="text-sm font-medium text-slate-500">Variance</h4>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{data.kpis.variance}</p>
            </div>
          </div>

          {/* Chart */}
          <div>
            <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Forecast Chart</h4>
            <Chart />
          </div>

          {/* Scores */}
          <div className="flex gap-6">
            <div className="flex-1 p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
              <h4 className="text-sm font-medium text-slate-500">Risk Score</h4>
              <p className="text-2xl font-bold text-red-600">{(data.riskScore * 100).toFixed(0)}%</p>
            </div>
            <div className="flex-1 p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
              <h4 className="text-sm font-medium text-slate-500">Confidence</h4>
              <p className="text-2xl font-bold text-green-600">{(data.confidenceScore * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
            <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">AI Recommendation</h4>
            <p className="text-slate-800 dark:text-slate-200">{data.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionCenter;
