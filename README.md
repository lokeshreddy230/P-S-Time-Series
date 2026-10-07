# Time-Series Analysis and Forecasting of AI Model Training Compute Using Real-World Data

**B.Tech Probability & Statistics Project**  
*Curriculum Alignment: Modules I, VII, IX, X*

---

## Project Overview

Over the past decade, artificial intelligence has transitioned from specialized academic benchmarks to frontier foundation models driving global technological and economic transformations. A central driver of this capability surge is the exponential scaling of computational resources expended during training.

This project investigates the historical scaling trajectory of computational investment in AI systems using empirical real-world records and develops a statistically defensible time-series framework to forecast computational requirements through 2030.

### Key Research Questions
1. How has computational expenditure (FLOP) for notable AI systems scaled historically from 2010 to 2025?
2. Why is yearly aggregation statistically superior to monthly frequency given real-world data sparsity?
3. Which statistical model—Naive baseline, Linear Trend OLS, Polynomial Quadratic OLS, Holt's Linear Trend, or ARIMA specifications—provides the most robust and stable multi-step extrapolations under rigorous out-of-sample backtesting?
4. What are the projected training compute requirements for frontier AI models through 2030, and what are their physical/economic constraints?

---

## Dataset

- **Primary Source:** Epoch AI Notable AI Models Dataset (`data/notable_ai_models.csv`)
- **Total Models Recorded:** 1,072 AI models spanning 1950 to 2026.
- **Valid Positive Compute Records:** 540 models with empirical training compute observations.
- **Primary Modeling Window:** 2010–2025 ($N = 16$ complete calendar years), tracking modern deep learning from pre-AlexNet to modern frontier LLMs.
- **Holdout Observation:** 2026 partial-year snapshot through September 21, 2026 ($N = 21$ models, $Y_{2026} = 24.6355$).

---

## Methodology

The end-to-end analytical pipeline follows strict statistical principles:

```
Data Cleaning & Audit
  │
  ▼
Yearly Aggregation & Frequency Selection
  │
  ▼
Log10 Transformation (Variance Stabilization)
  │
  ▼
Descriptive Statistics & Normality Assessment
  │
  ▼
Bivariate Correlation Analysis (Pearson & Spearman)
  │
  ▼
Regression Modeling (Linear OLS vs. Quadratic OLS)
  │
  ▼
Time-Series Forecasting (Holt's Linear, ARIMA(0,1,0)+drift, ARIMA(1,1,0)+drift)
  │
  ▼
Chronological 7-Fold Rolling-Origin Backtesting (2019–2025)
  │
  ▼
Model Selection Decision Matrix
  │
  ▼
Multi-Step Forecasting (2027–2030) with 95% Prediction Intervals
```

### Why Yearly Aggregation?
An audit of monthly granularity revealed a **78.91% missing period rate** (722 empty months out of 915 calendar months). Even post-2012, 22.03% of months had zero observations. Yearly aggregation resolves this completely:
- **0% missing periods** from 2010 onward.
- Satisfies sample size requirements for central limit behaviors (averaging 31.2 models/year in 2012–2026).
- Aligns with semiconductor architecture release cycles (Pascal $\rightarrow$ Volta $\rightarrow$ Ampere $\rightarrow$ Hopper $\rightarrow$ Blackwell) and annual capital expenditure budgeting.

### Logarithmic Transformation
Raw training compute spans over 25 orders of magnitude ($40$ FLOP to $1.0001 \times 10^{27}$ FLOP). In linear space, variance expands astronomically. Taking base-10 logarithms:
$$Y_t = \text{median}\left(\log_{10}(\text{Training compute (FLOP)})\right) \quad \text{for year } t$$
This linearizes exponential scaling:
$$\log_{10}(\text{Compute}_t) = \beta_0 + \beta_1 t + \epsilon_t \iff \text{Compute}_t = 10^{\beta_0} \cdot (10^{\beta_1})^t \cdot 10^{\epsilon_t}$$

---

## Validated Statistical Results

### Correlation Analysis (Module IX)
- **Pearson Correlation Coefficient ($r$):** **0.9691** ($p = 6.699 \times 10^{-10}$, $N = 16$)
- **Spearman Rank Correlation ($\rho$):** **0.9706** ($p = 4.723 \times 10^{-10}$, $N = 16$)
- *Interpretation:* Near-perfect monotonic linear relationship between calendar year and log10 training compute over 2010–2025.

