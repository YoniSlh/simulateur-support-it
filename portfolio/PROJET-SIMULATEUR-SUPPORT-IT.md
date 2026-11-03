# Projet : Simulateur Support IT

> Fiche de contexte pour ajouter ce projet à la section « Projets » du portfolio.
> À mentionner à Claude Code avec `@` (voir le prompt en bas de ce fichier).

## En une phrase

Un poste de travail de technicien support IT simulé dans le navigateur : on y traite de vrais tickets avec les outils du métier (Service Desk, Active Directory, PowerShell, SSH Linux, téléphonie IP, intervention sur site), chaque ticket est noté et la progression est suivie dans le temps.

## Pourquoi ce projet

Je prépare un poste de **Support IT / Matériel & Outils informatiques** dans un laboratoire d’analyses médicales. Plutôt que de seulement lire des cours, j’ai conçu un environnement d’entraînement qui reproduit une journée de travail réelle : appels utilisateurs, diagnostic, procédures de sécurité, escalade, documentation. Le contexte est celui d’un laboratoire de biologie médicale multisite fictif (« Ostral Biologie ») : plateau technique, sites de prélèvement, logiciel de laboratoire (SIL), étiquettes de tubes, données de santé.

## Ce que fait le simulateur

- **Un bureau Windows réaliste** : barre des tâches, menu Démarrer, fenêtres déplaçables, notifications, horloge de service.
- **12 applications simulées** :
  - Service Desk (file de tickets, qualification, priorité, délais SLA, activité, résolution ou escalade) ;
  - Softphone (appels, questions de diagnostic, vérification d’identité) ;
  - Utilisateurs et ordinateurs Active Directory (déverrouillage, mot de passe, groupes, création de compte, clés BitLocker) ;
  - Console cloud (connexions suspectes, révocation de sessions, boîte aux lettres) ;
  - Assistance à distance et PowerShell administrateur ;
  - PowerShell local avec cmdlets AD ;
  - PuTTY : SSH vers un serveur Debian (systemctl, journalctl, df, du, tubes, boucles for) ;
  - Intervention sur site (câblage, mémoire, préparation de poste) ;
  - Supervision, Wiki IT, Espace formation, Coach.
- **23 scénarios réalistes** : compte verrouillé, boîte mail pleine, prise réseau non brassée, file d’impression bloquée, VPN et portail captif d’hôtel, logiciel indésirable, phishing avec compromission, arrivée d’un salarié, droits sur un partage, BitLocker, disque plein, restauration de fichier, PC qui ne démarre plus (3 bips), faux appel du directeur financier (ingénierie sociale), téléphone IP sans PoE, préparation complète d’un portable, étiquettes de tubes décalées, intranet Linux en erreur 502, panne de serveur de fichiers (incident majeur P1), « Internet ne marche plus »…
- **Une notation sur 100** en 5 axes : qualification, diagnostic, résolution, sécurité et procédure, communication. Fautes graves détectées (mot de passe donné à un imposteur, droits excessifs…).
- **Un bilan après chaque ticket** : choix comparés à l’attendu, procédure idéale, points à retenir.
- **Un suivi des performances dans le temps** : courbe des scores, évolution par compétence, étapes oubliées le plus souvent, score par catégorie, régularité, badges, niveaux.
- **Un mode tutoriel** : un Coach explique chaque ticket étape par étape (quoi faire, où cliquer, pourquoi), les étapes se cochent automatiquement.
- **Pour réviser** : 80 questions de quiz sur 10 thèmes, 28 exercices de commandes Windows et Linux, 30 fiches de wiki (dont une préparation à l’entretien).

## Chiffres clés

| | |
|---|---|
| Scénarios | 23, chacun avec son guide pas à pas |
| Applications simulées | 12 |
| Fiches de wiki | 30 |
| Questions de quiz | 80 (10 thèmes) |
| Exercices de terminal | 28 (14 Windows, 14 Linux) |
| Code | environ 6 500 lignes, HTML, CSS et JavaScript |
| Dépendances | aucune bibliothèque, aucun framework |

## Technique

