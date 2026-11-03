# Simulateur Support IT (Ostral Biologie)

Un poste de travail Windows simulé dans le navigateur pour s’entraîner au métier de technicien support IT (N1, matériel et outils informatiques), dans le contexte d’un laboratoire de biologie médicale multisite.

## Lancer en local

Aucune installation n’est nécessaire : le site est en HTML/CSS/JS pur, sans dépendance.

Option 1 : double-clic sur `index.html`.

Option 2 : serveur local, puis ouvrir http://localhost:8080

```bash
python3 -m http.server 8080
```

Après une modification de `app.html`, régénérer `index.html` :

```bash
python3 build.py
```

## Ce qu’il y a dedans

- **Mode tutoriel** (bouton « Tutoriel » dans la barre des tâches, activé par défaut) : le Coach explique chaque ticket étape par étape, dans l’ordre, avec quoi faire, où cliquer et pourquoi. Les étapes se cochent toutes seules. Un ticket fait en mode tutoriel rapporte moitié moins d’XP et il est marqué comme tel dans les bilans.

- **Service Desk** : file de tickets, qualification (type, catégorie, impact × urgence → priorité, règle VIP), délais (SLA) sur une horloge simulée, activité, notes de travail, résolution ou escalade.
- **Softphone** : appeler le demandeur, poser les bonnes questions, vérifier son identité (matricule comparé à l’annuaire, rappel sur le numéro de l’annuaire).
- **Utilisateurs et ordinateurs Active Directory** : déverrouiller, réinitialiser un mot de passe, groupes, création de compte, clés BitLocker.
- **Console cloud** : connexions suspectes, révocation des sessions, boîte aux lettres, règles de boîte.
- **Assistance à distance** : actions sur le poste de l’utilisateur et PowerShell administrateur distant.
- **PowerShell local** : commandes réseau et cmdlets AD.
- **PuTTY** : SSH vers un serveur Debian (systemctl, journalctl, df, du, tubes, boucles).
- **Intervention sur site** : constats physiques, câblage, mémoire, préparation de poste.
- **Supervision** et **Wiki IT** (30 fiches).
- **Espace formation** : suivi des performances dans le temps (courbe des scores, compétences, points à travailler, catégories, régularité), bilans détaillés de chaque ticket, quiz, labo de commandes Windows et Linux, badges.

23 scénarios : compte verrouillé, boîte pleine, câble sur prise non brassée, file d’impression, VPN et portail captif, PC lent (logiciel indésirable), phishing, arrivée d’un salarié, droits sur un partage, double écran, logiciel à installer, Teams (VIP), serveur de fichiers en panne (P1), BitLocker, disque plein, restauration de fichier, PC de paillasse (3 bips), faux DAF (ingénierie sociale), téléphone IP (PoE), préparation d’un portable, étiquettes de tubes, intranet Linux en 502, « Internet ne marche plus ».

La progression est sauvegardée dans le navigateur (et sur le compte claude.ai quand le simulateur est ouvert comme Artifact).
