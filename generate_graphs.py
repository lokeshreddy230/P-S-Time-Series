import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Set aesthetic styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.titleweight'] = 'bold'
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['axes.labelweight'] = 'semibold'
plt.rcParams['xtick.labelsize'] = 9
plt.rcParams['ytick.labelsize'] = 9

os.makedirs('graphs', exist_ok=True)

df = pd.read_csv('data/notable_ai_models.csv')
df['pub_date'] = pd.to_datetime(df['Publication date'], errors='coerce')
df['Year'] = df['pub_date'].dt.year
df['Month_str'] = df['pub_date'].dt.to_period('M').astype(str)
df['compute_num'] = pd.to_numeric(df['Training compute (FLOP)'], errors='coerce')

valid_compute = df[df['compute_num'] > 0].copy()
valid_compute['log10_compute'] = np.log10(valid_compute['compute_num'])
valid_compute['Frontier_bool'] = valid_compute['Frontier model'].fillna(False).astype(bool)

# Yearly aggregations
yearly_total = df.dropna(subset=['Year']).groupby('Year').size().reset_index(name='Total_Models')
yearly_total['Year'] = yearly_total['Year'].astype(int)

yearly_valid = valid_compute.dropna(subset=['Year']).groupby('Year').agg(
    Valid_Compute_Models=('compute_num', 'count'),
    mean_log10=('log10_compute', 'mean'),
    median_log10=('log10_compute', 'median'),
    q25_log10=('log10_compute', lambda x: x.quantile(0.25)),
    q75_log10=('log10_compute', lambda x: x.quantile(0.75)),
    min_log10=('log10_compute', 'min'),
    max_log10=('log10_compute', 'max')
).reset_index()
yearly_valid['Year'] = yearly_valid['Year'].astype(int)

yearly_combined = pd.merge(yearly_total, yearly_valid, on='Year', how='left').fillna(0)

# -------------------------------------------------------------
# GRAPH 1: Number of AI Models by Year
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(yearly_combined['Year'], yearly_combined['Total_Models'], color='#1f77b4', edgecolor='#0d47a1', width=0.8, alpha=0.85)
ax.set_title('Figure 1: Total Number of Notable AI Models Published by Year (1950–2026)')
ax.set_xlabel('Publication Year')
ax.set_ylabel('Number of Models')
ax.set_xlim(1948, 2028)
ax.grid(True, linestyle='--', alpha=0.5)

# Annotate key inflection points
ax.annotate('Deep Learning Era\n(AlexNet 2012)', xy=(2012, 16), xytext=(1995, 60),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=6),
            fontsize=9, fontweight='semibold')
ax.annotate('LLM Explosion\n(2020–2023)', xy=(2023, 119), xytext=(2002, 110),
            arrowprops=dict(facecolor='crimson', shrink=0.05, width=1, headwidth=6),
            fontsize=9, fontweight='semibold', color='crimson')
ax.annotate('2026 (Partial Year\nthrough Sep 21)', xy=(2026, 78), xytext=(2018, 90),
            arrowprops=dict(facecolor='darkorange', shrink=0.05, width=1, headwidth=6),
            fontsize=9, fontweight='semibold', color='darkorange')
