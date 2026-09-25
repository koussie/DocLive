# DocLive - Plateforme de prise de rendez-vous médicaux

Projet Spring Boot proposant une API REST simplifiée pour réserver un rendez-vous entre un patient et un médecin. L'authentification repose sur JWT et la persistance sur PostgreSQL.

## Périmètre fonctionnel
- Inscription et login (`/auth/register`, `/auth/login`).
- Gestion des rendez-vous pour le patient connecté (`/appointments`).
- Annulation d'un rendez-vous (`DELETE /appointments/{id}`).
- Listing des médecins disponibles (`/users/doctors`).
- Sécurisation par rôles avec Spring Security et `@PreAuthorize`.
- Envoi d'email de confirmation lors de la création de rendez-vous (Mailtrap ou mock SMTP).
- Documentation OpenAPI/Swagger disponible sur `/swagger-ui.html`.

## Démarrage rapide
1. Configurer la base PostgreSQL dans `src/main/resources/application.properties`.
2. Lancer l'application :
   ```bash
   mvn spring-boot:run
   ```
3. Se rendre sur `http://localhost:8080/swagger-ui.html` pour explorer les endpoints.

## Tests
Un test unitaire illustre la logique métier de `AppointmentService` (gestion des doublons sur un créneau). Exécuter :
```bash
mvn test
```
