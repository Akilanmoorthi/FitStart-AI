import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertWorkoutSchema, 
  insertDietSchema, 
  insertProgressSchema,
  insertAchievementSchema,
  insertScheduleSchema
} from "@shared/schema";
import { analyzeText } from "../shared/sentiment-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // User routes
  router.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  router.get("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  router.patch("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Workout routes
  router.post("/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workout" });
      }
    }
  });

  router.get("/workouts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const workouts = await storage.getWorkoutsByUserId(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });

  router.get("/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout" });
    }
  });

  router.get("/workouts/user/:userId/date/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = new Date(req.params.date);
      const workouts = await storage.getWorkoutsByDate(userId, date);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts by date" });
    }
  });

  router.patch("/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workoutData = req.body;
      const workout = await storage.updateWorkout(id, workoutData);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Exercise routes
  router.get("/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercises" });
    }
  });

  router.get("/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise" });
    }
  });

  router.get("/exercises/muscle/:muscleGroup", async (req, res) => {
    try {
      const { muscleGroup } = req.params;
      const exercises = await storage.getExercisesByMuscleGroup(muscleGroup);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercises by muscle group" });
    }
  });

  // Diet routes
  router.post("/diets", async (req, res) => {
    try {
      const dietData = insertDietSchema.parse(req.body);
      const diet = await storage.createDiet(dietData);
      res.status(201).json(diet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid diet data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create diet" });
      }
    }
  });

  router.get("/diets/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const diets = await storage.getDietsByUserId(userId);
      res.json(diets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get diets" });
    }
  });

  router.get("/diets/user/:userId/date/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = new Date(req.params.date);
      const diet = await storage.getDietByDate(userId, date);
      if (!diet) {
        return res.status(404).json({ message: "Diet not found for this date" });
      }
      res.json(diet);
    } catch (error) {
      res.status(500).json({ message: "Failed to get diet by date" });
    }
  });

  router.patch("/diets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dietData = req.body;
      const diet = await storage.updateDiet(id, dietData);
      if (!diet) {
        return res.status(404).json({ message: "Diet not found" });
      }
      res.json(diet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update diet" });
    }
  });

  // Progress routes
  router.post("/progress", async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.createProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create progress entry" });
      }
    }
  });

  router.get("/progress/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getProgressByUserId(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress entries" });
    }
  });

  router.get("/progress/user/:userId/range/:startDate/:endDate", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = new Date(req.params.startDate);
      const endDate = new Date(req.params.endDate);
      const progress = await storage.getProgressByDateRange(userId, startDate, endDate);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress by date range" });
    }
  });

  // Achievement routes
  router.post("/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid achievement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create achievement" });
      }
    }
  });

  router.get("/achievements/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getAchievementsByUserId(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Schedule routes
  router.post("/schedules", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create schedule" });
      }
    }
  });

  router.get("/schedules/user/:userId/date/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = new Date(req.params.date);
      const schedule = await storage.getScheduleByDate(userId, date);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found for this date" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schedule by date" });
    }
  });

  router.get("/schedules/user/:userId/range/:startDate/:endDate", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = new Date(req.params.startDate);
      const endDate = new Date(req.params.endDate);
      const schedules = await storage.getSchedulesByDateRange(userId, startDate, endDate);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schedules by date range" });
    }
  });

  router.patch("/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduleData = req.body;
      const schedule = await storage.updateSchedule(id, scheduleData);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  // Sentiment analysis endpoint
  router.post("/analyze-sentiment", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const sentiment = analyzeText(text);
      res.json({ sentiment });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  // Auth routes (simplified for demo)
  router.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real application, you would use JWT or sessions here
      // For this demo, we'll just return the user without the password
      const { password: pwd, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Register the router with the prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
