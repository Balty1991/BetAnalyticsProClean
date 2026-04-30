const DATA_FILES = {
  predictions: 'predictions.json',
  recommendationLog: 'recommendation_log.json',
  proIntelligence: 'pro_intelligence.json',
  clvTracker: 'clv_tracker.json',
  modelQuality: 'model_quality.json',
  modelBenchmarks: 'model_benchmarks.json',
  predictionTypeHistory: 'prediction_type_history.json',
  trainingInsights: 'training_insights.json',
  trainingModelSummary: 'training_model_summary.json',
  trainingMarketBaselines: 'training_market_baselines.json',
  fullHistoryMeta: 'full_history_meta.json'
};

function dataUrl(fileName) {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}data/${fileName}`;
}

async function fetchJson(fileName, fallback) {
  const response = await fetch(dataUrl(fileName), { cache: 'no-store' });
  if (!response.ok) return fallback;
  return response.json();
}

export async function loadAppData() {
  const arrayFallbackFiles = new Set([
    'predictions.json',
    'recommendation_log.json',
    'training_insights.json',
    'training_market_baselines.json'
  ]);

  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, file]) => {
      const fallback = arrayFallbackFiles.has(file) ? [] : {};
      try {
        return [key, await fetchJson(file, fallback)];
      } catch {
        return [key, fallback];
      }
    })
  );

  return Object.fromEntries(entries);
}
