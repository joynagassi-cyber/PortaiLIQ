import { routeAIRequest, checkCompleteness, summarizePortal, verifyFileMatch } from "@/lib/ai-router";
import { db } from "@/db";
import { aiCallLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const { taskType, portalId, question, answer, items, requestDescription, fileName, fileType } = body;

  let result;

  switch (taskType) {
    case "completeness_check":
      result = await checkCompleteness(question || "", answer || "");
      break;
    case "summary":
      result = await summarizePortal(items?.[0]?.label || "Portal", items || []);
      break;
    case "file_verification":
      result = await verifyFileMatch(
        requestDescription || "",
        fileName || "",
        fileType || ""
      );
      break;
    default:
      return new Response("Invalid task type", { status: 400 });
  }

  // Log the AI call
  if ("text" in result) {
    await db.insert(aiCallLogs).values({
      portalId,
      taskType,
      providerAttempted: result.provider,
      providerSuccess: result.provider,
      status: "success",
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      durationMs: result.durationMs,
    });
    return new Response(JSON.stringify({ success: true, ...result }), { status: 200 });
  } else {
    // All providers failed
    for (const err of result) {
      await db.insert(aiCallLogs).values({
        portalId,
        taskType,
        providerAttempted: err.provider,
        status: "failed",
        errorMessage: err.error,
      });
    }
    return new Response(
      JSON.stringify({ success: false, error: "All AI providers unavailable" }),
      { status: 503 }
    );
  }
}
