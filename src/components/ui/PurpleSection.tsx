"use client";

interface PurpleSectionProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  backgroundImage?: string;
}

export default function PurpleSection({ title, subtitle }: PurpleSectionProps) {
  const videoSrc = "/50e8517f-97ff-6992-285d-6fce4971ddd0_custom (1) (1) (3).mp4";

  return (
    <section className="relative w-full overflow-hidden bg-black px-4 sm:px-6 md:px-10 lg:px-16 py-20 md:py-28">
      {/* Video Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          tabIndex={-1}
          role="presentation"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#10002b]/90 via-primary/80 to-primary/70" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid gap-10 items-center">
          {/* Content */}
          <div className="space-y-6 text-white text-center max-w-3xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-white/85">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
