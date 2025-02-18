import { fileURLToPath, URL } from "node:url";

import { ConfigEnv, defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";

export default defineConfig((viteConfig: ConfigEnv) => {
  const env = loadEnv(viteConfig.mode, process.cwd(), "");

  return {
    plugins: [vue(), VueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "~": fileURLToPath(new URL("./public", import.meta.url)),
        "@types": fileURLToPath(new URL("../packages/types", import.meta.url)),
      },
    },
    publicDir: "./public",
    build: {
      sourcemap: process.env.NODE_ENV === "development",
      outDir: "./dist",
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: (assetInfo: { name: string }) => {
            if (
              assetInfo.name &&
              /\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)
            ) {
              return "assets/[name][extname]";
            }
            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: env.VITE_UI_PORT,
      proxy: {
        "/api": {
          target: env.VITE_NODE_SERVER,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
          secure: env.VITE_IS_SSL,
        },
      },
    },
  };
});
