const OpenAI = require("openai");
const { buildCoverLetterPrompt, buildCVPrompt } = require("../utils/helpers");
const logger = require("../utils/logger");

// ================================================================
// aiService.js — Communicating with OpenAI to generate cover letters
//
// Why separate this into a separate service?
// - If we want to switch from OpenAI to Gemini, we only modify here
// - The rest of the code is not affected
// ================================================================

// Create a single OpenAI client (singleton)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,  // 60 secondes max par requête
  maxRetries: 1,
});

/**
 * Generate a cover letter using AI
 *
 * @param {object} params - Letter generation parameters
 * @param {string} params.poste - Desired position
 * @param {string} params.entreprise - Company name
 * @param {string|null} params.descriptionPoste - Job description
 * @param {object|null} params.profil - Candidate profile
 * @param {string} params.ton - Writing style
 * @returns {{ contenu: string, promptUsed: string, tokensUsed: number, modelUsed: string }}
 */
const generateLetter = async ({ poste, entreprise, descriptionPoste, profil, ton }) => {
  // 1. Build the appropriate prompt
  const prompt = buildCoverLetterPrompt({ poste, entreprise, descriptionPoste, profil, ton });

  logger.info(`Generating a letter for: ${poste} at ${entreprise}`);

  try {
    // 2. Send the request to OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          // System message: defines the AI's personality
          role: "system",
          content:
            "Tu es un expert RH et rédacteur professionnel spécialisé dans les lettres de motivation en français. Tu rédiges des lettres percutantes, personnalisées et adaptées au secteur visé.",
        },
        {
          // User message: the actual request
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      // temperature: 0 = precise and specific | 1 = creative and random | 0.7 = balanced
    });

    // 3. Extract the result
    const contenu = response.choices[0].message.content.trim();
    const tokensUsed = response.usage.total_tokens;
    const modelUsed = response.model;

    logger.info(`Letter generated successfully. Tokens used: ${tokensUsed}`);
    return { contenu, promptUsed: prompt, tokensUsed, modelUsed };
  } catch (err) {
    logger.error(`Erreur OpenAI Letter: ${err.message}`);

    // High Quality Fallback for any error to keep the app working
    return {
      contenu: `[MODE DÉMO / ERREUR IA]
Madame, Monsieur,

C'est avec un grand intérêt que je vous soumets ma candidature pour le poste de ${poste} au sein de ${entreprise}.

Mon profil de ${profil?.titre || 'professionnel passionné'} correspond parfaitement aux exigences du poste. Fort de mes compétences en ${Array.isArray(profil?.competences) ? profil.competences.slice(0, 3).join(', ') : 'mon domaine'}, je suis convaincu de pouvoir apporter une valeur ajoutée immédiate à votre équipe.

Dans l'attente d'un entretien, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

(Note: Ce texte est une génération de secours car l'API OpenAI a renvoyé une erreur: ${err.message})`,
      promptUsed: prompt,
      tokensUsed: 0,
      modelUsed: "fallback-model"
    };
  }
};

/**
 * Generate a professional CV using AI
 *
 * @param {object} profil - Candidate profile data
 * @returns {{ contenu: string, promptUsed: string, tokensUsed: number, modelUsed: string }}
 */
const generateCV = async (profil) => {
  const prompt = buildCVPrompt(profil);

  logger.info(`Generating a CV for profile: ${profil.titre}`);

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es un consultant en carrière expert. Tu rédiges des CV modernes, clairs et optimisés pour les systèmes ATS.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.5, // Plus bas pour plus de précision structurelle
    });

    const contenu = response.choices[0].message.content.trim();
    const tokensUsed = response.usage.total_tokens;
    const modelUsed = response.model;

    logger.info(`CV generated successfully. Tokens used: ${tokensUsed}`);
    return { contenu, promptUsed: prompt, tokensUsed, modelUsed };
  } catch (err) {
    logger.error(`Erreur OpenAI CV: ${err.message}`);
    
    // Premium Mock CV Fallback
    const mockContent = `# ${profil.titre.toUpperCase()} (CV DE SECOURS)

## 👤 Résumé Professionnel
Candidat qualifié spécialisé en ${profil.titre}. Expert en résolution de problèmes et motivé par l'innovation technologique.

## 🛠️ Compétences
${Array.isArray(profil.competences) ? profil.competences.map(c => `- ${c}`).join('\n') : profil.competences}

## 💼 Expériences
${Array.isArray(profil.experiences) ? profil.experiences.map(e => `**${e.role}** @ ${e.company} (${e.duration})\n${e.description}`).join('\n\n') : 'Définissez vos expériences dans votre profil.'}

## 🎓 Formations
${Array.isArray(profil.formations) ? profil.formations.map(f => `- ${f.degree}, ${f.school} (${f.year})`).join('\n') : 'Définissez vos formations dans votre profil.'}

---
*Note: Ce CV a été généré via le système de secours suite à une erreur API: ${err.message}*`;

    return {
      contenu: mockContent,
      promptUsed: prompt,
      tokensUsed: 0,
      modelUsed: "fallback-cv-model"
    };
  }
};

/**
 * Refine, rephrase or adapt a specific text
 *
 * @param {string} text - The content to modify
 * @param {string} task - "IMPROVE", "REPHRASE", or "ADAPT"
 * @param {string|null} context - Optional context (like a job description)
 */
const refineText = async (text, task, context = null) => {
  let systemPrompt = "Tu es un expert en communication professionnelle.";
  let userPrompt = "";

  if (task === "IMPROVE") {
    userPrompt = `Améliore le texte suivant en corrigeant les fautes et en renforçant le ton professionnel: \n\n"${text}"`;
  } else if (task === "REPHRASE") {
    userPrompt = `Réécris le texte suivant d'une manière différente tout en gardant le même sens: \n\n"${text}"`;
  } else if (task === "ADAPT" && context) {
    userPrompt = `Adapte le texte suivant au contexte du poste décrit ci-dessous: \n\nTEXTE: "${text}" \n\nCONTEXTE: "${context}"`;
  } else {
    userPrompt = `Optimise le texte suivant: \n\n"${text}"`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    logger.error(`Erreur OpenAI Refine: ${err.message}`);

    if (err.status === 401) {
      return `[MODE TEST] Votre texte a été optimisé par l'IA (Simulé): ${text.substring(0, 50)}...`;
    }
    throw err;
  }
};

module.exports = { generateLetter, generateCV, refineText };
