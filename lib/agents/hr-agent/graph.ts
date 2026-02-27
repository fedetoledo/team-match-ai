import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { validateTextInput } from './nodes/validateTextInput';
import { generateInputEmbedding } from './nodes/generateInputEmbedding';
import { getMatchingProfiles } from './nodes/getMatchingProfiles';
import { Profile } from '@/app/api/search-profiles/types';
import { buildContext } from './nodes/buildContext';

export enum HRAgentNode {
  ValidateTextInput = 'validateTextInput',
  GenerateInputEmbedding = 'generateInputEmbedding',
  GetMatchingProfiles = 'getMatchingProfiles',
  BuildContext = 'buildContext',
}

const HRAgentState = Annotation.Root({
  input: Annotation<string>(),
  validation: Annotation<Partial<{ isValid: boolean }>>(),
  inputEmbedding: Annotation<Array<number>>(),
  matchingProfiles: Annotation<Array<Profile>>(),
  context: Annotation<string>(),
  error: Annotation<{ reason: string; step: HRAgentNode }>(),
  tokenUsage: Annotation<{ inputTokens: number; outputTokens: number }>(),
});

export type HRAgentStateType = Partial<typeof HRAgentState.State>;
const workflow = new StateGraph(HRAgentState)
  .addNode(HRAgentNode.ValidateTextInput, validateTextInput)
  .addNode(HRAgentNode.GenerateInputEmbedding, generateInputEmbedding)
  .addNode(HRAgentNode.GetMatchingProfiles, getMatchingProfiles)
  .addNode(HRAgentNode.BuildContext, buildContext)

  .addEdge(START, HRAgentNode.ValidateTextInput)
  .addConditionalEdges(HRAgentNode.ValidateTextInput, (state) =>
    state.error ? END : HRAgentNode.GenerateInputEmbedding,
  )
  .addConditionalEdges(HRAgentNode.GenerateInputEmbedding, (state) =>
    state.error ? END : HRAgentNode.GetMatchingProfiles,
  )
  .addConditionalEdges(HRAgentNode.GetMatchingProfiles, (state) =>
    state.error ? END : HRAgentNode.BuildContext,
  )
  .addEdge(HRAgentNode.BuildContext, END);

export const hrAgent = workflow.compile();
