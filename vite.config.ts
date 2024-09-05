import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/zxing-wasm/dist/reader/zxing_reader.wasm",
          dest: "./wasm/reader",
        },
      ],
    }),
  ],
});
