"use server";

import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/arena";
import type { ActionResult } from "@/lib/types";
import { resolveCaptionInput } from "@/lib/caption-input";
import { hasAiAuthentication } from "@/lib/ai-auth";
import { captionModel } from "@/lib/ai-provider";

async function arenaUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("first_name, last_name").eq("id", data.user.id).maybeSingle();
  if (profileError || !profile?.first_name || !profile?.last_name) return null;
  return { supabase, userId: data.user.id };
}

export async function rateCaption(captionId: number, value: number): Promise<ActionResult> {
  const member = await arenaUser();
  if (!member) return { error: "Sign in and complete your profile to vote." };
  if (!Number.isSafeInteger(captionId) || captionId <= 0 || ![-1, 0, 1].includes(value)) return { error: "Choose a valid caption and vote." };
  const { supabase, userId } = member;
  if (value === 0) {
    const { error } = await supabase.from("votes").delete().eq("caption_id", captionId).eq("user_id", userId);
    if (error) return { error: "Your vote could not be removed. Try again." };
  } else {
    const { error } = await supabase.from("votes").insert({ caption_id: captionId, value });
    if (error?.code === "23505") {
      const result = await supabase.from("votes").update({ value }).eq("caption_id", captionId).eq("user_id", userId);
      if (result.error) return { error: "Your vote could not be changed. Try again." };
    } else if (error) return { error: "Your vote could not be saved. Try again." };
  }
  revalidatePath("/");
  revalidatePath("/vote");
  return { success: value === 0 ? "Vote removed." : "Vote saved." };
}

type ResponseLog = { status: "success" | "rejected" | "error"; caption_id?: number; response_text?: string; finish_reason?: string; input_tokens?: number; output_tokens?: number; latency_ms: number; error_status?: number };

// Observability for the admin panel. Logging must never block or fail a member's generation.
async function logResponse(supabase: Awaited<ReturnType<typeof createClient>>, requestId: string, model: string, tone: string, entry: ResponseLog) {
  const { error } = await supabase.from("llm_responses").insert({ generation_request_id: requestId, model, tone, ...entry, response_text: entry.response_text?.slice(0, 4000) });
  if (error) console.error("LLM response log failed", { code: error.code });
}

export async function generateCaption(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  const member = await arenaUser();
  if (!member) return { error: "Sign in and complete your profile to generate captions." };
  const resolved=resolveCaptionInput({imagePath:String(formData.get("image_path")??""),topicId:String(formData.get("topic_id")??""),scene:String(formData.get("scene")??""),tone:String(formData.get("tone")??"")});
  if("error" in resolved)return {error:resolved.error};
  const {picture,topic,scene,tone}=resolved;
  if (!hasAiAuthentication()) return { error: "AI generation is not connected yet. Please contact the site owner." };
  const configuredModel = captionModel();
  const model = configuredModel.storedModel;
  const prompt = buildPrompt(scene, tone, topic);
  const { supabase } = member;
  // The DB serializes reservations and enforces each account's trusted allowance.
  const { data: request, error: reservationError } = await supabase.from("generation_requests")
    .insert({ prompt, model }).select("id").single();
  // Refresh the remaining allowance even if the provider fails or another tab used it.
  revalidatePath("/create");
  if (reservationError || !request) return { error: reservationError?.message.includes("generation_limit")
    ? "You have used your 10 generation attempts for the last 24 hours. You can generate again as those attempts expire."
    : "Generation could not be started. Please try again." };
  let caption: string;
  let usage: Pick<ResponseLog, "finish_reason" | "input_tokens" | "output_tokens" | "latency_ms">;
  const started = Date.now();
  try {
    const result = await generateText({ model: configuredModel.model, prompt, reasoning: "low", maxOutputTokens: 512, maxRetries: 0, timeout: 25_000 });
    caption = result.text.trim().replace(/^["“]|["”]$/g, "");
    usage = { finish_reason: result.finishReason, input_tokens: result.usage.inputTokens, output_tokens: result.usage.outputTokens, latency_ms: Date.now() - started };
    if (!caption || caption.length > 500 || result.finishReason === "length") {
      await logResponse(supabase, request.id, model, tone, { status: "rejected", response_text: result.text, ...usage });
      return { error: "The AI did not return a usable caption. Try a different scene." };
    }
  } catch (error) {
    // Provider errors can contain request details; never return them to the client.
    const status = typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode : null;
    console.error("Caption generation failed", { status });
    await logResponse(supabase, request.id, model, tone, { status: "error", latency_ms: Date.now() - started, error_status: status !== null && status >= 100 && status <= 599 ? status : undefined });
    if (status === 401) return { error: "The AI connection could not authenticate. Please contact the site owner. This attempt counts toward your daily limit." };
    if (status === 402 || status === 403) return { error: "AI generation is not available for this site yet. The site owner needs to check the provider access and allowance. This attempt counts toward your daily limit." };
    if (status === 429) return { error: "The AI provider is busy. Please try again later. This attempt counts toward your daily limit." };
    return { error: "The AI provider is unavailable or its allowance is exhausted. Try again later. This attempt counts toward your daily limit." };
  }
  const { data, error } = await supabase.from("captions").insert({ caption_text: caption, image_description: scene, image_path: picture.path, prompt, model, tone, generation_id: request.id }).select("id").single();
  // 23514: the database has not been migrated to accept this picture yet.
  if (error?.code === "23514") return { error: "This picture isn’t enabled in the archive yet. Pick a different picture." };
  await logResponse(supabase, request.id, model, tone, { status: error || !data ? "rejected" : "success", caption_id: data?.id, response_text: caption, ...usage });
  if (error || !data) return { error: "The caption was generated but could not be saved. Please try again." };
  revalidatePath("/"); revalidatePath("/vote"); revalidatePath("/create");
  return { success: "Caption published to the arena.", captionId: data.id, caption, imagePath: picture.path, tone };
}
