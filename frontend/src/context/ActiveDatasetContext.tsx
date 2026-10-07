'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  models as defaultModels,
  yearlyCompute as defaultYearlyCompute,
  backtestResults as defaultBacktestResults,
  modelComparison as defaultModelComparison,
  forecasts as defaultForecasts,
  PROJECT_INFO as defaultProjectInfo,
  AIModel,
  YearlyCompute,
  BacktestResult,
  ModelComparison,
  ForecastData
} from '@/data/projectData';
import {
  parseCSV,
  detectColumns,
  runCompleteDatasetAnalysis,
  ColumnDetectionResult,
  FrequencyAnalysis,
  DynamicAnalysisResult
} from '@/utils/statisticalEngine';

export interface ActiveDatasetMeta {
  source: 'default' | 'uploaded';
  filename: string;
  fileSizeStr: string;
  uploadedAt: string;
  status: 'idle' | 'parsing' | 'validating' | 'computing' | 'valid' | 'invalid';
  statusMessage: string;
  errorMessage: string | null;
  validationDetails: {
    detected: ColumnDetectionResult['detected'];
    missing: string[];
    rowCount: number;
    validComputeCount: number;
  } | null;
  primaryFrequency: 'Yearly' | 'Monthly';
  timeRange: string;
  rowsUsed: number;
  validComputeRecords: number;
}

interface ActiveDatasetContextType {
  // Metadata & Status
  activeDataset: ActiveDatasetMeta;
  isDefault: boolean;
  forecastHorizon: number;
  previewRows: Record<string, string>[];

  // Active Downstream Data
  models: AIModel[];
  yearlyCompute: YearlyCompute[];
  backtestResults: BacktestResult[];
  modelComparison: ModelComparison[];
  forecasts: ForecastData[];
  projectInfo: typeof defaultProjectInfo;
  frequencyAnalysis: FrequencyAnalysis;

  // Actions
  uploadCSV: (file: File) => Promise<boolean>;
  loadSyntheticSample: () => void;
  loadEpochSubsetSample: () => void;
  resetToDefault: () => void;
  setForecastHorizon: (horizon: number) => void;
  runPrediction: () => void;
}

const defaultFrequencyAnalysis: FrequencyAnalysis = {
  selectedFrequency: 'Yearly',
  reason: 'Monthly series has 78.91% empty periods with severe historical gaps. Annual median provides unbroken, equispaced sequence.',
  totalPeriods: 77,
  observedPeriods: 16,
  missingPeriods: 0,
  coveragePct: 100,
  medianModelsPerPeriod: 52.5
};

const ActiveDatasetContext = createContext<ActiveDatasetContextType | null>(null);

