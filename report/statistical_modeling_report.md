# Statistical Modeling & Final Model Selection Report

**Project Title:** Time-Series Analysis and Forecasting of AI Model Training Compute Using Real-World Data  
**Curriculum Alignment:** B.Tech Probability & Statistics (Modules I, VII, IX, X)  
**Primary Dataset:** `notable_ai_models.csv` (1,072 records, 540 valid positive compute records)  
**Primary Target Variable:**
$$Y_t = \text{median}\left(\log_{10}(\text{Training compute (FLOP)})\right) \quad \text{for year } t$$

---

## 1. Executive Summary & Objective
The research objective is to analyze historical empirical scaling in AI model training compute from real-world data and establish a rigorous, defensible forecasting model for compute trajectories through 2030.

Following the preliminary exploration, this phase executes a comprehensive statistical evaluation:
1. **Extended 7-Fold Rolling-Origin Backtesting (2019–2025):** We test all candidate models across 7 consecutive out-of-sample evaluation folds without lookahead bias.
2. **Multi-Model Comparison:** Evaluating six candidate specifications across six distinct modeling paradigms:
   - Naive No-Change Baseline ($Y_{t-1}$)
   - Simple Linear Trend Regression (OLS)
   - Polynomial Quadratic Trend Regression (OLS)
   - Holt's Linear Trend (Double Exponential Smoothing)
   - ARIMA(0,1,0) with drift (Random Walk with Drift)
   - ARIMA(1,1,0) with drift (First-Order Autoregressive Integrated Model)
3. **Multi-Step Extrapolation Stability:** Evaluating whether models produce stable, physically plausible forecasts through 2030 or explode quadratically.
4. **2026 Holdout Snapshot Check:** Comparing each model's forecast against the available 2026 partial-year snapshot ($Y_{2026} = 24.6355$).
5. **Statistical Model Selection:** Selecting the final primary forecasting model based on transparent, data-driven criteria rather than training $R^2$ alone.

---

## 2. Dataset Definition & Variables
- **Dataset:** `notable_ai_models.csv` (1,072 records, 540 valid compute records).
- **Time Variable ($t$):** Publication calendar year ($t \in \{2010, 2011, \dots, 2025\}$, $N = 16$ complete years).
- **Primary Response Variable ($Y_t$):** Annual median of base-10 logarithmic training compute:
  $$Y_t = \text{median}\left(\log_{10}(\text{Training compute (FLOP)})\right) \quad \text{for year } t$$
- **Centered Time Variable ($t_c$):** $t_c = t - 2010$, ensuring numerical stability for polynomial terms.
- **Holdout Evaluation Period:** 2026 partial-year snapshot (models published through September 21, 2026; $Y_{2026} = 24.6355$).

---

## 3. Why Yearly Frequency Was Selected
The initial audit established that a full-history monthly time series has a catastrophic **78.91% missing period rate** (722 empty months out of 915 calendar months). Even in the post-2012 era, 22.03% of calendar months have zero observations. Imputing 79% of missing periods would require synthetic fabrication. In contrast, yearly aggregation:
- Yields **0% missing periods** from 2010 onward.
- Provides substantial annual sample sizes (averaging 31.2 models/year in 2012–2026), satisfying the Central Limit Theorem.
- Aligns with macroeconomic semiconductor fabrication cycles (e.g., NVIDIA Pascal $\rightarrow$ Volta $\rightarrow$ Ampere $\rightarrow$ Hopper $\rightarrow$ Blackwell) and annual capital expenditure budgeting.

---

## 4. Log10 Transformation
Raw training compute spans from $40$ FLOP to $1.0001 \times 10^{27}$ FLOP (over 25 orders of magnitude). In linear space, variance expands astronomically, violating homoscedasticity. Taking $\log_{10}(\text{FLOP})$ linearizes exponential growth:
$$\log_{10}(\text{Compute}_t) = \beta_0 + \beta_1 t + \epsilon_t \iff \text{Compute}_t = 10^{\beta_0} \cdot (10^{\beta_1})^t \cdot 10^{\epsilon_t}$$
Variance is stabilized, residuals are approximately normal, and additive time-series techniques become applicable.

