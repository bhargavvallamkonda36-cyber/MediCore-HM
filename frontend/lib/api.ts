
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ApiOptions = RequestInit & {
  auth?: boolean;
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("medicore_token")
      : null;

  const requestHeaders = new Headers(headers);

  if (rest.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      cache: "no-store",
    });
  } catch (error) {
    console.error("MediCore API connection error:", error);

    throw new Error(
      `Cannot connect to MediCore API at ${API_URL}. Check whether the backend is running.`,
    );
  }

  const responseText = await response.text();

  let data: unknown = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    const errorData: ApiErrorResponse | null =
      typeof data === "object" && data !== null
        ? (data as ApiErrorResponse)
        : null;

    const errorDetails = {
      url: `${API_URL}${path}`,
      method: rest.method || "GET",
      status: response.status,
      statusText: response.statusText,
      response: data,
    };

    // Use console.log so the details are easy to inspect in DevTools.
    console.log(
      "MediCore API Error Details:",
      JSON.stringify(errorDetails, null, 2),
    );

    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("medicore_token");
      localStorage.removeItem("medicore_user");
    }

    let message: string | undefined;

    if (Array.isArray(errorData?.message)) {
      message = errorData.message.join(", ");
    } else if (typeof errorData?.message === "string") {
      message = errorData.message;
    } else if (typeof errorData?.error === "string") {
      message = errorData.error;
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    if (!message) {
      switch (response.status) {
        case 400:
          message = "Invalid request. Check the submitted form data.";
          break;
        case 401:
          message = "Your session is invalid or expired. Please log in again.";
          break;
        case 403:
          message = "You do not have permission to perform this action.";
          break;
        case 404:
          message = "The requested API endpoint or record was not found.";
          break;
        default:
          message =
            response.status >= 500
              ? "Internal server error. Check the backend terminal."
              : `Request failed with HTTP ${response.status}.`;
      }
    }

    throw new Error(message);
  }

  return data as T;
}

// Save the authenticated session.
export function saveSession(data: {
  accessToken?: string;
  user?: unknown;
}) {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    localStorage.setItem("medicore_token", data.accessToken);
  }

  if (data.user !== undefined) {
    localStorage.setItem("medicore_user", JSON.stringify(data.user));
  }
}

// Clear the session and return to login.
export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("medicore_token");
  localStorage.removeItem("medicore_user");

  window.location.href = "/login";
}

// Retrieve the current user's stored session.
export function getUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;

  try {
    const user = localStorage.getItem("medicore_user");

    return user ? (JSON.parse(user) as T) : null;
  } catch (error) {
    console.error("Failed to read MediCore user session:", error);
    return null;
  }
}
