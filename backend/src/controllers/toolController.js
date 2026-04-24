const { refineText } = require("../services/aiService");
const { success } = require("../utils/apiResponse");

/**
 * POST /api/tools/refine
 * تحسين أو إعادة صياغة نص معين
 */
const refineTextController = async (req, res, next) => {
  try {
    const { text, task, context } = req.body;

    if (!text) {
      const err = new Error("Le texte est requis");
      err.statusCode = 400;
      throw err;
    }

    const result = await refineText(text, task, context);

    return success(res, { refinedText: result }, "Texte traité avec succès");
  } catch (err) {
    next(err);
  }
};

module.exports = { refineTextController };
