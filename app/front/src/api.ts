import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

type ApiErrorData = { detail?: string; message?: string };

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
  return hasDetail || hasMessage;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (isApiErrorData(data)) {
      return data.detail ?? data.message ?? err.message;
    }
    return err.message;
  }
  if (hasMessage(err)) return err.message;
  return "Unexpected error";
}
