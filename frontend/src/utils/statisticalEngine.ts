/**
 * Full-Featured TypeScript Statistical & Time-Series Engine
 * Performs end-to-end data cleaning, frequency analysis, descriptive statistics,
 * OLS & Quadratic regression, Holt's linear trend, ARIMA(0,1,0)+drift,
 * chronological rolling-origin backtesting, and future forecasting with 95% PIs.
 */

import { AIModel, YearlyCompute, BacktestResult, ModelComparison, ForecastData } from '@/data/projectData';

export interface ParsedCsvData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ColumnDetectionResult {
  detected: {
    model?: string;
    organization?: string;
    publicationDate?: string;
    trainingCompute?: string;
    parameters?: string;
    domain?: string;
    task?: string;
    hardware?: string;
  };
  missingRequired: string[];
  isValid: boolean;
}

export interface FrequencyAnalysis {
  selectedFrequency: 'Yearly' | 'Monthly';
  reason: string;
  totalPeriods: number;
  observedPeriods: number;
  missingPeriods: number;
  coveragePct: number;
  medianModelsPerPeriod: number;
}

export interface DynamicAnalysisResult {
  models: AIModel[];
  yearlyCompute: YearlyCompute[];
  backtestResults: BacktestResult[];
  modelComparison: ModelComparison[];
  forecasts: ForecastData[];
  frequencyAnalysis: FrequencyAnalysis;
  stats: {
    totalModels: number;
    validComputeCount: number;
    missingComputeCount: number;
    validParamsCount: number;
    missingParamsCount: number;
    earliestDate: string;
    latestDate: string;
    minYear: number;
    maxYear: number;
    modelingYearsCount: number;
    primaryFrequency: 'Yearly' | 'Monthly';
    pearsonR: number;
    pearsonPVal: number;
    spearmanRho: number;
    spearmanPVal: number;
    linearSlope: number;
    linearIntercept: number;
    linearR2: number;
    linearAdjR2: number;
    annualGrowthFactor: number;
    doublingTimeMonths: number;
    quadEquation: string;
    quadR2: number;
    quadAdjR2: number;
    welchTStat: number;
    welchDf: number;
    welchPVal: number;
    welchPeriod1Label: string;
    welchPeriod1Mean: number;
    welchPeriod1Std: number;
    welchPeriod1N: number;
    welchPeriod2Label: string;
    welchPeriod2Mean: number;
    welchPeriod2Std: number;
    welchPeriod2N: number;
    rawCompute: {
      min: number;
      max: number;
      mean: number;
      median: number;
      std: number;
    };
    log10Compute: {
      min: number;
      max: number;
      mean: number;
      median: number;
      std: number;
    };
  };
}

