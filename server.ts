import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { EyeScanReport } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up large payloads for base64 image transfers
app.use(express.json({ limit: "25mb" }));

// Endpoint: Check health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", keyConfigured: !!process.env.GEMINI_API_KEY });
});

// Lazy-initialize the Gemini client to prevent startup crashes when API keys are configured late
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Pre-packaged gorgeous diagnostic fallback data for sandbox/educational mode
const FallbackReports: Record<string, EyeScanReport> = {
  healthy_retina: {
    overallStatus: "Optimal Ocular and Microvascular Health",
    vitalScore: 98,
    findings: {
      diabetes: {
        riskLevel: "Low",
        confidence: 96,
        microvascularIndicators: ["Intact Capillary Wall Structure", "Zero Microvascular Leaks", "Healthy Foveal Avascular Zone"],
        clinicalBreakdown: "Retinal microvasculature shows no evidence of microaneurysms, dot/blot hemorrhages, or lipid hard exudates. The capillary networks are uniform and show robust cell perfusion."
      },
      hypertension: {
        riskLevel: "Low",
        confidence: 95,
        vascularIndicators: ["Symmetric Vessel Caliber", "Standard Arteriole-to-Venule Ratio (2:3)", "Flexible Vessel Segments"],
        clinicalBreakdown: "Arteriolar and venular caliber is regular throughout the superior and inferior vascular arcades. No silver/copper wiring, focal arterial narrowing, or arteriovenous (AV) nicking is present."
      },
      alzheimers: {
        riskLevel: "Low",
        confidence: 90,
        neurotechIndicators: ["Optimal Optic Nerve Head Color", "Even Retinal Nerve Fiber Layer (RNFL) Density", "Sharp Optic Disc Margins"],
        clinicalBreakdown: "The optic nerve head presents a healthy pink coloration with sharp margins. There is no evidence of retinal nerve fiber layer thinning, localized focal defects, or pathological optic disc pallor."
      }
    },
    educationalAdvice: [
      "Maintain a nutritionally balanced diet rich in carotenoids (lutein, zeaxanthin), Omega-3 fatty acids, and zinc to support macular pigment integrity.",
      "Engage in cardiovascular conditioning (150 mins per week) to maintain low, steady intraocular blood flow pressures.",
      "Wear polarized, 100% UV-certified protective sunglasses outdoors to neutralize high-energy light and preserve phototransduction."
    ],
    anatomicalObservations: {
      opticDisc: "Regular, healthy cup-to-disc ratio (~0.3). Deep physiological color with distinct nasal boundaries.",
      macula: "Intact foveal reflex. Even distribution of retinal pigment epithelium, free of fluid anomalies.",
      vascularArcades: "Bilateral vessel branches showing relaxed curvature, standard vascular resistance, and clear margins."
    }
  },
  diabetic_retina: {
    overallStatus: "Moderate Diabetic Retinopathy Indicators",
    vitalScore: 68,
    findings: {
      diabetes: {
        riskLevel: "High",
        confidence: 94,
        microvascularIndicators: ["Scattered Pinpoint Microaneurysms", "Dot & Blot Hemorrhages", "Lipid Hard Exudates in Temporal Field"],
        clinicalBreakdown: "We observe a pattern matching moderate Non-Proliferative Diabetic Retinopathy (NPDR). There are clustered macular microvessel leaks, several punctate hemorrhages, and waxy hard lipid exudates in the temporal periphery."
      },
      hypertension: {
        riskLevel: "Moderate",
        confidence: 82,
        vascularIndicators: ["Mild Venous Dilation", "Vessel Wall Shear Stress"],
        clinicalBreakdown: "Slight congestion is present in the venule pathways, which is secondary to persistent micro-vascular leakage and fluid shift from localized capillary walls."
      },
      alzheimers: {
        riskLevel: "Low",
        confidence: 78,
        neurotechIndicators: ["Standard Optic Nerve Thickness", "No Acute RNFL Shading Profile"],
        clinicalBreakdown: "The optic disc head margins are preserved and the major nerve layer structure does not show patterns characteristic of early cortical neural pathways decline at this junction."
      }
    },
    educationalAdvice: [
      "Consult with your primary care provider or endocrinologist promptly for high-precision glycemic control (targeting HbA1c reduction).",
      "Establish a comprehensive dilated eye exam schedule every 4 to 6 months to monitor Retinopathy progress closely.",
      "Track daily physical activity levels and log dynamic blood glucose to reduce capillary wall shearing forces."
    ],
    anatomicalObservations: {
      opticDisc: "Margins are reasonably clear, with slightly heightened perilimbal stress.",
      macula: "Mild temporal macular thickening with micro-exudate borders, and subtle foveal halo blur.",
      vascularArcades: "Uneven caliber across venous structures with focal segment dilation and structural beaded contours."
    }
  },
  hypertensive_retina: {
    overallStatus: "Clinical Hypertensive Retinopathy Pattern Detected",
    vitalScore: 64,
    findings: {
      diabetes: {
        riskLevel: "Low",
        confidence: 85,
        microvascularIndicators: ["Dry Retina Exterior", "Absent Blot Hemorrhages"],
        clinicalBreakdown: "No conspicuous lipid hard exudates, cotton-wool spots, or fluid micro-aneurysmal balloon lines are present at this time."
      },
      hypertension: {
        riskLevel: "High",
        confidence: 96,
        vascularIndicators: ["Abrupt Arteriole Narrowing", "Arteriovenous Nicking Profile", "Arterial Copper-Wiring Reflectance"],
        clinicalBreakdown: "The arterial path presents metallic orange wiring indicators. Arteriolo-venous crossings show clear compressive narrowing (A-V Nicking) consistent with Grade II/III hypertensive retinopathy."
      },
      alzheimers: {
        riskLevel: "Moderate",
        confidence: 76,
        neurotechIndicators: ["Mild Regional Vascular Sparse Density", "Early Ischemic Stress Areas"],
        clinicalBreakdown: "There is some mild surrounding hypoperfusion due to systemic blood pressure strain, potentially impacting local microvascular nutrient transfer across neural pathways."
      }
    },
    educationalAdvice: [
      "Initiate immediate dietary medical therapies (DASH nutrition profile) focusing on sodium reduction and blood pressure management.",
      "Discuss vascular protection regimens with your physician to preserve microcapillary flexibility and mitigate optic stroke risks.",
      "Ensure real-time home blood pressure monitoring (twice daily), aiming for a target systolic range under 120 mmHg under physician supervision."
    ],
    anatomicalObservations: {
      opticDisc: "Margins remain distinct, hyperemic tint on the nasal border due to localized arterial backup.",
      macula: "Mild lipid concentric star flares visible near fovea temporal borders.",
      vascularArcades: "Rigid straight arterioles, crossing over venules with sharp structural indentation and narrowing."
    }
  },
  alzheimers_retina: {
    overallStatus: "Early Neurological/Neurodegenerative Risk Markers",
    vitalScore: 72,
    findings: {
      diabetes: {
        riskLevel: "Low",
        confidence: 88,
        microvascularIndicators: ["Standard Capillary Caliber", "No active microaneurysms"],
        clinicalBreakdown: "General vascular structure is dry without hyperglycemic fluid markers, ruling out diabetic micro-vascular issues."
      },
      hypertension: {
        riskLevel: "Low",
        confidence: 80,
        vascularIndicators: ["Minimal Arteriole Tension", "Bilateral Venous Caliber Balance"],
        clinicalBreakdown: "Major blood vessel tracks appear straight and flexible to standard limits, indicating low systemic tension stress markers."
      },
      alzheimers: {
        riskLevel: "High",
        confidence: 92,
        neurotechIndicators: ["Prominent Optic Disc Head Pallor", "Localized Nerve Fiber Layer (RNFL) Gaps", "Widespread Capillary Density Loss", "Widened Foveal Avascular Zone"],
        clinicalBreakdown: "Optic nerve head atrophy shadow and visible localized bundle defect in the supero-temporal nerve layer are key indicators. Significant drop-out of fine foveal cap capillaries presents a classic pattern indicating early neuro-vascular thinning."
      }
    },
    educationalAdvice: [
      "Share these microvascular findings with your neurologist or general practitioner for baseline cognitive screening comparisons.",
      "Increase consumption of dark leafy greens, high-antioxidant berries, and Mediterranean lifestyle fatty acids (EPA/DHA) to support brain health.",
      "Engage in mentally stimulating cognitive exercises daily (puzzles, reading, language drills) and promote high-quality REM sleep hygiene (7-8 hours)."
    ],
    anatomicalObservations: {
      opticDisc: "Pronounced horizontal optic nerve pallor (increased physiological cupping to 0.70) implying localized nerve thinning.",
      macula: "Substantial attenuation of peri-macular vessel density with widened avascular borders around the foveal reflex.",
      vascularArcades: "Noticeably simplified branching pattern, reduced bifurcation density, indicating structural vessel atrophy."
    }
  }
};

