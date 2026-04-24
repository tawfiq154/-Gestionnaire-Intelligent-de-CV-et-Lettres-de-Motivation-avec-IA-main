const prisma = require("../prisma");
const { generateCV } = require("./aiService");
const { getPaginationParams } = require("../utils/helpers");

/**
 * Generate and save a new CV
 */
const createCV = async ({ userId, titre, profilId, templateId }) => {
  // 1. Get profile data
  console.log("Debug CreateCV:", { userId, profilId });

  let profil;

  // Try to find the specific profile if a valid-looking ID is provided
  if (profilId && profilId !== "{{profilId}}") {
    profil = await prisma.profil.findFirst({
      where: { id: profilId, userId },
    });
  }

  // Fallback 1: If profilId not provided or not found, try the default profile
  if (!profil) {
    profil = await prisma.profil.findFirst({
      where: { userId, isDefault: true },
    });
  }

  // Fallback 2: If still no profile, take the most recent one
  if (!profil) {
    profil = await prisma.profil.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!profil) {
    const err = new Error("Profil introuvable. Veuillez d'abord créer un profil professionnel.");
    err.statusCode = 404;
    throw err;
  }

  // 2. Generate content using AI
  const { contenu, promptUsed, tokensUsed, modelUsed } = await generateCV(profil);

  // 3. Save to database
  const cvData = {
    titre,
    contenu,
    templateId: templateId || "classic",
    userId,
    profilId: profil.id,
  };

  try {
    // Try to save with all fields (including AI metadata)
    const cv = await prisma.cv.create({
      data: {
        ...cvData,
        promptUsed,
        tokensUsed,
        modelUsed,
      },
    });
    return cv;
  } catch (error) {
    // If the error is about an unknown field, it means the Prisma client is out of sync
    if (error.message && error.message.includes("Unknown argument")) {
      console.warn("⚠️ Prisma client is out of sync. Retrying save without AI metadata fields (promptUsed, tokensUsed, modelUsed).");
      return await prisma.cv.create({ data: cvData });
    }
    // For other errors, rethrow
    throw error;
  }
};

/**
 * Get user CVs
 */
const getCVsByUser = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [cvs, total] = await Promise.all([
    prisma.cv.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        titre: true,
        templateId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.cv.count({ where: { userId } }),
  ]);

  return { cvs, total, page, limit };
};

/**
 * Get CV by ID
 */
const getCVById = async (id, userId) => {
  const cv = await prisma.cv.findFirst({
    where: { id, userId },
    include: { profil: true },
  });

  if (!cv) {
    const err = new Error("CV introuvable");
    err.statusCode = 404;
    throw err;
  }

  return cv;
};

/**
 * Delete CV
 */
const deleteCV = async (id, userId) => {
  await getCVById(id, userId);
  await prisma.cv.delete({ where: { id } });
};

module.exports = {
  createCV,
  getCVsByUser,
  getCVById,
  deleteCV,
};
