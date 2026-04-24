const { Router } = require("express");
const { body } = require("express-validator");
const {
  createOffreController,
  getOffresController,
  getOffreByIdController,
  updateOffreController,
  deleteOffreController,
} = require("../controllers/offreController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const router = Router();

// نطلب المصادقة لجميع العمليات
router.use(authMiddleware);

/**
 * POST /api/offres
 */
router.post(
  "/",
  [
    body("titre").trim().notEmpty().withMessage("Le titre du poste est requis"),
    body("entreprise").optional().trim(),
    body("url").optional().isURL().withMessage("L'URL doit être valide"),
  ],
  validate,
  createOffreController
);

/**
 * GET /api/offres
 */
router.get("/", getOffresController);

/**
 * GET /api/offres/:id
 */
router.get("/:id", getOffreByIdController);

/**
 * PUT /api/offres/:id
 */
router.put("/:id", updateOffreController);

/**
 * DELETE /api/offres/:id
 */
router.delete("/:id", deleteOffreController);

module.exports = router;
