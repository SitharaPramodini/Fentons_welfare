/**
 * Thin client for the Welfare Society API (see backend/).
 *
 * In development `/api` is proxied to the Node server by vite.config.js, so
 * no base URL is needed. For a deployed build where the API lives on another
 * host, set VITE_API_URL in a .env file at the project root:
 *
 *   VITE_API_URL=https://welfare.example.lk/api
 */

const BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

/**
 * Thrown for any non-2xx response. `fieldErrors` carries the backend's
 * `{ field: message }` map so a form can show each message under its input.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, { method = "GET", body, form, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      /* FormData sets its own Content-Type, including the multipart boundary.
       * Setting the header by hand would drop the boundary and the body
       * would arrive unparseable. */
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: form ?? (body ? JSON.stringify(body) : undefined),
      /* The session is an httpOnly cookie, so it has to be sent explicitly. */
      credentials: "include",
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError(
      "Could not reach the Society's server. Please check your connection and try again.",
    );
  }

  /* An HTML error page from a proxy or a 502 would not parse as JSON. */
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Request failed (${response.status}).`, {
      status: response.status,
      fieldErrors: payload?.errors ?? null,
    });
  }

  return payload;
}

export const api = {
  health: () => request("/health"),
  options: () => request("/meta/options"),
  /** The exact wording of each consent, as the server will record it. */
  consentWording: () => request("/meta/consents"),

  /* --- Sign-in --- */
  login: (hris, password) => request("/auth/login", { method: "POST", body: { hris, password } }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  myHistory: () => request("/auth/me/history"),
  changePassword: (data) => request("/auth/change-password", { method: "POST", body: data }),

  /* --- The Society's office (administrators only) --- */
  pendingApplications: () => request("/admin/pending"),
  consentRecords: (params = "") => request(`/admin/consents${params}`),
  consentRecord: (id) => request(`/admin/consents/${id}`),
  auditTrail: (params = "") => request(`/admin/audit${params}`),
  approveLoan: (id, body = {}) => request(`/admin/loans/${id}/approve`, { method: "PATCH", body }),
  declineLoan: (id, body = {}) => request(`/admin/loans/${id}/decline`, { method: "PATCH", body }),

  /* Deciding from a link in the notification e-mail. The token is the
   * authorisation, so these need no session. */
  describeDecision: (token) => request(`/admin/decision/${encodeURIComponent(token)}`),
  applyDecision: (token, body = {}) =>
    request(`/admin/decision/${encodeURIComponent(token)}`, { method: "POST", body }),

  /** The printable loan application. Returns a Blob. */
  async loanPdf(id) {
    const response = await fetch(`${BASE}/loans/${id}/pdf`, { credentials: "include" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(payload?.message ?? "The application could not be downloaded.", {
        status: response.status,
      });
    }
    return response.blob();
  },

  /* --- The Constitution (signed-in only) --- */
  constitutionStatus: () => request("/documents/constitution/status"),

  /** The PDF itself. Returns a Blob, so it bypasses the JSON helper. */
  async constitutionFile() {
    const response = await fetch(`${BASE}/documents/constitution`, {
      credentials: "include",
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(payload?.message ?? "The Constitution could not be opened.", {
        status: response.status,
      });
    }
    return response.blob();
  },

  /** How to reach the office bearers. Signed-in members only. */
  societyContacts: () => request("/society/contacts"),

  /* --- Eligible employees (signed-in only) --- */
  employees: (params = "", signal) => request(`/employees${params}`, { signal }),
  employeeCompanies: () => request("/employees/companies"),
  prefill: () => request("/employees/prefill"),

  /* --- Membership --- */
  /**
   * Submits a membership application with its certificates.
   *
   * Multipart, because it carries files. Everything except the files goes in
   * one JSON field so the nested family block survives intact - the server
   * parses it back and validates it exactly as it would a JSON body.
   */
  async registerMember(data, files = {}) {
    const form = new FormData();
    form.append("payload", JSON.stringify(data));
    for (const [field, file] of Object.entries(files)) {
      if (file) form.append(field, file, file.name);
    }
    return request("/members", { method: "POST", form });
  },
  declineMembership: (data) => request("/members/decline", { method: "POST", body: data }),
  listMembers: (params = "") => request(`/members${params}`),
  getMember: (id) => request(`/members/${id}`),
  updateMember: (id, data) => request(`/members/${id}`, { method: "PUT", body: data }),
  setMemberStatus: (id, data) => request(`/members/${id}/status`, { method: "PATCH", body: data }),
  deleteMember: (id) => request(`/members/${id}`, { method: "DELETE" }),
  memberStats: () => request("/members/stats"),

  /** Used by the loan form to pre-fill an approved member's details. */
  lookupMemberByEpf: (epf, signal) =>
    request(`/members/lookup/${encodeURIComponent(epf)}`, { signal }),

  /* --- Loans --- */
  applyForLoan: (data) => request("/loans", { method: "POST", body: data }),
  listLoans: (params = "") => request(`/loans${params}`),
  getLoan: (id) => request(`/loans/${id}`),
  updateLoan: (id, data) => request(`/loans/${id}`, { method: "PUT", body: data }),
  decideLoan: (id, data) => request(`/loans/${id}/decision`, { method: "PATCH", body: data }),
  releaseLoan: (id, data) => request(`/loans/${id}/release`, { method: "PATCH", body: data }),
  settleLoan: (id) => request(`/loans/${id}/settle`, { method: "PATCH", body: {} }),
  deleteLoan: (id) => request(`/loans/${id}`, { method: "DELETE" }),
  loanStats: () => request("/loans/stats"),
};

export default api;
