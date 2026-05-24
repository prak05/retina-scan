export interface FindingDetails {
  riskLevel: 'Low' | 'Moderate' | 'High';
  confidence: number; // 0 - 100
  microvascularIndicators?: string[]; // Used for diabetes
  vascularIndicators?: string[]; // Used for hypertension
  neurotechIndicators?: string[]; // Used for alzheimers
  clinicalBreakdown: string;
}

export interface AnatomicalObservations {
  opticDisc: string;
  macula: string;
  vascularArcades: string;
}

export interface EyeScanReport {
  overallStatus: string; // e.g., "Normal Ocular Profile", "Action Required - Microvascular Tortuosity", etc.
  vitalScore: number; // 0 - 100
  findings: {
    diabetes: FindingDetails;
    hypertension: FindingDetails;
    alzheimers: FindingDetails;
  };
  educationalAdvice: string[];
  anatomicalObservations: AnatomicalObservations;
  metadata?: {
    isSimulated: boolean;
    scanTimestamp: string;
    modelUsed: string;
    errorOccurred?: boolean;
    errorMessage?: string;
  };
}

export interface PresetSample {
  id: string;
  name: string;
  description: string;
  type: 'retina' | 'external';
  imageUrl: string;
  clinicalLabel: string;
}
