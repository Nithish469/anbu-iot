import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "trains-builds-dice-calculator.trycloudflare.com",
      "discretion-belly-verse-sale.trycloudflare.com",
      "adelaide-roots-ensures-larger.trycloudflare.com",
      "animals-burn-questions-candidate.trycloudflare.com",
      "contamination-gbp-proceedings-extraordinary.trycloudflare.com",
      "amsterdam-advisory-outdoors-gibraltar.trycloudflare.com",
      "encryption-composite-inner-informative.trycloudflare.com",
      "actively-efficient-teaching-academics.trycloudflare.com",
    ],
  },
});