export type Language = 'en' | 'hi';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Jaipur' | 'Rajasthan' | 'Himachal Pradesh' | 'National' | 'International' | string;
  summary: string;
  verifiedFacts: string[];
  uncertaintiesOrPendingUpdates?: string;
  publishedTime?: string;
  sourceName?: string;
}

export interface NewsData {
  summary: string;
  articles: NewsArticle[];
  disclaimer: string;
}

export interface MedicalInstitutionUpdate {
  type: string;
  headline: string;
  details: string;
  date?: string;
  verified?: boolean;
}

export interface MedicalInstitution {
  name: string;
  shortCode: string;
  location: string;
  statusNotice: string;
  recentUpdates: MedicalInstitutionUpdate[];
  helplineOrContact?: string;
  actionGuidanceForPatients?: string;
}

export interface MedicalInstitutionsData {
  lastUpdated: string;
  institutions: MedicalInstitution[];
  disclaimer: string;
}

export interface MedicalAdvance {
  breakthrough: string;
  mechanismOrInnovation: string;
  clinicalSignificance: string;
  levelOfEvidence: string;
  keyStudyOrAgency: string;
}

export interface MedicalResearchData {
  topicTitle: string;
  executiveSummary: string;
  keyAdvances: MedicalAdvance[];
  lifestyleAndPracticalInsights: string[];
  limitationsAndUncertainties: string[];
  medicalDisclaimer: string;
}

export interface RootCause {
  factor: string;
  explanation: string;
  category: string;
}

export interface SolutionOption {
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  estimatedCost: string;
  riskLevel: string;
  riskMitigation: string;
  suitability: string;
}

export interface ProblemSolverData {
  problemStatement: string;
  rootCauses: RootCause[];
  missingInformation: string[];
  clarifyingQuestions: string[];
  solutions: SolutionOption[];
  actionChecklist: {
    day1Immediate: string[];
    week1FollowUp: string[];
    longTermSafeguard: string[];
  };
  factsVsAssumptions: {
    verifiedFacts: string[];
    assumptionsMade: string[];
    uncertaintyLevel: string;
  };
  recommendedOption: string;
}

export interface ComparisonProduct {
  name: string;
  tier: string;
  approxPrice: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  targetAudience: string;
  verdict: string;
}

export interface MarketResearchData {
  marketOverview: string;
  targetNeed: string;
  comparisonTable: ComparisonProduct[];
  budgetOptions: {
    budgetPick: string;
    valuePick: string;
    premiumPick: string;
  };
  marketTrendsAndOpportunities: string[];
  evidenceBasedRecommendation: string;
  cautions: string;
}

export interface PlanPhaseChecklist {
  task: string;
  owner: string;
  priority: string;
}

export interface PlanPhase {
  phaseName: string;
  duration: string;
  checklist: PlanPhaseChecklist[];
  milestone: string;
}

export interface BudgetEstimateItem {
  item: string;
  estimatedCost: string;
  isFactOrEstimate: string;
  costSavingTip?: string;
}

export interface DecisionMatrixOption {
  optionName: string;
  scores: Record<string, number>;
  totalScore: number;
  notes: string;
}

export interface PlanData {
  planTitle: string;
  objective: string;
  phases: PlanPhase[];
  budgetEstimates: BudgetEstimateItem[];
  decisionMatrix: {
    criteria: string[];
    options: DecisionMatrixOption[];
    recommendation: string;
  };
  epistemicBreakdown: {
    verifiedFacts: string[];
    estimates: string[];
    assumptions: string[];
  };
  immediateNextStep: string;
}

export interface Bookmark {
  id: string;
  type: 'news' | 'medical-update' | 'medical-research' | 'doctors-news' | 'drug-substitute' | 'standard-prescription' | 'problem-solution' | 'market-research' | 'plan';
  title: string;
  snippet: string;
  dateAdded: string;
  data: any;
  sources?: GroundingSource[];
}

export interface DailyPlannerTask {
  id: string;
  title: string;
  timeSlot?: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  category: 'Health' | 'Household' | 'Professional' | 'Errands' | 'Personal';
  completed: boolean;
  dateAssigned: string; // YYYY-MM-DD
  completedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  category: 'Medical' | 'News' | 'Home' | 'General';
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: string;
  query: string;
  preview: string;
}

export interface AppSettings {
  language: Language;
  prioritizeHP: boolean;
  prioritizeRajasthan: boolean;
  customNewsTopics: string[];
  customMedicalTopics: string[];
  trustedSources: string[];
  requireApprovalForExternalActions: boolean;
  enableAudioNarration: boolean;
}

export interface DoctorNotificationItem {
  id: string;
  category: 'NMC' | 'HP_GOVT' | 'NEWSPAPER_CLIPPING' | 'NATIONAL_PG_DOCTOR';
  title: string;
  sourceAuthority: string;
  dateIssued: string;
  officialRefNo?: string;
  targetAudience: 'MBBS Students' | 'PG Doctors / Residents' | 'Faculty & Consultants' | 'All Doctors';
  summary: string;
  keyPoints: string[];
  newspaperDetails?: {
    newspaperName: string;
    edition: string;
    pageNo?: string;
    columnSnippet: string;
    headlineHindi?: string;
  };
  actionRequiredOrImplication?: string;
  verificationStatus: 'Official Gazette / Circular' | 'Verified Newspaper Report' | 'Association Notice';
  sourceLink?: string;
}

