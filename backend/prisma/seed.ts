import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/auth/password.js";

// Datos de ejemplo de LENCERÍA para poblar la base de datos (marca Nocturna).
// Las variantes son TALLAS, como en el rubro real. Precios en COP (enteros).
// Ejecutar con: npm run db:seed
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Poblando base de datos (Nocturna)...");

  // --- Usuarios ---
  const [adminHash, clienteHash] = await Promise.all([
    hashPassword("Admin1234!"),
    hashPassword("Cliente1234!"),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tienda.com" },
    update: {},
    create: {
      email: "admin@tienda.com",
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "Nocturna",
      role: "ADMIN",
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: "cliente@tienda.com" },
    update: {},
    create: {
      email: "cliente@tienda.com",
      passwordHash: clienteHash,
      firstName: "Ana",
      lastName: "Gómez",
      phone: "3001234567",
      role: "CUSTOMER",
    },
  });

  // Revisores adicionales: un producto puede tener varias reseñas, pero la restricción
  // única (productId, userId) exige usuarios distintos por producto.
  const extraReviewers = await Promise.all(
    [
      { email: "maria@tienda.com", firstName: "María", lastName: "Rossi" },
      { email: "lucia@tienda.com", firstName: "Lucía", lastName: "Mendoza" },
    ].map((r) =>
      prisma.user.upsert({
        where: { email: r.email },
        update: {},
        create: {
          email: r.email,
          passwordHash: clienteHash,
          firstName: r.firstName,
          lastName: r.lastName,
          role: "CUSTOMER",
        },
      }),
    ),
  );
  const reviewers = [cliente, ...extraReviewers];

  // Limpiar catálogo anterior. Orden por FK: primero productos (cascada a variantes,
  // imágenes y reseñas), luego categorías (Product→Category es Restrict, sin cascada).
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // --- Categorías (colecciones) ---
  const categories: Record<string, string> = {};
  const catData = [
    { name: "Sujetadores", slug: "sujetadores" },
    { name: "Panties", slug: "panties" },
    { name: "Conjuntos", slug: "conjuntos" },
    { name: "Pijamas", slug: "pijamas" },
    { name: "Bodys", slug: "bodys" },
    { name: "Kimonos", slug: "kimonos" },
  ];
  for (const c of catData) {
    const created = await prisma.category.create({ data: c });
    categories[c.slug] = created.id;
  }

  // --- Tipos ---
  interface SeedVariant {
    sku: string;
    name: string;
    stock: number;
    priceOverride?: number;
  }
  interface SeedProduct {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    variants: SeedVariant[];
    rating?: number; // 1..5, crea reseñas de ejemplo
  }

  // Construye variantes por TALLA con su stock individual.
  function tallas(prefijo: string, lista: string[], stocks: number[]): SeedVariant[] {
    return lista.map((t, i) => ({
      sku: `${prefijo}-${t}`,
      name: `Talla ${t}`,
      stock: stocks[i] ?? 10,
    }));
  }

  const products: SeedProduct[] = [
    {
      name: 'Sujetador Encaje "Aurora"',
      slug: "sujetador-encaje-aurora",
      description:
        "Encaje francés con aro y copas moldeadas. Sostiene sin marcar, con ajuste suave en la espalda.",
      price: 120000,
      compareAtPrice: 150000,
      category: "sujetadores",
      variants: tallas("SAU-AUR", ["S", "M", "L", "XL"], [9, 14, 7, 3]),
      rating: 5,
    },
    {
      name: 'Sujetador Sin Costuras "Nude"',
      slug: "sujetador-sin-costuras-nude",
      description:
        "Copa acolchada sin costuras, ideal bajo prendas ajustadas. Tela transpirable y elástica.",
      price: 95000,
      category: "sujetadores",
      variants: tallas("SAU-NUD", ["S", "M", "L", "XL"], [12, 16, 10, 6]),
      rating: 4,
    },
    {
      name: 'Panty Tanga Encaje "Luna"',
      slug: "panty-tanga-encaje-luna",
      description:
        "Tanga de encaje elástico con detalle de lazo. Corte bajo y acabado delicado.",
      price: 45000,
      compareAtPrice: 55000,
      category: "panties",
      variants: tallas("PAN-LUN", ["S", "M", "L"], [20, 24, 15]),
      rating: 5,
    },
    {
      name: 'Panty Corte Alto "Seda"',
      slug: "panty-corte-alto-seda",
      description:
        "Corte alto que alarga la figura, en microfibra con tacto de seda. Sin marcas bajo la ropa.",
      price: 52000,
      category: "panties",
      variants: tallas("PAN-SED", ["S", "M", "L", "XL"], [18, 22, 14, 8]),
      rating: 4,
    },
    {
      name: 'Conjunto Bralette + Panty "Nocturna"',
      slug: "conjunto-bralette-nocturna",
      description:
        "Bralette de encaje sin aros con panty a juego. La pieza insignia de la casa.",
      price: 165000,
      compareAtPrice: 195000,
      category: "conjuntos",
      variants: tallas("CJN-NOC", ["S", "M", "L", "XL"], [8, 12, 6, 4]),
      rating: 5,
    },
    {
      name: 'Conjunto Encaje "Espresso"',
      slug: "conjunto-encaje-espresso",
      description:
        "Conjunto de encaje en tono café, con copas con aros y panti de corte brasileño.",
      price: 180000,
      category: "conjuntos",
      variants: tallas("CJN-ESP", ["S", "M", "L", "XL"], [7, 11, 5, 3]),
      rating: 5,
    },
    {
      name: 'Pijama Seda "Serena"',
      slug: "pijama-seda-serena",
      description:
        "Camisa y pantalón en satin de seda. Caída fluida y tacto fresco para dormir bien.",
      price: 175000,
      compareAtPrice: 210000,
      category: "pijamas",
      variants: tallas("PIJ-SER", ["S", "M", "L", "XL"], [9, 13, 8, 5]),
      rating: 5,
    },
    {
      name: 'Pijama Algodón "Domingo"',
      slug: "pijama-algodon-domingo",
      description:
        "Algodón peinado de toque suave, con estampado sutil. Transpirable para toda la noche.",
      price: 130000,
      category: "pijamas",
      variants: tallas("PIJ-DOM", ["S", "M", "L", "XL"], [11, 15, 9, 6]),
      rating: 4,
    },
    {
      name: 'Body Encaje "Ébano"',
      slug: "body-encaje-ebano",
      description:
        "Body de encaje negro con escote profundo y cierre en la base. Pieza de impacto.",
      price: 150000,
      category: "bodys",
      variants: tallas("BOD-EBA", ["S", "M", "L", "XL"], [6, 10, 7, 4]),
      rating: 5,
    },
    {
      name: 'Kimono Seda "Vega"',
      slug: "kimono-seda-vega",
      description:
        "Kimono largo en satin con cinturón de lazo. Ligero, elegante y envolvente.",
      price: 195000,
      compareAtPrice: 240000,
      category: "kimonos",
      variants: tallas("KIM-VEG", ["S", "M", "L"], [7, 9, 6]),
      rating: 5,
    },
    {
      name: 'Panty Tanga Cordón "Peonía"',
      slug: "panty-tanga-cordon-peonia",
      description:
        "Tanga de encaje rosa con cordón cruzado en la espalda y lazo. Corte mínimo, detalle sensual y acabado delicado.",
      price: 48000,
      compareAtPrice: 58000,
      category: "panties",
      variants: tallas("PAN-PEO", ["S", "M", "L"], [18, 22, 14]),
      rating: 5,
    },
  ];

  // Fotos reales (copiadas a frontend/public/images/). Ruta relativa a la raíz del
  // frontend: el <img src="/images/..."> la resuelve contra el origen y Vite sirve
  // public/ tanto en dev como en build. Mapeo slug → archivo (1:1 con los productos).
  const IMAGES: Record<string, string> = {
    "sujetador-encaje-aurora": "06_sujetador_negro.png",
    "sujetador-sin-costuras-nude": "10_Comfy.png",
    "panty-tanga-encaje-luna": "04_panty_rosado.png",
    "panty-corte-alto-seda": "08_Seda.png",
    "conjunto-bralette-nocturna": "02_conjunto_burdeos.png",
    "conjunto-encaje-espresso": "07_Espresso.png",
    "pijama-seda-serena": "05_pijama_rosada.png",
    "pijama-algodon-domingo": "09_Domingo.png",
    "body-encaje-ebano": "01_body_negro.png",
    "kimono-seda-vega": "03_kimono_negro.png",
    "panty-tanga-cordon-peonia": "11_peonia.avif",
  };

  const createdProducts: { id: string; slug: string; rating?: number }[] = [];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        categoryId: categories[p.category],
        images: {
          create: [
            {
              // Foto real servida desde frontend/public/images/ (con fallback a placeholder
              // solo si un slug no tuviera foto asignada en IMAGES).
              url: IMAGES[p.slug]
                ? `/images/${IMAGES[p.slug]}`
                : `https://picsum.photos/seed/${p.slug}/800/1000`,
              alt: p.name,
              position: 0,
            },
          ],
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            stock: v.stock,
            priceOverride: v.priceOverride,
          })),
        },
      },
    });
    createdProducts.push({ id: product.id, slug: p.slug, rating: p.rating });
  }

  // --- Reseñas de ejemplo (rating / reviewCount en el catálogo) ---
  const comments: Record<number, string[]> = {
    5: [
      "Me siento increíble, la calidad se nota.",
      "El encaje es suave y la talla era exacta.",
      "Precioso y con acabados de boutique.",
    ],
    4: ["Muy bonito y cómodo, aunque el color real es un poco más oscuro."],
  };
  let reviewCount = 0;
  for (const p of createdProducts) {
    if (!p.rating) continue;
    const texts = comments[p.rating] ?? ["Buen producto."];
    const n = p.rating === 5 ? 3 : 1; // 1..3 reseñas por producto
    for (let i = 0; i < n; i++) {
      await prisma.review.create({
        data: {
          productId: p.id,
          userId: reviewers[i % reviewers.length].id,
          rating: p.rating,
          comment: texts[i % texts.length],
        },
      });
      reviewCount++;
    }
  }

  // --- Dirección de envío de ejemplo (permite probar el checkout de inmediato) ---
  const existingAddress = await prisma.address.findFirst({ where: { userId: cliente.id } });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: cliente.id,
        alias: "Casa",
        recipient: "Ana Gómez",
        phone: "3001234567",
        direccion: "Cra 7 # 32-16",
        apartamento: "Apto 302",
        municipio: "Bogotá",
        departamento: "Cundinamarca",
        codigoPostal: "110111",
        isDefault: true,
      },
    });
  }

  // --- Preguntas de ejemplo (alimentan /admin/preguntas y las fichas) ---
  await prisma.question.deleteMany({});
  const questionData: Array<{
    slug: string;
    author: string;
    content: string;
    answer: string | null;
  }> = [
    {
      slug: "sujetador-encaje-aurora",
      author: cliente.firstName,
      content: "¿La talla corre pequeña o regular?",
      answer: "Regular: si dudas entre dos tallas, elige la mayor.",
    },
    {
      slug: "conjunto-bralette-nocturna",
      author: "María",
      content: "¿El encaje es elástico y se adapta al cuerpo?",
      answer: null,
    },
  ];
  let questionCount = 0;
  for (const q of questionData) {
    const product = createdProducts.find((p) => p.slug === q.slug);
    if (!product) continue;
    await prisma.question.create({
      data: {
        productId: product.id,
        author: q.author,
        content: q.content,
        answer: q.answer,
        status: q.answer ? "ANSWERED" : "PENDING",
        answeredAt: q.answer ? new Date() : null,
      },
    });
    questionCount++;
  }

  console.log("✅ Listo:");
  console.log(`   👤 Admin:    admin@tienda.com / Admin1234!  (${admin.id})`);
  console.log(`   👤 Cliente:  cliente@tienda.com / Cliente1234!`);
  console.log(`   📂 Colecciones: ${catData.length}`);
  console.log(`   👙 Productos:   ${products.length}`);
  console.log(`   ⭐ Reseñas:     ${reviewCount}`);
  console.log(`   📦 Dirección de prueba del cliente`);
  console.log(`   ❓ Preguntas:   ${questionCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
