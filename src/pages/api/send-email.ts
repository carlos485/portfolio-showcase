import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Validación básica en el servidor
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ message: "Faltan campos requeridos." }),
      { status: 400 }
    );
  }

  const API_URL = "https://smtp.maileroo.com/send";
  // Obtenemos las variables de entorno de forma segura
  const API_KEY = import.meta.env.MAILEROO_API_KEY;
  const FROM_EMAIL = import.meta.env.MAILEROO_FROM_EMAIL;
  const TO_EMAIL = "carlospando856@gmail.com"; // Tu correo de destino

  if (!API_KEY || !FROM_EMAIL) {
    console.error("Faltan variables de entorno para el envío de correo.");
    return new Response(
      JSON.stringify({ message: "Error de configuración del servidor." }),
      { status: 500 }
    );
  }

  // Construimos el cuerpo del correo para Maileroo
  const mailerooFormData = new FormData();
  mailerooFormData.append("from", FROM_EMAIL);
  mailerooFormData.append("to", TO_EMAIL);
  mailerooFormData.append("subject", `Nuevo mensaje de contacto de: ${name}`);
  // Incluimos el email del usuario en el cuerpo para que puedas responderle
  mailerooFormData.append(
    "html",
    `
        <h1>Nuevo mensaje del formulario de contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email (para responder):</strong> ${email}</p>
        <hr>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
    `
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "X-API-KEY": API_KEY },
      body: mailerooFormData,
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.error("Error de la API de Maileroo:", errorResult);
      return new Response(
        JSON.stringify({ message: "Error al enviar el correo." }),
        { status: response.status }
      );
    }

    return new Response(
      JSON.stringify({ message: "¡Mensaje enviado con éxito!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return new Response(
      JSON.stringify({ message: "Ocurrió un error inesperado." }),
      { status: 500 }
    );
  }
};
