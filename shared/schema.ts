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

// Widget types for screen builder
export const widgetTypeEnum = z.enum([
  "text",
  "image", 
  "button",
  "spacer",
  "icon",
  "container",
  "lottie",
]);

export type WidgetType = z.infer<typeof widgetTypeEnum>;

// Base widget schema
const baseWidgetSchema = z.object({
  id: z.string(),
  type: widgetTypeEnum,
  order: z.number(),
});

// Text widget
export const textWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  fontSize: z.number().optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
  color: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  marginTop: z.number().optional(),
  marginBottom: z.number().optional(),
});

// Image widget
export const imageWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("image"),
  url: z.string(),
  width: z.string().optional(),
  height: z.string().optional(),
  borderRadius: z.number().optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
});

// Button widget
export const buttonWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("button"),
  label: z.string(),
  action: z.enum(["next", "skip", "url", "custom"]).optional(),
  actionValue: z.string().optional(),
  variant: z.enum(["primary", "secondary", "outline", "ghost"]).optional(),
  fullWidth: z.boolean().optional(),
  borderRadius: z.number().optional(),
});

// Spacer widget  
export const spacerWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("spacer"),
  height: z.number(),
});

// Icon widget
export const iconWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("icon"),
  name: z.string(),
  size: z.number().optional(),
  color: z.string().optional(),
});

// Container widget (for grouping)
export const containerWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("container"),
  backgroundColor: z.string().optional(),
  padding: z.number().optional(),
  borderRadius: z.number().optional(),
  children: z.array(z.any()).optional(),
});

// Lottie animation widget
export const lottieWidgetSchema = baseWidgetSchema.extend({
  type: z.literal("lottie"),
  url: z.string(),
  width: z.string().optional(),
  height: z.string().optional(),
  loop: z.boolean().optional(),
  autoplay: z.boolean().optional(),
});

// Union of all widget types
export const widgetSchema = z.discriminatedUnion("type", [
  textWidgetSchema,
  imageWidgetSchema,
  buttonWidgetSchema,
  spacerWidgetSchema,
  iconWidgetSchema,
  containerWidgetSchema,
  lottieWidgetSchema,
]);

export type Widget = z.infer<typeof widgetSchema>;
export type TextWidget = z.infer<typeof textWidgetSchema>;
export type ImageWidget = z.infer<typeof imageWidgetSchema>;
export type ButtonWidget = z.infer<typeof buttonWidgetSchema>;
export type SpacerWidget = z.infer<typeof spacerWidgetSchema>;
export type IconWidget = z.infer<typeof iconWidgetSchema>;
export type ContainerWidget = z.infer<typeof containerWidgetSchema>;
export type LottieWidget = z.infer<typeof lottieWidgetSchema>;

// Screen layout settings
export const screenLayoutSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  padding: z.number().optional(),
  verticalAlignment: z.enum(["start", "center", "end", "space-between"]).optional(),
});

export type ScreenLayout = z.infer<typeof screenLayoutSchema>;

// Screens table
export const screens = pgTable("screens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  onboardingId: varchar("onboarding_id", { length: 36 }).notNull().references(() => onboardings.id, { onDelete: "cascade" }),
  type: text("type").default("default").notNull(),
  title: text("title").default("").notNull(),
  description: text("description").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  widgets: jsonb("widgets").$type<Widget[]>().default([]),
  layout: jsonb("layout").$type<ScreenLayout>().default({}),
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

export const updateScreenSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  widgets: z.array(widgetSchema).optional(),
  layout: screenLayoutSchema.optional(),
});

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

// Widget config type for public API (serialized format)
export type WidgetConfig = {
  id: string;
  type: string;
  order: number;
  [key: string]: unknown;
};

// Screen config type for public API
export type ScreenConfig = {
  type: string;
  title: string;
  description: string;
  image_url: string;
  widgets: WidgetConfig[];
  layout: {
    background_color?: string;
    background_image?: string;
    padding?: number;
    vertical_alignment?: string;
  };
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
