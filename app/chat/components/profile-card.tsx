'use client';

import { profileSchema } from '@/app/api/search-profiles/schema';
import { z } from 'zod';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { springTransition } from '../animations';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { getFullNameInitials } from '@/lib/utils';

type Profile = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  profile: Partial<Profile> | undefined;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition()}
      className='min-h-[185px] bg-linear-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-main-light-blue/30'
    >
      <div className='flex gap-4 items-start'>
        {/* Profile Picture */}
        <div className='shrink-0'>
          {profile?.profilePictureUrl ? (
            <ImageWithFallback
              src={profile?.profilePictureUrl}
              className='w-16 h-16 rounded-full object-cover border-2 border-main-light-blue/20'
              fallbackText={getFullNameInitials(profile?.fullName)}
              alt={profile?.fullName ?? 'user photo'}
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-linear-to-br from-pink/20 to-main-light-blue/20 flex items-center justify-center border-2 border-main-light-blue/20'>
              <span className='text-xl font-bold text-main-light-blue'>
                {profile?.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className='w-full'>
          {/* Header - Always Visible */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h3 className='text-xl font-bold text-white truncate'>
                {profile?.fullName}
              </h3>
              <p className='text-main-light-blue text-sm font-medium'>
                {profile?.jobTitle}
              </p>
              <div className='flex gap-2 mt-1 text-xs text-gray-400 flex-wrap'>
                <span>{profile?.seniority}</span>
                <span>•</span>
                <span>{profile?.location}</span>
              </div>
            </div>
            <div className='text-right shrink-0'>
              <div className='text-2xl font-bold sirius-gradient bg-clip-text text-transparent'>
                {profile?.similarityScore}
              </div>
              <div className='text-xs text-gray-400'>match</div>
            </div>
          </div>

          {/* Top Skills Preview */}
          <div className='flex flex-wrap gap-1.5 mt-3'>
            {profile?.skills?.slice(0, 3).map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className='px-2 py-0.5 bg-main-light-blue/10 border border-main-light-blue/20 text-main-light-blue rounded-full text-xs'
              >
                {skill}
              </span>
            ))}
            {(profile?.skills?.length ?? 0) > 3 && (
              <span className='px-2 py-0.5 text-gray-400 text-xs'>
                +{(profile?.skills?.length ?? 0) - 3} more
              </span>
            )}
          </div>

          {/* Collapsible Details */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className='space-y-4 mt-4 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
              {/* Summary */}
              <div className='pt-3 border-t border-gray-700/50'>
                <h4 className='text-xs font-semibold text-gray-400 mb-1.5'>
                  Summary
                </h4>
                <p className='text-sm text-gray-300 leading-relaxed'>
                  {profile?.summary}
                </p>
              </div>

              {/* All Skills */}
              <div>
                <h4 className='text-xs font-semibold text-gray-400 mb-1.5'>
                  All skills
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {profile?.skills?.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className='px-2 py-0.5 bg-main-light-blue/10 border border-main-light-blue/20 text-main-light-blue rounded-full text-xs'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div>
                  <span className='text-gray-400'>Area: </span>
                  <span className='text-white'>{profile?.area}</span>
                </div>
                <div>
                  <span className='text-gray-400'>Office: </span>
                  <span className='text-white'>{profile?.office}</span>
                </div>
                <div className='col-span-2'>
                  <span className='text-gray-400'>Contract: </span>
                  <span className='text-white'>
                    {profile?.contractType?.join(', ')}
                  </span>
                </div>
              </div>
            </CollapsibleContent>

            <div className='flex items-center mt-4 pt-4 justify-between border-t border-gray-700/50'>
              <a
                href={`mailto:${profile?.email}`}
                className='flex items-center gap-1.5 text-pink hover:text-pink/80 transition-colors'
              >
                <Mail className='size-4' />
                <span className='font-medium text-sm leading-0'>Contact</span>
              </a>
              <CollapsibleTrigger className='cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-main-light-blue transition-colors'>
                {isOpen ? 'See less' : 'See more'}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
            </div>
          </Collapsible>
        </div>
      </div>
    </motion.div>
  );
};