// ----------------------------------------------------
// 1. CSV Parser
// ----------------------------------------------------
export function parseCSV(csvText: string): ParsedCsvData {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const splitLine = (line: string): string[] => {
    const entries: string[] = [];
    let cur = '';
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const nc = line[i + 1];

      if (c === '"') {
        if (inside && nc === '"') {
          cur += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        entries.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    entries.push(cur.trim());
    return entries;
  };

  const headers = splitLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const tokens = splitLine(lines[i]);
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = tokens[j] !== undefined ? tokens[j].replace(/^["']|["']$/g, '').trim() : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

// ----------------------------------------------------
// 2. Flexible Column Detection
// ----------------------------------------------------
export function detectColumns(headers: string[]): ColumnDetectionResult {
  const detected: ColumnDetectionResult['detected'] = {};

  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  headers.forEach((header) => {
    const c = clean(header);

    // Publication Date
    if (
      !detected.publicationDate &&
      (c.includes('publicationdate') ||
        c.includes('releasedate') ||
        c === 'date' ||
        c === 'pubdate' ||
        c === 'yearpublished' ||
        c === 'publicationyear')
    ) {
      detected.publicationDate = header;
      return;
    }

    // Training Compute
    if (
      !detected.trainingCompute &&
      (c.includes('trainingcompute') ||
        c.includes('trainingflop') ||
        c.includes('computeflop') ||
        c === 'flops' ||
        c === 'flop' ||
        c === 'compute' ||
        c.includes('computeflops') ||
        c.includes('trainingflops'))
    ) {
      detected.trainingCompute = header;
      return;
    }

    // Parameters
    if (
      !detected.parameters &&
      (c.includes('parameter') || c.includes('paramcount') || c === 'params' || c === 'numparams')
    ) {
      detected.parameters = header;
      return;
    }

    // Model name
    if (
      !detected.model &&
      (c === 'model' || c.includes('modelname') || c === 'name' || c.includes('aimodel') || c === 'system')
    ) {
      detected.model = header;
      return;
    }

    // Organization
    if (
      !detected.organization &&
      (c.includes('organization') ||
        c === 'org' ||
        c.includes('developer') ||
        c.includes('creator') ||
        c.includes('author') ||
        c.includes('company') ||
        c.includes('institution') ||
        c.includes('lab'))
    ) {
      detected.organization = header;
      return;
    }

    // Domain
    if (!detected.domain && (c.includes('domain') || c.includes('category') || c === 'field')) {
      detected.domain = header;
      return;
    }

    // Task
    if (!detected.task && (c.includes('task') || c.includes('application'))) {
      detected.task = header;
      return;
    }

    // Hardware
    if (!detected.hardware && (c.includes('hardware') || c.includes('chip') || c.includes('accelerator'))) {
      detected.hardware = header;
      return;
    }
  });

  const missingRequired: string[] = [];
  if (!detected.publicationDate) missingRequired.push('Publication date (e.g. "Publication date", "date", "release_date")');
  if (!detected.trainingCompute) missingRequired.push('Training compute (FLOP) (e.g. "Training compute (FLOP)", "training_compute", "FLOPs")');

  return {
    detected,
    missingRequired,
    isValid: missingRequired.length === 0
  };
}

// ----------------------------------------------------
// 3. Mathematical Helpers
// ----------------------------------------------------
export function parseScientificNumber(val: string): number | null {
  if (!val) return null;
  const cleaned = val.replace(/,/g, '').replace(/flop(s)?/i, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

export function parseDateToYearAndMonth(val: string): { year: number | null; month: string | null; dateStr: string } {
  if (!val) return { year: null, month: null, dateStr: 'Unknown' };

  const cleaned = val.trim();
  // Match YYYY-MM-DD, YYYY/MM/DD, YYYY-MM, or YYYY
  const matchIso = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/]?(\d{1,2})?/);
  if (matchIso) {
    const y = parseInt(matchIso[1], 10);
    const m = matchIso[2] ? matchIso[2].padStart(2, '0') : '01';
    return { year: y, month: `${y}-${m}`, dateStr: cleaned };
  }

  // Bare year (e.g. 2024)
  const matchYear = cleaned.match(/^(\d{4})$/);
  if (matchYear) {
    const y = parseInt(matchYear[1], 10);
    return { year: y, month: `${y}-01`, dateStr: `${y}-01-01` };
  }

  // Fallback try Date.parse
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return { year: y, month: `${y}-${m}`, dateStr: cleaned };
  }

  return { year: null, month: null, dateStr: cleaned };
}

export function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateMean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateStd(values: number[], mean: number): number | null {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// Exact two-tailed t-distribution critical values for alpha=0.05
const T_CRIT_95_TABLE: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042
};

export function getTCritical95(df: number): number {
  const roundedDf = Math.max(1, Math.round(df));
  if (T_CRIT_95_TABLE[roundedDf]) return T_CRIT_95_TABLE[roundedDf];
  // Cornish-Fisher expansion for df > 30
  const z = 1.95996;
  return z + (Math.pow(z, 3) + z) / (4 * roundedDf);
}

// Student t p-value approximation
export function computeStudentTPValue(t: number, df: number): number {
  if (df <= 0) return 1.0;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  // Incomplete beta approximation
  const a = df / 2;
  const b = 0.5;
  // Continued fraction / series approximation
  let sum = 0;
  let term = 1;
  for (let i = 0; i < 20; i++) {
    sum += term;
    term *= ((a + i) * (1 - x)) / (i + 1);
    if (Math.abs(term) < 1e-7) break;
  }
  const pVal = 0.5 * Math.pow(x, a) * sum;
  return Math.min(1.0, Math.max(1e-12, 2 * pVal));
}

// ----------------------------------------------------
// 4. Main Analysis & Pipeline Function
// ----------------------------------------------------
export function runCompleteDatasetAnalysis(
  rows: Record<string, string>[],
  cols: ColumnDetectionResult['detected'],
  forecastHorizon: number = 4
): DynamicAnalysisResult {
  // 1. Clean & transform rows into AIModel records
  const models: AIModel[] = rows.map((r, idx) => {
    const rawDate = cols.publicationDate ? r[cols.publicationDate] : '';
    const { year, dateStr } = parseDateToYearAndMonth(rawDate);

    const rawCompute = cols.trainingCompute ? r[cols.trainingCompute] : '';
    const computeFlop = parseScientificNumber(rawCompute);
    const log10Compute = computeFlop !== null ? Math.log10(computeFlop) : null;

    const rawParams = cols.parameters ? r[cols.parameters] : '';
    const params = parseScientificNumber(rawParams);

    const modelName = cols.model && r[cols.model] ? r[cols.model] : `Model-${idx + 1}`;
    const org = cols.organization && r[cols.organization] ? r[cols.organization] : 'Unknown';
    const domain = cols.domain && r[cols.domain] ? r[cols.domain] : 'General';
    const task = cols.task && r[cols.task] ? r[cols.task] : 'General Machine Learning';
    const hardware = cols.hardware && r[cols.hardware] ? r[cols.hardware] : 'Unknown';

    return {
      id: idx + 1,
      model: modelName,
      organization: org,
      publicationDate: dateStr,
      year: year,
      parameters: params,
      parametersStr: params !== null ? (params >= 1e9 ? `${(params / 1e9).toFixed(1)}B` : `${params.toExponential(2)}`) : 'Undisclosed',
      trainingComputeFLOP: computeFlop,
      trainingComputeStr: computeFlop !== null ? `${computeFlop.toExponential(2)} FLOP` : 'Undisclosed',
      log10Compute: log10Compute,
      frontierModel: computeFlop !== null && computeFlop >= 1e24,
      trainingHardware: hardware,
      domain: domain,
      task: task,
      hasCompute: computeFlop !== null,
      hasParameters: params !== null
    };
  });

  // Filter models with valid year
  const datedModels = models.filter((m) => m.year !== null);
  if (datedModels.length === 0) {
    throw new Error('No valid publication dates detected in the uploaded CSV.');
  }

  // 2. Frequency Analysis (Yearly vs Monthly)
  const years = Array.from(new Set(datedModels.map((m) => m.year!))).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  // Group by year
  const yearlyMap = new Map<number, AIModel[]>();
  for (let y = minYear; y <= maxYear; y++) {
    yearlyMap.set(y, []);
  }
  datedModels.forEach((m) => {
    if (m.year !== null && yearlyMap.has(m.year)) {
      yearlyMap.get(m.year)!.push(m);
    }
  });

  const yearlyCompute: YearlyCompute[] = [];
  years.forEach((y) => {
    const list = yearlyMap.get(y) || [];
    const withCompute = list.filter((m) => m.log10Compute !== null);
    const logVals = withCompute.map((m) => m.log10Compute!);
    const flopVals = withCompute.map((m) => m.trainingComputeFLOP!);

    const medLog = calculateMedian(logVals);
    const meanLog = calculateMean(logVals);
    const stdLog = meanLog !== null ? calculateStd(logVals, meanLog) : null;
    const minLog = logVals.length > 0 ? Math.min(...logVals) : null;
    const maxLog = logVals.length > 0 ? Math.max(...logVals) : null;
    const medFlop = calculateMedian(flopVals);
    const meanFlop = calculateMean(flopVals);

    yearlyCompute.push({
      year: y,
      validComputeCount: withCompute.length,
      totalModels: list.length,
      coveragePct: list.length > 0 ? Math.round((withCompute.length / list.length) * 1000) / 10 : 0,
      medianLog10: medLog,
      meanLog10: meanLog !== null ? Math.round(meanLog * 10000) / 10000 : null,
      stdLog10: stdLog !== null ? Math.round(stdLog * 10000) / 10000 : null,
      minLog10: minLog !== null ? Math.round(minLog * 10000) / 10000 : null,
      maxLog10: maxLog !== null ? Math.round(maxLog * 10000) / 10000 : null,
      medianFLOP: medFlop,
      meanFLOP: meanFlop,
      isPartial: false,
      inModelingWindow: medLog !== null,
      linearFit: null,
      quadFit: null
    });
  });

  // Filter valid yearly series (years that have valid median)
  const validYearsData = yearlyCompute.filter((d) => d.medianLog10 !== null);
  const n = validYearsData.length;

  if (n < 2) {
    throw new Error(
      `Prediction cannot be performed because this dataset contains only ${n} usable yearly observation(s). At least 3–5 chronological observations are required.`
    );
  }

  // Frequency analysis object
  const frequencyAnalysis: FrequencyAnalysis = {
    selectedFrequency: 'Yearly',
    reason: `Annual aggregation provides unbroken equispaced series across ${n} observed year(s) without intra-month disclosure noise.`,
    totalPeriods: maxYear - minYear + 1,
    observedPeriods: n,
    missingPeriods: (maxYear - minYear + 1) - n,
    coveragePct: Math.round((n / (maxYear - minYear + 1)) * 1000) / 10,
    medianModelsPerPeriod: calculateMedian(validYearsData.map((d) => d.totalModels)) || 1
  };

  // 3. Descriptive Stats of Full Dataset
  const allValidCompute = models.filter((m) => m.trainingComputeFLOP !== null).map((m) => m.trainingComputeFLOP!);
  const allValidLog10 = models.filter((m) => m.log10Compute !== null).map((m) => m.log10Compute!);
  const allValidParams = models.filter((m) => m.parameters !== null).map((m) => m.parameters!);

  const rawMean = calculateMean(allValidCompute) || 0;
  const rawMed = calculateMedian(allValidCompute) || 0;
  const rawStd = calculateStd(allValidCompute, rawMean) || 0;
  const logMean = calculateMean(allValidLog10) || 0;
  const logMed = calculateMedian(allValidLog10) || 0;
  const logStd = calculateStd(allValidLog10, logMean) || 0;

  // 4. Linear Trend OLS
  const xVals = validYearsData.map((d) => d.year);
  const yVals = validYearsData.map((d) => d.medianLog10!);

  const xBar = calculateMean(xVals)!;
  const yBar = calculateMean(yVals)!;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - xBar;
    const dy = yVals[i] - yBar;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yBar - slope * xBar;

  const pearsonR = ssXX > 0 && ssYY > 0 ? ssXY / Math.sqrt(ssXX * ssYY) : 1;
  const linearR2 = Math.min(1.0, Math.max(0.0, pearsonR * pearsonR));
  const linearAdjR2 = n > 2 ? 1 - ((1 - linearR2) * (n - 1)) / (n - 2) : linearR2;

  // Pearson p-value
  const tStatPearson = n > 2 && Math.abs(pearsonR) < 1 ? pearsonR * Math.sqrt((n - 2) / (1 - pearsonR * pearsonR)) : 100;
  const pearsonPVal = computeStudentTPValue(tStatPearson, n - 2);

  // Spearman Rank Correlation
  const rankedX = rankArray(xVals);
  const rankedY = rankArray(yVals);
  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = rankedX[i] - rankedY[i];
    sumD2 += d * d;
  }
  const spearmanRho = n > 1 ? 1 - (6 * sumD2) / (n * (n * n - 1)) : 1;
  const tStatSpearman = n > 2 && Math.abs(spearmanRho) < 1 ? spearmanRho * Math.sqrt((n - 2) / (1 - spearmanRho * spearmanRho)) : 100;
  const spearmanPVal = computeStudentTPValue(tStatSpearman, n - 2);

  // Standard Error of OLS Regression
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const fitted = intercept + slope * xVals[i];
    ssRes += Math.pow(yVals[i] - fitted, 2);
  }
  const seRes = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0.01;
  const annualGrowthFactor = Math.pow(10, slope);
  const doublingTimeMonths = slope > 0 ? (Math.log10(2) / slope) * 12 : 0;

  // Populate linearFit in yearlyCompute
  yearlyCompute.forEach((d) => {
    if (d.medianLog10 !== null) {
      d.linearFit = Math.round((intercept + slope * d.year) * 10000) / 10000;
    }
  });

  // 5. Quadratic Regression
  // Fit y = a*t^2 + b*t + c where t = year - minYear
  const tVals = xVals.map((x) => x - minYear);
  const { a: quadA, b: quadB, c: quadC } = fitQuadratic(tVals, yVals);

  let ssQuadRes = 0;
  for (let i = 0; i < n; i++) {
    const qFitted = quadA * tVals[i] * tVals[i] + quadB * tVals[i] + quadC;
    ssQuadRes += Math.pow(yVals[i] - qFitted, 2);
  }
  const quadR2 = ssYY > 0 ? Math.min(1.0, Math.max(0.0, 1 - ssQuadRes / ssYY)) : 1;
  const quadAdjR2 = n > 3 ? 1 - ((1 - quadR2) * (n - 1)) / (n - 3) : quadR2;
  const quadEq = `Y = ${quadC.toFixed(4)} + ${quadB >= 0 ? '+' : ''}${quadB.toFixed(4)}·t + ${quadA >= 0 ? '+' : ''}${quadA.toFixed(6)}·t² (t = Year - ${minYear})`;

  yearlyCompute.forEach((d) => {
    if (d.medianLog10 !== null) {
      const t = d.year - minYear;
      d.quadFit = Math.round((quadA * t * t + quadB * t + quadC) * 10000) / 10000;
    }
  });

  // 6. Chronological Rolling-Origin Backtest
  const backtestResults: BacktestResult[] = [];
  const minTrainSize = Math.max(2, Math.floor(n / 2));
  const testIndices: number[] = [];
  for (let i = minTrainSize; i < n; i++) {
    testIndices.push(i);
  }

  const modelNames = ['Naive', 'Linear Trend', 'Quadratic Trend', 'Holt Linear Trend', 'ARIMA(0,1,0)+drift'];

  testIndices.forEach((testIdx) => {
    const trainX = xVals.slice(0, testIdx);
    const trainY = yVals.slice(0, testIdx);
    const actualY = yVals[testIdx];
    const testYear = xVals[testIdx];

    // Naive
    const pNaive = trainY[trainY.length - 1];

    // Linear
    const { slope: sSub, intercept: intSub } = fitLinear(trainX, trainY);
    const pLinear = intSub + sSub * testYear;

    // Quadratic
    const trainT = trainX.map((x) => x - minYear);
    const testT = testYear - minYear;
    const { a: qA, b: qB, c: qC } = fitQuadratic(trainT, trainY);
    const pQuad = qA * testT * testT + qB * testT + qC;

    // Holt
    const pHolt = forecastHolt(trainY, 1)[0];

    // ARIMA(0,1,0)+drift: drift = (last - first)/(len - 1)
    const drift = trainY.length > 1 ? (trainY[trainY.length - 1] - trainY[0]) / (trainY.length - 1) : 0;
    const pArima = trainY[trainY.length - 1] + drift;

    const preds: Record<string, number> = {
      Naive: pNaive,
      'Linear Trend': pLinear,
      'Quadratic Trend': pQuad,
      'Holt Linear Trend': pHolt,
      'ARIMA(0,1,0)+drift': pArima
    };

    modelNames.forEach((m) => {
      const p = preds[m];
      const err = actualY - p;
      backtestResults.push({
        model: m,
        testYear: testYear,
        actual: Math.round(actualY * 10000) / 10000,
        predicted: Math.round(p * 10000) / 10000,
        error: Math.round(err * 10000) / 10000,
        absoluteError: Math.round(Math.abs(err) * 10000) / 10000,
        squaredError: Math.round(err * err * 10000) / 10000
      });
    });
  });

  // Calculate Backtest Metrics
  const modelComparison: ModelComparison[] = [];
  const testActuals = testIndices.map((idx) => yVals[idx]);
  const testActualsMean = calculateMean(testActuals) || 0;
  const ssTotBt = testActuals.reduce((sum, v) => sum + Math.pow(v - testActualsMean, 2), 0);

  const forecastHorizonYears = forecastHorizon;
  const targetForecastYear = maxYear + forecastHorizonYears;

  // Full model forecasts for targetForecastYear
  const pFinalNaive = yVals[yVals.length - 1];
  const pFinalLinear = intercept + slope * targetForecastYear;
  const pFinalQuad = quadA * Math.pow(targetForecastYear - minYear, 2) + quadB * (targetForecastYear - minYear) + quadC;
  const pFinalHolt = forecastHolt(yVals, forecastHorizonYears)[forecastHorizonYears - 1];
  const driftFull = n > 1 ? (yVals[yVals.length - 1] - yVals[0]) / (n - 1) : 0;
  const pFinalArima = yVals[yVals.length - 1] + forecastHorizonYears * driftFull;

  const finalForecastMap: Record<string, number> = {
    Naive: pFinalNaive,
    'Linear Trend': pFinalLinear,
    'Quadratic Trend': pFinalQuad,
    'Holt Linear Trend': pFinalHolt,
    'ARIMA(0,1,0)+drift': pFinalArima
  };

  const behaviors: Record<string, string> = {
    Naive: 'Flat baseline extrapolation',
    'Linear Trend': 'Linear log-space progression (orderly compounding)',
    'Quadratic Trend': 'Curvilinear acceleration',
    'Holt Linear Trend': 'Dynamic smoothed slope extrapolation',
    'ARIMA(0,1,0)+drift': 'Constant historical drift progression'
  };

  const comments: Record<string, string> = {
    'Linear Trend': 'PRIMARY SELECTION: Robust stability, avoids explosive polynomial overfitting.',
    'ARIMA(0,1,0)+drift': 'Strong differenced drift time-series specification.',
    'Holt Linear Trend': 'Adaptive exponential smoothing baseline.',
    'Quadratic Trend': 'Risk of explosive quadratic curvature over longer horizons.',
    Naive: 'Reference baseline model.'
  };

  modelNames.forEach((m) => {
    const sub = backtestResults.filter((r) => r.model === m);
    const mae = sub.length > 0 ? calculateMean(sub.map((s) => s.absoluteError)) || 0 : 0;
    const rmse = sub.length > 0 ? Math.sqrt(calculateMean(sub.map((s) => s.squaredError)) || 0) : 0;
    const ssResBt = sub.reduce((sum, s) => sum + s.squaredError, 0);
    const oosR2 = ssTotBt > 0 && sub.length > 0 ? 1 - ssResBt / ssTotBt : 0;
    const fcVal = finalForecastMap[m];

    modelComparison.push({
      model: m,
      mae: Math.round(mae * 10000) / 10000,
      rmse: Math.round(rmse * 10000) / 10000,
      oosR2: Math.round(oosR2 * 10000) / 10000,
      error2026Partial: 0,
      forecast2030Log10: Math.round(fcVal * 10000) / 10000,
      forecast2030FLOP: `${Math.pow(10, fcVal).toExponential(2)} FLOP`,
      behavior: behaviors[m],
      comments: comments[m]
    });
  });

  // 7. Future Forecasts with 95% Analytical Prediction Intervals
  const forecasts: ForecastData[] = [];
  const tCrit = getTCritical95(n - 2);

  for (let h = 1; h <= forecastHorizonYears; h++) {
    const fYear = maxYear + h;
    const linLog = intercept + slope * fYear;
    const sePred = seRes * Math.sqrt(1 + 1 / n + Math.pow(fYear - xBar, 2) / (ssXX || 1));
    const piLowLog = linLog - tCrit * sePred;
    const piHighLog = linLog + tCrit * sePred;

    const quadT = fYear - minYear;
    const qLog = quadA * quadT * quadT + quadB * quadT + quadC;
    const hLog = forecastHolt(yVals, h)[h - 1];
    const arLog = yVals[yVals.length - 1] + h * driftFull;

    const linFlop = Math.pow(10, linLog);
    const piLowFlop = Math.pow(10, piLowLog);
    const piHighFlop = Math.pow(10, piHighLog);

    forecasts.push({
      year: fYear,
      linearLog10: Math.round(linLog * 10000) / 10000,
      linearFLOP: linFlop,
      linearFLOPStr: `${linFlop.toExponential(2)} FLOP`,
      piLowerLog10: Math.round(piLowLog * 10000) / 10000,
      piUpperLog10: Math.round(piHighLog * 10000) / 10000,
      piLowerFLOP: piLowFlop,
      piUpperFLOP: piHighFlop,
      piLowerFLOPStr: `${piLowFlop.toExponential(2)} FLOP`,
      piUpperFLOPStr: `${piHighFlop.toExponential(2)} FLOP`,
      arima010Log10: Math.round(arLog * 10000) / 10000,
      holtLog10: Math.round(hLog * 10000) / 10000,
      quadLog10: Math.round(qLog * 10000) / 10000
    });
  }

  // 8. Welch's Two-Sample t-Test on Epoch Halves
  const midPoint = Math.floor(n / 2);
  const p1Data = yVals.slice(0, midPoint);
  const p2Data = yVals.slice(midPoint);

  const n1 = p1Data.length;
  const n2 = p2Data.length;
  const m1 = calculateMean(p1Data) || 0;
  const m2 = calculateMean(p2Data) || 0;
  const s1 = calculateStd(p1Data, m1) || 0.1;
  const s2 = calculateStd(p2Data, m2) || 0.1;

  const v1 = (s1 * s1) / (n1 || 1);
  const v2 = (s2 * s2) / (n2 || 1);
  const welchTStat = (m1 - m2) / Math.sqrt(v1 + v2);
  const welchDf = Math.pow(v1 + v2, 2) / (Math.pow(v1, 2) / Math.max(1, n1 - 1) + Math.pow(v2, 2) / Math.max(1, n2 - 1));
  const welchPVal = computeStudentTPValue(welchTStat, welchDf);

  const p1YearStart = xVals[0];
  const p1YearEnd = xVals[midPoint - 1];
  const p2YearStart = xVals[midPoint];
  const p2YearEnd = xVals[n - 1];

  return {
    models,
    yearlyCompute,
    backtestResults,
    modelComparison,
    forecasts,
    frequencyAnalysis,
    stats: {
      totalModels: models.length,
      validComputeCount: allValidCompute.length,
      missingComputeCount: models.length - allValidCompute.length,
      validParamsCount: allValidParams.length,
      missingParamsCount: models.length - allValidParams.length,
      earliestDate: datedModels[0]?.publicationDate || 'Unknown',
      latestDate: datedModels[datedModels.length - 1]?.publicationDate || 'Unknown',
      minYear,
      maxYear,
      modelingYearsCount: n,
      primaryFrequency: frequencyAnalysis.selectedFrequency,
      pearsonR: Math.round(pearsonR * 10000) / 10000,
      pearsonPVal,
      spearmanRho: Math.round(spearmanRho * 10000) / 10000,
      spearmanPVal,
      linearSlope: Math.round(slope * 10000) / 10000,
      linearIntercept: Math.round(intercept * 10000) / 10000,
      linearR2: Math.round(linearR2 * 10000) / 10000,
      linearAdjR2: Math.round(linearAdjR2 * 10000) / 10000,
      annualGrowthFactor: Math.round(annualGrowthFactor * 100) / 100,
      doublingTimeMonths: Math.round(doublingTimeMonths * 10) / 10,
      quadEquation: quadEq,
      quadR2: Math.round(quadR2 * 10000) / 10000,
      quadAdjR2: Math.round(quadAdjR2 * 10000) / 10000,
      welchTStat: Math.round(welchTStat * 10000) / 10000,
      welchDf: Math.round(welchDf * 100) / 100,
      welchPVal,
      welchPeriod1Label: `Period 1 (${p1YearStart}–${p1YearEnd})`,
      welchPeriod1Mean: Math.round(m1 * 10000) / 10000,
      welchPeriod1Std: Math.round(s1 * 10000) / 10000,
      welchPeriod1N: n1,
      welchPeriod2Label: `Period 2 (${p2YearStart}–${p2YearEnd})`,
      welchPeriod2Mean: Math.round(m2 * 10000) / 10000,
      welchPeriod2Std: Math.round(s2 * 10000) / 10000,
      welchPeriod2N: n2,
      rawCompute: {
        min: allValidCompute.length > 0 ? Math.min(...allValidCompute) : 0,
        max: allValidCompute.length > 0 ? Math.max(...allValidCompute) : 0,
        mean: rawMean,
        median: rawMed,
        std: rawStd
      },
      log10Compute: {
        min: allValidLog10.length > 0 ? Math.min(...allValidLog10) : 0,
        max: allValidLog10.length > 0 ? Math.max(...allValidLog10) : 0,
        mean: Math.round(logMean * 10000) / 10000,
        median: Math.round(logMed * 10000) / 10000,
        std: Math.round(logStd * 10000) / 10000
      }
    }
  };
}

// ----------------------------------------------------
// Mathematical Utility Implementations
// ----------------------------------------------------
function rankArray(arr: number[]): number[] {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);
  const ranks = new Array<number>(arr.length);
  for (let i = 0; i < indexed.length; i++) {
    ranks[indexed[i].idx] = i + 1;
  }
  return ranks;
}

function fitLinear(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: y[0] || 0 };
  const xB = calculateMean(x)!;
  const yB = calculateMean(y)!;
  let sXX = 0;
  let sXY = 0;
  for (let i = 0; i < n; i++) {
    sXX += (x[i] - xB) * (x[i] - xB);
    sXY += (x[i] - xB) * (y[i] - yB);
  }
  const slope = sXX !== 0 ? sXY / sXX : 0;
  const intercept = yB - slope * xB;
  return { slope, intercept };
}

