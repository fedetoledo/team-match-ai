'use client';

import { profileSchema } from '@/app/api/search-profiles/schema';
import { z } from 'zod';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { springTransition } from '../animations';
import { getFullNameInitials } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Profile = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  profile: Partial<Profile> | undefined;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition()}
        onClick={() => setIsOpen(true)}
        className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-main-light-blue/30 flex flex-col cursor-pointer transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-pink/20 to-main-light-blue/20 flex items-center justify-center border-2 border-main-light-blue/20">
              <span className="text-sm font-bold text-main-light-blue">
                {getFullNameInitials(profile?.fullName)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {profile?.fullName}
              </h3>
              <p className="text-main-light-blue text-xs font-medium truncate">
                {profile?.jobTitle}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-white">
              {profile?.similarityScore}
            </div>
            <div className="text-xs text-gray-400">match</div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex gap-2 mt-2 text-xs text-gray-400 flex-wrap">
          <span>{profile?.seniority}</span>
          <span>•</span>
          <span>{profile?.location}</span>
        </div>

        {/* Skills Preview */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile?.skills?.slice(0, 3).map((skill, skillIndex) => (
            <span
              key={skillIndex}
              className="px-2 py-0.5 bg-main-light-blue/10 border border-main-light-blue/20 text-main-light-blue rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
          {(profile?.skills?.length ?? 0) > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{(profile?.skills?.length ?? 0) - 3} more
            </span>
          )}
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-pink/20 to-main-light-blue/20 flex items-center justify-center border-2 border-main-light-blue/20">
                <span className="text-lg font-bold text-main-light-blue">
                  {getFullNameInitials(profile?.fullName)}
                </span>
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-white">
                  {profile?.fullName}
                </DialogTitle>
                <p className="text-main-light-blue text-sm font-medium">
                  {profile?.jobTitle}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Match + Meta */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-gray-400 flex-wrap">
                <span>{profile?.seniority}</span>
                <span>•</span>
                <span>{profile?.location}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">
                  {profile?.similarityScore}
                </span>
                <span className="text-xs text-gray-400 ml-1">match</span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1.5">
                Summary
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {profile?.summary}
              </p>
            </div>

            {/* All Skills */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1.5">
                Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile?.skills?.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-0.5 bg-main-light-blue/10 border border-main-light-blue/20 text-main-light-blue rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Experience: </span>
                <span className="text-white">{profile?.experienceYears}</span>
              </div>
              <div>
                <span className="text-gray-400">Office: </span>
                <span className="text-white">{profile?.office}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-gray-700/50">
              <a
                href={`mailto:${profile?.email}`}
                className="inline-flex items-center gap-1.5 text-pink hover:text-pink/80 transition-colors"
              >
                <Mail className="size-4" />
                <span className="font-medium text-sm">{profile?.email}</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
