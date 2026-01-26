import { GoogleGenAI } from "@google/genai";

export const explainCode = async (code: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please check your environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Python developer and cybersecurity specialist. 
      Analyze the following Python auto-update script. 
      Explain clearly how the 'hiding' mechanism works and how the version checking logic functions.
      Keep the explanation concise and suitable for a developer dashboard.
      
      Code:
      \`\`\`python
      ${code}
      \`\`\`
      `,
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze code. Please try again later.";
  }
};

export const customizeScript = async (currentScript: string, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
      return "# Error: API Key missing.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for better code generation logic
            contents: `You are a Python expert. 
            The user wants to modify this existing auto-updater script.
            
            User Request: "${prompt}"

            Existing Script:
            \`\`\`python
            ${currentScript}
            \`\`\`

            Return ONLY the full modified Python code. Do not include markdown backticks or explanations outside the code comments.
            `,
        });

        let text = response.text || "";
        // Clean up markdown if Gemini adds it despite instructions
        text = text.replace(/```python/g, '').replace(/```/g, '');
        return text;
    } catch (error) {
        return `# Error generating code: ${error}`;
    }
}
