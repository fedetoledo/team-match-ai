'use client';

import { hidden, list, springTransition, visible } from '@/app/chat/animations';
import { motion } from 'motion/react';
import { QueryHistory } from '@/lib/history';
import { LLM_MODEL, modelCost } from '@/lib/llm_model';

interface HistoryListProps {
  items: QueryHistory[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate cost based on model used and tokens
const calculateCost = (
  modelUsed: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const model = modelUsed as LLM_MODEL;
  const costs = modelCost[model];

  if (!costs) {
    return 0; // Return 0 if model not found
  }

  const inputCost = inputTokens * costs.input;
  const outputCost = outputTokens * costs.output;

  return inputCost + outputCost;
};

export const HistoryList = ({ items }: HistoryListProps) => {
  return (
    <motion.div
      variants={list}
      initial='hidden'
      animate='visible'
      className='flex flex-col gap-4'
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={{ visible, hidden }}
          transition={springTransition()}
          className='bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-main-light-blue/50 transition-colors'
        >
          <div className='mb-3'>
            <h3 className='text-lg font-medium text-white truncate'>
              {item.query}
            </h3>
            <p className='text-sm text-gray-400 mt-1'>
              {formatDate(item.created_at)}
            </p>
          </div>

          <div className='flex flex-wrap gap-6 text-sm'>
            <div>
              <span className='text-gray-400'>Input tokens: </span>
              <span className='text-main-light-blue font-semibold'>
                {item.input_tokens.toLocaleString()}
              </span>
            </div>
            <div>
              <span className='text-gray-400'>Output tokens: </span>
              <span className='text-pink font-semibold'>
                {item.output_tokens.toLocaleString()}
              </span>
            </div>
            <div>
              <span className='text-gray-400'>Estimated cost: </span>
              <span className='text-green-400 font-semibold'>
                $
                {calculateCost(
                  item.model_used,
                  item.input_tokens,
                  item.output_tokens
                ).toFixed(6)}
              </span>
            </div>
            <div>
              <span className='text-gray-400'> Model used: </span>
              <span className='text-gray-300'>{item.model_used}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
