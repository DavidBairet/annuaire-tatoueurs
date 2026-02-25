// /data/adviceTips.js
const adviceTips = [
  {
    title: "Bien préparer sa séance de tatouage",
    tags: ["tatouage", "préparation", "avant"],
    content: [
      "Mange correctement avant le rendez-vous (évite d’arriver à jeun).",
      "Dors bien la veille : fatigue = douleur + cicatrisation moins top.",
      "Évite l’alcool 24h avant (ça fluidifie le sang).",
      "Porte des vêtements confortables qui donnent accès à la zone.",
      "Préviens le tatoueur si tu es malade ou sous traitement.",
    ],
  },
  {
    title: "Hydratation et peau : le combo gagnant",
    tags: ["tatouage", "peau", "préparation"],
    content: [
      "Hydrate ta peau les jours précédents (pas le jour même sur la zone).",
      "Évite les coups de soleil avant la séance.",
      "Ne viens pas avec une peau irritée (rasage agressif, gommage).",
      "Si tu as la peau sèche, dis-le au tatoueur.",
    ],
  },
  {
    title: "Douleur : comment mieux la gérer",
    tags: ["tatouage", "douleur", "astuces"],
    content: [
      "Respire lentement et régulièrement pendant les passages sensibles.",
      "Évite café/boissons énergisantes si tu stresses (ça peut amplifier).",
      "Fais des pauses si besoin : mieux vaut propre que rapide.",
      "Prévois un snack et de l’eau pour les longues séances.",
    ],
  },
  {
    title: "Choisir son tatoueur : les bons réflexes",
    tags: ["tatouage", "choix", "sécurité"],
    content: [
      "Regarde un portfolio complet (pas seulement 3 photos).",
      "Vérifie que le style correspond au rendu que tu veux.",
      "Lis les avis, mais regarde surtout la régularité sur plusieurs mois.",
      "Pose des questions : un pro explique son process sans s’énerver.",
    ],
  },
  {
    title: "Hygiène : ce que tu dois voir en studio",
    tags: ["tatouage", "hygiène", "sécurité"],
    content: [
      "Gants, désinfection, poste protégé (films, champs).",
      "Aiguilles et consommables à usage unique.",
      "Surfaces nettoyées entre chaque client.",
      "Pas d’animaux dans la zone de travail.",
    ],
  },
  {
    title: "Le bon motif au bon endroit",
    tags: ["tatouage", "placement", "design"],
    content: [
      "Un motif fin vieillit mieux sur des zones peu frottées.",
      "Évite les micro-détails extrêmes sur doigts/pieds (ça bouge).",
      "Pense à l’évolution du corps (prise/perte de poids).",
      "Teste le placement : photo + miroir + tenue du quotidien.",
    ],
  },
  {
    title: "Avant la séance : à éviter absolument",
    tags: ["tatouage", "avant", "sécurité"],
    content: [
      "Alcool 24h avant, drogues, manque de sommeil.",
      "Arriver stressé et à jeun.",
      "Exposition soleil/UV sur la zone.",
      "Sport intense juste avant (transpiration + peau chaude).",
    ],
  },
  {
    title: "Après séance : les 6 premières heures",
    tags: ["tatouage", "après", "soins"],
    content: [
      "Suis les consignes du tatoueur (film classique ou film seconde peau).",
      "Lave-toi les mains avant de toucher ton tattoo.",
      "Évite frottements, poussière, poils d’animaux.",
      "Porte des vêtements propres et amples.",
    ],
  },
  {
    title: "Lavage : simple, doux, efficace",
    tags: ["tatouage", "lavage", "soins"],
    content: [
      "Lave 1 à 2 fois par jour avec un savon doux (sans parfum).",
      "Rince à l’eau tiède, sans frotter fort.",
      "Tamponne avec une serviette propre (pas de frottage).",
      "Laisse sécher quelques minutes avant la crème.",
    ],
  },
  {
    title: "Crème : la règle d’or",
    tags: ["tatouage", "crème", "cicatrisation"],
    content: [
      "Une fine couche : trop de crème = peau étouffée.",
      "Évite les produits parfumés ou agressifs.",
      "Si ça suinte beaucoup, espace la crème et lave plus souvent.",
      "Demande une recommandation à ton tatoueur (selon ta peau).",
    ],
  },
  {
    title: "Croûtes et démangeaisons : quoi faire",
    tags: ["tatouage", "cicatrisation", "astuces"],
    content: [
      "Ne gratte pas, ne tire pas les peaux mortes.",
      "Si ça gratte : tapote doucement autour, hydrate légèrement.",
      "Évite vêtements serrés qui arrachent les croûtes.",
      "Si tu as une grosse croûte épaisse : surveille et garde propre.",
    ],
  },
  {
    title: "Soleil : le grand ennemi du tatouage",
    tags: ["tatouage", "soleil", "protection"],
    content: [
      "Pas de soleil direct pendant la cicatrisation.",
      "Une fois cicatrisé : crème solaire SPF 50 sur le tattoo.",
      "Le soleil fait pâlir les couleurs plus vite.",
      "Couvre la zone si tu dois sortir longtemps.",
    ],
  },
  {
    title: "Piscine / mer / sauna : quand reprendre ?",
    tags: ["tatouage", "après", "hygiène"],
    content: [
      "Évite piscine, mer, sauna, hammam pendant 2 à 4 semaines.",
      "Le sel/chlore + macération = risque d’infection et délavage.",
      "Attends que la peau soit totalement refermée.",
    ],
  },
  {
    title: "Sport : comment reprendre sans risque",
    tags: ["tatouage", "sport", "après"],
    content: [
      "Évite sport intense 48-72h (selon la zone).",
      "Transpiration + frottements = irritation.",
      "Nettoie après la séance de sport et hydrate léger.",
      "Protège la zone (vêtements amples, pas de contact direct).",
    ],
  },
  {
    title: "Sommeil : protéger ton tattoo la nuit",
    tags: ["tatouage", "après", "soins"],
    content: [
      "Draps propres, vêtements propres.",
      "Évite de dormir directement sur la zone si possible.",
      "Si ça colle : humidifie légèrement à l’eau tiède avant de décoller.",
    ],
  },
  {
    title: "Retouches : c’est normal",
    tags: ["tatouage", "retouche", "info"],
    content: [
      "Un tattoo peut nécessiter une retouche (peau, zone, encre).",
      "Attends la cicatrisation complète avant de juger.",
      "Garde tes photos : avant / après / cicatrisation.",
    ],
  },
  {
    title: "Tatouage et travail : anticipe",
    tags: ["tatouage", "organisation", "après"],
    content: [
      "Si ton job est physique : prévois un jour off si possible.",
      "Poussière / saleté : protège la zone et nettoie régulièrement.",
      "Uniforme serré : attention aux frottements.",
    ],
  },
  {
    title: "Peau sensible : précautions",
    tags: ["tatouage", "peau", "sécurité"],
    content: [
      "Préviens le tatoueur (eczéma, allergies, peau réactive).",
      "Évite nouveaux produits juste avant/après.",
      "Surveille rougeurs anormales ou chaleur persistante.",
    ],
  },
  {
    title: "Signes d’alerte : quand consulter",
    tags: ["tatouage", "sécurité", "santé"],
    content: [
      "Douleur qui augmente fortement après 48h.",
      "Pus, odeur, fièvre, rougeur qui s’étend.",
      "Zone très chaude + gonflement important.",
      "Dans le doute : avis médical rapidement.",
    ],
  },
  {
    title: "Bien préparer son piercing",
    tags: ["piercing", "préparation", "avant"],
    content: [
      "Évite alcool et drogues avant la séance.",
      "Mange avant le rendez-vous.",
      "Choisis un pierceur professionnel (hygiène irréprochable).",
      "Prévois des vêtements confortables et propres.",
    ],
  },
  {
    title: "Soins piercing : les bases",
    tags: ["piercing", "soins", "cicatrisation"],
    content: [
      "Nettoie avec du sérum physiologique (souvent 1 à 2 fois/jour).",
      "Ne tourne pas le bijou (ça irrite).",
      "Mains propres avant tout contact.",
      "Évite maquillage/parfum sur la zone.",
    ],
  },
  {
    title: "Piercing : ce qu’il faut éviter",
    tags: ["piercing", "erreurs", "sécurité"],
    content: [
      "Alcool sur la plaie (trop agressif).",
      "Changer le bijou trop tôt.",
      "Toucher tout le temps ou retirer les croûtes.",
      "Dormir en appuyant sur le piercing (oreille).",
    ],
  },
  {
    title: "Bijoux : qualité et matériaux",
    tags: ["piercing", "bijoux", "sécurité"],
    content: [
      "Privilégie titane implant grade, acier chirurgical de qualité, or adapté.",
      "Évite les bijoux fantaisie au début (allergies).",
      "Un bon bijou = meilleure cicatrisation.",
    ],
  },
  {
    title: "Piercing et piscine/mer : prudence",
    tags: ["piercing", "hygiène", "après"],
    content: [
      "Évite piscine/mer pendant la cicatrisation.",
      "L’eau + bactéries = complications possibles.",
      "Si tu n’as pas le choix : rince et nettoie juste après.",
    ],
  },
  {
    title: "Piercing : rougeurs ou irritation ?",
    tags: ["piercing", "cicatrisation", "astuces"],
    content: [
      "Un peu de rougeur au début est normal.",
      "Si ça gonfle beaucoup ou chauffe : surveille et nettoie correctement.",
      "Évite les frottements (casque, écouteurs, vêtements).",
      "Demande l’avis de ton pierceur si ça dure.",
    ],
  },
  {
    title: "Avant un rendez-vous : prépare ton idée",
    tags: ["tatouage", "projet", "préparation"],
    content: [
      "Ramène 3 à 6 références (styles, motifs, placement).",
      "Explique ce que tu aimes (lignes, ombrages, couleurs).",
      "Sois ouvert : un pro adapte pour un meilleur rendu et vieillissement.",
    ],
  },
  {
    title: "Budget : éviter les mauvaises surprises",
    tags: ["tatouage", "budget", "conseils"],
    content: [
      "Un tattoo de qualité coûte du temps et du matériel.",
      "Méfie-toi des prix anormalement bas.",
      "Demande un devis ou une estimation réaliste.",
      "Prévois un pourboire si tu es satisfait (pas obligatoire).",
    ],
  },
  {
    title: "Photos et portfolio : comment juger",
    tags: ["tatouage", "portfolio", "choix"],
    content: [
      "Regarde des photos cicatrisées (pas uniquement fraîches).",
      "Observe la netteté des lignes et la régularité.",
      "Les couleurs doivent être propres, pas boueuses.",
      "Compare plusieurs pièces, pas un seul tattoo réussi.",
    ],
  },
  {
    title: "Le jour J : check-list rapide",
    tags: ["tatouage", "organisation", "avant"],
    content: [
      "Carte d’identité si besoin + moyen de paiement.",
      "Snack + eau (surtout longues séances).",
      "Vêtements adaptés à la zone.",
      "Batterie du téléphone / écouteurs si tu veux te distraire.",
      "Arrive à l’heure et détendu.",
    ],
  },
];

module.exports = adviceTips;