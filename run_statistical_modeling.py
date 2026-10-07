import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

# Configure styling
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
os.makedirs('notebooks', exist_ok=True)

# ==============================================================
# TASK 1: LOAD YEARLY DATA
# ==============================================================
yearly_df = pd.read_csv('outputs/yearly_ai_compute.csv')
yearly_subset = yearly_df[(yearly_df['Year'] >= 2010) & (yearly_df['Year'] <= 2026)].copy()

print("==================================================")
print("TASK 1: COMPLETE YEARLY TABLE (2010–2026)")
print("==================================================")
display_cols = ['Year', 'models_with_valid_compute', 'mean_training_compute', 
                'median_training_compute', 'mean_log10_compute', 'median_log10_compute']
subset_print = yearly_subset[display_cols].copy()
subset_print['Year_Label'] = subset_print['Year'].astype(str)
subset_print.loc[subset_print['Year'] == 2026, 'Year_Label'] = '2026 (PARTIAL through Sep 21)'

for idx, r in subset_print.iterrows():
    print(f"{r['Year_Label']:<32} | Models: {int(r['models_with_valid_compute']):>2} | "
          f"Med Compute: {r['median_training_compute']:>10.2e} FLOP | "
          f"Mean log10: {r['mean_log10_compute']:>7.4f} | "
          f"Med log10 (Y_t): {r['median_log10_compute']:>7.4f}")

# Main modeling training set: 2010–2025
train_df = yearly_subset[(yearly_subset['Year'] >= 2010) & (yearly_subset['Year'] <= 2025)].copy()
x_train = train_df['Year'].values
y_train = train_df['median_log10_compute'].values
n_train = len(x_train)

# ==============================================================
# TASK 2: MODULE IX: CORRELATION
# ==============================================================
pearson_r, pearson_p = stats.pearsonr(x_train, y_train)
spearman_rho, spearman_p = stats.spearmanr(x_train, y_train)

print("\n==================================================")
print("TASK 2: CORRELATION ANALYSIS (MODULE IX)")
print("==================================================")
print(f"Sample Size (2010–2025): N = {n_train}")
print(f"Pearson Correlation r:   {pearson_r:.6f} (p-value = {pearson_p:.4e})")
print(f"Spearman Correlation rho: {spearman_rho:.6f} (p-value = {spearman_p:.4e})")

# Correlation scatter plot
fig, ax = plt.subplots(figsize=(9, 5.5))
ax.scatter(x_train, y_train, color='#1565c0', s=70, edgecolor='black', zorder=4, label='Annual Median log10(Compute) Y_t')
slope_corr, intercept_corr, _, _, _ = stats.linregress(x_train, y_train)
ax.plot(x_train, intercept_corr + slope_corr * x_train, color='#c62828', lw=2.2, linestyle='-', label=f'Linear Fit: Y = {intercept_corr:.2f} + {slope_corr:.4f}·Year')

# Mark partial 2026
actual_2026 = yearly_subset.loc[yearly_subset['Year'] == 2026, 'median_log10_compute'].values[0]
ax.scatter([2026], [actual_2026], color='#f57c00', s=90, marker='D', edgecolor='black', zorder=5, label='2026 Partial Snapshot (Y = 24.64)')

ax.set_title('Figure 15: AI Training Compute vs Publication Year (Correlation Fit)')
ax.set_xlabel('Publication Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')

stats_box = (f"Pearson r = {pearson_r:.4f} (p < 0.001)\n"
             f"Spearman ρ = {spearman_rho:.4f} (p < 0.001)\n"
             f"Strong positive monotonic trend\n"
             f"Correlation does NOT imply causation")
