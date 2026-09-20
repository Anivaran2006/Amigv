const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? "http://127.0.0.1:8000/api" : "/api");

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("examalert_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("examalert_token", data.access_token);
    localStorage.setItem("examalert_user", JSON.stringify(data.user));
    return data;
  },

  async register(userData: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    telegram_chat_id?: string;
    notify_email: boolean;
    notify_telegram: boolean;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    localStorage.setItem("examalert_token", data.access_token);
    localStorage.setItem("examalert_user", JSON.stringify(data.user));
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  async updateProfile(updates: any) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    const user = await res.json();
    localStorage.setItem("examalert_user", JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem("examalert_token");
    localStorage.removeItem("examalert_user");
  },

  // --- Exams & Subscriptions ---
  async getExams(category?: string, search?: string, userId?: number) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);
    if (userId) params.append("user_id", userId.toString());

    const res = await fetch(`${API_BASE}/exams?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch exams");
    return res.json();
  },

  async getMyExams() {
    const res = await fetch(`${API_BASE}/exams/my-exams`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch subscribed exams");
    return res.json();
  },

  async getExamDetail(id: number) {
    const res = await fetch(`${API_BASE}/exams/${id}`);
    if (!res.ok) throw new Error("Failed to fetch exam detail");
    return res.json();
  },

  async subscribe(examId: number) {
    const res = await fetch(`${API_BASE}/exams/${examId}/subscribe`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Subscription failed");
    return res.json();
  },

  async unsubscribe(examId: number) {
    const res = await fetch(`${API_BASE}/exams/${examId}/subscribe`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Unsubscription failed");
    return res.json();
  },

  // --- Deadlines ---
  async getDeadlines(userId?: number, allExams: boolean = false) {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId.toString());
    if (allExams) params.append("all_exams", "true");

    const res = await fetch(`${API_BASE}/deadlines?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch deadlines");
    return res.json();
  },

  // --- Notifications ---
  async getNotifications(userId?: number, channel?: string) {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId.toString());
    if (channel && channel !== "all") params.append("channel", channel);

    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  },

  async sendTestNotification() {
    const res = await fetch(`${API_BASE}/notifications/test`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to trigger test notification");
    return res.json();
  },

  // --- AI Assistant ---
  async askAI(question: string, userId: number = 1) {
    const res = await fetch(`${API_BASE}/ai/ask?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("AI query failed");
    return res.json();
  },

  // --- Hackathon Demo Simulator ---
  async simulateExamUpdate(payload: {
    exam_id: number;
    notice_title: string;
    notice_content: string;
    official_url?: string;
    event_type?: string;
    published_date?: string;
  }) {
    const res = await fetch(`${API_BASE}/demo/simulate-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Simulation failed");
    return res.json();
  },
};
