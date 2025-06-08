/**
 * Schema describing a helper resolver in Validra.
 *
 * Contains the resolver function, whether it is asynchronous, and the names of accepted parameters.
 */
export interface HelperResolverSchema {
  /** The function that performs the helper's logic. */
  resolver: Function;
  /** Whether the helper is asynchronous. */
  async: boolean;
  /** The names of parameters accepted by the helper. */
  params: readonly string[];
}

/**
 * Metadata schema for a helper in Validra.
 *
 * Describes the name, description, example usage, and category of a helper.
 */
export interface HelperSchema {
  /** The unique name of the helper. */
  name: string;
  /** A human-readable description of the helper's purpose. */
  description: string;
  /** Example usage of the helper. */
  example: string;
  /** The category this helper belongs to (e.g., 'string', 'date'). */
  category: string;
}