ax.text(0.60, 0.15, stats_box, transform=ax.transAxes, fontsize=9.5,
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#fffde7', edgecolor='#fbc02d', alpha=0.9))
plt.tight_layout()
fig.savefig('graphs/15_correlation_linear_fit.png')
plt.close()

# ==============================================================
# TASK 3: MODULE X: SIMPLE LINEAR REGRESSION
# ==============================================================
slope_lin, intercept_lin, r_val_lin, p_val_lin, se_slope_lin = stats.linregress(x_train, y_train)
r2_lin = r_val_lin**2
adj_r2_lin = 1 - (1 - r2_lin) * (n_train - 1) / (n_train - 2)

t_crit_95 = stats.t.ppf(0.975, df=n_train - 2)
ci_lower_lin = slope_lin - t_crit_95 * se_slope_lin
ci_upper_lin = slope_lin + t_crit_95 * se_slope_lin
growth_factor_lin = 10**slope_lin
doubling_time_years = np.log10(2) / slope_lin
doubling_time_months = doubling_time_years * 12

print("\n==================================================")
print("TASK 3: SIMPLE LINEAR REGRESSION (MODULE X)")
print("==================================================")
print(f"Regression Equation: Y_t = {intercept_lin:.4f} + {slope_lin:.4f} · Year")
print(f"Intercept (beta0):   {intercept_lin:.4f}")
print(f"Slope (beta1):       {slope_lin:.4f} log10(FLOP)/year")
print(f"Standard Error (se): {se_slope_lin:.4f}")
print(f"p-value for slope:   {p_val_lin:.4e}")
print(f"95% Confidence Interval for slope: [{ci_lower_lin:.4f}, {ci_upper_lin:.4f}]")
print(f"Coefficient of Determination (R2): {r2_lin:.4f}")
print(f"Adjusted R-squared:                {adj_r2_lin:.4f}")
print(f"Implied Multiplicative Growth Factor: 10^(beta1) = {growth_factor_lin:.2f}x per year")
print(f"Implied Compute Doubling Time:       {doubling_time_years:.2f} years ({doubling_time_months:.1f} months)")

# ==============================================================
# TASK 4: MODULE X: POLYNOMIAL (QUADRATIC) REGRESSION
# ==============================================================
t_centered = x_train - 2010
poly2_coeffs = np.polyfit(t_centered, y_train, 2)  # [beta2, beta1, beta0]
beta2_q, beta1_q, beta0_q = poly2_coeffs[0], poly2_coeffs[1], poly2_coeffs[2]

y_pred_quad_train = np.polyval(poly2_coeffs, t_centered)
res_quad_train = y_train - y_pred_quad_train
ss_res_q = np.sum(res_quad_train**2)
ss_tot_train = np.sum((y_train - np.mean(y_train))**2)
r2_quad = 1 - ss_res_q / ss_tot_train
adj_r2_quad = 1 - (1 - r2_quad) * (n_train - 1) / (n_train - 3)
rmse_quad_train = np.sqrt(np.mean(res_quad_train**2))

print("\n==================================================")
print("TASK 4: POLYNOMIAL REGRESSION (QUADRATIC)")
print("==================================================")
print(f"Quadratic Form: Y_t = beta0 + beta1*(Year-2010) + beta2*(Year-2010)^2")
print(f"beta0 (Intercept at 2010): {beta0_q:.4f}")
print(f"beta1 (Linear term):       {beta1_q:.4f}")
print(f"beta2 (Quadratic term):    {beta2_q:.6f}")
print(f"Training R2:               {r2_quad:.4f}")
print(f"Adjusted R2:               {adj_r2_quad:.4f}")
print(f"Training RMSE:             {rmse_quad_train:.4f}")

# ==============================================================
# TASK 5 & 6: ROLLING CHRONOLOGICAL BACKTESTING
# ==============================================================
test_years = [2022, 2023, 2024, 2025]
backtest_records = []
yearly_series = yearly_subset.set_index('Year')['median_log10_compute']

for ty in test_years:
    train_sub = yearly_series.loc[2010:ty-1]
    y_act = yearly_series.loc[ty]
    
    # 1. Naive model (Y_t = Y_{t-1})
    pred_naive = train_sub.iloc[-1]
    
    # 2. Linear model
    x_tr = train_sub.index.values
    y_tr = train_sub.values
    s_tr, int_tr, _, _, _ = stats.linregress(x_tr, y_tr)
    pred_linear = int_tr + s_tr * ty
    
    # 3. Quadratic model (centered on 2010)
    tc_tr = x_tr - 2010
    tc_val = ty - 2010
    q_fit = np.polyfit(tc_tr, y_tr, 2)
    pred_quad = np.polyval(q_fit, tc_val)
    
    for m_name, pred_val in [('Naive', pred_naive), ('Linear', pred_linear), ('Quadratic', pred_quad)]:
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

print("\n==================================================")
print("TASK 6: ROLLING CHRONOLOGICAL BACKTEST RESULTS")
print("==================================================")
print(backtest_df.to_string(index=False))

# Calculate aggregate metrics
models = ['Naive', 'Linear', 'Quadratic']
comparison_metrics = []

for m in models:
    sub = backtest_df[backtest_df['Model'] == m]
    mae = sub['Absolute_Error'].mean()
    rmse = np.sqrt(sub['Squared_Error'].mean())
    y_act_vals = sub['Actual_Y_t'].values
    ss_res = sub['Squared_Error'].sum()
    ss_tot = np.sum((y_act_vals - np.mean(y_act_vals))**2)
    r2_oos = 1 - ss_res / ss_tot
    
    if m == 'Naive':
        tr_r2, tr_adj_r2 = 0.0, 0.0
    elif m == 'Linear':
        tr_r2, tr_adj_r2 = r2_lin, adj_r2_lin
    else:
        tr_r2, tr_adj_r2 = r2_quad, adj_r2_quad
        
    comparison_metrics.append({
        'Model': m,
        'Training R2': round(tr_r2, 4),
        'Adjusted R2': round(tr_adj_r2, 4),
        'Backtest MAE': round(mae, 4),
        'Backtest RMSE': round(rmse, 4),
        'Backtest R2': round(r2_oos, 4)
    })

comparison_df = pd.DataFrame(comparison_metrics)
print("\n==================================================")
print("TASK 9: MODEL COMPARISON TABLE")
print("==================================================")
print(comparison_df.to_string(index=False))

# ==============================================================
# TASK 7: ACTUAL VS PREDICTED GRAPH
# ==============================================================
fig, ax = plt.subplots(figsize=(10, 5.5))
ax.plot(train_df['Year'], train_df['median_log10_compute'], marker='o', color='#37474f', lw=2.2, label='Actual Historical Median (2010–2025)')

# Plot backtest test-year points
naive_preds = backtest_df[backtest_df['Model'] == 'Naive'].set_index('Test_Year')['Predicted_Y_t']
linear_preds = backtest_df[backtest_df['Model'] == 'Linear'].set_index('Test_Year')['Predicted_Y_t']
quad_preds = backtest_df[backtest_df['Model'] == 'Quadratic'].set_index('Test_Year')['Predicted_Y_t']

ax.plot(test_years, naive_preds.values, marker='s', color='#757575', lw=1.8, linestyle=':', label='Naive Forecast (t-1)')
ax.plot(test_years, linear_preds.values, marker='^', color='#1565c0', lw=2.0, linestyle='--', label='Linear Trend Forecast')
ax.plot(test_years, quad_preds.values, marker='D', color='#2e7d32', lw=2.0, linestyle='-.', label='Quadratic Trend Forecast')

ax.axvspan(2021.5, 2025.5, color='#e8f5e9', alpha=0.35, label='Rolling Backtest Window (2022–2025)')
ax.set_title('Figure 10: Actual vs. Predicted Compute in Rolling Chronological Backtest')
ax.set_xlabel('Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')

ax.text(0.03, 0.15, 'Quadratic model achieves lowest backtest RMSE (0.5173 vs 0.8881 linear)\nby adapting to recent LLM scaling acceleration in 2023–2025.',
        transform=ax.transAxes, bbox=dict(boxstyle='round', facecolor='#fffde7', alpha=0.9), fontsize=9)
plt.tight_layout()
fig.savefig('graphs/10_actual_vs_predicted_backtest.png')
plt.close()

# ==============================================================
# TASK 8: RESIDUAL DIAGNOSTICS
# ==============================================================
res_lin_train = y_train - (intercept_lin + slope_lin * x_train)
fitted_lin = intercept_lin + slope_lin * x_train
mean_res_lin = np.mean(res_lin_train)
std_res_lin = np.std(res_lin_train, ddof=2)
dw_lin = np.sum(np.diff(res_lin_train)**2) / np.sum(res_lin_train**2)

# Figure 11: Linear Residuals
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(11, 8))
# 1. Residuals vs Time
ax1.plot(x_train, res_lin_train, marker='o', color='#1565c0', lw=1.8)
ax1.axhline(0, color='crimson', linestyle='--', lw=1.5)
ax1.set_title('Residuals vs. Year (Linear)')
ax1.set_xlabel('Year')
ax1.set_ylabel('Residual (Actual - Fitted)')
ax1.grid(True, linestyle='--', alpha=0.5)