- **HTML, CSS et JavaScript natifs**, sans framework ni bibliothèque : le site se charge vite et fonctionne même en ouvrant `index.html` directement.
- **Gestionnaire de fenêtres** maison (déplacement, redimensionnement, réduction, agrandissement, premier plan).
- **Moteur de scénarios** : chaque action (question posée, commande tapée, clic dans l’AD) pose un « drapeau » horodaté ; la notation et le Coach lisent ces drapeaux, ce qui permet aussi de vérifier l’ordre des étapes (par exemple « accord écrit obtenu avant l’ajout du droit »).
- **Deux terminaux simulés** : invite Windows / PowerShell (ipconfig, ping, nslookup, tracert, Get-Service, Get-PrintJob, Get-ADUser…) et bash Linux avec un système de fichiers virtuel, `sudo`, tubes (`| grep | sort -h | wc -l`) et boucles `for`.
- **Graphiques en SVG** faits à la main, avec info-bulles au survol.
- **Thème clair et sombre**, affichage adapté au mobile.
- **Sauvegarde** de la progression dans le navigateur (et sur le compte quand le simulateur est ouvert comme Artifact claude.ai).

## Compétences mises en avant

- **Support IT** : méthode de dépannage, ITIL (incident, demande, priorité impact × urgence, SLA), Active Directory, PowerShell, réseau (IP, DHCP, DNS, VPN, PoE), Linux (services, journaux, disque), sécurité (vérification d’identité, phishing, ingénierie sociale, moindre privilège), préparation de postes, communication avec les utilisateurs, documentation et escalade.
- **Contexte laboratoire médical** : continuité de service, identitovigilance, données de santé, traçabilité.
- **Conception** : cahier des charges, scénarios pédagogiques, système de notation, interface réaliste.

## Réalisation

Projet personnel, novembre 2026 : définition du besoin, du contexte métier, des scénarios et du système de notation, puis tests de chaque scénario.

## Liens et fichiers

- **Démo** : https://claude.ai/artifact/Wgsh9AidpNfpqm6khgnjSM (lien privé pour l’instant, voir « Rendre la démo publique » ci-dessous).
- **Captures** (dans le dossier `captures/` à côté de ce fichier) :
  - `01-bureau-mode-tutoriel.png` : le bureau, un ticket en cours, le Softphone et le Coach en mode tutoriel ;
  - `02-active-directory.png` : la console Active Directory et la vérification d’identité ;
  - `03-ssh-linux.png` : diagnostic d’un serveur Debian en SSH (service en échec, disque plein) ;
  - `04-suivi-performances.png` : le tableau de bord de suivi (courbe des scores, points à travailler) ;
  - `05-competences.png` : l’évolution par compétence et par catégorie ;
  - `06-bilan-ticket.png` : le bilan détaillé d’un ticket ;
  - `07-assistance-distance.png` : la prise en main à distance.
  Les captures ont été faites avec une session de démonstration.

## Rendre la démo publique

Le lien claude.ai est privé par défaut. Deux possibilités :
1. **Partager l’Artifact** depuis le menu « Partager » de la page claude.ai (lien public).
2. **L’héberger avec le portfolio** : le simulateur est un site statique (`index.html`, `css/`, `js/`). Il suffit de copier le dossier dans le portfolio (par exemple `public/simulateur-support-it/`) pour qu’il soit servi à l’adresse `/simulateur-support-it/`. Ça marche aussi sur GitHub Pages, Netlify ou Vercel.

## Texte proposé pour la carte projet

**Titre** : Simulateur Support IT

**Sous-titre** : Un poste de technicien support reproduit dans le navigateur

**Description courte** : Environnement d’entraînement au support IT : 23 tickets réalistes à traiter avec un Service Desk, l’Active Directory, PowerShell, SSH Linux et la téléphonie IP, dans le contexte d’un laboratoire médical. Chaque ticket est noté sur 5 axes et la progression est suivie dans le temps.

**Tags** : Support IT · ITIL · Active Directory · PowerShell · Linux · Réseau · JavaScript

---

## Prompt à coller dans Claude Code (VS Code)

```
@PROJET-SIMULATEUR-SUPPORT-IT.md
Ajoute ce projet à la section « Projets » de mon portfolio.
- Regarde d’abord comment les autres projets sont faits (composant, données, styles) et suis exactement le même modèle.
- Utilise le titre, le sous-titre, la description courte et les tags de la section « Texte proposé pour la carte projet ».
- Image de la carte : captures/01-bureau-mode-tutoriel.png (copie-la dans le dossier d’images du portfolio). Si le projet a une page de détail, ajoute aussi les autres captures avec leurs légendes.
- Lien de démo : celui de la section « Liens et fichiers ». Si je copie le simulateur dans le dossier public du portfolio, utilise plutôt /simulateur-support-it/.
- Ne modifie rien d’autre dans le portfolio. Montre-moi les fichiers changés à la fin.
```
