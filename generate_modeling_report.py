import os
import pandas as pd
import numpy as np

# Load tables
yearly_df = pd.read_csv('outputs/yearly_ai_compute.csv')
backtest_df = pd.read_csv('outputs/backtest_results.csv')
forecast_df = pd.read_csv('outputs/future_forecasts_2027_2030.csv')

# Format report
report_md = """# Statistical Modeling & Time-Series Forecasting Report

**Project Title:** Time-Series Analysis and Forecasting of AI Model Training Compute Using Real-World Data  
**Academic Curriculum:** B.Tech Probability & Statistics  
**Syllabus Alignment:**
- **Module I:** Descriptive statistics, central tendency, dispersion, histograms, scatter plots
- **Module VII:** Testing of hypothesis (Welch's two-sample t-test for difference in means)
- **Module IX:** Bivariate correlation (Pearson $r$, Spearman $\\rho$), covariance
- **Module X:** Simple linear regression, polynomial (quadratic) regression, residual diagnostics

---

## 1. Research Objective
The primary research objective is to analyze how AI model training compute has evolved historically using empirical real-world observations from `notable_ai_models.csv`, and to evaluate candidate time-series models for forecasting training compute trajectories through 2030.

Prior to model fitting, a rigorous data audit established that:
1. Training compute spans over 25 orders of magnitude ($4.0 \\times 10^1$ to $1.0 \\times 10^{27}$ FLOP).
2. Historical data prior to 2010 suffers from severe sparsity (26 empty years; 93% missing calendar months).
3. The modern deep learning era (2010–2025) provides continuous, unbroken annual coverage with 478 valid compute models (88.5% of the dataset).
4. Calendar year 2026 is partial (recorded through September 21, 2026) and is withheld from training.

---

## 2. Data Definition & Variables
- **Dataset:** `notable_ai_models.csv` (1,072 total records, 540 valid positive compute records).
- **Time Variable ($t$):** Publication calendar year ($t \\in \\{2010, 2011, \\dots, 2025\\}$, $N = 16$).
- **Primary Response Variable ($Y_t$):** Annual median of base-10 logarithmic training compute:
  $$Y_t = \\text{median}\\left(\\log_{10}(\\text{Training compute (FLOP)})\\right) \\quad \\text{for year } t$$
- **Centered Time Variable ($t_{\\text{centered}}$):** $t_{\\text{centered}} = t - 2010$, ensuring numerical stability and orthogonal polynomial estimation.
- **Secondary Response Variable:** Annual median of base-10 logarithmic model parameters:
  $$P_t = \\text{median}\\left(\\log_{10}(\\text{Parameters})\\right) \\quad \\text{for year } t$$

---

## 3. Why Yearly Frequency Was Selected
The data audit evaluated monthly vs. yearly frequency across four objective criteria:
1. **Missing Periods:** Full historical monthly series contains 722 missing months out of 915 (78.91% empty periods). Even in the modern 2012–2026 era, 22.03% of months have zero observations. Imputing 79% of periods violates the core principle of not fabricating missing values. Yearly data has **0% missing periods** from 2010 onward.
2. **Aggregation Stability:** Observed months have a median sample size of only 2.0 models (mean 2.8), causing high sampling noise and conference-dump distortion (e.g., NeurIPS paper submissions). Yearly aggregation averages 31.2 models/year (2012–2026), providing robust Central Limit Theorem behavior.
3. **Contiguous Sample Horizon:** Yearly aggregation yields 16 contiguous, unbroken annual observations (2010–2025), enabling standard time-series regression.
4. **Economic Consistency:** Cluster capital expenditures, chip fabrication iterations (e.g., NVIDIA V100 $\\rightarrow$ A100 $\\rightarrow$ H100 $\\rightarrow$ B200), and datacenter construction operate on multi-year and annual budget cycles.

---

## 4. Log10 Transformation
Raw training compute spans from $40$ FLOP to $1.0001 \\times 10^{27}$ FLOP. In linear space, the variance is non-constant (severe heteroscedasticity) and the distribution exhibits extreme right-skewness:
- Raw compute skewness dwarfs any standard linear model.
- Taking $\\log_{10}(\\text{FLOP})$ maps the exponential scaling of compute into an additive linear framework:
  $$\\log_{10}(\\text{Compute}_t) = \\beta_0 + \\beta_1 t + \\epsilon_t \\iff \\text{Compute}_t = 10^{\\beta_0} \\cdot \\left(10^{\\beta_1}\\right)^t \\cdot 10^{\\epsilon_t}$$
- Logarithmic transformation stabilizes variance, yields approximately normal residuals, and aligns with physical power-law scaling.

---

## 5. Descriptive Statistics of the Modeling Sample (2010–2026)

| Year | Models ($n$) | Median Compute (FLOP) | Mean $\\log_{10}(\\text{FLOP})$ | Median $\\log_{10}(\\text{FLOP})$ ($Y_t$) | Std Dev $\\log_{10}$ | Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2010** | 5 | $1.22 \\times 10^{15}$ | 15.3119 | **15.0868** | 0.8302 | Training Set |
| **2011** | 5 | $2.60 \\times 10^{16}$ | 16.2208 | **16.4150** | 0.6958 | Training Set |
| **2012** | 8 | $2.92 \\times 10^{17}$ | 16.9614 | **17.4649** | 0.9189 | Training Set (AlexNet) |
| **2013** | 10 | $8.33 \\times 10^{16}$ | 16.7597 | **16.8480** | 1.2071 | Training Set |
| **2014** | 14 | $1.01 \\times 10^{18}$ | 17.5834 | **17.9468** | 1.8546 | Training Set |
| **2015** | 11 | $7.00 \\times 10^{18}$ | 18.2629 | **18.8453** | 1.5538 | Training Set |
| **2016** | 16 | $5.27 \\times 10^{18}$ | 18.5797 | **18.6950** | 2.0299 | Training Set (AlphaGo) |
| **2017** | 20 | $5.39 \\times 10^{18}$ | 18.5612 | **18.6985** | 1.9091 | Training Set (Transformer) |
| **2018** | 24 | $1.73 \\times 10^{18}$ | 18.3310 | **18.1410** | 1.8337 | Training Set (BERT/GPT-1) |
| **2019** | 38 | $1.22 \\times 10^{20}$ | 20.0276 | **20.0692** | 1.8714 | Training Set |
| **2020** | 33 | $6.24 \\times 10^{20}$ | 20.6335 | **20.7950** | 1.5595 | Training Set (GPT-3) |
| **2021** | 62 | $1.25 \\times 10^{22}$ | 21.6474 | **22.0911** | 1.5471 | Training Set |
| **2022** | 60 | $1.48 \\times 10^{22}$ | 22.0014 | **22.1704** | 1.6678 | Training Set / Backtest Fold 1 |
| **2023** | 65 | $6.33 \\times 10^{22}$ | 22.3833 | **22.8015** | 1.9687 | Training Set / Backtest Fold 2 |
| **2024** | 46 | $3.02 \\times 10^{24}$ | 24.1293 | **24.4800** | 1.1423 | Training Set / Backtest Fold 3 |
| **2025** | 40 | $3.87 \\times 10^{24}$ | 24.4599 | **24.5877** | 1.1305 | Training Set / Backtest Fold 4 |
| **2026** | 21 | $4.32 \\times 10^{24}$ | 24.6246 | **24.6355** | 0.9333 | **Partial Snapshot (through Sep 21)** |

---

## 6. Pearson Correlation Analysis (Module IX)
- **Variables:** $X = \\text{Year}$, $Y = \\text{median}(\\log_{10}(\\text{FLOP}))$
- **Sample Size:** $N = 16$ (2010–2025)
- **Pearson Coefficient ($r$):** **0.9691**
- **Test Statistic ($t$):** $t = r \\sqrt{\\frac{N-2}{1-r^2}} = 0.9691 \\sqrt{\\frac{14}{1 - 0.9391}} = 14.69$
- **$p$-value:** **$6.699 \\times 10^{-10}$** ($p < 0.001$)
- **Interpretation:** There is an exceptionally strong, statistically significant positive linear association between publication year and median $\\log_{10}$ training compute.

---

## 7. Spearman Rank Correlation Analysis (Module IX)
- **Spearman Coefficient ($\\rho$):** **0.9706**
- **$p$-value:** **$4.723 \\times 10^{-10}$** ($p < 0.001$)
- **Interpretation:** The monotonic rank correlation is virtually identical to Pearson $r$, demonstrating that the upward march of compute over the 2010–2025 period is monotonically persistent across years without rank reversals, save for minor plateaus in 2016–2018.

---

## 8. Simple Linear Regression (Module X)
The simple linear trend specification is:
$$Y_t = \\beta_0 + \\beta_1 t + \\epsilon_t$$
Fitted over $t \\in [2010, 2025]$ ($N = 16$):
- **Intercept ($\\beta_0$):** **$-1156.0523$**
- **Slope ($\\beta_1$):** **$0.5828$** $\\log_{10}(\\text{FLOP})$ per calendar year
- **Standard Error of Slope ($SE(\\beta_1)$):** **$0.0397$**
- **$t$-statistic:** **$14.69$** ($p = 6.699 \\times 10^{-10}$)
- **95% Confidence Interval for Slope:** $[0.4977, 0.6679]$
- **Coefficient of Determination ($R^2$):** **$0.9391$**
- **Adjusted $R^2$:** **$0.9347$**
- **Residual Standard Error ($s_e$):** **$0.7314$**

### Economic & Physical Interpretation of Slope:
- Each calendar year adds **$0.5828$ orders of magnitude** to the median training compute.
- **Implied Annual Multiplicative Factor:**
  $$\\text{growth\\_factor} = 10^{\\beta_1} = 10^{0.5828} \\approx \\mathbf{3.83\\times} \\text{ per year}$$
  Median AI training compute has scaled by approximately **$3.83\\times$ annually** throughout the 2010–2025 period.
- **Implied Doubling Time:**
  $$T_{\\text{double}} = \\frac{\\log_{10}(2)}{\\beta_1} = \\frac{0.30103}{0.5828} \\approx \\mathbf{0.5165} \\text{ years} \\approx \\mathbf{6.20} \\text{ months}$$
  Training compute doubles every **6.2 months**, substantially outstripping classical Moore's Law (hardware density doubling every 18–24 months) due to algorithmic scaling, distributed parallelism, and cluster expansion.

---

## 9. Polynomial (Quadratic) Regression (Module X)
To test whether compute growth is linear on a logarithmic scale or accelerating/decelerating, we fit a quadratic polynomial using centered years ($t_c = \\text{Year} - 2010$):
$$Y_t = \\beta_0 + \\beta_1 t_c + \\beta_2 t_c^2 + \\epsilon_t$$
Fitted estimates:
- **$\\beta_0$ (Intercept at 2010):** **$15.9728$**
- **$\\beta_1$ (Linear term):** **$0.3052$**
- **$\\beta_2$ (Quadratic acceleration term):** **$+0.018502$**
- **Training $R^2$:** **$0.9550$**
- **Adjusted $R^2$:** **$0.9481$**
- **Training RMSE:** **$0.5881$**

The positive quadratic coefficient ($\\beta_2 = +0.0185$) reflects the post-2020 acceleration driven by large language model (LLM) scaling clusters. However, quadratic models must be scrutinized for out-of-sample stability, as positive quadratic terms can lead to runaway extrapolation in multi-year forecasting.

---

## 10. Hypothesis Testing (Module VII)
We test whether the mean annual $\\log_{10}$ compute differs significantly between the early Deep Learning era (2010–2017) and the modern Transformer/LLM era (2018–2025).

### Formulation:
- **Period 1 ($t \\in [2010, 2017]$):** $n_1 = 8$, Mean $\\bar{Y}_1 = 17.5000$, Sample Variance $s_1^2 = 1.7573$
- **Period 2 ($t \\in [2018, 2025]$):** $n_2 = 8$, Mean $\\bar{Y}_2 = 21.8920$, Sample Variance $s_2^2 = 4.7864$
- **Hypotheses:**
  $$H_0: \\mu_1 = \\mu_2 \\quad \\text{vs.} \\quad H_1: \\mu_1 \\neq \\mu_2$$
- **Significance Level:** $\\alpha = 0.05$

### Test Procedure: Welch's Two-Sample $t$-Test (Unequal Variances):
- **Test Statistic:**
  $$t = \\frac{\\bar{Y}_1 - \\bar{Y}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}} = \\frac{17.5000 - 21.8920}{\\sqrt{\\frac{1.7573}{8} + \\frac{4.7864}{8}}} = \\frac{-4.3919}{0.9044} = \\mathbf{-4.8561}$$
- **Welch-Satterthwaite Degrees of Freedom:** $\\nu \\approx 11.53$
- **Two-Tailed $p$-value:** **$4.42 \\times 10^{-4}$** ($p = 0.00044$)
- **95% Confidence Interval for Mean Difference ($\\mu_2 - \\mu_1$):** $[2.4124, 6.3715]$ $\\log_{10}$ FLOP
- **Decision:** **Reject $H_0$ at $\\alpha = 0.05$.**
- **Statistical Interpretation:** The mean annual median $\\log_{10}$ training compute in the 2018–2025 era is significantly higher (by an estimated $4.39$ orders of magnitude, or $\\sim 24,600\\times$) than in the 2010–2017 era.
- **Limitation Note:** Small sample size ($n_1 = n_2 = 8$) implies limited power to detect subtle distributional shifts. Rejection of $H_0$ demonstrates a statistically significant shift in central location, but does not prove causal attribution to any single technology.

---

## 11. Rolling Chronological Backtesting (Task 6)
To avoid lookahead bias and guard against overfitting, models were evaluated strictly using **rolling-origin chronological backtesting**:
- **Fold 1:** Train 2010–2021 $\\rightarrow$ Test 2022
- **Fold 2:** Train 2010–2022 $\\rightarrow$ Test 2023
- **Fold 3:** Train 2010–2023 $\\rightarrow$ Test 2024
- **Fold 4:** Train 2010–2024 $\\rightarrow$ Test 2025

### Detailed Backtest Errors (`outputs/backtest_results.csv`):

| Model | Test Year | Actual $Y_t$ | Predicted $\\hat{Y}_t$ | Error ($Y_t - \\hat{Y}_t$) | Absolute Error | Squared Error |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Naive** | 2022 | 22.1704 | 22.0911 | $+0.0792$ | 0.0792 | 0.0063 |
| **Linear** | 2022 | 22.1704 | 21.6808 | $+0.4896$ | 0.4896 | 0.2397 |
| **Quadratic** | 2022 | 22.1704 | 21.9924 | $+0.1780$ | 0.1780 | 0.0317 |
| **Naive** | 2023 | 22.8015 | 22.1704 | $+0.6311$ | 0.6311 | 0.3983 |
| **Linear** | 2023 | 22.8015 | 22.3324 | $+0.4691$ | 0.4691 | 0.2201 |
| **Quadratic** | 2023 | 22.8015 | 22.7603 | $+0.0411$ | 0.0411 | 0.0017 |
| **Naive** | 2024 | 24.4800 | 22.8015 | $+1.6785$ | 1.6785 | 2.8175 |
| **Linear** | 2024 | 24.4800 | 22.9835 | $+1.4965$ | 1.4965 | 2.2396 |
| **Quadratic** | 2024 | 24.4800 | 23.4873 | $+0.9927$ | 0.9927 | 0.9855 |
| **Naive** | 2025 | 24.5877 | 24.4800 | $+0.1077$ | 0.1077 | 0.0116 |
| **Linear** | 2025 | 24.5877 | 23.9130 | $+0.6747$ | 0.6747 | 0.4552 |
| **Quadratic** | 2025 | 24.5877 | 24.8149 | $-0.2272$ | 0.2272 | 0.0516 |

---

## 12, 13, 14. Performance Metrics & Comparative Evaluation

| Model | Training $R^2$ | Adjusted $R^2$ | Backtest MAE | Backtest RMSE | Out-of-Sample $R^2$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Naive Baseline ($Y_{t-1}$)** | 0.0000 | 0.0000 | 0.6242 | 0.8991 | 0.2649 |
| **Linear Trend Regression** | 0.9391 | 0.9347 | 0.7825 | 0.8881 | 0.2829 |
| **Quadratic Trend Regression**| **0.9550** | **0.9481** | **0.3598** | **0.5173** | **0.7566** |

### Statistical Discussion:
1. **Out-of-Sample Performance:** The Quadratic model decisively outperforms both Naive and Linear baselines across all out-of-sample metrics, reducing RMSE from 0.8881 (linear) to **0.5173** (a **41.7% error reduction**) and achieving an out-of-sample $R^2$ of **0.7566**.
2. **Why Quadratic Succeeded in Backtesting:** The jump from 2023 ($22.80$) to 2024 ($24.48$) represented a step-change in median compute driven by frontier LLM cluster scaling. The quadratic term captured that acceleration, whereas the linear model lagged behind.
3. **Extrapolation Caution:** While the quadratic model wins in 1-step-ahead rolling backtests, extending a positive $t^2$ term multiple years into the future risks exponential explosive divergence.

---

## 15. Residual Diagnostics & Autocorrelation (Task 8)

### Linear Model Residuals:
- Mean Residual: **$0.0000$**
- Residual Standard Deviation ($s_e$): **$0.7314$**
- **Durbin-Watson Statistic ($DW$):** **$1.1714$**
  - Because $DW < 2$, there is evidence of positive first-order autocorrelation in the linear model's residuals. The residuals show consecutive negative errors during 2016–2018 (a temporary plateau) followed by positive errors in 2024–2025 (acceleration).

### Quadratic Model Residuals:
- Mean Residual: **$0.0000$**
- Residual Standard Deviation: **$0.6525$**
- **Durbin-Watson Statistic ($DW$):** **$1.6243$**
  - The Durbin-Watson statistic rises from $1.1714$ to **$1.6243$**, much closer to the benchmark value of $2.0$. The inclusion of the quadratic term absorbs the curvature, eliminating most of the systematic autocorrelation.
- **Normal Q-Q Plot:** Residuals follow the theoretical 45-degree normal line closely, confirming that the normality assumption holds after logarithmic transformation.

---

## 16. 2026 Partial-Year Validation / Snapshot (Task 12)
- **Actual Available 2026 Median $\\log_{10}$ Compute:** **$24.6355$** ($4.32 \\times 10^{24}$ FLOP, 21 models through Sep 21, 2026).
- **Linear Model Prediction for 2026:** **$24.6496$** (Error = **$-0.0141$**)
- **Naive Model Prediction for 2026:** **$24.5877$** (Error = **$+0.0477$**)
- **Quadratic Model Prediction for 2026:** **$25.5932$** (Error = **$-0.9577$**)

> [!NOTE]
> **Explicit Temporal Label:** *"2026 partial-year validation/snapshot"*
> The Linear model predicted the 2026 partial median with remarkable precision (error of only $-0.014$ in $\\log_{10}$ space). The Quadratic model over-projected for 2026 because early-to-mid 2026 releases reflect an consolidation/efficiency plateau rather than continued quadratic acceleration.

---

## 17. Future Forecasts (2027–2030) (Task 13)
Forecasts are generated using the stable Linear Regression model ($Y_t = -1156.0523 + 0.5828 t$) with rigorous 95% prediction intervals:
$$s_{\\text{pred}}(t_0) = s_e \\sqrt{1 + \\frac{1}{n} + \\frac{(t_0 - \\bar{t})^2}{\\sum (t_i - \\bar{t})^2}}$$

| Year | Model-Based Forecast ($\\log_{10}$ FLOP) | 95% Prediction Interval ($\\log_{10}$) | Forecast Compute (FLOP) | 95% Prediction Interval (FLOP) | Quadratic Benchmark (FLOP) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2027** | **25.2324** | $[23.4246, 27.0402]$ | **$1.71 \\times 10^{25}$** | $[2.66 \\times 10^{23}, 1.10 \\times 10^{27}]$ | $3.23 \\times 10^{26}$ |
| **2028** | **25.8151** | $[23.9677, 27.6626]$ | **$6.53 \\times 10^{25}$** | $[9.28 \\times 10^{23}, 4.60 \\times 10^{27}]$ | $2.90 \\times 10^{27}$ |
| **2029** | **26.3979** | $[24.5079, 28.2880]$ | **$2.50 \\times 10^{26}$** | $[3.22 \\times 10^{24}, 1.94 \\times 10^{28}]$ | $2.83 \\times 10^{28}$ |
| **2030** | **26.9807** | $[25.0453, 28.9161]$ | **$9.57 \\times 10^{26}$** | $[1.11 \\times 10^{25}, 8.24 \\times 10^{28}]$ | $3.01 \\times 10^{29}$ |

*Wording Notice: These numbers represent a model-based conditional projection, not guaranteed future compute.*

---

## 18. Limitations & Threats to Validity
1. **Survivorship & Notability Bias:** The dataset tracks historically notable models. Non-notable academic or industrial models with lower compute are omitted.
2. **Proprietary Reporting Declines:** The percentage of notable models with disclosed compute dropped from 78.5% in 2021 to 26.9% in 2026.
3. **Physical & Economic Bottlenecks:** Extrapolating continuous annual growth beyond 2028 faces real-world electrical grid, transformer substation, and capital expenditure constraints ($10^{27}$ FLOP requires tens of megawatts of cluster power).
4. **Polynomial Instability:** While quadratic regression scored best in 1-step backtesting, multi-step quadratic extrapolation ($10^{29.5}$ FLOP by 2030) appears physically implausible.

---

## 19. Statistical Interpretation & Synthesis
- **Correlation:** An exceptionally strong, statistically verified linear relationship ($r = 0.969$, $p < 10^{-9}$) exists between time and $\\log_{10}$ training compute.
- **Scaling Rate:** AI training compute has scaled at approximately **$3.83\\times$ annually** (doubling every **6.2 months**).
- **Structural Shift:** Welch's t-test confirmed a statistically significant regime shift ($p = 0.00044$) between 2010–2017 and 2018–2025.
- **Model Selection:** The linear model provides the most balanced and physically defensible long-range forecasting trajectory ($10^{27}$ FLOP by 2030), perfectly aligning with 2026 partial-year observations.

---

## 20. Recommended Next Project Step
1. **Multivariate Regression:** Integrate model parameters ($P_t$) and training dataset sizes into a Cobb-Douglas production function:
   $$\\log_{10}(\\text{Compute}) = \\alpha + \\beta_1 \\log_{10}(\\text{Parameters}) + \\beta_2 \\log_{10}(\\text{Tokens}) + \\epsilon$$
2. **Confidence Intervals vs Prediction Intervals:** Evaluate how parameter uncertainty scales relative to observation variance.
3. **Final Report Assembly:** Compile complete academic report integrating Module I, VII, IX, and X findings for course submission.
"""

with open('outputs/statistical_modeling_report.md', 'w', encoding='utf-8') as f:
    f.write(report_md)

# Also write to report/
with open('report/statistical_modeling_report.md', 'w', encoding='utf-8') as f:
    f.write(report_md)

print("Generated outputs/statistical_modeling_report.md and report/statistical_modeling_report.md successfully.")
