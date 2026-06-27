import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers for base64 image scanning payloads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy init of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Gemini-powered food scanning endpoint
app.post("/api/scan", async (req: express.Request, res: express.Response) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
       res.status(400).json({ error: "Missing image data or mimeType" });
       return;
    }

    const ai = getGemini();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image,
      },
    };

    const promptText = `
      Analyze this food image in the context of Ghanaian nutrition, culinary habits, and sustainability.
      Identify if it is a food asset (plated Ghanaian meal, ingredient label, beverage, raw local produce, or snack).
      If it is not related to food, raw ingredients, or food packaging, set isFoodAsset to false.
      
      If it is food:
      1. Detect the specific Ghanaian food or product name (e.g., Fufu & Light Soup, Jollof Rice with Salad, Gari Foto, Red Red, Waakye, Kenkey with Fried Fish & Shito, or specific packaged foods).
      2. Grade the overall health profile strictly between A+ and F, based on balanced macronutrients, processing level, sodium/fat content, and fiber.
      3. Grade the Sustainability Score from 1 to 10 (1 = high environmental impact/carbon footprint/heavy transport, 10 = extremely sustainable, local Ghanaian sourcing, minimal packaging, eco-friendly ingredients).
      4. Formulate specific Ghanaian Dietary Context insights. Highlight things like palm oil content, starch-to-protein ratios, fermented grain benefits (like kenkey), use of indigenous greens (kontomire), or traditional natural seasoning (dawadawa, ginger, garlic, scotch bonnet).
      5. Identify Health & Eco Warning Flags. Use amber for moderate warnings (e.g., moderate sodium, slightly low protein) and red for severe alerts (e.g., highly processed, extreme sodium, trans fats, excessive palm oil bleaching/artificial colorants, high palm weevil / soil pollution indicators).
      6. Provide highly realistic, locally accessible healthy substitute foods and prep modifications specific to Ghana (e.g., substitute refined white rice with local brown/red rice, reduce palm oil skimming, add kontomire or garden eggs to soup, add boiled egg/fish for clean protein, use fermented millet/sorghum).
    `;

    const textPart = { text: promptText };

    // Support multiple fallback models in case of high demand / 503 limits on any specific model
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
    let lastError: any = null;
    let responseText = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting food analysis scan with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isFoodAsset: {
                  type: Type.BOOLEAN,
                  description: "True if the image depicts a food plate, packaged product, food label, raw ingredient, or drink. False otherwise."
                },
                foodName: {
                  type: Type.STRING,
                  description: "Detected name of the food item or brand. If isFoodAsset is false, set to 'Unknown'."
                },
                healthGrade: {
                  type: Type.STRING,
                  description: "Overall health grade from A+ to F."
                },
                sustainabilityScore: {
                  type: Type.INTEGER,
                  description: "An integer score from 1 to 10 for environmental impact and sustainability of this food in Ghana."
                },
                dietaryContext: {
                  type: Type.STRING,
                  description: "A comprehensive analysis of the food in the context of typical Ghanaian diets, traditional ingredients, and wellness."
                },
                warningFlags: {
                  type: Type.ARRAY,
                  description: "Specific nutritional and ecological health alerts.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "The warning issue details, contextualized to Ghana." },
                      severity: { type: Type.STRING, description: "Strictly either 'amber' or 'red'." }
                    },
                    required: ["text", "severity"]
                  }
                },
                recommendedAlternatives: {
                  type: Type.ARRAY,
                  description: "Healthy substitute options or preparation improvements accessible locally in Ghana.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Name of the local Ghanaian food alternative or cooking modification." },
                      reason: { type: Type.STRING, description: "The nutritional or eco benefit of this alternative." }
                    },
                    required: ["name", "reason"]
                  }
                },
                summary: {
                  type: Type.STRING,
                  description: "A fast, engaging 2-sentence summary of the food's overall health and sustainability profile."
                }
              },
              required: [
                "isFoodAsset",
                "foodName",
                "healthGrade",
                "sustainabilityScore",
                "dietaryContext",
                "warningFlags",
                "recommendedAlternatives",
                "summary"
              ]
            }
          }
        });

        if (response.text) {
          responseText = response.text;
          console.log(`Successfully generated content using model: ${modelName}`);
          break; // successfully analyzed! Exit fallback loop.
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or busy. Error:`, err.message || err);
        lastError = err;
        // Small backoff before testing next model in the chain
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!responseText) {
      throw lastError || new Error("All Gemini models failed or returned empty results.");
    }

    const resultData = JSON.parse(responseText.trim());
    res.json(resultData);
  } catch (error: any) {
    console.error("Gemini Scan Error:", error);
    res.status(500).json({
      error: "Failed to analyze food asset",
      details: error.message || error
    });
  }
});

// Configure Vite middleware or production statics
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite proxy...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriScan Ghana Express server running on port ${PORT}`);
  });
}

startServer();
