import { ProcessedData } from "../stores/data";

export abstract class Client {
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