---

## 5. Descriptive Statistics of the Modeling Sample (2010–2026)

| Year | Valid Models | Median Compute (FLOP) | Mean $\log_{10}(\text{FLOP})$ | Median $\log_{10}(\text{FLOP})$ ($Y_t$) | Std Dev $\log_{10}$ | Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2010** | 5 | $1.22 \times 10^{15}$ | 15.3119 | **15.0868** | 0.8302 | Training Set |
| **2011** | 5 | $2.60 \times 10^{16}$ | 16.2208 | **16.4150** | 0.6958 | Training Set |
| **2012** | 8 | $2.92 \times 10^{17}$ | 16.9614 | **17.4649** | 0.9189 | Training Set (AlexNet) |
| **2013** | 10 | $8.33 \times 10^{16}$ | 16.7597 | **16.8480** | 1.2071 | Training Set |
| **2014** | 14 | $1.01 \times 10^{18}$ | 17.5834 | **17.9468** | 1.8546 | Training Set |
| **2015** | 11 | $7.00 \times 10^{18}$ | 18.2629 | **18.8453** | 1.5538 | Training Set |
| **2016** | 16 | $5.27 \times 10^{18}$ | 18.5797 | **18.6950** | 2.0299 | Training Set |
| **2017** | 20 | $5.39 \times 10^{18}$ | 18.5612 | **18.6985** | 1.9091 | Training Set |
| **2018** | 24 | $1.73 \times 10^{18}$ | 18.3310 | **18.1410** | 1.8337 | Training Set |
| **2019** | 38 | $1.22 \times 10^{20}$ | 20.0276 | **20.0692** | 1.8714 | Training / Backtest Fold 1 |
| **2020** | 33 | $6.24 \times 10^{20}$ | 20.6335 | **20.7950** | 1.5595 | Training / Backtest Fold 2 |
| **2021** | 62 | $1.25 \times 10^{22}$ | 21.6474 | **22.0911** | 1.5471 | Training / Backtest Fold 3 |
| **2022** | 60 | $1.48 \times 10^{22}$ | 22.0014 | **22.1704** | 1.6678 | Training / Backtest Fold 4 |
| **2023** | 65 | $6.33 \times 10^{22}$ | 22.3833 | **22.8015** | 1.9687 | Training / Backtest Fold 5 |
| **2024** | 46 | $3.02 \times 10^{24}$ | 24.1293 | **24.4800** | 1.1423 | Training / Backtest Fold 6 |
| **2025** | 40 | $3.87 \times 10^{24}$ | 24.4599 | **24.5877** | 1.1305 | Training / Backtest Fold 7 |
| **2026** | 21 | $4.32 \times 10^{24}$ | 24.6246 | **24.6355** | 0.9333 | **PARTIAL SNAPSHOT (through Sep 21)** |

---

## 6. Correlation Analysis (Module IX)
- **Pearson Coefficient ($r$):** **0.9691** ($p = 6.699 \times 10^{-10}$, $N = 16$)
- **Spearman Rank Coefficient ($\rho$):** **0.9706** ($p = 4.723 \times 10^{-10}$, $N = 16$)
- **Statistical Interpretation:** The near-unity correlation indicates a near-perfect monotonic linear relationship over 2010–2025.
- **Causality Disclaimer:** Correlation confirms empirical co-movement over time, but does NOT establish that the passage of calendar years causes compute scaling.

---

## 7. Simple Linear Regression (Module X)
$$Y_t = \beta_0 + \beta_1 t + \epsilon_t$$
Fitted on $t \in [2010, 2025]$ ($N = 16$):
- **Intercept ($\beta_0$):** **$-1156.0523$**
- **Slope ($\beta_1$):** **$0.5828$** $\log_{10}(\text{FLOP})$ per calendar year ($SE = 0.0397$, $p = 6.699 \times 10^{-10}$)
- **95% Confidence Interval for $\beta_1$:** $[0.4977, 0.6679]$
- **Coefficient of Determination ($R^2$):** **$0.9391$** (Adjusted $R^2 = 0.9347$)
- **Residual Standard Error ($s_e$):** **$0.7314$**
- **Implied Multiplicative Growth Factor:**
  $$\text{growth\_factor} = 10^{\beta_1} = 10^{0.5828} \approx \mathbf{3.83\times} \text{ per year}$$
