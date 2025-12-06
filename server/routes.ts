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
      
      const { template, ...onboardingData } = req.body;
      const result = insertOnboardingSchema.safeParse(onboardingData);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
      }
      
      const onboarding = await storage.createOnboarding(req.params.id, result.data);
      
      // If template provided, create screens from template
      if (template && template.screens && Array.isArray(template.screens)) {
        for (let i = 0; i < template.screens.length; i++) {
          const templateScreen = template.screens[i];
          const screen = await storage.createScreen(onboarding.id, {
            title: templateScreen.title || `Screen ${i + 1}`,
            description: templateScreen.description || "",
            imageUrl: "",
          });
          // Update screen with widgets and layout
          if (templateScreen.widgets || templateScreen.layout) {
            await storage.updateScreen(screen.id, {
              widgets: templateScreen.widgets || [],
              layout: templateScreen.layout || {},
            });
          }
        }
      }
      
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
          widgets: (s.widgets || []).map((w: any) => ({
            ...w,
            url: w.url || undefined,
          })),
          layout: {
            background_color: s.layout?.backgroundColor,
            background_image: s.layout?.backgroundImage,
            padding: s.layout?.padding,
            vertical_alignment: s.layout?.verticalAlignment,
          },
        })),
      };
      
      res.json(config);
    } catch (error) {
      console.error("Get public onboarding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // AI Generate Screens endpoint
  app.post("/api/ai/generate-screens", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
      }
      
      const systemPrompt = `You are an expert mobile app onboarding screen designer. Generate beautiful, professional onboarding screens based on user descriptions.

You MUST respond with ONLY a valid JSON array (no markdown, no code blocks, no explanation). Each screen object must have:
- title: string (screen title)
- description: string (brief description for internal use)
- widgets: array of widget objects
- layout: object with screen styling

Widget types and their properties:
1. text: { type: "text", id: string, order: number, name: string, content: string, fontSize: number (14-32), fontWeight: "400"|"500"|"600"|"700", textAlign: "left"|"center"|"right", color?: string (hex), fontFamily: "Inter" }
2. button: { type: "button", id: string, order: number, name: string, label: string, variant: "primary"|"outline"|"ghost", action: "next"|"close", fullWidth: boolean, backgroundColor?: string, textColor?: string, borderRadius: number (8-16), fontSize: 16, fontWeight: "600", height: 48-56 }
3. icon: { type: "icon", id: string, order: number, name: string, iconName: string (Lucide icon names: Star, Heart, Rocket, Shield, Sparkles, CheckCircle, Zap, Target, Crown, Gift, Bell, User, Settings, ArrowRight, ChevronRight, Plus, Check, X, Home, Search, Mail, Phone, Camera, Image, Music, Video, Play, Pause, Volume2, Sun, Moon, Cloud, Umbrella, Flame, Droplet, Wind, Leaf, Flower2, TreePine, Mountain, Waves, Compass, Map, Navigation, Plane, Car, Bike, Train, Ship, Building, Store, Briefcase, GraduationCap, BookOpen, Lightbulb, Cpu, Globe, Wifi, Lock, Key, Eye, EyeOff, ThumbsUp, MessageCircle, Send, Share2, Download, Upload, Trash2, Edit, Copy, Clipboard, Link, Calendar, Clock, Timer, Alarm, Trophy, Medal, Award, Flag, Bookmark, Tag, Hash, AtSign, Percent, DollarSign, CreditCard, Wallet, ShoppingCart, Package, Box, Archive, Folder, File, FileText, Layers, Grid, List, BarChart2, PieChart, TrendingUp, Activity, Heart, HeartPulse, Stethoscope, Pill, Syringe, Apple, Coffee, Pizza, UtensilsCrossed, Wine, Beer, Cake, Cookie, IceCream, Salad, Dumbbell, PersonStanding, Footprints, Volleyball, Football, Basketball, Baseball, Tennis, Gamepad2, Dice1, Dice6, Ghost, Skull, Bug, Cat, Dog, Bird, Fish, Rabbit, Turtle, Paw, Bone, Feather, PalmTree, Cactus, Sprout, Clover, Mushroom, Shell, Gem, Diamond, Coins, PiggyBank, Banknote, Receipt, TicketCheck, Megaphone, Radio, Mic, Headphones, Speaker, Monitor, Smartphone, Tablet, Laptop, Mouse, Keyboard, Watch, Tv, Gamepad, Joystick, Puzzle, Shapes, SquareStack, Layers2, CircleDot, Hexagon, Triangle, Pentagon, Octagon, Star, StarHalf, Sparkle, Wand2, Magic, Palette, Brush, PenTool, Scissors, Ruler, Pencil, Eraser, Highlighter, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Quote, Code, Terminal, Database, Server, HardDrive, Usb, Cable, Plug, Power, BatteryFull, BatteryMedium, BatteryLow, BatteryCharging, Zap, Lightning, Bolt, Flash, Flame, Fire, Droplet, Water, Snowflake, CloudRain, CloudSnow, CloudSun, CloudMoon, Sunrise, Sunset, Thermometer, Wind, Tornado, Rainbow, Umbrella), size: number (32-64), color: string (hex) }
4. spacer: { type: "spacer", id: string, order: number, name: string, height: number (12-80) }
5. image: { type: "image", id: string, order: number, name: string, url: string (use placeholder like "https://images.unsplash.com/photo-..." or leave empty ""), width: string ("100%" or "180px"), height: string ("180px"-"240px"), borderRadius: number (0-90), objectFit: "cover"|"contain" }
6. divider: { type: "divider", id: string, order: number, name: string, color: string, thickness: number, style: "solid"|"dashed", width: "100%" }

Layout object properties:
- backgroundColor: string (hex color, e.g., "#ffffff", "#1a1a2e", "#f0f9ff")
- backgroundGradient?: { enabled: true, type: "linear", angle: number, stops: [{ color: string, position: number }] }
- padding: number (20-32)
- verticalAlignment: "start"|"center"|"end"
- safeAreaTop: boolean
- safeAreaBottom: boolean

IMPORTANT RULES:
1. Generate unique IDs using format like "w1-1", "w1-2", etc.
2. Use order starting from 0
3. Create visually appealing screens with proper spacing
4. Use icons strategically to enhance visual appeal
5. Use professional color schemes
6. For gradients, use subtle, modern combinations
7. Buttons should typically be at the end with proper spacing before them
8. Generate 1-5 screens based on the request

Example response format:
[{"title":"Welcome","description":"Welcome screen","widgets":[{"type":"spacer","id":"w1-1","order":0,"name":"Top Spacer","height":60},{"type":"icon","id":"w1-2","order":1,"name":"Main Icon","iconName":"Rocket","size":56,"color":"#6366f1"},{"type":"spacer","id":"w1-3","order":2,"name":"Spacer","height":24},{"type":"text","id":"w1-4","order":3,"name":"Title","content":"Welcome to Our App","fontSize":28,"fontWeight":"700","textAlign":"center","fontFamily":"Inter"},{"type":"spacer","id":"w1-5","order":4,"name":"Spacer","height":12},{"type":"text","id":"w1-6","order":5,"name":"Description","content":"Start your journey with us today","fontSize":16,"fontWeight":"400","textAlign":"center","color":"#6b7280","fontFamily":"Inter"},{"type":"spacer","id":"w1-7","order":6,"name":"Bottom Spacer","height":48},{"type":"button","id":"w1-8","order":7,"name":"Primary Button","label":"Get Started","variant":"primary","action":"next","fullWidth":true,"borderRadius":12,"fontSize":16,"fontWeight":"600","height":52}],"layout":{"backgroundColor":"#ffffff","padding":24,"verticalAlignment":"center","safeAreaTop":true,"safeAreaBottom":true}}]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { text: `User request: ${prompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Gemini API error:", errorData);
        return res.status(500).json({ message: "Failed to generate screens from AI" });
      }

      const data = await response.json();
      
      const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        return res.status(500).json({ message: "No content generated from AI" });
      }

      let screens;
      try {
        let jsonStr = textContent.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/```\s*$/, "");
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```\s*/, "").replace(/```\s*$/, "");
        }
        screens = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse AI response:", textContent);
        return res.status(500).json({ message: "Failed to parse AI response as JSON" });
      }

      if (!Array.isArray(screens)) {
        return res.status(500).json({ message: "AI response is not an array of screens" });
      }

      res.json({ screens });
    } catch (error) {
      console.error("AI generate screens error:", error);
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
