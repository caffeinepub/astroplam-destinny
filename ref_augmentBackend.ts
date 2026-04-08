// Augments the auto-generated backendInterface and Backend class with internal methods
import type {} from "./backend";

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
