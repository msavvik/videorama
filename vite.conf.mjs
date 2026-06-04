import { defineConfig } from "vite";
import path from "node:path";

const _projectRoot = process.env.INIT_CWD;
const _cacheDir = path.join(_projectRoot, ".local", "vite_cache", path.basename(_projectRoot));
const _srcDir = path.join(_projectRoot, "src");
const _publicDir = path.join(_projectRoot, "public");

export default defineConfig({
  server: {
    host: "0.0.0.0",
    strictPort: true,
    port: 8081,
    fs: {
      strict: false,
    }
  },

  optimizeDeps: {
    // Exclude onnxruntime-web from optimisations.
    // *.wasm files in onnxruntime-web package become unresolvable in dev server (http 404).
    // Works for onnxruntime-web <= 1.18.0. Breaks for onnxruntime-web <= 1.21.1.
    // Higher onnx version not tested.
    exclude: [
      "onnxruntime-web/wasm",
      "onnxruntime-web/webgl",
      "onnxruntime-web/webgpu",
      "onnxruntime-web/all",
      "onnxruntime-web/training",
      "onnxruntime-web",
    ],
  },

  appType: "mpa",
  root: _srcDir,

  publicDir: _publicDir,
  cacheDir: _cacheDir,

  build: {
    copyPublicDir: true,
    minify: false,
    emptyOutDir: true,
  },

  plugins: [
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");

            if (req.url.endsWith(".onnx")) {
              res.setHeader("Content-Type", "application/octet-stream");
            } else if (req.url.endsWith(".wasm")) {
              res.setHeader("Content-Type", "application/wasm");
            } else if (req.url.endsWith(".json")) {
              res.setHeader("Content-Type", "application/json");
            }
          }

          next();
        });
      },
    },
  ],
});
