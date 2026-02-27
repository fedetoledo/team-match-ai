import { generateText } from 'ai';
import { getSelectedModelServer } from '@/lib/llm_model';
import { PdfAgentNode, PdfAgentStateType } from '../graph';

export const generatePromptFromPDF = async (
  state: PdfAgentStateType
): Promise<PdfAgentStateType> => {
  try {
    const model = await getSelectedModelServer();
    const { text: generatedPrompt, usage } = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Read the attached job description PDF and summarize it in English, in the style of: "Looking for a senior React developer with Tailwind experience".`,
            },
            {
              type: 'file',
              data: state.fileBuffer as Buffer,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
    });

    const input = generatedPrompt.trim();

    return {
      generatedPrompt: input,
      tokenUsage: {
        ...state.tokenUsage,
        inputTokens:
          (state.tokenUsage?.inputTokens || 0) + (usage.inputTokens || 0),
        outputTokens:
          (state.tokenUsage?.outputTokens || 0) + (usage.outputTokens || 0),
      },
    };
  } catch (error) {
    return {
      error: {
        reason: `Failed to generate prompt from PDF: ${
          (error as Error).message
        }`,
        step: PdfAgentNode.GenerateUserPromptFromPDF,
      },
    };
  }
};
