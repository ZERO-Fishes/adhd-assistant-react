// 任务模板类型
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  timerType: 'countdown' | 'countup';
  countdownTime: number; // 秒
  countupMinTime: number; // 秒
  countupMaxTime: number; // 秒
  forbiddenActions: string[];
  createdAt: string;
}

// 任务类型
export interface TaskType {
  name: string;
  color: string;
  textColor: string;
}

// 任务链
export interface TaskChain {
  id: string;
  name: string;
  items: any[];
  currentStreak: number;
  maxStreak: number;
  createdAt: string;
}

// 历史记录
export interface HistoryRecord {
  id: string;
  sessionId: string;
  type: 'appointment' | 'task';
  status: 'success' | 'failed';
  templateId: string;
  templateName: string;
  templateType: string;
  scheduledTime: string;
  actualStartTime: string | null;
  endTime: string;
  duration: number | null;
  violations: string[];
  notes: string;
  timeNodes: {
    appointmentStart: string | null;
    taskStart: string | null;
    taskEnd: string | null;
    abandonTime: string | null;
  };
  createdAt: string;
}

// 任务会话
export interface TaskSession {
  sessionId: string;
  templateId: string;
  templateName: string;
  templateType: string;
  scheduledTime: string;
  appointment: HistoryRecord | null;
  task: HistoryRecord | null;
  createdAt: string;
  overallStatus: 'incomplete' | 'success' | 'failed';
}

// 应用设置
export interface AppSettings {
  defaultAppointmentTime: number;
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
  taskTypes: TaskType[];
}

// 应用数据
export interface AppData {
  templates: TaskTemplate[];
  chains: TaskChain[];
  settings: AppSettings;
  currentChain: string | null;
  history: HistoryRecord[];
  lastUpdated: string;
}

// 历史记录筛选器
export interface HistoryFilters {
  type?: string;
  status?: string;
  templateType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// 历史记录统计
export interface HistoryStats {
  totalSessions: number;
  totalRecords: number;
  sessions: {
    success: number;
    failed: number;
    incomplete: number;
  };
  appointments: {
    total: number;
    success: number;
    failed: number;
  };
  tasks: {
    total: number;
    success: number;
    failed: number;
  };
  byType: Record<string, {
    total: number;
    success: number;
    failed: number;
    incomplete: number;
  }>;
  averageDuration: number;
}