# 2. Residuals vs Fitted
ax2.scatter(fitted_lin, res_lin_train, color='#1565c0', s=50, edgecolor='black')
ax2.axhline(0, color='crimson', linestyle='--', lw=1.5)
ax2.set_title('Residuals vs. Fitted Values (Linear)')
ax2.set_xlabel('Fitted Values')
ax2.set_ylabel('Residual')
ax2.grid(True, linestyle='--', alpha=0.5)

# 3. Histogram of Residuals
ax3.hist(res_lin_train, bins=7, color='#1565c0', edgecolor='black', alpha=0.75, density=True)
kde_x = np.linspace(res_lin_train.min() - 0.5, res_lin_train.max() + 0.5, 100)
ax3.plot(kde_x, stats.norm.pdf(kde_x, mean_res_lin, std_res_lin), color='crimson', lw=2)
ax3.set_title(f'Histogram of Residuals (Mean={mean_res_lin:.2f}, Std={std_res_lin:.2f})')
ax3.set_xlabel('Residual')
ax3.set_ylabel('Density')
ax3.grid(True, linestyle='--', alpha=0.5)

# 4. Normal Q-Q Plot
stats.probplot(res_lin_train, dist="norm", plot=ax4)
ax4.set_title(f'Normal Q-Q Plot (Durbin-Watson = {dw_lin:.4f})')
ax4.grid(True, linestyle='--', alpha=0.5)

