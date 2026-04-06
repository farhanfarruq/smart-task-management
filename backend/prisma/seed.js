const { PrismaClient } = require('@prisma/client');
const {
  addDays,
  addHours,
  addMinutes,
  subDays,
  setHours,
  setMinutes,
} = require('date-fns');

const prisma = new PrismaClient();
const now = new Date();

const users = [
  { email: 'anak@smarttask.dev', name: 'Anak Prasetyo', role: 'ADMIN' },
  { email: 'naila@smarttask.dev', name: 'Naila Putri', role: 'USER' },
  { email: 'rahmat@smarttask.dev', name: 'Rahmat Hidayat', role: 'USER' },
  { email: 'salsa@smarttask.dev', name: 'Salsa Maharani', role: 'USER' },
  { email: 'dimas@smarttask.dev', name: 'Dimas Wicaksono', role: 'USER' },
  { email: 'bunga@smarttask.dev', name: 'Bunga Kartika', role: 'USER' },
  { email: 'farhan@smarttask.dev', name: 'Farhan Akbar', role: 'USER' },
  { email: 'tiara@smarttask.dev', name: 'Tiara Ayu', role: 'USER' },
  { email: 'yusuf@smarttask.dev', name: 'Yusuf Ramadhan', role: 'USER' },
  { email: 'rani@smarttask.dev', name: 'Rani Oktavia', role: 'USER' },
];

const projectBlueprints = [
  {
    name: 'Motion-style Planner Launch',
    description: 'Core product launch for intelligent work planning experience.',
    status: 'ACTIVE',
    color: '#2563eb',
    icon: 'rocket',
    health: 84,
    startOffset: -12,
    dueOffset: 21,
    owner: 'anak@smarttask.dev',
    members: ['naila@smarttask.dev', 'rahmat@smarttask.dev', 'salsa@smarttask.dev', 'dimas@smarttask.dev'],
    labels: [
      ['Planner', '#2563eb'],
      ['AI', '#8b5cf6'],
      ['Urgent', '#ef4444'],
      ['Research', '#10b981'],
    ],
    milestones: [
      { title: 'Planner UX frozen', dueOffset: 5 },
      { title: 'Beta team rollout', dueOffset: 14 },
      { title: 'Public launch readiness', dueOffset: 21 },
    ],
    recurring: [
      { title: 'Weekly planning sync', frequency: 'WEEKLY', interval: 1, nextOffset: 3 },
      { title: 'Daily launch check-in', frequency: 'DAILY', interval: 1, nextOffset: 1 },
    ],
    savedViews: [
      { name: 'Urgent Focus', filters: { priority: 'URGENT', status: 'IN_PROGRESS' } },
      { name: 'Review Queue', filters: { status: 'IN_REVIEW' } },
    ],
  },
  {
    name: 'Marketing Campaign Q3',
    description: 'End-to-end campaign planning for the Q3 acquisition push.',
    status: 'ACTIVE',
    color: '#10b981',
    icon: 'megaphone',
    health: 73,
    startOffset: -8,
    dueOffset: 28,
    owner: 'bunga@smarttask.dev',
    members: ['farhan@smarttask.dev', 'tiara@smarttask.dev', 'rani@smarttask.dev'],
    labels: [
      ['Campaign', '#10b981'],
      ['Design', '#f59e0b'],
      ['Copy', '#0ea5e9'],
      ['Paid Ads', '#ec4899'],
    ],
    milestones: [
      { title: 'Messaging approved', dueOffset: 6 },
      { title: 'Ads ready', dueOffset: 15 },
      { title: 'Campaign go-live', dueOffset: 28 },
    ],
    recurring: [
      { title: 'Performance review', frequency: 'WEEKLY', interval: 1, nextOffset: 4 },
    ],
    savedViews: [
      { name: 'Creative Pipeline', filters: { label: 'Design' } },
    ],
  },
  {
    name: 'Client Delivery Enterprise Suite',
    description: 'Implementation, review, and delivery for enterprise client onboarding.',
    status: 'ON_HOLD',
    color: '#f59e0b',
    icon: 'briefcase',
    health: 61,
    startOffset: -20,
    dueOffset: 16,
    owner: 'rahmat@smarttask.dev',
    members: ['anak@smarttask.dev', 'dimas@smarttask.dev', 'yusuf@smarttask.dev'],
    labels: [
      ['Client', '#f59e0b'],
      ['Backend', '#2563eb'],
      ['QA', '#14b8a6'],
      ['Blocked', '#ef4444'],
    ],
    milestones: [
      { title: 'Scope confirmation', dueOffset: -2 },
      { title: 'Internal QA sign-off', dueOffset: 9 },
      { title: 'Client handoff', dueOffset: 16 },
    ],
    recurring: [
      { title: 'Client status report', frequency: 'WEEKLY', interval: 1, nextOffset: 2 },
    ],
    savedViews: [
      { name: 'Blocked Tasks', filters: { status: 'BLOCKED' } },
    ],
  },
  {
    name: 'Operations Automation',
    description: 'Automating recurring operational workflows and reporting.',
    status: 'PLANNING',
    color: '#0f172a',
    icon: 'bot',
    health: 55,
    startOffset: -2,
    dueOffset: 35,
    owner: 'anak@smarttask.dev',
    members: ['naila@smarttask.dev', 'yusuf@smarttask.dev', 'rani@smarttask.dev'],
    labels: [
      ['Automation', '#0f172a'],
      ['Ops', '#64748b'],
      ['Data', '#06b6d4'],
    ],
    milestones: [
      { title: 'Process audit complete', dueOffset: 7 },
      { title: 'Automation spec approved', dueOffset: 18 },
    ],
    recurring: [
      { title: 'Ops metrics review', frequency: 'MONTHLY', interval: 1, nextOffset: 12 },
    ],
    savedViews: [
      { name: 'Planning Board', filters: { status: 'BACKLOG' } },
    ],
  },
];

