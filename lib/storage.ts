export interface UserState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedQuests: string[];
  favorites: string[];
  recentTools: string[];
  badges: string[];
  onboarded: boolean;
  themePreference: 'cream' | 'white' | 'dark';
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  streak: number;
  bestStreak: number;
  history: string[]; // ISO dates 'YYYY-MM-DD'
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface ApplicationItem {
  id: string;
  company: string;
  role: string;
  location: string;
  date: string;
  status: 'WISHLIST' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  notes: string;
  jobUrl: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  updatedAt: string;
}

const DEFAULT_USER_STATE: UserState = {
  xp: 1840,
  level: 12,
  streak: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedQuests: ['math-q1', 'logic-q1'],
  favorites: ['gst', 'json-formatter', 'qr-generator', 'pomodoro'],
  recentTools: ['gst', 'json-formatter', 'percentage', 'word-counter'],
  badges: ['INITIALIZER', 'MATH HERO', 'SPEED DEMON'],
  onboarded: true,
  themePreference: 'cream',
  soundEnabled: false,
  reducedMotion: false,
};

const DEFAULT_TASKS: TaskItem[] = [
  { id: 't1', title: 'Complete SQL Window Functions Practice', category: 'STUDY', completed: false, createdAt: new Date().toISOString() },
  { id: 't2', title: 'Apply for Senior Frontend Engineer at TechCorp', category: 'CAREER', completed: true, createdAt: new Date().toISOString() },
  { id: 't3', title: 'Read 15 Pages of System Design Interview', category: 'STUDY', completed: false, createdAt: new Date().toISOString() },
  { id: 't4', title: 'Calculated Monthly GST Returns for Client', category: 'TOOLS', completed: true, createdAt: new Date().toISOString() },
];

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h1', title: 'Daily Coding Practice', category: 'CODING', streak: 12, bestStreak: 18, history: [new Date().toISOString().split('T')[0]] },
  { id: 'h2', title: 'Read Technical Docs', category: 'STUDY', streak: 5, bestStreak: 14, history: [new Date().toISOString().split('T')[0]] },
  { id: 'h3', title: 'Morning Workout & Stretch', category: 'HEALTH', streak: 7, bestStreak: 7, history: [new Date().toISOString().split('T')[0]] },
  { id: 'h4', title: '25m Focus Session', category: 'FOCUS', streak: 4, bestStreak: 10, history: [] },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: 'e1', title: 'Domain & Hosting Renewal', amount: 1200, category: 'Bills', date: new Date().toISOString().split('T')[0] },
  { id: 'e2', title: 'Coffee & Books', amount: 350, category: 'Food', date: new Date().toISOString().split('T')[0] },
  { id: 'e3', title: 'Data Analytics Course', amount: 2499, category: 'Education', date: new Date().toISOString().split('T')[0] },
];

const DEFAULT_APPLICATIONS: ApplicationItem[] = [];