export interface DoctorsNewsData {
  lastUpdated: string;
  summaryOverview: string;
  nmcNotifications: DoctorNotificationItem[];
  hpGovtNotifications: DoctorNotificationItem[];
  newspaperClippings: DoctorNotificationItem[];
  nationalDoctorHeadlines: DoctorNotificationItem[];
  disclaimer: string;
}

export interface DrugSubstituteItem {
  id: string;
  brandName: string;
  genericOrBrandType: 'PMBJP Jan Aushadhi' | 'Government Generic' | 'Trade Generic' | 'Branded Generic' | 'Premium Brand';
  manufacturer: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  priceINR: number;
  pricePerUnitINR: number;
  savingsPercentVsTop?: number;
  janAushadhiCode?: string;
  availability: string;
  therapeuticClass: string;
  notesOrPrecautions?: string;
}

export interface DrugSubstituteData {
  searchedSalt: string;
  matchedSaltStandardName: string;
  description: string;
  therapeuticCategory: string;
  commonIndications: string[];
  standardAdultDosage: string;
  clinicalSafetyAlert: string;
  nmcPrescribingGuideline: string;
  substitutes: DrugSubstituteItem[];
  priceRange: {
    lowestPriceINR: number;
    highestPriceINR: number;
    maxSavingsPercent: number;
    cheapestOptionName: string;
    highestOptionName: string;
  };
  janAushadhiAvailabilityNotice: string;
  disclaimer: string;
}

export interface RxMedicationItem {
  id: string;
  drugCategory: string; // e.g. Primary Hypoglycemic, Antihypertensive, Antibiotic, Analgesic
  genericSalt: string;
  brandExamples: string; // Golwala standard brands
  dosageForm: string; // Tab., Cap., Inj., Inhaler, Syrup, Eye Drops
  strength: string;
  frequency: string; // 1-0-1, 1-0-0, 0-0-1, 1-1-1, SOS
  timing: string; // After meals, Before breakfast, Bedtime, SOS
  duration: string;
  instructions: string;
  golwalaNote?: string;
}

export interface StandardPrescription {
  id: string;
  diseaseName: string;
  hindiName?: string;
  category:
    | 'Metabolic & Endocrine'
    | 'Cardiovascular'
    | 'Respiratory'
    | 'Infectious Disease'
    | 'Neurology'
    | 'Nephrology & Urology'
    | 'Musculoskeletal'
    | 'ENT & Ophthalmology'
    | 'Gastroenterology'
    | 'Reproductive & Sexual Health'
    | 'Hematology'
    | string;
  severityLevel:
    | 'Mild'
    | 'Moderate'
    | 'Severe'
    | 'Acute'
    | 'Chronic / Maintenance'
    | 'Standard Protocol'
    | string;
  golwalaReference?: string;
  clinicalOverview: string;
  diagnosticCriteria?: string[];
  symptomsAndComplaints?: string[];
  rxMedications: RxMedicationItem[];
  nonPharmAdvice: string[];
  mandatoryInvestigations: string[];
  redFlagsAndHospitalize: string[];
  clinicalPearls: string[];
  contraindications: string[];
}

export interface StandardPrescriptionData {
  lastUpdated: string;
  sourceTextbook: string;
  prescriptions: StandardPrescription[];
  totalConditionsCount: number;
  disclaimer: string;
}

export interface AdvertisingCampaign {
  id: string;
  badge: string;
  badgeHi: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  actionLabel: string;
  actionLabelHi: string;
  actionUrl: string;
  sponsorName: string;
  isOwnerPromo?: boolean;
  tag?: string;
}

export interface AdvertisingData {
  success: boolean;
  campaigns: AdvertisingCampaign[];
  totalCount: number;
  advertisingPolicy?: string;
}

export interface DiagnosticCheckItem {
  testName: string;
  result: 'PASS' | 'WARN_FALLBACK' | 'FAIL';
  latencyMs: number;
  notes: string;
}

export interface ApiDiagnosticReport {
  status: string;
  edition: string;
  license: string;
  ownerEmail: string;
  distributionModel: string;
  timestamp: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  capabilities: {
    geminiApi: {
      configured: boolean;
      model: string;
      rateLimitCooldownActive: boolean;
      status: string;
    };
    golwalaPrescriber: {
      enabled: boolean;
      textbook: string;
      categoriesCount: number;
      totalStandardDiseases: number;
      letterPadRegistration: string;
      pdfExport: string;
      whatsAppExport: string;
    };
    drugSubstitutes: {
      enabled: boolean;
      genericFormulary: string;
      priceDifferentialAnalysis: boolean;
    };
    medicalCollegesTracker: {
      enabled: boolean;
      targetInstitutes: string[];
    };
    offlineServiceWorker: {
      enabled: boolean;
      pwaCompliant: boolean;
      cacheScope: string;
    };
    advertisingEngine: {
      enabled: boolean;
      activeCampaignsCount: number;
      allowOwnerCustomAds: boolean;
    };
  };
  diagnosticChecks: DiagnosticCheckItem[];
}

export interface FreewareInfo {
  appName: string;
  edition: string;
  isFreeware: boolean;
  commercialUseProhibited: boolean;
  intendedUse: string;
  owner: {
    name: string;
    email: string;
    distributionChannel: string;
  };
  version: string;
  releasedAt: string;
  featuresIncluded: string[];
  urlParametersGuide: Record<string, string>;
}