function fitQuadratic(t: number[], y: number[]): { a: number; b: number; c: number } {
  const n = t.length;
  if (n < 3) return { a: 0, b: 0, c: y[0] || 0 };

  // Solve 3x3 normal equations: [ [sum(1), sum(t), sum(t^2)], [sum(t), sum(t^2), sum(t^3)], [sum(t^2), sum(t^3), sum(t^4)] ] * [c, b, a]^T = [sum(y), sum(ty), sum(t^2 y)]^T
  let s0 = n;
  let s1 = 0, s2 = 0, s3 = 0, s4 = 0;
  let sy = 0, sty = 0, st2y = 0;

  for (let i = 0; i < n; i++) {
    const ti = t[i];
    const ti2 = ti * ti;
    s1 += ti;
    s2 += ti2;
    s3 += ti2 * ti;
    s4 += ti2 * ti2;
    sy += y[i];
    sty += ti * y[i];
    st2y += ti2 * y[i];
  }

  // 3x3 linear system solved via Cramer's rule
  const detA =
    s0 * (s2 * s4 - s3 * s3) -
    s1 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * s3 - s2 * s2);

  if (Math.abs(detA) < 1e-12) {
    return { a: 0, b: 0, c: y[0] || 0 };
  }

  const detC =
    sy * (s2 * s4 - s3 * s3) -
    s1 * (sty * s4 - st2y * s3) +
    s2 * (sty * s3 - st2y * s2);

  const detB =
    s0 * (sty * s4 - st2y * s3) -
    sy * (s1 * s4 - s3 * s2) +
    s2 * (s1 * st2y - s2 * sty);

  const detA_val =
    s0 * (s2 * st2y - s3 * sty) -
    s1 * (s1 * st2y - s2 * sty) +
    sy * (s1 * s3 - s2 * s2);

  return {
    c: detC / detA,
    b: detB / detA,
    a: detA_val / detA
  };
}

function forecastHolt(series: number[], horizon: number): number[] {
  if (series.length === 0) return new Array(horizon).fill(0);
  if (series.length === 1) return new Array(horizon).fill(series[0]);

  // Standard Holt parameters
  const alpha = 0.6;
  const beta = 0.2;

  let level = series[0];
  let trend = series[1] - series[0];

  for (let i = 1; i < series.length; i++) {
    const lastLevel = level;
    level = alpha * series[i] + (1 - alpha) * (lastLevel + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
  }

  const out: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    out.push(level + h * trend);
  }
  return out;
}
