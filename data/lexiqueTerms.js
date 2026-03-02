const lexiqueTerms = [
  // =========================
  // TATOUAGE
  // =========================
  {
    term: "Flash",
    domain: "Tatouage",
    category: "Concept",
    definition: "Motif prêt à tatouer, souvent affiché en studio ou sur les réseaux.",
  },
  {
    term: "Custom",
    domain: "Tatouage",
    category: "Concept",
    definition: "Tatouage unique, dessiné spécialement pour le client.",
  },
  {
    term: "Stencil",
    domain: "Tatouage",
    category: "Technique",
    definition: "Transfert du dessin sur la peau avant tatouage.",
  },
  {
    term: "Linework",
    domain: "Tatouage",
    category: "Technique",
    definition: "Travail des lignes du tatouage.",
  },
  {
    term: "Ombrage",
    domain: "Tatouage",
    category: "Technique",
    definition: "Technique permettant de créer des dégradés et des effets de profondeur.",
  },
  {
    term: "Dotwork",
    domain: "Tatouage",
    category: "Style",
    definition: "Style utilisant uniquement des points pour créer un motif.",
  },
  {
    term: "Blackwork",
    domain: "Tatouage",
    category: "Style",
    definition: "Tatouage réalisé uniquement avec de l’encre noire.",
  },
  {
    term: "Fine Line",
    domain: "Tatouage",
    category: "Style",
    definition: "Tatouage avec des lignes très fines et précises.",
  },
  {
    term: "Old School",
    domain: "Tatouage",
    category: "Style",
    definition: "Style traditionnel avec lignes épaisses et couleurs vives.",
  },
  {
    term: "New School",
    domain: "Tatouage",
    category: "Style",
    definition: "Style moderne inspiré du cartoon et du graffiti.",
  },
  {
    term: "Réalisme",
    domain: "Tatouage",
    category: "Style",
    definition: "Tatouage reproduisant un sujet de manière réaliste.",
  },
  {
    term: "Cover",
    domain: "Tatouage",
    category: "Technique",
    definition: "Tatouage réalisé pour recouvrir un ancien tatouage.",
  },
  {
    term: "Retouche",
    domain: "Tatouage",
    category: "Entretien",
    definition: "Correction ou amélioration d’un tatouage après cicatrisation.",
  },
  {
    term: "Cicatrisation",
    domain: "Tatouage",
    category: "Soins",
    definition: "Processus de guérison de la peau après un tatouage.",
  },
  {
    term: "Encre",
    domain: "Tatouage",
    category: "Matériel",
    definition: "Pigment utilisé pour réaliser le tatouage.",
  },
  {
    term: "Machine",
    domain: "Tatouage",
    category: "Matériel",
    definition: "Appareil utilisé par le tatoueur pour injecter l’encre dans la peau.",
  },
  {
    term: "Aiguille",
    domain: "Tatouage",
    category: "Matériel",
    definition: "Composant qui permet de déposer l’encre dans la peau.",
  },
  {
    term: "Cartouche",
    domain: "Tatouage",
    category: "Matériel",
    definition: "Module contenant les aiguilles, utilisé avec certaines machines.",
  },
  {
    term: "Tatouage cicatrisé",
    domain: "Tatouage",
    category: "Résultat",
    definition: "Tatouage après guérison complète de la peau.",
  },
  {
    term: "Placement",
    domain: "Tatouage",
    category: "Concept",
    definition: "Zone du corps où le tatouage est réalisé.",
  },

  // =========================
  // PIERCING
  // =========================
  {
    term: "Lobe",
    domain: "Piercing",
    category: "Emplacement",
    area: "Oreille",
    definition: "Piercing réalisé sur le lobe de l’oreille. C’est le plus courant et généralement le moins douloureux.",
  },
  {
    term: "Helix",
    domain: "Piercing",
    category: "Emplacement",
    area: "Oreille",
    definition: "Piercing situé sur le cartilage supérieur de l’oreille.",
  },
  {
    term: "Tragus",
    domain: "Piercing",
    category: "Emplacement",
    area: "Oreille",
    definition: "Piercing placé sur la petite partie cartilagineuse devant le conduit auditif.",
  },
  {
    term: "Conch",
    domain: "Piercing",
    category: "Emplacement",
    area: "Oreille",
    definition: "Piercing réalisé dans la partie centrale interne du cartilage de l’oreille.",
  },
  {
    term: "Septum",
    domain: "Piercing",
    category: "Emplacement",
    area: "Nez",
    definition: "Piercing situé dans la cloison nasale, entre les deux narines.",
  },
  {
    term: "Nostril",
    domain: "Piercing",
    category: "Emplacement",
    area: "Nez",
    definition: "Piercing classique placé sur une narine.",
  },
  {
    term: "Arcade",
    domain: "Piercing",
    category: "Emplacement",
    area: "Visage",
    definition: "Piercing situé au niveau du sourcil.",
  },
  {
    term: "Labret",
    domain: "Piercing",
    category: "Emplacement",
    area: "Bouche",
    definition: "Piercing situé sous la lèvre inférieure, centré ou décalé.",
  },
  {
    term: "Medusa",
    domain: "Piercing",
    category: "Emplacement",
    area: "Bouche",
    definition: "Piercing placé au centre au-dessus de la lèvre supérieure.",
  },
  {
    term: "Langue",
    domain: "Piercing",
    category: "Emplacement",
    area: "Bouche",
    definition: "Piercing vertical au centre de la langue.",
  },
  {
    term: "Téton",
    domain: "Piercing",
    category: "Emplacement",
    area: "Corps",
    definition: "Piercing horizontal ou vertical du mamelon.",
  },
  {
    term: "Nombril",
    domain: "Piercing",
    category: "Emplacement",
    area: "Corps",
    definition: "Piercing situé au niveau du nombril, généralement sur la partie supérieure.",
  },
  {
    term: "Stretching",
    domain: "Piercing",
    category: "Technique",
    definition: "Processus d’agrandissement progressif d’un piercing (souvent le lobe) afin d’augmenter son diamètre.",
  },
  {
    term: "Bijou en titane",
    domain: "Piercing",
    category: "Matériau",
    definition: "Matériau hypoallergénique recommandé pour les premiers piercings en raison de sa biocompatibilité.",
  },
  {
    term: "Cicatrisation",
    domain: "Piercing",
    category: "Soins",
    definition: "Période pendant laquelle le piercing guérit. Elle varie selon l’emplacement et peut durer de quelques semaines à plusieurs mois.",
  },
  {
    term: "Rejet",
    domain: "Piercing",
    category: "Complication",
    definition: "Phénomène où le corps pousse progressivement le bijou vers l’extérieur.",
  },
];

module.exports = lexiqueTerms;