import { ProcessedData } from "../stores/data";

/**
  * Abstract class for different APIs.
  * Data is stored and accessed directly from the stores, making them pretty much static. Not very ideal.
  */
export abstract class Client {
  private progressListener: ((update: string) => void) | null = null;
  onProgress(listener: (update: string) => void) {
    this.progressListener = listener;
  }
  protected emitProgress(update: string) {
    if (this.progressListener) this.progressListener(update);
  }

  abstract createAuthUrl(handle: string): Promise<string | URL>;
  abstract finalizeAuth(url: Location): Promise<void>;
  abstract logout(): Promise<void>;

  abstract fetchFeed(numberOfPosts: number): Promise<ProcessedData>;
  abstract fetchFollows(): Promise<ProcessedData>;
}
