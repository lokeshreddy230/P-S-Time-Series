import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Set aesthetic style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 10
plt.rcParams['xtick.labelsize'] = 9
plt.rcParams['ytick.labelsize'] = 9

os.makedirs('outputs', exist_ok=True)
os.makedirs('graphs', exist_ok=True)
os.makedirs('report', exist_ok=True)

csv_path = 'data/notable_ai_models.csv'
df = pd.read_csv(csv_path)

print("=== TASK 2: LOAD AND AUDIT DATASET ===")
n_rows, n_cols = df.shape
print(f"1. Rows: {n_rows}")
print(f"2. Columns: {n_cols}")
print(f"3. Column Names: {df.columns.tolist()}")
print("\n4. Data Types:")
print(df.dtypes)
n_duplicates = df.duplicated().sum()
print(f"\n5. Duplicate Rows: {n_duplicates}")

print("\n6 & 7. Missing values and percentages:")
missing_series = df.isnull().sum()
missing_pct_series = (missing_series / n_rows) * 100
missing_df = pd.DataFrame({
    'Missing_Count': missing_series,
    'Missing_Percentage': missing_pct_series
})
print(missing_df)

target_cols = [
    'Model', 'Organization', 'Publication date', 'Parameters',
    'Training compute (FLOP)', 'Training time (hours)', 'Training hardware',
    'Training power draw (W)', 'Training compute cost (2023 USD)', 'Frontier model'
]
print("\nTarget Columns Inspection:")
for col in target_cols:
    if col in df.columns:
        cnt = df[col].isnull().sum()
        pct = (cnt / n_rows) * 100
        print(f" - {col}: {cnt} missing ({pct:.2f}%), dtype: {df[col].dtype}")
    else:
        # Check matching columns
        matching = [c for c in df.columns if col.lower() in c.lower()]
        print(f" - {col}: NOT FOUND (matching: {matching})")

print("\n=== TASK 3: PUBLICATION DATE ANALYSIS ===")
pub_date_raw = df['Publication date']
pub_date_converted = pd.to_datetime(pub_date_raw, errors='coerce')
missing_dates = pub_date_raw.isnull().sum()
invalid_dates = pub_date_raw.notnull().sum() - pub_date_converted.notnull().sum()

earliest_date = pub_date_converted.min()
latest_date = pub_date_converted.max()

print(f"Earliest date: {earliest_date}")
print(f"Latest date: {latest_date}")
print(f"Invalid dates: {invalid_dates}")
print(f"Missing dates: {missing_dates}")

df['pub_date_clean'] = pub_date_converted
df['Year'] = df['pub_date_clean'].dt.year
df['Month'] = df['pub_date_clean'].dt.to_period('M').astype(str)
df.loc[df['pub_date_clean'].isnull(), 'Month'] = np.nan

yearly_model_counts = df.dropna(subset=['Year']).groupby('Year').size().reset_index(name='Number of Models')
yearly_model_counts['Year'] = yearly_model_counts['Year'].astype(int)
yearly_model_counts.to_csv('outputs/yearly_model_counts.csv', index=False)
print("\nYearly Model Counts (saved to outputs/yearly_model_counts.csv):")
print(yearly_model_counts)

print("\n=== TASK 4: TRAINING COMPUTE DATA QUALITY ===")
raw_compute = df['Training compute (FLOP)']
numeric_compute = pd.to_numeric(raw_compute, errors='coerce')
total_records = len(df)
valid_numeric_compute = numeric_compute.notnull().sum()
missing_compute_raw = raw_compute.isnull().sum()
non_numeric_compute = raw_compute.notnull().sum() - valid_numeric_compute
zero_compute = (numeric_compute == 0).sum()
negative_compute = (numeric_compute < 0).sum()
positive_compute = (numeric_compute > 0).sum()

print(f"Total records: {total_records}")
print(f"Valid numeric compute records: {valid_numeric_compute}")
print(f"Missing compute records (raw NaN): {missing_compute_raw}")
print(f"Invalid/non-numeric compute strings: {non_numeric_compute}")
print(f"Zero compute values: {zero_compute}")
print(f"Negative compute values: {negative_compute}")
print(f"Positive compute values: {positive_compute}")

df['compute_numeric'] = numeric_compute
clean_compute_df = df[df['compute_numeric'] > 0].copy()
compute_stats = {
    'count': len(clean_compute_df),
    'minimum': clean_compute_df['compute_numeric'].min(),
    'maximum': clean_compute_df['compute_numeric'].max(),
    'mean': clean_compute_df['compute_numeric'].mean(),
    'median': clean_compute_df['compute_numeric'].median(),
    'std': clean_compute_df['compute_numeric'].std()
}
print("\nClean Training Compute Stats (FLOP):")
for k, v in compute_stats.items():
    print(f" - {k}: {v:e}" if isinstance(v, float) else f" - {k}: {v}")

