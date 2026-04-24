const { Router } = require("express");
const { body } = require("express-validator");
const {
  createCVController,
  getCVsController,
  getCVByIdController,
  deleteCVController,
} = require("../controllers/cvController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const router = Router();

router.use(authMiddleware);

// POST /api/cvs
router.post(
  "/",
  [
    body("titre").trim().notEmpty().withMessage("Le titre du CV est requis"),
    body("profilId").notEmpty().withMessage("Le profil est requis"),
  ],
  validate,
  createCVController
);

// GET /api/cvs
router.get("/", getCVsController);

// GET /api/cvs/:id
router.get("/:id", getCVByIdController);

// DELETE /api/cvs/:id
router.delete("/:id", deleteCVController);

module.exports = router;