const taskBlueprints = [
  {
    title: 'Finalize planner information architecture',
    description: 'Structure day planner, agenda, and review queue sections for a cleaner launch experience.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    estimatedMinutes: 240,
    actualMinutes: 160,
    importance: 5,
    flexibility: 'ADAPTIVE',
    dueOffset: 2,
    assignee: 'naila@smarttask.dev',
    reviewer: 'anak@smarttask.dev',
    comments: 3,
    subtasks: ['Audit current IA', 'Draft updated nav hierarchy', 'Review with product owner'],
    labels: ['Planner', 'Urgent'],
    scheduled: true,
    timeEntries: [90, 70],
  },
  {
    title: 'Implement dynamic priority scoring',
    description: 'Use deadline proximity, workload, and importance to compute urgency automatically.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    estimatedMinutes: 360,
    actualMinutes: 310,
    importance: 5,
    flexibility: 'FLEXIBLE',
    dueOffset: 3,
    assignee: 'rahmat@smarttask.dev',
    reviewer: 'anak@smarttask.dev',
    comments: 2,
    subtasks: ['Map scoring inputs', 'Implement service', 'Write test scenarios'],
    labels: ['AI', 'Research'],
    scheduled: true,
    timeEntries: [120, 80, 110],
  },
  {
    title: 'Create launch analytics report',
    description: 'Build summary export for leadership covering readiness, risk, and load.',
    status: 'TODO',
    priority: 'MEDIUM',
    estimatedMinutes: 180,
    actualMinutes: 0,
    importance: 4,
    flexibility: 'FLEXIBLE',
    dueOffset: 6,
    assignee: 'dimas@smarttask.dev',
    reviewer: 'anak@smarttask.dev',
    comments: 1,
    subtasks: ['List required KPIs', 'Prepare export format'],
    labels: ['Research'],
    scheduled: false,
    timeEntries: [],
  },
  {
    title: 'Fix blocked client API handshake',
    description: 'Resolve mismatch on auth callback and document fallback flow.',
    status: 'BLOCKED',
    priority: 'URGENT',
    estimatedMinutes: 300,
    actualMinutes: 140,
    importance: 5,
    flexibility: 'FIXED',
    dueOffset: 1,
    assignee: 'yusuf@smarttask.dev',
    reviewer: 'rahmat@smarttask.dev',
    comments: 4,
    subtasks: ['Inspect callback payload', 'Reproduce failure locally', 'Prepare vendor question list'],
    labels: ['Client', 'Backend', 'Blocked'],
    blockedReason: 'Waiting external vendor confirmation for callback schema update.',
    scheduled: true,
    timeEntries: [80, 60],
  },
  {
    title: 'Draft Q3 campaign copy variations',
    description: 'Prepare five conversion-focused headline sets and primary CTA options.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    estimatedMinutes: 210,
    actualMinutes: 120,
    importance: 4,
    flexibility: 'ADAPTIVE',
    dueOffset: 4,
    assignee: 'tiara@smarttask.dev',
    reviewer: 'bunga@smarttask.dev',
    comments: 2,
    subtasks: ['Write concept 1-3', 'Review tone guidelines', 'Final polish'],
    labels: ['Campaign', 'Copy'],
    scheduled: true,
    timeEntries: [60, 60],
  },
  {
    title: 'Design paid ads visual kit',
    description: 'Produce asset family for carousel, static, and story placements.',
    status: 'TODO',
    priority: 'HIGH',
    estimatedMinutes: 280,
    actualMinutes: 0,
    importance: 4,
    flexibility: 'FLEXIBLE',
    dueOffset: 7,
    assignee: 'farhan@smarttask.dev',
    reviewer: 'bunga@smarttask.dev',
    comments: 1,
    subtasks: ['Moodboard', 'Primary concepts', 'Adaptation pack'],
    labels: ['Campaign', 'Design', 'Paid Ads'],
    scheduled: false,
    timeEntries: [],
  },
  {
    title: 'Backfill planner templates',
    description: 'Create high-quality default templates for engineering, marketing, and client delivery.',
    status: 'DONE',
    priority: 'MEDIUM',
    estimatedMinutes: 150,
    actualMinutes: 165,
    importance: 3,
    flexibility: 'FLEXIBLE',
    dueOffset: -3,
    assignee: 'salsa@smarttask.dev',
    reviewer: 'anak@smarttask.dev',
    comments: 2,
    subtasks: ['Collect template needs', 'Add seed templates', 'Review naming consistency'],
    labels: ['Planner'],
    scheduled: true,
    timeEntries: [75, 90],
  },
  {
    title: 'Automate weekly operations digest',
    description: 'Generate a concise weekly digest for operational incidents and improvements.',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    estimatedMinutes: 240,
    actualMinutes: 0,
    importance: 3,
    flexibility: 'ADAPTIVE',
    dueOffset: 12,
    assignee: 'rani@smarttask.dev',
    reviewer: 'anak@smarttask.dev',
    comments: 0,
    subtasks: ['Collect data sources', 'Define email layout'],
    labels: ['Automation', 'Ops', 'Data'],
    scheduled: false,
    timeEntries: [],
  },
];

