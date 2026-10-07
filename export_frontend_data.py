import pandas as pd
import numpy as np
import json
import os

print("Exporting project data for web frontend...")

# 1. Load notable AI models
df_models = pd.read_csv("data/notable_ai_models.csv")
print(f"Loaded {len(df_models)} models from notable_ai_models.csv")

# Parse publication date and extract year
df_models['Publication_date'] = df_models['Publication date'].fillna('')
df_models['Pub_Date_Parsed'] = pd.to_datetime(df_models['Publication date'], errors='coerce')
df_models['Pub_Year'] = df_models['Pub_Date_Parsed'].dt.year

# Process compute
df_models['Compute_FLOP'] = pd.to_numeric(df_models['Training compute (FLOP)'], errors='coerce')
df_models['Has_Compute'] = df_models['Compute_FLOP'].notna() & (df_models['Compute_FLOP'] > 0)
df_models['Log10_Compute'] = np.where(df_models['Has_Compute'], np.log10(df_models['Compute_FLOP']), np.nan)

# Process parameters
df_models['Parameters_Num'] = pd.to_numeric(df_models['Parameters'], errors='coerce')
df_models['Has_Parameters'] = df_models['Parameters_Num'].notna() & (df_models['Parameters_Num'] > 0)

# Build clean model list
models_list = []
for idx, row in df_models.iterrows():
    models_list.append({
        "id": int(idx) + 1,
        "model": str(row.get('Model', 'Unknown')),
        "organization": str(row.get('Organization', 'Unknown')) if pd.notna(row.get('Organization')) else 'Unknown',
        "publicationDate": str(row.get('Publication date', '')) if pd.notna(row.get('Publication date')) else '',
        "year": int(row['Pub_Year']) if pd.notna(row['Pub_Year']) else None,
        "parameters": float(row['Parameters_Num']) if pd.notna(row['Parameters_Num']) else None,
        "parametersStr": f"{row['Parameters_Num']:.2e}" if pd.notna(row['Parameters_Num']) else "N/A",
        "trainingComputeFLOP": float(row['Compute_FLOP']) if pd.notna(row['Compute_FLOP']) else None,
        "trainingComputeStr": f"{row['Compute_FLOP']:.2e}" if pd.notna(row['Compute_FLOP']) else "N/A",
        "log10Compute": round(float(row['Log10_Compute']), 4) if pd.notna(row['Log10_Compute']) else None,
        "frontierModel": bool(str(row.get('Frontier model', '')).strip().lower() in ['true', 'yes', '1']),
        "trainingHardware": str(row.get('Training hardware', '')) if pd.notna(row.get('Training hardware')) else 'Unknown',
        "domain": str(row.get('Domain', '')) if pd.notna(row.get('Domain')) else 'General',
        "task": str(row.get('Task', '')) if pd.notna(row.get('Task')) else '',
        "hasCompute": bool(row['Has_Compute']),
        "hasParameters": bool(row['Has_Parameters'])
    })

# 2. Yearly AI Compute & Counts
df_yearly = pd.read_csv("outputs/yearly_ai_compute.csv")
df_counts = pd.read_csv("outputs/yearly_model_counts.csv")
count_map = dict(zip(df_counts['Year'].astype(int), df_counts['Number of Models'].astype(int)))

yearly_list = []
for _, row in df_yearly.iterrows():
    yr = int(row['Year'])
    valid_compute_count = int(row['models_with_valid_compute'])
    total_models = count_map.get(yr, valid_compute_count)
    cov_pct = (valid_compute_count / total_models * 100.0) if total_models > 0 else 0.0

    # Linear trend fit: Y = -1156.0523 + 0.5828 * Year
    linear_fit = -1156.0523 + 0.5828 * yr
    # Quadratic fit: Y = 15.9728 + 0.3052*(yr - 2010) + 0.018502*(yr - 2010)^2
    t_val = yr - 2010
    quad_fit = 15.9728 + 0.3052 * t_val + 0.018502 * (t_val ** 2) if 2010 <= yr <= 2026 else None

    yearly_list.append({
        "year": yr,
        "validComputeCount": valid_compute_count,
        "totalModels": total_models,
        "coveragePct": round(float(cov_pct), 2),
        "medianLog10": round(float(row['median_log10_compute']), 4) if pd.notna(row['median_log10_compute']) else None,
        "meanLog10": round(float(row['mean_log10_compute']), 4) if pd.notna(row['mean_log10_compute']) else None,
        "stdLog10": round(float(row['std_log10_compute']), 4) if pd.notna(row['std_log10_compute']) else None,
        "minLog10": round(float(row['min_compute']), 4) if pd.notna(row['min_compute']) and row['min_compute'] > 0 else None,
        "maxLog10": round(float(row['max_compute']), 4) if pd.notna(row['max_compute']) and row['max_compute'] > 0 else None,
        "medianFLOP": float(row['median_training_compute']) if pd.notna(row['median_training_compute']) else None,
        "meanFLOP": float(row['mean_training_compute']) if pd.notna(row['mean_training_compute']) else None,
        "isPartial": bool(yr == 2026),
        "inModelingWindow": bool(2010 <= yr <= 2025),
        "linearFit": round(linear_fit, 4) if 2010 <= yr <= 2026 else None,
        "quadFit": round(quad_fit, 4) if quad_fit is not None else None
    })

