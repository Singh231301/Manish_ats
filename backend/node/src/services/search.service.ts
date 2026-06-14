import { VectorRepository } from "../repositories/vector.repository.js";
import type { SemanticSearchInput } from "../schemas/search.schema.js";

export class SearchService {
  constructor(private readonly vectors = new VectorRepository()) {}

  async semanticSearch(input: SemanticSearchInput) {
    console.log(`[search:semantic] limit=${input.limit}`);
    return this.vectors.search(input);
  }
}
