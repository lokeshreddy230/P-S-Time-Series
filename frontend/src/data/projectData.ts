import modelsData from './models.json';
import yearlyComputeData from './yearlyCompute.json';
import backtestResultsData from './backtestResults.json';
import modelComparisonData from './modelComparison.json';
import forecastsData from './forecasts.json';
import monthlySummaryData from './monthlySummary.json';

export interface AIModel {
  id: number;
  model: string;
  organization: string;
  publicationDate: string;
  year: number | null;
  parameters: number | null;
  parametersStr: string;
  trainingComputeFLOP: number | null;
  trainingComputeStr: string;
  log10Compute: number | null;
  frontierModel: boolean;
  trainingHardware: string;
  domain: string;
  task: string;
  hasCompute: boolean;
  hasParameters: boolean;
}

export interface YearlyCompute {
  year: number;
  validComputeCount: number;
  totalModels: number;
  coveragePct: number;
  medianLog10: number | null;
  meanLog10: number | null;
  stdLog10: number | null;
  minLog10: number | null;
  maxLog10: number | null;
  medianFLOP: number | null;
  meanFLOP: number | null;
  isPartial: boolean;
  inModelingWindow: boolean;
  linearFit: number | null;
  quadFit: number | null;
}

export interface BacktestResult {
  model: string;
  testYear: number;
  actual: number;
  predicted: number;
  error: number;
  absoluteError: number;
  squaredError: number;
}

export interface ModelComparison {
  model: string;
  mae: number;
  rmse: number;
  oosR2: number;
  error2026Partial: number;
  forecast2030Log10: number;
  forecast2030FLOP: string;
  behavior: string;
  comments: string;
}

export interface ForecastData {
  year: number;
  linearLog10: number;
  linearFLOP: number;
  linearFLOPStr: string;
  piLowerLog10: number;
  piUpperLog10: number;
  piLowerFLOP: number;
  piUpperFLOP: number;
  piLowerFLOPStr: string;
  piUpperFLOPStr: string;
  arima010Log10: number;
  holtLog10: number;
  quadLog10: number;
}

export interface FormulaItem {
  id: string;
  name: string;
  formula: string;
  variables: { name: string; desc: string }[];
  explanation: string;
  numericExample: string;
  technicalInterpretation: string;
  category: 'Descriptive' | 'Correlation' | 'Regression' | 'Time-Series' | 'Evaluation' | 'Transformation';
}

export interface VivaQuestion {
  id: number;
  category: 'Basics' | 'Statistics' | 'Correlation' | 'Regression' | 'Time Series' | 'Forecasting' | 'Model Evaluation' | 'Dataset';
  question: string;
  answer: string;
  formula?: string;
  keyMetric?: string;
  methodologicalNote: string;
}

export interface MethodologyNode {
  id: string;
  title: string;
  category: string;
  whatWeDid: string;
  whyWeDidIt: string;
  formula?: string;
  result: string;
}

// Typed exports
export const models: AIModel[] = modelsData as AIModel[];
export const yearlyCompute: YearlyCompute[] = yearlyComputeData as YearlyCompute[];
export const backtestResults: BacktestResult[] = backtestResultsData as BacktestResult[];
export const modelComparison: ModelComparison[] = modelComparisonData as ModelComparison[];
export const forecasts: ForecastData[] = forecastsData as ForecastData[];
export const monthlySummary = monthlySummaryData;

