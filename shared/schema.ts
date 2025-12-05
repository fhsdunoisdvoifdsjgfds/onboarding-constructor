import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  publicApiKey: varchar("public_api_key", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  onboardings: many(onboardings),
}));

// Onboardings table
export const onboardings = pgTable("onboardings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").default(0).notNull(),
  status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const onboardingsRelations = relations(onboardings, ({ one, many }) => ({
  project: one(projects, {
    fields: [onboardings.projectId],
    references: [projects.id],
  }),
  screens: many(screens),
  analyticsEvents: many(analyticsEvents),
}));

// Screens table
export const screens = pgTable("screens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  onboardingId: varchar("onboarding_id", { length: 36 }).notNull().references(() => onboardings.id, { onDelete: "cascade" }),
  type: text("type").default("default").notNull(),
  title: text("title").default("").notNull(),
  description: text("description").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const screensRelations = relations(screens, ({ one }) => ({
  onboarding: one(onboardings, {
    fields: [screens.onboardingId],
    references: [onboardings.id],
  }),
}));

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  onboardingId: varchar("onboarding_id", { length: 36 }).notNull().references(() => onboardings.id, { onDelete: "cascade" }),
  onboardingVersion: integer("onboarding_version").notNull(),
  screenIndex: integer("screen_index").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  onboarding: one(onboardings, {
    fields: [analyticsEvents.onboardingId],
    references: [onboardings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
});

export const insertOnboardingSchema = createInsertSchema(onboardings).pick({
  name: true,
});

export const insertScreenSchema = createInsertSchema(screens).pick({
  title: true,
  description: true,
  imageUrl: true,
});

export const updateScreenSchema = createInsertSchema(screens).pick({
  title: true,
  description: true,
  imageUrl: true,
}).partial();

export const insertAnalyticsEventSchema = z.object({
  api_key: z.string(),
  onboarding_version: z.number(),
  screen_index: z.number(),
  timestamp: z.number().optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboardings.$inferSelect;

export type InsertScreen = z.infer<typeof insertScreenSchema>;
export type UpdateScreen = z.infer<typeof updateScreenSchema>;
export type Screen = typeof screens.$inferSelect;

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Screen config type for public API
export type ScreenConfig = {
  type: string;
  title: string;
  description: string;
  image_url: string;
};

export type OnboardingConfig = {
  version: number;
  screens: ScreenConfig[];
};

// Analytics summary types
export type ScreenAnalytics = {
  screenIndex: number;
  views: number;
};

export type OnboardingAnalytics = {
  totalViews: number;
  screenViews: ScreenAnalytics[];
};
