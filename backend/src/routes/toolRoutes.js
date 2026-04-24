const { Router } = require("express");
const { body } = require("express-validator");
const { refineTextController } = require("../controllers/toolController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const router = Router();

router.use(authMiddleware);

// POST /api/tools/refine
router.post(
  "/refine",
  [
    body("text").trim().notEmpty().withMessage("Le texte est requis"),
    body("task").isIn(["IMPROVE", "REPHRASE", "ADAPT"]).withMessage("Tâche invalide"),
  ],
  validate,
  refineTextController
);

module.exports = router;
