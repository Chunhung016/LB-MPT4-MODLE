export interface FeatureToggle {
  id: string;
  name: string;
  category: 'core' | 'pedagogy' | 'audio' | 'sync' | 'experimental' | 'ai';
  description: string;
  enabled: boolean;
  targetVersion: string;
  logicRule: string;
}

export type SubjectId = 'bm' | 'english' | 'chinese' | 'science' | 'math';

export interface SubjectDefinition {
  id: SubjectId;
  name: string;
  secondaryName?: string;
  colorName: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  shadowColor: string;
  iconName: string;
}

export interface RegisteredModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  registeredAt: number;
  enabled: boolean;
  totalLessons?: number;
}

export interface LogicConfig {
  systemVersion: string;
  updateChannel: 'stable-2026' | 'beta-preview' | 'canary-mpt4';
  autoUpdateFeatures: boolean;
  soundEffects: boolean;
  bubblePhysics: boolean;
  bloomEffects: boolean;
  adaptiveLevel: 'kindergarten' | 'grade-1' | 'grade-2' | 'advanced';
  qrScannerEnabled: boolean;
  modulesButtonEnabled: boolean;
  registeredModules: RegisteredModule[];
  featureToggles: FeatureToggle[];
  customUpdateRules: string;
}

export interface SystemMaintenanceConfig {
  isActive: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  title: string;
  message: string;
  apologyTitle: string;
  apologyNote: string;
  statusNote: string;
  logoUrl?: string;
  updatedAt: string;
  updatedBy?: string;
}