- **Implied Doubling Time:** $T_2 = \frac{\log_{10}(2)}{\beta_1} = \frac{0.30103}{0.5828} \approx \mathbf{0.52} \text{ years} \approx \mathbf{6.2} \text{ months}$.

---

## 8. Polynomial (Quadratic) Regression (Module X)
$$Y_t = \beta_0 + \beta_1 (t - 2010) + \beta_2 (t - 2010)^2 + \epsilon_t$$
- **$\beta_0$ (2010 intercept):** **$15.9728$**
- **$\beta_1$ (linear term):** **$0.3052$**
- **$\beta_2$ (quadratic term):** **$+0.018502$**
- **Training $R^2$:** **$0.9550$** (Adjusted $R^2 = 0.9481$, RMSE = $0.5881$)

---

## 9. Extended 7-Fold Rolling-Origin Backtesting (2019–2025)

To eliminate lookahead bias and evaluate whether models remain stable across different market regimes, we tested every year from 2019 through 2025:
- **Fold 1:** Train 2010–2018 $\rightarrow$ Test 2019 (Actual = 20.0692)
- **Fold 2:** Train 2010–2019 $\rightarrow$ Test 2020 (Actual = 20.7950)
- **Fold 3:** Train 2010–2020 $\rightarrow$ Test 2021 (Actual = 22.0911)
- **Fold 4:** Train 2010–2021 $\rightarrow$ Test 2022 (Actual = 22.1704)
- **Fold 5:** Train 2010–2022 $\rightarrow$ Test 2023 (Actual = 22.8015)
- **Fold 6:** Train 2010–2023 $\rightarrow$ Test 2024 (Actual = 24.4800)
- **Fold 7:** Train 2010–2024 $\rightarrow$ Test 2025 (Actual = 24.5877)

### Error Summary Across All 7 Folds (`outputs/backtest_results.csv`):

| Model | 2019 Err | 2020 Err | 2021 Err | 2022 Err | 2023 Err | 2024 Err | 2025 Err | 7-Fold MAE | 7-Fold RMSE | OOS $R^2$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linear Trend (OLS)** | $+1.0427$ | $+0.9238$ | $+1.4287$ | $+0.4896$ | $+0.4691$ | $+1.4965$ | $+0.6747$ | **0.8023** | **0.8900** | **0.6818** |
| **ARIMA(0,1,0)+drift** | $+1.5464$ | $+0.1722$ | $+0.7253$ | $-0.5575$ | $+0.0408$ | $+1.0851$ | $-0.5632$ | **0.6701** | **0.8241** | **0.7272** |
| **ARIMA(1,1,0)+drift** | $+1.5174$ | $+0.7140$ | $+0.7697$ | $-0.4376$ | $-0.0564$ | $+1.1044$ | $-0.3587$ | **0.7083** | **0.8407** | **0.7161** |
| **Holt Linear Trend** | $+1.6110$ | $+0.7932$ | $+0.9702$ | $+0.4896$ | $+0.4691$ | $+1.3314$ | $-0.0509$ | **0.8481** | **1.0035** | **0.5955** |
| **Naive ($Y_{t-1}$)** | $+1.9282$ | $+0.7258$ | $+1.2962$ | $+0.0792$ | $+0.6311$ | $+1.6785$ | $+0.1077$ | **0.9210** | **1.1438** | **0.4744** |
| **Quadratic Trend (OLS)**| **$+2.1016$** | $+1.4823$ | $+1.5949$ | $+0.1780$ | $+0.0411$ | $+0.9927$ | $-0.2272$ | **0.9454** | **1.2088** | **0.4130** |

---

## 10. Multi-Year Extrapolation Stability Analysis (2026–2030)

