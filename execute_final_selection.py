import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy import stats
from statsmodels.tsa.holtwinters import Holt
from statsmodels.tsa.arima.model import ARIMA

# Styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.titleweight'] = 'bold'
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['axes.labelweight'] = 'semibold'

os.makedirs('outputs', exist_ok=True)
os.makedirs('graphs', exist_ok=True)
os.makedirs('report', exist_ok=True)
os.makedirs('notebooks', exist_ok=True)

# 1. Load data
yearly_df = pd.read_csv('outputs/yearly_ai_compute.csv')
train_df = yearly_df[(yearly_df['Year'] >= 2010) & (yearly_df['Year'] <= 2025)].copy()
x_train = train_df['Year'].values
y_train = train_df['median_log10_compute'].values
n_train = len(x_train)

actual_2026 = yearly_df.loc[yearly_df['Year'] == 2026, 'median_log10_compute'].values[0]

# 2. 7-Fold Rolling Chronological Backtest (2019-2025)
test_years = list(range(2019, 2026)) # 7 folds
models_to_test = [
    'Naive', 'Linear Trend', 'Quadratic Trend', 
    'Holt Linear Trend', 'ARIMA(0,1,0)+drift', 'ARIMA(1,1,0)+drift'
]

backtest_7f_records = []
yearly_series = yearly_df.set_index('Year')['median_log10_compute']

for ty in test_years:
    train_sub = yearly_series.loc[2010:ty-1]
    y_act = yearly_series.loc[ty]
    
    # 1. Naive
    p_naive = train_sub.iloc[-1]
    
    # 2. Linear
    s_tr, int_tr, _, _, _ = stats.linregress(train_sub.index.values, train_sub.values)
    p_lin = int_tr + s_tr * ty
    
    # 3. Quadratic
    tc_tr = train_sub.index.values - 2010
    tc_val = ty - 2010
    q_poly = np.polyfit(tc_tr, train_sub.values, 2)
    p_quad = np.polyval(q_poly, tc_val)
    
    # 4. Holt Linear Trend
    h_fit = Holt(train_sub.values, initialization_method='estimated').fit()
    p_holt = h_fit.forecast(1)[0]
    
    # 5. ARIMA(0,1,0) with drift
    ar010 = ARIMA(train_sub.values, order=(0,1,0), trend='t').fit()
    p_ar010 = ar010.forecast(1)[0]
    
    # 6. ARIMA(1,1,0) with drift
    ar110 = ARIMA(train_sub.values, order=(1,1,0), trend='t').fit()
    p_ar110 = ar110.forecast(1)[0]
    
    preds_dict = {
        'Naive': p_naive,
        'Linear Trend': p_lin,
        'Quadratic Trend': p_quad,
        'Holt Linear Trend': p_holt,
        'ARIMA(0,1,0)+drift': p_ar010,
        'ARIMA(1,1,0)+drift': p_ar110
    }
    
    for m_name in models_to_test:
        pred_val = preds_dict[m_name]
        err = y_act - pred_val
        backtest_7f_records.append({
            'Model': m_name,
            'Test_Year': ty,
            'Actual_Y_t': y_act,
            'Predicted_Y_t': pred_val,
            'Error': err,
            'Absolute_Error': abs(err),
            'Squared_Error': err**2
        })

backtest_7f_df = pd.DataFrame(backtest_7f_records)
backtest_7f_df.to_csv('outputs/backtest_results.csv', index=False)

# Metrics calculation
y_act_vals = backtest_7f_df[backtest_7f_df['Model'] == 'Naive']['Actual_Y_t'].values
ss_tot_bt = np.sum((y_act_vals - np.mean(y_act_vals))**2)

# Full fits on 2010-2025 for 2026 prediction and 2030 forecast
s_full, int_full, r_full, _, se_full = stats.linregress(x_train, y_train)
p2_full = np.polyfit(x_train - 2010, y_train, 2)
holt_full = Holt(y_train, initialization_method='estimated').fit()
ar010_full = ARIMA(y_train, order=(0,1,0), trend='t').fit()
ar110_full = ARIMA(y_train, order=(1,1,0), trend='t').fit()

p2026_dict = {
    'Naive': y_train[-1],
    'Linear Trend': int_full + s_full * 2026,
    'Quadratic Trend': np.polyval(p2_full, 2026 - 2010),
    'Holt Linear Trend': holt_full.forecast(1)[0],
    'ARIMA(0,1,0)+drift': ar010_full.forecast(1)[0],
    'ARIMA(1,1,0)+drift': ar110_full.forecast(1)[0]
}

