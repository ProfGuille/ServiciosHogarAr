import { Router } from "express";
import { sendContactFormEmail } from "../services/resendEmailService.js";

const router = Router();

router.post("/", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Nombre, email y mensaje son requeridos." });
  }

  try {
    await sendContactFormEmail(name, email, phone || "", subject || "", message);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error enviando email de contacto:", err);
    res.status(500).json({ error: "No se pudo enviar el mensaje." });
  }
});

export default router;
