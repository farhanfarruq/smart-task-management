export type AppRole = 'ADMIN' | 'USER';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FlexibilityLevel = 'FIXED' | 'FLEXIBLE' | 'ADAPTIVE';
export type SchedulingSource = 'AUTO' | 'MANUAL';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type NotificationType =
  | 'PROJECT_INVITATION'
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMMENT'
  | 'DEADLINE_WARNING'
  | 'STATUS_CHANGED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  bio?: string | null;
  role: AppRole;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  minutes: number;
  note?: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  reviewerId?: string | null;
  reviewer?: User | null;
  blockedReason?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  projectId: string;
  project?: Project;
  createdById: string;
  createdBy?: User;
  comments?: Comment[];
  labels?: Array<{ label: Label }>;
  subtasks?: Subtask[];
  timeEntries?: TimeEntry[];
  scheduledBlocks?: ScheduledTaskBlock[];
  importance: number;
  urgencyScore: number;
  flexibility: FlexibilityLevel;
  isAutoScheduled: boolean;
  preferredTime?: string | null;
  latestStartAt?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  status: InvitationStatus;
  createdAt: string;
  respondedAt?: string | null;
  project?: Project;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  health: number;
  color: string;
  icon: string;
  ownerId: string;
  owner?: User;
  members: User[];
  tasks?: Task[];
  invitations?: ProjectInvitation[];
  labels?: Label[];
  startDate?: string | null;
  dueDate?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  overdueTasks?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  projectId?: string | null;
  taskId?: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardData {
  assigned: Task[];
  overdue: Task[];
  dueSoon: Task[];
}

export interface SavedView {
  id: string;
  projectId: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    estimatedMinutes?: number | null;
    order: number;
  }>;
}

export interface RecurringTaskRule {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  nextRunAt: string;
  assigneeId?: string | null;
  reviewerId?: string | null;
  estimatedMinutes?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectReport {
  project: {
    id: string;
    name: string;
    dueDate?: string | null;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    progress: number;
    totalTrackedMinutes: number;
  };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  topContributors: Array<{
    id: string;
    name: string;
    email: string;
    trackedMinutes: number;
    assignedTasks: number;
  }>;
}

export interface ScheduledTaskBlock {
  id: string;
  taskId: string;
  userId: string;
  startAt: string;
  endAt: string;
  source: SchedulingSource;
  confidence: number;
  isLocked: boolean;
  createdAt: string;
  task?: Task;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  isBusy: boolean;
  externalId?: string | null;
}

export interface PlannerProfile {
  id: string;
  userId: string;
  workHours: any;
  focusWindows: any;
  maxMeetingsPerDay?: number | null;
  chunkingPreference: number;
}
