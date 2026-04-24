const cvService = require("../services/cvService");
const { success } = require("../utils/apiResponse");

/**
 * POST /api/cvs
 */
const createCVController = async (req, res, next) => {
  try {
    const { titre, profilId, templateId } = req.body;
    const cv = await cvService.createCV({
      userId: req.user.id,
      titre,
      profilId,
      templateId,
    });
    return success(res, cv, "CV généré avec succès", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cvs
 */
const getCVsController = async (req, res, next) => {
  try {
    const result = await cvService.getCVsByUser(req.user.id, req.query);
    return success(res, result.cvs, "Liste des CVs récupérée", 200);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cvs/:id
 */
const getCVByIdController = async (req, res, next) => {
  try {
    const cv = await cvService.getCVById(req.params.id, req.user.id);
    return success(res, cv);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cvs/:id
 */
const deleteCVController = async (req, res, next) => {
  try {
    await cvService.deleteCV(req.params.id, req.user.id);
    return success(res, null, "CV supprimé avec succès");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCVController,
  getCVsController,
  getCVByIdController,
  deleteCVController,
};
