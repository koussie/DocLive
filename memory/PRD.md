# DocLive - PRD

## Problème initial
MVP inspiré de Doctolib pour la prise de rendez-vous médical en ligne au Québec, destiné aux travailleurs temporaires et étudiants étrangers sans carte RAMQ. Design sobre, professionnel, sans esthétique IA générique, en français, sans tirets longs.

## Contexte technique
- Backend original fourni en Java/Spring Boot (DocLive). Réimplémenté sur la stack native de l'environnement: FastAPI + React + MongoDB.
- Modèle de domaine inspiré des entités Java (User, Appointment, AppointmentStatus).

## Personas
- Étudiants internationaux et travailleurs temporaires au Québec sans RAMQ, couverts par une assurance privée (Guard.me, MSH, Croix Bleue, Sun Life, Desjardins, Allianz) ou en paiement direct.

## Choix utilisateur (MVP)
- Parcours patient uniquement, sans authentification (démo).
- Palette bleu médical + vert/teal santé.

## Fonctionnalités implémentées (25 juin 2026)
- Page d'accueil: hero, barre de recherche multi-champs (spécialité, ville, langue, couverture), spécialités, "comment ça fonctionne", médecins recommandés, CTA.
- Recherche de médecins avec filtres (spécialité, ville, langue, assurance, téléconsultation) et grille de créneaux.
- Modal profil médecin (présentation, actes, formation, assurances, créneaux).
- Réservation en 3 étapes (créneau -> infos patient sans RAMQ -> confirmation) avec gestion des conflits de créneau (409).
- Mes rendez-vous: à venir / historique, annulation.
- Historique et suivi: timeline des consultations (diagnostic, ordonnance, reçu assurance).
- Profil patient sans RAMQ: statut d'immigration, passeport, assureur, police, couverture.
- Backend: seed automatique (8 médecins, 3 consultations, 1 profil).

## État
- Tests E2E backend + frontend: 100% (itération 1). Aucun bug bloquant.

## Backlog / Prochaines étapes
- P1: Authentification patient (JWT ou Google Emergent) pour multi-utilisateurs réels.
- P1: Espace médecin (agenda, gestion des créneaux réels).
- P2: Notifications courriel de confirmation/rappel (Resend).
- P2: Téléversement réel des ordonnances et reçus (object storage).
- P2: Avis clients vérifiés et notation.
- P2: Génération PDF réelle du récapitulatif et du reçu.
