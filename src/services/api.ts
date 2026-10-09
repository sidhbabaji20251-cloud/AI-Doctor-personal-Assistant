import {
  NewsData,
  MedicalInstitutionsData,
  MedicalResearchData,
  ProblemSolverData,
  MarketResearchData,
  PlanData,
  DoctorsNewsData,
  DrugSubstituteData,
  StandardPrescriptionData,
  GroundingSource,
  Language,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  sources?: GroundingSource[];
  rawText?: string;
  error?: string;
}

export async function fetchNews(
  category = 'all',
  language: Language = 'en',
  customQuery = ''
): Promise<ApiResponse<NewsData>> {
  const res = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, language, customQuery }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch news (${res.status})`);
  }
  return res.json();
}

export async function fetchMedicalInstitutes(
  instituteId = 'all',
  language: Language = 'en',
  customQuery = ''
): Promise<ApiResponse<MedicalInstitutionsData>> {
  const res = await fetch('/api/medical-institutes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instituteId, language, customQuery }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch medical institute updates (${res.status})`);
  }
  return res.json();
}

export async function fetchMedicalResearch(
  topic = 'diabetes',
  language: Language = 'en',
  customQuery = ''
): Promise<ApiResponse<MedicalResearchData>> {
  const res = await fetch('/api/medical-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, language, customQuery }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch medical research (${res.status})`);
  }
  return res.json();
}

export async function solveProblem(
  problem: string,
  domain = 'general',
  language: Language = 'en'
): Promise<ApiResponse<ProblemSolverData>> {
  const res = await fetch('/api/problem-solver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, domain, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze problem (${res.status})`);
  }
  return res.json();
}

export async function runMarketResearch(
  query: string,
  budget = '',
  location = 'India',
  language: Language = 'en'
): Promise<ApiResponse<MarketResearchData>> {
  const res = await fetch('/api/market-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, budget, location, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to run market research (${res.status})`);
  }
  return res.json();
}

export async function generatePlan(
  goal: string,
  timeframe = '30 days',
  budget = '',
  language: Language = 'en'
): Promise<ApiResponse<PlanData>> {
  const res = await fetch('/api/plan-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, timeframe, budget, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate plan (${res.status})`);
  }
  return res.json();
}

export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<string> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to translate text (${res.status})`);
  }
  const data = await res.json();
  return data.translatedText || text;
}

export async function fetchDoctorsNews(
  category = 'all',
  language: Language = 'en',
  customQuery = ''
): Promise<ApiResponse<DoctorsNewsData>> {
  const res = await fetch('/api/doctors-news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, language, customQuery }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch doctors news (${res.status})`);
  }
  return res.json();
}

export async function fetchDrugSubstitutes(
  saltQuery: string,
  language: Language = 'en'
): Promise<ApiResponse<DrugSubstituteData>> {
  const res = await fetch('/api/drug-substitutes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saltQuery, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch drug substitutes (${res.status})`);
  }
  return res.json();
}

export async function fetchStandardPrescriptions(
  category = 'all',
  diseaseQuery = '',
  language: Language = 'en'
): Promise<ApiResponse<StandardPrescriptionData>> {
  const res = await fetch('/api/standard-prescriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, diseaseQuery, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch standard prescriptions (${res.status})`);
  }
  return res.json();
}

export async function fetchApiDiagnostics(): Promise<import('../types').ApiDiagnosticReport> {
  const res = await fetch('/api/test');
  if (!res.ok) {
    throw new Error(`Failed to run API diagnostics (${res.status})`);
  }
  return res.json();
}

export async function runApiTestRunner(testType: string, testPayload: any = {}): Promise<any> {
  const res = await fetch('/api/test/runner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType, testPayload }),
  });
  if (!res.ok) {
    throw new Error(`Test runner failed (${res.status})`);
  }
  return res.json();
}

export async function fetchFreewareInfo(): Promise<import('../types').FreewareInfo> {
  const res = await fetch('/api/freeware-info');
  if (!res.ok) {
    throw new Error(`Failed to fetch freeware info (${res.status})`);
  }
  return res.json();
}

export async function fetchAdvertising(): Promise<import('../types').AdvertisingData> {
  const res = await fetch('/api/advertising');
  if (!res.ok) {
    throw new Error(`Failed to fetch advertising campaigns (${res.status})`);
  }
  return res.json();
}

export async function submitCustomAdvertising(campaign: {
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  sponsorName?: string;
}): Promise<any> {
  const res = await fetch('/api/advertising/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit custom advertising (${res.status})`);
  }
  return res.json();
}


