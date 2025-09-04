"use client";

import React from "react";

type SeparatorSectionProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function SeparatorSection({
  title,
  subtitle = "",
  className = "",
}: SeparatorSectionProps) {
  return (
    <section className={`w-full bg-white py-8 md:py-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {subtitle ? (
          <p className="text-xs sm:text-sm tracking-wide font-medium text-indigo-500 mb-2">
            {subtitle}
          </p>
        ) : null}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
          {title}
        </h2>
      </div>
    </section>
  );
}
