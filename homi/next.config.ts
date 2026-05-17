import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // agentmail dynamically `import("@x402/fetch")` inside its Client wrapper.
  // We never exercise that branch (no x402 option), but Turbopack still tries
  // to resolve it at build time. Treat the SDK as a Node external so the
  // import stays a runtime concern.
  serverExternalPackages: ["agentmail"],
  turbopack: {
    ignoreIssue: [
      { path: "**/agentmail/**" },
    ],
  },
};

export default nextConfig;
