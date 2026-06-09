

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express3 from "express";

// src/app/config/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  allowExitOnIdle: true
});

// src/app/modules/auth/auth.route.ts
import express from "express";

// src/app/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET;
var loginUser = async (email, password) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var signupUser = async (data) => {
  const { name, email, password, role: role2 } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role2 || "contributor"]
  );
  return result.rows[0];
};

// src/app/modules/auth/auth.controller.ts
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};
var signup = async (req, res) => {
  try {
    const user = await signupUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message
    });
  }
};

// src/app/modules/auth/auth.route.ts
var router = express.Router();
router.post("/login", login);
router.post("/signup", signup);
var auth_route_default = router;

// src/app/modules/issues/issue.route.ts
import express2 from "express";

// src/app/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET;
var auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    const token = header.split(" ")[1] || header;
    const decoded = jwt2.verify(token, JWT_SECRET2);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// src/app/modules/issues/issue.service.ts
var deleteIssue = async (id) => {
  const result = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  await pool.query(
    "DELETE FROM issues WHERE id = $1",
    [id]
  );
  return true;
};
var updateIssue = async (id, data, user) => {
  const issueResult = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You cannot update others' issues");
    }
    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }
  const { title, description, type } = data;
  const updates = [];
  const values = [];
  if (title) {
    values.push(title);
    updates.push(`title = $${values.length}`);
  }
  if (description) {
    values.push(description);
    updates.push(`description = $${values.length}`);
  }
  if (type) {
    values.push(type);
    updates.push(`type = $${values.length}`);
  }
  values.push(id);
  const query = `
    UPDATE issues
    SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${values.length}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const userResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  return {
    ...issue,
    reporter
  };
};
var getAllIssues = async (query) => {
  const { sort = "newest", type, status } = query;
  let baseQuery = "SELECT * FROM issues";
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    baseQuery += " WHERE " + conditions.join(" AND ");
  }
  if (sort === "oldest") {
    baseQuery += " ORDER BY created_at ASC";
  } else {
    baseQuery += " ORDER BY created_at DESC";
  }
  const result = await pool.query(baseQuery, values);
  return result.rows;
};
var createIssue = async (data, userId) => {
  const { title, description, type } = data;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, userId]
  );
  return result.rows[0];
};

// src/app/modules/issues/issue.controller.ts
var deleteIssueController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteIssue(id);
    res.json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var updateIssueController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateIssue(id, req.body, req.user);
    res.json({
      success: true,
      message: "Issue updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var getSingleIssueController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const issue = await getSingleIssue(id);
    res.json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
var getAllIssuesController = async (req, res) => {
  try {
    const issues = await getAllIssues(req.query);
    res.json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var createIssueController = async (req, res) => {
  try {
    const issue = await createIssue(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// src/app/middlewares/role.ts
var role = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission"
      });
    }
    next();
  };
};

// src/app/modules/issues/issue.route.ts
var router2 = express2.Router();
router2.delete(
  "/:id",
  auth,
  role(["maintainer"]),
  deleteIssueController
);
router2.patch("/:id", auth, updateIssueController);
router2.get("/:id", getSingleIssueController);
router2.get("/", getAllIssuesController);
router2.post("/", auth, createIssueController);
var issue_route_default = router2;

// src/app.ts
var app = express3();
app.use(express3.json());
app.use("/api/auth", auth_route_default);
app.use("/api/issues", issue_route_default);
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error
    });
  }
});
app.post("/", (req, res) => {
  console.log();
});
var app_default = app;

// src/server.ts
var PORT = 5e3;
app_default.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map