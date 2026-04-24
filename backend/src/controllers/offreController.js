const prisma = require("../prisma");
const { success } = require("../utils/apiResponse");

// ================================================================
// offreController.js — إدارة عروض الشغل
// ================================================================

/**
 * إنشاء عرض شغل جديد
 * POST /api/offres
 */
const createOffreController = async (req, res, next) => {
  try {
    const { titre, entreprise, description, url } = req.body;

    const offre = await prisma.offre.create({
      data: {
        titre,
        entreprise,
        description,
        url,
        userId: req.user.id,
      },
    });

    return success(res, offre, "Offre d'emploi enregistrée avec succès", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * جلب جميع عروض المستخدم
 * GET /api/offres
 */
const getOffresController = async (req, res, next) => {
  try {
    const offres = await prisma.offre.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return success(res, offres);
  } catch (err) {
    next(err);
  }
};

/**
 * جلب تفاصيل عرض معين
 * GET /api/offres/:id
 */
const getOffreByIdController = async (req, res, next) => {
  try {
    const offre = await prisma.offre.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!offre) {
      const err = new Error("Offre introuvable");
      err.statusCode = 404;
      throw err;
    }

    return success(res, offre);
  } catch (err) {
    next(err);
  }
};

/**
 * تحديث عرض شغل
 * PUT /api/offres/:id
 */
const updateOffreController = async (req, res, next) => {
  try {
    const { titre, entreprise, description, url, status } = req.body;

    const existing = await prisma.offre.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      const err = new Error("Offre introuvable");
      err.statusCode = 404;
      throw err;
    }

    const offre = await prisma.offre.update({
      where: { id: req.params.id },
      data: {
        ...(titre && { titre }),
        ...(entreprise && { entreprise }),
        ...(description && { description }),
        ...(url && { url }),
        ...(status && { status }),
      },
    });

    return success(res, offre, "Offre mise à jour");
  } catch (err) {
    next(err);
  }
};

/**
 * حذف عرض شغل
 * DELETE /api/offres/:id
 */
const deleteOffreController = async (req, res, next) => {
  try {
    const existing = await prisma.offre.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      const err = new Error("Offre introuvable");
      err.statusCode = 404;
      throw err;
    }

    await prisma.offre.delete({ where: { id: req.params.id } });
    return success(res, null, "Offre supprimée");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOffreController,
  getOffresController,
  getOffreByIdController,
  updateOffreController,
  deleteOffreController,
};