Comparing multi-year extrapolations reveals critical structural differences:

| Year | Naive ($Y_{t-1}$) | Linear Trend (OLS) | Holt Linear Trend | ARIMA(0,1,0)+drift | Quadratic Trend (OLS) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2026** | 24.5877 | **24.6496** | 25.2153 | 25.2211 | 25.5932 |
| **2027** | 24.5877 | **25.2324** | 25.8286 | 25.8545 | 26.5090 |
| **2028** | 24.5877 | **25.8151** | 26.4420 | 26.4879 | 27.4618 |
| **2029** | 24.5877 | **26.3979** | 27.0553 | 27.1213 | 28.4517 |
| **2030** | 24.5877 | **26.9807** | 27.6686 | 27.7547 | **29.4785** |
| **2030 FLOP** | $3.87 \times 10^{24}$ | **$9.57 \times 10^{26}$** | $4.66 \times 10^{27}$ | $5.68 \times 10^{27}$ | **$3.01 \times 10^{29}$** |

### Critical Findings on Extrapolation:
1. **The Quadratic Overfitting Collapse:**
   - On the short 4-fold test (2022–2025), Quadratic appeared superior (RMSE = 0.5173).
   - BUT on the extended 7-fold test (2019–2025), Quadratic was the **worst-performing model** (RMSE = **1.2088**, OOS $R^2 = 0.4130$). When trained on 2010–2018 (which contained a temporary plateau around 18.1–18.7), the parabola bent downward, projecting $17.97$ for 2019 when the actual was $20.07$ (an enormous error of $+2.10$ orders of magnitude!).
   - In multi-year extrapolation, Quadratic projects **$10^{29.48} \approx 3.01 \times 10^{29}$ FLOP** by 2030. At current hardware efficiencies ($\sim 10^{15}$ FLOP per joule), training a single $10^{29.5}$ FLOP model would consume over $300$ gigawatt-hours of electrical energy—equivalent to dedicated nuclear power plants—making it physically and economically unsustainable for a median model.
2. **Linear Trend Robustness:**
   - Linear OLS achieved a highly stable backtest RMSE (**0.8900** across all 7 folds, OOS $R^2 = 0.6818$).
   - It projected the 2026 partial snapshot with unmatched accuracy (predicted $24.6496$ vs actual $24.6355$, error = **$-0.0141$**).
   - Its 2030 projection ($10^{26.98} \approx 9.57 \times 10^{26}$ FLOP) is physically defensible and closely matches actual 2026 frontier systems entering the dataset (e.g. GPT-6 Astra at $1.0001 \times 10^{27}$ FLOP).

---

## 11. Transparent Model Decision Table (Task 6)

| Model Specification | 7-Fold Backtest MAE | 7-Fold Backtest RMSE | Out-of-Sample $R^2$ | 2026 Partial Error | 2030 Forecast ($\log_{10}$ FLOP) | Extrapolation Behavior | Comments & Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **Linear Trend (OLS)** | **0.8023** | **0.8900** | **0.6818** | **$-0.0141$** | **26.9807** ($9.57 \times 10^{26}$) | **Linear in log-space (Orderly compounding)** | **SELECTED PRIMARY MODEL:** Highest extrapolation stability, best 2026 partial validation, robust 14 df. |
| **ARIMA(0,1,0)+drift** | **0.6701** | **0.8241** | **0.7272** | $-0.5856$ | 27.7547 ($5.68 \times 10^{27}$) | Constant differenced drift ($+0.63$/yr) | **Best 7-Fold Backtest:** Lowest overall RMSE, but overshoots partial 2026 snapshot by 0.58 dex. Key time-series benchmark. |
| **ARIMA(1,1,0)+drift** | 0.7083 | 0.8407 | 0.7161 | $-0.7018$ | 27.8406 ($6.93 \times 10^{27}$) | Damped autoregressive drift | AR(1) parameter statistically insignificant ($p=0.395$); over-parameterized for $N=15$ df. |
| **Holt Linear Trend** | 0.8481 | 1.0035 | 0.5955 | $-0.5799$ | 27.6686 ($4.66 \times 10^{27}$) | Dynamic smoothed linear drift | Strong adaptive baseline; sensitive to short sample plateaus. |
| **Quadratic Trend (OLS)**| 0.9454 | 1.2088 | 0.4130 | $-0.9577$ | **29.4785** ($3.01 \times 10^{29}$) | **Explosive quadratic acceleration** | **REJECTED FOR FORECASTING:** Severe instability in 7-fold backtest (bent downward in 2019) and explosive multi-year projection. |
| **Naive Baseline ($Y_{t-1}$)**| 0.9210 | 1.1438 | 0.4744 | $+0.0477$ | 24.5877 ($3.87 \times 10^{24}$) | Flat (Zero growth) | Reference baseline; fails to capture ongoing scaling. |

