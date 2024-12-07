export type Answer = 'YES' | 'NO' | 'NOT_SURE';

export type AnalysisResponse = {
  lastWatchedPoint: {
    season?: number;
    episode?: number;
    description: string;
  };
  confidence: number;
  followUpQuestions?: string[];
};

export type QuestionState = {
  question: string;
  answer: Answer | null;
  additionalInfo?: string;
};

export type AnalyzeState = {
  show: string;
  questions: QuestionState[];
  currentQuestionIndex: number;
  isAnalyzing: boolean;
  result: AnalysisResponse | null;
  error: string | null;
}; 