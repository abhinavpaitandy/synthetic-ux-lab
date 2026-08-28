import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getExperiment, METRIC_DEFS } from "@/lib/mock-data";

export default defineTool({
  name: "compare_variants",
  title: "Compare variants",
  description:
    "Compare the simulated metrics of every variant in an experiment, with the recommended winner and rationale.",
  inputSchema: {
    experiment_id: z.string().describe("The experiment id to compare variants for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ experiment_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const experiment = getExperiment(experiment_id);
    if (!experiment) throw new ToolError(`No experiment found with id "${experiment_id}".`);
    if (!experiment.results) {
      throw new ToolError(
        `Experiment "${experiment.name}" has no simulation results yet (status: ${experiment.status}).`,
      );
    }
    const comparison = {
      experiment: experiment.name,
      task: experiment.task,
      simulationSize: experiment.simulationSize,
      metrics: METRIC_DEFS,
      variants: experiment.variants.map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description,
        metrics: v.metrics ?? null,
      })),
      winnerVariantId: experiment.results.winnerVariantId,
      confidence: experiment.results.confidence,
      rationale: experiment.results.rationale,
      recommendation: experiment.results.recommendation,
      caveat:
        "Synthetic pre-testing signals directional differences only; validate with real users before shipping.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }],
      structuredContent: comparison,
    };
  },
});
