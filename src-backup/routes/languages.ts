import { Router } from "express";
import { db } from "../db";
import { languages, translations, localizedContent, userLanguagePreferences } from "./shared/schema";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";

const router = Router();

// Get all available languages
router.get("/languages", async (req, res) => {
  try {
    const availableLanguages = await db
      .select()
      .from(languages)
      .where(eq(languages.isActive, true))
      .orderBy(languages.sortOrder);

    reson({
      success: true,
      data: availableLanguages
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch languages"
    });
  }
});

// Get translations for a specific language
router.get("/translations/:languageCode", async (req, res) => {
  try {
    const { languageCode } = req.params;

    const translationData = await db
      .select()
      .from(translations)
      .where(eq(translations.languageCode, languageCode));

    // Convert array to nested object structure
    const translationsObject = {};
    translationData.forEach((translation) => {
      const keys = translation.key.split('.');
      let current = translationsObject;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = translation.value;
    });

    reson({
      success: true,
      data: translationsObject
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch translations"
    });
  }
});

// Get localized content
router.get("/content/:contentType/:contentId/:languageCode", async (req, res) => {
  try {
    const { contentType, contentId, languageCode } = req.params;

    const [content] = await db
      .select()
      .from(localizedContent)
      .where(
        and(
          eq(localizedContent.contentType, contentType),
          eq(localizedContent.contentId, contentId),
          eq(localizedContent.languageCode, languageCode)
        )
      );

    if (!content) {
      return res.status(404).json({
        success: false,
        error: "Content not found"
      });
    }

    reson({
      success: true,
      data: content
    });
  } catch (error) {
    console.error("Error fetching localized content:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch content"
    });
  }
});

// Save user language preference (authenticated route)
router.post("/user-language-preference", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    const { languageCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
    }

    // Check if language exists
    const [language] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, languageCode));

    if (!language) {
      return res.status(400).json({
        success: false,
        error: "Invalid language code"
      });
    }

    // Upsert user language preference
    await db
      .insert(userLanguagePreferences)
      .values({
        userId,
        languageCode,
        isDefault: true
      })
      .onConflictDoUpdate({
        target: [userLanguagePreferences.userId, userLanguagePreferences.languageCode],
        set: {
          updatedAt: new Date()
        }
      });

    reson({
      success: true,
      message: "Language preference saved"
    });
  } catch (error) {
    console.error("Error saving language preference:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save language preference"
    });
  }
});

// Get user language preference (authenticated route)
router.get("/user-language-preference", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
    }

    const [preference] = await db
      .select()
      .from(userLanguagePreferences)
      .where(eq(userLanguagePreferences.userId, userId));

    reson({
      success: true,
      data: preference || null
    });
  } catch (error) {
    console.error("Error fetching user language preference:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch language preference"
    });
  }
});

export default router;