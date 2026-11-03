/* DeskSim — données communes du laboratoire fictif Ostral Biologie */
window.DS = window.DS || {};

DS.company = {
  name: 'Ostral Biologie',
  kind: 'Laboratoire de biologie médicale multisite',
  domain: 'ostral-bio.fr',
  adDomain: 'OSTRAL',
  sites: ['Lyon Gerland – siège et plateau technique', 'Villeurbanne – site de prélèvement', 'Saint-Priest – site de prélèvement', 'Caluire – site de prélèvement'],
  helpdesk: 'Support IT – poste 4000'
};

DS.categories = [
  { id: 'acces', label: 'Comptes & accès' },
  { id: 'reseau', label: 'Réseau & serveurs' },
  { id: 'materiel', label: 'Matériel & périphériques' },
  { id: 'telephonie', label: 'Téléphonie' },
  { id: 'logiciel', label: 'Logiciels & applications' },
  { id: 'messagerie', label: 'Messagerie & collaboration' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'donnees', label: 'Fichiers & données' }
];

DS.types = [
  { id: 'incident', label: 'Incident', hint: 'Quelque chose qui marchait ne marche plus' },
  { id: 'demande', label: 'Demande de service', hint: 'Besoin nouveau : accès, installation, poste, compte…' }
];

DS.impacts = [
  { id: 'eleve', label: 'Élevé', hint: 'Plusieurs services, un site entier ou l’activité patients' },
  { id: 'moyen', label: 'Moyen', hint: 'Un service ou un groupe d’utilisateurs' },
  { id: 'faible', label: 'Faible', hint: 'Un seul utilisateur ou un seul appareil' }
];

DS.urgencies = [
  { id: 'haute', label: 'Haute', hint: 'Travail bloqué, pas de contournement' },
  { id: 'moyenne', label: 'Moyenne', hint: 'Travail dégradé, contournement possible' },
  { id: 'basse', label: 'Basse', hint: 'Gêne mineure ou besoin planifié' }
];

/* Matrice Impact x Urgence -> Priorité (1 = critique) */
DS.matrix = {
  eleve: { haute: 1, moyenne: 2, basse: 3 },
  moyen: { haute: 2, moyenne: 3, basse: 4 },
  faible: { haute: 3, moyenne: 4, basse: 4 }
};
DS.priority = function (impact, urgency) {
  if (!impact || !urgency) return null;
  return DS.matrix[impact][urgency];
};
DS.prioLabels = { 1: 'P1 – Critique', 2: 'P2 – Haute', 3: 'P3 – Moyenne', 4: 'P4 – Basse' };
/* Délais de résolution cibles, en minutes « simulées » */
DS.sla = { 1: 60, 2: 240, 3: 480, 4: 1440 };
DS.slaText = { 1: '1 h', 2: '4 h', 3: '8 h (1 jour ouvré)', 4: '24 h (3 jours ouvrés)' };
DS.TIME_SCALE = 10; /* 1 seconde réelle = 10 secondes simulées */

DS.teams = [
  { id: 'n2_sys', label: 'N2 – Systèmes & serveurs', hint: 'Serveurs Windows/Linux, AD avancé, sauvegardes' },
  { id: 'n2_net', label: 'N2 – Réseau & télécom', hint: 'Switchs, Wi-Fi, liens inter-sites, VPN, standard téléphonique' },
  { id: 'apps', label: 'Applications métier (SIL)', hint: 'Système d’information de laboratoire, connexions automates, CRM' },
  { id: 'secu', label: 'Cellule sécurité (RSSI)', hint: 'Phishing, compromission, fraude, données de santé' },
  { id: 'biomed', label: 'Biomédical / fournisseur automate', hint: 'Automates d’analyses et leurs PC pilotes' },
  { id: 'vendor', label: 'Prestataire externe', hint: 'Fabricant, opérateur, garantie constructeur' }
];

