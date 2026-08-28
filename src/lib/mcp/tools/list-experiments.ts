import { defineTool } from "@lovable.dev/mcp-js";
import { listExperiments } from "@/lib/mock-data";

export default defineTool({
  name: "list_experiments",
  title: "List experiments",
  description:
    "List all synthetic UX pre-testing experiments with status, stage, simulation size and variant count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const rows = listExperiments().map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      stage: e.stage,
      simulationSize: e.simulationSize,
      owner: e.owner,
      updatedAt: e.updatedAt,
      variants: e.variants.length,
      winnerVariantId: e.results?.winnerVariantId ?? null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { experiments: rows },
    };
  },
});