p2030_dict = {
    'Naive': y_train[-1],
    'Linear Trend': int_full + s_full * 2030,
    'Quadratic Trend': np.polyval(p2_full, 2030 - 2010),
    'Holt Linear Trend': holt_full.forecast(5)[-1],
    'ARIMA(0,1,0)+drift': ar010_full.forecast(5)[-1],
    'ARIMA(1,1,0)+drift': ar110_full.forecast(5)[-1]
}

extrap_behavior_dict = {
    'Naive': 'Flat (Zero growth)',
    'Linear Trend': 'Linear in log-space (Orderly compounding)',
    'Quadratic Trend': 'Explosive quadratic acceleration',
    'Holt Linear Trend': 'Dynamic smoothed linear drift',
    'ARIMA(0,1,0)+drift': 'Constant differenced drift (+0.63/yr)',
    'ARIMA(1,1,0)+drift': 'Damped autoregressive drift'
}

comments_dict = {
    'Naive': 'Reference baseline; fails to capture empirical compute expansion.',
    'Linear Trend': 'SELECTED PRIMARY: Best 2026 partial prediction, stable long-range extrapolation, robust 14 df.',
    'Quadratic Trend': 'Severely unstable in 7-fold backtest (RMSE=1.209); projects implausible 10^29.5 FLOP by 2030.',
    'Holt Linear Trend': 'Strong dynamic baseline; adapts to recent slope but sensitive to small sample plateaus.',
    'ARIMA(0,1,0)+drift': 'Lowest 7-fold backtest RMSE (0.824); over-projects partial 2026 snapshot by 0.58 dex.',
    'ARIMA(1,1,0)+drift': 'AR(1) parameter statistically insignificant (p=0.395); over-parameterized for N=15 df.'
}

comparison_rows = []
for m_name in models_to_test:
    sub = backtest_7f_df[backtest_7f_df['Model'] == m_name]
    mae = sub['Absolute_Error'].mean()
    rmse = np.sqrt(sub['Squared_Error'].mean())
    ss_res = sub['Squared_Error'].sum()
    oos_r2 = 1 - ss_res / ss_tot_bt
    err_2026 = actual_2026 - p2026_dict[m_name]
    fc_2030 = p2030_dict[m_name]
    
    comparison_rows.append({
        'Model': m_name,
        'Backtest_MAE': round(mae, 4),
        'Backtest_RMSE': round(rmse, 4),
        'OOS_R2': round(oos_r2, 4),
        'Error_2026_Partial': round(err_2026, 4),
        'Forecast_2030_log10': round(fc_2030, 4),
        'Forecast_2030_FLOP': f"{10**fc_2030:.2e}",
        'Extrapolation_Behavior': extrap_behavior_dict[m_name],
        'Comments': comments_dict[m_name]
    })

comparison_df = pd.DataFrame(comparison_rows)
comparison_df.to_csv('outputs/final_model_comparison.csv', index=False)
print("=== FINAL MODEL COMPARISON TABLE (SAVED TO outputs/final_model_comparison.csv) ===")
print(comparison_df[['Model', 'Backtest_MAE', 'Backtest_RMSE', 'OOS_R2', 'Error_2026_Partial', 'Forecast_2030_log10', 'Extrapolation_Behavior']].to_string(index=False))

# 3. Final Forecast for Selected Model (Linear Trend OLS)
future_years = [2027, 2028, 2029, 2030]
x_bar = np.mean(x_train)
ss_xx = np.sum((x_train - x_bar)**2)
res_lin = y_train - (int_full + s_full * x_train)
se_res_lin = np.sqrt(np.sum(res_lin**2) / (n_train - 2))
t_crit_95 = stats.t.ppf(0.975, df=n_train - 2)

final_forecast_records = []
for yf in future_years:
    y_pred_lin = int_full + s_full * yf
    se_pred = se_res_lin * np.sqrt(1 + 1/n_train + (yf - x_bar)**2 / ss_xx)
    pi_low = y_pred_lin - t_crit_95 * se_pred
    pi_high = y_pred_lin + t_crit_95 * se_pred
    
    final_forecast_records.append({
        'Year': yf,
        'Selected_Model': 'Linear Trend (OLS)',
        'Predicted_log10_FLOP': round(y_pred_lin, 4),
        'PI_Lower_95_log10': round(pi_low, 4),
        'PI_Upper_95_log10': round(pi_high, 4),
        'Predicted_FLOP': 10**y_pred_lin,
        'PI_Lower_95_FLOP': 10**pi_low,
        'PI_Upper_95_FLOP': 10**pi_high
    })

