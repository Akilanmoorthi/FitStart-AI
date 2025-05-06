import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  goal: text("goal"),
  weight: integer("weight"),
  height: integer("height"),
  bodyType: text("body_type"),
  activityLevel: text("activity_level"),
  dietaryPreferences: text("dietary_preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
  exercises: json("exercises").notNull(),
});

// Exercise schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  muscleGroup: text("muscle_group"),
  videoUrl: text("video_url"),
});

// Diet schema
export const diets = pgTable("diets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  totalCalories: integer("total_calories"),
  meals: json("meals").notNull(),
});

// Progress schema
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  weight: integer("weight"),
  bodyFat: integer("body_fat"),
  mood: text("mood"),
  note: text("note"),
});

// Achievement schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlocked_at").notNull(),
  iconName: text("icon_name"),
});

// Schedule schema
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  activities: json("activities").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  goal: true,
  weight: true,
  height: true,
  bodyType: true,
  activityLevel: true,
  dietaryPreferences: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  userId: true,
  name: true,
  type: true,
  duration: true,
  date: true,
  exercises: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  type: true,
  description: true,
  muscleGroup: true,
  videoUrl: true,
});

export const insertDietSchema = createInsertSchema(diets).pick({
  userId: true,
  date: true,
  totalCalories: true,
  meals: true,
});

export const insertProgressSchema = createInsertSchema(progress).pick({
  userId: true,
  date: true,
  weight: true,
  bodyFat: true,
  mood: true,
  note: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  name: true,
  description: true,
  unlockedAt: true,
  iconName: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  userId: true,
  date: true,
  activities: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertDiet = z.infer<typeof insertDietSchema>;
export type Diet = typeof diets.$inferSelect;

export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Additional types for frontend
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Meal = {
  id: number;
  name: string;
  type: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
};

export type ExerciseItem = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed: boolean;
};

export type ScheduleActivity = {
  id: number;
  time: string;
  name: string;
  description?: string;
  type: 'workout' | 'meal' | 'other';
};

export type UserStat = {
  id: string;
  name: string;
  value: string;
  icon: string;
  color: string;
};