function getTaskVariants(projectIndex) {
  return taskBlueprints.map((task, index) => ({
    ...task,
    title: `${task.title}${projectIndex > 0 ? ` ${projectIndex + 1}` : ''}`,
    position: index,
  }));
}

async function resetDatabase() {
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.assistantSuggestion.deleteMany(),
    prisma.riskAlert.deleteMany(),
    prisma.taskDependency.deleteMany(),
    prisma.scheduledTaskBlock.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.userPlannerProfile.deleteMany(),
    prisma.timeEntry.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.subtask.deleteMany(),
    prisma.taskLabel.deleteMany(),
    prisma.task.deleteMany(),
    prisma.label.deleteMany(),
    prisma.savedView.deleteMany(),
    prisma.recurringTaskRule.deleteMany(),
    prisma.projectMilestone.deleteMany(),
    prisma.projectInvitation.deleteMany(),
    prisma.templateTask.deleteMany(),
    prisma.projectTemplate.deleteMany(),
    prisma.project.deleteMany(),
    prisma.otp.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedUsers() {
  const created = {};
  for (const user of users) {
    created[user.email] = await prisma.user.create({ data: user });
  }

  for (const user of Object.values(created)) {
    await prisma.userPlannerProfile.create({
      data: {
        userId: user.id,
        workHours: {
          timezone: 'Asia/Jakarta',
          weekdays: {
            monday: ['09:00', '17:30'],
            tuesday: ['09:00', '17:30'],
            wednesday: ['09:00', '17:30'],
            thursday: ['09:00', '17:30'],
            friday: ['09:00', '16:30'],
          },
        },
        focusWindows: [
          { day: 'monday', start: '09:00', end: '11:00' },
          { day: 'tuesday', start: '13:00', end: '15:00' },
        ],
        maxMeetingsPerDay: 4,
        chunkingPreference: 60,
      },
    });

    await prisma.calendarEvent.createMany({
      data: [
        {
          userId: user.id,
          title: 'Daily standup',
          description: '15 minute team sync',
          startAt: setMinutes(setHours(addDays(now, 1), 9), 15),
          endAt: setMinutes(setHours(addDays(now, 1), 9), 30),
          isBusy: true,
        },
        {
          userId: user.id,
          title: 'Weekly planning',
          description: 'Planner review and commitment setting',
          startAt: setMinutes(setHours(addDays(now, 2), 10), 0),
          endAt: setMinutes(setHours(addDays(now, 2), 11), 0),
          isBusy: true,
        },
      ],
    });
  }

  return created;
}

async function seedTemplates() {
  const templates = [
    {
      name: 'software-sprint',
      description: 'Default sprint setup for product and engineering squads.',
      color: '#2563eb',
      icon: 'rocket',
      tasks: [
        ['Backlog grooming', 'BACKLOG', 'MEDIUM', 60],
        ['Implementation sprint', 'TODO', 'HIGH', 240],
        ['QA and review', 'IN_REVIEW', 'HIGH', 120],
      ],
    },
    {
      name: 'marketing-campaign',
      description: 'Launch-ready planning template for marketing campaign execution.',
      color: '#10b981',
      icon: 'megaphone',
      tasks: [
        ['Campaign brief', 'TODO', 'MEDIUM', 90],
        ['Creative production', 'IN_PROGRESS', 'HIGH', 240],
        ['Launch monitoring', 'TODO', 'URGENT', 120],
      ],
    },
    {
      name: 'client-delivery',
      description: 'Professional implementation and handoff template for enterprise clients.',
      color: '#f59e0b',
      icon: 'briefcase',
      tasks: [
        ['Kickoff and alignment', 'TODO', 'MEDIUM', 90],
        ['Implementation and verification', 'IN_PROGRESS', 'HIGH', 300],
        ['Client approval handoff', 'IN_REVIEW', 'URGENT', 120],
      ],
    },
    {
      name: 'ops-automation',
      description: 'Recurring workflow template for operations automation teams.',
      color: '#0f172a',
      icon: 'bot',
      tasks: [
        ['Process mapping', 'BACKLOG', 'MEDIUM', 120],
        ['Automation build', 'TODO', 'HIGH', 300],
        ['Metrics validation', 'IN_REVIEW', 'HIGH', 150],
      ],
    },
  ];

  for (const template of templates) {
    const created = await prisma.projectTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        color: template.color,
        icon: template.icon,
      },
    });

    await prisma.templateTask.createMany({
      data: template.tasks.map(([title, status, priority, estimatedMinutes], index) => ({
        templateId: created.id,
        title,
        status,
        priority,
        estimatedMinutes,
        order: index + 1,
      })),
    });
  }
}

