/**
 * Result for a single chunk/item in a streaming validation process.
 *
 * @typeParam T - The type of the validated chunk/item.
 *
 * @property chunk - The data item that was validated.
 * @property index - The index of the chunk in the stream.
 * @property isValid - Whether the chunk passed validation.
 * @property errors - Validation errors for the chunk, if any.
 * @property isComplete - True if this is the final chunk/result.
 * @property totalProcessed - Total number of items processed so far.
 */
export interface StreamingValidationResult<T> {
  chunk: T;
  index: number;
  isValid: boolean;
  errors: Record<string, string[]>;
  isComplete: boolean;
  totalProcessed: number;
}

/**
 * Options for streaming validation in Validra.
 *
 * @property onChunkComplete - Callback invoked after each chunk is validated.
 * @property onComplete - Callback invoked after the entire stream is validated.
 */
export interface StreamingValidationOptions {
  onChunkComplete?: (result: StreamingValidationResult<any>) => void;
  onComplete?: (summary: StreamingValidationSummary) => void;
}

/**
 * Summary of a streaming validation process.
 *
 * @property totalProcessed - Total number of items processed.
 * @property totalValid - Number of valid items.
 * @property totalInvalid - Number of invalid items.
 * @property totalErrors - Total number of errors found.
 * @property processingTime - Total processing time in milliseconds.
 * @property averageTimePerItem - Average time per item in milliseconds.
 */
export interface StreamingValidationSummary {
  totalProcessed: number;
  totalValid: number;
  totalInvalid: number;
  totalErrors: number;
  processingTime: number;
  averageTimePerItem: number;
}
