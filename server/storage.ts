import {
  users,
  projects,
  onboardings,
  screens,
  analyticsEvents,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Onboarding,
  type InsertOnboarding,
  type Screen,
  type InsertScreen,
  type UpdateScreen,
  type AnalyticsEvent,
  type OnboardingAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(userId: string): Promise<(Project & { onboardings: Onboarding[] })[]>;
  getProject(id: string, userId: string): Promise<(Project & { onboardings: (Onboarding & { screenCount: number })[] }) | undefined>;
  getProjectByApiKey(apiKey: string): Promise<Project | undefined>;
  createProject(userId: string, data: InsertProject): Promise<Project>;
  updateProject(id: string, userId: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string, userId: string): Promise<boolean>;
  
  // Onboardings
  getOnboarding(id: string): Promise<(Onboarding & { screens: Screen[] }) | undefined>;
  getOnboardingsByProject(projectId: string): Promise<Onboarding[]>;
  createOnboarding(projectId: string, data: InsertOnboarding): Promise<Onboarding>;
  updateOnboarding(id: string, data: Partial<InsertOnboarding>): Promise<Onboarding | undefined>;
  deleteOnboarding(id: string): Promise<boolean>;
  publishOnboarding(id: string): Promise<Onboarding | undefined>;
  getPublishedOnboarding(apiKey: string): Promise<{ version: number; screens: Screen[] } | undefined>;
  
  // Screens
  getScreen(id: string): Promise<Screen | undefined>;
  createScreen(onboardingId: string, data: InsertScreen): Promise<Screen>;
  updateScreen(id: string, data: UpdateScreen): Promise<Screen | undefined>;
  deleteScreen(id: string): Promise<boolean>;
  reorderScreens(onboardingId: string, screenIds: string[]): Promise<boolean>;
  
  // Analytics
  recordEvent(onboardingId: string, version: number, screenIndex: number, timestamp?: Date): Promise<AnalyticsEvent>;
  getOnboardingAnalytics(onboardingId: string): Promise<OnboardingAnalytics>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Projects
  async getProjects(userId: string): Promise<(Project & { onboardings: Onboarding[] })[]> {
    const projectsList = await db.select().from(projects).where(eq(projects.userId, userId));
    
    const result = await Promise.all(
      projectsList.map(async (project) => {
        const projectOnboardings = await db
          .select()
          .from(onboardings)
          .where(eq(onboardings.projectId, project.id));
        return { ...project, onboardings: projectOnboardings };
      })
    );
    
    return result;
  }

  async getProject(id: string, userId: string): Promise<(Project & { onboardings: (Onboarding & { screenCount: number })[] }) | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    
    if (!project) return undefined;
    
    const projectOnboardings = await db
      .select()
      .from(onboardings)
      .where(eq(onboardings.projectId, id));
    
    const onboardingsWithCounts = await Promise.all(
      projectOnboardings.map(async (onboarding) => {
        const screenCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(screens)
          .where(eq(screens.onboardingId, onboarding.id));
        return { ...onboarding, screenCount: Number(screenCount[0]?.count || 0) };
      })
    );
    
    return { ...project, onboardings: onboardingsWithCounts };
  }

  async getProjectByApiKey(apiKey: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.publicApiKey, apiKey));
    return project || undefined;
  }

  async createProject(userId: string, data: InsertProject): Promise<Project> {
    const publicApiKey = nanoid(32);
    const [project] = await db
      .insert(projects)
      .values({ ...data, userId, publicApiKey })
      .returning();
    return project;
  }

  async updateProject(id: string, userId: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(data)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Onboardings
  async getOnboarding(id: string): Promise<(Onboarding & { screens: Screen[] }) | undefined> {
    const [onboarding] = await db
      .select()
      .from(onboardings)
      .where(eq(onboardings.id, id));
    
    if (!onboarding) return undefined;
    
    const screensList = await db
      .select()
      .from(screens)
      .where(eq(screens.onboardingId, id))
      .orderBy(asc(screens.order));
    
    return { ...onboarding, screens: screensList };
  }

  async getOnboardingsByProject(projectId: string): Promise<Onboarding[]> {
    return db.select().from(onboardings).where(eq(onboardings.projectId, projectId));
  }

  async createOnboarding(projectId: string, data: InsertOnboarding): Promise<Onboarding> {
    const [onboarding] = await db
      .insert(onboardings)
      .values({ ...data, projectId })
      .returning();
    return onboarding;
  }

  async updateOnboarding(id: string, data: Partial<InsertOnboarding>): Promise<Onboarding | undefined> {
    const [onboarding] = await db
      .update(onboardings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardings.id, id))
      .returning();
    return onboarding || undefined;
  }

  async deleteOnboarding(id: string): Promise<boolean> {
    const result = await db
      .delete(onboardings)
      .where(eq(onboardings.id, id))
      .returning();
    return result.length > 0;
  }

  async publishOnboarding(id: string): Promise<Onboarding | undefined> {
    const [onboarding] = await db
      .update(onboardings)
      .set({
        status: "published",
        version: sql`${onboardings.version} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(onboardings.id, id))
      .returning();
    return onboarding || undefined;
  }

  async getPublishedOnboarding(apiKey: string): Promise<{ version: number; screens: Screen[] } | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.publicApiKey, apiKey));
    
    if (!project) return undefined;
    
    const [onboarding] = await db
      .select()
      .from(onboardings)
      .where(and(
        eq(onboardings.projectId, project.id),
        eq(onboardings.status, "published")
      ))
      .orderBy(sql`${onboardings.version} DESC`)
      .limit(1);
    
    if (!onboarding) return undefined;
    
    const screensList = await db
      .select()
      .from(screens)
      .where(eq(screens.onboardingId, onboarding.id))
      .orderBy(asc(screens.order));
    
    return { version: onboarding.version, screens: screensList };
  }

  // Screens
  async getScreen(id: string): Promise<Screen | undefined> {
    const [screen] = await db.select().from(screens).where(eq(screens.id, id));
    return screen || undefined;
  }

  async createScreen(onboardingId: string, data: InsertScreen): Promise<Screen> {
    const existingScreens = await db
      .select({ count: sql<number>`count(*)` })
      .from(screens)
      .where(eq(screens.onboardingId, onboardingId));
    
    const order = Number(existingScreens[0]?.count || 0);
    
    const [screen] = await db
      .insert(screens)
      .values({ ...data, onboardingId, order })
      .returning();
    return screen;
  }

  async updateScreen(id: string, data: UpdateScreen): Promise<Screen | undefined> {
    const [screen] = await db
      .update(screens)
      .set(data)
      .where(eq(screens.id, id))
      .returning();
    return screen || undefined;
  }

  async deleteScreen(id: string): Promise<boolean> {
    const result = await db
      .delete(screens)
      .where(eq(screens.id, id))
      .returning();
    return result.length > 0;
  }

  async reorderScreens(onboardingId: string, screenIds: string[]): Promise<boolean> {
    try {
      await Promise.all(
        screenIds.map((screenId, index) =>
          db
            .update(screens)
            .set({ order: index })
            .where(and(eq(screens.id, screenId), eq(screens.onboardingId, onboardingId)))
        )
      );
      return true;
    } catch {
      return false;
    }
  }

  // Analytics
  async recordEvent(onboardingId: string, version: number, screenIndex: number, timestamp?: Date): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analyticsEvents)
      .values({
        onboardingId,
        onboardingVersion: version,
        screenIndex,
        timestamp: timestamp || new Date(),
      })
      .returning();
    return event;
  }

  async getOnboardingAnalytics(onboardingId: string): Promise<OnboardingAnalytics> {
    const events = await db
      .select({
        screenIndex: analyticsEvents.screenIndex,
        count: sql<number>`count(*)`,
      })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.onboardingId, onboardingId))
      .groupBy(analyticsEvents.screenIndex);
    
    const totalViews = events.reduce((sum, e) => sum + Number(e.count), 0);
    const screenViews = events.map((e) => ({
      screenIndex: e.screenIndex,
      views: Number(e.count),
    }));
    
    return { totalViews, screenViews };
  }
}

export const storage = new DatabaseStorage();
