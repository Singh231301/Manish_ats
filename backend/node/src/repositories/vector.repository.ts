import { pool } from "../db/pool.js";
import { createLocalEmbedding, toPgVector } from "../utils/embedding.js";

export interface SemanticSearchRow {
  id: string;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export class VectorRepository {
  async store(input: {
    sourceType: "resume" | "job_description";
    sourceId: string;
    userId?: string;
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!pool) return;

    try {
      const rawVector = await createLocalEmbedding(input.content);
      const embedding = toPgVector(rawVector);
      await pool.query(
        `insert into document_embeddings (source_type, source_id, user_id, content, embedding, metadata)
         values ($1, $2, $3, $4, $5::vector, $6)`,
        [
          input.sourceType,
          input.sourceId,
          input.userId ?? null,
          input.content,
          embedding,
          JSON.stringify(input.metadata ?? {}),
        ],
      );
      console.log(`[vector:store] ${input.sourceType} ${input.sourceId}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown vector insert error";
      console.warn(`[vector:store:skip] ${reason}`);
    }
  }

  async search(input: { query: string; userId?: string; limit: number }): Promise<SemanticSearchRow[]> {
    if (!pool) return [];

    const rawVector = await createLocalEmbedding(input.query);
    const embedding = toPgVector(rawVector);
    const result = await pool.query<{
      id: string;
      source_type: string;
      source_id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }>(
      `select
          id,
          source_type,
          source_id,
          content,
          metadata,
          1 - (embedding <=> $1::vector) as similarity
       from document_embeddings
       where ($2::uuid is null or user_id = $2::uuid)
       order by embedding <=> $1::vector
       limit $3`,
      [embedding, input.userId ?? null, input.limit],
    );

    console.log(`[vector:search] query="${input.query}" results=${result.rowCount}`);

    return result.rows.map((row) => ({
      id: row.id,
      sourceType: row.source_type,
      sourceId: row.source_id,
      content: row.content,
      metadata: row.metadata,
      similarity: Number(row.similarity),
    }));
  }
}