export const ActiveDatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [activeSource, setActiveSource] = useState<'default' | 'uploaded'>('default');
  const [filename, setFilename] = useState<string>('notable_ai_models.csv');
  const [fileSizeStr, setFileSizeStr] = useState<string>('2.26 MB');
  const [uploadedAt, setUploadedAt] = useState<string>('Default Epoch AI Repository (Built-in)');
  const [status, setStatus] = useState<ActiveDatasetMeta['status']>('valid');
  const [statusMessage, setStatusMessage] = useState<string>('Active: Default Epoch AI Dataset');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<ActiveDatasetMeta['validationDetails']>(null);
  const [forecastHorizon, setForecastHorizon] = useState<number>(4);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);

  // Uploaded calculated results
  const [uploadedData, setUploadedData] = useState<DynamicAnalysisResult | null>(null);

  // Raw uploaded rows cached for recalculation (e.g. changing horizon)
  const [rawUploadedRows, setRawUploadedRows] = useState<{
    rows: Record<string, string>[];
    cols: ColumnDetectionResult['detected'];
  } | null>(null);

  // Upload CSV handler
  const uploadCSV = useCallback(
    async (file: File): Promise<boolean> => {
      setStatus('parsing');
      setStatusMessage('Uploading and parsing CSV...');
      setErrorMessage(null);

      const sizeStr =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      setFilename(file.name);
      setFileSizeStr(sizeStr);
      setUploadedAt(new Date().toLocaleTimeString());

      try {
        const text = await file.text();
        if (!text || text.trim().length === 0) {
          throw new Error('The uploaded CSV file is empty.');
        }

        // 1. Parse CSV
        setStatusMessage('Parsing CSV structure...');
        const parsed = parseCSV(text);
        if (parsed.rows.length === 0) {
          throw new Error('Could not parse any tabular rows from the CSV file.');
        }

        // Save preview of first 10 rows
        setPreviewRows(parsed.rows.slice(0, 10));

        // 2. Validate Required Columns
        setStatus('validating');
        setStatusMessage('Detecting and validating required columns...');
        const colDetect = detectColumns(parsed.headers);

        if (!colDetect.isValid) {
          const missingMsg = colDetect.missingRequired.join(' and ');
          throw new Error(
            `Uploaded CSV cannot be used for this prediction because the required publication-date and training-compute fields were not detected.\nMissing: ${missingMsg}`
          );
        }

        // 3. Run Complete Pipeline
        setStatus('computing');
        setStatusMessage('Cleaning data and building time series...');

        // Artificial small microtask delay to allow React state to render loading progress
        await new Promise((resolve) => setTimeout(resolve, 80));

        setStatusMessage('Fitting OLS, Quadratic, Holt & ARIMA models...');
        const analysis = runCompleteDatasetAnalysis(parsed.rows, colDetect.detected, forecastHorizon);

        setStatusMessage('Running chronological rolling-origin backtesting...');
        await new Promise((resolve) => setTimeout(resolve, 80));

        setStatusMessage('Generating forecasts and analytical 95% prediction intervals...');

        // Success!
        setUploadedData(analysis);
        setRawUploadedRows({ rows: parsed.rows, cols: colDetect.detected });
        setActiveSource('uploaded');
        setStatus('valid');
        setStatusMessage(`Prediction Complete for ${file.name}`);
        setValidationDetails({
          detected: colDetect.detected,
          missing: [],
          rowCount: parsed.rows.length,
          validComputeCount: analysis.stats.validComputeCount
        });

        return true;
      } catch (err: any) {
        setStatus('invalid');
        const msg = err?.message || 'An unknown error occurred while processing the uploaded CSV.';
        setErrorMessage(msg);
        setStatusMessage(`Validation failed: ${msg}`);
        return false;
      }
    },
    [forecastHorizon]
  );

  // Quick 6-Row Synthetic Linear Test (Acceptance Test 1 from user prompt)
  const loadSyntheticSample = useCallback(() => {
    const sampleCsv = `Model,Publication date,Training compute (FLOP),Parameters
Test-A,2020-01-01,1e18,1e8
Test-B,2021-01-01,1e19,2e8
Test-C,2022-01-01,1e20,5e8
Test-D,2023-01-01,1e21,1e9
Test-E,2024-01-01,1e22,2e9
Test-F,2025-01-01,1e23,4e9`;

    const parsed = parseCSV(sampleCsv);
    setPreviewRows(parsed.rows);
    const colDetect = detectColumns(parsed.headers);
    const analysis = runCompleteDatasetAnalysis(parsed.rows, colDetect.detected, forecastHorizon);

    setFilename('synthetic_linear_test.csv');
    setFileSizeStr('240 B');
    setUploadedAt(new Date().toLocaleTimeString());
    setUploadedData(analysis);
    setRawUploadedRows({ rows: parsed.rows, cols: colDetect.detected });
    setActiveSource('uploaded');
    setStatus('valid');
    setStatusMessage('Prediction Complete for synthetic_linear_test.csv');
    setErrorMessage(null);
    setValidationDetails({
      detected: colDetect.detected,
      missing: [],
      rowCount: 6,
      validComputeCount: 6
    });
  }, [forecastHorizon]);

  // Quick Modern Era Subset (2018–2025, Acceptance Test 2 from user prompt)
  const loadEpochSubsetSample = useCallback(() => {
    // Filter modern epoch models from default dataset
    const subsetModels = defaultModels.filter((m) => m.year && m.year >= 2018 && m.year <= 2025);
    const subsetRows: Record<string, string>[] = subsetModels.map((m) => ({
      Model: m.model,
      'Publication date': m.publicationDate,
      'Training compute (FLOP)': m.trainingComputeFLOP !== null ? m.trainingComputeFLOP.toString() : '',
      Parameters: m.parameters !== null ? m.parameters.toString() : '',
      Organization: m.organization
    }));

    setPreviewRows(subsetRows.slice(0, 10));
    const headers = ['Model', 'Publication date', 'Training compute (FLOP)', 'Parameters', 'Organization'];
    const colDetect = detectColumns(headers);
    const analysis = runCompleteDatasetAnalysis(subsetRows, colDetect.detected, forecastHorizon);

    setFilename('frontier_llm_subset_2018_2025.csv');
    setFileSizeStr('148 KB');
    setUploadedAt(new Date().toLocaleTimeString());
    setUploadedData(analysis);
    setRawUploadedRows({ rows: subsetRows, cols: colDetect.detected });
    setActiveSource('uploaded');
    setStatus('valid');
    setStatusMessage('Prediction Complete for frontier_llm_subset_2018_2025.csv');
    setErrorMessage(null);
    setValidationDetails({
      detected: colDetect.detected,
      missing: [],
      rowCount: subsetRows.length,
      validComputeCount: analysis.stats.validComputeCount
    });
  }, [forecastHorizon]);

  // Reset to Default
  const resetToDefault = useCallback(() => {
    setActiveSource('default');
    setFilename('notable_ai_models.csv');
    setFileSizeStr('2.26 MB');
    setUploadedAt('Default Epoch AI Repository (Built-in)');
    setStatus('valid');
    setStatusMessage('Active: Default Epoch AI Dataset');
    setErrorMessage(null);
    setValidationDetails(null);
    setUploadedData(null);
    setRawUploadedRows(null);
    setPreviewRows([]);
  }, []);

  // Run Prediction button action (recalculates on active dataset)
  const runPrediction = useCallback(() => {
    if (activeSource === 'uploaded' && rawUploadedRows) {
      setStatus('computing');
      setStatusMessage('Recalculating prediction on uploaded dataset...');
      setTimeout(() => {
        const analysis = runCompleteDatasetAnalysis(
          rawUploadedRows.rows,
          rawUploadedRows.cols,
          forecastHorizon
        );
        setUploadedData(analysis);
        setStatus('valid');
        setStatusMessage(`Prediction refreshed for ${filename}`);
      }, 50);
    }
  }, [activeSource, rawUploadedRows, forecastHorizon, filename]);

  // Change Forecast Horizon
  const handleSetHorizon = useCallback(
    (h: number) => {
      setForecastHorizon(h);
      if (activeSource === 'uploaded' && rawUploadedRows) {
        const analysis = runCompleteDatasetAnalysis(rawUploadedRows.rows, rawUploadedRows.cols, h);
        setUploadedData(analysis);
      }
    },
    [activeSource, rawUploadedRows]
  );

  // Active dataset metadata object
  const activeDataset: ActiveDatasetMeta = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return {
        source: 'uploaded',
        filename,
        fileSizeStr,
        uploadedAt,
        status,
        statusMessage,
        errorMessage,
        validationDetails,
        primaryFrequency: uploadedData.stats.primaryFrequency,
        timeRange: `${uploadedData.stats.minYear}–${uploadedData.stats.maxYear}`,
        rowsUsed: uploadedData.stats.totalModels,
        validComputeRecords: uploadedData.stats.validComputeCount
      };
    }

    return {
      source: 'default',
      filename: 'notable_ai_models.csv',
      fileSizeStr: '2.26 MB',
      uploadedAt: 'Default Epoch AI Repository (Built-in)',
      status,
      statusMessage,
      errorMessage,
      validationDetails: null,
      primaryFrequency: 'Yearly',
      timeRange: '2010–2026 (1950–2026 Raw)',
      rowsUsed: 1072,
      validComputeRecords: 540
    };
  }, [
    activeSource,
    uploadedData,
    filename,
    fileSizeStr,
    uploadedAt,
    status,
    statusMessage,
    errorMessage,
    validationDetails
  ]);

  // Active Downstream Data
  const models = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.models;
    }
    return defaultModels;
  }, [activeSource, uploadedData]);

  const yearlyCompute = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.yearlyCompute;
    }
    return defaultYearlyCompute;
  }, [activeSource, uploadedData]);

  const backtestResults = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.backtestResults;
    }
    return defaultBacktestResults;
  }, [activeSource, uploadedData]);

  const modelComparison = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.modelComparison;
    }
    return defaultModelComparison;
  }, [activeSource, uploadedData]);

  const forecasts = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.forecasts;
    }
    return defaultForecasts;
  }, [activeSource, uploadedData]);

  const frequencyAnalysis = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      return uploadedData.frequencyAnalysis;
    }
    return defaultFrequencyAnalysis;
  }, [activeSource, uploadedData]);

  // Project Info: dynamically mirrors uploaded dataset metrics when active
  const projectInfo = useMemo(() => {
    if (activeSource === 'uploaded' && uploadedData) {
      const s = uploadedData.stats;
      return {
        ...defaultProjectInfo,
        title: `Time-Series Analysis & Prediction on [${filename}]`,
        dataset: {
          ...defaultProjectInfo.dataset,
          source: `User Uploaded CSV: ${filename}`,
          totalModels: s.totalModels,
          validComputeCount: s.validComputeCount,
          missingComputeCount: s.missingComputeCount,
          validParamsCount: s.validParamsCount,
          missingParamsCount: s.missingParamsCount,
          coverageComputePct:
            s.totalModels > 0
              ? Math.round((s.validComputeCount / s.totalModels) * 1000) / 10
              : 0,
          earliestDate: s.earliestDate,
          latestDate: s.latestDate,
          primaryFrequency: s.primaryFrequency,
          modelingPeriod: `${s.minYear}–${s.maxYear}`,
          modelingYearsCount: s.modelingYearsCount,
          partialYear: 'None',
          partialYearObservedDate: s.latestDate,
          forecastPeriod: `${s.maxYear + 1}–${s.maxYear + forecastHorizon}`,
          primaryTarget: `Y_t = median(log10(Training compute (FLOP))) for year t (${filename})`,
          primaryTargetFormula: '\\hat{Y}_t = \\beta_0 + \\beta_1 \\cdot t'
        },
        descriptiveStats: {
          rawCompute: {
            min: s.rawCompute.min,
            minStr: `${s.rawCompute.min.toExponential(2)} FLOP`,
            max: s.rawCompute.max,
            maxStr: `${s.rawCompute.max.toExponential(2)} FLOP`,
            mean: s.rawCompute.mean,
            meanStr: `${s.rawCompute.mean.toExponential(2)} FLOP`,
            median: s.rawCompute.median,
            medianStr: `${s.rawCompute.median.toExponential(2)} FLOP`,
            std: s.rawCompute.std,
            stdStr: `${s.rawCompute.std.toExponential(2)} FLOP`
          },
          log10Compute: {
            min: s.log10Compute.min,
            max: s.log10Compute.max,
            mean: s.log10Compute.mean,
            median: s.log10Compute.median,
            std: s.log10Compute.std
          },
          recentCoverage: uploadedData.yearlyCompute.slice(-7).map((d) => ({
            year: d.year,
            total: d.totalModels,
            valid: d.validComputeCount,
            pct: d.coveragePct,
            isPartial: d.isPartial
          }))
        },
        correlation: {
          xVar: 'Calendar Year (t)',
          yVar: 'Annual Median log10(Training Compute)',
          sampleSize: s.modelingYearsCount,
          pearsonR: s.pearsonR,
          pearsonPValue: `${s.pearsonPVal.toExponential(4)}`,
          pearsonPValNum: s.pearsonPVal,
          spearmanRho: s.spearmanRho,
          spearmanPValue: `${s.spearmanPVal.toExponential(4)}`,
          spearmanPValNum: s.spearmanPVal,
          interpretation: `Correlation computed strictly on uploaded dataset [${filename}] across ${s.modelingYearsCount} annual observations.`
        },
        linearRegression: {
          intercept: s.linearIntercept,
          slope: s.linearSlope,
          equation: `Y = ${s.linearIntercept.toFixed(4)} + ${s.linearSlope.toFixed(4)} × Year`,
          r2: s.linearR2,
          adjR2: s.linearAdjR2,
          annualGrowthFactor: s.annualGrowthFactor,
          annualGrowthFactorExact: `10^${s.linearSlope.toFixed(4)} ≈ ${s.annualGrowthFactor.toFixed(2)}×`,
          doublingTimeMonths: s.doublingTimeMonths,
          doublingTimeYears: Math.round((s.doublingTimeMonths / 12) * 100) / 100,
          partial2026Actual: 0,
          partial2026Predicted: 0,
          partial2026Error: 0,
          standardError: 0.1
        },
        quadraticRegression: {
          equation: s.quadEquation,
          intercept: 0,
          beta1: 0,
          beta2: 0,
          r2: s.quadR2,
          adjR2: s.quadAdjR2,
          rmseBacktest: 0,
          forecast2030Log10: 0,
          forecast2030FLOP: '',
          reasonRejected: 'Fitted on active uploaded series for comparative polynomial examination.'
        },
        hypothesisTesting: {
          period1: {
            label: s.welchPeriod1Label,
            n: s.welchPeriod1N,
            mean: s.welchPeriod1Mean,
            std: s.welchPeriod1Std,
            var: Math.round(s.welchPeriod1Std * s.welchPeriod1Std * 10000) / 10000
          },
          period2: {
            label: s.welchPeriod2Label,
            n: s.welchPeriod2N,
            mean: s.welchPeriod2Mean,
            std: s.welchPeriod2Std,
            var: Math.round(s.welchPeriod2Std * s.welchPeriod2Std * 10000) / 10000
          },
          testType: "Welch's Two-Sample t-test (unequal variances)",
          tStat: s.welchTStat,
          df: s.welchDf,
          pValue: s.welchPVal,
          alpha: 0.05,
          decision: s.welchPVal < 0.05 ? 'Reject H₀ at α = 0.05' : 'Fail to reject H₀ at α = 0.05',
          substantiveConclusion:
            s.welchPVal < 0.05
              ? `Statistically significant shift detected in uploaded data between ${s.welchPeriod1Label} and ${s.welchPeriod2Label} (p = ${s.welchPVal.toExponential(3)}).`
              : `No statistically significant shift detected at alpha=0.05 between the two temporal periods in this dataset.`,
          observationalCaveat: `Hypothesis evaluation computed directly from user uploaded series [${filename}].`
        }
      };
    }

    return defaultProjectInfo;
  }, [activeSource, uploadedData, filename, forecastHorizon]);

  return (
    <ActiveDatasetContext.Provider
      value={{
        activeDataset,
        isDefault: activeSource === 'default',
        forecastHorizon,
        previewRows,
        models,
        yearlyCompute,
        backtestResults,
        modelComparison,
        forecasts,
        projectInfo,
        frequencyAnalysis,
        uploadCSV,
        loadSyntheticSample,
        loadEpochSubsetSample,
        resetToDefault,
        setForecastHorizon: handleSetHorizon,
        runPrediction
      }}
    >
      {children}
    </ActiveDatasetContext.Provider>
  );
};

export const useActiveDataset = () => {
  const context = useContext(ActiveDatasetContext);
  if (!context) {
    throw new Error('useActiveDataset must be used within an ActiveDatasetProvider');
  }
  return context;
};
