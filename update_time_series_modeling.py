import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy import stats
from statsmodels.tsa.holtwinters import Holt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller

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
yearly_subset = yearly_df[(yearly_df['Year'] >= 2010) & (yearly_df['Year'] <= 2026)].copy()

train_df = yearly_subset[(yearly_subset['Year'] >= 2010) & (yearly_subset['Year'] <= 2025)].copy()
x_train = train_df['Year'].values
y_train = train_df['median_log10_compute'].values
n_train = len(x_train)

actual_2026 = yearly_subset.loc[yearly_subset['Year'] == 2026, 'median_log10_compute'].values[0]

# Stationarity checks (ADF)
adf_level = adfuller(y_train)
adf_diff1 = adfuller(np.diff(y_train))

# Main fits on 2010-2025
# 1. Linear
s_lin, int_lin, r_val_lin, p_val_lin, se_lin = stats.linregress(x_train, y_train)
r2_lin = r_val_lin**2
adj_r2_lin = 1 - (1 - r2_lin) * (n_train - 1) / (n_train - 2)

# 2. Quadratic
t_c = x_train - 2010
p2_coeffs = np.polyfit(t_c, y_train, 2)
y_pred_q_train = np.polyval(p2_coeffs, t_c)
ss_res_q = np.sum((y_train - y_pred_q_train)**2)
ss_tot_train = np.sum((y_train - np.mean(y_train))**2)
r2_quad = 1 - ss_res_q / ss_tot_train
adj_r2_quad = 1 - (1 - r2_quad) * (n_train - 1) / (n_train - 3)

# 3. Holt Linear Trend
holt_fit_full = Holt(y_train, initialization_method='estimated').fit()
y_pred_holt_train = holt_fit_full.fittedvalues
ss_res_holt = np.sum((y_train - y_pred_holt_train)**2)
r2_holt = 1 - ss_res_holt / ss_tot_train
adj_r2_holt = 1 - (1 - r2_holt) * (n_train - 1) / (n_train - 3)

# 4. ARIMA(0,1,0) with drift
arima010_full = ARIMA(y_train, order=(0,1,0), trend='t').fit()
y_pred_arima010_train = arima010_full.fittedvalues
ss_res_ar010 = np.sum((y_train - y_pred_arima010_train)**2)
r2_ar010 = 1 - ss_res_ar010 / ss_tot_train
adj_r2_ar010 = 1 - (1 - r2_ar010) * (n_train - 1) / (n_train - 2)

# 5. ARIMA(1,1,0) with drift
arima110_full = ARIMA(y_train, order=(1,1,0), trend='t').fit()
y_pred_arima110_train = arima110_full.fittedvalues
ss_res_ar110 = np.sum((y_train - y_pred_arima110_train)**2)
r2_ar110 = 1 - ss_res_ar110 / ss_tot_train
adj_r2_ar110 = 1 - (1 - r2_ar110) * (n_train - 1) / (n_train - 3)

# Rolling Chronological Backtest (2022-2025)
test_years = [2022, 2023, 2024, 2025]
backtest_records = []
yearly_series = yearly_subset.set_index('Year')['median_log10_compute']

models_to_test = [
    'Naive', 'Linear Trend', 'Quadratic Trend', 
    'Holt Linear Trend', 'ARIMA(0,1,0)+drift', 'ARIMA(1,1,0)+drift'
]

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
    
    for m_name, pred_val in preds_dict.items():
        err = y_act - pred_val
        backtest_records.append({
            'Model': m_name,
            'Test_Year': ty,
            'Actual_Y_t': y_act,
            'Predicted_Y_t': pred_val,
            'Error': err,
            'Absolute_Error': abs(err),
            'Squared_Error': err**2
        })

backtest_df = pd.DataFrame(backtest_records)
backtest_df.to_csv('outputs/backtest_results.csv', index=False)

# Consolidated comparison table
y_act_vals = backtest_df[backtest_df['Model'] == 'Naive']['Actual_Y_t'].values
ss_tot_backtest = np.sum((y_act_vals - np.mean(y_act_vals))**2)

