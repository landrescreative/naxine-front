import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email del remitente y destinatario
const FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || "noreply@naxine.com";
const TO_EMAIL =
  process.env.SENDGRID_TO_EMAIL || process.env.ADMIN_EMAIL || FROM_EMAIL;

export async function POST(request: NextRequest) {
  try {
    // Verificar que SendGrid esté configurado
    if (!process.env.SENDGRID_API_KEY) {
      console.error("[Alta Profesional] SENDGRID_API_KEY no configurada");
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de email no disponible. Por favor, contacta con soporte.",
        },
        { status: 500 }
      );
    }

    // Obtener los datos del formulario (FormData)
    const formData = await request.formData();

    // Extraer datos del formulario
    const correo = formData.get("correo")?.toString() || "";
    const consentimiento = formData.get("consentimiento")?.toString() === "true";
    const nombreApellidos = formData.get("nombreApellidos")?.toString() || "";
    const titulacion = formData.get("titulacion")?.toString() || "";
    const numeroColegiado = formData.get("numeroColegiado")?.toString() || "";
    const correoProfesionalPublico = formData.get("correoProfesionalPublico")?.toString() || "";
    const descripcion = formData.get("descripcion")?.toString() || "";
    const videoPresentacion = formData.get("videoPresentacion")?.toString() || "";
    
    // Parsear arrays
    const modalidadesStr = formData.get("modalidades")?.toString() || "[]";
    const modalidades = JSON.parse(modalidadesStr) as string[];
    
    const direccionConsulta = formData.get("direccionConsulta")?.toString() || "";
    const zonasDomicilio = formData.get("zonasDomicilio")?.toString() || "";
    const accesibleMovilidad = formData.get("accesibleMovilidad")?.toString() || "";
    const horarios = formData.get("horarios")?.toString() || "";
    
    const calendarioStr = formData.get("calendario")?.toString() || "[]";
    const calendario = JSON.parse(calendarioStr) as string[];
    
    const servicios = formData.get("servicios")?.toString() || "";
    const tarifas = formData.get("tarifas")?.toString() || "";
    const observaciones = formData.get("observaciones")?.toString() || "";

    // Obtener archivo de foto
    const foto = formData.get("foto") as File | null;

    // Validar campos requeridos
    const requiredFields = {
      correo,
      nombreApellidos,
      titulacion,
      numeroColegiado,
      correoProfesionalPublico,
      descripcion,
      accesibleMovilidad,
      horarios,
      servicios,
      tarifas,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || !value.trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Faltan campos requeridos: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!consentimiento) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes aceptar el consentimiento de tratamiento de datos",
        },
        { status: 400 }
      );
    }

    if (modalidades.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes seleccionar al menos una modalidad de atención",
        },
        { status: 400 }
      );
    }

    if (calendario.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes seleccionar al menos un calendario",
        },
        { status: 400 }
      );
    }

    if (!foto) {
      return NextResponse.json(
        {
          success: false,
          error: "La foto del perfil profesional es requerida",
        },
        { status: 400 }
      );
    }

    // Validar que si ofrece presencial, tenga dirección
    if (modalidades.includes("presencial") && !direccionConsulta.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "La dirección de consulta es requerida si ofreces atención presencial",
        },
        { status: 400 }
      );
    }

    // Validar formato de emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        {
          success: false,
          error: "El formato del correo no es válido",
        },
        { status: 400 }
      );
    }

    if (!emailRegex.test(correoProfesionalPublico)) {
      return NextResponse.json(
        {
          success: false,
          error: "El formato del correo electrónico profesional no es válido",
        },
        { status: 400 }
      );
    }

    // Validar descripción (máx. 1.500 caracteres)
    if (descripcion.length > 1500) {
      return NextResponse.json(
        {
          success: false,
          error: "La descripción no debe superar los 1.500 caracteres",
        },
        { status: 400 }
      );
    }

    // Validar URL de video si se proporciona
    if (videoPresentacion) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
      if (!youtubeRegex.test(videoPresentacion) && !vimeoRegex.test(videoPresentacion)) {
        return NextResponse.json(
          {
            success: false,
            error: "El enlace al vídeo debe ser de YouTube o Vimeo",
          },
          { status: 400 }
        );
      }
    }

    // Convertir foto a buffer para adjuntar al email
    let fotoAttachment = null;
    if (foto) {
      const arrayBuffer = await foto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fotoAttachment = {
        content: buffer.toString("base64"),
        filename: foto.name || "foto-perfil.jpg",
        type: foto.type || "image/jpeg",
        disposition: "attachment",
      };
    }

    // Preparar el contenido del email
    const modalidadesTexto = modalidades
      .map((m) => {
        if (m === "domicilio") return "A domicilio";
        return m.charAt(0).toUpperCase() + m.slice(1);
      })
      .join(", ");

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #FF6600; padding-bottom: 10px;">
          Nueva Solicitud de Alta como Profesional
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Datos del Profesional</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666; width: 40%;">Correo:</td>
              <td style="padding: 8px 0; color: #333;">
                <a href="mailto:${correo}" style="color: #FF6600; text-decoration: none;">
                  ${correo}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Nombre y apellidos:</td>
              <td style="padding: 8px 0; color: #333;">${nombreApellidos}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Titulación profesional:</td>
              <td style="padding: 8px 0; color: #333;">${titulacion}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Número de colegiado/a:</td>
              <td style="padding: 8px 0; color: #333;">${numeroColegiado}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Correo electrónico profesional:</td>
              <td style="padding: 8px 0; color: #333;">
                <a href="mailto:${correoProfesionalPublico}" style="color: #FF6600; text-decoration: none;">
                  ${correoProfesionalPublico}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Modalidades de atención:</td>
              <td style="padding: 8px 0; color: #333;">${modalidadesTexto}</td>
            </tr>
            ${direccionConsulta ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Dirección de consulta:</td>
              <td style="padding: 8px 0; color: #333;">${direccionConsulta}</td>
            </tr>
            ` : ""}
            ${zonasDomicilio ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Zonas a domicilio:</td>
              <td style="padding: 8px 0; color: #333;">${zonasDomicilio}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Accesible movilidad reducida:</td>
              <td style="padding: 8px 0; color: #333;">${accesibleMovilidad}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Horarios disponibles:</td>
              <td style="padding: 8px 0; color: #333;">${horarios}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Calendario utilizado:</td>
              <td style="padding: 8px 0; color: #333;">${calendario.join(", ")}</td>
            </tr>
            ${videoPresentacion ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Vídeo de presentación:</td>
              <td style="padding: 8px 0; color: #333;">
                <a href="${videoPresentacion}" target="_blank" style="color: #FF6600; text-decoration: none;">
                  ${videoPresentacion}
                </a>
              </td>
            </tr>
            ` : ""}
          </table>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Descripción general del perfil profesional</h3>
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${descripcion}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Servicios ofrecidos</h3>
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${servicios}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Tarifas</h3>
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${tarifas}</p>
        </div>

        ${observaciones ? `
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Observaciones</h3>
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${observaciones}</p>
        </div>
        ` : ""}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 0.9em;">
          <p><strong>Consentimiento:</strong> ${consentimiento ? "Sí" : "No"}</p>
          <p style="margin-top: 10px;">
            <strong>Fecha de solicitud:</strong> ${new Date().toLocaleString("es-ES", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
          <p style="margin-top: 10px;">
            <strong>Foto adjunta:</strong> ${foto ? foto.name || "foto-perfil.jpg" : "No"}
          </p>
        </div>
      </div>
    `;

    // Preparar el mensaje
    const msg: any = {
      to: TO_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: "NAXINE - Formulario de Alta",
      },
      replyTo: correo,
      subject: `Nueva Solicitud de Alta: ${nombreApellidos}`,
      html: emailContent,
      text: `
Nueva Solicitud de Alta como Profesional

Datos del Profesional:
- Correo: ${correo}
- Nombre y apellidos: ${nombreApellidos}
- Titulación profesional: ${titulacion}
- Número de colegiado/a: ${numeroColegiado}
- Correo electrónico profesional: ${correoProfesionalPublico}
- Modalidades de atención: ${modalidadesTexto}
${direccionConsulta ? `- Dirección de consulta: ${direccionConsulta}` : ""}
${zonasDomicilio ? `- Zonas a domicilio: ${zonasDomicilio}` : ""}
- Accesible movilidad reducida: ${accesibleMovilidad}
- Horarios disponibles: ${horarios}
- Calendario utilizado: ${calendario.join(", ")}
${videoPresentacion ? `- Vídeo de presentación: ${videoPresentacion}` : ""}

Descripción general del perfil profesional:
${descripcion}

Servicios ofrecidos:
${servicios}

Tarifas:
${tarifas}

${observaciones ? `Observaciones:\n${observaciones}` : ""}

Consentimiento: ${consentimiento ? "Sí" : "No"}
Fecha de solicitud: ${new Date().toLocaleString("es-ES")}
      `.trim(),
    };

    // Agregar adjunto de foto si existe
    if (fotoAttachment) {
      msg.attachments = [fotoAttachment];
    }

    // Enviar el email
    await sgMail.send(msg);

    console.log(
      `[Alta Profesional] Email enviado con éxito para: ${nombreApellidos} (${correo})`
    );

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente",
    });
  } catch (error: any) {
    console.error("[Alta Profesional] Error al enviar email:", error);

    // Manejo de errores específicos de SendGrid
    if (error.response) {
      console.error("[Alta Profesional] Error de SendGrid:", error.response.body);
      if (error.response.body?.errors) {
        error.response.body.errors.forEach((err: any) => {
          console.error(`[Alta Profesional] - ${err.message}`);
        });
        
        // Detectar error de créditos agotados
        const hasCreditsError = error.response.body.errors.some(
          (err: any) => err.message?.toLowerCase().includes('maximum credits exceeded') ||
                       err.message?.toLowerCase().includes('credits exceeded')
        );
        
        if (hasCreditsError) {
          console.error(
            "[Alta Profesional] ⚠️ CRÉDITOS DE SENDGRID AGOTADOS - Se requiere actualizar el plan o esperar al siguiente ciclo de facturación."
          );
          return NextResponse.json(
            {
              success: false,
              error: "El servicio de email ha alcanzado su límite mensual. Por favor, contacta con soporte o intenta más tarde.",
            },
            { status: 503 } // Service Unavailable
          );
        }
      }
    }

    // Si el error es de autenticación o API key
    if (error.code === 401 || error.code === 403) {
      const isCreditsError = error.response?.body?.errors?.some(
        (err: any) => err.message?.toLowerCase().includes('maximum credits exceeded')
      );
      
      if (!isCreditsError) {
        console.error(
          "[Alta Profesional] Error de autenticación. Revisa tu SENDGRID_API_KEY en las variables de entorno."
        );
        return NextResponse.json(
          {
            success: false,
            error: "Error de configuración del servicio de email. Por favor, contacta con soporte.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Error al enviar la solicitud. Por favor, inténtalo de nuevo más tarde.",
      },
      { status: 500 }
    );
  }
}
