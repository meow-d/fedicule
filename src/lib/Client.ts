import { ProcessedData } from "../stores/data";

export abstract class Client {
  // factory method
  // idk what else to do..
  static async create(handle: string): Promise<Client> {
    throw new Error("Not implemented");
  }

  private progressListener: ((update: string) => void) | null = null;
  onProgress(listener: (update: string) => void) {
    this.progressListener = listener;
  }
  protected emitProgress(update: string) {
    if (this.progressListener) this.progressListener(update);
  }

  abstract fetchFeed(numberOfPosts: number): Promise<ProcessedData>;
  abstract fetchFollows(): Promise<ProcessedData>;
}
