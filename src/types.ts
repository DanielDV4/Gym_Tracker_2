export type ExerciseCategory = 'COMPOUND' | 'ISOLATION' | 'BODYWEIGHT';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  baseIncrement: number;
  maxWeightCapacity: number;
  sets: number;
  targetReps: number;
  mechanic?: string;
  equipment?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  actualWeight: number;
  actualReps: number;
  isCompleted: boolean;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  date: string;
  sets: WorkoutSet[];
}

export enum BannerType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export interface EngineResult {
  nextTargetWeight: number;
  nextTargetReps: number;
  isProgression: boolean;
  isDeload: boolean;
  message: string;
  bannerType: BannerType;
}
