import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Visual feedback wrappers. Pulse = Bennett Orange flash + slight scale.
 * Shake = claymorphic horizontal jitter.
 */

export function PulseOnKey({ trigger, children }: { trigger: number; children: ReactNode }) {
  return (
    <motion.div
      key={trigger}
      initial={{ scale: 1, boxShadow: '0 0 0 0 rgba(255,107,0,0)' }}
      animate={{
        scale: [1, 1.04, 1],
        boxShadow: [
          '0 0 0 0 rgba(255,107,0,0)',
          '0 0 0 6px rgba(255,107,0,0.40)',
          '0 0 0 0 rgba(255,107,0,0)',
        ],
      }}
      transition={{ duration: 0.40, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function ShakeOnKey({ trigger, children }: { trigger: number; children: ReactNode }) {
  return (
    <motion.div
      key={trigger}
      animate={{ x: [0, -8, 8, -5, 5, 0] }}
      transition={{ duration: 0.30, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