DS.groups = [
  { id: 'GG_Tous', desc: 'Tous les salariés – intranet, imprimantes générales' },
  { id: 'GG_Facturation', desc: 'Facturation – \\\\srv-fic-01\\Facturation (lecture/écriture)' },
  { id: 'GG_Facturation_Budget_RW', desc: 'Facturation – dossier Budget (sensible)' },
  { id: 'GG_Impression_Facturation', desc: 'Imprimante IMP-FAC-01 (siège, 2e étage)' },
  { id: 'GG_Plateau', desc: 'Plateau technique – \\\\srv-fic-02\\Plateau (lecteur S:)' },
  { id: 'GG_RH', desc: 'Ressources humaines – dossiers du personnel (confidentiel)' },
  { id: 'GG_Prescripteurs', desc: 'Relations prescripteurs – \\\\srv-fic-01\\Prescripteurs' },
  { id: 'GG_CRM_Users', desc: 'CRM prescripteurs (1 licence par utilisateur)' },
  { id: 'GG_VPN_Users', desc: 'Accès VPN nomade' },
  { id: 'GG_Direction', desc: 'Direction – dossiers du comité de direction' },
  { id: 'GG_Achats', desc: 'Achats – \\\\srv-fic-01\\Achats' },
  { id: 'GG_Qualite_Lecture', desc: 'Qualité – \\\\srv-fic-01\\Qualite (lecture seule)' },
  { id: 'GG_Qualite_Accreditation_RW', desc: 'Qualité – dossier Accreditation2027 (modification)' },
  { id: 'GG_Secretariat', desc: 'Secrétariats médicaux – \\\\srv-fic-01\\Secretariat' },
  { id: 'GG_Secretariat_Responsables', desc: 'Secrétariats – plannings et suivi RH (responsables uniquement)' },
  { id: 'GG_SIL_Accueil', desc: 'SIL – module accueil : enregistrement des dossiers patients' },
  { id: 'GG_SIL_Technicien', desc: 'SIL – saisie technique des résultats' },
  { id: 'GG_SIL_Biologiste', desc: 'SIL – validation biologique (biologistes uniquement)', sensitive: true },
  { id: 'GG_Admins_Postes', desc: 'Administrateurs locaux des postes (réservé à l’IT)', danger: true },
  { id: 'Admins du domaine', desc: 'Administrateurs du domaine (réservé au N2/N3)', danger: true }
];

DS.ous = ['Facturation', 'PlateauTechnique', 'RH', 'Prescripteurs', 'Secretariat', 'Direction', 'Biologie', 'Achats', 'Qualite'];

