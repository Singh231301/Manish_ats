import { env } from "../config/env.js";

export async function createLocalEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${env.aiServiceUrl}/embed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Embedding service failed: ${response.status}`);
    }
    
    const data = await response.json() as { embeddings: number[][] };
    return data.embeddings[0] ?? new Array(768).fill(0);
  } catch (error) {
    console.error("[embedding] Failed to get real embedding, returning zeros.", error);
    return new Array(768).fill(0);
  }
}

export function toPgVector(vector: number[]) {
  return `[${vector.join(",")}]`;
}
