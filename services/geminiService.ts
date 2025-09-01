import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses API errors to provide user-friendly messages.
 * @param error The error object caught from the API call.
 * @returns A user-friendly error string.
 */
const getFriendlyApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // The user log suggests the error message is a JSON string.
    // Let's try to parse it to extract the specific reason.
    try {
      const errorJson = JSON.parse(error.message);
      if (errorJson.error) {
        const { message, status } = errorJson.error;
        if (status === "RESOURCE_EXHAUSTED") {
          return "API quota exceeded. Please check your Google AI plan and billing details, or wait for your quota to reset.";
        }
        return `API Error: ${message || "An unknown API error occurred."}`;
      }
    } catch (e) {
      // If parsing fails, it's not the JSON error we expected.
      // Fall back to the original error message.
      return error.message;
    }
  }
  return "An unknown error occurred.";
};


export async function stylizeImage(base64ImageData: string, mimeType: string, stylePrompt: string, userText: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    let fullPrompt = `Apply the following style to the image: ${stylePrompt}`;
    if (userText.trim()) {
      fullPrompt += ` Also, add the text "${userText.trim()}" to the image in a way that fits the overall style and composition.`;
    }

    const textPart = {
      text: fullPrompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error("The AI did not return a stylized image. Please try a different image or style.");
  } catch (error) {
    console.error("Error stylizing image:", error);
    const friendlyMessage = getFriendlyApiErrorMessage(error);
    return Promise.reject(new Error(friendlyMessage));
  }
}

export async function generateImageFromText(prompt: string, stylePrompt: string, aspectRatio: string): Promise<string> {
  try {
    const fullPrompt = `${prompt}, ${stylePrompt}`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error("The AI did not return an image. Please try a different prompt or style.");

  } catch (error) {
    console.error("Error generating image from text:", error);
    const friendlyMessage = getFriendlyApiErrorMessage(error);
    return Promise.reject(new Error(friendlyMessage));
  }
}