"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

import thumbnail from "@/assets/screenshot.png";

export default function AccesibilitySection() {
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
      <div className="relative z-10 max-w-7xl mx-auto">
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
            delay: 0.1,
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