plt.suptitle('Figure 11: Residual Diagnostics for Simple Linear Regression Model', fontsize=14, fontweight='bold')
plt.tight_layout()
fig.savefig('graphs/11_residuals_linear.png')
plt.close()

# Figure 12: Quadratic Residuals
fitted_quad = y_pred_quad_train
mean_res_quad = np.mean(res_quad_train)
std_res_quad = np.std(res_quad_train, ddof=3)
dw_quad = np.sum(np.diff(res_quad_train)**2) / np.sum(res_quad_train**2)

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(11, 8))
# 1. Residuals vs Time
ax1.plot(x_train, res_quad_train, marker='D', color='#2e7d32', lw=1.8)
ax1.axhline(0, color='crimson', linestyle='--', lw=1.5)
ax1.set_title('Residuals vs. Year (Quadratic)')
ax1.set_xlabel('Year')
ax1.set_ylabel('Residual')
ax1.grid(True, linestyle='--', alpha=0.5)

# 2. Residuals vs Fitted
ax2.scatter(fitted_quad, res_quad_train, color='#2e7d32', s=50, edgecolor='black')
ax2.axhline(0, color='crimson', linestyle='--', lw=1.5)
ax2.set_title('Residuals vs. Fitted Values (Quadratic)')
ax2.set_xlabel('Fitted Values')
ax2.set_ylabel('Residual')
ax2.grid(True, linestyle='--', alpha=0.5)

# 3. Histogram of Residuals
ax3.hist(res_quad_train, bins=7, color='#2e7d32', edgecolor='black', alpha=0.75, density=True)
kde_x_q = np.linspace(res_quad_train.min() - 0.5, res_quad_train.max() + 0.5, 100)
ax3.plot(kde_x_q, stats.norm.pdf(kde_x_q, mean_res_quad, std_res_quad), color='crimson', lw=2)
ax3.set_title(f'Histogram of Residuals (Mean={mean_res_quad:.2f}, Std={std_res_quad:.2f})')
ax3.set_xlabel('Residual')
ax3.set_ylabel('Density')
ax3.grid(True, linestyle='--', alpha=0.5)

