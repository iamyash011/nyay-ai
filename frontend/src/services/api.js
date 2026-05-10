const BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/_/backend/api/v1" : "http://127.0.0.1:8000/api/v1");

async function apiFetch(path, body, method = "POST") {
  const token = localStorage.getItem("token");
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Something went wrong. Please try again.");
  }
  return res.json();
}

export const api = {
  classify: (userInput) => apiFetch("/classify/", { user_input: userInput }),
  getQuestions: (caseId, num = 5) =>
    apiFetch("/questions/", { case_id: caseId, num_questions: num }),
  pollTask: async (taskId, interval = 2000, maxRetries = 60) => {
    for (let i = 0; i < maxRetries; i++) {
      const res = await apiFetch(`/tasks/${taskId}/`, undefined, "GET");
      if (res.status === "SUCCESS") {
        return res.result;
      }
      if (res.status === "FAILURE" || res.result?.error) {
        throw new Error(res.result?.error || "Task failed on backend.");
      }
      // Task is PENDING or STARTED, wait and try again
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error("Task polling timed out. It might still be processing.");
  },

  generateDocument: async (caseId, docType, answers) => {
    const res = await apiFetch("/generate-document/", {
      case_id: caseId,
      document_type: docType,
      user_responses: answers,
    });
    if (res.task_id) {
      return api.pollTask(res.task_id);
    }
    return res;
  },
  getDocument: (documentId) => apiFetch(`/documents/${documentId}/`, undefined, "GET"),
  explain: (caseId) => apiFetch("/explain/", { case_id: caseId }),
  nextSteps: (caseId) => apiFetch("/next-steps/", { case_id: caseId }),
  riskAnalysis: async (caseId) => {
    const res = await apiFetch("/risk-analysis/", { case_id: caseId });
    if (res.task_id) {
      return api.pollTask(res.task_id);
    }
    return res;
  },
  getCases: () => apiFetch("/cases/", undefined, "GET"),
  getCase: (caseId) => apiFetch(`/cases/${caseId}/`, undefined, "GET"),
  followUp: (caseId, message) => apiFetch(`/cases/${caseId}/follow-up/`, { message }),
  login: (email, password) => apiFetch("/auth/token/", { username: email, password }),
  register: (data) => apiFetch("/auth/register/", data),
};
