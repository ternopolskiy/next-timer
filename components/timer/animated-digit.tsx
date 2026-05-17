"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnimatedDigitProps {
  value: number;
}

export function AnimatedDigit({ value }: AnimatedDigitProps) {
  return (
    <div className="relative h-12 w-8 sm:h-20 sm:w-12 md:h-24 md:w-14 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
