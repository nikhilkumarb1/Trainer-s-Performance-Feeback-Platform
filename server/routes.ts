import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertSessionSchema, insertFeedbackSchema, insertTrainerSchema } from "@shared/schema";
import { z } from "zod";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Role-based authentication middleware
function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API Routes
  // Sessions
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", hasRole(["admin", "trainer"]), async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Trainers
  app.get("/api/trainers", isAuthenticated, async (req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
      
      // Get user details for each trainer
      const trainersWithDetails = await Promise.all(
        trainers.map(async (trainer) => {
          const user = await storage.getUser(trainer.userId);
          return {
            ...trainer,
            fullName: user?.fullName,
            username: user?.username
          };
        })
      );
      
      res.json(trainersWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trainers" });
    }
  });
  
  // Get trainer by userId
  app.get("/api/trainers/by-user/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const trainer = await storage.getTrainerByUserId(userId);
      
      if (!trainer) {
        return res.status(404).json({ error: "Trainer profile not found" });
      }
      
      // Get user details
      const user = await storage.getUser(trainer.userId);
      
      res.json({
        ...trainer,
        fullName: user?.fullName,
        username: user?.username
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trainer profile" });
    }
  });

  app.post("/api/trainers", hasRole(["admin"]), async (req, res) => {
    try {
      const trainerData = insertTrainerSchema.parse(req.body);
      const trainer = await storage.createTrainer(trainerData);
      res.status(201).json(trainer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trainer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create trainer" });
    }
  });
  
  // Update trainer profile
  app.patch("/api/trainers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trainer = await storage.getTrainer(id);
      
      if (!trainer) {
        return res.status(404).json({ error: "Trainer not found" });
      }
      
      // Only allow the trainer to update their own profile or admins to update any profile
      if (req.user && trainer.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden - You can only update your own trainer profile" });
      }
      
      const updates = {
        ...req.body
      };
      
      const updatedTrainer = await storage.updateTrainer(id, updates);
      
      if (!updatedTrainer) {
        return res.status(404).json({ error: "Failed to update trainer profile" });
      }
      
      res.json(updatedTrainer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trainer profile" });
    }
  });

  // Feedback
  app.get("/api/feedback", hasRole(["admin"]), async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", hasRole(["trainee"]), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        traineeId: req.user.id
      });
      
      const feedback = await storage.createFeedback(validatedData);
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Feedback submission error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid feedback data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback/session/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const feedback = await storage.getFeedbackBySessionId(sessionId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/trainer/:trainerId", hasRole(["admin", "trainer"]), async (req, res) => {
    try {
      const trainerId = parseInt(req.params.trainerId);
      
      // If trainer is requesting their own feedback
      if (req.user && req.user.role === "trainer") {
        const trainer = await storage.getTrainerByUserId(req.user.id);
        if (!trainer || trainer.id !== trainerId) {
          return res.status(403).json({ error: "Forbidden - You can only view your own feedback" });
        }
      }
      
      const feedback = await storage.getFeedbackByTrainerId(trainerId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/trainee", hasRole(["trainee"]), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const feedback = await storage.getFeedbackByTraineeId(req.user.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = req.user;
      
      if (user.role === "admin") {
        // Admin dashboard data
        const feedback = await storage.getAllFeedback();
        const trainers = await storage.getAllTrainers();
        const sessions = await storage.getAllSessions();
        
        const metrics = {
          totalTrainers: trainers.length,
          totalFeedback: feedback.length,
          avgRating: calculateAvgRating(feedback),
          sentimentScore: calculateAvgSentiment(feedback)
        };
        
        res.json({
          metrics,
          trainers,
          feedback,
          sessions
        });
      } 
      else if (user.role === "trainer") {
        // Trainer dashboard data
        const trainer = await storage.getTrainerByUserId(user.id);
        
        if (!trainer) {
          return res.status(404).json({ error: "Trainer profile not found" });
        }
        
        const feedback = await storage.getFeedbackByTrainerId(trainer.id);
        const sessions = await storage.getSessionsByTrainerId(trainer.id);
        
        const metrics = {
          totalSessions: sessions.length,
          totalFeedback: feedback.length,
          avgRating: calculateAvgRating(feedback),
          sentimentScore: calculateAvgSentiment(feedback)
        };
        
        res.json({
          metrics,
          feedback,
          sessions
        });
      }
      else {
        // Trainee dashboard data
        const sessions = await storage.getAllSessions();
        const feedback = await storage.getFeedbackByTraineeId(user.id);
        
        res.json({
          sessions,
          submittedFeedback: feedback
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function calculateAvgRating(feedback: any[]): number {
  if (feedback.length === 0) return 0;
  
  const sum = feedback.reduce((acc, item) => acc + item.overallRating, 0);
  return parseFloat((sum / feedback.length).toFixed(1));
}

function calculateAvgSentiment(feedback: any[]): number {
  if (feedback.length === 0) return 50; // Neutral
  
  const validFeedback = feedback.filter(item => item.sentimentScore !== undefined);
  if (validFeedback.length === 0) return 50;
  
  const sum = validFeedback.reduce((acc, item) => acc + item.sentimentScore, 0);
  return Math.round(sum / validFeedback.length);
}