# Parameters check
raw_params = df['Parameters']
numeric_params = pd.to_numeric(raw_params, errors='coerce')
valid_params = numeric_params.notnull().sum()
pos_params = (numeric_params > 0).sum()
df['params_numeric'] = numeric_params
clean_params_df = df[df['params_numeric'] > 0].copy()
params_stats = {
    'count': len(clean_params_df),
    'minimum': clean_params_df['params_numeric'].min(),
    'maximum': clean_params_df['params_numeric'].max(),
    'mean': clean_params_df['params_numeric'].mean(),
    'median': clean_params_df['params_numeric'].median(),
    'std': clean_params_df['params_numeric'].std()
}
print("\nClean Parameters Stats:")
for k, v in params_stats.items():
    print(f" - {k}: {v:e}" if isinstance(v, float) else f" - {k}: {v}")

print("\n=== TASK 5: LOG TRANSFORMATION ===")
clean_compute_df['log10_compute'] = np.log10(clean_compute_df['compute_numeric'])
df['log10_compute'] = np.where(df['compute_numeric'] > 0, np.log10(df['compute_numeric']), np.nan)

log_compute_stats = {
    'minimum': clean_compute_df['log10_compute'].min(),
    'maximum': clean_compute_df['log10_compute'].max(),
    'mean': clean_compute_df['log10_compute'].mean(),
    'median': clean_compute_df['log10_compute'].median(),
    'std': clean_compute_df['log10_compute'].std()
}
print("\nlog10 Training Compute Stats:")
for k, v in log_compute_stats.items():
    print(f" - {k}: {v:.4f}")

clean_params_df['log10_params'] = np.log10(clean_params_df['params_numeric'])
df['log10_params'] = np.where(df['params_numeric'] > 0, np.log10(df['params_numeric']), np.nan)
log_params_stats = {
    'minimum': clean_params_df['log10_params'].min(),
    'maximum': clean_params_df['log10_params'].max(),
    'mean': clean_params_df['log10_params'].mean(),
    'median': clean_params_df['log10_params'].median(),
    'std': clean_params_df['log10_params'].std()
}
print("\nlog10 Parameters Stats:")
for k, v in log_params_stats.items():
    print(f" - {k}: {v:.4f}")

print("\n=== TASK 6: YEARLY COMPUTE COVERAGE ===")
yearly_compute_agg = clean_compute_df.groupby('Year').agg(
    models_with_valid_compute=('compute_numeric', 'count'),
    mean_training_compute=('compute_numeric', 'mean'),
    median_training_compute=('compute_numeric', 'median'),
    mean_log10_compute=('log10_compute', 'mean'),
    median_log10_compute=('log10_compute', 'median'),
    std_log10_compute=('log10_compute', 'std'),
    min_compute=('compute_numeric', 'min'),
    max_compute=('compute_numeric', 'max')
).reset_index()
yearly_compute_agg['Year'] = yearly_compute_agg['Year'].astype(int)
yearly_compute_agg.to_csv('outputs/yearly_ai_compute.csv', index=False)
print("Yearly AI Compute Table (saved to outputs/yearly_ai_compute.csv):")
print(yearly_compute_agg[['Year', 'models_with_valid_compute', 'mean_log10_compute', 'median_log10_compute', 'std_log10_compute']])

print("\n=== TASK 7: MONTHLY COMPUTE COVERAGE ===")
clean_compute_df['Month_dt'] = clean_compute_df['pub_date_clean'].dt.to_period('M')
monthly_agg = clean_compute_df.groupby('Month_dt').agg(
    models_with_valid_compute=('compute_numeric', 'count'),
    median_training_compute=('compute_numeric', 'median'),
    median_log10_compute=('log10_compute', 'median'),
    mean_log10_compute=('log10_compute', 'mean')
).reset_index()
monthly_agg['Month'] = monthly_agg['Month_dt'].astype(str)
monthly_agg_out = monthly_agg[['Month', 'models_with_valid_compute', 'median_training_compute', 'median_log10_compute', 'mean_log10_compute']]
monthly_agg_out.to_csv('outputs/monthly_ai_compute.csv', index=False)

# Calendar month index
start_month = df['pub_date_clean'].min().to_period('M')
end_month = df['pub_date_clean'].max().to_period('M')
all_months = pd.period_range(start=start_month, end=end_month, freq='M')
monthly_coverage = pd.DataFrame({'Month_dt': all_months})
monthly_coverage['Month'] = monthly_coverage['Month_dt'].astype(str)
monthly_coverage = monthly_coverage.merge(monthly_agg_out, on='Month', how='left')
monthly_coverage['models_with_valid_compute'] = monthly_coverage['models_with_valid_compute'].fillna(0).astype(int)
monthly_coverage['has_observation'] = monthly_coverage['models_with_valid_compute'] > 0
monthly_coverage[['Month', 'models_with_valid_compute', 'median_training_compute', 'median_log10_compute', 'mean_log10_compute', 'has_observation']].to_csv('outputs/monthly_coverage.csv', index=False)