const DEFAULT_NOTES: NoteItem[] = [
  { id: 'n1', title: 'SQL Cheatsheet', content: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5 ORDER BY COUNT(*) DESC;', subject: 'SQL', updatedAt: new Date().toISOString() },
  { id: 'n2', title: 'React 19 Hooks', content: 'useActionState and useFormStatus streamline optimistic UI updates and async data transitions.', subject: 'React', updatedAt: new Date().toISOString() },
];

class StorageManager {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getUserState(): UserState {
    if (!this.isBrowser()) return DEFAULT_USER_STATE;
    const data = localStorage.getItem('dh_user_state');
    return data ? JSON.parse(data) : DEFAULT_USER_STATE;
  }

  saveUserState(state: Partial<UserState>): UserState {
    const current = this.getUserState();
    const updated = { ...current, ...state };
    if (this.isBrowser()) {
      localStorage.setItem('dh_user_state', JSON.stringify(updated));
    }
    return updated;
  }

  addXP(amount: number): { state: UserState; leveledUp: boolean } {
    const current = this.getUserState();
    const newXP = current.xp + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    const leveledUp = newLevel > current.level;
    
    const updated = this.saveUserState({
      xp: newXP,
      level: newLevel,
    });

    return { state: updated, leveledUp };
  }

  getTasks(): TaskItem[] {
    if (!this.isBrowser()) return DEFAULT_TASKS;
    const data = localStorage.getItem('dh_tasks');
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  }

  saveTasks(tasks: TaskItem[]): void {
    if (this.isBrowser()) {
      localStorage.setItem('dh_tasks', JSON.stringify(tasks));
    }
  }

  addTask(title: string, category = 'GENERAL'): TaskItem[] {
    const tasks = this.getTasks();
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      title,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    this.saveTasks(updated);
    this.addXP(20);
    return updated;
  }

  toggleTask(id: string): TaskItem[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveTasks(updated);
    return updated;
  }

  getHabits(): HabitItem[] {
    if (!this.isBrowser()) return DEFAULT_HABITS;
    const data = localStorage.getItem('dh_habits');
    return data ? JSON.parse(data) : DEFAULT_HABITS;
  }

  saveHabits(habits: HabitItem[]): void {
    if (this.isBrowser()) {
      localStorage.setItem('dh_habits', JSON.stringify(habits));
    }
  }

  toggleHabitToday(id: string): HabitItem[] {
    const today = new Date().toISOString().split('T')[0];
    const habits = this.getHabits();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const alreadyDone = h.history.includes(today);
      let newHistory = [...h.history];
      let newStreak = h.streak;
      if (alreadyDone) {
        newHistory = newHistory.filter(d => d !== today);
        newStreak = Math.max(0, h.streak - 1);
      } else {
        newHistory.push(today);
        newStreak += 1;
      }
      return {
        ...h,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak),
        history: newHistory,
      };
    });
    this.saveHabits(updated);
    this.addXP(15);
    return updated;
  }

  getExpenses(): ExpenseItem[] {
    if (!this.isBrowser()) return DEFAULT_EXPENSES;
    const data = localStorage.getItem('dh_expenses');
    return data ? JSON.parse(data) : DEFAULT_EXPENSES;
  }

  addExpense(expense: Omit<ExpenseItem, 'id'>): ExpenseItem[] {
    const list = this.getExpenses();
    const newItem: ExpenseItem = {
      ...expense,
      id: 'exp_' + Date.now(),
    };
    const updated = [newItem, ...list];
    if (this.isBrowser()) {
      localStorage.setItem('dh_expenses', JSON.stringify(updated));
    }
    return updated;
  }

  getApplications(): ApplicationItem[] {
    if (!this.isBrowser()) return DEFAULT_APPLICATIONS;
    const data = localStorage.getItem('dh_applications');
    return data ? JSON.parse(data) : DEFAULT_APPLICATIONS;
  }

  saveApplications(apps: ApplicationItem[]): void {
    if (this.isBrowser()) {
      localStorage.setItem('dh_applications', JSON.stringify(apps));
    }
  }

  addApplication(app: Omit<ApplicationItem, 'id'>): ApplicationItem[] {
    const apps = this.getApplications();
    const newApp: ApplicationItem = {
      ...app,
      id: 'app_' + Date.now(),
    };
    const updated = [newApp, ...apps];
    this.saveApplications(updated);
    this.addXP(25);
    return updated;
  }

  getNotes(): NoteItem[] {
    if (!this.isBrowser()) return DEFAULT_NOTES;
    const data = localStorage.getItem('dh_notes');
    return data ? JSON.parse(data) : DEFAULT_NOTES;
  }

  addNote(title: string, content: string, subject: string): NoteItem[] {
    const notes = this.getNotes();
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title,
      content,
      subject,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    if (this.isBrowser()) {
      localStorage.setItem('dh_notes', JSON.stringify(updated));
    }
    return updated;
  }

  deleteNote(id: string): NoteItem[] {
    const notes = this.getNotes().filter(n => n.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem('dh_notes', JSON.stringify(notes));
    }
    return notes;
  }

  toggleFavorite(toolId: string): string[] {
    const state = this.getUserState();
    const favs = state.favorites.includes(toolId)
      ? state.favorites.filter(id => id !== toolId)
      : [...state.favorites, toolId];
    this.saveUserState({ favorites: favs });
    return favs;
  }

  trackRecentTool(toolId: string): string[] {
    const state = this.getUserState();
    const recents = [toolId, ...state.recentTools.filter(id => id !== toolId)].slice(0, 10);
    this.saveUserState({ recentTools: recents });
    return recents;
  }

  clearAllData(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    }
  }
}

export const storage = new StorageManager();
