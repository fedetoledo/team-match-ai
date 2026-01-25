import { Loader2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface NavbarProps {
  hasItems: boolean;
  isLoading: boolean;
  handleNewSearch: () => void;
}

export const Navbar = ({
  hasItems,
  isLoading,
  handleNewSearch,
}: NavbarProps) => {
  return (
    <nav className='max-w-7xl mx-auto flex justify-between items-center w-full sticky top-0 z-20 bg-bg/60 backdrop-blur-lg p-4'>
      <div>
        <h1 className='md:text-3xl text-2xl font-extrabold sirius-gradient inline-block bg-clip-text text-transparent font-inter tracking-tight'>
          TechMatch Bot
        </h1>
        <h2 className='text-gray-400'>
          Intelligent Technical Resource Assignment Agent
        </h2>
      </div>

      <div className='flex gap-4'>
        {hasItems && (
          <div className='flex items-center gap-10'>
            {isLoading && (
              <span className='flex items-center gap-2 text-gray-400'>
                Evaluating Profiles <Loader2 className='animate-spin' />
              </span>
            )}
            <Button size='sm' disabled={isLoading} onClick={handleNewSearch}>
              New search
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className='uppercase font-medium text-slate-300 text-sm flex items-center gap-2 cursor-pointer hover:text-primary/90 transition-colors'>
            <Settings2 size={16} />
            <span>Menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel className='uppercase'>Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/token-usage'>Token Usage</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
