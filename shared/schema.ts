import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["admin", "trainer", "trainee"] }).notNull().default("trainee"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Trainer schema
export const trainers = pgTable("trainers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  department: text("department").notNull(),
  specialty: text("specialty").notNull(),
});

export const insertTrainerSchema = createInsertSchema(trainers).pick({
  userId: true,
  department: true,
  specialty: true,
});

// Session schema
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  trainerId: integer("trainer_id").notNull().references(() => trainers.id),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  title: true,
  trainerId: true,
  date: true,
  description: true,
});

// Feedback schema
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  traineeId: integer("trainee_id").notNull().references(() => users.id),
  overallRating: integer("overall_rating").notNull(),
  knowledgeRating: integer("knowledge_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  materialsRating: integer("materials_rating").notNull(),
  engagementRating: integer("engagement_rating").notNull(),
  comments: text("comments"),
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  sentimentScore: integer("sentiment_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  sessionId: true,
  traineeId: true,
  overallRating: true,
  knowledgeRating: true,
  communicationRating: true,
  materialsRating: true,
  engagementRating: true,
  comments: true,
  strengths: true,
  improvements: true,
});

// Define export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Trainer = typeof trainers.$inferSelect;
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