// PROJECT CONSTANTS & EXACT EMPIRICAL VALUES
export const PROJECT_INFO = {
  title: "Time-Series Analysis and Forecasting of AI Model Training Compute Using Real-World Data",
  shortTitle: "AI Compute Time-Series Analysis",
  course: "Probability Theory and Statistical Analysis (B.Tech)",
  academicYear: "2025–2026",
  syllabusModules: [
    { module: "Module I", name: "Descriptive Statistics & Exploratory Data Analysis", desc: "Measures of central tendency, dispersion, histograms, raw vs log scale comparison." },
    { module: "Module VII", name: "Testing of Hypothesis", desc: "Null and alternative hypotheses, Welch's two-sample t-test for difference in means across distinct temporal epochs." },
    { module: "Module IX", name: "Correlation Analysis", desc: "Covariance, Pearson product-moment coefficient of correlation r, Spearman rank correlation rho, statistical significance." },
    { module: "Module X", name: "Regression & Time-Series Modeling", desc: "Ordinary Least Squares (OLS) linear trend, quadratic polynomial regression, double exponential smoothing (Holt), ARIMA differenced drift, rolling backtesting." },
  ],
  dataset: {
    source: "Epoch AI Notable AI Models Dataset",
    totalModels: 1072,
    validComputeCount: 540,
    missingComputeCount: 532,
    validParamsCount: 725,
    missingParamsCount: 347,
    coverageComputePct: 50.37,
    earliestDate: "1950-07-02",
    latestDate: "2026-09-21",
    primaryFrequency: "Yearly",
    modelingPeriod: "2010–2025",
    modelingYearsCount: 16,
    partialYear: "2026",
    partialYearObservedDate: "2026-09-21",
    forecastPeriod: "2027–2030",
    primaryTarget: "Y_t = median(log10(Training compute (FLOP))) for year t",
    primaryTargetFormula: "Y_t = \\text{median}(\\log_{10}(\\text{Training Compute (FLOP)}))",
  },
  descriptiveStats: {
    rawCompute: {
      min: 40.0,
      minStr: "4.00 × 10¹ FLOP",
      max: 1.0001e+27,
      maxStr: "1.00 × 10²⁷ FLOP",
      mean: 6.78e+24,
      meanStr: "6.78 × 10²⁴ FLOP",
      median: 4.88e+19,
      medianStr: "4.88 × 10¹⁹ FLOP",
      std: 5.92e+25,
      stdStr: "5.92 × 10²⁵ FLOP",
    },
    log10Compute: {
      min: 1.6021,
      max: 27.0000,
      mean: 19.3842,
      median: 19.6884,
      std: 4.8912,
    },
    recentCoverage: [
      { year: 2020, total: 50, valid: 33, pct: 66.0 },
      { year: 2021, total: 65, valid: 51, pct: 78.5 },
      { year: 2022, total: 82, valid: 54, pct: 65.9 },
      { year: 2023, total: 141, valid: 77, pct: 54.6 },
      { year: 2024, total: 241, valid: 113, pct: 46.9 },
      { year: 2025, total: 230, valid: 86, pct: 37.4 },
      { year: 2026, total: 26, valid: 7, pct: 26.9, isPartial: true },
    ]
  },
  correlation: {
    xVar: "Calendar Year (t)",
    yVar: "Annual Median log10(Training Compute)",
    sampleSize: 16,
    pearsonR: 0.9691,
    pearsonPValue: "6.6992 × 10⁻¹⁰",
    pearsonPValNum: 6.6992e-10,
    spearmanRho: 0.9706,
    spearmanPValue: "4.7234 × 10⁻¹⁰",
    spearmanPValNum: 4.7234e-10,
    interpretation: "Extremely strong positive linear and monotonic correlation between calendar time and annual median log10 training compute (p < 0.001)."
  },
  linearRegression: {
    intercept: -1156.0523,
    slope: 0.5828,
    equation: "Y = -1156.0523 + 0.5828 × Year",
    r2: 0.9391,
    adjR2: 0.9347,
    annualGrowthFactor: 3.83,
    annualGrowthFactorExact: "10^0.5828 ≈ 3.8265×",
    doublingTimeMonths: 6.2,
    doublingTimeYears: 0.518,
    partial2026Actual: 24.6355,
    partial2026Predicted: 24.6496,
    partial2026Error: -0.0141,
    standardError: 0.825,
  },
  quadraticRegression: {
    equation: "Y = 15.9728 + 0.3052·t + 0.018502·t²  (t = Year - 2010)",
    intercept: 15.9728,
    beta1: 0.3052,
    beta2: 0.018502,
    r2: 0.9550,
    adjR2: 0.9481,
    rmseBacktest: 1.2088,
    forecast2030Log10: 29.4785,
    forecast2030FLOP: "3.01 × 10²⁹ FLOP",
    reasonRejected: "Fails chronological backtesting with the highest RMSE (1.2088) and explosive long-range curvature projecting physically implausible 10^29.5 FLOP compute by 2030."
  },
  stationarity: {
    levelAdfPValue: 0.9225,
    levelDecision: "Non-stationary (Unit root cannot be rejected)",
    diffAdfPValue: 0.0000132,
    diffDecision: "Stationary (p = 1.32 × 10⁻⁵, Unit root rejected at 1% level)",
    durbinWatson: 1.6881,
    dwInterpretation: "Close to 2.0; no critical first-order residual autocorrelation."
  },
  hypothesisTesting: {
    period1: { label: "2010–2017 (Pre-Transformer / Early Deep Learning)", n: 8, mean: 17.5000, std: 1.9749, var: 3.9002 },
    period2: { label: "2018–2025 (Modern LLM & Frontier Scaling Era)", n: 8, mean: 21.8920, std: 1.6508, var: 2.7252 },
    testType: "Welch's Two-Sample t-test (unequal variances)",
    tStat: -4.8561,
    df: 11.53,
    pValue: 0.00044,
    alpha: 0.05,
    decision: "Reject H₀ at α = 0.05",
    substantiveConclusion: "The median training compute in 2018–2025 is statistically significantly higher than in 2010–2017 (mean shift of +4.392 orders of magnitude, ~24,600× increase).",
    observationalCaveat: "This test documents an empirical temporal shift between two time windows. It does not prove that any single factor (such as the Transformer architecture alone) was the sole causal driver."
  },
  selectedModel: {
    name: "Linear Trend Regression (OLS)",
    whySelected: [
      "Lowest out-of-sample error on the 2026 partial observation (-0.0141 dex vs -0.58 dex for ARIMA)",
      "High backtest stability across rolling folds (OOS R² = 0.6818, MAE = 0.8023)",
      "Avoids overfitting with only 2 parameters on N=16 observations (preserving 14 degrees of freedom)",
      "Yields steady compounding projections (3.83× / yr) without explosive quadratic curvature",
      "Defensible for formal academic presentation with rigorous analytical prediction intervals"
    ]
  }
};

