"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import office from "@/assets/d000ab4e4d45c2420e8885344d33c191b167b033.png";

export default function GlobalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

  return (
    <>
      <section
        ref={sectionRef}
        className="w-full flex flex-col lg:flex-row max-h-[500px]"
      >
        {/* Left Section - Purple Background (50% on desktop, full width on mobile) */}
        <div className="w-full lg:w-[50%] bg-primary flex items-center px-6 sm:px-12 lg:px-32 py-8 lg:py-6">
          <motion.div
            className="max-w-sm mx-auto lg:mx-0 text-center lg:text-left"
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.3, // Aparece después de la imagen
            }}
          >
            <h2 className="text-white text-3xl sm:text-4xl lg:text-4xl font-bold leading-tight mb-4">
              Cómo funciona
            </h2>
            <p className="text-white text-base sm:text-lg leading-relaxed">
              Elige el servicio que necesitas, envía tu solicitud o mensaje
              directo y acuerda los detalles fácilmente desde tu panel.
            </p>
          </motion.div>
        </div>

        {/* Right Section - Office Image (50% on desktop, full width on mobile) */}
        <motion.div
          className="w-full lg:w-[50%] relative h-[300px] lg:h-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }
          }
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1, // Aparece primero
          }}
        >
          <img
            src={office.src}
            alt="Office workspace with man on phone"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
    </>
  );
}
