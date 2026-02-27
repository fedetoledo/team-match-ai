import { stagger, Transition } from 'motion';

export const visible = {
  opacity: 1,
  y: 0,
};
export const hidden = { opacity: 0, y: 50 };

export const springTransition = (delay?: number) =>
  ({
    type: 'spring',
    bounce: 0.2,
    duration: 1,
    ...(delay ? { delay } : {}),
  }) as Transition;

export const list = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      delayChildren: stagger(0.12),
      delay: 0.4,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      delayChildren: stagger(0.12, { from: 'last' }),
    },
  },
};

export const profileList = {
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { ease: 'backOut', duration: 0.6 } },
  exit: { opacity: 0, y: -50 },
} as const;
