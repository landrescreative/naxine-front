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
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">
                  ACERCA DE
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
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
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
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
            <div className="bg-primary/10 rounded-2xl p-6 lg:p-8">
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
            <div className="bg-primary/10 rounded-2xl p-6 lg:p-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Trust */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-secondary">Confianza</h3>
              <p className="text-secondary/80 text-sm leading-relaxed max-w-xs">
                Solo trabajamos con profesionales colegiados y verificados.
              </p>
            </div>

            {/* Closeness */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-secondary">Cercanía</h3>
              <p className="text-secondary/80 text-sm leading-relaxed max-w-xs">
                Fomentamos una comunicación clara, empática y sin tecnicismos
                innecesarios.
              </p>
            </div>

            {/* Transparency */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
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
              <h3 className="text-lg font-bold text-secondary">
                Transparencia
              </h3>
              <p className="text-secondary/80 text-sm leading-relaxed max-w-xs">
                Mostramos siempre precios, condiciones y procesos de forma
                abierta.
              </p>
            </div>

            {/* Ethical Innovation */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
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
              <h3 className="text-lg font-bold text-secondary">
                Innovación ética
              </h3>
              <p className="text-secondary/80 text-sm leading-relaxed max-w-xs">
                Apostamos por una tecnología responsable que protege la
                privacidad y mejora la accesibilidad.
              </p>
            </div>

            {/* Inclusive Design */}
            <div className="flex flex-col items-center text-center space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-secondary">
                Diseño inclusivo
              </h3>
              <p className="text-secondary/80 text-sm leading-relaxed max-w-xs">
                Creamos experiencias digitales accesibles para todas las
                personas, cumpliendo con estándares internacionales.
              </p>
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
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
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
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
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
