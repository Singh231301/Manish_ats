export class HttpClient {
  static async post<T>(url: string, body: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`[HttpClient] POST ${url} failed:`, error);
      throw error;
    }
  }

  static async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`[HttpClient] GET ${url} failed:`, error);
      throw error;
    }
  }
}
