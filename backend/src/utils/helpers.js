// helpers.js — helper functions used in many code places
/**
 * @param {object} params
 * @param {string} params.poste 
 * @param {string} params.entreprise
 * @param {string} params.descriptionPoste   
 * @param {object|null} params.profil 
 * @param {string} params.ton 
 * @returns {string}
 */
const buildCoverLetterPrompt = ({ poste, entreprise, descriptionPoste, profil, ton }) => {
  const tonMap = {
    PROFESSIONNEL: "professionnel et formel",
    DYNAMIQUE: "dynamique et enthousiaste",
    CREATIF: "créatif et original",
    FORMEL: "très formel et institutionnel",
  };

  const tonText = tonMap[ton] || "professionnel";

  let prompt = `Tu es un expert en rédaction de lettres de motivation en français.
Rédige une lettre de motivation exceptionnelle et personnalisée.

POSTE VISÉ: ${poste}
ENTREPRISE: ${entreprise}
TON SOUHAITÉ: ${tonText}`;

  if (descriptionPoste) {
    prompt += `\n\nDESCRIPTION DU POSTE:\n${descriptionPoste}`;
  }

  if (profil) {
    const comp = Array.isArray(profil.competences) ? profil.competences.join(", ") : (profil.competences || "Non spécifiées");
    const exp = Array.isArray(profil.experiences) && profil.experiences.length > 0 ? JSON.stringify(profil.experiences) : "Non spécifiées";

    prompt += `\n\nPROFIL DU CANDIDAT:
- Titre: ${profil.titre}
- Compétences: ${comp}
- Expériences: ${exp}`;
  }

  prompt += `

INSTRUCTIONS:
1. La lettre doit faire entre 300 et 400 mots
2. Structure: Introduction percutante → Corps (motivation + compétences) → Conclusion avec call-to-action
3. Ton ${tonText}
4. Ne pas inventer des informations non fournies
5. Terminer par "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées."

Génère UNIQUEMENT le texte de la lettre.`;

  return prompt;
};

const countWords = (text) => text.trim().split(/\s+/).length;

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Prompt to generate a professional CV
 */
const buildCVPrompt = (profil) => {
  const comp = Array.isArray(profil.competences) ? profil.competences.join(", ") : (profil.competences || "Non spécifiées");
  const exp = Array.isArray(profil.experiences) && profil.experiences.length > 0 ? JSON.stringify(profil.experiences) : "Non spécifiées";
  const form = Array.isArray(profil.formations) && profil.formations.length > 0 ? JSON.stringify(profil.formations) : "Non spécifiées";
  const lang = Array.isArray(profil.langues) && profil.langues.length > 0 ? JSON.stringify(profil.langues) : "Non spécifiées";

  return `Tu es un expert RH spécialisé dans les profils technologiques.
À partir des informations suivantes, rédige un CV professionnel complet, structuré et percutant en français.

INFORMATIONS DU CANDIDAT:
- Titre: ${profil.titre}
- Compétences: ${comp}
- Expériences: ${exp}
- Formations: ${form}
- Langues: ${lang}

INSTRUCTIONS:
1. Format Markdown riche.
2. Accroche professionnelle percutante au début.
3. Pour chaque expérience, listez les accomplissements.
4. Génère UNIQUEMENT le texte du CV en Markdown.`;
};

module.exports = {
  buildCoverLetterPrompt,
  buildCVPrompt,
  countWords,
  sanitizeUser,
  getPaginationParams,
};
