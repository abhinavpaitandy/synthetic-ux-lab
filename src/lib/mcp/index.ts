import { auth, defineMcp } from "@lovable.dev/mcp-js";

import compareVariantsTool from "./tools/compare-variants";
import getExperimentTool from "./tools/get-experiment";
import listExperimentsTool from "./tools/list-experiments";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "synthetic-ux-lab",
  title: "Synthetic UX Lab",
  version: "0.1.0",
  instructions:
    "Tools for Synthetic UX Lab, an internal synthetic UX pre-testing workspace. Use `list_experiments` to browse experiments, `get_experiment` for full detail, and `compare_variants` to compare simulated variant metrics. Results come from AI-generated synthetic user simulations and supplement, not replace, real user research.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listExperimentsTool, getExperimentTool, compareVariantsTool] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
