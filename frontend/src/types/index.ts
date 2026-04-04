export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  members: User[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
  assigneeId?: string;
  assignee?: User;
  projectId: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}