# 3. Backtest Results
df_backtest = pd.read_csv("outputs/backtest_results.csv")
backtest_list = []
for _, row in df_backtest.iterrows():
    backtest_list.append({
        "model": str(row['Model']),
        "testYear": int(row['Test_Year']),
        "actual": round(float(row['Actual_Y_t']), 4),
        "predicted": round(float(row['Predicted_Y_t']), 4),
        "error": round(float(row['Error']), 4),
        "absoluteError": round(float(row['Absolute_Error']), 4),
        "squaredError": round(float(row['Squared_Error']), 4)
    })

# 4. Final Model Comparison
df_comp = pd.read_csv("outputs/final_model_comparison.csv")
comparison_list = []
for _, row in df_comp.iterrows():
    comparison_list.append({
        "model": str(row['Model']),
        "mae": round(float(row['Backtest_MAE']), 4),
        "rmse": round(float(row['Backtest_RMSE']), 4),
        "oosR2": round(float(row['OOS_R2']), 4),
        "error2026Partial": round(float(row['Error_2026_Partial']), 4),
        "forecast2030Log10": round(float(row['Forecast_2030_log10']), 4),
        "forecast2030FLOP": str(row['Forecast_2030_FLOP']),
        "behavior": str(row['Extrapolation_Behavior']),
        "comments": str(row['Comments'])
    })

# 5. Final Forecast 2027-2030
df_forecast = pd.read_csv("outputs/final_forecast_2027_2030.csv")
df_future = pd.read_csv("outputs/future_forecasts_2027_2030.csv")
holt_map = dict(zip(df_future['Year'].astype(int), df_future['Holt_Forecast_log10']))

forecast_list = []
for _, row in df_forecast.iterrows():
    yr = int(row['Year'])
    t_val = yr - 2010
    quad_val = 15.9728 + 0.3052 * t_val + 0.018502 * (t_val ** 2)
    # ARIMA(0,1,0)+drift from 2025 actual (24.6045) + (yr - 2025) * 0.63004
    arima_val = 24.6045 + (yr - 2025) * 0.63004

    forecast_list.append({
        "year": yr,
        "linearLog10": round(float(row['Predicted_log10_FLOP']), 4),
        "linearFLOP": float(row['Predicted_FLOP']),
        "linearFLOPStr": f"{float(row['Predicted_FLOP']):.2e}",
        "piLowerLog10": round(float(row['PI_Lower_95_log10']), 4),
        "piUpperLog10": round(float(row['PI_Upper_95_log10']), 4),
        "piLowerFLOP": float(row['PI_Lower_95_FLOP']),
        "piUpperFLOP": float(row['PI_Upper_95_FLOP']),
        "piLowerFLOPStr": f"{float(row['PI_Lower_95_FLOP']):.2e}",
        "piUpperFLOPStr": f"{float(row['PI_Upper_95_FLOP']):.2e}",
        "arima010Log10": round(arima_val, 4),
        "holtLog10": round(float(holt_map.get(yr, row['Predicted_log10_FLOP'])), 4),
        "quadLog10": round(quad_val, 4)
    })

# 6. Monthly Coverage Summary
monthly_summary = {
    "totalMonths": 915,
    "observedMonths": 193,
    "emptyMonths": 722,
    "missingPeriodsPct": 78.91,
    "medianModelsPerObservedMonth": 2.0
}

# Ensure destination directory exists
dest_dir = "frontend/src/data"
os.makedirs(dest_dir, exist_ok=True)

with open(os.path.join(dest_dir, "models.json"), "w") as f:
    json.dump(models_list, f, indent=2)

with open(os.path.join(dest_dir, "yearlyCompute.json"), "w") as f:
    json.dump(yearly_list, f, indent=2)

with open(os.path.join(dest_dir, "backtestResults.json"), "w") as f:
    json.dump(backtest_list, f, indent=2)

with open(os.path.join(dest_dir, "modelComparison.json"), "w") as f:
    json.dump(comparison_list, f, indent=2)

with open(os.path.join(dest_dir, "forecasts.json"), "w") as f:
    json.dump(forecast_list, f, indent=2)

with open(os.path.join(dest_dir, "monthlySummary.json"), "w") as f:
    json.dump(monthly_summary, f, indent=2)

print("Data exported successfully to frontend/src/data/")
