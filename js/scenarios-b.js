/* DeskSim — scénarios (partie B) */
(function () {
  const S = DS.addScenario;

  /* 13 ─ Serveur de fichiers en panne (incident majeur) */
  S({
    id: 'server', diff: 3, req: 'mehdi', channel: 'Téléphone',
    title: 'URGENT – Lecteur S: inaccessible pour tout le plateau technique',
    desc: 'URGENT – Plus personne au plateau technique n’arrive à ouvrir le lecteur S: (fiches de paillasse, listes de travail exportées). Les techniciens travaillent à l’aveugle, les tubes s’accumulent et les sites de prélèvement appellent parce que les résultats prennent du retard. Ça a coupé d’un coup vers 9 h 40. – Mehdi',
    type: 'incident', cat: ['reseau', 'donnees'], impact: 'eleve', urgency: 'haute',
    machine: () => ({ down: ['srv-fic-02', '10.20.1.22'], drives: [{ st: 'Indisponible', l: 'S:', path: '\\\\srv-fic-02\\Plateau' }, { st: 'OK', l: 'P:', path: '\\\\srv-fic-01\\Commun' }] }),
    cmd: (line) => /(^|\s)(s:|\\\\srv-fic-02)/i.test(line) && /^(dir|ls|cd|get-childitem|gci|start|explorer)\b/i.test(line.trim()) ? 'Le chemin réseau n’a pas été trouvé.' : null,
    monitor: () => ({ 'srv-fic-02': { st: 'down', msg: 'Hôte injoignable depuis 09:41 (ping KO, SMB KO)' } }),
    qs: [
      { id: 'scope', cat: 'Comprendre', q: 'Combien de personnes sont touchées, et dans quels services ?', a: 'Tout le plateau technique, une vingtaine de personnes, plus les biologistes. Les sites de prélèvement ne voient plus les fiches non plus.', tag: 'key', sets: ['scope'] },
      { id: 'time', cat: 'Comprendre', q: 'À quelle heure exactement est-ce que ça a commencé ?', a: 'Vers 9 h 40, d’un coup, pour tout le monde en même temps.', tag: 'good', sets: ['time'] },
      { id: 'other', cat: 'Diagnostic', q: 'Arrivez-vous à accéder à autre chose : internet, la messagerie, le SIL, le dossier Commun (P:) ?', a: 'Oui : internet, les mails et le SIL marchent. Le P: aussi. C’est juste le S:.', tag: 'key', sets: ['other_ok'] },
      { id: 'work', cat: 'Contournement', q: 'En attendant, pouvez-vous reprendre les listes de travail directement depuis le SIL ?', a: 'Oui, on peut les éditer depuis le SIL, c’est plus long mais ça dépanne.', tag: 'good', sets: ['workaround'] },
      { id: 'inform', cat: 'Procédure', q: 'Je transmets en priorité à l’équipe serveurs. Pouvez-vous prévenir l’équipe qu’on est dessus ? Je vous rappelle dès que j’ai du nouveau.', a: 'D’accord, je leur dis. Merci de faire vite.', tag: 'good', sets: ['informed'] },
      { id: 'blame', cat: 'Diagnostic', q: 'Vous êtes sûr que ce ne sont pas vos PC qui sont mal configurés ?', a: 'Vingt PC qui se dérèglent à la même minute ? Non…', tag: 'bad' },
      { id: 'g_reboot', a: 'Deux techniciens ont redémarré leur PC, ça n’a rien changé.', tag: 'neutral' }
    ],
    acts: [
      { id: 'explorer', g: 'Explorateur', l: 'Explorateur : ouvrir S:\\', r: 'Erreur : « \\\\srv-fic-02\\Plateau n’est pas accessible. Le chemin réseau n’a pas été trouvé. »', sets: ['explorer_err'], tag: 'good' },
      { id: 'remap', g: 'Explorateur', l: 'Déconnecter puis reconnecter le lecteur S:', r: 'Reconnexion impossible : « Le chemin réseau n’a pas été trouvé. »', sets: ['remap'], tag: 'neutral' }
    ],
    fixed: () => false,
    yes: '', no: 'Non, toujours rien sur le S:.',
    checks: [
      ['diag', 6, 'Mesurer le périmètre (tout un service et les sites)', f => f('scope')],
      ['diag', 4, 'Vérifier que le reste fonctionne (réseau OK, seul S: touché)', f => f('other_ok')],
      ['diag', 6, 'Tester le serveur srv-fic-02 (ping / Test-NetConnection)', f => f('ping:srv-fic-02') || f('ping:10.20.1.22')],
      ['diag', 4, 'Comparer avec un autre serveur ou le DNS (isoler)', f => f('ping:srv-fic-01') || f('nslookup:srv-fic-02')],
      ['diag', 5, 'Consulter la supervision', f => f('monitor:view')],
      ['res', 8, 'Note d’escalade complète : périmètre, heure, tests', (f, c) => ['ping', 'srv-fic-02', '9h40|09:4|9 h 40', 'plateau'].filter(k => new RegExp(k).test(c.noteN)).length >= 3],
      ['res', 6, 'Informer l’utilisateur et organiser l’attente', f => f('informed')],
      ['res', 6, 'Proposer un contournement (listes depuis le SIL)', f => f('workaround')]
    ],
    pen: [[-3, 'Redémarrer un poste ne sert à rien pour une panne serveur', f => f('reboot')]],
    causes: [
      'Serveur de fichiers srv-fic-02 injoignable : incident majeur qui touche tout le plateau technique',
      'Lecteurs réseau mal configurés sur les postes',
      'Panne d’internet générale',
      'Comptes des techniciens verrouillés'
    ],
    out: { mode: 'escalate', team: 'n2_sys' },
    closing: [
      'Bonjour Mehdi, le serveur qui héberge le lecteur S: ne répond plus depuis 9 h 41. L’incident est transmis en priorité 1 à l’équipe Systèmes, qui intervient. En attendant, éditez les listes de travail depuis le SIL. Je vous tiens au courant dès qu’il y a du nouveau.',
      'Transmis au N2.',
      'C’est un problème serveur, ce n’est pas de notre ressort. Attendez.'
    ],
    kw: ['srv-fic-02', 'ping', '09:41', '9h40', 'plateau', 'supervision', 'p1', 'perimetre'],
    hints: ['Plusieurs personnes à la même minute : pense « serveur » avant « poste ». Mesure le périmètre.', 'Prends la main sur le PC de Mehdi : ping srv-fic-02, puis ping srv-fic-01 pour comparer. Regarde aussi la supervision.', 'Le N1 ne répare pas un serveur : escalade à l’équipe Systèmes avec une note qui contient le périmètre, l’heure et tes tests.'],
    ideal: ['Qualifier : incident, impact élevé (plateau technique bloqué), urgence haute → P1', 'Mesurer le périmètre et l’heure de début', 'Vérifier que le reste fonctionne', 'Tester le serveur (ping KO) et comparer (srv-fic-01 OK)', 'Confirmer avec la supervision', 'Escalader immédiatement au N2 Systèmes avec une note complète', 'Informer, proposer un contournement'],
    lesson: '<p>Quand plusieurs personnes perdent la même chose <strong>à la même minute</strong>, la cause est commune : un serveur, un lien réseau, une application. Le rôle du N1 est de <strong>confirmer vite</strong>, de ne pas perdre de temps poste par poste, puis d’escalader avec des faits.</p><p>Une bonne note d’escalade évite au N2 de refaire tes tests : périmètre, heure de début, ce qui marche, ce qui ne marche pas, résultats des tests.</p>',
    kb: ['escalade', 'reseau', 'priorite']
  });

  /* 14 ─ Écran de récupération BitLocker */
  const blRight = '4F2A91C3';
  S({
    id: 'bitlocker', diff: 2, req: 'julien', channel: 'Téléphone',
    title: 'Mon portable demande une clé de récupération BitLocker',
    desc: 'Bonjour, ce matin mon portable affiche un écran bleu « Récupération BitLocker – Entrez la clé de récupération pour ce lecteur ». Il y a un « ID de clé » affiché. Hier soir il a fait une mise à jour du BIOS. Je suis au siège aujourd’hui, 3e étage. – Julien',
    type: 'incident', cat: ['securite', 'materiel'], impact: 'faible', urgency: 'haute',
    remote: 'LT-PRE-022 est bloqué avant le démarrage de Windows (écran BitLocker) : aucune prise en main possible.',
    ad: { computers: { 'LT-PRE-022': { bitlocker: [{ id: '1C7E44B0-93A2-4F1D-8C55-0E6B21A9D3F7', date: '14/03/2025 10:12', key: '402886-197593-051370-638913-115082-472681-260854-099297' }, { id: '4F2A91C3-5D80-4B6E-A217-9C3E5F0B7D12', date: '02/09/2026 15:47', key: '617496-330880-207812-551606-094831-712140-386837-145255' }] } } },
    qs: [
      { id: 'keyid', cat: 'Diagnostic', q: 'Pouvez-vous me lire l’ID de clé affiché à l’écran ? Les 8 premiers caractères suffisent.', a: '« ID de clé : 4F2A91C3 », et après ça continue.', tag: 'key', sets: ['keyid'] },
      { id: 'g_change', a: 'Hier soir, le PC a fait une mise à jour du BIOS et il a redémarré tout seul.', tag: 'good', sets: ['bios'] },
      { id: 'dictate', cat: 'Action', q: 'Je vais vous dicter la clé de récupération, par blocs de 6 chiffres. Vous êtes prêt ?', a: f => !f.re(/^bl:last:/) ? 'Oui, je suis prêt… vous l’avez trouvée ?' : (f('bl:last:' + blRight) ? 'J’ai tout tapé… ça démarre ! Windows se lance normalement.' : 'J’ai tout tapé… « Clé de récupération incorrecte ».'), tag: 'key', sets: f => f('bl:last:' + blRight) ? ['bl_ok'] : (f.re(/^bl:last:/) ? ['wrongkey'] : []) },
      { id: 'mailkey', cat: 'Action', q: 'Je vous envoie la clé par e-mail, ce sera plus simple.', a: 'Euh… mais je n’ai pas accès à mes mails, mon PC est bloqué !', tag: 'bad' },
      { id: 'g_consent', hide: true }, { id: 'g_reboot', a: 'Oui, ça revient au même écran.', tag: 'neutral' }
    ],
    fixed: f => f('bl_ok'),
    yes: 'Tout marche, Windows a démarré et je suis connecté. Merci !',
    no: 'Non, toujours l’écran BitLocker.',
    checks: [
      ['diag', 8, 'Faire lire l’ID de clé affiché', f => f('keyid')],
      ['diag', 4, 'Identifier l’événement déclencheur (mise à jour du BIOS)', f => f('bios')],
      ['diag', 5, 'Consulter l’objet ordinateur dans l’AD (onglet BitLocker)', f => f('ad:comp:LT-PRE-022')],
      ['res', 8, 'Vérifier l’identité avant de donner la clé', f => f('identity')],
      ['res', 4, 'Rappeler sur le numéro de l’annuaire', f => f('callback')],
      ['res', 8, 'Choisir la clé dont l’ID correspond', f => f('bl:reveal:' + blRight)],
      ['res', 6, 'Dicter la clé et faire démarrer le poste', f => f('bl_ok')]
    ],
    pen: [
      [-3, 'Clé consultée sans vérifier l’ID (mauvaise clé)', f => f('bl:reveal:1C7E44B0') && !f('keyid')],
      [-2, 'Mauvaise clé dictée à l’utilisateur', f => f('wrongkey')]
    ],
    causes: [
      'Mise à jour du BIOS : BitLocker a détecté un changement et demande la clé de récupération (comportement normal)',
      'Disque dur en panne',
      'Rançongiciel qui a chiffré le disque',
      'Mot de passe Windows expiré'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Julien, la mise à jour du BIOS d’hier a déclenché la protection BitLocker : c’est normal. Après vérification de votre identité, je vous ai dicté la clé correspondant à l’ID affiché et votre PC démarre normalement. Si l’écran réapparaît, rappelez le 4000.',
      'Clé donnée, ça démarre.',
      'Voici la clé : 617496-330880-207812-551606-094831-712140-386837-145255. Notez-la sur un post-it.'
    ],
    kw: ['bitlocker', 'cle', 'bios', 'id', '4f2a91c3', 'identite'],
    hints: ['Une clé de récupération donne accès à tout le disque : vérification d’identité renforcée (matricule + rappel sur le numéro de l’annuaire).', 'Fais lire l’ID de clé, puis cherche l’ordinateur LT-PRE-022 dans l’AD, onglet « Récupération BitLocker ». Il y a deux clés : prends celle dont l’ID correspond.'],
    ideal: ['Qualifier : incident, Sécurité, impact faible, urgence haute → P3', 'Comprendre le déclencheur (mise à jour du BIOS)', 'Vérifier l’identité : matricule + rappel sur le numéro de l’annuaire', 'Faire lire l’ID de clé, trouver la clé correspondante dans l’AD', 'Dicter la clé à l’oral, faire démarrer', 'Documenter'],
    lesson: '<p>BitLocker chiffre le disque. Quand le matériel ou le BIOS change, il demande la <strong>clé de récupération</strong> par précaution. Cette clé ouvre tout le contenu du disque : elle ne se donne qu’après une vérification d’identité solide, à l’oral.</p><p>Un même poste peut avoir plusieurs clés dans l’AD : c’est l’<strong>ID de clé</strong> affiché à l’écran qui dit laquelle utiliser.</p>',
    kb: ['bitlocker', 'identite']
  });

  /* 15 ─ Disque plein */
  const freeGb = f => 0.4 + (f('cleanmgr') ? 6.8 : 0) + (f('videos_deleted') ? 44.1 : 0) + (f('onedrive') ? 3.2 : 0) + (f('dl_all_deleted') ? 47.2 : 0);
  S({
    id: 'disk', diff: 1, req: 'camille', channel: 'Portail',
    title: 'Espace disque insuffisant, je ne peux plus enregistrer',
    desc: 'Bonjour, Excel me dit « Espace disque insuffisant » quand j’enregistre, et Windows affiche « Vous manquez d’espace sur le disque C: ». Je ne peux plus rien enregistrer. – Camille',
    type: 'incident', cat: ['materiel', 'donnees'], impact: 'faible', urgency: 'haute',
    machine: f => ({ disk: { size: 237.3, free: Math.min(237.3, freeGb(f)) } }),
    qs: [
      { id: 'dl', cat: 'Diagnostic', q: 'Avez-vous beaucoup de fichiers dans vos Téléchargements ou sur le Bureau ?', a: 'Peut-être… je télécharge les vidéos de formation du nouveau logiciel de facturation pour les revoir.', tag: 'good', sets: ['dl_info'] },
      { id: 'okvid', cat: 'Procédure', q: 'Puis-je supprimer les vidéos de formation si elles sont toujours disponibles en ligne ?', a: 'Oui, elles sont sur le site de l’éditeur, vous pouvez les supprimer. Ne touchez pas au dossier « Factures_scan » par contre, ce sont des scans que je n’ai pas encore classés !', tag: 'key', sets: ['ok_videos'] },
      { id: 'g_since', a: 'Depuis ce matin.', tag: 'neutral' }
    ],
    acts: [
      { id: 'storage', g: 'Paramètres', l: 'Paramètres > Stockage : analyser l’espace utilisé', r: f => 'Disque C: ' + (237.3 - freeGb(f)).toFixed(1).replace('.', ',') + ' Go utilisés sur 237,3 Go\n  Téléchargements : ' + (f('videos_deleted') || f('dl_all_deleted') ? '3,1' : '47,2') + ' Go\n  Applications : 38,0 Go\n  Fichiers temporaires : ' + (f('cleanmgr') ? '0,2' : '6,8') + ' Go\n  Documents : 12,4 Go\n  Système et réservé : 31,0 Go', sets: ['storage'], tag: 'key' },
      { id: 'downloads', g: 'Explorateur', l: 'Ouvrir le dossier Téléchargements (trié par taille)', r: f => f('dl_all_deleted') ? 'Dossier vide.' : (f('videos_deleted') ? 'Factures_scan (dossier) : 2,3 Go\ndivers : 0,8 Go' : 'Formation_Facturation_module01.mp4 à module14.mp4 : 44,1 Go\nFactures_scan (dossier) : 2,3 Go\ndivers : 0,8 Go'), sets: ['dl_view'], tag: 'key' },
      { id: 'cleanmgr', g: 'Système', l: 'Nettoyage de disque : fichiers temporaires et cache des mises à jour', r: '6,8 Go libérés.', sets: ['cleanmgr'], tag: 'good' },
      { id: 'delvid', g: 'Explorateur', l: 'Supprimer les vidéos Formation_Facturation_*.mp4 (44 Go)', r: '44,1 Go libérés.', sets: ['videos_deleted'], tag: 'key', also: f => f('ok_videos') ? [] : ['vid_noconsent'] },
      { id: 'delall', g: 'Explorateur', l: 'Vider entièrement le dossier Téléchargements', r: '47,2 Go libérés. Le dossier Factures_scan a été supprimé avec le reste.', sets: ['dl_all_deleted'], tag: 'bad' },
      { id: 'winsxs', g: 'Système', l: 'Supprimer le contenu de C:\\Windows\\WinSxS pour gagner de la place', r: 'Suppression impossible pour une partie des fichiers… Au redémarrage suivant, Windows ne démarre plus.', sets: ['broke_windows'], tag: 'bad' },
      { id: 'onedrive', g: 'Paramètres', l: 'OneDrive : activer « Fichiers à la demande »', r: '3,2 Go de fichiers déjà synchronisés libérés sur le disque, toujours accessibles en ligne.', sets: ['onedrive'], tag: 'good' }
    ],
    fixed: f => freeGb(f) >= 5 && !f('broke_windows'),
    yes: 'Oui, j’ai pu enregistrer mon fichier, merci !',
    no: 'Non, Excel dit toujours « Espace disque insuffisant ».',
    checks: [
      ['diag', 7, 'Mesurer l’occupation du disque', f => f('storage') || f('cmd:disk')],
      ['diag', 6, 'Trouver ce qui prend la place (Téléchargements)', f => f('dl_view')],
      ['diag', 4, 'Comprendre l’usage (vidéos de formation)', f => f('dl_info')],
      ['res', 6, 'Nettoyer les fichiers temporaires', f => f('cleanmgr')],
      ['res', 10, 'Supprimer les vidéos avec l’accord de l’utilisatrice', f => f('videos_deleted') && f('ok_videos') && f.seq('ok_videos') < f.seq('videos_deleted')],
      ['res', 4, 'Éviter la récidive (OneDrive à la demande)', f => f('onedrive')]
    ],
    pen: [
      [-5, 'Suppression de fichiers personnels sans accord', f => f('vid_noconsent')],
      [-8, 'Perte de données : le dossier Factures_scan a été supprimé', f => f('dl_all_deleted')],
      [-10, 'Suppression de fichiers système : Windows ne démarre plus', f => f('broke_windows'), true]
    ],
    causes: [
      'Disque C: saturé (0,4 Go libres) par 44 Go de vidéos téléchargées et des fichiers temporaires',
      'Disque dur défectueux',
      'Virus qui remplit le disque',
      'Quota OneDrive dépassé'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Camille, votre disque était plein à 99,8 %. J’ai nettoyé les fichiers temporaires de Windows et, avec votre accord, supprimé les vidéos de formation (disponibles en ligne) : vous avez de nouveau plus de 50 Go libres. Votre dossier Factures_scan n’a pas été touché. Bonne journée !',
      'Disque nettoyé.',
      'J’ai vidé vos Téléchargements, ça devrait aller.'
    ],
    kw: ['disque', 'telechargement', 'video', 'nettoyage', 'go', 'onedrive', 'factures_scan'],
    hints: ['Mesure d’abord : Paramètres > Stockage, ou Get-PSDrive C dans PowerShell distant.', 'Regarde ce qui prend la place, puis demande l’accord avant de supprimer quoi que ce soit de personnel.'],
    ideal: ['Qualifier : incident, Matériel, impact faible, urgence haute → P3', 'Mesurer (0,4 Go libres) et trouver la cause (44 Go de vidéos)', 'Nettoyage de disque (fichiers temporaires)', 'Supprimer les vidéos avec accord, sans toucher aux scans', 'OneDrive à la demande', 'Faire tester, documenter'],
    lesson: '<p>Avant de supprimer, on <strong>mesure</strong> et on <strong>demande</strong>. Les fichiers d’un utilisateur lui appartiennent : un dossier qui ressemble à du désordre peut contenir des documents uniques.</p><p>On ne touche jamais aux dossiers système (Windows, WinSxS, System32) pour gagner de la place : le nettoyage de disque est fait pour ça.</p>',
    kb: ['stockage']
  });

  /* 16 ─ Restaurer un fichier supprimé */
  S({
    id: 'restore', diff: 2, req: 'nathalie', channel: 'Portail',
    title: 'Fichier Budget_2027.xlsx supprimé par erreur',
    desc: 'Bonjour, hier soir j’ai supprimé par erreur le fichier Budget_2027.xlsx dans \\\\srv-fic-01\\Facturation\\Budget en voulant supprimer une ancienne copie. Il n’est pas dans ma corbeille. J’y avais travaillé tout l’après-midi ! C’est pour le comité de direction de mardi. – Nathalie',
    type: ['demande', 'incident'], cat: ['donnees'], impact: 'faible', urgency: 'moyenne',
    qs: [
      { id: 'when', cat: 'Comprendre', q: 'À quelle heure environ avez-vous supprimé le fichier, et quand l’aviez-vous enregistré pour la dernière fois ?', a: 'Je l’ai enregistré vers 17 h 50 et supprimé vers 18 h 30, en partant.', tag: 'key', sets: ['times'] },
      { id: 'path', cat: 'Comprendre', q: 'Pouvez-vous me confirmer le chemin exact et le nom du fichier ?', a: '\\\\srv-fic-01\\Facturation\\Budget\\Budget_2027.xlsx', tag: 'good', sets: ['path'] },
      { id: 'recycle', cat: 'Diagnostic', q: 'Avez-vous regardé dans la corbeille ?', a: 'Oui, il n’y est pas.', tag: 'neutral' },
      { id: 'noow', cat: 'Procédure', q: 'Je vais restaurer le fichier à son emplacement. Avez-vous recréé un fichier du même nom depuis ?', a: 'Non, rien recréé.', tag: 'good', sets: ['no_overwrite'] }
    ],
    acts: [
      { id: 'prev', g: 'Explorateur', l: 'Dossier Budget > Propriétés > Versions précédentes', r: 'Aujourd’hui 07:00 – Budget_2027.xlsx absent\nHier 18:00 – Budget_2027.xlsx (modifié hier 17:52)\nHier 12:00 – Budget_2027.xlsx (modifié hier 11:40)\nAvant-hier 18:00 – Budget_2027.xlsx (modifié avant-hier 16:05)', sets: ['prev_view'], tag: 'key' },
      { id: 'r18', g: 'Versions précédentes', l: 'Restaurer Budget_2027.xlsx depuis « Hier 18:00 »', r: 'Fichier restauré : Budget_2027.xlsx (modifié hier 17:52).', sets: ['restored_best'], tag: 'key' },
      { id: 'r12', g: 'Versions précédentes', l: 'Restaurer Budget_2027.xlsx depuis « Hier 12:00 »', r: 'Fichier restauré : Budget_2027.xlsx (modifié hier 11:40).', sets: ['restored_old'], tag: 'bad' },
      { id: 'r07', g: 'Versions précédentes', l: 'Restaurer depuis « Aujourd’hui 07:00 »', r: 'Le fichier n’existe pas dans cette version.', sets: ['restored_none'], tag: 'neutral' }
    ],
    fixed: f => f('restored_best'),
    yes: 'Il est revenu avec toutes mes modifications d’hier après-midi. Merci, vous me sauvez !',
    no: f => f('restored_old') ? 'Le fichier est revenu, mais il manque tout ce que j’ai fait hier après-midi…' : 'Non, je ne le vois toujours pas.',
    checks: [
      ['diag', 8, 'Connaître l’heure de la dernière sauvegarde et de la suppression', f => f('times')],
      ['diag', 4, 'Confirmer le chemin exact', f => f('path')],
      ['diag', 8, 'Consulter les versions précédentes du dossier', f => f('prev_view')],
      ['res', 16, 'Restaurer depuis le dernier instantané qui contient le fichier (hier 18:00)', f => f('restored_best')],
      ['res', 4, 'Vérifier qu’on n’écrase pas un fichier recréé', f => f('no_overwrite')]
    ],
    pen: [[-3, 'Restauration d’une version trop ancienne (travail de l’après-midi perdu)', f => f('restored_old') && !f('restored_best')]],
    causes: [
      'Fichier supprimé sur un partage réseau (pas de corbeille) : restaurable depuis l’instantané d’hier 18:00',
      'Fichier corrompu',
      'Serveur de fichiers en panne',
      'Fichier déplacé par un collègue'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Nathalie, j’ai restauré Budget_2027.xlsx à son emplacement d’origine à partir de la sauvegarde d’hier 18 h : il contient bien vos modifications de 17 h 52. Pouvez-vous vérifier vos dernières lignes ? Bonne préparation pour mardi !',
      'Fichier restauré.',
      'Fichier restauré. Faites attention à ce que vous supprimez.'
    ],
    kw: ['version', 'precedente', '18:00', '18h', 'restaur', 'instantane', 'budget_2027'],
    hints: ['Sur un partage réseau, il n’y a pas de corbeille. Demande les heures : dernier enregistrement et suppression.', 'Prends la main : Propriétés du dossier Budget > Versions précédentes. Choisis le dernier instantané qui contient encore le fichier.'],
    ideal: ['Qualifier : demande de restauration, Fichiers & données, P4', 'Heures : enregistré 17 h 50, supprimé 18 h 30', 'Versions précédentes du dossier', 'Restaurer depuis hier 18:00', 'Faire vérifier le contenu'],
    lesson: '<p>Un fichier supprimé sur un <strong>partage réseau</strong> ne va pas dans la corbeille de l’utilisateur. Le serveur prend des <strong>instantanés</strong> plusieurs fois par jour : on restaure depuis le dernier qui contient encore le fichier, pour perdre le moins de travail possible.</p>',
    kb: ['stockage']
  });

  /* 17 ─ PC de paillasse : intervention matérielle */
  S({
    id: 'bench', diff: 2, req: 'lucas', channel: 'Téléphone',
    title: 'Le PC de la paillasse 3 ne démarre plus (3 bips)',
    desc: 'Bonjour, le PC de la paillasse 3 ne démarre plus. Quand j’appuie sur le bouton, le voyant clignote orange, il fait 3 bips et l’écran reste noir. On ne peut plus saisir les résultats techniques sur cette paillasse. – Lucas',
    type: 'incident', cat: ['materiel'], impact: 'moyen', urgency: 'moyenne',
    remote: 'PC-PAIL-03 ne répond pas : le poste ne démarre pas.',
    qs: [
      { id: 'power', cat: 'Diagnostic', q: 'Le câble d’alimentation est-il bien branché ? Avez-vous essayé une autre prise ?', a: 'Oui, j’ai même testé sur la prise de la paillasse 4, c’est pareil.', tag: 'good', sets: ['power_tested'] },
      { id: 'beeps', cat: 'Diagnostic', q: 'Combien de bips exactement, longs ou courts ? Et le voyant ?', a: '3 bips longs, et le voyant orange clignote. Toujours pareil.', tag: 'key', sets: ['beeps'] },
      { id: 'event', cat: 'Comprendre', q: 'S’est-il passé quelque chose : choc, liquide renversé, coupure de courant ?', a: 'Un chariot a cogné le meuble de la paillasse hier soir, d’après l’équipe de nuit.', tag: 'key', sets: ['shock'] },
      { id: 'other', cat: 'Contournement', q: 'En attendant, pouvez-vous saisir sur le PC de la paillasse 4 ?', a: 'Oui, il est libre, je m’y mets.', tag: 'good', sets: ['workaround'] },
      { id: 'g_reboot', a: 'Il ne s’allume même pas…', tag: 'neutral' }, { id: 'g_consent', hide: true }
    ],
    site: [
      { id: 'look', g: 'Constat', l: 'Observer le poste au démarrage', r: 'Voyant d’alimentation orange clignotant, 3 bips longs, aucun affichage. Le meuble porte une trace de choc.', sets: ['site_look', 'beeps'], tag: 'key' },
      { id: 'doc', g: 'Constat', l: 'Consulter la documentation constructeur des codes bips', r: 'Lenovo ThinkCentre : 3 bips longs = erreur de mémoire (barrette absente, mal insérée ou défectueuse).', sets: ['beep_doc'], tag: 'key' },
      { id: 'open', g: 'Intervention', l: 'Éteindre, débrancher, mettre le bracelet antistatique et ouvrir le boîtier', r: 'Boîtier ouvert en sécurité. La barrette mémoire est sortie à moitié de son logement.', sets: ['opened_safe'], tag: 'key' },
      { id: 'openlive', g: 'Intervention', l: 'Ouvrir le boîtier sans débrancher, pour aller plus vite', r: 'Tu ouvres le boîtier sous tension… une étincelle au niveau de l’alimentation. Rien de cassé cette fois, mais c’est dangereux pour toi et pour le matériel.', sets: ['opened_live'], tag: 'bad' },
      { id: 'reseat', g: 'Intervention', l: 'Réinsérer la barrette mémoire jusqu’au clic', r: f => f('opened_safe') || f('opened_live') ? 'Barrette réinsérée, les deux clips sont fermés.' : 'Il faut d’abord ouvrir le boîtier.', sets: f => f('opened_safe') || f('opened_live') ? ['ram_reseated'] : [], tag: 'key' },
      { id: 'boot', g: 'Test', l: 'Refermer, rebrancher et démarrer le PC', r: f => f('ram_reseated') ? 'Le PC démarre, ouverture de session OK, le SIL se lance.' : '3 bips longs, voyant orange : toujours pareil.', sets: f => f('ram_reseated') ? ['boot_ok'] : [], tag: 'good' },
      { id: 'loan', g: 'Intervention', l: 'Remplacer par le PC de prêt PRET-07 (stock IT)', r: 'PC de prêt installé et testé : session OK, SIL OK. Le PC en panne part au stock pour diagnostic.', sets: ['loan'], tag: 'good' },
      { id: 'cmdb', g: 'Suivi', l: 'Consigner l’intervention dans la fiche du matériel (inventaire)', r: 'Intervention ajoutée à la fiche PC-PAIL-03 : barrette mémoire réinsérée après choc, poste testé.', sets: ['cmdb'], tag: 'good' }
    ],
    fixed: f => f('boot_ok') || f('loan'),
    yes: 'Le PC de la paillasse 3 remarche, je reprends mes saisies. Merci !',
    no: 'Non, il fait toujours ses 3 bips.',
    checks: [
      ['diag', 4, 'Vérifier l’alimentation', f => f('power_tested')],
      ['diag', 6, 'Relever le code bips et le voyant', f => f('beeps')],
      ['diag', 4, 'Identifier l’événement (choc)', f => f('shock')],
      ['diag', 6, 'Interpréter le code avec la documentation constructeur', f => f('beep_doc')],
      ['res', 6, 'Proposer un contournement immédiat (autre paillasse)', f => f('workaround')],
      ['res', 6, 'Intervenir en sécurité (hors tension, antistatique)', f => f('opened_safe')],
      ['res', 8, 'Remettre le poste en service (barrette réinsérée ou prêt)', f => f('boot_ok') || f('loan')],
      ['res', 3, 'Tracer l’intervention dans l’inventaire', f => f('cmdb') || f('inv:PC-PAIL-03')]
    ],
    pen: [[-6, 'Intervention sous tension : risque électrique', f => f('opened_live')]],
    causes: [
      'Barrette mémoire à moitié sortie après un choc sur le meuble (3 bips longs = erreur mémoire)',
      'Session Windows corrompue',
      'Coupure du réseau de la paillasse',
      'Mise à jour Windows bloquée'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Lucas, le choc d’hier avait déplacé la barrette mémoire du PC de la paillasse 3 (c’est ce qu’indiquaient les 3 bips). Je l’ai remise en place et le poste fonctionne, SIL compris. Si les bips reviennent, prévenez-nous : on remplacera la barrette, le PC est sous garantie.',
      'PC réparé.',
      'C’était la RAM. Faites attention aux chariots.'
    ],
    kw: ['bip', 'memoire', 'ram', 'barrette', 'choc', 'garantie', 'paillasse'],
    hints: ['Les bips au démarrage sont un code : relève-les précisément et consulte la doc constructeur.', 'Déplace-toi (Intervention sur site) : hors tension, bracelet antistatique, puis vérifie la barrette mémoire.'],
    ideal: ['Qualifier : incident, Matériel, impact moyen (poste partagé), urgence moyenne → P3', 'Alimentation testée, code 3 bips longs, choc la veille', 'Contournement : paillasse 4', 'Sur site : doc constructeur = mémoire', 'Hors tension, antistatique, réinsérer la barrette, tester', 'Tracer l’intervention dans l’inventaire'],
    lesson: '<p>Un PC qui ne démarre pas « parle » avec ses <strong>bips</strong> et son <strong>voyant</strong> : la documentation du constructeur les traduit. Après un choc, une barrette mémoire mal enfoncée est un grand classique.</p><p>On intervient toujours <strong>hors tension</strong>, câble débranché, avec un bracelet antistatique. Et on trace l’intervention dans l’inventaire.</p>',
    kb: ['poste', 'labo-medical']
  });

  /* 18 ─ Faux DAF au téléphone (ingénierie sociale) */
  S({
    id: 'fakeceo', diff: 3, req: 'antoine', channel: 'Téléphone', prio: 2, caller: '+34 6•• ••• 812 (Espagne)',
    title: 'Le DAF demande une réinitialisation urgente par SMS',
    desc: 'Allô ? Bonjour, c’est Antoine Caron, le DAF. Je suis à l’aéroport de Madrid, j’ai oublié mon mot de passe et je dois valider un virement urgent avant 11 h. Réinitialisez-le maintenant et envoyez-le-moi par SMS au 07 52 18 44 90, ou sur mon adresse perso antoine.caron.daf@gmail.com. Vite, c’est très urgent !',
    type: 'incident', cat: ['securite', 'acces'], impact: 'moyen', urgency: 'haute',
    ad: { users: { antoine: { lastLogon: 'Aujourd’hui 08:55 – LT-DIR-001 (siège)', signins: [['Aujourd’hui 08:55', 'Lyon, FR', 'Windows (LT-DIR-001)', 'Réussie', false], ['Aujourd’hui 09:30', 'Lyon, FR', 'Outlook', 'Réussie', false]] } } },
    remote: 'Aucune prise en main pertinente : l’appelant prétend être en déplacement.',
    qs: [
      { id: 'g_identity', a: 'Mon matricule ? Euh… OS-05504. Et ne me rappelez pas sur mon fixe, je suis à l’aéroport ! Rappelez ce numéro-ci.', claim: 'OS-05504', sets: [] },
      { id: 'g_callback', a: '(Tu appelles le 2001, la ligne de M. Caron dans l’annuaire.) « Antoine Caron, oui ? … Non, je suis dans mon bureau au 5e, je n’ai jamais appelé le support ce matin. »', tag: 'key', sets: ['verified_fake', 'callback'] },
      { id: 'assistant', cat: 'Procédure', q: 'Je vais confirmer votre demande auprès de votre assistante, Aïcha Diallo (poste 2002 de l’annuaire).', a: 'Non ! Vous perdez du temps, je vous dis que c’est urgent ! Je vais me plaindre à votre responsable !', tag: 'good', sets: ['pressure'], third: ['Aïcha Diallo (poste 2002)', 'M. Caron est dans son bureau, en réunion au 5e étage. Il n’est pas à Madrid.'], also: ['verified_fake'] },
      { id: 'why', cat: 'Comprendre', q: 'Quel virement devez-vous valider ?', a: 'Un virement fournisseur confidentiel, je ne peux pas en dire plus. Faites ce que je vous demande.', tag: 'good', sets: ['fraud_sign'] },
      { id: 'refuse', cat: 'Procédure', q: 'Je ne peux pas envoyer de mot de passe par SMS ni sur une adresse personnelle : c’est la procédure de sécurité.', a: 'C’est inadmissible ! … (l’appelant raccroche)', tag: 'key', sets: ['refused'] },
      { id: 'comply', cat: 'Action', q: 'D’accord, je réinitialise et je vous envoie le nouveau mot de passe par SMS.', a: 'Parfait, j’attends le SMS. Merci, vous êtes efficace.', tag: 'bad', sets: ['complied'] },
      { id: 'g_consent', hide: true }, { id: 'g_reboot', hide: true }, { id: 'g_others', hide: true }, { id: 'g_since', hide: true }, { id: 'g_change', hide: true }, { id: 'g_error', hide: true }, { id: 'g_confirm', hide: true }
    ],
    fixed: () => false, yes: '', no: '',
    checks: [
      ['diag', 6, 'Demander le matricule et repérer qu’il ne correspond pas (OS-05504 ≠ OS-05540)', f => f('id_mismatch_detected')],
      ['diag', 6, 'Consulter la fiche AD (dernière connexion au siège ce matin)', f => f('ad:view:antoine') || f('cloud:view:antoine')],
      ['diag', 4, 'Repérer les signaux de fraude (virement urgent et confidentiel)', f => f('fraud_sign')],
      ['diag', 6, 'Contre-vérifier par un canal connu (ligne de l’annuaire ou assistante)', f => f('verified_fake')],
      ['res', 10, 'Refuser l’envoi du mot de passe hors procédure', f => f('refused')],
      ['res', 10, 'Ne faire aucune action sur le compte', f => !f.re(/^ad:(reset|unlock|disable|group\+):antoine/)]
    ],
    pen: [
      [-10, 'Accord donné à un appelant non vérifié', f => f('complied'), true],
      [-12, 'Mot de passe du DAF réinitialisé à la demande d’un imposteur', f => f('ad:reset:antoine'), true],
      [-6, 'Matricule erroné jugé conforme', f => f('id_misjudged')]
    ],
    causes: [
      'Tentative d’ingénierie sociale (fraude au président) : un faux DAF cherche à obtenir son mot de passe',
      'Vrai DAF en déplacement, à dépanner en priorité',
      'Compte du DAF verrouillé',
      'Problème de téléphonie'
    ],
    out: { mode: 'escalate', team: 'secu' },
    closing: [
      'Monsieur Caron, nous avons reçu ce matin un appel d’une personne qui se faisait passer pour vous et demandait votre mot de passe. Aucune action n’a été faite sur votre compte et la cellule sécurité est prévenue. Si vous recevez une demande inhabituelle (virement urgent ou confidentiel), vérifiez-la par un autre canal.',
      'Appel suspect, transmis à la sécurité.',
      'Nous avons réinitialisé votre mot de passe comme demandé, vous l’avez reçu par SMS.'
    ],
    kw: ['ingenierie', 'usurp', 'matricule', 'fraude', 'gmail', 'sms', 'aucune action', 'securite', '05504'],
    hints: ['Urgence, autorité, demande d’envoi sur une adresse personnelle : trois signaux d’alerte.', 'Demande le matricule et compare-le à la fiche AD. Rappelle sur le numéro de l’annuaire, jamais sur celui donné par l’appelant.', 'Refuse poliment, ne touche pas au compte, escalade à la cellule sécurité.'],
    ideal: ['Qualifier : incident, Sécurité, P2', 'Rester poli et suivre la procédure malgré la pression', 'Matricule faux, dernière connexion au siège ce matin', 'Contre-appel au numéro de l’annuaire : le vrai DAF est dans son bureau', 'Refuser, aucune action sur le compte', 'Escalader à la cellule sécurité, prévenir le vrai DAF'],
    lesson: '<p>L’<strong>ingénierie sociale</strong> joue sur l’urgence, l’autorité et la peur de mal faire. La parade est simple : la procédure s’applique à tout le monde, DAF compris, et on vérifie toujours par un <strong>canal connu</strong> (numéro de l’annuaire, assistante, manager).</p><p>Un mot de passe ne s’envoie jamais par SMS ou sur une adresse personnelle. Dans un laboratoire, un compte compromis donne accès à des données de santé : c’est un incident de sécurité.</p>',
    kb: ['ingenierie-sociale', 'identite']
  });

  /* 19 ─ Téléphone IP éteint (PoE) */
  const phoneOk = f => f('swapped_ports');
  S({
    id: 'phone', diff: 2, req: 'ines', channel: 'Téléphone',
    title: 'Téléphone de l’accueil éteint et PC sans réseau',
    desc: 'Bonjour, je vous appelle depuis le portable du site. Mon téléphone fixe est complètement éteint et mon PC n’a plus de réseau depuis que l’entreprise de ménage a débranché des câbles hier soir. J’ai rebranché comme j’ai pu. Je suis seule à l’accueil de Villeurbanne ce matin, les patients attendent et je ne peux ni enregistrer les dossiers ni répondre au téléphone !',
    type: 'incident', cat: ['telephonie', 'materiel', 'reseau'], impact: 'moyen', urgency: 'haute',
    remote: f => phoneOk(f) ? null : 'PC-VIL-012 est injoignable (hors ligne). Guide l’utilisatrice par téléphone ou déplace-toi.',
    machine: f => phoneOk(f) ? {} : { net: 'nolink' },
    qs: [
      { id: 'screen', cat: 'Diagnostic', q: 'L’écran du téléphone affiche-t-il quelque chose, même un message ?', a: 'Rien du tout, écran noir, aucun voyant.', tag: 'good', sets: ['phone_dead'] },
      { id: 'psu', cat: 'Diagnostic', q: 'Le téléphone a-t-il un bloc d’alimentation branché sur une prise électrique ?', a: 'Non, il n’y en a jamais eu, il y a juste des câbles réseau.', tag: 'good', sets: ['poe_clue'] },
      { id: 'ports', cat: 'Diagnostic', q: 'Sous le téléphone, il y a deux prises réseau. Comment sont-elles marquées, et quel câble va où ?', a: 'Une est marquée « LAN » et l’autre « PC ». Le câble qui vient du mur est dans « PC », et celui de l’ordinateur dans « LAN ».', tag: 'key', sets: ['ports_described'] },
      { id: 'swap', cat: 'Action', q: 'Inversez les deux câbles : le câble du mur dans « LAN », celui de l’ordinateur dans « PC ».', a: 'C’est fait… le téléphone s’allume ! Il affiche « Initialisation… » puis mon numéro, 5612. Et l’ordinateur a retrouvé le réseau !', tag: 'key', sets: ['swapped_ports'] },
      { id: 'test', cat: 'Diagnostic', q: 'Pouvez-vous appeler le 4000 depuis le téléphone fixe pour tester ?', a: f => phoneOk(f) ? 'J’appelle… ça sonne chez vous ? (Ton softphone affiche un appel entrant du 5612.)' : 'Il est éteint, je ne peux pas.', tag: 'good', sets: f => phoneOk(f) ? ['phone_test'] : [] },
      { id: 'divert', cat: 'Contournement', q: 'En attendant, je peux demander le renvoi des appels de l’accueil vers le site de Caluire.', a: 'Oui, ça soulagerait, merci.', tag: 'good', sets: ['workaround'] },
      { id: 'g_others', a: 'Ma collègue de l’après-midi n’est pas encore là, je suis seule.', tag: 'neutral' },
      { id: 'g_reboot', a: 'J’ai redémarré le PC, rien.', tag: 'neutral' }
    ],
    site: [
      { id: 'travel', g: 'Constat', l: 'Inspecter le téléphone, le PC et la prise murale', r: 'Le câble mural est branché dans le port « PC » du téléphone et le câble du PC dans le port « LAN ». Le téléphone n’a pas d’alimentation secteur : il est alimenté par le câble réseau (PoE).', sets: ['ports_described', 'site_look'], tag: 'key' },
      { id: 'swap', g: 'Action', l: 'Remettre les câbles dans le bon ordre (mur → LAN, PC → PC)', r: 'Le téléphone démarre, s’enregistre sur l’IPBX (ligne 5612) et le PC obtient une adresse IP.', sets: ['swapped_ports'], tag: 'key' },
      { id: 'label', g: 'Action', l: 'Étiqueter les câbles (« MUR → LAN », « PC ») et les attacher', r: 'Câbles étiquetés et attachés : le prochain ménage ne devrait plus poser de problème.', sets: ['tidy'], tag: 'good' }
    ],
    fixed: phoneOk,
    yes: 'Tout remarche : le téléphone sonne et le SIL fonctionne. Merci beaucoup !',
    no: 'Non, le téléphone est toujours éteint.',
    checks: [
      ['diag', 5, 'Constater que le téléphone n’est pas alimenté', f => f('phone_dead')],
      ['diag', 5, 'Comprendre qu’il est alimenté par le réseau (PoE)', f => f('poe_clue') || f('site_look')],
      ['diag', 8, 'Faire décrire le branchement (ports LAN et PC)', f => f('ports_described')],
      ['res', 12, 'Remettre le câble mural sur le port LAN', phoneOk],
      ['res', 5, 'Tester un appel', f => f('phone_test')],
      ['res', 3, 'Proposer un contournement pour les appels patients', f => f('workaround')]
    ],
    causes: [
      'Câbles inversés sur le téléphone IP : le câble mural (PoE) est sur le port PC, donc ni alimentation pour le téléphone ni réseau pour l’ordinateur',
      'Panne du standard téléphonique (IPBX)',
      'Téléphone défectueux à remplacer',
      'Coupure de la ligne internet du site'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Inès, les deux câbles sous le téléphone avaient été inversés : le téléphone est alimenté par le câble du mur, qui doit aller dans la prise « LAN », et c’est lui qui donne aussi le réseau à l’ordinateur. Tout est rebranché et testé. Je fais étiqueter les câbles pour que ça ne se reproduise pas. Bonne journée !',
      'Câbles remis dans le bon sens.',
      'Il ne fallait pas toucher aux câbles.'
    ],
    kw: ['poe', 'lan', 'port', 'inverse', 'telephone', 'cable', 'ipbx'],
    hints: ['Le téléphone et le PC tombent en même temps : ils sont sans doute branchés en cascade (le PC passe par le téléphone).', 'Un téléphone IP sans bloc d’alimentation est alimenté par le câble réseau (PoE). Fais décrire les prises LAN et PC.'],
    ideal: ['Qualifier : incident, Téléphonie, impact moyen (accueil d’un site), urgence haute → P2', 'Téléphone sans alimentation, pas de bloc secteur → PoE', 'Faire décrire les ports : câble mural sur « PC »', 'Inverser, tester un appel, vérifier le PC', 'Proposer un renvoi d’appels pendant le dépannage', 'Étiqueter les câbles'],
    lesson: '<p>Un téléphone IP de bureau a souvent <strong>deux ports</strong> : « LAN » (vers le mur) et « PC » (vers l’ordinateur, qui passe par le téléphone). Il est alimenté par le câble réseau grâce au <strong>PoE</strong>. Câble mural sur le mauvais port : téléphone éteint et PC sans réseau, en même temps.</p>',
    kb: ['telephonie', 'cablage']
  });

  /* 20 ─ Préparer le portable d'une nouvelle biologiste */
  const P = ['p_inv', 'p_bios', 'p_image', 'p_name', 'p_join', 'p_apps', 'p_bl', 'p_updates', 'p_cmdb', 'p_handover'];
  S({
    id: 'prep', diff: 3, req: 'sophie', channel: 'Portail', ci: 'LT-BIO-003',
    title: 'Préparer le portable de la Dre Pauline Henry (arrivée lundi)',
    desc: 'Bonjour, la Dre Pauline Henry, biologiste médicale, arrive lundi 9 novembre à 9 h au plateau technique. Son compte est créé (pauline.henry). Merci de préparer son ordinateur portable : le Dell Latitude reçu la semaine dernière est au stock IT, étiquette LT-BIO-003. – Sophie Marchand, RH',
    type: 'demande', cat: ['materiel'], impact: 'faible', urgency: 'basse',
    remote: 'LT-BIO-003 est encore dans son carton au stock IT : il n’est pas sur le réseau. Utilise l’Atelier (Intervention sur site).',
    qs: [
      { id: 'profile', cat: 'Comprendre', q: 'De quels logiciels aura-t-elle besoin ? Aura-t-elle des astreintes depuis chez elle ?', a: 'Profil biologiste : le SIL avec la validation biologique, Office, et oui, le VPN pour les astreintes de nuit et de week-end.', tag: 'key', sets: ['profile_ok'] },
      { id: 'arrival', cat: 'Comprendre', q: 'À quelle heure et où arrive-t-elle lundi ?', a: 'Lundi 9 h, au plateau technique. Son responsable, le Dr Blanc, l’accueille.', tag: 'good', sets: ['arrival'] },
      { id: 'g_identity', hide: true }, { id: 'g_callback', hide: true }, { id: 'g_consent', hide: true }, { id: 'g_reboot', hide: true }, { id: 'g_others', hide: true }, { id: 'g_error', hide: true }, { id: 'g_since', hide: true }
    ],
    site: [
      { id: 'inv', g: '1. Réception', l: 'Déballer, relever le numéro de série, coller l’étiquette d’inventaire', r: 'N° de série 4ZTP8W4 relevé, étiquette LT-BIO-003 collée sous le portable.', sets: ['p_inv'], tag: 'key' },
      { id: 'bios', g: '2. Matériel', l: 'Mettre à jour le BIOS (outil du constructeur)', r: 'BIOS mis à jour en version 1.9.2.', sets: ['p_bios'], tag: 'good' },
      { id: 'image', g: '3. Système', l: 'Déployer l’image Windows 11 de l’entreprise (MDT, câble réseau)', r: 'Image « W11-Ostral-2026.10 » déployée en 35 minutes.', sets: ['p_image'], tag: 'key' },
      { id: 'name', g: '3. Système', l: 'Renommer le poste en LT-BIO-003', r: f => f('p_join') ? 'Renommage après jonction : il faut aussi renommer l’objet dans l’AD, et un redémarrage de plus.' : 'Poste renommé LT-BIO-003 (redémarrage).', sets: ['p_name'], tag: 'key' },
      { id: 'join', g: '3. Système', l: 'Joindre le poste au domaine ostral.local (OU Ordinateurs > Biologie)', r: f => f('p_name') ? 'Poste joint au domaine : objet LT-BIO-003 créé dans l’OU Biologie.' : 'Poste joint au domaine… sous le nom automatique DESKTOP-8F2KQ1L, qui ne respecte pas la convention.', sets: ['p_join'], tag: 'key' },
      { id: 'apps', g: '4. Logiciels', l: 'Installer le profil logiciel « Biologiste » (client SIL, Office, VPN, lecteur PDF)', r: 'Profil « Biologiste » installé depuis le Centre logiciel : client SIL 8.4, Microsoft 365 Apps, client VPN, PDF24.', sets: ['p_apps'], tag: 'key' },
      { id: 'bl', g: '5. Sécurité', l: 'Activer BitLocker et vérifier la sauvegarde de la clé dans l’AD', r: f => f('p_join') ? 'Chiffrement lancé. Clé de récupération sauvegardée dans l’AD (ID 7C2E19A0).' : 'Chiffrement lancé… mais la clé n’a pas pu être sauvegardée dans l’AD (poste hors domaine). En cas de problème, les données seront irrécupérables.', sets: f => f('p_join') ? ['p_bl'] : ['p_bl', 'p_bl_nokey'], tag: 'key' },
      { id: 'updates', g: '5. Sécurité', l: 'Installer les mises à jour Windows et redémarrer', r: 'Mises à jour installées (cumulative de novembre), poste à jour.', sets: ['p_updates'], tag: 'good' },
      { id: 'cmdb', g: '6. Suivi', l: 'Mettre à jour l’inventaire : LT-BIO-003 affecté à Pauline Henry', r: 'Fiche LT-BIO-003 : statut « En service », affecté à Pauline Henry, plateau technique.', sets: ['p_cmdb'], tag: 'key' },
      { id: 'handover', g: '6. Suivi', l: 'Planifier la remise lundi 9 h : première connexion accompagnée, test SIL et VPN, bon de remise signé', r: 'Remise planifiée lundi 9 h au plateau technique, bon de remise imprimé.', sets: ['p_handover'], tag: 'good' },
      { id: 'adm', g: 'Raccourcis', l: 'Créer un compte administrateur local « support / support » pour dépanner plus vite', r: 'Compte local créé.', sets: ['bad_admin'], tag: 'bad' },
      { id: 'fw', g: 'Raccourcis', l: 'Désactiver le pare-feu Windows pour éviter les soucis avec le SIL', r: 'Pare-feu désactivé.', sets: ['bad_fw'], tag: 'bad' },
      { id: 'tv', g: 'Raccourcis', l: 'Installer un logiciel de prise en main gratuit (version personnelle)', r: 'Logiciel installé.', sets: ['bad_tv'], tag: 'bad' }
    ],
    fixed: f => P.every(x => f(x)),
    yes: 'Merci, Pauline sera ravie. Le Dr Blanc l’accompagnera lundi à 9 h.',
    no: 'Il reste des choses à faire sur le portable, non ?',
    checks: [
      ['diag', 8, 'Connaître le profil logiciel et le besoin VPN', f => f('profile_ok')],
      ['diag', 4, 'Connaître la date et le lieu d’arrivée', f => f('arrival')],
      ['diag', 4, 'Inventorier le matériel à la réception', f => f('p_inv')],
      ['res', 4, 'Déployer l’image de l’entreprise', f => f('p_image')],
      ['res', 4, 'Renommer AVANT de joindre au domaine', f => f('p_name') && f('p_join') && f.seq('p_name') < f.seq('p_join')],
      ['res', 3, 'Joindre le poste au domaine', f => f('p_join')],
      ['res', 4, 'Installer le profil logiciel adapté', f => f('p_apps')],
      ['res', 4, 'BitLocker APRÈS la jonction (clé sauvegardée dans l’AD)', f => f('p_bl') && !f('p_bl_nokey')],
      ['res', 2, 'Mettre à jour Windows et le BIOS', f => f('p_updates') && f('p_bios')],
      ['res', 3, 'Mettre à jour l’inventaire avant la remise', f => f('p_cmdb') && (!f('p_handover') || f.seq('p_cmdb') < f.seq('p_handover'))],
      ['res', 2, 'Planifier une remise accompagnée', f => f('p_handover')]
    ],
    pen: [
      [-8, 'Compte administrateur local partagé avec mot de passe faible', f => f('bad_admin'), true],
      [-6, 'Pare-feu Windows désactivé', f => f('bad_fw')],
      [-4, 'Outil de prise en main personnel non approuvé', f => f('bad_tv')]
    ],
    causes: [
      'Demande de préparation de poste : image, nommage, domaine, profil logiciel, BitLocker, inventaire, remise',
      'Incident : portable défectueux à la livraison',
      'Demande de création de compte utilisateur',
      'Demande d’achat de matériel'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Sophie, le portable LT-BIO-003 de la Dre Henry est prêt : image de l’entreprise, profil biologiste (SIL, Office, VPN), chiffrement BitLocker et mises à jour. Il est inscrit à son nom dans l’inventaire. Nous le lui remettrons lundi à 9 h au plateau technique, avec une première connexion accompagnée.',
      'Poste prêt.',
      'Le PC est prêt, il est sur l’étagère du stock, elle peut passer le prendre.'
    ],
    kw: ['lt-bio-003', 'image', 'domaine', 'bitlocker', 'inventaire', 'sil', 'vpn', 'remise'],
    hints: ['Appelle Sophie pour connaître le profil logiciel et le besoin de VPN.', 'Ouvre l’Atelier. L’ordre compte : nommer avant de joindre au domaine, BitLocker après la jonction pour que la clé soit sauvegardée dans l’AD.', 'Aucun raccourci de sécurité : pas de compte admin partagé, pas de pare-feu désactivé.'],
    ideal: ['Qualifier : demande, Matériel, P4', 'Recueillir le profil (SIL biologiste, Office, VPN) et la date', 'Réception et inventaire', 'BIOS, image, nommage, jonction au domaine', 'Profil logiciel, BitLocker (clé dans l’AD), mises à jour', 'Inventaire mis à jour, remise accompagnée planifiée'],
    lesson: '<p>Préparer un poste, c’est une <strong>procédure</strong>, pas une suite d’improvisations. L’ordre compte : un poste joint au domaine sous un nom automatique est pénible à corriger, et une clé BitLocker non sauvegardée dans l’AD peut rendre les données irrécupérables.</p><p>Les raccourcis « pour aller plus vite » (compte admin partagé, pare-feu coupé) créent des failles qui resteront des années.</p>',
    kb: ['preparation-poste', 'bitlocker']
  });

  /* 21 ─ Étiquettes de tubes décalées */
  const labelsOk = f => f('roll_ok') && f.seq('calibrated') > f.seq('roll_ok');
  S({
    id: 'labels', diff: 2, req: 'karim', channel: 'Téléphone', ci: 'ZEB-STP-01',
    title: 'Étiquettes des tubes décalées à l’accueil de Saint-Priest',
    desc: 'Les étiquettes des tubes sortent décalées : le code-barres est coupé en deux et une étiquette sur deux sort blanche. On a changé le rouleau ce matin. Les préleveuses attendent pour étiqueter les tubes, il y a du monde en salle d’attente !',
    type: 'incident', cat: ['materiel'], impact: 'moyen', urgency: 'haute',
    qs: [
      { id: 'roll', cat: 'Comprendre', q: 'Quand le rouleau a-t-il été changé, et d’où vient le nouveau ?', a: 'Ce matin à l’ouverture, j’ai pris un rouleau dans le carton du fond de la réserve.', tag: 'key', sets: ['roll_changed'] },
      { id: 'size', cat: 'Diagnostic', q: 'Pouvez-vous lire les dimensions ou la référence écrites sur le rouleau ?', a: 'Il y a écrit « 50 × 30 mm ». L’ancien, c’était 50 × 25, je crois.', tag: 'key', sets: ['wrong_roll'] },
      { id: 'avail', cat: 'Diagnostic', q: 'Reste-t-il des rouleaux 50 × 25 mm dans la réserve ?', a: 'Oui, deux dans le carton bleu.', tag: 'good', sets: ['right_avail'] },
      { id: 'putroll', cat: 'Action', q: 'Pouvez-vous installer un rouleau 50 × 25 mm à la place ?', a: 'C’est fait, il est en place.', tag: 'key', sets: ['roll_ok'] },
      { id: 'calib', cat: 'Action', q: 'Lancez le calibrage automatique : maintenez les boutons PAUSE et CANCEL enfoncés 2 secondes.', a: f => f('roll_ok') ? 'Elle fait avancer deux étiquettes puis s’arrête pile au bord.' : 'Elle avance quelques étiquettes et s’arrête.', tag: 'key', sets: ['calibrated'] },
      { id: 'box2', cat: 'Contournement', q: 'En attendant, pouvez-vous imprimer les étiquettes sur l’imprimante du box 2 ?', a: 'Oui, ma collègue du box 2 a une imprimante qui marche, on fait comme ça.', tag: 'good', sets: ['workaround'] },
      { id: 'hand', cat: 'Contournement', q: 'En attendant, écrivez les noms des patients à la main sur les tubes.', a: 'À la main ? Euh… d’accord, si vous le dites.', tag: 'bad', sets: ['handwritten'] },
      { id: 'g_reboot', a: 'J’ai éteint et rallumé l’imprimante, pareil.', tag: 'neutral' }
    ],
    acts: [
      { id: 'test', g: 'SIL', l: 'SIL : imprimer une étiquette de test', r: f => labelsOk(f) ? 'L’étiquette sort bien centrée, code-barres complet et lisible par la douchette.' : (f('calibrated') ? 'L’étiquette est calée mais le texte ne remplit pas le format : le rouleau ne correspond pas au format du SIL.' : 'L’étiquette sort décalée : code-barres coupé, une étiquette blanche sur deux.'), sets: f => labelsOk(f) ? ['test_ok'] : ['test_bad'], tag: 'key' },
      { id: 'fmt', g: 'Périphériques', l: 'Propriétés de « ZDesigner ZD421 » : format d’étiquette configuré', r: 'Format configuré : 50 × 25 mm (format de référence des étiquettes de tubes).', sets: ['driver_fmt'], tag: 'good' },
      { id: 'driver', g: 'Périphériques', l: 'Réinstaller le pilote de l’imprimante d’étiquettes', r: 'Pilote réinstallé. Les étiquettes sortent toujours décalées.', sets: ['driver_reinstall'], tag: 'bad' }
    ],
    site: [
      { id: 'look', g: 'Constat', l: 'Examiner l’imprimante et le rouleau installé', r: 'Rouleau installé : 50 × 30 mm (référence non utilisée par le SIL). Le capteur d’espacement est propre.', sets: ['wrong_roll', 'site_look'], tag: 'key' },
      { id: 'roll', g: 'Action', l: 'Installer un rouleau 50 × 25 mm', r: 'Rouleau 50 × 25 mm installé.', sets: ['roll_ok'], tag: 'key' },
      { id: 'calib', g: 'Action', l: 'Lancer le calibrage (PAUSE + CANCEL 2 secondes)', r: 'Calibrage effectué.', sets: ['calibrated'], tag: 'key' },
      { id: 'clean', g: 'Action', l: 'Nettoyer la tête d’impression (stylo à l’alcool isopropylique)', r: 'Tête nettoyée. Le décalage n’a rien à voir avec la tête, mais c’est fait.', sets: ['cleaned'], tag: 'neutral' },
      { id: 'store', g: 'Suivi', l: 'Isoler le carton de rouleaux 50 × 30 mm et prévenir le référent achats', r: 'Carton étiqueté « Ne pas utiliser – format non compatible SIL », référent achats prévenu.', sets: ['stock_fixed'], tag: 'good' }
    ],
    fixed: labelsOk,
    yes: 'Les étiquettes sortent parfaitement, la douchette lit les codes-barres. Merci !',
    no: 'Non, toujours décalées.',
    checks: [
      ['diag', 6, 'Relier la panne au changement de rouleau', f => f('roll_changed')],
      ['diag', 6, 'Identifier le mauvais format de rouleau (50 × 30 au lieu de 50 × 25)', f => f('wrong_roll')],
      ['diag', 4, 'Vérifier le format attendu par le pilote', f => f('driver_fmt')],
      ['res', 5, 'Proposer un contournement sûr (imprimante du box 2)', f => f('workaround')],
      ['res', 8, 'Installer le bon rouleau', f => f('roll_ok')],
      ['res', 6, 'Calibrer après le changement de rouleau', labelsOk],
      ['res', 4, 'Valider avec une étiquette de test', f => f('test_ok')],
      ['res', 2, 'Éviter la récidive (stock isolé, achats prévenus)', f => f('stock_fixed')]
    ],
    pen: [
      [-8, 'Étiquetage manuel improvisé : risque d’erreur d’identification patient', f => f('handwritten'), true],
      [-2, 'Réinstallation de pilote inutile', f => f('driver_reinstall')]
    ],
    causes: [
      'Rouleau d’étiquettes au mauvais format (50 × 30 mm au lieu de 50 × 25) et imprimante non recalibrée',
      'Pilote de l’imprimante corrompu',
      'Tête d’impression usée',
      'Panne du SIL'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Karim, le rouleau installé ce matin n’était pas au bon format (50 × 30 au lieu de 50 × 25 mm). Avec le bon rouleau et un calibrage, les étiquettes sortent correctement et sont lues par la douchette. Le carton de rouleaux incompatibles est isolé. Merci pour votre réactivité !',
      'Rouleau changé et imprimante calibrée.',
      'Il faut mettre le bon rouleau, c’est écrit dessus.'
    ],
    kw: ['rouleau', '50', 'calibr', 'format', 'etiquette', 'zebra'],
    hints: ['Le problème est apparu juste après le changement de rouleau : commence par là.', 'Fais lire les dimensions du rouleau, compare avec le format configuré dans le pilote.', 'Après tout changement de rouleau : calibrage. Et jamais d’étiquette écrite à la main.'],
    ideal: ['Qualifier : incident, Matériel, impact moyen (accueil d’un site), urgence haute → P2', 'Contournement sûr : imprimante du box 2', 'Rouleau 50 × 30 au lieu de 50 × 25', 'Installer le bon rouleau, calibrer, étiquette de test', 'Isoler le stock incompatible'],
    lesson: '<p>Les imprimantes d’étiquettes thermiques repèrent l’espace entre deux étiquettes : après un <strong>changement de rouleau</strong>, surtout d’un autre format, il faut <strong>calibrer</strong>.</p><p>Dans un laboratoire, l’étiquette du tube, c’est l’identité du patient : une étiquette illisible ou écrite à la main est un risque d’erreur. C’est ce qu’on appelle l’<strong>identitovigilance</strong>.</p>',
    kb: ['peripheriques-labo', 'labo-medical']
  });

  /* 22 ─ Intranet en 502 : serveur Linux, disque plein */
  const lxFreed = f => f('lx:truncate:debug') || f('lx:rm:debug');
  const lxPhp = f => lxFreed(f) && (f.seq('lx:restart:php8.2-fpm') > Math.max(f.seq('lx:truncate:debug'), f.seq('lx:rm:debug')) || f.seq('lx:start:php8.2-fpm') > Math.max(f.seq('lx:truncate:debug'), f.seq('lx:rm:debug')));
  S({
    id: 'linux', diff: 3, req: 'claire', channel: 'Téléphone', ci: 'srv-intra-01',
    title: 'L’intranet affiche « 502 Bad Gateway »',
    desc: 'Bonjour, l’intranet n’affiche plus qu’une page blanche « 502 Bad Gateway – nginx ». Je dois publier la nouvelle procédure de prélèvement avant ce soir, et les sites de prélèvement consultent les procédures dessus toute la journée. Mes collègues ont le même message.',
    type: 'incident', cat: ['reseau', 'logiciel'], impact: 'eleve', urgency: 'moyenne',
    remote: 'Le poste de Claire n’est pas en cause : le message vient du serveur. Connecte-toi en SSH à srv-intra-01 avec PuTTY.',
    ssh: {
      host: 'srv-intra-01', ip: '10.20.1.40',
      state: f => ({
        rootUsed: lxFreed(f) ? (f('lx:vacuum') ? 1.6 : 2.4) : 20.0, rootSize: 20,
        services: { nginx: 'active', 'php8.2-fpm': lxPhp(f) ? 'active' : 'failed', ssh: 'active', cron: 'active', mariadb: 'active' },
        debugSize: lxFreed(f) ? 0 : 17.9, journalSize: f('lx:vacuum') ? 0.2 : 1.0
      })
    },
    monitor: f => ({ 'srv-intra-01': lxPhp(f) ? { st: 'up', msg: 'HTTP OK – 200 en 84 ms · Disque / : ' + (f('lx:vacuum') ? '8' : '12') + ' %' } : { st: 'down', msg: 'HTTP CRITICAL – 502 Bad Gateway · Disque / : CRITICAL 100 %' } }),
    qs: [
      { id: 'g_since', a: 'Depuis ce matin vers 9 h 15, je crois.', tag: 'good', sets: ['since'] },
      { id: 'g_others', a: 'Oui, tout le monde a le même message, même au site de Caluire.', tag: 'key', sets: ['scope'] },
      { id: 'g_error', a: '« 502 Bad Gateway », et en dessous « nginx ».', tag: 'good' },
      { id: 'other', cat: 'Diagnostic', q: 'Les autres applications fonctionnent-elles (SIL, messagerie) ?', a: 'Oui, le reste marche normalement.', tag: 'good', sets: ['other_ok'] },
      { id: 'inform', cat: 'Procédure', q: 'Je m’en occupe. En attendant, les procédures sont aussi dans le partage Qualité. Je vous rappelle dès que c’est réparé.', a: 'Très bien, merci.', tag: 'good', sets: ['informed'] },
      { id: 'g_reboot', a: 'J’ai redémarré mon PC, c’est pareil.', tag: 'neutral' }, { id: 'g_consent', hide: true }
    ],
    fixed: lxPhp,
    yes: 'L’intranet remarche, j’ai pu publier la procédure. Merci !',
    no: 'Non, toujours « 502 Bad Gateway ».',
    checks: [
      ['diag', 4, 'Mesurer le périmètre (tout le monde, tous les sites)', f => f('scope')],
      ['diag', 3, 'Consulter la supervision', f => f('monitor:view')],
      ['diag', 5, 'Vérifier l’état des services (systemctl status)', f => f('lx:status:php8.2-fpm') || f('lx:failed')],
      ['diag', 5, 'Lire les journaux du service (journalctl)', f => f('lx:journal:php8.2-fpm')],
      ['diag', 5, 'Vérifier l’espace disque (df -h)', f => f('lx:df')],
      ['diag', 3, 'Trouver ce qui remplit le disque (du)', f => f('lx:du')],
      ['res', 8, 'Libérer l’espace (vider le journal de debug)', lxFreed],
      ['res', 8, 'Redémarrer PHP-FPM après avoir libéré l’espace', lxPhp],
      ['res', 3, 'Vérifier que l’intranet répond (curl ou navigateur)', f => f('lx:curl') && lxPhp(f) && f.seq('lx:curl') > f.seq('lx:restart:php8.2-fpm')],
      ['res', 3, 'Signaler la cause de fond (mode debug, rotation des logs)', (f, c) => /debug|logrotate|rotation/.test(c.noteN)]
    ],
    pen: [
      [-10, 'Suppression massive de journaux système (rm -rf)', f => f('lx:rmrf'), true],
      [-3, 'Redémarrage complet du serveur sans nécessité', f => f('lx:reboot')]
    ],
    causes: [
      'Disque / du serveur plein (journal de debug de 17,9 Go) : PHP-FPM ne peut plus démarrer, nginx renvoie 502',
      'Panne du réseau du siège',
      'Certificat HTTPS expiré',
      'Navigateur des utilisateurs à mettre à jour'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Claire, l’intranet est de nouveau accessible. Le disque du serveur était plein à cause d’un fichier de journalisation de 18 Go, ce qui empêchait l’application de fonctionner. J’ai libéré l’espace et relancé le service. L’équipe Systèmes est prévenue pour éviter que cela se reproduise. Bonne publication !',
      'Intranet réparé.',
      'Le serveur PHP était tombé, c’est relancé.'
    ],
    kw: ['disque', 'df', 'php', 'fpm', 'debug', 'log', 'nginx', '502', 'logrotate', 'journalctl'],
    hints: ['« 502 Bad Gateway » de nginx : nginx répond, mais l’application derrière lui (PHP-FPM) non. Connecte-toi en SSH à srv-intra-01.', 'systemctl status php8.2-fpm, puis journalctl -u php8.2-fpm -n 20 : que disent les journaux ? Vérifie df -h.', 'Trouve le gros fichier (du -sh /var/log/*), vide-le avec sudo truncate -s 0, puis sudo systemctl restart php8.2-fpm et curl -I http://localhost.'],
    ideal: ['Qualifier : incident, impact élevé (tout l’intranet), urgence moyenne → P2', 'Périmètre : tout le monde → serveur', 'SSH : php8.2-fpm en échec, « No space left on device »', 'df -h : / à 100 %, du : debug.log de 17,9 Go', 'truncate du fichier, redémarrage de PHP-FPM, test curl', 'Prévenir le N2 de la cause de fond (debug, rotation des logs)'],
    lesson: '<p>Une erreur <strong>502</strong> signifie que le serveur web répond mais que l’application derrière lui est arrêtée. Sous Linux, la méthode est toujours la même : <code>systemctl status</code>, puis <code>journalctl</code>, puis on vérifie les ressources (<code>df -h</code>, <code>free -h</code>).</p><p>Un disque plein fait tomber les services. Pour vider un journal, <code>truncate -s 0</code> est plus sûr qu’un <code>rm</code> si un programme le tient encore ouvert. Et on signale la cause de fond au N2.</p>',
    kb: ['linux', 'scripting', 'escalade']
  });

  /* 23 ─ « Internet ne marche plus » */
  S({
    id: 'browser', diff: 1, req: 'gerard', channel: 'Téléphone',
    title: 'Internet ne marche plus !',
    desc: 'Internet ne marche plus ! Plus moyen d’aller sur le serveur de résultats ni sur rien. C’est urgent, j’ai des résultats à consulter pour un confrère.',
    type: 'incident', cat: ['logiciel', 'reseau'], impact: 'faible', urgency: 'moyenne',
    qs: [
      { id: 'how', cat: 'Comprendre', q: 'Comment faites-vous d’habitude pour aller sur internet ? Qu’est-ce qui se passe quand vous essayez ?', a: 'Je clique sur le « e » bleu en bas de l’écran. Il n’y est plus depuis ce matin ! Il y a eu des mises à jour cette nuit.', tag: 'key', sets: ['icon_gone'] },
      { id: 'others', cat: 'Diagnostic', q: 'Le reste fonctionne-t-il : vos mails, le SIL ?', a: 'Oui, Outlook marche et le SIL aussi.', tag: 'key', sets: ['others_work'] },
      { id: 'start', cat: 'Action', q: 'Pouvez-vous appuyer sur la touche Windows et taper « Edge » ?', a: 'Ah, il y a « Microsoft Edge »… je clique… ça s’ouvre ! Le serveur de résultats s’affiche.', tag: 'key', sets: ['edge_found'] },
      { id: 'know', cat: 'Comprendre', q: 'Vous savez ce que c’est, un navigateur, au moins ?', a: '… Je suis biologiste, pas informaticien, jeune homme.', tag: 'bad' },
      { id: 'g_reboot', a: 'Oui, j’ai redémarré, c’est pareil.', tag: 'neutral' }
    ],
    acts: [
      { id: 'pin', g: 'Bureau', l: 'Épingler Microsoft Edge à la barre des tâches', r: 'Edge est de nouveau dans la barre des tâches.', sets: ['pinned'], tag: 'key' },
      { id: 'shortcut', g: 'Bureau', l: 'Créer un raccourci « Serveur de résultats » sur le bureau', r: 'Raccourci créé sur le bureau : resultats.ostral-bio.fr', sets: ['shortcut'], tag: 'good' },
      { id: 'reset', g: 'Réseau', l: 'Réinitialiser la pile réseau (netsh winsock reset) et redémarrer', r: 'Réinitialisation effectuée, redémarrage du poste… Le Dr Blanc perd 5 minutes et l’icône n’est toujours pas revenue.', sets: ['netreset'], tag: 'bad' }
    ],
    fixed: f => f('edge_found') || f('pinned'),
    yes: 'Parfait, j’ai mon « e » et même un raccourci vers les résultats. Merci, c’est très clair.',
    no: 'Non, je n’arrive toujours pas sur internet.',
    checks: [
      ['diag', 8, 'Comprendre ce que l’utilisateur appelle « internet »', f => f('icon_gone')],
      ['diag', 6, 'Vérifier que le réseau fonctionne (mails, SIL)', f => f('others_work') || f('cmd:ping')],
      ['res', 10, 'Retrouver le navigateur', f => f('edge_found') || f('pinned')],
      ['res', 6, 'Remettre l’icône dans la barre des tâches', f => f('pinned')],
      ['res', 4, 'Ajouter un raccourci vers le serveur de résultats', f => f('shortcut')]
    ],
    pen: [[-3, 'Manipulation réseau inutile et redémarrage imposé', f => f('netreset')]],
    causes: [
      'Raccourci du navigateur disparu de la barre des tâches après les mises à jour : le réseau fonctionne',
      'Panne d’internet sur le site',
      'Serveur de résultats en panne',
      'Carte réseau défectueuse'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Docteur, internet fonctionnait bien : c’est l’icône du navigateur qui avait disparu de la barre des tâches après les mises à jour de cette nuit. Je l’ai remise en place et j’ai ajouté sur votre bureau un raccourci direct vers le serveur de résultats. Bonne journée !',
      'Icône Edge remise.',
      'Internet marchait, c’est juste que vous n’aviez pas ouvert le navigateur.'
    ],
    kw: ['edge', 'navigateur', 'icone', 'barre des taches', 'raccourci', 'mise a jour'],
    hints: ['« Internet ne marche plus » peut vouloir dire beaucoup de choses. Demande comment il fait d’habitude.', 'Si les mails et le SIL marchent, le réseau va bien.'],
    ideal: ['Qualifier : incident, Logiciels, impact faible, urgence moyenne → P4', 'Faire décrire le geste habituel : l’icône a disparu', 'Vérifier que le réseau marche (mails, SIL)', 'Retrouver Edge, l’épingler, ajouter un raccourci', 'Expliquer simplement, sans condescendance'],
    lesson: '<p>Pour beaucoup d’utilisateurs, « internet », c’est l’icône sur laquelle ils cliquent. Le travail du support est de <strong>traduire</strong> le symptôme décrit en symptôme technique, avec patience.</p><p>La phrase de clôture compte autant que la réparation : on explique ce qui s’est passé sans jamais faire sentir à l’utilisateur qu’il s’est trompé.</p>',
    kb: ['communication', 'methode']
  });
})();