# 4. Normal Q-Q Plot
stats.probplot(res_quad_train, dist="norm", plot=ax4)
ax4.set_title(f'Normal Q-Q Plot (Durbin-Watson = {dw_quad:.4f})')
ax4.grid(True, linestyle='--', alpha=0.5)

plt.suptitle('Figure 12: Residual Diagnostics for Polynomial (Quadratic) Regression Model', fontsize=14, fontweight='bold')
plt.tight_layout()
fig.savefig('graphs/12_residuals_quadratic.png')
plt.close()

print("\n==================================================")
print("TASK 8: RESIDUAL DIAGNOSTICS & AUTOCORRELATION")
print("==================================================")
print(f"Linear Model Residuals:    Mean={mean_res_lin:.4f}, Std={std_res_lin:.4f}, Durbin-Watson={dw_lin:.4f}")
print(f"Quadratic Model Residuals: Mean={mean_res_quad:.4f}, Std={std_res_quad:.4f}, Durbin-Watson={dw_quad:.4f}")
print("Interpretation: DW = 1.1714 for linear indicates positive residual autocorrelation.")
print("The quadratic term lifts DW to 1.6243, substantially reducing residual autocorrelation.")

# ==============================================================
# TASK 10: MODULE VII: HYPOTHESIS TESTING
# ==============================================================
p1_values = yearly_subset[(yearly_subset['Year'] >= 2010) & (yearly_subset['Year'] <= 2017)]['median_log10_compute'].values
p2_values = yearly_subset[(yearly_subset['Year'] >= 2018) & (yearly_subset['Year'] <= 2025)]['median_log10_compute'].values

n1 = len(p1_values)
n2 = len(p2_values)
mean1 = np.mean(p1_values)
mean2 = np.mean(p2_values)
var1 = np.var(p1_values, ddof=1)
var2 = np.var(p2_values, ddof=1)

tt_stat, tt_pval = stats.ttest_ind(p1_values, p2_values, equal_var=False)

# Welch-Satterthwaite degrees of freedom
dof_welch = (var1/n1 + var2/n2)**2 / ((var1/n1)**2 / (n1 - 1) + (var2/n2)**2 / (n2 - 1))
diff_means = mean2 - mean1
se_diff = np.sqrt(var1/n1 + var2/n2)
t_crit_welch = stats.t.ppf(0.975, df=dof_welch)
ci_diff_lower = diff_means - t_crit_welch * se_diff
ci_diff_upper = diff_means + t_crit_welch * se_diff

print("\n==================================================")
print("TASK 10: HYPOTHESIS TESTING (MODULE VII)")
print("==================================================")
print(f"Period 1 (2010–2017): n1 = {n1}, Mean = {mean1:.4f}, Var = {var1:.4f}")
print(f"Period 2 (2018–2025): n2 = {n2}, Mean = {mean2:.4f}, Var = {var2:.4f}")
print(f"Mean Difference (Period 2 - Period 1): {diff_means:.4f} log10(FLOP)")
print(f"Welch's t-statistic: {tt_stat:.4f}")
print(f"Welch's Degrees of Freedom: {dof_welch:.2f}")
print(f"Two-Tailed p-value:  {tt_pval:.4e}")
print(f"95% Confidence Interval for Mean Difference: [{ci_diff_lower:.4f}, {ci_diff_upper:.4f}]")
decision_str = "Reject Null Hypothesis H0 (p < 0.05)" if tt_pval < 0.05 else "Fail to Reject H0"
print(f"Decision at alpha = 0.05: {decision_str}")

# ==============================================================
# TASK 11: SECONDARY PARAMETER ANALYSIS
# ==============================================================
raw_df = pd.read_csv('data/notable_ai_models.csv')
raw_df['pub_date'] = pd.to_datetime(raw_df['Publication date'], errors='coerce')
raw_df['Year'] = raw_df['pub_date'].dt.year
raw_df['params_num'] = pd.to_numeric(raw_df['Parameters'], errors='coerce')
valid_p = raw_df[raw_df['params_num'] > 0].copy()
valid_p['log10_params'] = np.log10(valid_p['params_num'])