export const FORMULA_CARDS: FormulaItem[] = [
  {
    id: "mean",
    name: "Sample Mean",
    category: "Descriptive",
    formula: "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i",
    variables: [
      { name: "x̄", desc: "Sample mean" },
      { name: "x_i", desc: "Individual observation value" },
      { name: "n", desc: "Total number of observations in sample" }
    ],
    explanation: "The arithmetic average of all observations, providing the central balance point of the distribution.",
    numericExample: "For compute log10 values [15.97, 16.50, 18.14], Mean = (15.97 + 16.50 + 18.14) / 3 = 16.87",
    technicalInterpretation: "The sample mean represents the center of mass of the data, summing all observed values and dividing by the sample size n."
  },
  {
    id: "variance",
    name: "Sample Variance",
    category: "Descriptive",
    formula: "s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (x_i - \\bar{x})^2",
    variables: [
      { name: "s²", desc: "Sample variance" },
      { name: "x̄", desc: "Sample mean" },
      { name: "n - 1", desc: "Degrees of freedom (Bessel's correction)" }
    ],
    explanation: "Measures the average squared dispersion around the sample mean. We divide by n-1 to yield an unbiased estimator of the population variance.",
    numericExample: "If x = [16, 20], mean = 18. s² = [(16-18)² + (20-18)²]/(2-1) = [4 + 4]/1 = 8.0",
    technicalInterpretation: "Sample variance quantifies how spread out our data points are around the mean, using n minus 1 in the denominator for Bessel's unbiased correction."
  },
  {
    id: "std",
    name: "Sample Standard Deviation",
    category: "Descriptive",
    formula: "s = \\sqrt{s^2} = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2}",
    variables: [
      { name: "s", desc: "Standard deviation in original units" },
      { name: "s²", desc: "Sample variance" }
    ],
    explanation: "Square root of variance, returning the dispersion measure back to the original units of measurement (e.g., log10 FLOP).",
    numericExample: "If s² = 8.0, then s = √8.0 ≈ 2.83 log10 units",
    technicalInterpretation: "Standard deviation converts the squared variance back into the original units of the data so we can interpret spread intuitively."
  },
  {
    id: "pearson",
    name: "Pearson Correlation Coefficient",
    category: "Correlation",
    formula: "r = \\frac{\\sum_{i=1}^n (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^n (x_i - \\bar{x})^2 \\sum_{i=1}^n (y_i - \\bar{y})^2}}",
    variables: [
      { name: "r", desc: "Correlation coefficient, bounded in [-1, +1]" },
      { name: "x_i, y_i", desc: "Observed year and median compute" },
      { name: "x̄, ȳ", desc: "Sample means of x and y" }
    ],
    explanation: "Measures the strength and direction of the linear association between two quantitative continuous variables.",
    numericExample: "In our project: r = 0.9691 with p = 6.70 × 10⁻¹⁰. Indicates virtually deterministic positive linear alignment.",
    technicalInterpretation: "Pearson's r measures the normalized covariance between year and compute; our r of 0.9691 demonstrates an extraordinarily strong positive linear relationship."
  },
  {
    id: "linear_reg",
    name: "Simple Linear Regression Model",
    category: "Regression",
    formula: "Y_t = \\beta_0 + \\beta_1 X_t + \\varepsilon_t, \\quad \\hat{Y}_t = a + b X_t",
    variables: [
      { name: "a (Intercept)", desc: "Fitted intercept = -1156.0523" },
      { name: "b (Slope)", desc: "Fitted slope = 0.5828 log10 FLOP/year" },
      { name: "X_t", desc: "Calendar year" }
    ],
    explanation: "Models the response variable as a straight-line function of the predictor variable via Ordinary Least Squares (OLS) minimizing sum of squared errors.",
    numericExample: "For year 2026: Ŷ = -1156.0523 + 0.5828 × 2026 = 24.6496 log10 FLOP (Actual = 24.6355, Error = -0.0141)",
    technicalInterpretation: "The linear regression equation estimates that for every additional calendar year, median AI compute increases by 0.5828 orders of magnitude."
  },
  {
    id: "quadratic_reg",
    name: "Quadratic Polynomial Regression",
    category: "Regression",
    formula: "Y_t = \\beta_0 + \\beta_1 t + \\beta_2 t^2 + \\varepsilon_t, \\quad t = \\text{Year} - 2010",
    variables: [
      { name: "β₀", desc: "Intercept at base year 2010 = 15.9728" },
      { name: "β₁", desc: "Linear coefficient = 0.3052" },
      { name: "β₂", desc: "Quadratic curvature coefficient = 0.018502" }
    ],
    explanation: "Adds a second-degree polynomial term to capture accelerating or decelerating curvature over time.",
    numericExample: "For 2020 (t=10): Ŷ = 15.9728 + 0.3052(10) + 0.018502(100) = 20.875 log10 FLOP",
    technicalInterpretation: "While the quadratic model achieves an R² of 0.955 on training data, its curvature term causes explosive long-range predictions, making it unreliable for 2030 forecasting."
  },
  {
    id: "residual",
    name: "Model Residual",
    category: "Evaluation",
    formula: "e_t = y_t - \\hat{y}_t",
    variables: [
      { name: "e_t", desc: "Residual error at time t" },
      { name: "y_t", desc: "True observed actual value" },
      { name: "ŷ_t", desc: "Model fitted or predicted value" }
    ],
    explanation: "The vertical deviation between the true observed data point and the model's fitted expectation.",
    numericExample: "2026 Partial: y = 24.6355, ŷ = 24.6496 → e = 24.6355 - 24.6496 = -0.0141 dex",
    technicalInterpretation: "A residual is simply the difference between what actually happened and what the model expected. Positive residuals mean the model underestimated."
  },
  {
    id: "mae",
    name: "Mean Absolute Error (MAE)",
    category: "Evaluation",
    formula: "\\text{MAE} = \\frac{1}{n} \\sum_{t=1}^n |y_t - \\hat{y}_t| = \\frac{1}{n} \\sum_{t=1}^n |e_t|",
    variables: [
      { name: "MAE", desc: "Mean absolute prediction error" },
      { name: "|e_t|", desc: "Magnitude of error without regard to sign" },
      { name: "n", desc: "Number of test evaluation folds" }
    ],
    explanation: "Measures average magnitude of forecast errors in linear units, treating positive and negative errors with equal linear weight.",
    numericExample: "Across 7 rolling backtest years (2019–2025), Linear MAE = 0.8023 dex, ARIMA(0,1,0) MAE = 0.6701 dex",
    technicalInterpretation: "MAE tells us the average distance our forecast was from the true value in plain log units, without squaring."
  },
  {
    id: "rmse",
    name: "Root Mean Square Error (RMSE)",
    category: "Evaluation",
    formula: "\\text{RMSE} = \\sqrt{\\frac{1}{n} \\sum_{t=1}^n (y_t - \\hat{y}_t)^2}",
    variables: [
      { name: "RMSE", desc: "Root mean square error" },
      { name: "(y_t - ŷ_t)²", desc: "Squared forecast error" }
    ],
    explanation: "Penalizes large errors disproportionately because errors are squared before being averaged and square-rooted.",
    numericExample: "Linear RMSE = 0.8900 dex, Quadratic RMSE = 1.2088 dex. The higher quadratic RMSE reflects occasional large errors.",
    technicalInterpretation: "RMSE squares the errors first, meaning it heavily penalizes big forecasting mistakes. Lower RMSE indicates a more reliable model."
  },
  {
    id: "r2",
    name: "Coefficient of Determination (R²)",
    category: "Evaluation",
    formula: "R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}} = 1 - \\frac{\\sum (y_t - \\hat{y}_t)^2}{\\sum (y_t - \\bar{y})^2}",
    variables: [
      { name: "R²", desc: "Proportion of variance explained by model" },
      { name: "SS_res", desc: "Sum of squared residual errors" },
      { name: "SS_tot", desc: "Total sum of squares around the mean" }
    ],
    explanation: "Indicates what percentage of total variation in the response variable is explained by the regression equation.",
    numericExample: "In our linear model, R² = 0.9391, meaning 93.91% of variance in median compute is explained by calendar year alone.",
    technicalInterpretation: "R-squared shows that over 93.9% of the historical growth in log AI compute is explained simply by the linear passage of time."
  },
  {
    id: "first_diff",
    name: "First Difference Transformation",
    category: "Time-Series",
    formula: "\\Delta Y_t = Y_t - Y_{t-1}",
    variables: [
      { name: "ΔY_t", desc: "First difference at year t" },
      { name: "Y_t", desc: "Current period value" },
      { name: "Y_{t-1}", desc: "Previous period value" }
    ],
    explanation: "Removes a linear stochastic trend to achieve weak stationarity, transforming an I(1) series into an I(0) series.",
    numericExample: "Level series ADF test p = 0.9225 (non-stationary). Differenced series ADF test p = 1.32 × 10⁻⁵ (stationary).",
    technicalInterpretation: "Taking the first difference converts the raw growth levels into year-over-year increments, which successfully achieves stationarity."
  },
  {
    id: "dw",
    name: "Durbin-Watson Test Statistic",
    category: "Evaluation",
    formula: "\\text{DW} = \\frac{\\sum_{t=2}^T (e_t - e_{t-1})^2}{\\sum_{t=1}^T e_t^2}",
    variables: [
      { name: "DW", desc: "Test statistic, ranges from 0 to 4" },
      { name: "e_t", desc: "OLS regression residuals" }
    ],
    explanation: "Tests for first-order autocorrelation in regression residuals. A value near 2 indicates no first-order serial correlation.",
    numericExample: "In our linear model: DW = 1.6881. This is comfortably close to 2.0, confirming residual independence.",
    technicalInterpretation: "The Durbin-Watson statistic of 1.688 confirms that our regression residuals are not severely autocorrelated from one year to the next."
  },
  {
    id: "log_trans",
    name: "Logarithmic Transformation (Base 10)",
    category: "Transformation",
    formula: "Y = \\log_{10}(\\text{Compute FLOP})",
    variables: [
      { name: "Y", desc: "Transformed scale (order of magnitude / dex)" },
      { name: "Compute FLOP", desc: "Raw floating-point operations" }
    ],
    explanation: "Compresses extreme multiplicative spans across 26 orders of magnitude into an additive, bell-shaped distribution suitable for linear models.",
    numericExample: "10²⁴ FLOP (1 yottaFLOP) → log10(10²⁴) = 24.0. 10²⁷ FLOP → 27.0",
    technicalInterpretation: "Because AI compute spans from 10⁴ to 10²⁷ FLOP, taking base-10 logarithms maps exponential multiplication into linear addition."
  },
  {
    id: "back_trans",
    name: "Inverse Back-Transformation",
    category: "Transformation",
    formula: "\\text{Compute FLOP} = 10^Y",
    variables: [
      { name: "10^Y", desc: "Exponential base-10 inversion" },
      { name: "Y", desc: "Predicted log10 compute" }
    ],
    explanation: "Converts statistical model predictions in log space back into physical floating point operations (FLOP).",
    numericExample: "2027 predicted Y = 25.2324 → 10^25.2324 = 1.71 × 10²⁵ FLOP",
    technicalInterpretation: "To interpret our forecast in physical hardware terms, we apply 10 to the power of our predicted log value."
  }
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: "Basics",
    question: "What exactly are you predicting in this project?",
    answer: "We are predicting the annual aggregate median training compute (in log10 FLOP) of notable AI models across historical years. We are NOT attempting to predict the exact training compute of a specific individual proprietary model like GPT-5 or Gemini 3.",
    keyMetric: "Primary target: Y_t = median(log10(Compute))",
    methodologicalNote: "Critical distinction between aggregate macro-trend extrapolation and individual micro-level model architecture sizing."
  },
  {
    id: 2,
    category: "Dataset",
    question: "Why did you choose a yearly frequency instead of monthly?",
    answer: "Our audit of the 915 calendar months between 1950 and 2026 revealed that 722 months (78.91%) had zero recorded models. In observed months, the median was only 2 models. Aggregating annually provides a continuous, stable series across 2010–2025 with no missing periods.",
    keyMetric: "78.91% empty months across full history",
    methodologicalNote: "Empirical audit of 915 calendar months establishing 78.91% temporal sparsity across historical records."
  },
  {
    id: 3,
    category: "Statistics",
    question: "Why was a base-10 logarithmic transformation necessary?",
    answer: "Raw training compute spans from 40 FLOP (1950) to 1.0 × 10²⁷ FLOP (2024)—an astronomical span of 26 orders of magnitude. The raw distribution is extremely right-skewed. Taking log10 stabilizes variance, linearizes exponential compounding, and allows standard OLS assumptions to hold.",
    keyMetric: "Range: 4.0 × 10¹ to 1.0 × 10²⁷ FLOP (26 orders of magnitude)",
    methodologicalNote: "Base-10 transformation maps exponential compounding in physical units into linear addition in logarithmic coordinates."
  },
  {
    id: 4,
    category: "Correlation",
    question: "What is Pearson's r, and what did your study find?",
    answer: "Pearson's r measures the strength and direction of linear association between two variables. Between calendar year and annual median log10 compute, r = 0.9691 with p = 6.70 × 10⁻¹⁰. Spearman's rank correlation rho is 0.9706 with p = 4.72 × 10⁻¹⁰, confirming an almost deterministic linear trend.",
    formula: "r = \\frac{\\sum(x - \\bar{x})(y - \\bar{y})}{\\sqrt{\\sum(x - \\bar{x})^2 \\sum(y - \\bar{y})^2}}",
    keyMetric: "r = 0.9691, p = 6.70 × 10⁻¹⁰",
    methodologicalNote: "Statistical significance test confirms the linear correlation is distinguishable from zero chance at the p < 0.001 level."
  },
  {
    id: 5,
    category: "Regression",
    question: "What is the fitted linear regression equation, and how do you interpret the slope?",
    answer: "The fitted equation is Y_t = -1156.0523 + 0.5828 × Year (R² = 0.9391). The slope of 0.5828 means median compute increases by 0.5828 log10 units per calendar year. In raw terms, 10^0.5828 ≈ 3.83× per year, corresponding to a doubling time of approximately 6.2 months.",
    formula: "Y = -1156.0523 + 0.5828 \\cdot \\text{Year}",
    keyMetric: "Slope = 0.5828 dex/yr → 3.83× annual factor (Doubling = 6.2 months)",
    methodologicalNote: "Logarithmic slope of 0.5828 dex/year corresponds to a physical compound multiplier of 3.83× per calendar year."
  },
  {
    id: 6,
    category: "Regression",
    question: "Why did you reject the Quadratic Regression model despite its higher R² (0.955)?",
    answer: "While the quadratic model fits training data slightly better (R² = 0.955 vs 0.939), in 7-fold chronological backtesting it produced the worst RMSE (1.2088 vs 0.8900 for linear). Furthermore, its positive quadratic term extrapolates to an explosive 3.0 × 10²⁹ FLOP by 2030, which violates physical hardware, capital, and energy constraints.",
    keyMetric: "Backtest RMSE: Quadratic 1.2088 vs Linear 0.8900",
    methodologicalNote: "Contrasting in-sample explanatory power (R²) with out-of-sample generalization error (RMSE) demonstrates overfitting."
  },
  {
    id: 7,
    category: "Model Evaluation",
    question: "What is chronological rolling backtesting, and why did you use it?",
    answer: "Standard random train-test splitting leaks future information into past predictions, violating time causality. We used 7 chronological expanding windows: training on 2010–2018 to test 2019, 2010–2019 to test 2020, through 2010–2024 to test 2025. Every prediction is truly out-of-sample.",
    keyMetric: "7 evaluation folds (2019 to 2025)",
    methodologicalNote: "Chronological rolling-origin evaluation preserves temporal causality and eliminates lookahead bias."
  },
  {
    id: 8,
    category: "Model Evaluation",
    question: "What is the difference between MAE and RMSE?",
    answer: "MAE (Mean Absolute Error) is the average magnitude of absolute errors, weighting all errors linearly. RMSE (Root Mean Square Error) squares errors before taking the root, heavily penalizing large outliers. If a model has a similar MAE but much higher RMSE, it makes sporadic catastrophic forecasting errors.",
    formula: "\\text{MAE} = \\frac{1}{n}\\sum |e_t|, \\quad \\text{RMSE} = \\sqrt{\\frac{1}{n}\\sum e_t^2}",
    methodologicalNote: "Root Mean Square Error penalizes extreme deviations quadratically, revealing out-of-sample instability."
  },
  {
    id: 9,
    category: "Time Series",
    question: "Is the training compute time series stationary?",
    answer: "In levels, the series is non-stationary (ADF test p = 0.9225, fail to reject unit root). However, after taking the first difference (ΔY_t = Y_t - Y_{t-1}), the ADF test p-value drops to 1.32 × 10⁻⁵, strongly rejecting the unit root at the 1% significance level. This confirms the series is integrated of order 1, or I(1).",
    keyMetric: "Level ADF p = 0.9225, First Diff ADF p = 1.32 × 10⁻⁵",
    methodologicalNote: "Stationarity in first differences mathematically justifies the random walk with drift ARIMA(0,1,0) specification."
  },
  {
    id: 10,
    category: "Statistics",
    question: "What were the results of your Welch's two-sample hypothesis test?",
    answer: "We divided the timeline into Period 1 (2010–2017, n=8, mean=17.50 log10) and Period 2 (2018–2025, n=8, mean=21.89 log10). Welch's t-test yielded t = -4.8561 (df = 11.53, p = 0.00044). We rejected H₀ at α = 0.05, confirming a statistically significant shift of +4.39 orders of magnitude (~24,600× increase).",
    formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_1^2/n_1 + s_2^2/n_2}}",
    keyMetric: "t = -4.8561, p = 0.00044",
    methodologicalNote: "Welch t-test confirms statistical significance of temporal epoch shift; observational nature precludes isolated architectural causality."
  },
  {
    id: 11,
    category: "Forecasting",
    question: "What is your final forecast for annual median compute in 2030?",
    answer: "Under our selected primary Linear Trend model, the point forecast for 2030 is 26.9807 log10 FLOP, which translates to approximately 9.57 × 10²⁶ FLOP (~1 yottaFLOP). The 95% analytical prediction interval is [25.0453, 28.9161] log10 FLOP, or 1.11 × 10²⁵ to 8.24 × 10²⁸ FLOP.",
    keyMetric: "2030 Point Forecast: 9.57 × 10²⁶ FLOP (95% PI: [1.11 × 10²⁵, 8.24 × 10²⁸])",
    methodologicalNote: "Analytical prediction intervals expand quadratically with temporal distance from the sample mean year."
  },
  {
    id: 12,
    category: "Forecasting",
    question: "Can you guarantee that 2030 compute will reach 9.57 × 10²⁶ FLOP?",
    answer: "Absolutely not. This is a conditional statistical extrapolation under the assumption that historical 2010–2025 scaling dynamics continue uninterrupted. In reality, physical power grids, fab manufacturing limits, capital availability, data wall constraints, and algorithmic efficiency gains may slow growth.",
    methodologicalNote: "Extrapolations are conditional upon continuation of historical trends and subject to physical infrastructure ceilings."
  },
  {
    id: 13,
    category: "Dataset",
    question: "How did you treat the year 2026 in your analysis?",
    answer: "2026 is an incomplete calendar year containing observations only through September 21, 2026 (7 models with compute). We strictly excluded 2026 from training and backtesting to avoid partial-year bias. Instead, we used it as an external pseudo-out-of-sample check: our linear model predicted 24.6496 vs actual 24.6355, an error of only -0.0141 dex.",
    keyMetric: "2026 Partial: Actual 24.6355 vs Predicted 24.6496 (Error -0.0141)",
    methodologicalNote: "Fidelity on 2026 pseudo-test fold (-0.0141 dex) confirms high out-of-sample calibration of the linear trend model."
  },
  {
    id: 14,
    category: "Model Evaluation",
    question: "Why was ARIMA(0,1,0)+drift not chosen as the final long-range model if it had the lowest backtest RMSE?",
    answer: "ARIMA(0,1,0)+drift had the lowest 1-step backtest RMSE (0.8241 vs 0.8900). However, on the 2026 partial observation, ARIMA overestimated compute by +0.5856 dex, whereas the Linear trend was off by only -0.0141 dex. Additionally, ARIMA with drift accumulates wide variance quickly over multi-step horizons on small samples (N=16). Linear regression provided superior parameter stability.",
    keyMetric: "2026 Error: Linear -0.0141 vs ARIMA +0.5856",
    methodologicalNote: "Trade-off between 1-step backtest variance and multi-step cumulative drift compounding over long forecasting horizons."
  }
];