async function seedProjects(userMap) {
  const projects = [];

  for (let i = 0; i < projectBlueprints.length; i += 1) {
    const blueprint = projectBlueprints[i];
    const owner = userMap[blueprint.owner];
    const members = blueprint.members.map((email) => userMap[email]);

    const project = await prisma.project.create({
      data: {
        name: blueprint.name,
        description: blueprint.description,
        status: blueprint.status,
        color: blueprint.color,
        icon: blueprint.icon,
        health: blueprint.health,
        ownerId: owner.id,
        startDate: addDays(now, blueprint.startOffset),
        dueDate: addDays(now, blueprint.dueOffset),
        members: {
          connect: [{ id: owner.id }, ...members.map((member) => ({ id: member.id }))],
        },
      },
      include: { members: true },
    });

    for (const milestone of blueprint.milestones) {
      await prisma.projectMilestone.create({
        data: {
          projectId: project.id,
          title: milestone.title,
          dueDate: addDays(now, milestone.dueOffset),
        },
      });
    }

    const labelMap = {};
    for (const [name, color] of blueprint.labels) {
      const label = await prisma.label.create({
        data: { projectId: project.id, name, color },
      });
      labelMap[name] = label;
    }

    for (const savedView of blueprint.savedViews) {
      await prisma.savedView.create({
        data: {
          projectId: project.id,
          name: savedView.name,
          filters: savedView.filters,
        },
      });
    }

    for (const recurring of blueprint.recurring) {
      await prisma.recurringTaskRule.create({
        data: {
          projectId: project.id,
          title: recurring.title,
          description: `${recurring.title} for ${project.name}`,
          priority: 'MEDIUM',
          frequency: recurring.frequency,
          interval: recurring.interval,
          nextRunAt: addDays(now, recurring.nextOffset),
          assigneeId: members[0]?.id ?? owner.id,
          reviewerId: owner.id,
          estimatedMinutes: 45,
        },
      });
    }

    const taskVariants = getTaskVariants(i);
    const createdTasks = [];

    for (let index = 0; index < taskVariants.length; index += 1) {
      const task = taskVariants[index];
      const assignee = userMap[task.assignee] || members[index % members.length] || owner;
      const reviewer = userMap[task.reviewer] || owner;
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          estimatedMinutes: task.estimatedMinutes,
          actualMinutes: task.actualMinutes,
          importance: task.importance,
          flexibility: task.flexibility,
          deadline: addDays(now, task.dueOffset),
          assigneeId: assignee.id,
          reviewerId: reviewer.id,
          projectId: project.id,
          createdById: owner.id,
          blockedReason: task.blockedReason || null,
          position: task.position,
          startedAt: ['IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'].includes(task.status) ? subDays(now, 2) : null,
          completedAt: task.status === 'DONE' ? subDays(now, 1) : null,
          urgencyScore: task.priority === 'URGENT' ? 0.96 : task.priority === 'HIGH' ? 0.79 : 0.48,
          isAutoScheduled: task.scheduled,
          latestStartAt: addDays(now, task.dueOffset - 1),
          preferredTime: setMinutes(setHours(addDays(now, Math.max(task.dueOffset - 2, 1)), 10), 0),
        },
      });

      createdTasks.push({ ...createdTask, assignee, reviewer, owner });

      for (const subtaskTitle of task.subtasks) {
        await prisma.subtask.create({
          data: {
            taskId: createdTask.id,
            title: subtaskTitle,
            completed: task.status === 'DONE' || (task.status === 'IN_REVIEW' && subtaskTitle !== task.subtasks[task.subtasks.length - 1]),
          },
        });
      }

      for (const labelName of task.labels) {
        const label = labelMap[labelName];
        if (label) {
          await prisma.taskLabel.create({
            data: {
              taskId: createdTask.id,
              labelId: label.id,
            },
          });
        }
      }

      for (let c = 0; c < task.comments; c += 1) {
        const commentAuthor = c % 2 === 0 ? assignee : reviewer;
        await prisma.comment.create({
          data: {
            taskId: createdTask.id,
            authorId: commentAuthor.id,
            content:
              c % 2 === 0
                ? `Progress update ${c + 1}: task is moving forward and current blocker is under control.`
                : `Review note ${c + 1}: please tighten the output before final approval.`,
          },
        });
      }

      for (const minutes of task.timeEntries) {
        await prisma.timeEntry.create({
          data: {
            taskId: createdTask.id,
            userId: assignee.id,
            minutes,
            note: `Logged focused work for ${task.title}.`,
          },
        });
      }

      if (task.scheduled) {
        await prisma.scheduledTaskBlock.createMany({
          data: [
            {
              taskId: createdTask.id,
              userId: assignee.id,
              startAt: setMinutes(setHours(addDays(now, 1 + (index % 3)), 9 + (index % 4)), 0),
              endAt: setMinutes(setHours(addDays(now, 1 + (index % 3)), 10 + (index % 4)), 15),
              source: index % 2 === 0 ? 'AUTO' : 'MANUAL',
              confidence: index % 2 === 0 ? 0.87 : 0.71,
              isLocked: index % 3 === 0,
            },
            {
              taskId: createdTask.id,
              userId: assignee.id,
              startAt: setMinutes(setHours(addDays(now, 2 + (index % 2)), 13 + (index % 2)), 30),
              endAt: setMinutes(setHours(addDays(now, 2 + (index % 2)), 14 + (index % 2)), 30),
              source: 'AUTO',
              confidence: 0.76,
              isLocked: false,
            },
          ],
        });
      }

      await prisma.activityLog.createMany({
        data: [
          {
            userId: owner.id,
            action: 'CREATE_TASK',
            entityType: 'TASK',
            entityId: createdTask.id,
            projectId: project.id,
            taskId: createdTask.id,
            details: { taskTitle: createdTask.title, status: createdTask.status },
          },
          {
            userId: assignee.id,
            action: task.status === 'DONE' ? 'COMPLETE_TASK' : 'UPDATE_TASK',
            entityType: 'TASK',
            entityId: createdTask.id,
            projectId: project.id,
            taskId: createdTask.id,
            details: { priority: createdTask.priority, assignee: assignee.email },
          },
        ],
      });

      await prisma.notification.createMany({
        data: [
          {
            userId: assignee.id,
            type: 'TASK_ASSIGNED',
            title: `Assigned: ${createdTask.title}`,
            message: `You are assigned to ${createdTask.title} in ${project.name}.`,
            targetUrl: `/projects/${project.id}/tasks`,
            isRead: index % 2 === 0,
          },
          {
            userId: reviewer.id,
            type: 'STATUS_CHANGED',
            title: `Review flow updated`,
            message: `${createdTask.title} is currently ${createdTask.status.replaceAll('_', ' ')}.`,
            targetUrl: `/projects/${project.id}/tasks`,
            isRead: index % 3 === 0,
          },
        ],
      });
    }

    if (createdTasks.length >= 3) {
      await prisma.taskDependency.create({
        data: {
          predecessorId: createdTasks[0].id,
          successorId: createdTasks[1].id,
          type: 'FINISH_TO_START',
        },
      });
      await prisma.taskDependency.create({
        data: {
          predecessorId: createdTasks[1].id,
          successorId: createdTasks[2].id,
          type: 'FINISH_TO_START',
        },
      });
    }

    await prisma.assistantSuggestion.createMany({
      data: [
        {
          userId: owner.id,
          title: `Rebalance ${project.name}`,
          description: 'System detected uneven task distribution and suggests moving one urgent item.',
          actionType: 'REBALANCE',
          payload: { projectId: project.id, target: members[0]?.id || owner.id },
          status: 'PENDING',
        },
        {
          userId: owner.id,
          title: `Plan next week for ${project.name}`,
          description: 'Several high-importance tasks have no reliable schedule blocks yet.',
          actionType: 'PLAN_WEEK',
          payload: { projectId: project.id },
          status: 'PENDING',
        },
      ],
    });

    await prisma.riskAlert.createMany({
      data: [
        {
          projectId: project.id,
          level: blueprint.status === 'ON_HOLD' ? 'CRITICAL' : 'WARNING',
          message:
            blueprint.status === 'ON_HOLD'
              ? 'Project is paused and there are still client-facing deliverables at risk.'
              : 'At least one high-priority task needs attention within the next 72 hours.',
        },
      ],
    });

    await prisma.projectInvitation.createMany({
      data: [
        {
          projectId: project.id,
          email: 'external.stakeholder@example.com',
          status: 'PENDING',
        },
        {
          projectId: project.id,
          email: 'observer.team@example.com',
          status: 'ACCEPTED',
          respondedAt: subDays(now, 4),
        },
      ],
    });

    await prisma.activityLog.create({
      data: {
        userId: owner.id,
        action: 'CREATE_PROJECT',
        entityType: 'PROJECT',
        entityId: project.id,
        projectId: project.id,
        details: { projectName: project.name, memberCount: project.members.length },
      },
    });

    projects.push({ project, labelMap, createdTasks });
  }

  return projects;
}

async function seedOtps() {
  await prisma.otp.createMany({
    data: [
      {
        email: 'anak@smarttask.dev',
        code: '123456',
        expiresAt: addHours(now, 1),
        used: false,
      },
      {
        email: 'naila@smarttask.dev',
        code: '654321',
        expiresAt: addHours(now, 1),
        used: false,
      },
    ],
  });
}

async function main() {
  console.log('Resetting database...');
  await resetDatabase();

  console.log('Seeding users, planner profiles, and calendar events...');
  const userMap = await seedUsers();

  console.log('Seeding reusable project templates...');
  await seedTemplates();

  console.log('Seeding projects with tasks, comments, labels, schedules, and analytics data...');
  await seedProjects(userMap);

  console.log('Seeding OTP demo entries...');
  await seedOtps();

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