/* Annuaire des salariés */
DS.users = {
  camille: { name: 'Camille Roussel', dept: 'Facturation', ou: 'Facturation', title: 'Gestionnaire facturation', ext: '2214', empId: 'OS-10482', asset: 'PC-FAC-014', manager: 'nathalie', groups: ['GG_Tous', 'GG_Facturation', 'GG_Impression_Facturation'], office: 'Siège – 2e étage' },
  nathalie: { name: 'Nathalie Girard', dept: 'Facturation', ou: 'Facturation', title: 'Responsable facturation', ext: '2201', empId: 'OS-08817', asset: 'PC-FAC-001', manager: 'antoine', groups: ['GG_Tous', 'GG_Facturation', 'GG_Facturation_Budget_RW', 'GG_Impression_Facturation'], office: 'Siège – 2e étage' },
  mehdi: { name: 'Mehdi Benali', dept: 'Plateau technique', ou: 'PlateauTechnique', title: 'Technicien de laboratoire, référent automates', ext: '3105', empId: 'OS-11290', asset: 'PC-PLT-031', manager: 'gerard', groups: ['GG_Tous', 'GG_Plateau', 'GG_SIL_Technicien'], office: 'Plateau technique – bureau des référents' },
  lucas: { name: 'Lucas Moreau', dept: 'Plateau technique', ou: 'PlateauTechnique', title: 'Technicien de laboratoire', ext: '3150', empId: 'OS-12044', asset: 'PC-PAIL-03', manager: 'mehdi', groups: ['GG_Tous', 'GG_Plateau', 'GG_SIL_Technicien'], office: 'Plateau technique – paillasse 3' },
  sophie: { name: 'Sophie Marchand', dept: 'Ressources humaines', ou: 'RH', title: 'Chargée de recrutement', ext: '2408', empId: 'OS-10955', asset: 'LT-RH-007', manager: null, groups: ['GG_Tous', 'GG_RH'], office: 'Siège – 4e étage' },
  julien: { name: 'Julien Perrin', dept: 'Relations prescripteurs', ou: 'Prescripteurs', title: 'Délégué relations prescripteurs', ext: '2650', empId: 'OS-09731', asset: 'LT-PRE-022', manager: 'antoine', groups: ['GG_Tous', 'GG_Prescripteurs', 'GG_CRM_Users', 'GG_VPN_Users'], office: 'Nomade (cabinets médicaux, cliniques)' },
  marc: { name: 'Marc Delorme', dept: 'Secrétariat médical', ou: 'Secretariat', title: 'Responsable des secrétariats', ext: '2600', empId: 'OS-07120', asset: 'LT-SEC-001', manager: 'antoine', groups: ['GG_Tous', 'GG_Secretariat', 'GG_Secretariat_Responsables', 'GG_SIL_Accueil', 'GG_VPN_Users'], office: 'Siège – 3e étage' },
  ines: { name: 'Inès Garnier', dept: 'Secrétariat médical', ou: 'Secretariat', title: 'Secrétaire médicale', ext: '5612', empId: 'OS-11520', asset: 'PC-VIL-012', manager: 'marc', groups: ['GG_Tous', 'GG_Secretariat', 'GG_SIL_Accueil'], office: 'Site de Villeurbanne – accueil' },
  karim: { name: 'Karim Haddad', dept: 'Secrétariat médical', ou: 'Secretariat', title: 'Secrétaire médical', ext: '6930', empId: 'OS-12377', asset: 'PC-STP-017', manager: 'marc', groups: ['GG_Tous', 'GG_Secretariat', 'GG_SIL_Accueil'], office: 'Site de Saint-Priest – accueil, box 1' },
  aicha: { name: 'Aïcha Diallo', dept: 'Direction', ou: 'Direction', title: 'Assistante de direction', ext: '2002', empId: 'OS-09310', asset: 'PC-DIR-002', manager: 'antoine', groups: ['GG_Tous', 'GG_Direction'], office: 'Siège – 5e étage' },
  antoine: { name: 'Antoine Caron', dept: 'Direction', ou: 'Direction', title: 'Directeur administratif et financier', ext: '2001', empId: 'OS-05540', asset: 'LT-DIR-001', manager: null, vip: true, groups: ['GG_Tous', 'GG_Direction', 'GG_Facturation', 'GG_VPN_Users'], office: 'Siège – 5e étage' },
  gerard: { name: 'Gérard Blanc', dept: 'Biologie', ou: 'Biologie', title: 'Biologiste médical', ext: '3001', empId: 'OS-03318', asset: 'PC-BIO-001', manager: null, groups: ['GG_Tous', 'GG_Plateau', 'GG_SIL_Biologiste', 'GG_SIL_Technicien'], office: 'Plateau technique – bureau des biologistes' },
  pauline: { name: 'Pauline Henry', dept: 'Biologie', ou: 'Biologie', title: 'Biologiste médicale (arrivée le 9/11)', ext: '3004', empId: 'OS-12590', asset: 'LT-BIO-003', manager: 'gerard', groups: ['GG_Tous', 'GG_Plateau', 'GG_SIL_Biologiste', 'GG_SIL_Technicien', 'GG_VPN_Users'], office: 'Plateau technique – bureau des biologistes' },
  thomas: { name: 'Thomas Lefebvre', dept: 'Achats', ou: 'Achats', title: 'Acheteur (réactifs et travaux)', ext: '2722', empId: 'OS-11807', asset: 'PC-ACH-009', manager: null, groups: ['GG_Tous', 'GG_Achats'], office: 'Siège – 1er étage' },
  elodie: { name: 'Élodie Fabre', dept: 'Qualité', ou: 'Qualite', title: 'Technicienne qualité', ext: '2815', empId: 'OS-12210', asset: 'LT-QUA-004', manager: 'claire', groups: ['GG_Tous', 'GG_Qualite_Lecture'], office: 'Siège – 3e étage' },
  claire: { name: 'Claire Vasseur', dept: 'Qualité', ou: 'Qualite', title: 'Responsable qualité', ext: '2800', empId: 'OS-08402', asset: 'LT-QUA-001', manager: 'antoine', groups: ['GG_Tous', 'GG_Qualite_Lecture', 'GG_Qualite_Accreditation_RW'], office: 'Siège – 3e étage' }
};

/* Valeurs par défaut des comptes (surchargées par les scénarios) */
DS.userDefaults = {
  enabled: true, locked: false, badPwd: 0, pwdAgeDays: 21, pwdExpired: false,
  lastLogon: 'Aujourd’hui 08:47', mailboxUsed: 6.2, mailboxQuota: 50
};