export const METHODOLOGY_STEPS: MethodologyNode[] = [
  {
    id: "step1",
    title: "1. Raw Dataset Audit",
    category: "Data Ingestion",
    whatWeDid: "Ingested Epoch AI's 1,072 notable AI models spanning 1950 to 2026.",
    whyWeDidIt: "To identify real empirical observations rather than synthetic or simulated benchmarks.",
    result: "1,072 models, 540 valid positive training compute observations, 532 missing values."
  },
  {
    id: "step2",
    title: "2. Temporal Sparsity Evaluation",
    category: "Preprocessing",
    whatWeDid: "Evaluated 915 calendar months for data completeness and model density.",
    whyWeDidIt: "To establish whether a monthly or yearly time-series frequency is scientifically defensible.",
    result: "78.91% empty months. Monthly rejected in favor of continuous annual aggregation."
  },
  {
    id: "step3",
    title: "3. Annual Robust Aggregation",
    category: "Aggregation",
    whatWeDid: "Aggregated models annually and computed median log10 training compute for each calendar year.",
    whyWeDidIt: "The median is robust against extreme outliers (e.g., massive mega-clusters vs small testbeds).",
    result: "Clean annual series from 2010 to 2025 (N = 16 complete annual observations)."
  },
  {
    id: "step4",
    title: "4. Base-10 Log Transformation",
    category: "Transformation",
    whatWeDid: "Transformed raw FLOP into Y_t = log10(FLOP).",
    whyWeDidIt: "Raw compute spans 26 orders of magnitude (10⁴ to 10²⁷ FLOP). Logarithm linearizes multiplicative growth.",
    formula: "Y_t = \\log_{10}(\\text{FLOP})",
    result: "Stabilized variance and symmetric distribution suitable for standard regression analysis."
  },
  {
    id: "step5",
    title: "5. Correlation & Trend Analysis",
    category: "Exploratory",
    whatWeDid: "Calculated Pearson r and Spearman rho between calendar year and annual median compute.",
    whyWeDidIt: "To quantify the magnitude and linearity of compute expansion over time.",
    formula: "r = \\frac{\\text{Cov}(X, Y)}{s_X s_Y}",
    result: "Pearson r = 0.9691 (p = 6.70e-10), Spearman rho = 0.9706. Virtually linear empirical alignment."
  },
  {
    id: "step6",
    title: "6. Welch's Hypothesis Testing",
    category: "Inference",
    whatWeDid: "Tested for mean compute difference between Period 1 (2010–2017) and Period 2 (2018–2025).",
    whyWeDidIt: "To verify whether the observed jump in deep learning compute represents a statistically significant shift.",
    formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_1^2/n_1 + s_2^2/n_2}}",
    result: "t = -4.8561, p = 0.00044. Strong rejection of H0 (p < 0.001); empirical shift of +4.39 orders of magnitude."
  },
  {
    id: "step7",
    title: "7. Candidate Model Fitting",
    category: "Modeling",
    whatWeDid: "Fitted 6 candidate models: Naive, Linear Trend, Quadratic, Holt's Linear, ARIMA(0,1,0)+drift, ARIMA(1,1,0)+drift.",
    whyWeDidIt: "To contrast deterministic trend regression against exponential smoothing and stochastic ARIMA models.",
    result: "Linear R² = 0.9391, Quadratic R² = 0.9550, ARIMA differenced drift = +0.6300 dex/yr."
  },
  {
    id: "step8",
    title: "8. 7-Fold Rolling Backtesting",
    category: "Validation",
    whatWeDid: "Evaluated 1-step out-of-sample forecasts chronologically from 2019 to 2025 across all 6 models.",
    whyWeDidIt: "To prevent lookahead bias and test true generalization on unseen years.",
    result: "Linear Trend MAE = 0.8023, RMSE = 0.8900; ARIMA(0,1,0) MAE = 0.6701, RMSE = 0.8241; Quadratic RMSE = 1.2088."
  },
  {
    id: "step9",
    title: "9. Final Model Selection & 2026 Audit",
    category: "Selection",
    whatWeDid: "Selected Linear Trend as primary long-range forecasting model based on 2026 partial fidelity and stability.",
    whyWeDidIt: "Linear error on partial 2026 was only -0.0141 dex (vs -0.5856 for ARIMA and -0.9577 for Quadratic).",
    result: "Linear Trend selected as primary model; avoids explosive quadratic extrapolation and ARIMA drift variance."
  },
  {
    id: "step10",
    title: "10. 2027–2030 Projections with PIs",
    category: "Forecasting",
    whatWeDid: "Projected annual median compute through 2030 with rigorous 95% analytical prediction intervals.",
    whyWeDidIt: "To provide actionable forecasts with honest statistical quantification of compounding uncertainty.",
    formula: "\\hat{Y}_h \\pm t_{n-2, \\alpha/2} \\cdot s_e \\sqrt{1 + \\frac{1}{n} + \\frac{(X_h - \\bar{X})^2}{\\sum (X_i - \\bar{X})^2}}",
    result: "2030 Point Forecast: 9.57 × 10²⁶ FLOP; 95% PI: [1.11 × 10²⁵, 8.24 × 10²⁸ FLOP]."
  }
];

