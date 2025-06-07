export interface StreamingValidationResult<T> {
  chunk: T;
  index: number;
  isValid: boolean;
  errors: Record<string, string[]>;
  isComplete: boolean;
  totalProcessed: number;
}

export interface StreamingValidationOptions {
  chunkSize?: number;
  maxConcurrent?: number;
  onChunkComplete?: (result: StreamingValidationResult<any>) => void;
  onComplete?: (summary: StreamingValidationSummary) => void;
}

export interface StreamingValidationSummary {
  totalProcessed: number;
  totalValid: number;
  totalInvalid: number;
  totalErrors: number;
  processingTime: number;
  averageTimePerItem: number;
}