### Primary Linear Trend Model (Module X)
$$\hat{Y}_t = -1156.0523 + 0.5828 \times \text{Year}$$
- **Intercept ($\beta_0$):** $-1156.0523$
- **Slope ($\beta_1$):** $0.5828$ $\log_{10}(\text{FLOP})/\text{year}$ ($SE = 0.0397$, $p = 6.699 \times 10^{-10}$)
- **95% Confidence Interval for $\beta_1$:** $[0.4977, 0.6679]$
- **Coefficient of Determination ($R^2$):** **0.9391** (Adjusted $R^2 = 0.9347$)
- **Residual Standard Error ($s_e$):** $0.7314$
- **Implied Annual Growth Factor:** $10^{0.5828} \approx \mathbf{3.83\times}$ per year
- **Implied Doubling Time:** $T_2 = \frac{\log_{10}(2)}{\beta_1} \approx \mathbf{0.52\text{ years}}$ ($\approx 6.2\text{ months}$)

### Chronological 7-Fold Rolling-Origin Backtesting (2019–2025)

Models were evaluated out-of-sample across 7 consecutive folds without lookahead bias:

| Model Specification | 7-Fold Backtest MAE | 7-Fold Backtest RMSE | Out-of-Sample $R^2$ | 2026 Snapshot Error | Verdict |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Linear Trend (OLS)** | **0.8023** | **0.8900** | **0.6818** | **$-0.0141$** | **Selected Primary Model** |
| **ARIMA(0,1,0)+drift** | **0.6701** | **0.8241** | **0.7272** | $-0.5856$ | Strong Time-Series Benchmark |
| **ARIMA(1,1,0)+drift** | 0.7083 | 0.8407 | 0.7161 | $-0.7018$ | Over-parameterized ($p=0.395$) |
| **Holt Linear Trend** | 0.8481 | 1.0035 | 0.5955 | $-0.5799$ | Adaptive Benchmark |
| **Naive Baseline ($Y_{t-1}$)** | 0.9210 | 1.1438 | 0.4744 | $+0.0477$ | Baseline Reference |
| **Quadratic Trend (OLS)** | 0.9454 | 1.2088 | 0.4130 | $-0.9577$ | **Rejected (Overfitting & Collapse)** |

> **Key Methodological Finding (The Quadratic Overfitting Collapse):**  
> While Quadratic regression attained a higher training $R^2$ ($0.9550$), it suffered severe instability across the 7-fold backtest (RMSE = 1.2088). In Fold 1 (train 2010–2018), the quadratic curve bent downwards and underpredicted 2019 by $2.10$ orders of magnitude. Furthermore, multi-year extrapolation reaches $3.01 \times 10^{29}$ FLOP by 2030, an physically impossible compute scale requiring dedicated gigawatt power infrastructure for a median model.

---

## Final Compute Forecasts (2027–2030)

Conditional projections derived from the primary Linear Trend OLS model with 95% prediction intervals:

| Year | Forecast ($\log_{10}$ FLOP) | 95% Prediction Interval ($\log_{10}$) | Forecast Compute (FLOP) | 95% Prediction Interval (FLOP) |
| :---: | :---: | :---: | :---: | :---: |
| **2027** | **25.2324** | $[23.4246, 27.0402]$ | **$1.71 \times 10^{25}$** | $[2.66 \times 10^{23}, 1.10 \times 10^{27}]$ |
| **2028** | **25.8151** | $[23.9677, 27.6626]$ | **$6.53 \times 10^{25}$** | $[9.28 \times 10^{23}, 4.60 \times 10^{27}]$ |
| **2029** | **26.3979** | $[24.5079, 28.2880]$ | **$2.50 \times 10^{26}$** | $[3.22 \times 10^{24}, 1.94 \times 10^{28}]$ |
| **2030** | **26.9807** | $[25.0453, 28.9161]$ | **$9.57 \times 10^{26}$** | $[1.11 \times 10^{25}, 8.24 \times 10^{28}]$ |

*Disclaimer: These projections reflect empirical statistical extrapolations under the assumption that historical technological trends continue.*

---

## Limitations & Threats to Validity

