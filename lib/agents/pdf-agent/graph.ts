import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { validateFileExists } from './nodes/validateFileExists';
import { validateFileSize } from './nodes/validateFileSize';
import { validateFileMimeType } from './nodes/validateMimeType';
import { convertFileToBuffer } from './nodes/convertFileToBuffer';
import { validateContent } from './nodes/validatePDFContent';
import { generatePromptFromPDF } from './nodes/generatePromptFromPDF';

export enum PdfAgentNode {
  ValidateFileExists = 'validateFileExists',
  ValidateFileSize = 'validateFileSize',
  ValidateMimeType = 'validateMimeType',
  ConvertFileToBuffer = 'convertFileToBuffer',
  ValidateContent = 'validateContent',
  GenerateUserPromptFromPDF = 'generatePrompt',
}

const PdfAgentState = Annotation.Root({
  formData: Annotation<FormData>(),
  file: Annotation<File>(),
  fileBuffer: Annotation<Buffer>(),
  validation: Annotation<
    Partial<{
      fileExists: boolean;
      fileSizeValid: boolean;
      mimeTypeValid: boolean;
      contentValid: boolean;
    }>
  >(),
  generatedPrompt: Annotation<string>(),
  error: Annotation<{ reason: string; step: PdfAgentNode }>(),
  tokenUsage: Annotation<{ inputTokens: number; outputTokens: number }>(),
});

export type PdfAgentStateType = Partial<typeof PdfAgentState.State>;

const workflow = new StateGraph(PdfAgentState)
  .addNode(PdfAgentNode.ValidateFileExists, validateFileExists)
  .addNode(PdfAgentNode.ValidateFileSize, validateFileSize)
  .addNode(PdfAgentNode.ValidateMimeType, validateFileMimeType)
  .addNode(PdfAgentNode.ConvertFileToBuffer, convertFileToBuffer)
  .addNode(PdfAgentNode.ValidateContent, validateContent)
  .addNode(PdfAgentNode.GenerateUserPromptFromPDF, generatePromptFromPDF)

  .addEdge(START, PdfAgentNode.ValidateFileExists)
  .addConditionalEdges(PdfAgentNode.ValidateFileExists, (state) =>
    state.error ? END : PdfAgentNode.ValidateFileSize,
  )
  .addConditionalEdges(PdfAgentNode.ValidateFileSize, (state) =>
    state.error ? END : PdfAgentNode.ValidateMimeType,
  )
  .addConditionalEdges(PdfAgentNode.ValidateMimeType, (state) =>
    state.error ? END : PdfAgentNode.ConvertFileToBuffer,
  )
  .addConditionalEdges(PdfAgentNode.ConvertFileToBuffer, (state) =>
    state.error ? END : PdfAgentNode.ValidateContent,
  )
  .addConditionalEdges(PdfAgentNode.ValidateContent, (state) =>
    state.error ? END : PdfAgentNode.GenerateUserPromptFromPDF,
  )
  .addEdge(PdfAgentNode.GenerateUserPromptFromPDF, END);

export const pdfAgent = workflow.compile();
