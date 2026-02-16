const express = require("express");
const router = express.Router();

const tips = [
    {
        title: "Bien préparer sa séance",
        tags: ["avant", "préparation"],
        content: [
            "Mange correctement avant le rendez-vous (évite d’arriver à jeun).",
            "Dors bien la veille : fatigue = douleur + cicatrisation moins top.",
            "Évite l’alcool 24h avant (ça fluidifie le sang).",
            "Porte des vêtements confortables qui donnent accès à la zone à tatouer.",
        ],
    },
    {
        title: "Hygiène et choix du tatoueur",
        tags: ["hygiène", "sécurité"],
        content: [
            "Vérifie que le matériel est stérile et à usage unique (aiguilles).",
            "Le tatoueur doit porter des gants et désinfecter la zone.",
            "Regarde les avis + le portfolio (lignes, cicatrisation, régularité).",
            "Méfie-toi des prix trop bas : la qualité et l’hygiène ont un coût.",
        ],
    },
    {
        title: "Cicatrisation (les bases)",
        tags: ["après", "soins"],
        content: [
            "Lave délicatement avec un savon doux, puis sèche en tapotant.",
            "Hydrate avec une crème conseillée par le tatoueur (fine couche).",
            "Évite piscine/mer/sauna pendant 2–3 semaines.",
            "Pas de soleil direct, et écran total une fois cicatrisé.",
        ],
    },
    {
        title: "Douleur et zones sensibles",
        tags: ["douleur", "zones"],
        content: [
            "La douleur varie selon les zones (côtes, mains, pieds : souvent plus sensible).",
            "Respire lentement et évite de bouger pendant le tracé.",
            "N’hésite pas à demander une petite pause.",
        ],
    },
];

router.get("/", (req, res) => {
    const q = (req.query.q || "").trim().toLowerCase();

    const filtered = q
        ? tips.filter((t) =>
            t.title.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            t.content.some((line) => line.toLowerCase().includes(q))
        )
        : tips;

    res.render("advice/index", {
        title: "Conseils tatouage",
        tips: filtered,
        q,
    });
});

module.exports = router;