export const LIMITATIONS_LIST = [
  {
    id: 1,
    title: "Small Sample Size (N = 16 complete annual observations)",
    description: "The primary modeling horizon spans 2010 through 2025, providing exactly 16 complete yearly observations. In classical time-series econometrics, small samples restrict our ability to reliably fit high-order ARMA parameters without rapid over-parameterization."
  },
  {
    id: 2,
    title: "49.63% Compute Data Missingness (532 of 1,072 models)",
    description: "Nearly half of all models in the repository do not disclose training compute figures. While notable frontier models are heavily documented, smaller open-weights or academic models often lack hardware disclosure, introducing potential reporting and survivor bias."
  },
  {
    id: 3,
    title: "2026 is an Incomplete Partial-Year Observation",
    description: "Data for 2026 reflects observations only through September 21, 2026 (7 models with compute). While used as a pseudo-test check, it cannot be treated as a completed annual aggregation."
  },
  {
    id: 4,
    title: "Wide Multi-Year Prediction Intervals",
    description: "By 2030, our 95% prediction interval spans from 10^25.05 to 10^28.92 FLOP (~3.87 orders of magnitude, a 7,400× spread between lower and upper bounds). This demonstrates high inherent uncertainty in long-range extrapolation."
  },
  {
    id: 5,
    title: "Correlation Does Not Prove Single-Source Causation",
    description: "Our Welch's t-test documents a massive empirical mean shift between 2010–2017 and 2018–2025 (t = -4.8561, p < 0.001). However, this temporal contrast reflects simultaneous shifts in GPU hardware, datacenter capital, dataset sizes, and architectures—not solely the Transformer."
  },
  {
    id: 6,
    title: "Physical and Economic Ceilings on Indefinite Compounding",
    description: "A continuous 3.83× annual expansion cannot continue indefinitely into future decades without colliding with electrical grid capacity, chip fab throughput, water cooling limitations, and global capital budgets."
  }
];
