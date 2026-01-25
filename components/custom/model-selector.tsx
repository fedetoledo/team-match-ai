import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSelectedModelClient, LLM_MODEL } from '@/lib/llm_model';
import { useState } from 'react';

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<LLM_MODEL>(
    getSelectedModelClient()
  );
  const [isLoading, setIsLoading] = useState(false);
  const handleSetModel = async (model: string) => {
    setIsLoading(true);
    fetch('/api/set-model', {
      method: 'POST',
      body: JSON.stringify({ model }),
    }).then(() => {
      setIsLoading(false);
      setSelectedModel(model as LLM_MODEL);
    });
  };
  return (
    <Select defaultValue={selectedModel} onValueChange={handleSetModel}>
      <SelectTrigger className='w-[190px]'>
        {isLoading ? (
          <span>Switching model...</span>
        ) : (
          <SelectValue defaultChecked placeholder='Select a model' />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          <SelectItem value='gemini-2.5-flash-lite'>
            Gemini 2.5 Flash Lite
          </SelectItem>
          <SelectItem value='gemini-2.5-flash'>Gemini 2.5 Flash</SelectItem>
          <SelectItem value='gemini-2.5-pro'>Gemini 2.5 Pro</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