DS.assets = {
  'PC-FAC-014': { kind: 'Poste fixe', model: 'Dell OptiPlex 7010', os: 'Windows 11 Pro 23H2', ip: '10.20.2.114', mac: '8C-47-BE-21-0A-6F', serial: 'D7K2PX3', warranty: 'Mars 2026 (expirée)', user: 'camille', site: 'Siège' },
  'PC-FAC-001': { kind: 'Poste fixe', model: 'Dell OptiPlex 7010', os: 'Windows 11 Pro 23H2', ip: '10.20.2.101', mac: '8C-47-BE-21-03-11', serial: 'D7K2PW9', warranty: 'Mars 2026 (expirée)', user: 'nathalie', site: 'Siège' },
  'PC-PLT-031': { kind: 'Poste fixe', model: 'HP EliteDesk 800 G6', os: 'Windows 11 Pro 23H2', ip: '10.20.4.57', mac: '3C-52-82-7A-19-C4', serial: 'CZC1234L7Q', warranty: 'Juin 2025 (expirée)', user: 'mehdi', site: 'Siège' },
  'PC-PAIL-03': { kind: 'PC de paillasse (partagé)', model: 'Lenovo ThinkCentre M70q Gen 4', os: 'Windows 11 Pro 23H2', ip: '10.20.4.203', mac: 'E0-BE-03-55-71-9A', serial: 'MJ0K8T2C', warranty: 'Octobre 2027 (sur site J+1)', user: 'lucas', site: 'Siège' },
  'LT-RH-007': { kind: 'Portable', model: 'Lenovo ThinkPad T14 Gen 3', os: 'Windows 11 Pro 23H2', ip: '10.20.3.47', mac: '54-14-F3-6B-0E-21', serial: 'PF3XK21A', warranty: 'Janvier 2027', user: 'sophie', site: 'Siège' },
  'LT-PRE-022': { kind: 'Portable', model: 'Dell Latitude 5440', os: 'Windows 11 Pro 23H2', ip: 'hors site', mac: 'A4-BB-6D-2C-90-17', serial: '9HQ3RV3', warranty: 'Septembre 2027', user: 'julien', site: 'Nomade' },
  'LT-SEC-001': { kind: 'Portable', model: 'Dell Latitude 7440', os: 'Windows 11 Pro 23H2', ip: '10.20.3.12', mac: 'A4-BB-6D-2C-11-02', serial: '9HQ3RT1', warranty: 'Septembre 2027', user: 'marc', site: 'Siège' },
  'PC-VIL-012': { kind: 'Poste fixe (accueil)', model: 'Dell OptiPlex 7010 Micro', os: 'Windows 11 Pro 23H2', ip: '10.30.1.88', mac: '8C-47-BE-21-44-0D', serial: 'D7K3AA2', warranty: 'Mars 2027', user: 'ines', site: 'Villeurbanne' },
  'PC-STP-017': { kind: 'Poste fixe (accueil)', model: 'HP EliteDesk 800 G6 Mini', os: 'Windows 11 Pro 23H2', ip: '10.40.1.17', mac: '3C-52-82-7A-55-E0', serial: 'CZC1239M2X', warranty: 'Juin 2025 (expirée)', user: 'karim', site: 'Saint-Priest' },
  'PC-DIR-002': { kind: 'Poste fixe', model: 'HP EliteDesk 800 G9', os: 'Windows 11 Pro 23H2', ip: '10.20.5.22', mac: '3C-52-82-90-AA-31', serial: 'CZC3345K0P', warranty: 'Février 2028', user: 'aicha', site: 'Siège' },
  'LT-DIR-001': { kind: 'Portable', model: 'Microsoft Surface Laptop 6', os: 'Windows 11 Pro 23H2', ip: '10.20.5.10', mac: '7C-1E-52-0F-33-84', serial: '0F3K7Y2', warranty: 'Février 2028', user: 'antoine', site: 'Siège' },
  'PC-BIO-001': { kind: 'Poste fixe', model: 'HP EliteDesk 800 G9', os: 'Windows 11 Pro 23H2', ip: '10.20.4.11', mac: '3C-52-82-90-10-07', serial: 'CZC3345J8T', warranty: 'Février 2028', user: 'gerard', site: 'Siège' },
  'LT-BIO-003': { kind: 'Portable (en stock, à préparer)', model: 'Dell Latitude 5450', os: 'Image usine (non préparé)', ip: '—', mac: 'A4-BB-6D-31-07-C2', serial: '4ZTP8W4', warranty: 'Novembre 2029', user: 'pauline', site: 'Stock IT' },
  'PC-ACH-009': { kind: 'Poste fixe', model: 'Dell OptiPlex 7010', os: 'Windows 11 Pro 23H2', ip: '10.20.2.209', mac: '8C-47-BE-21-7B-52', serial: 'D7K2Q01', warranty: 'Mars 2026 (expirée)', user: 'thomas', site: 'Siège' },
  'LT-QUA-004': { kind: 'Portable', model: 'Lenovo ThinkPad T14 Gen 3', os: 'Windows 11 Pro 23H2', ip: '10.20.3.141', mac: '54-14-F3-6B-71-AE', serial: 'PF3XK40D', warranty: 'Janvier 2027', user: 'elodie', site: 'Siège' },
  'LT-QUA-001': { kind: 'Portable', model: 'Lenovo ThinkPad X1 Carbon', os: 'Windows 11 Pro 23H2', ip: '10.20.3.140', mac: '54-14-F3-6B-71-01', serial: 'PF3XJ99Z', warranty: 'Janvier 2027', user: 'claire', site: 'Siège' },
  'PC-SUPPORT-01': { kind: 'Poste fixe', model: 'Dell OptiPlex 7010', os: 'Windows 11 Pro 23H2', ip: '10.20.6.15', mac: '8C-47-BE-21-99-01', serial: 'D7K2Z11', warranty: 'Mars 2026', user: 'tech', site: 'Siège' },
  /* Périphériques et équipements */
  'ZEB-STP-01': { kind: 'Imprimante d’étiquettes', model: 'Zebra ZD421t (transfert thermique)', os: '—', ip: 'USB sur PC-STP-017', mac: '—', serial: 'D4J21390877', warranty: 'Mai 2027', user: 'karim', site: 'Saint-Priest' },
  'TEL-VIL-012': { kind: 'Téléphone IP', model: 'Yealink T54W (PoE)', os: 'Firmware 96.86', ip: '10.31.1.112 (VLAN voix)', mac: '80-5E-C0-4A-12-9B', serial: '3015423011823', warranty: 'Janvier 2027', user: 'ines', site: 'Villeurbanne' },
  'IMP-FAC-01': { kind: 'Imprimante réseau', model: 'HP LaserJet Pro 4002dn', os: '—', ip: '10.20.2.250', mac: '—', serial: 'PHB9K1234', warranty: 'Avril 2026', user: 'nathalie', site: 'Siège' },
  'srv-intra-01': { kind: 'Serveur Linux (VM)', model: 'Debian 12 – nginx + PHP-FPM', os: 'Debian GNU/Linux 12 (bookworm)', ip: '10.20.1.40', mac: '00-50-56-9A-11-40', serial: 'VM', warranty: '—', user: null, site: 'Salle serveurs' }
};

