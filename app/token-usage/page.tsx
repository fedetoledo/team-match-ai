import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { HistoryList } from './components/list';

export interface QueryHistory {
  id: number;
  query: string;
  response: string;
  input_tokens: number;
  output_tokens: number;
  username: string;
  created_at: string;
  model_used: string;
}

const TokenUsage = async () => {
  const username = 'demo';

  const data = await fetch(`${process.env.API_BASE_URL}/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (!data.ok) {
    throw new Error('Failed to fetch token usage data');
  }

  const tokenUsage: QueryHistory[] = await data.json();

  // Sort by created_at (newest first)
  const sortedHistory = [...tokenUsage].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="min-h-screen bg-bg p-4">
      <nav className="max-w-7xl mx-auto flex justify-between items-center w-full z-20 bg-bg/60 backdrop-blur-lg px-4 mb-10">
        <div>
          <h1 className="md:text-3xl text-2xl font-extrabold text-primary inline-block font-inter tracking-tight">
            HR AI Assistant
          </h1>
          <h2 className="text-gray-400">
            Intelligent Technical Recruiting Agent
          </h2>
        </div>

        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="uppercase font-medium text-slate-300 text-sm flex items-center gap-2 cursor-pointer hover:text-primary/90 transition-colors">
              <Settings2 size={16} />
              <span>Menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="uppercase">Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/chat">Chat</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/token-usage">Token Usage</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-main-light-blue mb-8">
          Search History
        </h1>

        {sortedHistory.length === 0 ? (
          <p className="text-gray-400">No searches recorded.</p>
        ) : (
          <div className="space-y-4">
            <HistoryList items={sortedHistory} />
          </div>
        )}
      </div>
    </div>
  );
};
export default TokenUsage;
