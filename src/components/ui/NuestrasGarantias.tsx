"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

import thumbnail from "@/assets/screenshot.png";
import dotsSquare from "@/assets/Vector.png";
import dotsCircle from "@/assets/Vector 363.svg";
import dotsTriangle from "@/assets/Group 259.svg";

export default function NuestrasGarantias() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 px-4 sm:px-6 md:px-10 lg:px-[80px] bg-white overflow-hidden"
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-40 h-40 opacity-90"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 0.9 } : { scale: 0.8, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.1,
        }}
      >
        <img
          src={dotsSquare.src}
          alt="Decorative pattern"
          className="w-full h-full object-cover rounded-lg"
        />
      </motion.div>

      <motion.div
        className="absolute top-20 right-20 w-40 h-40 opacity-90 transform translate-x-12 -translate-y-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 0.9 } : { scale: 0.8, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2,
        }}
      >
        <img
          src={dotsTriangle.src}
          alt="Decorative circle"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 w-32 h-20 opacity-90 transform translate-x-16 translate-y-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 0.9 } : { scale: 0.8, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.3,
        }}
      >
        <img
          src={dotsCircle.src}
          alt="Decorative shape"
          className="w-full h-full object-cover rounded-lg"
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Text content */}
        <div className="text-center mb-12">
          <motion.p
            className="text-primary text-lg font-medium mb-2"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.4,
            }}
          >
            Nos comprometemos a ayudarte.
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.5,
            }}
          >
            Conoce nuestras garantías
          </motion.h2>
        </div>

        {/* Video container */}
        <motion.div
          className="relative w-full max-w-6xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }
          }
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.6,
          }}
        >
          <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
            <video
              className="w-full h-full object-cover"
              poster={thumbnail.src}
              controls
              preload="metadata"
              playsInline
            >
              <source src="/Naxine_V1_Music.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
