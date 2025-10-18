import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-firebase-hooks/auth": path.resolve(
        __dirname,
        "./src/lib/react-firebase-hooks/auth.ts",
      ),
      "firebase/app": path.resolve(__dirname, "./src/lib/firebase/app.ts"),
      "firebase/auth": path.resolve(__dirname, "./src/lib/firebase/auth.ts"),
      "firebase/firestore": path.resolve(
        __dirname,
        "./src/lib/firebase/firestore.ts",
      ),
    },
  },
}));
