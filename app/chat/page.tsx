"use client";

import z from "zod";
import { profileSchema } from "../api/search-profiles/schema";
import { TechMatchInput } from "../../components/custom/TechMatchInput";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { ProfileCard } from "./components/profile-card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { InfoCard } from "./components/info-card";
import {
  hidden,
  list,
  profileList,
  springTransition,
  visible,
} from "./animations";
import { information } from "./constants";
import { cn } from "@/lib/utils";
import { ProfileCardSkeleton } from "./components/profile-card-skeleton";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";

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
    api: "/api/search-profiles",
    schema: z.array(profileSchema),
    onFinish: () => {
      setRequestFinished(true);
    },
    onError: (error) => {
      toast.error(
        `Error during profile search: ${
          JSON.parse(error.message)?.details?.reason || "Unknown error"
        }`
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
        formData.append("file", file);

        const pdfResponse = await fetch("/api/process-pdf", {
          method: "POST",
          body: formData,
        });

        if (!pdfResponse.ok) {
          const error = await pdfResponse.json();
          console.error("PDF processing failed:", error);
          toast.error(
            `PDF processing failed: ${
              error?.details?.reason || "Unknown error"
            }`
          );
          setIsProcessingPdf(false);
          return;
        }

        const { prompt } = await pdfResponse.json();

        submit({ input: prompt });
      } catch (err) {
        console.error("Error processing PDF:", err);
        toast.error("Error processing PDF. Please try again.");
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
        <div className="py-6 px-4 gap-0 max-w-7xl mx-auto flex flex-col h-[calc(100vh-88px)] sm:h-[calc(100vh-92px)] w-full relative">
          {/* Hero Section */}

          <motion.section className="flex-1 z-10 justify-center items-center gap-32 flex flex-col relative">
            <AnimatePresence>
              {!requestFinished && !isLoading && (
                <div className="h-full justify-center max-w-4xl text-center flex flex-col gap-2">
                  <motion.h3
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -70, opacity: 0 }}
                    transition={springTransition()}
                    className="text-3xl font-semibold text-balance selection:bg-primary text-slate-200 selection:text-white"
                  >
                    Your AI Talent Assignment Assistant
                  </motion.h3>
                  <motion.p
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -70, opacity: 0 }}
                    transition={springTransition(0.1)}
                    className="text-balance text-gray-400 leading-relaxed selection:bg-secondary-1 selection:text-black"
                  >
                    Optimize developer assignment to projects using AI. Analyze
                    skills, previous experience, and availability to
                    automatically offer you the best match.
                  </motion.p>
                </div>
              )}
            </AnimatePresence>

            {hasItems && (
              <motion.div
                variants={profileList}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="w-full max-w-5xl flex flex-col gap-6 my-10"
              >
                {object?.map((item, index) => (
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
              <div className="relative w-full flex-1 flex flex-col">
                <AnimatePresence>
                  {!hasItems && (
                    <motion.div
                      key="input"
                      className="w-full absolute bottom-[calc(100%+1.5rem)] sm:bottom-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 z-20"
                      transition={springTransition(isLoading ? 0.4 : 0)}
                      variants={{ visible, hidden }}
                      initial="hidden"
                      animate={{
                        opacity: 1,
                        y: isLoading ? 100 : 0,
                        ...(isLoading && { bottom: 120 }),
                      }}
                      exit={{
                        opacity: 0,
                        y: 100,
                        transition: {
                          duration: 0.25,
                          ease: "easeOut",
                        },
                      }}
                    >
                      <TechMatchInput
                        onSubmit={handleSubmit}
                        isProcessingPdf={isProcessingPdf}
                        isLoading={isLoading}
                        onStop={stop}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!isLoading && (
                    <motion.div
                      variants={list}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: 0.3 }}
                      className="flex gap-4"
                    >
                      {information.map((card) => (
                        <InfoCard
                          key={card.id}
                          title={card.title}
                          description={card.description}
                          color={card.color}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1.0 }}
            transition={{ delay: 0.95, duration: 1, ease: "easeOut" }}
            className={cn(
              "fixed top-60 -translate-x-1/2 left-1/2 flex flex-col items-center w-full"
            )}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="-z-10 mask-b-from-50% mask-t-from-50% mask-l-from-50% mask-r-from-50% transition duration-500"
            >
              <img
                src="./sirius-logo.svg"
                className={cn(
                  "w-96 h-96 transition-all duration-500",
                  isLoading &&
                    !hasItems &&
                    "w-40 h-40 animate-[spin_2s_linear_infinite_200ms]"
                )}
              />
            </motion.div>
            <AnimatePresence>
              {isLoading && !hasItems && (
                <motion.p
                  transition={{ delay: 0.5, type: "spring", bounce: 0.25 }}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { delay: 0.0 } }}
                  className="z-40 text-xl absolute left-1/2 -translate-x-1/2 -bottom-10 tracking-wide bg-linear-to-br from-primary to-lime-200 bg-clip-text text-transparent  whitespace-nowrap"
                >
                  Evaluating profiles
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