total_calendar_months = len(monthly_coverage)
months_with_obs = monthly_coverage['has_observation'].sum()
months_zero_obs = total_calendar_months - months_with_obs
pct_months_no_obs = (months_zero_obs / total_calendar_months) * 100
observed_months_df = monthly_coverage[monthly_coverage['has_observation']]
avg_models_per_observed_month = observed_months_df['models_with_valid_compute'].mean()
median_models_per_observed_month = observed_months_df['models_with_valid_compute'].median()

print(f"Total calendar months: {total_calendar_months}")
print(f"Months with >=1 valid compute observation: {months_with_obs}")
print(f"Months with 0 compute observations: {months_zero_obs}")
print(f"Percentage of months with no compute observation: {pct_months_no_obs:.2f}%")
print(f"Average models per observed month: {avg_models_per_observed_month:.2f}")
print(f"Median models per observed month: {median_models_per_observed_month:.1f}")

print("\n=== TASK 8: RECENT-DATA COVERAGE ===")
recent_years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]
recent_records = []
for y in recent_years:
    total_m = (df['Year'] == y).sum()
    valid_c = ((clean_compute_df['Year'] == y)).sum()
    cov_pct = (valid_c / total_m * 100) if total_m > 0 else 0.0
    recent_records.append({'Year': y, 'Total Models': total_m, 'Models with Valid Compute': valid_c, 'Compute Coverage %': cov_pct})
recent_df = pd.DataFrame(recent_records)
print(recent_df.to_string(index=False))

latest_2026_date = df[df['Year'] == 2026]['pub_date_clean'].max()
print(f"\nExact latest 2026 date in CSV: {latest_2026_date}")

print("\n=== TASK 11: HISTORICAL SPARSITY CHECK ===")
full_year_range = range(int(df['Year'].min()), int(df['Year'].max()) + 1)
year_sparsity = []
for y in full_year_range:
    tot = (df['Year'] == y).sum()
    val = (clean_compute_df['Year'] == y).sum()
    year_sparsity.append({'Year': y, 'Total_Models': tot, 'Valid_Compute': val})
year_sparsity_df = pd.DataFrame(year_sparsity)
zero_years = year_sparsity_df[year_sparsity_df['Valid_Compute'] == 0]['Year'].tolist()
low_years = year_sparsity_df[(year_sparsity_df['Valid_Compute'] > 0) & (year_sparsity_df['Valid_Compute'] < 5)]['Year'].tolist()
strong_years = year_sparsity_df[year_sparsity_df['Valid_Compute'] >= 5]['Year'].tolist()
print(f"Years with 0 compute records ({len(zero_years)}): {zero_years}")
print(f"Years with low compute records (1-4) ({len(low_years)}): {low_years}")
print(f"Years with strong compute records (>=5) ({len(strong_years)}): {strong_years}")

print("\n=== TASK 12: CHECK OUTLIERS ===")
# IQR on compute_numeric
q1_raw = clean_compute_df['compute_numeric'].quantile(0.25)
q3_raw = clean_compute_df['compute_numeric'].quantile(0.75)
iqr_raw = q3_raw - q1_raw
outliers_raw = clean_compute_df[(clean_compute_df['compute_numeric'] < q1_raw - 1.5*iqr_raw) | (clean_compute_df['compute_numeric'] > q3_raw + 1.5*iqr_raw)]
print(f"Raw compute IQR outliers: {len(outliers_raw)}")

# IQR on log10_compute
q1_log = clean_compute_df['log10_compute'].quantile(0.25)
q3_log = clean_compute_df['log10_compute'].quantile(0.75)
iqr_log = q3_log - q1_log
lower_log = q1_log - 1.5 * iqr_log
upper_log = q3_log + 1.5 * iqr_log
outliers_log = clean_compute_df[(clean_compute_df['log10_compute'] < lower_log) | (clean_compute_df['log10_compute'] > upper_log)]
print(f"log10 compute IQR bounds: [{lower_log:.2f}, {upper_log:.2f}]")
print(f"log10 compute IQR outliers: {len(outliers_log)}")
if len(outliers_log) > 0:
    print("log10 compute outliers:")
    print(outliers_log[['Model', 'Year', 'compute_numeric', 'log10_compute']])

# Check top 5 and bottom 5 compute models
print("\nTop 5 compute models:")
print(clean_compute_df.sort_values(by='compute_numeric', ascending=False)[['Model', 'Organization', 'Year', 'compute_numeric', 'log10_compute', 'Frontier model']].head(5))
print("\nBottom 5 compute models:")
print(clean_compute_df.sort_values(by='compute_numeric', ascending=True)[['Model', 'Organization', 'Year', 'compute_numeric', 'log10_compute', 'Frontier model']].head(5))
