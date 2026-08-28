import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getExperiment } from "@/lib/mock-data";

export default defineTool({
  name: "get_experiment",
  title: "Get experiment",
  description:
    "Get the full detail of one experiment: persona, task, variants, metrics, usability issues and behavioural segments.",
  inputSchema: {
    experiment_id: z.string().describe("The experiment id, e.g. from list_experiments."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ experiment_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const experiment = getExperiment(experiment_id);
    if (!experiment) throw new ToolError(`No experiment found with id "${experiment_id}".`);
    return {
      content: [{ type: "text", text: JSON.stringify(experiment, null, 2) }],
      structuredContent: { experiment },
    };
  },
});
