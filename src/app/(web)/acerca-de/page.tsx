import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  ACERCA DE
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-secondary leading-tight">
                  NAXINE es una plataforma digital que facilita el acceso a
                  servicios profesionales
                </h1>
              </div>

              <div className="space-y-4 text-secondary/80 text-base sm:text-lg leading-relaxed">
                <p>
                  NAXINE es una plataforma digital especializada en servicios
                  profesionales de salud, nutrición, asesoría legal, coaching,
                  logopedia y fisioterapia. Conectamos a nuestros usuarios con
                  especialistas verificados y colegiados en un entorno digital
                  ético, seguro y sin barreras.
                </p>
                <p>
                  Creemos que la ayuda profesional no debe ser complicada,
                  costosa o intimidante. Por eso, hemos creado un espacio
                  simple, transparente y cercano para el acompañamiento experto,
                  facilitando el contacto entre profesionales y usuarios,
                  promoviendo relaciones humanas, procesos claros y soluciones
                  reales.
                </p>
                <p>
                  Si estás pasando por momentos difíciles, tomando decisiones
                  importantes o simplemente deseas mejorar tu calidad de vida,
                  en NAXINE encontrarás profesionales comprometidos con tu
                  bienestar.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/empresarios-felices-trabajando-juntos-en-un-proyecto-en-la-oficina.webp"
                  alt="Profesional de NAXINE"
                  width={500}
                  height={600}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Mission Card */}
            <div className="bg-primary/10 rounded-2xl p-8 lg:p-12 text-center">
              <h3 className="text-xl lg:text-2xl font-bold text-secondary mb-4">
                Misión
              </h3>
              <p className="text-secondary/80 text-base lg:text-lg leading-relaxed">
                Conectar a las personas con profesionales verificados que puedan
                transformar su bienestar emocional, físico y legal, a través de
                una plataforma ética, segura, accesible y fácil de usar.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-primary/10 rounded-2xl p-8 lg:p-12 text-center">
              <h3 className="text-xl lg:text-2xl font-bold text-secondary mb-4">
                Visión
              </h3>
              <p className="text-secondary/80 text-base lg:text-lg leading-relaxed">
                Ser la plataforma de referencia para encontrar asesoría
                confiable en salud mental, desarrollo personal y servicios
                legales, con un enfoque inclusivo y centrado en el bienestar
                integral de las personas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Trust */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-secondary">Confianza</h3>
                <p className="text-secondary/80 text-sm leading-relaxed">
                  Solo trabajamos con profesionales colegiados y verificados.
                </p>
              </div>
            </div>

            {/* Closeness */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-secondary">Cercanía</h3>
                <p className="text-secondary/80 text-sm leading-relaxed">
                  Fomentamos una comunicación clara, empática y sin tecnicismos
                  innecesarios.
                </p>
              </div>
            </div>

            {/* Transparency */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-secondary">
                  Transparencia
                </h3>
                <p className="text-secondary/80 text-sm leading-relaxed">
                  Mostramos siempre precios, condiciones y procesos de forma
                  abierta.
                </p>
              </div>
            </div>

            {/* Ethical Innovation */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-secondary">
                  Innovación ética
                </h3>
                <p className="text-secondary/80 text-sm leading-relaxed">
                  Apostamos por una tecnología responsable que protege la
                  privacidad y mejora la accesibilidad.
                </p>
              </div>
            </div>

            {/* Inclusive Design */}
            <div className="flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-secondary">
                  Diseño inclusivo
                </h3>
                <p className="text-secondary/80 text-sm leading-relaxed">
                  Creamos experiencias digitales accesibles para todas las
                  personas, cumpliendo con estándares internacionales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text */}
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary">
                Nuestro equipo
              </h2>

              <div className="space-y-4 text-secondary/80 text-base leading-relaxed">
                <p>
                  Somos un equipo apasionado por facilitar el acceso a servicios
                  profesionales que mejoren la vida de las personas. Nos mueve
                  la empatía, la excelencia en la experiencia de usuario y el
                  deseo de generar un impacto positivo a través de la
                  tecnología.
                </p>
                <p>
                  Estamos creciendo rápido y siempre buscamos personas
                  talentosas y vocacionales que quieran marcar la diferencia.
                </p>
                <p>
                  Si te apasiona acompañar a otros, crees en el poder de la
                  atención profesional y te motivan los retos, nos encantará
                  conocerte. Únete a NAXINE y forma parte de una plataforma que
                  pone a las personas en el centro.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/pexels-kampus-8171189.webp"
                  alt="Profesional de salud de NAXINE"
                  width={500}
                  height={600}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/grupo-de-jovenes-colegas-de-negocios-caminando-juntos.webp"
                  alt="Impacto social de NAXINE"
                  width={500}
                  height={600}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>

            {/* Right side - Text */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary">
                Impacto social
              </h2>

              <div className="space-y-4 text-secondary/80 text-base leading-relaxed">
                <p>
                  En NAXINE creemos que el apoyo profesional no debe ser
                  complejo ni inaccesible. Por eso, trabajamos para simplificar
                  la búsqueda y contratación de servicios esenciales de
                  bienestar, con un enfoque desde el inicio en la accesibilidad
                  y la usabilidad.
                </p>
                <p>
                  Desarrollamos alianzas con asociaciones que apoyan a personas
                  con discapacidad, grupos vulnerables y organizaciones sin
                  ánimo de lucro para facilitar el acceso a servicios
                  profesionales.
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary/80 text-sm leading-relaxed">
                    La aplicación de criterios de accesibilidad digital en toda
                    la plataforma.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary/80 text-sm leading-relaxed">
                    Un enfoque de diseño y comunicación inclusivo y respetuoso.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary/80 text-sm leading-relaxed">
                    La apertura a colaboraciones con profesionales y
                    organizaciones sociales que compartan nuestra visión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
