import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI-Generated Evaluation for Administrator
app.post('/api/generate-evaluation', async (req, res) => {
  try {
    const {
      studentName,
      classLevel,
      stream,
      subject,
      notionsToEvaluate,
      difficulty = 'standard',
    } = req.body;

    if (!classLevel || !subject || !Array.isArray(notionsToEvaluate) || notionsToEvaluate.length === 0) {
      return res.status(400).json({
        error: 'Champs requis manquants : classe, matière et au moins une notion.',
      });
    }

    const genAI = getGenAI();

    // If Gemini API Key is present, generate real bespoke assessment
    if (genAI) {
      const prompt = `Tu es un inspecteur pédagogique et professeur expert pour HPG (Haute Pédagogie Générale).
Génère une évaluation sommative personnalisée et rigoureuse selon les critères suivants :
- Élève ciblé : ${studentName || 'Élève HPG'}
- Niveau scolaire : ${classLevel} (Filière : ${stream || 'Général'})
- Matière : ${subject}
- Notions à évaluer spécifiquement : ${notionsToEvaluate.join(', ')}
- Niveau d'exigence : ${difficulty}

Consignes impératives :
1. Le total des points de l'ensemble des exercices DOIT être EXACTEMENT de 20 points.
2. Crée entre 2 et 4 exercices progressifs (exercice 1 : application directe/définitions, exercices 2-3 : approfondissement et problèmes de synthèse).
3. Pour les matières scientifiques (Mathématiques, Physique, Chimie, Informatique, SVT), utilise la syntaxe LaTeX pour toutes les formules mathématiques et scientifiques, encadrées par des dollars simples pour le texte en ligne ($...$) et des doubles dollars pour les formules isolées ($$...$$).
4. Chaque exercice doit comporter :
   - 'title' : Titre de l'exercice (ex: 'Exercice 1 : Étude de fonction polynomiale')
   - 'points' : Le barème entier ou demi-entier (ex: 6)
   - 'statement' : L'énoncé complet avec les sous-questions numérotées a), b), c) et la répartition des points par question.
   - 'solution' : Le corrigé détaillé pas-à-pas avec le barème indicatif.
5. Donne également des consignes claires en introduction dans 'instructions' (temps estimé, calculatrice autorisée ou non, rigueur de rédaction).

Réponds UNIQUEMENT au format JSON strict avec la structure suivante :
{
  "title": "Titre du devoir (ex: Devoir Surveillé : ${subject} - ${classLevel})",
  "totalScore": 20,
  "instructions": "Instructions pour l'élève...",
  "exercises": [
    {
      "id": "ex-1",
      "title": "Exercice 1 : ...",
      "points": 5,
      "statement": "Énoncé...",
      "solution": "Corrigé détaillé..."
    }
  ]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        // Normalize points to ensure total is exactly 20
        const totalPoints = parsed.exercises.reduce((sum: number, ex: any) => sum + (Number(ex.points) || 0), 0);
        if (totalPoints !== 20 && parsed.exercises.length > 0) {
          const diff = 20 - totalPoints;
          parsed.exercises[parsed.exercises.length - 1].points = Math.max(
            1,
            Number(parsed.exercises[parsed.exercises.length - 1].points) + diff
          );
        }
        parsed.totalScore = 20;
        return res.json(parsed);
      } catch (parseErr) {
        console.warn('Gemini response could not be parsed as JSON, falling back:', parseErr);
      }
    }

    // High quality pedagogical fallback when API key is not configured yet
    const fallbackTitle = `Évaluation Diagnostique : ${subject} — ${classLevel} ${stream ? `(${stream})` : ''}`;
    const fallbackEvaluation = generatePedagogicalFallback(classLevel, stream, subject, notionsToEvaluate);

    return res.json(fallbackEvaluation);
  } catch (error: any) {
    console.error('Error generating evaluation:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération du devoir.',
      details: error?.message || 'Erreur inconnue',
    });
  }
});

function generatePedagogicalFallback(classLevel: string, stream: string, subject: string, notions: string[]) {
  const isScientific = ['Mathématiques', 'Physique', 'Chimie', 'Informatique', 'SVT'].includes(subject);
  const notionMain = notions[0] || 'Généralités du programme';
  const notionSecondary = notions[1] || notions[0] || 'Applications fondamentales';

  const exercises = [
    {
      id: 'ex-1',
      title: `Exercice 1 : Maîtrise des concepts et définitions — ${notionMain}`,
      points: 5,
      statement: isScientific
        ? `1. Rappeler la définition formelle de la notion suivante : **${notionMain}** (1.5 pt).\n2. Énoncer les conditions d'application des théorèmes directeurs associés (1.5 pt).\n3. Application directe : vérifier si la relation $f(x) = \\frac{ax+b}{cx+d}$ ou la loi physique fondamentale s'applique dans le cas standard (2 pts).`
        : `1. Définir précisément les notions clés étudiées : **${notionMain}** (2 pts).\n2. Expliquer l'enjeu principal et donner deux exemples caractéristiques (3 pts).`,
      solution: `1. Définition rigoureuse : mentionner le domaine de validité et les hypothèses requises.\n2. Énoncé exact des théorèmes ou règles grammaticales/conceptuelles.\n3. Application numérique ou rédactionnelle : justification attendue avec unité ou syntaxe correcte.`,
    },
    {
      id: 'ex-2',
      title: `Exercice 2 : Application méthodique et calculs — ${notionSecondary}`,
      points: 7,
      statement: isScientific
        ? `Soit le problème d'application sur la notion **${notionSecondary}** :\n\n1. Établir l'expression littérale ou formuler l'hypothèse principale sous la forme $y(t) = A \\cos(\\omega t + \\varphi)$ ou $P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$ (2.5 pts).\n2. Effectuer la résolution analytique pas-à-pas en détaillant chaque étape (2.5 pts).\n3. Interpréter la cohérence du résultat obtenu (2 pts).`
        : `Analyse et commentaire guidé sur la notion **${notionSecondary}** :\n\n1. Identifier les éléments structurants du document ou du passage proposé (3 pts).\n2. Développer un paragraphe argumenté structuré illustrant la maîtrise de la notion (4 pts).`,
      solution: `1. Formulation correcte des équations de départ.\n2. Résolution analytique rigoureuse étape par étape avec justification des simplifications.\n3. Conclusion cohérente et validation dimensionnelle.`,
    },
    {
      id: 'ex-3',
      title: `Exercice 3 : Problème de synthèse et modélisation`,
      points: 8,
      statement: isScientific
        ? `Dans cette épreuve de synthèse mobilisant les notions : ${notions.join(', ')}.\n\nUne situation concrète est modélisée. L'élève doit :\n1. Modéliser le système par un jeu d'équations ou d'algorithmes (2.5 pts).\n2. Résoudre le système ou concevoir l'algorithme d'optimisation (3 pts).\n3. Conclure avec un esprit critique sur les limites du modèle (2.5 pts).`
        : `Étude de cas complexe et synthèse critique sur : ${notions.join(', ')}.\n\n1. Mise en perspective historique ou contextuelle (2.5 pts).\n2. Analyse comparée des approches (3 pts).\n3. Synthèse personnelle étayée et conclusion (2.5 pts).`,
      solution: `1. Modélisation complète avec explicitation de toutes les variables et contraintes.\n2. Démonstration rigoureuse et calculs exempts d'erreur.\n3. Discussion pertinente sur la portée des résultats.`,
    },
  ];

  return {
    title: `Devoir Surveillé : ${subject} — ${classLevel} ${stream ? `(${stream})` : ''}`,
    totalScore: 20,
    instructions: `Durée conseillée : 1h30 à 2h00. ${
      isScientific ? 'Calculatrice autorisée selon la réglementation en vigueur. ' : ''
    }La clarté de la rédaction, la précision du vocabulaire et le soin apporté aux démonstrations sont pris en compte dans la notation. Barème total : 20 points.`,
    exercises,
  };
}

// Vite middleware for dev / static for prod
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Synapse Coach HPG server listening on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
