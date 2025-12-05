import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
  insertUserSchema, 
  loginSchema, 
  insertProjectSchema, 
  insertOnboardingSchema, 
  insertScreenSchema, 
  updateScreenSchema,
  insertAnalyticsEventSchema 
} from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "onboarding-constructor-secret-key";

interface AuthRequest extends Request {
  userId?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const { email, password } = result.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, createdAt: user.createdAt } 
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const { email, password } = result.data;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, createdAt: user.createdAt } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Projects routes
  app.get("/api/projects", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const projects = await storage.getProjects(req.userId!);
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id, req.userId!);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/projects", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const project = await storage.createProject(req.userId!, result.data);
      res.json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const result = insertProjectSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const project = await storage.updateProject(req.params.id, req.userId!, result.data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id, req.userId!);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Onboardings routes
  app.get("/api/projects/:id/onboardings", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id, req.userId!);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const onboardingsList = await storage.getOnboardingsByProject(req.params.id);
      res.json(onboardingsList);
    } catch (error) {
      console.error("Get onboardings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/projects/:id/onboardings", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id, req.userId!);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const result = insertOnboardingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const onboarding = await storage.createOnboarding(req.params.id, result.data);
      res.json(onboarding);
    } catch (error) {
      console.error("Create onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/onboardings/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const onboarding = await storage.getOnboarding(req.params.id);
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      res.json(onboarding);
    } catch (error) {
      console.error("Get onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/onboardings/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const result = insertOnboardingSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const onboarding = await storage.updateOnboarding(req.params.id, result.data);
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      res.json(onboarding);
    } catch (error) {
      console.error("Update onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/onboardings/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteOnboarding(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/onboardings/:id/publish", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const onboarding = await storage.publishOnboarding(req.params.id);
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      res.json(onboarding);
    } catch (error) {
      console.error("Publish onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/onboardings/:id/analytics", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getOnboardingAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Screens routes
  app.post("/api/onboardings/:id/screens", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const result = insertScreenSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const screen = await storage.createScreen(req.params.id, result.data);
      res.json(screen);
    } catch (error) {
      console.error("Create screen error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/screens/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const result = updateScreenSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const screen = await storage.updateScreen(req.params.id, result.data);
      if (!screen) {
        return res.status(404).json({ message: "Screen not found" });
      }
      res.json(screen);
    } catch (error) {
      console.error("Update screen error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/screens/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteScreen(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Screen not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete screen error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/onboardings/:id/reorder", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { screenIds } = req.body;
      if (!Array.isArray(screenIds)) {
        return res.status(400).json({ message: "screenIds must be an array" });
      }
      
      const success = await storage.reorderScreens(req.params.id, screenIds);
      if (!success) {
        return res.status(500).json({ message: "Failed to reorder screens" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Reorder screens error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Public API routes (no auth required)
  app.get("/api/public/onboarding", async (req, res) => {
    try {
      const apiKey = req.query.api_key as string;
      if (!apiKey) {
        return res.status(400).json({ message: "api_key is required" });
      }
      
      const result = await storage.getPublishedOnboarding(apiKey);
      if (!result) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      
      const config = {
        version: result.version,
        screens: result.screens.map((s) => ({
          type: s.type,
          title: s.title,
          description: s.description,
          image_url: s.imageUrl,
        })),
      };
      
      res.json(config);
    } catch (error) {
      console.error("Get public onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/public/event", async (req, res) => {
    try {
      const result = insertAnalyticsEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const { api_key, onboarding_version, screen_index, timestamp } = result.data;
      
      const project = await storage.getProjectByApiKey(api_key);
      if (!project) {
        return res.status(404).json({ message: "Invalid API key" });
      }
      
      const onboardingsList = await storage.getOnboardingsByProject(project.id);
      const publishedOnboarding = onboardingsList.find(
        (o) => o.status === "published" && o.version === onboarding_version
      );
      
      if (!publishedOnboarding) {
        return res.status(404).json({ message: "Onboarding version not found" });
      }
      
      await storage.recordEvent(
        publishedOnboarding.id,
        onboarding_version,
        screen_index,
        timestamp ? new Date(timestamp) : undefined
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Record event error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