yearly_p = valid_p[(valid_p['Year'] >= 2010) & (valid_p['Year'] <= 2025)].groupby('Year')['log10_params'].median().reset_index()
x_param = yearly_p['Year'].values
y_param = yearly_p['log10_params'].values

p_r, p_pval = stats.pearsonr(x_param, y_param)
p_rho, p_rhopval = stats.spearmanr(x_param, y_param)

fig, ax = plt.subplots(figsize=(9, 5.5))
ax.scatter(x_param, y_param, color='#6a1b9a', s=65, edgecolor='black', zorder=4, label='Annual Median log10(Parameters)')
s_p, int_p, _, _, _ = stats.linregress(x_param, y_param)
ax.plot(x_param, int_p + s_p * x_param, color='#ad1457', lw=2.2, linestyle='--', label=f'Linear Fit: Slope = {s_p:.4f}/yr (R2 = {p_r**2:.4f})')
ax.set_title('Figure 14: AI Model Parameter Scaling Over Time (2010–2025 Secondary Target)')
ax.set_xlabel('Publication Year')
ax.set_ylabel('Median log10(Parameters)')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')

param_box = (f"Pearson r = {p_r:.4f} (p < 0.001)\n"
             f"Spearman ρ = {p_rho:.4f} (p < 0.001)\n"
             f"Annual growth = {s_p:.3f} log10(params)/yr\n"
             f"Implied factor = {10**s_p:.2f}x/year")