consolidated_records = []
train_r2_map = {
    'Naive': (0.0, 0.0),
    'Linear Trend': (r2_lin, adj_r2_lin),
    'Quadratic Trend': (r2_quad, adj_r2_quad),
    'Holt Linear Trend': (r2_holt, adj_r2_holt),
    'ARIMA(0,1,0)+drift': (r2_ar010, adj_r2_ar010),
    'ARIMA(1,1,0)+drift': (r2_ar110, adj_r2_ar110)
}

for m_name in models_to_test:
    sub = backtest_df[backtest_df['Model'] == m_name]
    mae = sub['Absolute_Error'].mean()
    rmse = np.sqrt(sub['Squared_Error'].mean())
    ss_res = sub['Squared_Error'].sum()
    oos_r2 = 1 - ss_res / ss_tot_backtest
    tr_r2, tr_adj = train_r2_map[m_name]
    
    consolidated_records.append({
        'Model': m_name,
        'Training R2': round(tr_r2, 4),
        'Adjusted R2': round(tr_adj, 4),
        'Backtest MAE': round(mae, 4),
        'Backtest RMSE': round(rmse, 4),
        'Backtest R2': round(oos_r2, 4)
    })

comparison_df = pd.DataFrame(consolidated_records)
print("=== CONSOLIDATED MODEL COMPARISON TABLE ===")
print(comparison_df.to_string(index=False))

# Update Figure 10: Actual vs Predicted Backtest Graph
fig, ax = plt.subplots(figsize=(10.5, 5.8))
ax.plot(train_df['Year'], train_df['median_log10_compute'], marker='o', color='#263238', lw=2.2, label='Actual Historical Median (2010–2025)')

# Plot candidate model backtest predictions
styles = {
    'Naive': ('#9e9e9e', 's', ':', 1.5),
    'Linear Trend': ('#1565c0', '^', '--', 2.0),
    'Quadratic Trend': ('#2e7d32', 'D', '-.', 2.0),
    'Holt Linear Trend': ('#e65100', 'p', '-', 2.2),
    'ARIMA(0,1,0)+drift': ('#6a1b9a', 'v', '--', 1.8),
    'ARIMA(1,1,0)+drift': ('#00838f', 'x', ':', 1.8)
}

for m_name in models_to_test:
    sub = backtest_df[backtest_df['Model'] == m_name].set_index('Test_Year')['Predicted_Y_t']
    col, mk, ls, lw = styles[m_name]
    ax.plot(test_years, sub.values, marker=mk, color=col, linestyle=ls, lw=lw, label=f'{m_name} (RMSE={comparison_df.loc[comparison_df["Model"]==m_name, "Backtest RMSE"].values[0]:.3f})')

ax.axvspan(2021.5, 2025.5, color='#f1f8e9', alpha=0.45, label='Rolling Backtest Window (2022–2025)')
ax.set_title('Figure 10: Time-Series & Trend Models: Actual vs. Predicted in Rolling Backtest')
ax.set_xlabel('Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left', fontsize=8.5)

ax.text(0.03, 0.15, 'Holt Linear Trend reduces RMSE from 0.888 (Linear OLS) to 0.748 (OOS R2 = 0.492).\nARIMA(1,1,0)+drift achieves RMSE = 0.621 (OOS R2 = 0.649).\nQuadratic achieves lowest 1-step RMSE (0.517) but risks multi-year polynomial runaway.',
        transform=ax.transAxes, bbox=dict(boxstyle='round,pad=0.5', facecolor='#fffde7', alpha=0.9), fontsize=8.5)
plt.tight_layout()
fig.savefig('graphs/10_actual_vs_predicted_backtest.png')
plt.close()

# 2026 Predictions
p2026_naive = y_train[-1]
p2026_lin = int_lin + s_lin * 2026
p2026_quad = np.polyval(p2_coeffs, 2026 - 2010)
p2026_holt = holt_fit_full.forecast(1)[0]
p2026_ar010 = arima010_full.forecast(1)[0]
p2026_ar110 = arima110_full.forecast(1)[0]

