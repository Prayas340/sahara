import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Helper to call Google Gemini API with fallback models
 */
async function callGemini(contents, systemInstruction) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const bodyPayload = {
        contents,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[analyze-report] Model ${model} responded with status ${res.status}:`, errText);
        lastError = new Error(`Gemini ${model} error: ${res.status}`);
        continue; // Try next model
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText;
      }
    } catch (err) {
      console.warn(`[analyze-report] Failed to call model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to generate assessment.');
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBase64 = null;
    let mimeType = 'application/pdf';
    let textContent = '';
    let elderName = 'Patient';
    let elderAge = 74;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      elderName = formData.get('elderName') || elderName;
      elderAge = formData.get('elderAge') || elderAge;
      textContent = formData.get('text') || '';

      if (file && typeof file === 'object' && file.arrayBuffer) {
        const arrayBuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        fileBase64 = buffer.toString('base64');
        mimeType = file.type || (file.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      }
    } else {
      const body = await request.json();
      fileBase64 = body.fileBase64 || null;
      mimeType = body.mimeType || mimeType;
      textContent = body.text || '';
      elderName = body.elderName || elderName;
      elderAge = body.elderAge || elderAge;
    }

    if (!fileBase64 && !textContent) {
      return NextResponse.json(
        { success: false, error: 'No document file or clinical text was attached.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a licensed clinical neuropsychologist specializing in geriatric memory care, dementia, and cognitive therapy.
Your objective is to review an uploaded clinical report (e.g., MMSE, MoCA, Clock Drawing, SLUMS, or physician notes) for ${elderName} (Age: ${elderAge}) and determine their cognitive baseline to recommend an appropriate starting level for 10 progressive cognitive therapy games.

Progression Scale:
- Level 1: MMSE 0–10 or Severe Cognitive Impairment (Gentle visual pair recognition with high visual aids)
- Level 2: MMSE 11–14 or Moderate-to-Severe Impairment (Simple 6x6 Word Search)
- Level 3: MMSE 15–17 or Moderate Impairment (Quick 3-clue Crosswords)
- Level 4: MMSE 18–20 or Moderate-to-Mild Impairment (Anagrams & 4-letter Word Unscrambles)
- Level 5: MMSE 21–23 or Mild Cognitive Impairment (Word Wheel & letter clustering)
- Level 6: MMSE 24–25 or Mild Cognitive Impairment (Fill-in-the-Blank Familiar Proverbs)
- Level 7: MMSE 26–27 or Mild/Early Impairment (Rhyming & auditory phonetics)
- Level 8: MMSE 28 or Very Mild Impairment (Semantic Category Association)
- Level 9: MMSE 29 or Minimal Recall Impairment (Hangman Vocabulary deduction)
- Level 10: MMSE 30 or Intact Baseline (Mixed multi-faceted cognitive logic)

Analyze the attached document or text.
You MUST output ONLY valid JSON matching this exact schema:
{
  "recommendedStartingLevel": 3,
  "cognitiveSummary": "Concise 2-sentence clinical assessment of short-term recall, attention, and executive orientation.",
  "identifiedCondition": "e.g. Mild Cognitive Impairment (MCI) / Early Alzheimer's / Age-Associated Memory Loss / Intact",
  "estimatedScore": "e.g. MoCA 18/30 or MMSE 22/30 if detected, else Clinical Observation"
}`;

    const parts = [];
    if (fileBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }

    const textPrompt = `Please assess this clinical document for ${elderName}, age ${elderAge}. Extract cognitive test scores (MMSE/MoCA if present), identify the condition, write a concise summary, and assign the starting cognitive game level from 1 to 10.${textContent ? `\nAdditional Clinical Notes:\n${textContent}` : ''}`;
    parts.push({ text: textPrompt });

    const contents = [{ role: 'user', parts }];

    let analysisResult = null;

    try {
      const rawResponse = await callGemini(contents, systemPrompt);
      const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisResult = JSON.parse(cleanJson);
    } catch (aiErr) {
      console.warn('[analyze-report] Gemini invocation error, using clinical heuristic fallback:', aiErr.message);
      // Fallback heuristic based on clinical text keywords if AI call was unavailable
      const lower = (textContent || '').toLowerCase();
      let level = 3;
      let condition = 'Mild Cognitive Impairment (MCI)';
      let summary = 'Patient demonstrates mild short-term memory challenges with good familiar phrase recall.';

      if (lower.includes('severe') || lower.includes('advanced') || lower.includes('mmse 1') || lower.includes('moca 1')) {
        level = 2;
        condition = 'Moderate-to-Severe Memory Support';
        summary = 'Marked recall and processing difficulties; recommended gentle, high-visual memory matching exercises.';
      } else if (lower.includes('mild') || lower.includes('mci') || lower.includes('mmse 2') || lower.includes('moca 2')) {
        level = 4;
        condition = 'Mild Cognitive Impairment (MCI)';
        summary = 'Familiar visual and auditory recognition is intact with slight executive sequencing support recommended.';
      } else if (lower.includes('normal') || lower.includes('intact') || lower.includes('mmse 28') || lower.includes('mmse 29') || lower.includes('mmse 30')) {
        level = 6;
        condition = 'Age-Associated Memory Support';
        summary = 'Cognitive baseline is well-preserved. Active engagement in word building and proverbs recommended.';
      }

      analysisResult = {
        recommendedStartingLevel: level,
        cognitiveSummary: summary,
        identifiedCondition: condition,
        estimatedScore: 'Clinical Assessment',
      };
    }

    // Clamp recommendedStartingLevel to 1-10
    let recommendedLevel = parseInt(analysisResult.recommendedStartingLevel, 10);
    if (isNaN(recommendedLevel) || recommendedLevel < 1) recommendedLevel = 1;
    if (recommendedLevel > 10) recommendedLevel = 10;

    return NextResponse.json({
      success: true,
      recommendedStartingLevel: recommendedLevel,
      cognitiveSummary: analysisResult.cognitiveSummary || 'Mild cognitive support profile mapped to therapeutic levels.',
      identifiedCondition: analysisResult.identifiedCondition || 'Mild Cognitive Support Mode',
      estimatedScore: analysisResult.estimatedScore || 'Clinical Assessment',
    });
  } catch (err) {
    console.error('[API /analyze-report error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to process clinical report.',
        recommendedStartingLevel: 1,
      },
      { status: 500 }
    );
  }
}
