'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    setIsLoading(false);

    if (result.ok) {
      // Handle successful login (e.g., redirect to dashboard)
      toast.success('Sign in successful');
      redirect('/chat');
    } else {
      // Handle login error (e.g., show error message)
      console.error('Login failed');
    }
  };

  return (
    <div className='w-full flex items-center h-dvh relative'>
      <div className='max-w-xl mx-auto rounded-2xl border border-slate-700 w-full p-4 bg-slate-700/20 backdrop-blur-xl z-20'>
        <FieldSet className='w-full'>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='username'>Username</FieldLabel>
              <Input
                id='username'
                type='text'
                placeholder='Max Leiter'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FieldDescription className='text-gray-400'>
                Choose a unique username for your account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor='password'>Password</FieldLabel>
              <FieldDescription className='text-gray-400'>
                Must be at least 8 characters.
              </FieldDescription>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !username || !password}
            className='w-full mt-4'
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </FieldSet>
      </div>

      <div className='absolute mask-b-from-50% mask-t-from-50% mask-l-from-50% mask-r-from-50% transition duration-500 left-1/2 -translate-x-1/2'>
        <img src='sirius-logo.svg' className='size-96 opacity-50' />
      </div>
    </div>
  );
}
