import type { FirebaseApp } from "./app";

export interface Firestore {
  app: FirebaseApp | null;
}

export const getFirestore = (app?: FirebaseApp): Firestore => ({
  app: app ?? null,
});