/* Plan d'adressage et serveurs connus (utilisé par les terminaux) */
DS.hosts = {
  'srv-dc-01': '10.20.1.10', 'srv-dc-02': '10.20.1.11',
  'srv-fic-01': '10.20.1.21', 'srv-fic-02': '10.20.1.22',
  'srv-print-01': '10.20.1.30', 'srv-intra-01': '10.20.1.40', 'intranet.ostral-bio.fr': '10.20.1.40', 'intranet': '10.20.1.40',
  'srv-sil-01': '10.20.1.50', 'sil.ostral.local': '10.20.1.50', 'crm.ostral-bio.fr': '10.20.1.45',
  'vpn.ostral-bio.fr': '185.42.117.20', 'mail.ostral-bio.fr': '52.97.146.10', 'resultats.ostral-bio.fr': '185.42.117.31',
  'google.fr': '142.250.179.99', 'www.google.fr': '142.250.179.99', 'google.com': '142.250.201.14',
  'microsoft.com': '20.70.246.20', 'outlook.office365.com': '52.97.146.10', 'deb.debian.org': '151.101.130.132',
  '8.8.8.8': '8.8.8.8', '1.1.1.1': '1.1.1.1'
};

DS.levels = [
  { xp: 0, name: 'Stagiaire support' },
  { xp: 300, name: 'Technicien support junior' },
  { xp: 900, name: 'Technicien support' },
  { xp: 1800, name: 'Technicien support confirmé' },
  { xp: 3000, name: 'Référent support' },
  { xp: 4500, name: 'Prêt pour le N2' }
];

DS.policies = {
  password: '12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial. Expiration tous les 90 jours. Verrouillage 30 min après 5 essais ratés.',
  identity: 'Avant toute action sur un compte : demander le matricule (OS-xxxxx) et le comparer à l’annuaire. Pour un mot de passe ou une clé BitLocker : rappeler sur le numéro de l’annuaire, jamais sur un numéro donné par l’appelant.',
  remote: 'Toujours demander l’accord de l’utilisateur avant une prise en main à distance.',
  software: 'Pas de droits administrateur pour les utilisateurs. Installation via le Centre logiciel (catalogue approuvé).',
  rights: 'Un ajout à un groupe de partage exige l’accord du responsable du dossier ou du manager, tracé dans le ticket.',
  vip: 'Comité de direction : priorité relevée d’un niveau.',
  login: 'Identifiant au format prenom.nom, en minuscules et sans accents.',
  health: 'Données de santé : secret médical et RGPD. Jamais de données patient dans un ticket, un mail personnel ou une clé USB non chiffrée.',
  naming: 'Nom des postes : type-service-numéro (PC = fixe, LT = portable ; ex. LT-BIO-003).'
};