plt.tight_layout()
fig.savefig('graphs/01_models_by_year.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 2: Number of Models with Valid Training Compute by Year
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(yearly_combined['Year'], yearly_combined['Total_Models'], color='#cfd8dc', label='Total Notable Models', width=0.8)
ax.bar(yearly_combined['Year'], yearly_combined['Valid_Compute_Models'], color='#2e7d32', edgecolor='#1b5e20', label='Models with Valid Compute (FLOP)', width=0.8, alpha=0.9)
ax.set_title('Figure 2: Models with Valid Training Compute vs Total Models by Year')
ax.set_xlabel('Publication Year')
ax.set_ylabel('Model Count')
ax.set_xlim(1948, 2028)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9)
plt.tight_layout()
fig.savefig('graphs/02_valid_compute_models_by_year.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 3: Distribution of Training Compute
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(9, 5))
ax.hist(valid_compute['compute_num'], bins=50, color='#6a1b9a', edgecolor='black', alpha=0.75)
ax.set_title('Figure 3: Distribution of Raw AI Model Training Compute (FLOP)')
ax.set_xlabel('Training Compute (FLOP, Raw Linear Scale)')
ax.set_ylabel('Frequency')
ax.grid(True, linestyle='--', alpha=0.5)
ax.text(0.5, 0.7, 'Extreme Positive Skew\nSpans 4.0×10¹ to 1.0×10²⁷ FLOP\nRequires Log10 Transformation',
        transform=ax.transAxes, fontsize=10, bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', alpha=0.9))
plt.tight_layout()
fig.savefig('graphs/03_distribution_training_compute.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 4: Distribution of log10 Training Compute
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(9, 5))
n_bins, bins, patches = ax.hist(valid_compute['log10_compute'], bins=35, color='#0288d1', edgecolor='#01579b', alpha=0.8, density=True)
from scipy.stats import gaussian_kde
kde = gaussian_kde(valid_compute['log10_compute'])
x_grid = np.linspace(valid_compute['log10_compute'].min() - 1, valid_compute['log10_compute'].max() + 1, 300)
ax.plot(x_grid, kde(x_grid), color='crimson', lw=2.5, label='KDE Density Estimate')

mean_val = valid_compute['log10_compute'].mean()
median_val = valid_compute['log10_compute'].median()
ax.axvline(mean_val, color='darkgreen', linestyle='--', lw=2, label=f'Mean = {mean_val:.2f}')
ax.axvline(median_val, color='darkorange', linestyle=':', lw=2, label=f'Median = {median_val:.2f}')

ax.set_title('Figure 4: Distribution of log10 Training Compute (FLOP)')
ax.set_xlabel('log10(Training Compute (FLOP))')
ax.set_ylabel('Probability Density')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9)
plt.tight_layout()
fig.savefig('graphs/04_distribution_log10_compute.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 5: Training Compute vs Publication Year
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.5))
ax.scatter(valid_compute['Year'], valid_compute['compute_num'], color='#d84315', alpha=0.7, edgecolors='black', s=35)
ax.set_title('Figure 5: Training Compute (FLOP, Raw Scale) vs Publication Year')
ax.set_xlabel('Publication Year')
ax.set_ylabel('Training Compute (FLOP)')
ax.set_xlim(1948, 2028)
ax.grid(True, linestyle='--', alpha=0.5)

# Annotate highest model
top_model = valid_compute.loc[valid_compute['compute_num'].idxmax()]
ax.annotate(f"{top_model['Model']} ({top_model['Year']})\n{top_model['compute_num']:.2e} FLOP",
            xy=(top_model['Year'], top_model['compute_num']),
            xytext=(2010, top_model['compute_num'] * 0.8),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=6),
            fontsize=9, fontweight='semibold')
plt.tight_layout()
fig.savefig('graphs/05_compute_vs_year_scatter.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 6: log10 Training Compute vs Publication Year
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.5))
non_frontier = valid_compute[~valid_compute['Frontier_bool']]
frontier = valid_compute[valid_compute['Frontier_bool']]

ax.scatter(non_frontier['Year'], non_frontier['log10_compute'], color='#1565c0', alpha=0.6, s=30, label='Standard Notable Models')
ax.scatter(frontier['Year'], frontier['log10_compute'], color='#d32f2f', edgecolor='black', s=55, label='Frontier Models', marker='^')

ax.set_title('Figure 6: log10 Training Compute (FLOP) vs Publication Year')
ax.set_xlabel('Publication Year')
ax.set_ylabel('log10(Training Compute (FLOP))')
ax.set_xlim(1948, 2028)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')

# Milestone annotations
ax.annotate('Theseus (1950)\nlog10=1.60', xy=(1950, 1.6), xytext=(1953, 4),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=5), fontsize=8)
ax.annotate('AlexNet (2012)\nlog10=17.7', xy=(2012, 17.7), xytext=(1998, 18),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=5), fontsize=8)
ax.annotate('GPT-4 / Grok 3 / GPT-6 Astra\n(2023–2026, log10 > 25)', xy=(2025, 26.5), xytext=(2000, 25.5),
            arrowprops=dict(facecolor='red', shrink=0.05, width=1, headwidth=5), fontsize=8, color='red')
plt.tight_layout()
fig.savefig('graphs/06_log10_compute_vs_year_scatter.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 7: Monthly Number of Valid Compute Observations
# -------------------------------------------------------------
start_m = df['pub_date'].min().to_period('M')
end_m = df['pub_date'].max().to_period('M')
all_months = pd.period_range(start_m, end_m, freq='M')
monthly_counts = valid_compute.groupby(valid_compute['pub_date'].dt.to_period('M')).size()
monthly_ts = monthly_counts.reindex(all_months, fill_value=0)
dates_dt = monthly_ts.index.to_timestamp()

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 6), sharey=False)

