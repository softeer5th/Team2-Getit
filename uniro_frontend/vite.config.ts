import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import compression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		svgr(),
		compression({
			algorithm: "brotliCompress",
			ext: ".br",
			threshold: 1024,
			deleteOriginFile: false,
		}),
		compression({
			algorithm: "gzip",
			ext: ".gz",
		}),
	],
});
