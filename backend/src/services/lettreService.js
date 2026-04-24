const prisma = require("../prisma");
const { generateLetter } = require("./aiService");
const { getPaginationParams } = require("../utils/helpers");

// ================================================================
// lettreService.js — منطق إدارة رسائل التحفيز (CRUD + IA)
//
// This service mediates between:
//   - lettreController (receives requests)
//   - prisma (database)
//   - aiService (artificial intelligence)
// ================================================================

/**
 * Generate and save a new cover letter
 */
const createLettre = async ({ userId, titre, poste, entreprise, descriptionPoste, profilId, ton }) => {
  // 1. Get the candidate's profile data
  let profil;

  // Try to find the specific profile if a valid-looking ID is provided
  if (profilId && profilId !== "{{profilId}}") {
    profil = await prisma.profil.findFirst({
      where: { id: profilId, userId },
    });
  }

  // Fallback 1: Try the default profile
  if (!profil) {
    profil = await prisma.profil.findFirst({
      where: { userId, isDefault: true },
    });
  }

  // Fallback 2: Take the most recent profile
  if (!profil) {
    profil = await prisma.profil.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Note: We don't throw an error here if no profile is found, 
  // because a letter can technically be generated with just job details,
  // but it will be much better with a profile.
  // However, for consistency with CV service, we might want to require it or just log.
  console.log("Debug CreateLettre:", { userId, profilId, profilFound: !!profil });

  // 2. Generate the letter using AI
  const { contenu, promptUsed, tokensUsed, modelUsed } = await generateLetter({
    poste,
    entreprise,
    descriptionPoste,
    profil,
    ton,
  });

  // 3. Save the letter to the database
  const lettreData = {
    titre,
    poste,
    entreprise,
    descriptionPoste,
    contenu,
    ton,
    userId,
    profilId: profil ? profil.id : null,
  };

  try {
    const lettre = await prisma.lettre.create({
      data: {
        ...lettreData,
        promptUsed,
        tokensUsed,
        modelUsed,
      },
    });
    return lettre;
  } catch (error) {
    if (error.message && error.message.includes("Unknown argument")) {
      console.warn("⚠️ Prisma client is out of sync. Retrying save without AI metadata fields for Lettre.");
      return await prisma.lettre.create({ data: lettreData });
    }
    throw error;
  }
};

/**
 * Get all user letters with pagination
 */
const getLettresByUser = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  // Get letters and total count at the same time (Promise.all → faster)
  const [lettres, total] = await Promise.all([
    prisma.lettre.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // Newest first
      skip,
      take: limit,
      // Don't return the full content in the list (heavy) — only in details
      select: {
        id: true,
        titre: true,
        poste: true,
        entreprise: true,
        ton: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.lettre.count({ where: { userId } }),
  ]);

  return { lettres, total, page, limit };
};

/**
 * Get a single letter with full details
 */
const getLettreById = async (id, userId) => {
  const lettre = await prisma.lettre.findFirst({
    where: { id, userId }, // Check that the letter belongs to the user
    include: { profil: true }, // Get the associated profile data
  });

  if (!lettre) {
    const err = new Error("Lettre introuvable");
    err.statusCode = 404;
    throw err;
  }

  return lettre;
};

/**
 * Update a letter (title, status, or content)
 */
const updateLettre = async (id, userId, data) => {
  // Check ownership first
  await getLettreById(id, userId);

  return prisma.lettre.update({
    where: { id },
    data: {
      ...(data.titre && { titre: data.titre }),
      ...(data.contenu && { contenu: data.contenu }),
      ...(data.status && { status: data.status }),
    },
  });
};

/**
 * حذف رسالة
 */
const deleteLettre = async (id, userId) => {
  // Check ownership first
  await getLettreById(id, userId);

  // Then delete the letter

  await prisma.lettre.delete({ where: { id } });
};

/**
 * Regenerate a letter using AI
 */
const regenerateLettre = async (id, userId) => {
  const lettre = await getLettreById(id, userId);

  let profil = null;
  if (lettre.profilId) {
    profil = await prisma.profil.findUnique({ where: { id: lettre.profilId } });
  }

  const { contenu, promptUsed, tokensUsed, modelUsed } = await generateLetter({
    poste: lettre.poste,
    entreprise: lettre.entreprise,
    descriptionPoste: lettre.descriptionPoste,
    profil,
    ton: lettre.ton,
  });

  try {
    return await prisma.lettre.update({
      where: { id },
      data: { contenu, promptUsed, tokensUsed, modelUsed },
    });
  } catch (error) {
    if (error.message && error.message.includes("Unknown argument")) {
      console.warn("⚠️ Prisma client out of sync during regeneration. Retrying with only 'contenu'.");
      return await prisma.lettre.update({
        where: { id },
        data: { contenu },
      });
    }
    throw error;
  }
};

module.exports = { createLettre, getLettresByUser, getLettreById, updateLettre, deleteLettre, regenerateLettre };
