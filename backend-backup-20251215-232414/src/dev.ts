import express, { Request, Response, NextFunction } from "express";

const app = express();

// ...otros middlewares y rutas aquí...

// Error handler middleware con tipado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});