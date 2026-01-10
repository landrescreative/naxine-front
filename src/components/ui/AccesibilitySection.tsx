"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

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
      </div>
    </section>
  );
}
