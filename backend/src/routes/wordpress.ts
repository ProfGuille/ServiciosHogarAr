import { Router } from "express";
import { db } from "../db";
import { wordpressPosts } from "../shared/schema/wordpressPosts";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const posts = await db.select().from(wordpressPosts);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener posts de Wordpress" });
  }
});

export default router;