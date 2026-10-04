"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  return { supabase, userId: claims.sub };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    redirect("/login?error=missing-host");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${protocol}://${host}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await getVerifiedUser();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();

  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) {
    redirect("/profile?error=name");
  }

  const avatar = formData.get("avatar");
  let avatarPath: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.has(avatar.type) || avatar.size > MAX_AVATAR_BYTES) {
      redirect("/profile?error=avatar");
    }

    avatarPath = `${userId}/avatar`;
    const bytes = await avatar.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, bytes, {
        contentType: avatar.type,
        upsert: true,
      });

    if (uploadError) {
      redirect("/profile?error=upload");
    }
  }

  const profileUpdate: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_path?: string;
    updated_at: string;
  } = {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    updated_at: new Date().toISOString(),
  };

  if (avatarPath) {
    profileUpdate.avatar_path = avatarPath;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileUpdate, { onConflict: "id" });

  if (profileError) {
    redirect("/profile?error=save");
  }

  revalidatePath("/profile");
  revalidatePath("/vote");
  redirect("/profile?saved=1");
}