print("\n=== 2026 PARTIAL-YEAR SNAPSHOT COMPARISON ===")
print(f"Actual 2026 (partial through Sep 21): {actual_2026:.4f}")
print(f"Linear Trend 2026:        {p2026_lin:.4f} (Error = {actual_2026 - p2026_lin:+.4f})")
print(f"Naive 2026:               {p2026_naive:.4f} (Error = {actual_2026 - p2026_naive:+.4f})")
print(f"Holt Linear 2026:         {p2026_holt:.4f} (Error = {actual_2026 - p2026_holt:+.4f})")
print(f"ARIMA(0,1,0)+drift 2026:  {p2026_ar010:.4f} (Error = {actual_2026 - p2026_ar010:+.4f})")
print(f"ARIMA(1,1,0)+drift 2026:  {p2026_ar110:.4f} (Error = {actual_2026 - p2026_ar110:+.4f})")
print(f"Quadratic Trend 2026:     {p2026_quad:.4f} (Error = {actual_2026 - p2026_quad:+.4f})")

# Forecasts for 2027-2030
future_years = [2027, 2028, 2029, 2030]
x_bar = np.mean(x_train)
ss_xx = np.sum((x_train - x_bar)**2)
res_lin = y_train - (int_lin + s_lin * x_train)
se_res_lin = np.sqrt(np.sum(res_lin**2) / (n_train - 2))
t_crit_95 = stats.t.ppf(0.975, df=n_train - 2)

# Holt forecasts
holt_forecasts_5 = holt_fit_full.forecast(5) # 2026..2030
# ARIMA forecasts
ar010_forecast_res = arima010_full.get_forecast(5)
ar010_mean = ar010_forecast_res.predicted_mean
ar010_ci = ar010_forecast_res.conf_int(alpha=0.05)

# Calculate Holt prediction intervals using simulation / exponential smoothing variance formula
# For Holt's linear trend, Var(e_{n+h}) = sigma^2 * (1 + sum_{j=1}^{h-1} (alpha + j*alpha*beta)^2)
res_holt = y_train - y_pred_holt_train
sigma_holt = np.std(res_holt, ddof=2)
alpha_h = holt_fit_full.params['smoothing_level']
beta_h = holt_fit_full.params['smoothing_trend']

forecast_rows = []
for idx, yf in enumerate(future_years):
    # Linear
    y_lin = int_lin + s_lin * yf
    se_lin_pred = se_res_lin * np.sqrt(1 + 1/n_train + (yf - x_bar)**2 / ss_xx)
    pi_low_lin = y_lin - t_crit_95 * se_lin_pred
    pi_high_lin = y_lin + t_crit_95 * se_lin_pred
    
    # Holt
    y_holt = holt_forecasts_5[idx + 1]
    h = idx + 2 # step ahead from 2025
    # Variance multiplier for Holt: 1 + sum_{j=1}^{h-1} (alpha + j*alpha*beta)^2
    var_mult = 1.0 + np.sum([(alpha_h + j * alpha_h * beta_h)**2 for j in range(1, h)])
    se_holt_pred = sigma_holt * np.sqrt(var_mult)
    pi_low_holt = y_holt - 1.96 * se_holt_pred
    pi_high_holt = y_holt + 1.96 * se_holt_pred
    
    # Quadratic
    y_quad = np.polyval(p2_coeffs, yf - 2010)
    
    # ARIMA(0,1,0)+drift
    y_ar010 = ar010_mean[idx + 1]
    pi_low_ar010 = ar010_ci[idx + 1, 0]
    pi_high_ar010 = ar010_ci[idx + 1, 1]
    
    forecast_rows.append({
        'Year': yf,
        'Linear_log10': round(y_lin, 4),
        'Linear_PI_lower': round(pi_low_lin, 4),
        'Linear_PI_upper': round(pi_high_lin, 4),
        'Linear_FLOP': 10**y_lin,
        'Holt_log10': round(y_holt, 4),
        'Holt_PI_lower': round(pi_low_holt, 4),
        'Holt_PI_upper': round(pi_high_holt, 4),
        'Holt_FLOP': 10**y_holt,
        'ARIMA010_log10': round(y_ar010, 4),
        'ARIMA010_FLOP': 10**y_ar010,
        'Quadratic_log10': round(y_quad, 4),
        'Quadratic_FLOP': 10**y_quad
    })

