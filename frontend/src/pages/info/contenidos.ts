import type { InfoContenido } from "./InfoPage";

/**
 * Contenido de las páginas informativas de la tienda.
 * Textos editables: los plazos y condiciones son la política vigente
 * propuesta para la demo; ajústalos a la operación real antes de publicar.
 */

export const ENVIOS: InfoContenido = {
  titulo: "Políticas de envío",
  intro:
    "Enviamos a todo Colombia con empaque discreto, seguimiento y transportadoras aliadas. Aquí encuentras cómo funciona tu pedido, desde que lo confirmas hasta que lo recibes.",
  mensajeWhatsApp: "Hola Nocturna, tengo una duda sobre el envío de mi pedido.",
  secciones: [
    {
      titulo: "Cobertura",
      parrafos: [
        "Despachamos a todo el territorio colombiano: ciudades principales, intermedias y municipios a los que lleguen nuestras transportadoras aliadas.",
        "Si tu dirección queda en una zona de cobertura especial, te lo contamos por WhatsApp antes de despachar.",
      ],
    },
    {
      titulo: "Tiempos de entrega",
      parrafos: [
        "Los pedidos se despachan dentro de las 24 horas hábiles siguientes a la confirmación del pago.",
      ],
      items: [
        "Bogotá: 1 a 2 días hábiles después de confirmado el pago.",
        "Ciudades principales (Medellín, Cali, Barranquilla, Cartagena, Bucaramanga y similares): 2 a 4 días hábiles.",
        "Resto del país: 3 a 6 días hábiles.",
      ],
    },
    {
      titulo: "Costo del envío",
      parrafos: [
        "El valor del envío se calcula en el checkout según tu ciudad y se muestra antes de pagar. No hay costos ocultos: lo que ves en el resumen es lo que pagas.",
      ],
    },
    {
      titulo: "Empaque discreto",
      parrafos: [
        "Tu pedido llega en una caja neutra, sin logos ni referencias al contenido. Solo tú sabes qué hay adentro.",
      ],
    },
    {
      titulo: "Seguimiento y cambios de dirección",
      parrafos: [
        "Cuando tu pedido sale te enviamos el número de guía para seguirlo con la transportadora.",
        "Si necesitas cambiar la dirección, escríbenos por WhatsApp antes del despacho y lo ajustamos.",
      ],
    },
  ],
};

export const GARANTIA: InfoContenido = {
  titulo: "Garantía y devoluciones",
  intro:
    "Queremos que tu compra sea perfecta. Si la talla no es la indicada o la pieza presenta un defecto, tienes opciones claras y sin letra menuda.",
  mensajeWhatsApp: "Hola Nocturna, quiero solicitar un cambio o devolución.",
  secciones: [
    {
      titulo: "Derecho de retracto",
      parrafos: [
        "Por compras a distancia tienes 5 días hábiles desde la entrega para retractarte (Ley 1480 de 2011). La prenda debe estar sin uso, con etiquetas y en su empaque original.",
      ],
    },
    {
      titulo: "Cambios de talla",
      parrafos: [
        "Puedes solicitar cambio de talla hasta 30 días calendario después de la entrega, siempre que la pieza esté sin uso y con sus etiquetas.",
        "Por higiene, la ropa interior debe conservar su protección adhesiva y no puede haber sido usada ni lavada.",
      ],
    },
    {
      titulo: "Productos con defecto",
      parrafos: [
        "Si tu pieza llega con un defecto de confección o de material, tienes garantía legal. Envíanos fotos por WhatsApp con tu número de pedido y gestionamos el cambio o la solución sin costo.",
      ],
    },
    {
      titulo: "Cómo solicitar un cambio o devolución",
      items: [
        "Escríbenos por WhatsApp con tu número de pedido y el motivo.",
        "Te confirmamos si aplica y te enviamos la guía o las instrucciones de envío.",
        "Al recibir la prenda la revisamos en un plazo de 1 a 3 días hábiles.",
        "Aprobado el cambio, despachamos la nueva talla o procesamos el reembolso.",
      ],
    },
    {
      titulo: "Reembolsos",
      parrafos: [
        "Los reembolsos se hacen al medio de pago original y pueden tardar entre 5 y 10 días hábiles desde la aprobación, según el banco o la pasarela.",
      ],
    },
    {
      titulo: "Lo que no cubre",
      parrafos: [
        "No aplican cambios ni devoluciones en prendas usadas, lavadas o sin etiquetas, ni por daños ocasionados por el uso o el lavado inadecuado.",
      ],
    },
  ],
};

export const PAGOS: InfoContenido = {
  titulo: "Pagos seguros",
  intro:
    "Todas las compras se pagan en línea a través de Wompi, la pasarela de pagos aliada. Tu información financiera nunca pasa por nuestros servidores.",
  mensajeWhatsApp: "Hola Nocturna, tengo una duda con el pago de mi pedido.",
  secciones: [
    {
      titulo: "Medios de pago",
      parrafos: [
        "Los pagos con PSE y botón Bancolombia se descuentan directamente de tu cuenta; con tarjeta puedes pagar a cuotas según tu banco.",
      ],
      items: ["Nequi", "Daviplata", "PSE", "Tarjeta débito y crédito", "Botón Bancolombia"],
    },
    {
      titulo: "Seguridad",
      parrafos: [
        "La transacción se procesa dentro de la pasarela con conexión cifrada. No almacenamos números de tarjeta ni claves: solo recibimos la confirmación del pago.",
      ],
    },
    {
      titulo: "Confirmación del pedido",
      parrafos: [
        "Tu pedido se prepara cuando el pago queda confirmado. Recibirás la confirmación y luego la guía de envío por correo.",
      ],
    },
    {
      titulo: "Precios",
      parrafos: [
        "Todos los precios están en pesos colombianos (COP) e incluyen impuestos.",
      ],
    },
    {
      titulo: "Si tu pago no se confirma",
      parrafos: [
        "Si la pasarela rechaza el pago, el pedido queda pendiente y no se cobra. Puedes intentarlo de nuevo con otro medio o escribirnos por WhatsApp.",
      ],
    },
  ],
};