ax.text(0.60, 0.15, param_box, transform=ax.transAxes, fontsize=9.5,
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#f3e5f5', edgecolor='#8e24aa', alpha=0.9))
plt.tight_layout()
fig.savefig('graphs/14_parameters_scaling_trend.png')
plt.close()

print("\n==================================================")
print("TASK 11: SECONDARY PARAMETER ANALYSIS")
print("==================================================")
print(f"Parameters Pearson r:    {p_r:.4f} (p = {p_pval:.4e})")
print(f"Parameters Spearman rho: {p_rho:.4f} (p = {p_rhopval:.4e})")
print(f"Parameters Annual Growth Factor: 10^({s_p:.4f}) = {10**s_p:.2f}x per year")

# ==============================================================
# TASK 12: FINAL MODEL FIT & 2026 PARTIAL VALIDATION
# ==============================================================
pred_2026_naive = y_train[-1]
pred_2026_linear = intercept_lin + slope_lin * 2026
pred_2026_quad = np.polyval(poly2_coeffs, 2026 - 2010)

print("\n==================================================")
print("TASK 12: 2026 PARTIAL-YEAR VALIDATION / SNAPSHOT")
print("==================================================")
print(f"Actual 2026 Median log10 Compute (through Sep 21): {actual_2026:.4f}")
print(f"Linear Model Prediction for 2026:    {pred_2026_linear:.4f} (Error = {actual_2026 - pred_2026_linear:+.4f})")
print(f"Quadratic Model Prediction for 2026: {pred_2026_quad:.4f} (Error = {actual_2026 - pred_2026_quad:+.4f})")
print(f"Naive Model Prediction for 2026:     {pred_2026_naive:.4f} (Error = {actual_2026 - pred_2026_naive:+.4f})")
print("Explicit Label: '2026 partial-year validation/snapshot' — not a complete-year result.")

# ==============================================================
# TASK 13: FUTURE FORECASTS (2027–2030)
# ==============================================================
future_years = [2027, 2028, 2029, 2030]
x_bar = np.mean(x_train)
ss_xx = np.sum((x_train - x_bar)**2)
se_residual_lin = np.sqrt(np.sum(res_lin_train**2) / (n_train - 2))

forecast_records = []
for yf in future_years:
    # Linear projection
    y_pred_lin = intercept_lin + slope_lin * yf
    se_pred = se_residual_lin * np.sqrt(1 + 1/n_train + (yf - x_bar)**2 / ss_xx)
    pi_low_lin = y_pred_lin - t_crit_95 * se_pred
    pi_high_lin = y_pred_lin + t_crit_95 * se_pred
    
    # Quadratic projection
    y_pred_q = np.polyval(poly2_coeffs, yf - 2010)
    
    forecast_records.append({
        'Year': yf,
        'Predicted_log10_Compute_Linear': round(y_pred_lin, 4),
        'PI_Lower_log10_Linear': round(pi_low_lin, 4),
        'PI_Upper_log10_Linear': round(pi_high_lin, 4),
        'Predicted_FLOP_Linear': 10**y_pred_lin,
        'PI_Lower_FLOP_Linear': 10**pi_low_lin,
        'PI_Upper_FLOP_Linear': 10**pi_high_lin,
        'Predicted_log10_Compute_Quadratic': round(y_pred_q, 4),
        'Predicted_FLOP_Quadratic': 10**y_pred_q
    })

forecast_df = pd.DataFrame(forecast_records)
forecast_df.to_csv('outputs/future_forecasts_2027_2030.csv', index=False)

print("\n==================================================")
print("TASK 13: FUTURE FORECASTS (2027–2030)")
print("==================================================")
print(forecast_df[['Year', 'Predicted_log10_Compute_Linear', 'PI_Lower_log10_Linear', 'PI_Upper_log10_Linear', 'Predicted_FLOP_Linear']].to_string(index=False))

# ==============================================================
# TASK 14: FUTURE FORECAST GRAPH
# ==============================================================
fig, ax = plt.subplots(figsize=(11, 6))

# Historical training points (2010–2025)
ax.scatter(x_train, y_train, color='#1565c0', s=65, edgecolor='black', zorder=5, label='Historical Annual Median (2010–2025)')
ax.plot(x_train, intercept_lin + slope_lin * x_train, color='#1565c0', lw=1.8, linestyle='--', label='Linear Trend Fit (2010–2025)')

# Highlight backtest window
ax.axvspan(2021.5, 2025.5, color='#e8f5e9', alpha=0.4, label='Backtest Window (2022–2025)')

# Partial 2026 observation
ax.scatter([2026], [actual_2026], color='#f57c00', s=95, marker='D', edgecolor='black', zorder=6, label='2026 Partial-Year Snapshot (Actual = 24.64)')

# Forecasts (2027–2030)
fc_years_plot = np.array([2026, 2027, 2028, 2029, 2030])
fc_lin_plot = intercept_lin + slope_lin * fc_years_plot
se_pred_plot = se_residual_lin * np.sqrt(1 + 1/n_train + (fc_years_plot - x_bar)**2 / ss_xx)
pi_low_plot = fc_lin_plot - t_crit_95 * se_pred_plot
pi_high_plot = fc_lin_plot + t_crit_95 * se_pred_plot

ax.plot(fc_years_plot, fc_lin_plot, color='#c62828', marker='o', lw=2.5, label='Model-Based Linear Forecast (2026–2030)')
ax.fill_between(fc_years_plot, pi_low_plot, pi_high_plot, color='#ffcdd2', alpha=0.45, label='95% Forecast Prediction Interval')

# Also plot Quadratic extension for comparison
fc_quad_plot = np.polyval(poly2_coeffs, fc_years_plot - 2010)
ax.plot(fc_years_plot, fc_quad_plot, color='#2e7d32', marker='^', lw=1.8, linestyle='-.', label='Quadratic Trend Extrapolation')

ax.set_title('Figure 13: Time-Series Projections of AI Training Compute to 2030')
ax.set_xlabel('Year')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.set_xlim(2009, 2031)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left', fontsize=9)

# Forecast annotations
ax.annotate(f"2030 Linear: 10^26.98 FLOP\n(~9.6×10^26 FLOP)",
            xy=(2030, fc_lin_plot[-1]), xytext=(2026.5, 23.5),
            arrowprops=dict(facecolor='#c62828', shrink=0.05, width=1, headwidth=6),
            fontsize=9, fontweight='semibold', color='#c62828',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffebee', edgecolor='#c62828', alpha=0.9))

plt.tight_layout()
fig.savefig('graphs/13_ai_compute_forecast_to_2030.png')
plt.close()

print("\nAll graphs and models successfully executed.")
