import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function handleCADRequest(req, res) {
  const { prompt, userImageBase64 } = req.body;

  // 1. Generate 3D Primitive Assembly JSON from Gemini
  const contents = [];
  if (userImageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/png",
        data: userImageBase64.split(',')[1]
      }
    });
  }
  contents.push(prompt + "\nBuild 3D primitive geometry JSON + a visual image prompt.");

  const jsonResult = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: { systemInstruction: WEBCAD3D_SYS_PROMPT, responseMimeType: "application/json" }
  });

  // 2. Generate a 2D rendering image via Imagen 3
  const imageResult = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: `Clean CAD product render of ${prompt}, studio lighting, dark background`,
    config: { numberOfImages: 1, aspectRatio: "1:1" }
  });

  const generatedImageUrl = imageResult.generatedImages[0].image.imageBytes;

  res.json({
    3dData: JSON.parse(jsonResult.text),
    imageUrl: `data:image/png;base64,${generatedImageUrl}`
  });
}