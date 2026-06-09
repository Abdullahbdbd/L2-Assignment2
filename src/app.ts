import express, { type Application, type Request, type Response } from "express";
import { pool } from "./app/config/db";
import authRoutes from "./app/modules/auth/auth.route";
import issueRoutes from "./app/modules/issues/issue.route";


const app: Application = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);


app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    
    res.json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error,
    });
  }
});

app.post('/',(req: Request, res:Response)=>{
    console.log();
})

export default app;
