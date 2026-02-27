/* eslint-disable @next/next/no-img-element */
'use client';

import z from 'zod';
import { profileSchema } from '../api/search-profiles/schema';
import { SearchInput } from '../../components/custom/search-input';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState } from 'react';
import { ProfileCard } from './components/profile-card';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'motion/react';
import { profileList, staggerContainer, staggerItem } from './animations';
import { cn } from '@/lib/utils';
import { ProfileCardSkeleton } from './components/profile-card-skeleton';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';

export default function Home() {
  const [requestFinished, setRequestFinished] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const {
    isLoading: searchingProfiles,
    object,
    clear,
    submit,
    stop,
  } = useObject({
    api: '/api/search-profiles',
    schema: z.array(profileSchema),
    onFinish: () => {
      setRequestFinished(true);
    },
    onError: (error) => {
      toast.error(
        `Error during profile search: ${
          JSON.parse(error.message)?.details?.reason || 'Unknown error'
        }`,
      );
    },
  });

  const hasItems = Boolean(object && object.length > 0);
  const isLoading = searchingProfiles || isProcessingPdf;

  const handleNewSearch = () => {
    setRequestFinished(false);
    clear();
  };

  const handleSubmit = async ({
    input,
    file,
  }: {
    input?: string;
    file?: File;
  }) => {
    if (file) {
      setIsProcessingPdf(true);
      try {
        // Step 1: Send PDF to processing endpoint
        const formData = new FormData();
        formData.append('file', file);

        const pdfResponse = await fetch('/api/process-pdf', {
          method: 'POST',
          body: formData,
        });

        if (!pdfResponse.ok) {
          const error = await pdfResponse.json();
          console.error('PDF processing failed:', error);
          toast.error(
            `PDF processing failed: ${
              error?.details?.reason || 'Unknown error'
            }`,
          );
          setIsProcessingPdf(false);
          return;
        }

        const { prompt } = await pdfResponse.json();

        submit({ input: prompt });
      } catch (err) {
        console.error('Error processing PDF:', err);
        toast.error('Error processing PDF. Please try again.');
      } finally {
        setIsProcessingPdf(false);
      }

      return;
    }

    if (!input?.trim()) return;
    submit({ input });
  };

  return (
    <main className="w-full h-dvh">
      <Navbar
        hasItems={hasItems}
        isLoading={isLoading}
        handleNewSearch={handleNewSearch}
      />

      <div className="flex gap-2 w-full">
        <div className="py-6 px-4 justify-center gap-0 max-w-7xl mx-auto flex flex-col h-[calc(100vh-88px)] sm:h-[calc(100vh-92px)] w-full relative">
          <section className="z-10 justify-center items-center gap-10 flex flex-col relative">
            <AnimatePresence mode="wait">
              {!hasItems && !requestFinished && !isLoading && (
                <motion.div
                  key="hero"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="h-24 flex items-center justify-center max-w-4xl text-center flex-col gap-2"
                >
                  <motion.h3
                    variants={staggerItem}
                    className="text-3xl font-semibold text-balance selection:bg-primary text-slate-200 selection:text-white"
                  >
                    Your AI Talent Assignment Assistant
                  </motion.h3>
                  <motion.p
                    variants={staggerItem}
                    className="text-balance text-gray-400 leading-relaxed selection:bg-secondary-1 selection:text-black"
                  >
                    Optimize developer assignment to projects using AI. Analyze
                    skills, previous experience, and availability to
                    automatically offer you the best match.
                  </motion.p>
                </motion.div>
              )}

              {!hasItems && isLoading && (
                <motion.p
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-24 flex items-center justify-center text-xl tracking-wide text-white whitespace-nowrap"
                >
                  Evaluating profiles
                </motion.p>
              )}
            </AnimatePresence>

            {hasItems && (
              <motion.div
                variants={profileList}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="w-full h-full grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4"
              >
                {object?.slice(0, 9).map((item, index) => (
                  <ProfileCard
                    key={`${
                      item?.fullName?.trim() || `profile-${index}`
                    }-${index}`}
                    // @ts-expect-error profile is Partial<Profile>
                    profile={item}
                  />
                ))}

                {!requestFinished && <ProfileCardSkeleton />}
              </motion.div>
            )}

            {requestFinished && !hasItems && (
              <div className="w-full items-center justify-center flex flex-col gap-4 flex-1">
                <p>No profiles found for your search</p>
                <Button disabled={isLoading} onClick={handleNewSearch}>
                  New search
                </Button>
              </div>
            )}

            {!requestFinished && (
              <div className="relative w-full flex flex-col">
                <AnimatePresence mode="wait">
                  {!hasItems && (
                    <motion.div
                      key="input"
                      className="w-full z-20"
                      transition={{
                        duration: 0.6,
                        ease: 'backOut',
                        delay: 0.6,
                      }}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 50,
                        transition: {
                          duration: 0.25,
                          ease: 'easeOut',
                        },
                      }}
                    >
                      <SearchInput
                        onSubmit={handleSubmit}
                        isProcessingPdf={isProcessingPdf}
                        isLoading={isLoading}
                        onStop={stop}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'fixed top-0 -translate-x-1/2 left-1/2 flex flex-col items-center w-full',
            )}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4, transition: { delay: 0.9 } }}
              className="-z-10 mask-b-from-50% mask-t-from-50% mask-l-from-50% mask-r-from-50% transition duration-500"
            >
              <img
                alt="Background pattern"
                src="./background.webp"
                className="w-full h-200 transition-all duration-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
