"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "¿Qué tipo de profesionales hay en NAXINE?",
    answer:
      "Trabajamos con profesionales titulados y colegiados, en psicología, nutrición, derecho, logopedia y coaching. Todos pasan por un proceso de verificación documental y evaluación ética.",
  },
  {
    id: 2,
    question: "¿Qué modalidades de sesión puedo elegir?",
    answer:
      "Puedes reservar sesiones en tres modalidades:\n• Online (por videollamada integrada y segura)\n• Presencial (en consulta o centro)\n• A domicilio (el profesional acude a tu ubicación)",
  },
  {
    id: 3,
    question: "¿Cómo sé si un profesional está cualificado?",
    answer:
      "Todos los profesionales están verificados por nuestro equipo. Revisamos sus títulos, colegiación y trayectoria profesional.",
  },
  {
    id: 4,
    question: "¿Es seguro pagar por NAXINE?",
    answer:
      "Sí, usamos Stripe como pasarela de pago segura, cumpliendo con los más altos estándares de protección de datos (incluyendo RGPD).",
  },
  {
    id: 5,
    question: "¿Puedo cancelar o reprogramar una cita?",
    answer:
      "Sí, siempre que lo hagas con al menos 24 horas de antelación. Las condiciones exactas pueden variar según el profesional, y se indican en su perfil.",
  },
  {
    id: 6,
    question: "¿Qué pasa si el profesional no se presenta o hay un problema?",
    answer:
      "Contáctanos. Te ayudaremos a resolverlo rápidamente y, si corresponde, gestionaremos un reembolso.",
  },
  {
    id: 7,
    question: "¿Puedo seguir con el mismo profesional a largo plazo?",
    answer:
      "Claro. Puedes reservar sesiones individuales o continuas con el profesional que elijas, según tus necesidades.",
  },
  {
    id: 8,
    question: "¿Tengo que crear una cuenta para usar NAXINE?",
    answer:
      "Sí. Para reservar, gestionar tus citas y comunicarte con los profesionales, necesitas estar registrado como usuario o cliente.",
  },
  {
    id: 9,
    question: "¿Es NAXINE adecuado para mí?",
    answer:
      "NAXINE puede ser la solución ideal para ti si:\n• Buscas mejorar tu calidad de vida con acompañamiento profesional.\n• Deseas resolver un problema específico en alguna de las áreas disponibles: psicología, nutrición, derecho, logopedia o fisioterapia.\n• Quieres elegir entre sesiones online, presenciales o a domicilio, con profesionales verificados y evaluados por nuestro equipo de calidad.\n\nNAXINE no es adecuado si:\n• Eres menor de edad o estás bajo tutela legal.\n• Estás en una crisis urgente o situación de emergencia.\n• Has sido obligado a realizar terapia por orden judicial u otra autoridad.\n• No cuentas con un dispositivo compatible o conexión estable a Internet para sesiones online.",
  },
  {
    id: 10,
    question: "¿La web de NAXINE es accesible para usuarios con discapacidad?",
    answer:
      "Nos esforzamos por cumplir con las Pautas de Accesibilidad al Contenido Web (WCAG) nivel AA, según los estándares del World Wide Web Consortium (W3C).\n\n• En navegadores de escritorio, puedes activar nuestras herramientas de accesibilidad integradas, que incluyen: aumento de texto, alto contraste, navegación por teclado y por voz.\n• En dispositivos móviles, te recomendamos utilizar las funciones de accesibilidad nativas del sistema operativo (iOS o Android).",
  },
  {
    id: 11,
    question: "¿Cómo protege NAXINE mi privacidad y seguridad?",
    answer:
      "La privacidad y protección de tus datos es una prioridad para NAXINE. Cumplimos con el Reglamento General de Protección de Datos (RGPD) y diseñamos nuestra plataforma siguiendo los principios de privacidad desde el diseño (privacy by design) y seguridad por defecto (security by default).\n\nAquí tienes un resumen de cómo protegemos tu información:\n\n• Autenticación segura con Auth0\nUtilizamos Auth0, una solución líder en identidad, para gestionar el acceso de usuarios y profesionales. Esto garantiza inicios de sesión seguros, controlados y cifrados.\n\n• No almacenamos historiales clínicos ni datos sensibles\nNAXINE no guarda mensajes ni contenidos compartidos durante las sesiones. Toda la información intercambiada queda entre el usuario y el profesional.\n\n• Videollamadas seguras\nLas sesiones online se realizan mediante Google Meet, una plataforma de videollamadas cifrada de extremo a extremo y ampliamente reconocida por sus estándares de seguridad.\n\n• Infraestructura confiable y segura\nNuestra plataforma está alojada en Heroku, sobre infraestructura de Amazon Web Services (AWS), cumpliendo altos estándares de seguridad física y lógica.\n\n• Navegación cifrada y conexiones seguras\nToda la navegación en NAXINE está protegida mediante SSL (Secure Socket Layer) con cifrado moderno, lo que garantiza que tus datos no puedan ser interceptados.\n\n• Control sobre tu cuenta y privacidad\nPuedes eliminar tu cuenta en cualquier momento o solicitar asistencia para la eliminación de tus datos personales de acuerdo con el RGPD.\n\nPara más detalles, consulta nuestra Política de Privacidad o contáctanos si deseas ejercer alguno de tus derechos de protección de datos.",
  },
];

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([1]); // First item open by default

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-4">
        {faqData.map((item) => {
          const isOpen = openItems.includes(item.id);

          return (
            <div
              key={item.id}
              className="border-2 border-purple-300 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-purple-400 transition-all duration-300 ease-in-out"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 rounded-lg hover:bg-purple-50 transition-colors duration-200 ease-in-out"
              >
                <span className="text-gray-900 font-medium text-lg pr-4">
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  <div
                    className={`transform transition-transform duration-300 ease-in-out ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <ChevronDown className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <div className="border-t border-purple-200 pt-4">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
