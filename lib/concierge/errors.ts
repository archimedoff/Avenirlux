export type OpenAiFailureCode =
  | "quota_exceeded"
  | "rate_limited"
  | "auth"
  | "network"
  | "server"
  | "unknown";

export class ConciergeProviderError extends Error {
  readonly code: OpenAiFailureCode;

  constructor(code: OpenAiFailureCode, message?: string) {
    super(message ?? code);
    this.name = "ConciergeProviderError";
    this.code = code;
  }
}

type OpenAiErrorBody = {
  error?: { code?: string; type?: string; message?: string };
};

export function classifyOpenAiHttpFailure(status: number, bodyText?: string): OpenAiFailureCode {
  let parsed: OpenAiErrorBody | undefined;
  if (bodyText) {
    try {
      parsed = JSON.parse(bodyText) as OpenAiErrorBody;
    } catch {
      parsed = undefined;
    }
  }

  const apiCode = parsed?.error?.code?.toLowerCase() ?? "";
  const apiType = parsed?.error?.type?.toLowerCase() ?? "";

  if (
    status === 429 ||
    apiCode.includes("rate_limit") ||
    apiCode.includes("insufficient_quota") ||
    apiType === "insufficient_quota"
  ) {
    return apiCode.includes("insufficient") || apiType === "insufficient_quota"
      ? "quota_exceeded"
      : "rate_limited";
  }
  if (status === 401 || status === 403 || apiCode.includes("invalid_api_key")) return "auth";
  if (status >= 500) return "server";
  if (status >= 400) return "unknown";
  return "unknown";
}

export function isOpenAiFailureRecoverable(code: OpenAiFailureCode): boolean {
  return code !== "auth";
}