# Full history
ax1.bar(dates_dt, monthly_ts.values, width=25, color='#455a64', alpha=0.85)
ax1.set_title('Figure 7A: Monthly Valid Compute Observations (Full History: 1950–2026)')
ax1.set_ylabel('Observed Models')
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.text(0.02, 0.75, f'Total Months: {len(monthly_ts)}\nEmpty Months: {(monthly_ts == 0).sum()} ({(monthly_ts == 0).mean()*100:.1f}%)',
         transform=ax1.transAxes, bbox=dict(boxstyle='round', facecolor='white', alpha=0.85), fontsize=9)

# Zoomed to 2012–2026
mask_recent = dates_dt >= '2012-01-01'
ax2.bar(dates_dt[mask_recent], monthly_ts.values[mask_recent], width=22, color='#00838f', alpha=0.85)
ax2.set_title('Figure 7B: Monthly Observations Zoomed (Modern Era: 2012–2026)')
ax2.set_xlabel('Publication Month')
ax2.set_ylabel('Observed Models')
ax2.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
fig.savefig('graphs/07_monthly_valid_compute_counts.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 8: Yearly Median log10 Training Compute
# -------------------------------------------------------------
yearly_valid_filtered = yearly_valid[yearly_valid['Valid_Compute_Models'] > 0].copy()

fig, ax = plt.subplots(figsize=(10, 5.5))
ax.plot(yearly_valid_filtered['Year'], yearly_valid_filtered['median_log10'], marker='o', color='#0277bd', lw=2.5, label='Yearly Median Y_t = median(log10(FLOP))')
ax.plot(yearly_valid_filtered['Year'], yearly_valid_filtered['mean_log10'], marker='s', color='#f57c00', lw=1.5, linestyle='--', label='Yearly Mean log10(FLOP)')
ax.fill_between(yearly_valid_filtered['Year'], yearly_valid_filtered['q25_log10'], yearly_valid_filtered['q75_log10'], color='#b3e5fc', alpha=0.5, label='Interquartile Range (Q1–Q3)')

# Highlight recommended start year (2010 or 2012)
ax.axvspan(2010, 2026, color='#e8f5e9', alpha=0.4, label='Modern Deep Learning Era (2010–2026, Recommended)')
ax.axvline(2012, color='darkgreen', linestyle=':', lw=2, label='AlexNet Landmark (2012)')

ax.set_title('Figure 8: Yearly Median and Mean log10 Training Compute (1950–2026)')
ax.set_xlabel('Publication Year')
ax.set_ylabel('log10(Training Compute (FLOP))')
ax.set_xlim(1948, 2028)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')
plt.tight_layout()
fig.savefig('graphs/08_yearly_median_log10_compute.png')
plt.close()

# -------------------------------------------------------------
# GRAPH 9: Monthly Median log10 Training Compute where coverage permits
# -------------------------------------------------------------
valid_compute['Month_period'] = valid_compute['pub_date'].dt.to_period('M')
monthly_median = valid_compute.groupby('Month_period')['log10_compute'].agg(['median', 'count']).reset_index()
monthly_median['Month_dt'] = monthly_median['Month_period'].dt.to_timestamp()

# Filter where coverage permits (e.g. 2012 to 2026)
monthly_modern = monthly_median[monthly_median['Month_dt'] >= '2012-01-01'].copy()

fig, ax = plt.subplots(figsize=(11, 5.5))
ax.scatter(monthly_modern['Month_dt'], monthly_modern['median'], color='#d81b60', s=monthly_modern['count']*15, alpha=0.7, edgecolors='black', label='Monthly Median (point size ~ model count)')
ax.plot(monthly_modern['Month_dt'], monthly_modern['median'], color='#d81b60', lw=1, alpha=0.5, linestyle=':')

# Plot yearly median as comparison benchmark
yearly_modern = yearly_valid_filtered[yearly_valid_filtered['Year'] >= 2012]
yearly_dates = pd.to_datetime(yearly_modern['Year'].astype(str) + '-07-01')
ax.plot(yearly_dates, yearly_modern['median_log10'], marker='D', color='#1565c0', lw=2.5, label='Yearly Median Benchmark')

ax.set_title('Figure 9: Monthly Median log10 Training Compute (2012–2026 Modern Era)')
ax.set_xlabel('Date')
ax.set_ylabel('Median log10(Training Compute (FLOP))')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='upper left')

ax.text(0.03, 0.15, 'Notice high monthly volatility & missing months (22.0% gap)\ncompared to stable yearly median trajectory.',
        transform=ax.transAxes, bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.9), fontsize=9)
plt.tight_layout()
fig.savefig('graphs/09_monthly_median_log10_compute.png')
plt.close()

print("All 9 graphs successfully generated and saved in graphs/ directory.")