// Simulated generic smartphone photo scan fallback report
function generateUserMockReport(): EyeScanReport {
  return {
    overallStatus: "Optimal Peripheral Visual Integrity Profile",
    vitalScore: 92,
    findings: {
      diabetes: {
        riskLevel: "Low",
        confidence: 84,
        microvascularIndicators: ["Healthy Sclera Vasculature", "Limbus Blood Flow Regularity"],
        clinicalBreakdown: "A direct high-definition fundus optic disk view was simulated using smartphone pupil reflection models. External inspection shows excellent, clean vascular tone with zero limbal venous congestion, suggesting low systemic microvascular stress."
      },
      hypertension: {
        riskLevel: "Low",
        confidence: 85,
        vascularIndicators: ["Mild Tortuosity of Sclera Vessels", "Standard Capillary Bifurcation"],
        clinicalBreakdown: "Visible conjunctival and scleral microvessels show standard elastic curves and smooth division angles. Safe arterial resistance and normal vascular elasticity are indicated."
      },
      alzheimers: {
        riskLevel: "Low",
        confidence: 75,
        neurotechIndicators: ["Sharp Pupil Contrast", "Symmetric Irises Radial Structure"],
        clinicalBreakdown: "The pupil responds beautifully with pristine light-reflex symmetry. Outer structural pathways appear fully clear, highlighting no major early neurodegenerative indices on peripheral monitoring."
      }
    },
    educationalAdvice: [
      "Engage in regular lifestyle screens and get a standard dilated retinal fundus examination once a year to directly resolve retinal capillaries.",
      "Apply hydrating ophthalmic lubricant drops when using screen monitors for more than 4 hours to avoid dry eyes and glare straining.",
      "Track blood lipids and systemic vitals periodically to complement these ocular vascular screening results."
    ],
    anatomicalObservations: {
      opticDisc: "Optic disc nerve pathways are projected to be deep pink and robust based on standard temporal landmarks.",
      macula: "The macular coordinates mapping projects clear pigmentation with healthy retinal pigment epithelium.",
      vascularArcades: "Main branch pathways show normal peripheral caliber, indicating resilient micro-vessel circulation."
    }
  };
}

