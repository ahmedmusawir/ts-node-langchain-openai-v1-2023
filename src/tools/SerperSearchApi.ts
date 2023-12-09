import axios, { AxiosInstance } from "axios";

class SerperSearchApi {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: "https://google.serper.dev",
      headers: {
        "X-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async search(query: string, engine: string = "google") {
    try {
      const response = await this.axiosInstance.post("/search", {
        q: query,
        engine: engine,
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export default SerperSearchApi;
