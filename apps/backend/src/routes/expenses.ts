import { Router, Request, Response } from "express";
import { CreateExpenseSchema, UpdateExpenseSchema } from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth";
import { expenseService } from "../services/expense.service";

const router = Router();

router.use(authRequired);

// GET /api/expenses
router.get("/", (_req: Request, res: Response) => {
  res.json(expenseService.list());
});

// GET /api/expenses/summaries
router.get("/summaries", (_req: Request, res: Response) => {
  res.json(expenseService.getAllCostSummaries());
});

// GET /api/expenses/:id
router.get("/:id", (req: Request, res: Response) => {
  const expense = expenseService.getById(req.params.id as string);
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(expense);
});

// POST /api/expenses
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const expense = expenseService.create(parsed.data);
  res.status(201).json(expense);
});

// PUT /api/expenses/:id
router.put("/:id", (req: Request, res: Response) => {
  const parsed = UpdateExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = expenseService.update(req.params.id as string, parsed.data);
  if (!result) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(result);
});

// DELETE /api/expenses/:id
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = expenseService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.status(204).send();
});

export default router;