fc_df_consolidated = pd.DataFrame(forecast_rows)
fc_df_consolidated.to_csv('outputs/future_forecasts_2027_2030.csv', index=False)
print("\n=== CONSOLIDATED FORECASTS (2027-2030) ===")
print(fc_df_consolidated[['Year', 'Linear_log10', 'Holt_log10', 'Holt_PI_lower', 'Holt_PI_upper', 'Holt_FLOP', 'Quadratic_log10']].to_string(index=False))

# Update Figure 13: AI Compute Forecast to 2030
fig, ax = plt.subplots(figsize=(11, 6.2))

# Historical points
ax.scatter(x_train, y_train, color='#263238', s=65, edgecolor='black', zorder=5, label='Historical Annual Median (2010–2025)')
ax.axvspan(2021.5, 2025.5, color='#f1f8e9', alpha=0.4, label='Backtest Window (2022–2025)')
ax.scatter([2026], [actual_2026], color='#f57c00', s=95, marker='D', edgecolor='black', zorder=6, label='2026 Partial Snapshot (Actual = 24.64)')

# Forecast vectors
fc_plot_years = np.array([2026, 2027, 2028, 2029, 2030])

# 1. Holt Linear Trend (Selected Primary Time-Series Specification)
fc_holt_plot = holt_forecasts_5
holt_se_arr = np.array([sigma_holt * np.sqrt(1.0 + np.sum([(alpha_h + j * alpha_h * beta_h)**2 for j in range(1, h)])) for h in range(1, 6)])
ax.plot(fc_plot_years, fc_holt_plot, color='#e65100', marker='p', lw=2.5, label='Holt Linear Trend Forecast (Selected Time-Series Model)')
ax.fill_between(fc_plot_years, fc_holt_plot - 1.96 * holt_se_arr, fc_holt_plot + 1.96 * holt_se_arr, color='#ffe0b2', alpha=0.45, label='Holt 95% Prediction Interval')

# 2. Linear OLS Baseline
fc_lin_plot = int_lin + s_lin * fc_plot_years
ax.plot(fc_plot_years, fc_lin_plot, color='#1565c0', marker='^', lw=1.8, linestyle='--', label='Linear Trend Baseline (OLS)')

# 3. ARIMA(0,1,0)+drift
ax.plot(fc_plot_years, ar010_mean, color='#6a1b9a', marker='v', lw=1.8, linestyle=':', label='ARIMA(0,1,0)+drift (Random Walk with Drift)')

# 4. Quadratic Trend
fc_quad_plot = np.polyval(p2_coeffs, fc_plot_years - 2010)
ax.plot(fc_plot_years, fc_quad_plot, color='#2e7d32', marker='D', lw=1.6, linestyle='-.', label='Quadratic Trend Extrapolation (Caution: explosive)')

ax.set_title('Figure 13: AI Training Compute Projections to 2030 (Time-Series & Trend Models)')
ax.set_xlabel('Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.set_xlim(2009, 2031)
ax.set_ylim(14, 31)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left', fontsize=8.5)

ax.annotate(f"2030 Holt Forecast: 10^27.67 FLOP\n(~4.7×10^27 FLOP)",
            xy=(2030, fc_holt_plot[-1]), xytext=(2026.2, 29.5),
            arrowprops=dict(facecolor='#e65100', shrink=0.05, width=1, headwidth=6),
            fontsize=8.5, fontweight='semibold', color='#e65100',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fff3e0', edgecolor='#e65100', alpha=0.9))

plt.tight_layout()
fig.savefig('graphs/13_ai_compute_forecast_to_2030.png')
plt.close()

print("\nGraphs updated successfully.")
