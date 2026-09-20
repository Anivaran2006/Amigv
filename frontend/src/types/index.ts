export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  telegram_chat_id?: string;
  notify_email: boolean;
  notify_telegram: boolean;
  created_at: string;
}

export interface Exam {
  id: number;
  slug: string;
  name: string;
  category: string;
  organizing_authority: string;
  official_website: string;
  official_application_url?: string;
  description?: string;
  active: boolean;
  is_subscribed: boolean;
  latest_notice_title?: string;
  latest_notice_date?: string;
  upcoming_deadline?: string;
  days_remaining?: number;
}

export interface Notice {
  id: number;
  exam_id: number;
  exam_name?: string;
  title: string;
  raw_content?: string;
  published_date?: string;
  detected_at: string;
  event_type: string;
  importance: string;
  summary?: string;
  registration_start?: string;
  registration_end?: string;
  exam_date?: string;
  action_required?: string;
  official_url: string;
  is_official: boolean;
  fees?: string;
  eligibility?: string;
}

export interface Deadline {
  id: number;
  exam_id: number;
  exam_name: string;
  event_name: string;
  deadline_date: string;
  days_remaining: number;
  is_official: boolean;
  status: 'urgent' | 'due_soon' | 'upcoming';
}

export interface NotificationItem {
  id: number;
  user_id: number;
  exam_id: number;
  exam_name?: string;
  notice_id?: number;
  channel: 'telegram' | 'email';
  sent_at: string;
  status: string;
  title: string;
  message_preview: string;
}

export interface TimelineStage {
  stage: string;
  status: 'announced' | 'not_announced';
  date: string;
}

export interface AIChatResponse {
  answer: string;
  sources: string[];
  suggested_actions: string[];
}