1. **Small Sample Size ($N = 16$):** The primary annual series consists of 16 complete years (2010–2025). As a result, forecast intervals widen steadily toward 2030.
2. **Missing Compute Disclosures:** 49.63% of records in the raw dataset do not report FLOP figures, rising to over 70% in 2026 due to commercial frontier secrecy.
3. **Partial 2026 Observation:** Calendar year 2026 is recorded through September 21, 2026 (~8.7 months). The median $Y_{2026} = 24.6355$ is an interim snapshot.
4. **Physical & Economic Ceilings:** Continued exponential growth faces real-world bottlenecks, including power grid interconnect delays, thermal dissipation limits, chip fab capacity, and multi-billion-dollar training cluster financing.

---

## Project Structure

```
AI_Compute_Time_Series/
├── data/
│   └── notable_ai_models.csv          # Raw Epoch AI dataset (1,072 models)
├── outputs/
│   ├── data_audit_report.txt          # Automated data audit findings
│   ├── yearly_ai_compute.csv          # Yearly aggregated statistics (2010-2026)
│   ├── yearly_model_counts.csv        # Annual counts of all vs. valid models
│   ├── monthly_ai_compute.csv         # Monthly compute aggregation
│   ├── monthly_coverage.csv           # Monthly completeness audit
│   ├── backtest_results.csv           # 7-fold rolling-origin backtest error matrix
│   ├── final_model_comparison.csv     # Comprehensive multi-model evaluation table
│   ├── final_forecast_2027_2030.csv   # Primary linear forecast with 95% PI
│   └── statistical_modeling_report.md # Full statistical analysis document
├── notebooks/
│   ├── 01_data_exploration.ipynb      # EDA, cleaning, distribution & log transforms
│   └── 02_statistical_modeling.ipynb  # Regression, time-series, backtesting & forecast
├── graphs/
│   ├── 01_models_by_year.png
│   ├── 02_valid_compute_models_by_year.png
│   ├── 03_distribution_training_compute.png
│   ├── 04_distribution_log10_compute.png
│   ├── 05_compute_vs_year_scatter.png
│   ├── 06_log10_compute_vs_year_scatter.png
│   ├── 07_monthly_valid_compute_counts.png
│   ├── 08_yearly_median_log10_compute.png
│   ├── 09_monthly_median_log10_compute.png
│   ├── 10_actual_vs_predicted_backtest.png
│   ├── 11_residuals_linear.png
│   ├── 12_residuals_quadratic.png
│   ├── 13_ai_compute_forecast_to_2030.png
│   ├── 14_parameters_scaling_trend.png
│   ├── 15_correlation_linear_fit.png
│   └── 16_final_model_selection_and_forecast.png
├── report/
│   ├── data_audit_report.md           # Granular audit and frequency analysis
│   └── statistical_modeling_report.md # Comprehensive final statistical report
├── frontend/                          # Interactive Next.js Dashboard
│   ├── src/                           # Dashboard UI components & views
│   ├── package.json                   # Web application dependencies
│   └── tsconfig.json                  # TypeScript configuration
├── audit_pipeline.py                  # Data cleaning and aggregation pipeline
├── run_statistical_modeling.py        # Core statistical regression & Holt modeling
├── update_time_series_modeling.py     # ARIMA and backtesting pipeline
├── execute_final_selection.py         # 7-fold backtesting & final model selection
├── export_frontend_data.py            # JSON data export for the Next.js UI
├── generate_graphs.py                 # Graph generation script
├── requirements.txt                   # Python environment dependencies
└── README.md                          # Project documentation
```

---

## Reproduction Guide

### 1. Python Environment Setup
Ensure Python 3.10+ is installed:
```bash
# Clone the repository
git clone https://github.com/lokeshreddy230/P-S-Time-Series.git
cd P-S-Time-Series

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Analysis Scripts
Execute the pipeline scripts in sequence:
```bash
# Audit data and generate clean aggregations
python audit_pipeline.py

# Run statistical modeling (regression, Holt, residual analysis)
python run_statistical_modeling.py

# Run ARIMA and rolling backtesting
python update_time_series_modeling.py

# Execute 7-fold backtest and generate final forecast outputs
python execute_final_selection.py

# Export aggregated data to the dashboard
python export_frontend_data.py
```

### 3. Interactive Jupyter Notebooks
Launch the notebooks to inspect interactive step-by-step calculations:
```bash
jupyter notebook notebooks/
```
- Open `01_data_exploration.ipynb` for initial data exploration.
- Open `02_statistical_modeling.ipynb` for model comparison and selection.

### 4. Interactive Next.js Dashboard
To run the interactive web application locally:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