final_forecast_df = pd.DataFrame(final_forecast_records)
final_forecast_df.to_csv('outputs/final_forecast_2027_2030.csv', index=False)
print("\n=== FINAL FORECASTS (2027-2030) SAVED TO outputs/final_forecast_2027_2030.csv ===")
print(final_forecast_df[['Year', 'Predicted_log10_FLOP', 'PI_Lower_95_log10', 'PI_Upper_95_log10', 'Predicted_FLOP']].to_string(index=False))

# 4. Generate Figure 16: Final Model Selection and Forecast
fig, ax = plt.subplots(figsize=(11, 6.2))

# Historical points
ax.scatter(x_train, y_train, color='#263238', s=70, edgecolor='black', zorder=5, label='Historical Annual Median (2010–2025)')
ax.axvspan(2018.5, 2025.5, color='#f1f8e9', alpha=0.45, label='7-Fold Rolling Backtest Horizon (2019–2025)')

# 2026 partial snapshot
ax.scatter([2026], [actual_2026], color='#f57c00', s=100, marker='D', edgecolor='black', zorder=6, label='2026 Partial-Year Snapshot (Actual = 24.64)')

# Forecast vectors (2026-2030)
fc_years_plot = np.array([2026, 2027, 2028, 2029, 2030])
fc_lin_plot = int_full + s_full * fc_years_plot
se_pred_plot = se_res_lin * np.sqrt(1 + 1/n_train + (fc_years_plot - x_bar)**2 / ss_xx)
pi_low_plot = fc_lin_plot - t_crit_95 * se_pred_plot
pi_high_plot = fc_lin_plot + t_crit_95 * se_pred_plot

# Primary selected forecast (Linear OLS)
ax.plot(fc_years_plot, fc_lin_plot, color='#1565c0', marker='o', lw=2.6, zorder=4, label='Selected Primary Model: Linear Trend (OLS)')
ax.fill_between(fc_years_plot, pi_low_plot, pi_high_plot, color='#bbdefb', alpha=0.5, label='Linear 95% Prediction Interval')

# Competing model trajectories as secondary lines
fc_ar010_plot = ar010_full.forecast(5)
fc_holt_plot = holt_full.forecast(5)
fc_quad_plot = np.polyval(p2_full, fc_years_plot - 2010)

ax.plot(fc_years_plot, fc_ar010_plot, color='#6a1b9a', marker='v', lw=1.6, linestyle=':', alpha=0.85, label='ARIMA(0,1,0)+drift (Best 7-Fold Backtest RMSE=0.824)')
ax.plot(fc_years_plot, fc_holt_plot, color='#e65100', marker='p', lw=1.6, linestyle='--', alpha=0.85, label='Holt Linear Trend (Dynamic Exponential Smoothing)')
ax.plot(fc_years_plot, fc_quad_plot, color='#c62828', marker='^', lw=1.5, linestyle='-.', alpha=0.85, label='Quadratic Trend (Rejected: Explosive Acceleration)')

ax.set_title('Figure 16: Final Model Selection & Projections of AI Training Compute to 2030')
ax.set_xlabel('Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.set_xlim(2009, 2031)
ax.set_ylim(14, 30.5)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left', fontsize=8.5)

# Annotation for 2030 forecast
ax.annotate(f"2030 Selected Forecast:\n10^26.98 FLOP (~9.6×10^26 FLOP)\n95% PI: [10^25.05, 10^28.92]",
            xy=(2030, fc_lin_plot[-1]), xytext=(2025.8, 20.5),
            arrowprops=dict(facecolor='#1565c0', shrink=0.05, width=1.2, headwidth=6),
            fontsize=8.5, fontweight='semibold', color='#0d47a1',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#e3f2fd', edgecolor='#1565c0', alpha=0.9))

plt.tight_layout()
fig.savefig('graphs/16_final_model_selection_and_forecast.png')
plt.close()
print("Figure 16 saved to graphs/16_final_model_selection_and_forecast.png successfully.")
