import { pool } from "../../config/db";

export const deleteIssue = async (id: number) => {
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

export const updateIssue = async (
  id: number,
  data: any,
  user: any
) => {
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

  const updates: string[] = [];
  const values: any[] = [];

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

export const getSingleIssue = async (id: number) => {
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
    reporter,
  };
};

export const getAllIssues = async (query: any) => {
  const { sort = "newest", type, status } = query;

  let baseQuery = "SELECT * FROM issues";
  const values: any[] = [];
  const conditions: string[] = [];

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

export const createIssue = async (data: any, userId: number) => {
  const { title, description, type } = data;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, userId]
  );

  return result.rows[0];
};