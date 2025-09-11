"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

type SeparatorSectionProps = {
  title: string;
  subtitle?: string;
  className?: string;
  transparent?: boolean;
};

export default function SeparatorSection({
  title,
  subtitle = "",
  className = "",
  transparent = false,
}: SeparatorSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true, // Solo se ejecuta una vez
    margin: "-100px 0px -100px 0px", // Se activa 100px antes de ser visible
  });

  return (
    <section
      ref={ref}
      className={`w-full ${
        transparent ? "bg-transparent" : "bg-white"
      } py-8 md:py-12 ${className}`}
    >
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{
          y: 60, // Deslizamiento más notorio desde abajo
          opacity: 0,
        }}
        animate={
          isInView
            ? {
                y: 0,
                opacity: 1,
              }
            : {
                y: 60,
                opacity: 0,
              }
        }
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94], // Curva de easing personalizada para suavidad
          delay: 0.1,
        }}
      >
        {subtitle ? (
          <motion.p
            className="text-xs sm:text-sm tracking-wide font-medium text-indigo-500 mb-2"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.2,
            }}
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-heading text-gray-900"
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3,
          }}
        >
          {title}
        </motion.h2>
      </motion.div>
    </section>
  );
}
