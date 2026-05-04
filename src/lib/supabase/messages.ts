import type { SupabaseClient } from "@supabase/supabase-js";

export type ConversationSummaryRecord = {
  id: string;
  rideId: string | null;
  counterpartId: string | null;
  counterpartName: string;
  counterpartAvatarUrl: string;
  route: string;
  role: "driver" | "passenger";
  lastMessage: string;
  lastMessageAt: string | null;
  createdAt: string;
};

export type ConversationMessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type ConversationSummaryRow = {
  id: string;
  ride_id: string | null;
  counterpart_id: string | null;
  counterpart_name: string | null;
  counterpart_avatar_url: string | null;
  route: string | null;
  role: "driver" | "passenger" | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
};

type ConversationMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  created_at: string;
};

function mapConversationSummary(row: ConversationSummaryRow): ConversationSummaryRecord {
  return {
    id: row.id,
    rideId: row.ride_id,
    counterpartId: row.counterpart_id,
    counterpartName: row.counterpart_name?.trim() || "Usuario",
    counterpartAvatarUrl: row.counterpart_avatar_url ?? "",
    route: row.route?.trim() || "-",
    role: row.role === "driver" ? "driver" : "passenger",
    lastMessage: row.last_message?.trim() || "",
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
  };
}

function mapConversationMessage(row: ConversationMessageRow): ConversationMessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name?.trim() || "Usuario",
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchMyConversations(client: SupabaseClient): Promise<ConversationSummaryRecord[]> {
  const { data, error } = await client.rpc("get_my_conversations");

  if (error) {
    throw error;
  }

  return ((data ?? []) as ConversationSummaryRow[]).map((row) => mapConversationSummary(row));
}

export async function fetchConversationMessages(client: SupabaseClient, conversationId: string): Promise<ConversationMessageRecord[]> {
  const { data, error } = await client.rpc("get_conversation_messages", {
    target_conversation_id: conversationId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ConversationMessageRow[]).map((row) => mapConversationMessage(row));
}

export async function ensureConversationForBooking(
  client: SupabaseClient,
  rideId: string,
  targetProfileId: string,
): Promise<string> {
  const { data, error } = await client.rpc("ensure_conversation_for_booking", {
    target_ride_id: rideId,
    target_profile_id: targetProfileId,
  });

  if (error) {
    throw error;
  }

  if (typeof data !== "string" || !data) {
    throw new Error("Conversation could not be created.");
  }

  return data;
}

export async function sendConversationMessage(client: SupabaseClient, conversationId: string, body: string): Promise<string> {
  const { data, error } = await client.rpc("send_message", {
    target_conversation_id: conversationId,
    message_body: body,
  });

  if (error) {
    throw error;
  }

  if (typeof data !== "string" || !data) {
    throw new Error("Message could not be sent.");
  }

  return data;
}