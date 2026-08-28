export type ModuleId = 'module1' | 'module2' | 'module3' | 'module4';

export interface ModuleMeta {
  id: ModuleId;
  promptNum: number;
  title: string;
  subTitle: string;
  sourceExam: string;
  iconName: string;
  badge: string;
  points: number;
}

// Module 1: 太阳系竞速赛
export interface PlanetData {
  id: 'P' | 'Q' | 'R' | 'S';
  nameZh: string;
  nameEn: string;
  distanceMillionKm: number;
  color: string;
  accentColor: string;
  radius: number;
  orbitIndex: number; // 0: P(58M), 1: R(150M), 2: Q(778M), 3: S(4495M)
  realPlanet: string;
}

export interface RevolutionRow {
  planet: 'X' | 'Y' | 'Z';
  distance: number;
  time: string;
  relatedOptionId?: string;
}

// Module 2: 光合作用
export interface GasBubble {
  id: 'co2' | 'o2';
  formula: string;
  name: string;
  color: string;
  glowColor: string;
}

// Module 3: 植物繁衍
export interface PlantReproductionItem {
  id: string;
  name: string;
  nameEn: string;
  methodId: string;
  iconEmoji: string;
  hint: string;
}

export interface ReproductionMethod {
  id: string;
  name: string;
  desc: string;
}

export interface PlantItem {
  id: string;
  name: string;
  methodId: string;
  correctMethod: string;
  color: string;
  desc: string;
}

export interface TargetMethod {
  id: string;
  name: string;
  desc: string;
  color: string;
}

// Module 4: 石蕊试纸
export interface BeakerData {
  id: string;
  name: string;
  nameEn: string;
  type: 'acid' | 'neutral' | 'alkali';
  liquidColor: string;
  redTestResult: 'red' | 'blue';
  blueTestResult: 'red' | 'blue';
  isRedTested: boolean;
  isBlueTested: boolean;
}

export interface SubstanceBeaker {
  id: string;
  name: string;
  color: string;
  liquidClass: string;
  type: 'acid' | 'neutral' | 'alkali';
  testedRedTo: 'red' | 'blue';
  testedBlueTo: 'red' | 'blue';
}

// Module 5: 营养扫描仪
export interface MealPlateData {
  id: string;
  title: string;
  contents: string[];
  balanced: boolean;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  vitamins: number;
  explanation: string;
}

export interface MealPlate extends MealPlateData {}