### Methodological Conclusion:
We select **Linear Trend (OLS)** as the primary forecasting model, with **ARIMA(0,1,0) with drift** retained as an essential time-series benchmark. The Quadratic model—despite achieving high training $R^2$ ($0.955$) and lower error on a narrow 4-fold test—is rejected for forecasting because it suffered severe instability across the 7-fold backtest (RMSE = 1.2088) and exhibits runaway multi-year extrapolation.

---

## 12. Final Projections to 2030 (`outputs/final_forecast_2027_2030.csv`)

Projections are generated using the selected Linear Trend model with 95% prediction intervals:
$$s_{\text{pred}}(t_0) = s_e \sqrt{1 + \frac{1}{n} + \frac{(t_0 - \bar{t})^2}{\sum (t_i - \bar{t})^2}}$$

| Year | Selected Model | Forecast ($\log_{10}$ FLOP) | 95% Prediction Interval ($\log_{10}$) | Forecast Compute (FLOP) | 95% Prediction Interval (FLOP) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **2027** | **Linear Trend (OLS)** | **25.2324** | $[23.4246, 27.0402]$ | **$1.71 \times 10^{25}$** | $[2.66 \times 10^{23}, 1.10 \times 10^{27}]$ |
| **2028** | **Linear Trend (OLS)** | **25.8151** | $[23.9677, 27.6626]$ | **$6.53 \times 10^{25}$** | $[9.28 \times 10^{23}, 4.60 \times 10^{27}]$ |
| **2029** | **Linear Trend (OLS)** | **26.3979** | $[24.5079, 28.2880]$ | **$2.50 \times 10^{26}$** | $[3.22 \times 10^{24}, 1.94 \times 10^{28}]$ |
| **2030** | **Linear Trend (OLS)** | **26.9807** | $[25.0453, 28.9161]$ | **$9.57 \times 10^{26}$** | $[1.11 \times 10^{25}, 8.24 \times 10^{28}]$ |

*Wording Notice: These numbers represent model-based conditional forecasts, not guaranteed future compute.*

- **Figure Generated:** [`graphs/16_final_model_selection_and_forecast.png`](file:///c:/Users/LOKESH/Downloads/AI_Compute_Time_Series/graphs/16_final_model_selection_and_forecast.png)

---

## 13. Critical Statistical Limitations & Threats to Validity
1. **Small Sample Size ($N = 16$):** The primary annual series contains only 16 complete observations from 2010 through 2025. Standard error bands widen significantly as the forecast horizon extends to 2030.
2. **Long-Range Extrapolation Uncertainty:** All forecasts are strictly conditional on historical exponential scaling trends persisting. Physical bottlenecks—such as electrical grid interconnection delays, semiconductor manufacturing capacity limits, and capital expenditure ceilings—could induce deceleration prior to 2030.
3. **Partial 2026 Horizon:** Calendar year 2026 is recorded through September 21, 2026 (~8.7 months). The 2026 median ($Y_{2026} = 24.6355$) is an interim snapshot, not a completed calendar year.
4. **Individual-Level Missing Compute (49.63%):** Nearly half of the notable models in the raw CSV do not disclose FLOP counts, with disclosure dropping to 26.9% in 2026 due to commercial frontier confidentiality.