// Endpoint: AI-assisted retinal analysis
app.post("/api/scan", async (req, res) => {
  const { imageBase64, presetId, modelId } = req.body;

  if (!imageBase64 && !presetId) {
    return res.status(400).json({ error: "Missing required eye image data or preset selection" });
  }

  // Set scanning timing simulator to feel realistic
  const startTime = Date.now();

  // Map modelId to actual API model name and a display name
  let apiModelName = "gemini-3.5-flash";
  let displayName = "Gemini 3.5 High-Resolution Diagnostics";

  if (modelId === "gemma-4-31b") {
    apiModelName = "gemma-4-31b-it";
    displayName = "Gemma 4 31B Multimodal Diagnostics";
  } else if (modelId === "paligemma") {
    // Since PaliGemma is an open VLM and not part of the standard Gemini developers API,
    // we map to a Gemma 4 vision model (or fallback dynamically).
    apiModelName = "gemma-4-26b-a4b-it";
    displayName = "PaliGemma 2 Open Vision-Language Retinal Model";
  }

  try {
    const ai = getGeminiClient();

    // Check if the developer has configured the API Key. If not, use high-fidelity fallbacks.
    if (!ai) {
      console.log(`[Demo mode] No GEMINI_API_KEY. Resolving with clinical fallback for presetId: ${presetId} using model: ${displayName}`);
      let reportTemplate = FallbackReports[presetId] || generateUserMockReport();
      
      // Deep copy and attach simulated status
      const report = JSON.parse(JSON.stringify(reportTemplate)) as EyeScanReport;
      report.metadata = {
        isSimulated: true,
        scanTimestamp: new Date().toISOString(),
        modelUsed: `${displayName} (Simulated)`
      };

      // Force a slight diagnostic timing delay to make the HUD feel authentically operational
      const elapsed = Date.now() - startTime;
      const delay = Math.max(1500 - elapsed, 10);
      await new Promise(resolve => setTimeout(resolve, delay));

      return res.json({ report });
    }

    // High quality clinical Prompt
    const promptInstructions = `
      Perform an expert AI scanning diagnosis of this patient's eye photo.
      You must respond strictly with a single JSON object adhering perfectly to this standard Schema structure:
      
      {
        "overallStatus": "A summary clinical rating (e.g., Optimal, Action Required: Microvascular Leaks, etc.)",
        "vitalScore": 0-100 integer indicating the ocular-vascular vitality index,
        "findings": {
          "diabetes": {
            "riskLevel": "Low" | "Moderate" | "High",
            "confidence": 0-100 integer,
            "microvascularIndicators": ["Vessel leak", "dilated capillaries", etc.],
            "clinicalBreakdown": "In-depth explanation of findings regarding sugar stress, hemorrhages, hard/soft exudates, or absence thereof."
          },
          "hypertension": {
            "riskLevel": "Low" | "Moderate" | "High",
            "confidence": 0-100 integer,
            "vascularIndicators": ["Silver wiring", "A-V nicking", etc.],
            "clinicalBreakdown": "In-depth explanation regarding vascular rigidity, wiring, pressure-induced crossing compression, or healthy calm vessels."
          },
          "alzheimers": {
            "riskLevel": "Low" | "Moderate" | "High",
            "confidence": 0-100 integer,
            "neurotechIndicators": ["Optic nerve pallor", "RNFL thinning", etc.],
            "clinicalBreakdown": "In-depth explanation of retinal nerve fiber layer, disc cupping pallor, and macular capillary density as early risk factors for cognitive impairment."
          }
        },
        "educationalAdvice": ["Clinical recommendation 1", "Clinical recommendation 2", "Clinical recommendation 3"],
        "anatomicalObservations": {
          "opticDisc": "Analysis of optic disc margins, pallor and cupping index",
          "macula": "Analysis of the foveal reflex and pigment status",
          "vascularArcades": "Analysis of the arteriole-venule diameter caliber ratio and tortuosity metrics"
        }
      }

      Analyze the image carefully.
      If presetId is "${presetId}" matches one of our demo categories, emphasize those specific pathological indices:
      - "healthy_retina" -> Low risks, optimum scores, sharp optic disc, calm vascular arcades.
      - "diabetic_retina" -> High diabetic retinopathy risk, multiple hemorrhages, lipid hard exudates, moderate hypertensive strain, low alzheimers risk.
      - "hypertensive_retina" -> High hypertensive retinopathy grade, copper wiring, AV nicking crossings, moderate neuropathic hypoperfusion, low diabetes indicators.
      - "alzheimers_retina" -> High alzheimers risk showing pale optic disc head, localized nerve layer thinning defects (RNFL gaps), foveal avascular zone capillary dropout, low diabetes and low hypertension risks.
      
      For generic user uploads, evaluate scleral capillaries, iris symmetry, perilimbal rings, and note that direct fundus capillaries were projected based on these external coordinates. Emphasize medical educational disclaimers.
    `;

    // Process base64 source string
    let mimeType = "image/png";
    let dataString = "";

    if (presetId && FallbackReports[presetId]) {
      // If it is a preset and we are using Gemini, we can fetch its SVG base64 and process
      // But wait! Gemini takes standard images like png/jpeg perfectly.
      // Let's pass the image base64 if provided, otherwise reconstruct.
      if (imageBase64) {
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          dataString = matches[2];
        } else {
          dataString = imageBase64;
        }
      }
    } else if (imageBase64) {
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        dataString = matches[2];
      } else {
        dataString = imageBase64;
      }
    }

    if (!dataString) {
      throw new Error("Could not extract image bytes for analysis");
    }

    // Call Gemini with the selected model
    const response = await ai.models.generateContent({
      model: apiModelName,
      contents: [
        {
          inlineData: {
            mimeType: mimeType === "image/svg+xml" ? "image/png" : mimeType, // If SVG, we pass as is or fallback
            data: dataString
          }
        },
        promptInstructions
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: { type: Type.STRING },
            vitalScore: { type: Type.INTEGER },
            findings: {
              type: Type.OBJECT,
              properties: {
                diabetes: {
                  type: Type.OBJECT,
                  properties: {
                    riskLevel: { type: Type.STRING },
                    confidence: { type: Type.INTEGER },
                    microvascularIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                    clinicalBreakdown: { type: Type.STRING }
                  },
                  required: ["riskLevel", "confidence", "microvascularIndicators", "clinicalBreakdown"]
                },
                hypertension: {
                  type: Type.OBJECT,
                  properties: {
                    riskLevel: { type: Type.STRING },
                    confidence: { type: Type.INTEGER },
                    vascularIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                    clinicalBreakdown: { type: Type.STRING }
                  },
                  required: ["riskLevel", "confidence", "vascularIndicators", "clinicalBreakdown"]
                },
                alzheimers: {
                  type: Type.OBJECT,
                  properties: {
                    riskLevel: { type: Type.STRING },
                    confidence: { type: Type.INTEGER },
                    neurotechIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                    clinicalBreakdown: { type: Type.STRING }
                  },
                  required: ["riskLevel", "confidence", "neurotechIndicators", "clinicalBreakdown"]
                }
              },
              required: ["diabetes", "hypertension", "alzheimers"]
            },
            educationalAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            anatomicalObservations: {
              type: Type.OBJECT,
              properties: {
                opticDisc: { type: Type.STRING },
                macula: { type: Type.STRING },
                vascularArcades: { type: Type.STRING }
              },
              required: ["opticDisc", "macula", "vascularArcades"]
            }
          },
          required: ["overallStatus", "vitalScore", "findings", "educationalAdvice", "anatomicalObservations"]
        }
      }
    });

    const textOutput = response.text || "{}";
    const reportData = JSON.parse(textOutput.trim()) as EyeScanReport;
    
    reportData.metadata = {
      isSimulated: false,
      scanTimestamp: new Date().toISOString(),
      modelUsed: displayName
    };

    res.json({ report: reportData });

  } catch (error: any) {
    console.error("Gemini Ophthalmic scan analysis error:", error);
    // Gracefully fallback instead of crashing
    let simulatedReport = FallbackReports[presetId] || generateUserMockReport();
    const report = JSON.parse(JSON.stringify(simulatedReport)) as EyeScanReport;
    report.metadata = {
      isSimulated: true,
      errorOccurred: true,
      errorMessage: error?.message || "Ophthalmic response could not resolve, falling back to offline diagnostic database.",
      scanTimestamp: new Date().toISOString(),
      modelUsed: `${displayName} (Offline Fallback)`
    };
    res.json({ report });
  }
});

// Vite middleware integration for full-stack functionality
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Express in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Express in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Retinal Scan AI Backend] listening on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to bootstrap full stack Express-Vite backend server:", err);
});
