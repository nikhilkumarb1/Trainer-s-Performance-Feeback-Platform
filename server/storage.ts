import { 
  User, InsertUser, 
  Trainer, InsertTrainer, 
  Session, InsertSession, 
  Feedback, InsertFeedback,
  users, trainers, sessions, feedback
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, inArray } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);
type SessionStore = session.Store;

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Trainer methods
  getTrainer(id: number): Promise<Trainer | undefined>;
  getTrainerByUserId(userId: number): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer | undefined>;
  getAllTrainers(): Promise<Trainer[]>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByTrainerId(trainerId: number): Promise<Session[]>;
  getAllSessions(): Promise<Session[]>;
  
  // Feedback methods
  getFeedback(id: number): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackBySessionId(sessionId: number): Promise<Feedback[]>;
  getFeedbackByTrainerId(trainerId: number): Promise<Feedback[]>;
  getFeedbackByTraineeId(traineeId: number): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
  
  // Session store for authentication
  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Initialize with sample data if needed
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if admin user exists
      const adminExists = await this.getUserByUsername("admin");
      if (!adminExists) {
        // Create admin user
        const adminUser = await this.createUser({
          username: "admin",
          password: "password", // This will be hashed in the auth layer
          fullName: "Admin User",
          role: "admin"
        });
      }

      // Check if primary trainer user exists
      const trainerExists = await this.getUserByUsername("trainer");
      let trainerUser;
      let trainer;
      
      if (!trainerExists) {
        // Create trainer user
        trainerUser = await this.createUser({
          username: "trainer",
          password: "password",
          fullName: "Sarah Johnson",
          role: "trainer"
        });

        // Create trainer profile
        trainer = await this.createTrainer({
          userId: trainerUser.id,
          department: "Engineering",
          specialty: "Technical Training"
        });
      } else {
        // Get trainer data
        trainerUser = trainerExists;
        const existingTrainer = await this.getTrainerByUserId(trainerUser.id);
        
        // Create trainer profile if it doesn't exist
        if (!existingTrainer) {
          trainer = await this.createTrainer({
            userId: trainerUser.id,
            department: "Engineering",
            specialty: "Technical Training"
          });
          console.log(`Created missing trainer profile for user ${trainerUser.username}`);
        } else {
          trainer = existingTrainer;
        }
      }

      // Create additional trainers
      const additionalTrainers = [
        {
          user: { 
            username: "trainer1", 
            password: "password", 
            fullName: "Michael Davis", 
            role: "trainer" as "trainer" 
          },
          profile: { department: "Design", specialty: "UX/UI Design" }
        },
        {
          user: { 
            username: "trainer2", 
            password: "password", 
            fullName: "Emily Wilson", 
            role: "trainer" as "trainer" 
          },
          profile: { department: "Data Science", specialty: "Machine Learning" }
        },
        {
          user: { 
            username: "trainer3", 
            password: "password", 
            fullName: "David Thompson", 
            role: "trainer" as "trainer" 
          },
          profile: { department: "DevOps", specialty: "Cloud Infrastructure" }
        }
      ];

      for (const t of additionalTrainers) {
        const existingUser = await this.getUserByUsername(t.user.username);
        if (!existingUser) {
          const user = await this.createUser(t.user);
          await this.createTrainer({
            userId: user.id,
            department: t.profile.department,
            specialty: t.profile.specialty
          });
        } else if (existingUser.role === "trainer") {
          // Ensure trainer profile exists for existing trainer users
          const existingTrainer = await this.getTrainerByUserId(existingUser.id);
          if (!existingTrainer) {
            await this.createTrainer({
              userId: existingUser.id,
              department: t.profile.department,
              specialty: t.profile.specialty
            });
            console.log(`Created missing trainer profile for user ${existingUser.username}`);
          }
        }
      }

      // Check if primary trainee user exists
      const traineeExists = await this.getUserByUsername("trainee");
      if (!traineeExists) {
        // Create trainee user
        await this.createUser({
          username: "trainee",
          password: "password",
          fullName: "John Smith",
          role: "trainee" as "trainee"
        });
      }
      
      // Create additional trainees
      const additionalTrainees = [
        { username: "trainee1", password: "password", fullName: "Lisa Brown", role: "trainee" as "trainee" },
        { username: "trainee2", password: "password", fullName: "Robert Garcia", role: "trainee" as "trainee" },
        { username: "trainee3", password: "password", fullName: "Jennifer Miller", role: "trainee" as "trainee" },
        { username: "trainee4", password: "password", fullName: "James Wilson", role: "trainee" as "trainee" },
        { username: "trainee5", password: "password", fullName: "Amanda Taylor", role: "trainee" as "trainee" }
      ];

      for (const t of additionalTrainees) {
        const existingUser = await this.getUserByUsername(t.username);
        if (!existingUser) {
          await this.createUser(t);
        }
      }
      
      // Check if we have any sessions
      const sessions = await this.getAllSessions();
      if (sessions.length === 0 && trainer) {
        // Create some sample sessions
        await this.createSession({
          title: "Introduction to JavaScript",
          trainerId: trainer.id,
          date: new Date(),
          description: "Learn the fundamentals of JavaScript programming language."
        });
        
        await this.createSession({
          title: "Advanced React Development",
          trainerId: trainer.id,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
          description: "Dive deep into advanced React concepts and best practices."
        });
        
        await this.createSession({
          title: "Database Design Fundamentals",
          trainerId: trainer.id,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks later
          description: "Understanding database design principles and normalization."
        });
      }

      // Create additional sessions for other trainers
      const allTrainers = await this.getAllTrainers();
      if (allTrainers.length > 1) {
        for (let i = 1; i < allTrainers.length; i++) {
          const otherTrainer = allTrainers[i];
          const trainerSessions = await this.getSessionsByTrainerId(otherTrainer.id);
          
          if (trainerSessions.length === 0) {
            // Create sessions for this trainer
            const sessionTitles = [
              "Cloud Computing Fundamentals",
              "Introduction to Artificial Intelligence",
              "Web Development Bootcamp",
              "Mobile App Development with React Native",
              "Cybersecurity Essentials"
            ];
            
            const sessionDescriptions = [
              "Learn the basics of cloud computing and popular platforms like AWS, Azure, and GCP.",
              "Understand the fundamentals of AI, machine learning, and neural networks.",
              "A comprehensive introduction to modern web development technologies.",
              "Build cross-platform mobile applications with React Native.",
              "Essential security practices for protecting applications and data."
            ];
            
            await this.createSession({
              title: sessionTitles[i % sessionTitles.length],
              trainerId: otherTrainer.id,
              date: new Date(Date.now() + (i * 3) * 24 * 60 * 60 * 1000), // Spread out dates
              description: sessionDescriptions[i % sessionDescriptions.length]
            });
          }
        }
      }
      // Find and create missing trainer profiles for all trainer users
      await this.createMissingTrainerProfiles();
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // Helper method to create trainer profiles for any existing trainer users
  private async createMissingTrainerProfiles() {
    try {
      // Query all users with role 'trainer'
      const trainerUsers = await db.select().from(users).where(eq(users.role, "trainer"));
      
      // For each trainer user, check if they have a trainer profile
      for (const user of trainerUsers) {
        const trainerProfile = await this.getTrainerByUserId(user.id);
        
        // If no trainer profile exists, create one
        if (!trainerProfile) {
          await this.createTrainer({
            userId: user.id,
            department: "General",
            specialty: "Training"
          });
          console.log(`Created missing trainer profile for user ${user.username}`);
        }
      }
    } catch (error) {
      console.error("Error creating missing trainer profiles:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Trainer methods
  async getTrainer(id: number): Promise<Trainer | undefined> {
    const [trainer] = await db.select().from(trainers).where(eq(trainers.id, id));
    return trainer;
  }

  async getTrainerByUserId(userId: number): Promise<Trainer | undefined> {
    const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
    return trainer;
  }

  async createTrainer(insertTrainer: InsertTrainer): Promise<Trainer> {
    const [trainer] = await db.insert(trainers).values(insertTrainer).returning();
    return trainer;
  }

  async getAllTrainers(): Promise<Trainer[]> {
    const trainersList = await db.select().from(trainers);
    return trainersList;
  }
  
  async updateTrainer(id: number, updates: Partial<Trainer>): Promise<Trainer | undefined> {
    const [updatedTrainer] = await db
      .update(trainers)
      .set(updates)
      .where(eq(trainers.id, id))
      .returning();
    return updatedTrainer;
  }

  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const sessionToInsert = {
      ...insertSession,
      date: insertSession.date || new Date()
    };
    const [session] = await db.insert(sessions).values(sessionToInsert).returning();
    return session;
  }

  async getSessionsByTrainerId(trainerId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.trainerId, trainerId));
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  // Feedback methods
  async getFeedback(id: number): Promise<Feedback | undefined> {
    const [feedbackItem] = await db.select().from(feedback).where(eq(feedback.id, id));
    return feedbackItem;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedbackToInsert = {
      ...insertFeedback,
      sentimentScore: this.calculateSentimentScore(insertFeedback.comments || ""),
      strengths: insertFeedback.strengths || [],
      improvements: insertFeedback.improvements || [],
      comments: insertFeedback.comments || null,
      createdAt: new Date()
    };
    const [feedbackItem] = await db.insert(feedback).values(feedbackToInsert).returning();
    return feedbackItem;
  }

  async getFeedbackBySessionId(sessionId: number): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.sessionId, sessionId));
  }

  async getFeedbackByTrainerId(trainerId: number): Promise<Feedback[]> {
    // Get all sessions for this trainer
    const trainerSessions = await this.getSessionsByTrainerId(trainerId);
    const sessionIds = trainerSessions.map(session => session.id);
    
    if (sessionIds.length === 0) return [];
    
    // Get all feedback for these sessions
    return await db.select().from(feedback).where(inArray(feedback.sessionId, sessionIds));
  }

  async getFeedbackByTraineeId(traineeId: number): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.traineeId, traineeId));
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback);
  }

  // Simple sentiment analysis (for demo purposes)
  private calculateSentimentScore(comment: string): number {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful', 
      'helpful', 'informative', 'clear', 'engaging', 'knowledgeable', 'friendly'
    ];
    const negativeWords = [
      'bad', 'poor', 'terrible', 'awful', 'confusing', 'boring', 
      'unhelpful', 'unclear', 'disorganized', 'rushed', 'disappointing'
    ];
    
    const lowerComment = comment.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerComment.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerComment.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    // Calculate percentage (50 is neutral)
    if (positiveCount === 0 && negativeCount === 0) return 50;
    
    const total = positiveCount + negativeCount;
    const score = Math.round((positiveCount / total) * 100);
    return score;
  }
}

export const storage = new DatabaseStorage();
