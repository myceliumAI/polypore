import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

type ApiErrorData = { detail?: string; code?: string; message?: string };

function hasMessage(e: unknown): e is { message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in (e as Record<string, unknown>) &&
    typeof (e as Record<string, unknown>).message === "string"
  );
}

function isApiErrorData(d: unknown): d is ApiErrorData {
  if (typeof d !== "object" || d === null) return false;
  const rec = d as Record<string, unknown>;
  const hasDetail =
    "detail" in rec &&
    (typeof rec.detail === "string" || typeof rec.detail === "undefined");
  const hasMessage =
    "message" in rec &&
    (typeof rec.message === "string" || typeof rec.message === "undefined");
  const hasCode =
    "code" in rec &&
    (typeof rec.code === "string" || typeof rec.code === "undefined");
  return hasDetail || hasMessage || hasCode;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (isApiErrorData(data)) {
      const base = data.detail ?? data.message ?? err.message;
      return data.code ? `${base} (${data.code})` : base;
    }
    return err.message;
  }
  if (hasMessage(err)) return err.message;
  return "Unexpected error";
}
