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

## Correctifs et ajouts (25 septembre 2026, itération 2)
- Barre de recherche: sélecteurs disposés en 2x2 (accueil) ou 4 colonnes (page recherche), libellés complets lisibles, chevron positionné, bouton pleine largeur sur mobile. Plus de troncature.
- Annulation de rendez-vous: confirmation (window.confirm), gestion d'erreur réseau avec toasts sonner (plus d'overlay d'erreur runtime), rechargement de la liste.
- Reçu d'assurance: génération PDF réelle côté backend (reportlab) via GET /api/consultations/{id}/receipt, téléchargement direct en PDF (remplace window.print qui faisait planter la page).
- Profil: champ Nationalité transformé en liste déroulante de 196 nationalités (frontend/src/lib/nationalities.js).
- Toaster sonner global ajouté dans App.js.
- Tests E2E itération 2: 100% (backend 16/16, frontend desktop + mobile).

## Nouveautés (25 septembre 2026, itération 3)
- Vérification du permis d'exercice: chaque médecin porte un permis (numéro, registre CMQ, statut, date de vérification). Badge "Permis CMQ vérifié" sur les cartes et le modal, section "Permis d'exercice" avec lien vers le bottin du Collège des médecins. Endpoint GET /api/doctors/{id}/license. SIMULÉ à partir des données seed (pas d'appel au vrai registre).
- Optimisation par distance: coordonnées lat/lng par médecin, calcul haversine côté backend (params lat, lng, sort=distance|price|rating, max_km). Panneau "Proximité" sur la page recherche: bouton "Autour de moi" (géolocalisation navigateur), points de référence de secours (6 villes/quartiers), rayon maximal, affichage "À X km de vous" sur chaque carte, sélecteur de tri.
- Correctif responsive: cartes médecin et grille de recherche sans débordement horizontal sur mobile.
- Tests E2E itération 3: backend 23/23, frontend 100% après correctif mobile.

## Backlog / Prochaines étapes
- P1: Authentification patient (JWT ou Google Emergent) pour multi-utilisateurs réels.
- P1: Espace médecin (agenda, gestion des créneaux réels).
- P2: Notifications courriel de confirmation/rappel (Resend).
- P2: Téléversement réel des ordonnances et reçus (object storage).
- P2: Avis clients vérifiés et notation.
- P2: Génération PDF du récapitulatif de rendez-vous (le reçu de consultation est déjà en PDF).
