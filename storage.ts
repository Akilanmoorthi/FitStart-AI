import {
  users, workouts, exercises, diets, progress, achievements, schedules,
  type User, type InsertUser,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type Diet, type InsertDiet,
  type Progress, type InsertProgress,
  type Achievement, type InsertAchievement,
  type Schedule, type InsertSchedule
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, count } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Workout operations
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  getWorkoutById(id: number): Promise<Workout | undefined>;
  updateWorkout(id: number, workoutData: Partial<Workout>): Promise<Workout | undefined>;
  getWorkoutsByDate(userId: number, date: Date): Promise<Workout[]>;

  // Exercise operations
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]>;
  getAllExercises(): Promise<Exercise[]>;

  // Diet operations
  createDiet(diet: InsertDiet): Promise<Diet>;
  getDietsByUserId(userId: number): Promise<Diet[]>;
  getDietByDate(userId: number, date: Date): Promise<Diet | undefined>;
  updateDiet(id: number, dietData: Partial<Diet>): Promise<Diet | undefined>;

  // Progress operations
  createProgress(progressData: InsertProgress): Promise<Progress>;
  getProgressByUserId(userId: number): Promise<Progress[]>;
  getProgressByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Progress[]>;

  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  getAchievementByType(userId: number, type: string): Promise<Achievement | undefined>;

  // Schedule operations
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getScheduleByDate(userId: number, date: Date): Promise<Schedule | undefined>;
  getSchedulesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Schedule[]>;
  updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private diets: Map<number, Diet>;
  private progresses: Map<number, Progress>;
  private achievements: Map<number, Achievement>;
  private schedules: Map<number, Schedule>;
  
  // ID counters
  private userIdCounter: number;
  private workoutIdCounter: number;
  private exerciseIdCounter: number;
  private dietIdCounter: number;
  private progressIdCounter: number;
  private achievementIdCounter: number;
  private scheduleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.diets = new Map();
    this.progresses = new Map();
    this.achievements = new Map();
    this.schedules = new Map();

    this.userIdCounter = 1;
    this.workoutIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.dietIdCounter = 1;
    this.progressIdCounter = 1;
    this.achievementIdCounter = 1;
    this.scheduleIdCounter = 1;

    // Initialize with some sample exercises
    this.initializeExercises();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(
      (workout) => workout.userId === userId,
    );
  }

  async getWorkoutById(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async updateWorkout(id: number, workoutData: Partial<Workout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, ...workoutData };
    this.workouts.set(id, updatedWorkout);
    
    return updatedWorkout;
  }

  async getWorkoutsByDate(userId: number, date: Date): Promise<Workout[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.workouts.values()).filter(
      (workout) => {
        const workoutDate = new Date(workout.date);
        return workout.userId === userId && 
               workoutDate.toISOString().split('T')[0] === dateString;
      }
    );
  }

  // Exercise operations
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.muscleGroup === muscleGroup,
    );
  }

  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  // Diet operations
  async createDiet(diet: InsertDiet): Promise<Diet> {
    const id = this.dietIdCounter++;
    const newDiet: Diet = { ...diet, id };
    this.diets.set(id, newDiet);
    return newDiet;
  }

  async getDietsByUserId(userId: number): Promise<Diet[]> {
    return Array.from(this.diets.values()).filter(
      (diet) => diet.userId === userId,
    );
  }

  async getDietByDate(userId: number, date: Date): Promise<Diet | undefined> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.diets.values()).find(
      (diet) => {
        const dietDate = new Date(diet.date);
        return diet.userId === userId && 
               dietDate.toISOString().split('T')[0] === dateString;
      }
    );
  }

  async updateDiet(id: number, dietData: Partial<Diet>): Promise<Diet | undefined> {
    const diet = this.diets.get(id);
    if (!diet) return undefined;
    
    const updatedDiet = { ...diet, ...dietData };
    this.diets.set(id, updatedDiet);
    
    return updatedDiet;
  }

  // Progress operations
  async createProgress(progressData: InsertProgress): Promise<Progress> {
    const id = this.progressIdCounter++;
    const newProgress: Progress = { ...progressData, id };
    this.progresses.set(id, newProgress);
    return newProgress;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return Array.from(this.progresses.values())
      .filter((progress) => progress.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getProgressByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Progress[]> {
    return Array.from(this.progresses.values())
      .filter((progress) => {
        const progressDate = new Date(progress.date);
        return progress.userId === userId && 
               progressDate >= startDate && 
               progressDate <= endDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Achievement operations
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }

  async getAchievementByType(userId: number, type: string): Promise<Achievement | undefined> {
    return Array.from(this.achievements.values()).find(
      (achievement) => achievement.userId === userId && achievement.type === type,
    );
  }

  // Schedule operations
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const newSchedule: Schedule = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async getScheduleByDate(userId: number, date: Date): Promise<Schedule | undefined> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.schedules.values()).find(
      (schedule) => {
        const scheduleDate = new Date(schedule.date);
        return schedule.userId === userId && 
               scheduleDate.toISOString().split('T')[0] === dateString;
      }
    );
  }

  async getSchedulesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Schedule[]> {
    return Array.from(this.schedules.values())
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return schedule.userId === userId && 
               scheduleDate >= startDate && 
               scheduleDate <= endDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...scheduleData };
    this.schedules.set(id, updatedSchedule);
    
    return updatedSchedule;
  }

  // Initialize sample exercises
  private initializeExercises() {
    const exercisesData: InsertExercise[] = [
      {
        name: "Bench Press",
        type: "strength",
        description: "Lie on bench and press barbell upward",
        muscleGroup: "chest",
        videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg"
      },
      {
        name: "Shoulder Press",
        type: "strength",
        description: "Press barbell or dumbbells overhead",
        muscleGroup: "shoulders",
        videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog"
      },
      {
        name: "Tricep Pushdown",
        type: "isolation",
        description: "Pull cable downward to work triceps",
        muscleGroup: "arms",
        videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU"
      },
      {
        name: "Squat",
        type: "compound",
        description: "Lower your body by bending knees and hips",
        muscleGroup: "legs",
        videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8"
      },
      {
        name: "Deadlift",
        type: "compound",
        description: "Lift barbell from ground in hinging motion",
        muscleGroup: "back",
        videoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q"
      }
    ];

    exercisesData.forEach(exercise => {
      const id = this.exerciseIdCounter++;
      const newExercise: Exercise = { ...exercise, id };
      this.exercises.set(id, newExercise);
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db
      .insert(workouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId));
  }

  async getWorkoutById(id: number): Promise<Workout | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id));
    return workout;
  }

  async updateWorkout(id: number, workoutData: Partial<Workout>): Promise<Workout | undefined> {
    const [updatedWorkout] = await db
      .update(workouts)
      .set(workoutData)
      .where(eq(workouts.id, id))
      .returning();
    return updatedWorkout;
  }

  async getWorkoutsByDate(userId: number, date: Date): Promise<Workout[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.date, startOfDay),
          lte(workouts.date, endOfDay)
        )
      );
  }

  // Exercise operations
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    return newExercise;
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));
    return exercise;
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.muscleGroup, muscleGroup));
  }

  async getAllExercises(): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises);
  }

  // Diet operations
  async createDiet(diet: InsertDiet): Promise<Diet> {
    const [newDiet] = await db
      .insert(diets)
      .values(diet)
      .returning();
    return newDiet;
  }

  async getDietsByUserId(userId: number): Promise<Diet[]> {
    return await db
      .select()
      .from(diets)
      .where(eq(diets.userId, userId));
  }

  async getDietByDate(userId: number, date: Date): Promise<Diet | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [diet] = await db
      .select()
      .from(diets)
      .where(
        and(
          eq(diets.userId, userId),
          gte(diets.date, startOfDay),
          lte(diets.date, endOfDay)
        )
      );
    return diet;
  }

  async updateDiet(id: number, dietData: Partial<Diet>): Promise<Diet | undefined> {
    const [updatedDiet] = await db
      .update(diets)
      .set(dietData)
      .where(eq(diets.id, id))
      .returning();
    return updatedDiet;
  }

  // Progress operations
  async createProgress(progressData: InsertProgress): Promise<Progress> {
    const [newProgress] = await db
      .insert(progress)
      .values(progressData)
      .returning();
    return newProgress;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .orderBy(desc(progress.date));
  }

  async getProgressByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          gte(progress.date, startDate),
          lte(progress.date, endDate)
        )
      )
      .orderBy(asc(progress.date));
  }

  // Achievement operations
  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievementData)
      .returning();
    return newAchievement;
  }

  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  async getAchievementByType(userId: number, type: string): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.type, type)
        )
      );
    return achievement;
  }

  // Schedule operations
  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db
      .insert(schedules)
      .values(scheduleData)
      .returning();
    return newSchedule;
  }

  async getScheduleByDate(userId: number, date: Date): Promise<Schedule | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.userId, userId),
          gte(schedules.date, startOfDay),
          lte(schedules.date, endOfDay)
        )
      );
    return schedule;
  }

  async getSchedulesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Schedule[]> {
    return await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.userId, userId),
          gte(schedules.date, startDate),
          lte(schedules.date, endDate)
        )
      )
      .orderBy(asc(schedules.date));
  }

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined> {
    const [updatedSchedule] = await db
      .update(schedules)
      .set(scheduleData)
      .where(eq(schedules.id, id))
      .returning();
    return updatedSchedule;
  }
}

// Initialize and populate database
async function initializeDatabase() {
  try {
    // Check if exercises table is empty
    const exerciseCount = await db.select({ count: count() }).from(exercises);
    
    if (exerciseCount[0].count === 0) {
      // Populate with initial exercises
      await db.insert(exercises).values([
        {
          name: "Bench Press",
          type: "strength",
          description: "Lie on bench and press barbell upward",
          muscleGroup: "chest",
          videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg"
        },
        {
          name: "Shoulder Press",
          type: "strength",
          description: "Press barbell or dumbbells overhead",
          muscleGroup: "shoulders",
          videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog"
        },
        {
          name: "Tricep Pushdown",
          type: "isolation",
          description: "Pull cable downward to work triceps",
          muscleGroup: "arms",
          videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU"
        },
        {
          name: "Squat",
          type: "compound",
          description: "Lower your body by bending knees and hips",
          muscleGroup: "legs",
          videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8"
        },
        {
          name: "Deadlift",
          type: "compound",
          description: "Lift barbell from ground in hinging motion",
          muscleGroup: "back",
          videoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q"
        }
      ]);
      console.log("Database initialized with sample exercises");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize database with sample data
initializeDatabase();

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
