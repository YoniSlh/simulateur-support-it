/* DeskSim — scénarios (partie A). Format : voir engine.js (DS.S). */
(function () {
  const S = DS.addScenario;

  /* 1 ─ Compte verrouillé (tutoriel) */
  S({
    id: 'lock', tuto: true, diff: 1, req: 'camille', channel: 'Téléphone',
    title: 'Impossible d’ouvrir ma session Windows',
    desc: 'Bonjour, je n’arrive plus à ouvrir ma session. J’ai tapé mon mot de passe plusieurs fois et maintenant Windows affiche « Le compte référencé est actuellement verrouillé et il se peut qu’il ne soit pas possible de s’y connecter ». Je rentre de deux semaines de congés et je dois saisir les factures des mutuelles avant midi.',
    type: 'incident', cat: ['acces'], impact: 'faible', urgency: 'haute',
    ad: { users: { camille: { locked: true, badPwd: 5, lastLogon: 'Il y a 15 jours' } } },
    remote: 'Aucune session n’est ouverte sur PC-FAC-014 (écran de connexion) : la prise en main à distance n’est pas possible tant que l’utilisatrice n’est pas connectée.',
    qs: [
      { id: 'g_error', a: 'Oui : « Le compte référencé est actuellement verrouillé et il se peut qu’il ne soit pas possible de s’y connecter. »', tag: 'good' },
      { id: 'forgot', cat: 'Comprendre', q: 'Vous souvenez-vous de votre mot de passe actuel ?', a: 'Honnêtement… non. Avec les vacances j’ai un trou, j’ai essayé plusieurs variantes.', tag: 'key', sets: ['forgot'] },
      { id: 'caps', cat: 'Diagnostic', q: 'La touche Verr. Maj est-elle activée ? Le clavier est-il bien en AZERTY ?', a: 'Non, le voyant des majuscules est éteint et le clavier est normal.', tag: 'good' },
      { id: 'g_since', a: 'Depuis ce matin, en rentrant de congés.', tag: 'good' },
      { id: 'g_others', a: 'Mes collègues arrivent à se connecter, oui.', tag: 'neutral' },
      { id: 'g_reboot', a: 'Oui, j’ai redémarré, c’est pareil.', tag: 'neutral' },
      { id: 'g_consent', hide: true }
    ],
    fixed: f => f('ad:unlock:camille') && f('ad:reset:camille'),
    yes: 'C’est bon : j’ai saisi le mot de passe provisoire, Windows m’a demandé d’en choisir un nouveau et je suis connectée. Merci beaucoup !',
    no: f => !f('ad:unlock:camille') ? 'Non, j’ai toujours le message « compte verrouillé ».' : 'Le compte n’est plus verrouillé, mais je ne connais toujours pas mon mot de passe…',
    checks: [
      ['diag', 5, 'Faire lire le message d’erreur exact', f => f('q:g_error')],
      ['diag', 5, 'Demander si elle connaît encore son mot de passe', f => f('forgot')],
      ['diag', 5, 'Consulter le compte dans l’Active Directory (verrouillé, 5 essais)', f => f('ad:view:camille')],
      ['res', 10, 'Vérifier l’identité (matricule conforme) avant d’agir', f => f('identity')],
      ['res', 10, 'Déverrouiller le compte', f => f('ad:unlock:camille')],
      ['res', 10, 'Réinitialiser avec un mot de passe provisoire à changer', f => f('ad:reset:camille') && !f('ad:reset_nochange:camille')]
    ],
    causes: [
      'Compte verrouillé après 5 saisies erronées : mot de passe oublié au retour de congés',
      'Mot de passe expiré (plus de 90 jours)',
      'Compte désactivé par les RH pendant les congés',
      'Clavier en QWERTY ou Verr. Maj activé'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Camille, votre compte est déverrouillé et je vous ai donné par téléphone un mot de passe provisoire. Windows vous demandera d’en choisir un nouveau (12 caractères minimum). En cas de souci, rappelez le 4000. Bonne journée !',
      'Compte déverrouillé et mot de passe réinitialisé. Ticket résolu.',
      'Bonjour, voici votre nouveau mot de passe : Ostral2026! Essayez de mieux le retenir la prochaine fois.'
    ],
    kw: ['verrouill', 'reinitialis', 'provisoire', 'identite', 'matricule', '5 essais'],
    hints: [
      'Commence par comprendre : appelle Camille (bouton « Appeler » dans le ticket), fais-lui lire le message exact et demande-lui si elle se souvient de son mot de passe.',
      'Avant de toucher au compte, vérifie son identité : demande son matricule et compare-le à la fiche AD (onglet Général).',
      'Dans « Utilisateurs et ordinateurs AD », ouvre la fiche de Camille. Onglet Compte : coche « Déverrouiller le compte ». Puis clic droit > Réinitialiser le mot de passe avec un mot de passe conforme et la case « doit changer » cochée.',
      'Demande-lui de vérifier que la connexion fonctionne, puis passe le ticket en Résolu avec une note claire.'
    ],
    ideal: ['Prendre le ticket en charge et le qualifier (incident, Comptes & accès, impact faible, urgence haute → P3)', 'Appeler l’utilisatrice, faire lire le message exact', 'Comprendre la cause : mot de passe oublié après les congés', 'Vérifier l’identité (matricule comparé à l’annuaire)', 'Dans l’AD : constater le verrouillage, déverrouiller, réinitialiser avec un mot de passe provisoire à changer', 'Faire tester la connexion', 'Documenter et résoudre'],
    lesson: '<p>Un compte <strong>verrouillé</strong> n’est pas un compte <strong>expiré</strong> ni <strong>désactivé</strong> : le verrouillage arrive après trop d’essais ratés et se lève tout seul après 30 minutes, ou tout de suite par le support. Ici, déverrouiller ne suffit pas : l’utilisatrice ne connaît plus son mot de passe, il faut aussi le réinitialiser.</p><p>Le mot de passe provisoire se donne <strong>à l’oral</strong>, jamais par mail, et la case « l’utilisateur doit changer le mot de passe » reste cochée.</p>',
    kb: ['ad', 'mdp', 'identite'],
    guide: [
      ['Dans le Service Desk, ouvre le ticket et clique « Prendre en charge »', f => f('taken')],
      ['Qualifie le ticket : type, catégorie, impact, urgence, puis « Enregistrer »', f => f('qualified')],
      ['Clique « Appeler le demandeur » et demande le message d’erreur exact', f => f('q:g_error')],
      ['Demande-lui si elle se souvient de son mot de passe', f => f('forgot')],
      ['Vérifie son identité : demande le matricule et compare-le à l’AD', f => f('identity')],
      ['Ouvre « Utilisateurs et ordinateurs AD » et la fiche de Camille', f => f('ad:view:camille')],
      ['Déverrouille le compte puis réinitialise le mot de passe', f => f('ad:unlock:camille') && f('ad:reset:camille')],
      ['Demande-lui de vérifier que tout fonctionne', f => f('confirmed')],
      ['Onglet Résolution : cause, message, note, puis « Résoudre »', () => false]
    ]
  });

  /* 2 ─ Boîte aux lettres pleine */
  S({
    id: 'mailbox', diff: 1, req: 'thomas', channel: 'Portail',
    title: 'Je ne reçois plus aucun mail',
    desc: 'Bonjour, depuis ce matin je ne reçois plus de mails et mes envois restent dans la boîte d’envoi. Il y a un bandeau jaune en haut d’Outlook mais je ne l’ai pas lu en détail. J’attends des devis de fournisseurs de réactifs aujourd’hui. Merci – Thomas',
    type: 'incident', cat: ['messagerie'], impact: 'faible', urgency: 'haute',
    ad: { users: { thomas: { mailboxUsed: 49.9 } } },
    qs: [
      { id: 'g_error', a: 'Je le lis : « Votre boîte aux lettres est pleine. Vous ne pouvez plus envoyer ni recevoir de messages. »', tag: 'key', sets: ['banner'] },
      { id: 'g_others', a: 'Non, mes collègues des achats reçoivent leurs mails normalement.', tag: 'good' },
      { id: 'attach', cat: 'Diagnostic', q: 'Recevez-vous ou envoyez-vous souvent des pièces jointes volumineuses ?', a: 'Oui, des catalogues et fiches techniques en PDF, parfois 20 ou 30 Mo. Je garde tout, au cas où.', tag: 'good', sets: ['bigattach'] },
      { id: 'deleted', cat: 'Diagnostic', q: 'Videz-vous de temps en temps le dossier « Éléments supprimés » ?', a: 'Euh… jamais. Je supprime mais je ne vide pas.', tag: 'good', sets: ['deleted_info'] },
      { id: 'okempty', cat: 'Procédure', q: 'Je vous propose de vider le dossier « Éléments supprimés » : il ne contient que des mails que vous avez déjà supprimés. Êtes-vous d’accord ?', a: 'Oui, allez-y, je n’en ai pas besoin.', tag: 'good', sets: ['ok_empty'] },
      { id: 'g_reboot', a: 'J’ai fermé et rouvert Outlook, rien ne change.', tag: 'neutral' }
    ],
    acts: [
      { id: 'sizes', g: 'Outlook', l: 'Outlook : Fichier > Outils > Taille des dossiers', r: 'Boîte de réception : 9,8 Go\nÉléments envoyés : 14,2 Go\nÉléments supprimés : 21,6 Go\nAutres dossiers : 4,3 Go\nTotal : 49,9 Go sur 50 Go', sets: ['mbx_sizes'], tag: 'key' },
      { id: 'empty', g: 'Outlook', l: 'Outlook : vider le dossier « Éléments supprimés »', r: 'Dossier vidé : 21,6 Go libérés. La boîte est à 28,3 Go sur 50 Go. Les messages en attente arrivent.', sets: ['emptied'], tag: 'key', also: f => f('ok_empty') ? [] : ['deleted_noconsent'] },
      { id: 'sortsent', g: 'Outlook', l: 'Outlook : trier « Éléments envoyés » par taille', r: 'Les 50 plus gros messages envoyés pèsent 8,1 Go (catalogues PDF). Ils pourraient être enregistrés sur \\\\srv-fic-01\\Achats puis supprimés de la boîte.', sets: ['sorted'], tag: 'good' },
      { id: 'repair', g: 'Applications', l: 'Réparer Microsoft Office (réparation en ligne)', r: 'Réparation en ligne terminée après 28 minutes. Outlook redémarre… le bandeau « boîte pleine » est toujours là.', sets: ['office_repair'], tag: 'bad' }
    ],
    cloud: [
      { id: 'archive', l: 'Activer l’archivage en ligne (messages de plus de 2 ans)', r: 'Archive en ligne activée pour thomas.lefebvre@ostral-bio.fr. 6,1 Go de messages anciens seront déplacés cette nuit vers l’archive.', sets: ['archive'], tag: 'good' },
      { id: 'quota', l: 'Augmenter le quota de la boîte à 100 Go', r: 'Action refusée : la modification des quotas est réservée au N2 Systèmes (licence Exchange Online Plan 1 limitée à 50 Go).', sets: ['quota_try'], tag: 'neutral' }
    ],
    fixed: f => f('emptied'),
    yes: 'Oui ! Les mails arrivent, j’ai reçu trois devis d’un coup et le bandeau a disparu.',
    no: 'Non, toujours le bandeau « boîte pleine » et rien n’arrive.',
    checks: [
      ['diag', 6, 'Faire lire le bandeau d’Outlook (boîte pleine)', f => f('banner')],
      ['diag', 6, 'Mesurer l’occupation (taille des dossiers ou console cloud)', f => f('mbx_sizes') || f('cloud:view:thomas')],
      ['diag', 4, 'Identifier les causes (éléments supprimés, pièces jointes)', f => f('deleted_info') || f('bigattach')],
      ['res', 10, 'Libérer de l’espace (vider les éléments supprimés)', f => f('emptied')],
      ['res', 5, 'Obtenir l’accord de l’utilisateur avant de supprimer', f => f('ok_empty') && f.seq('ok_empty') < f.seq('emptied')],
      ['res', 5, 'Éviter que ça recommence (archivage, tri des pièces jointes)', f => f('archive') || f('sorted')]
    ],
    pen: [
      [-4, 'Suppression de données sans l’accord de l’utilisateur', f => f('deleted_noconsent')],
      [-3, 'Réparation d’Office inutile : la cause n’était pas logicielle', f => f('office_repair')]
    ],
    causes: [
      'Boîte aux lettres pleine (49,9 Go sur 50 Go), dont 21,6 Go d’éléments supprimés jamais vidés',
      'Profil Outlook corrompu',
      'Panne du serveur de messagerie',
      'Licence Office expirée'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Thomas, votre boîte aux lettres était pleine (50 Go). Avec votre accord, j’ai vidé les éléments supprimés (21 Go libérés) et activé l’archivage automatique des anciens messages. Les mails arrivent de nouveau. Pour les gros catalogues, pensez à les enregistrer sur le partage Achats. Bonne journée !',
      'Boîte vidée, ça remarche.',
      'Votre boîte était pleine, il faut faire le ménage plus souvent. Ticket fermé.'
    ],
    kw: ['pleine', 'quota', 'supprim', 'archiv', '50 go', '21'],
    hints: ['Appelle Thomas et fais-lui lire le bandeau jaune mot pour mot.', 'Mesure la place occupée : console cloud (Exchange) ou, en prise en main, Outlook > Taille des dossiers.', 'Avant de supprimer quoi que ce soit, demande son accord. Puis libère de l’espace et mets en place l’archivage.'],
    ideal: ['Qualifier : incident, Messagerie, impact faible, urgence haute → P3', 'Faire lire le bandeau : boîte pleine', 'Mesurer l’occupation (49,9/50 Go) et trouver la cause (21 Go d’éléments supprimés)', 'Demander l’accord puis vider les éléments supprimés', 'Activer l’archivage pour éviter la récidive', 'Faire vérifier la réception, documenter, résoudre'],
    lesson: '<p>« Je ne reçois plus de mails » ne veut pas dire « le serveur est en panne ». Le premier réflexe est de <strong>lire le message affiché</strong> : ici il donne directement la cause.</p><p>Les éléments supprimés comptent dans le quota tant que le dossier n’est pas vidé. Toute suppression de données se fait <strong>avec l’accord</strong> de l’utilisateur, et on traite la cause de fond (archivage, partage réseau pour les grosses pièces jointes).</p>',
    kb: ['outlook']
  });

  /* 3 ─ Câble sur une prise non brassée */
  S({
    id: 'cable', diff: 1, req: 'mehdi', channel: 'Téléphone',
    title: 'Plus de réseau sur mon PC',
    desc: 'Salut le support, plus d’internet ni de réseau sur mon PC du bureau des référents depuis ce matin. Il y a un globe barré en bas à droite. On a réaménagé le bureau samedi et j’ai rebranché mon PC moi-même. J’arrive à dépanner sur le PC d’un collègue mais c’est galère.',
    type: 'incident', cat: ['reseau', 'materiel'], impact: 'faible', urgency: 'moyenne',
    remote: f => f('cable_fixed') ? null : 'PC-PLT-031 ne répond pas sur le réseau : le poste est hors ligne. Guide l’utilisateur par téléphone ou déplace-toi.',
    machine: f => f('cable_fixed') ? {} : { net: 'nolink' },
    qs: [
      { id: 'g_since', a: 'Depuis ce matin. On a déplacé les bureaux samedi.', tag: 'good', sets: ['moved'] },
      { id: 'g_others', a: 'Non, les autres PC du bureau marchent très bien.', tag: 'good', sets: ['scope_single'] },
      { id: 'g_change', a: 'Oui, le bureau a été réaménagé samedi et j’ai rebranché le PC moi-même.', tag: 'key', sets: ['moved'] },
      { id: 'ipcfg', cat: 'Diagnostic', q: 'Pouvez-vous ouvrir l’invite de commandes (touche Windows, tapez cmd) et taper ipconfig ? Lisez-moi ce qui s’affiche.', a: f => f('cable_fixed') ? 'Adresse IPv4 : 10.20.4.57, passerelle 10.20.4.1.' : 'Alors… « Carte Ethernet Ethernet : Statut du média . . . : Média déconnecté ».', tag: 'key', sets: ['ipconfig_read'] },
      { id: 'leds', cat: 'Diagnostic', q: 'Les petits voyants à côté du câble réseau, à l’arrière du PC, sont-ils allumés ?', a: f => f('cable_fixed') ? 'Oui, vert et orange qui clignote.' : 'Je regarde… non, rien d’allumé, ni vert ni orange.', tag: 'key', sets: ['leds'] },
      { id: 'port', cat: 'Diagnostic', q: 'Dans quelle prise murale le câble est-il branché ? Il y a une étiquette dessus ?', a: 'Dans la prise P3-14. Il y en a une autre juste à côté, P3-13, qui est libre.', tag: 'good', sets: ['port_info'] },
      { id: 'swap', cat: 'Action', q: 'Pouvez-vous brancher le câble dans l’autre prise libre, la P3-13 ?', a: 'C’est fait… le voyant vert s’allume ! Et le globe barré a disparu.', tag: 'key', sets: ['cable_fixed'] },
      { id: 'cabledmg', cat: 'Diagnostic', q: 'Le câble a-t-il l’air abîmé ? Le petit clip en plastique est-il cassé ?', a: 'Non, il a l’air neuf.', tag: 'neutral' },
      { id: 'g_reboot', a: 'Oui, deux fois. Rien.', tag: 'neutral' }
    ],
    site: [
      { id: 'look', g: 'Constat', l: 'Inspecter le poste et la prise murale', r: 'Le câble part de la carte réseau du PC vers la prise P3-14. Aucun voyant sur la carte réseau. La prise P3-13 à côté est libre.', sets: ['site_look', 'port_info', 'leds'], tag: 'key' },
      { id: 'tester', g: 'Mesure', l: 'Tester la prise P3-14 avec le testeur de câble', r: 'Testeur : aucun signal sur P3-14. La prise n’est pas brassée dans la baie (aucun câble au panneau de brassage, position 14).', sets: ['tested'], tag: 'good' },
      { id: 'plug', g: 'Action', l: 'Brancher le câble sur la prise P3-13', r: 'Voyant vert allumé. Windows obtient une adresse en 5 secondes : 10.20.4.57.', sets: ['cable_fixed'], tag: 'key' }
    ],
    fixed: f => f('cable_fixed'),
    yes: 'Oui, tout remarche : internet, le SIL, le lecteur S:. Merci !',
    no: 'Non, toujours le globe barré.',
    checks: [
      ['diag', 8, 'Faire lire le résultat d’ipconfig (média déconnecté) ou constater sur place', f => f('ipconfig_read') || f('site_look')],
      ['diag', 5, 'Vérifier les voyants de la carte réseau', f => f('leds')],
      ['diag', 4, 'Identifier le changement récent (bureau déplacé)', f => f('moved')],
      ['diag', 3, 'Vérifier le périmètre (seul ce PC est touché)', f => f('scope_single')],
      ['res', 12, 'Faire brancher le câble sur une prise active', f => f('cable_fixed')],
      ['res', 5, 'Vérifier ensuite la connectivité (ipconfig / ping à distance)', f => f('cable_fixed') && (f.seq('cmd:ipconfig') > f.seq('cable_fixed') || f.seq('cmd:ping') > f.seq('cable_fixed'))],
      ['res', 3, 'Signaler la prise P3-14 non brassée dans la note', (f, c) => /p3.?14/.test(c.noteN)]
    ],
    causes: [
      'Câble branché sur une prise murale non brassée (P3-14) : aucun lien réseau',
      'Serveur DHCP en panne',
      'Carte réseau défectueuse',
      'Virus qui bloque l’accès à internet'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Mehdi, le câble réseau était branché sur une prise murale non activée (P3-14). En le passant sur la prise P3-13, votre PC a retrouvé le réseau. J’ai signalé la prise P3-14 pour qu’elle soit brassée. Bonne journée !',
      'Problème de prise réglé.',
      'Il fallait juste brancher le câble au bon endroit.'
    ],
    kw: ['prise', 'media', 'deconnect', 'p3-14', 'p3-13', 'cable', 'brass'],
    hints: ['Le poste est hors ligne : tu ne peux pas prendre la main. Fais faire les tests par téléphone (ipconfig, voyants) ou déplace-toi (Intervention sur site).', '« Média déconnecté » = pas de lien physique. Regarde la prise murale utilisée.', 'Fais essayer l’autre prise, puis vérifie à distance avec ipconfig ou un ping.'],
    ideal: ['Qualifier : incident, Réseau, impact faible, urgence moyenne → P4', 'Constater que le poste est injoignable : guider par téléphone', 'ipconfig → « Média déconnecté », voyants éteints : problème physique', 'Changement récent : bureau déplacé → vérifier la prise murale', 'Brancher sur une prise active, vérifier à distance', 'Signaler la prise non brassée, documenter, résoudre'],
    lesson: '<p>Toujours <strong>commencer par la couche physique</strong> : câble, voyants, prise. « Média déconnecté » dans ipconfig veut dire qu’il n’y a pas de lien électrique entre le PC et le switch : inutile de chercher du côté DHCP ou DNS.</p><p>Une prise murale n’est active que si elle est <strong>brassée</strong> dans la baie. Après un réaménagement, c’est la cause numéro un.</p>',
    kb: ['reseau', 'cablage', 'commandes']
  });

  /* 4 ─ File d'impression bloquée */
  const spoolCleared = f => f('queue_cleared') || f('svcrestart:spooler') || (f.seq('svcstop:spooler') && f.seq('svcstart:spooler') > f.seq('svcstop:spooler'));
  S({
    id: 'printer', diff: 1, req: 'nathalie', channel: 'Téléphone',
    title: 'Mes documents restent bloqués dans la file d’impression',
    desc: 'Bonjour, depuis ce matin rien ne sort de l’imprimante de la facturation (IMP-FAC-01). Mes documents restent bloqués dans la file d’attente. Je dois imprimer les bordereaux de télétransmission avant 16 h.',
    type: 'incident', cat: ['materiel'], impact: 'faible', urgency: 'moyenne',
    machine: f => ({
      printers: [
        { name: 'IMP-FAC-01', status: spoolCleared(f) ? 'Normal' : 'Error', jobs: spoolCleared(f) ? 0 : 3, driver: 'HP Universal Printing PCL 6', port: 'IP_10.20.2.250', jobList: [[12, 'Bordereau_teletrans_0211.pdf', '02/11/2026 08:51', 'Error, Printing'], [13, 'Relance_mutuelle_MGEN.docx', '02/11/2026 09:14', 'Spooling'], [14, 'Bordereau_teletrans_0211.pdf', '02/11/2026 09:20', 'Spooling']] },
        { name: 'IMP-GEN-RDC', status: 'Normal', jobs: 0, driver: 'HP Universal Printing PCL 6', port: 'IP_10.20.1.31' }
      ]
    }),
    qs: [
      { id: 'g_others', a: 'Si, Camille vient d’imprimer à l’instant sur la même imprimante, ça marche pour elle.', tag: 'key', sets: ['others_ok'] },
      { id: 'g_error', a: 'Dans la file d’attente, le document « Bordereau_teletrans_0211.pdf » est en « Erreur – Impression ». Les autres derrière sont « En attente ».', tag: 'key', sets: ['queue_err'] },
      { id: 'pstate', cat: 'Diagnostic', q: 'L’imprimante affiche-t-elle un message sur son écran (papier, bourrage, toner) ?', a: 'Non, l’écran indique « Prête ». Et Camille imprime dessus.', tag: 'good', sets: ['printer_ok'] },
      { id: 'alt', cat: 'Contournement', q: 'Si c’est urgent, vous pouvez imprimer en attendant sur IMP-GEN-RDC au rez-de-chaussée.', a: 'D’accord, c’est bon à savoir, merci.', tag: 'good', sets: ['workaround'] },
      { id: 'g_reboot', a: 'Non, je n’ai pas redémarré, j’ai plein de fichiers ouverts.', tag: 'neutral' }
    ],
    acts: [
      { id: 'queue', g: 'Impression', l: 'Ouvrir la file d’attente de IMP-FAC-01', r: f => spoolCleared(f) ? 'File d’attente vide. Statut de l’imprimante : Prête.' : 'Bordereau_teletrans_0211.pdf – Erreur – Impression – 412 Ko\nRelance_mutuelle_MGEN.docx – En attente\nBordereau_teletrans_0211.pdf – En attente', sets: ['queue_viewed'], tag: 'key' },
      { id: 'cancel', g: 'Impression', l: 'File d’attente : annuler tous les documents', r: f => spoolCleared(f) ? 'Aucun document à annuler.' : 'Les documents passent à « Suppression… » mais restent bloqués : le service d’impression ne répond plus.', sets: ['cancel_try'], tag: 'neutral' },
      { id: 'spool', g: 'Services', l: 'Services : redémarrer « Spouleur d’impression »', r: 'Service redémarré. Le document en erreur est purgé et les deux autres documents partent à l’impression.', sets: ['queue_cleared'], tag: 'key' },
      { id: 'driver', g: 'Impression', l: 'Désinstaller et réinstaller le pilote de l’imprimante', r: f => spoolCleared(f) ? 'Pilote réinstallé (10 min). Rien n’a changé.' : 'Pilote réinstallé (10 min). Le document reste bloqué « Erreur – Impression ».', sets: ['driver_reinstall'], tag: 'bad' },
      { id: 'test', g: 'Impression', l: 'Imprimer une page de test sur IMP-FAC-01', r: f => spoolCleared(f) ? 'Page de test imprimée correctement.' : 'La page de test se met en attente derrière le document en erreur.', sets: f => spoolCleared(f) ? ['testpage'] : [], tag: 'good' }
    ],
    fixed: spoolCleared,
    yes: 'Oui, mes bordereaux sont sortis ! Merci.',
    no: 'Non, toujours bloqué dans la file.',
    checks: [
      ['diag', 6, 'Vérifier si les collègues impriment (le problème vient de son poste)', f => f('others_ok')],
      ['diag', 6, 'Consulter la file d’attente (document en erreur)', f => f('queue_err') || f('queue_viewed') || f('cmd:getprintjob')],
      ['diag', 3, 'Vérifier l’état de l’imprimante', f => f('printer_ok')],
      ['res', 12, 'Débloquer la file (redémarrer le spouleur)', spoolCleared],
      ['res', 4, 'Faire une page de test ou faire confirmer', f => f('testpage') || f('confirmed')],
      ['res', 4, 'Proposer un contournement pendant le dépannage', f => f('workaround')]
    ],
    pen: [[-2, 'Réinstallation de pilote inutile (les collègues impriment sans souci)', f => f('driver_reinstall')]],
    causes: [
      'Travail d’impression en erreur qui bloque le spouleur du poste de Nathalie',
      'Imprimante IMP-FAC-01 en panne',
      'Pilote d’imprimante corrompu',
      'Serveur d’impression arrêté pour tout le service'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Nathalie, un document en erreur bloquait la file d’impression de votre poste. J’ai redémarré le service d’impression : la file est vidée et vos bordereaux sont sortis. Si cela se reproduit, appelez le 4000. Bonne fin de journée !',
      'Spouleur redémarré, OK.',
      'Le spouleur était planté. Redémarrez votre PC la prochaine fois avant d’appeler.'
    ],
    kw: ['spoul', 'file', 'attente', 'bloqu', 'erreur', 'redemarr'],
    hints: ['Demande si les collègues arrivent à imprimer : ça te dit si le problème vient de l’imprimante ou du poste.', 'Prends la main et regarde la file d’attente, ou dans PowerShell distant : Get-PrintJob -PrinterName IMP-FAC-01.', 'Un document en erreur bloque tout : redémarre le service Spouleur (Services ou Restart-Service Spooler), puis page de test.'],
    ideal: ['Qualifier : incident, Matériel, impact faible, urgence moyenne → P4', 'Isoler : les collègues impriment → problème sur le poste', 'Voir la file : document en erreur', 'Proposer un contournement (autre imprimante)', 'Redémarrer le spouleur, page de test', 'Documenter et résoudre'],
    lesson: '<p>La question « est-ce que vos collègues ont le même problème ? » coupe le problème en deux : si les autres impriment, l’imprimante va bien et la panne est sur le poste.</p><p>Un travail en erreur peut bloquer toute la file : on redémarre le <strong>spouleur d’impression</strong> avant de toucher aux pilotes.</p>',
    kb: ['impression', 'commandes']
  });

  /* 5 ─ VPN à l'hôtel (portail captif) */
  S({
    id: 'vpn', diff: 2, req: 'julien', channel: 'Téléphone',
    title: 'Le VPN ne se connecte pas depuis l’hôtel',
    desc: 'Je suis à l’hôtel à Clermont, je vois des médecins prescripteurs cet après-midi. Le Wi-Fi de l’hôtel est connecté mais le VPN tourne dans le vide puis affiche « Impossible de joindre la passerelle vpn.ostral-bio.fr ». J’ai besoin du CRM pour préparer mes rendez-vous de 14 h ! Je vous appelle depuis mon portable.',
    type: 'incident', cat: ['reseau'], impact: 'faible', urgency: 'haute',
    remote: f => f('portal_ok') ? null : 'LT-PRE-022 est injoignable : sans accès internet, l’outil d’assistance à distance ne peut pas joindre le poste.',
    machine: f => ({ net: f('portal_ok') ? 'offsite' : 'captive', ip: '10.1.34.112', gw: '10.1.1.1', dns: ['10.1.1.1'], adapter: 'Wi-Fi', vpn: f('vpn_ok') }),
    qs: [
      { id: 'g_error', a: '« Impossible de joindre la passerelle vpn.ostral-bio.fr (erreur 809) ».', tag: 'good' },
      { id: 'g_since', a: 'Depuis que je suis arrivé à l’hôtel ce matin. Hier soir chez moi, ça marchait.', tag: 'good', sets: ['works_home'] },
      { id: 'web', cat: 'Diagnostic', q: 'Pouvez-vous ouvrir le navigateur et aller sur un site, par exemple google.fr ?', a: 'Tiens… ça m’ouvre une page de l’hôtel : « Bienvenue – saisissez votre numéro de chambre et acceptez les conditions ».', tag: 'key', sets: ['captive_seen'] },
      { id: 'accept', cat: 'Action', q: 'Pouvez-vous remplir cette page (numéro de chambre) et accepter les conditions ?', a: f => f('captive_seen') ? 'C’est fait : « Vous êtes connecté à Internet ». Google s’affiche.' : 'Quelle page ? Je n’ai rien vu de tel…', tag: 'key', sets: f => f('captive_seen') ? ['portal_ok'] : [] },
      { id: 'retry', cat: 'Action', q: 'Relancez la connexion VPN maintenant, s’il vous plaît.', a: f => f('portal_ok') ? 'Connecté ! Le cadenas est vert et j’ai accès au CRM.' : 'Toujours « Impossible de joindre la passerelle ».', tag: 'good', sets: f => f('portal_ok') ? ['vpn_ok'] : [] },
      { id: 'tether', cat: 'Contournement', q: 'En dépannage, pouvez-vous partager la connexion 4G de votre téléphone ?', a: 'Oui je peux, mais mon forfait data est limité. Je garde ça en secours.', tag: 'good', sets: ['workaround'] },
      { id: 'pwd', cat: 'Diagnostic', q: 'Avez-vous changé votre mot de passe récemment ?', a: 'Non, pas depuis un mois.', tag: 'neutral' },
      { id: 'g_others', a: 'Je suis seul ici… mes collègues au siège n’utilisent pas le VPN.', tag: 'neutral' },
      { id: 'g_reboot', a: 'Oui, j’ai redémarré le portable, pareil.', tag: 'neutral' }
    ],
    monitor: () => ({ 'vpn.ostral-bio.fr': { st: 'up', msg: 'Passerelle VPN – 42 sessions actives' } }),
    fixed: f => f('vpn_ok'),
    yes: 'Tout marche, j’ai mon CRM. Merci, vous me sauvez !',
    no: 'Non, le VPN refuse toujours de se connecter.',
    checks: [
      ['diag', 4, 'Comprendre que ça marchait ailleurs (chez lui)', f => f('works_home')],
      ['diag', 4, 'Faire lire le message d’erreur du VPN', f => f('q:g_error')],
      ['diag', 12, 'Tester l’accès internet hors VPN (portail captif découvert)', f => f('captive_seen')],
      ['diag', 3, 'Vérifier que la passerelle VPN est en ligne (supervision)', f => f('monitor:view')],
      ['res', 10, 'Faire valider le portail de l’hôtel', f => f('portal_ok')],
      ['res', 10, 'Faire relancer le VPN et confirmer', f => f('vpn_ok')]
    ],
    pen: [[-3, 'Réinitialisation de mot de passe inutile', f => f('ad:reset:julien')]],
    causes: [
      'Portail captif du Wi-Fi de l’hôtel non validé : pas d’accès internet, donc pas de VPN',
      'Passerelle VPN de l’entreprise en panne',
      'Mot de passe de Julien expiré',
      'Pare-feu Windows qui bloque le VPN'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Julien, le Wi-Fi de l’hôtel demandait de valider une page d’accueil avant de donner accès à internet ; sans cela, le VPN ne pouvait pas joindre nos serveurs. C’est réglé et le VPN est connecté. Astuce : en déplacement, ouvrez d’abord un site web avant de lancer le VPN. Bons rendez-vous !',
      'VPN OK après validation du portail.',
      'Le VPN marche très bien, c’est le Wi-Fi de votre hôtel qui pose problème.'
    ],
    kw: ['portail', 'captif', 'hotel', 'wi-fi', 'vpn', 'internet'],
    hints: ['Ça marchait chez lui hier : qu’est-ce qui change à l’hôtel ? Teste d’abord internet sans le VPN.', 'Demande-lui d’ouvrir un site web dans le navigateur.', 'Les Wi-Fi d’hôtel imposent souvent une page d’accueil (portail captif). Fais-la valider puis relancer le VPN.'],
    ideal: ['Qualifier : incident, Réseau, impact faible, urgence haute → P3', 'Comprendre ce qui a changé (lieu de connexion)', 'Tester internet sans VPN : page de l’hôtel', 'Faire valider le portail captif', 'Relancer le VPN et confirmer', 'Donner l’astuce pour la prochaine fois'],
    lesson: '<p>Le VPN passe <strong>par</strong> internet. S’il n’y a pas d’internet, il n’y a pas de VPN. Dans un hôtel, une gare ou un aéroport, le Wi-Fi est souvent « connecté » mais bloqué derrière un <strong>portail captif</strong> tant que la page d’accueil n’est pas validée.</p><p>Méthode : du plus simple au plus complexe. Internet d’abord, VPN ensuite, compte en dernier.</p>',
    kb: ['reseau']
  });

  /* 6 ─ PC lent : logiciel indésirable */
  const puaGone = f => f('uninstalled');
  S({
    id: 'slow', diff: 2, req: 'sophie', channel: 'Portail',
    title: 'PC portable extrêmement lent et publicités',
    desc: 'Bonjour, mon portable est devenu extrêmement lent depuis hier après-midi : Outlook met une minute à s’ouvrir, le ventilateur souffle fort et des publicités s’ouvrent dans le navigateur. J’ai des entretiens d’embauche à préparer… Sophie (RH)',
    type: 'incident', cat: ['securite', 'logiciel'], impact: 'faible', urgency: 'moyenne',
    machine: f => ({
      procs: puaGone(f) || f('kill:pdfconvertproupdater.exe') ? undefined : DS.defaultProfile('LT-RH-007').procs.concat([['PDFConvertProUpdater.exe', 7340, 'Console', 412880], ['SearchBoostHelper.exe', 7512, 'Console', 98200]]),
      cpu: { 'PDFConvertProUpdater.exe': 1840.5, 'SearchBoostHelper.exe': 310.2, 'ms-teams.exe': 95.1 },
      freeRam: puaGone(f) ? '8 120' : '1 904', boot: '31/10/2026, 07:41:09'
    }),
    qs: [
      { id: 'g_change', a: 'Hier, j’ai installé un petit logiciel gratuit trouvé sur internet pour convertir les CV en PDF : « PDF Convert Pro Free ». Il s’est installé sans demander de mot de passe.', tag: 'key', sets: ['pua_install'] },
      { id: 'g_since', a: 'Depuis hier après-midi.', tag: 'good' },
      { id: 'ads', cat: 'Diagnostic', q: 'Les publicités apparaissent-elles sur tous les sites, même l’intranet ?', a: 'Oui, même sur l’intranet : des fenêtres « Votre PC est infecté, cliquez ici ».', tag: 'good', sets: ['ads'] },
      { id: 'clicked', cat: 'Diagnostic', q: 'Avez-vous cliqué sur une de ces publicités ou saisi des informations dedans ?', a: 'Non, je les ferme à chaque fois.', tag: 'good', sets: ['no_click'] },
      { id: 'g_reboot', a: 'J’ai redémarré ce matin, ça n’a rien changé.', tag: 'neutral' },
      { id: 'g_others', a: 'Personne d’autre aux RH ne s’est plaint.', tag: 'neutral' }
    ],
    acts: [
      { id: 'taskmgr', g: 'Système', l: 'Ouvrir le Gestionnaire des tâches (trier par processeur)', r: f => puaGone(f) ? 'Processeur : 9 %. Mémoire : 41 %. Rien d’anormal.' : 'Processeur : 97 %\n  PDFConvertProUpdater.exe … 71 %\n  SearchBoostHelper.exe …… 12 %\n  ms-teams.exe ……………… 6 %\nMémoire : 81 %', sets: ['saw_proc'], tag: 'key' },
      { id: 'apps', g: 'Paramètres', l: 'Paramètres > Applications installées (tri par date)', r: f => puaGone(f) ? 'Plus aucune application installée hier.' : 'Installées hier :\n  PDF Convert Pro Free 3.2 (éditeur : Fast Tools Ltd)\n  SearchBoost for Edge (extension)\nLe reste date de plusieurs mois.', sets: ['saw_programs'], tag: 'key' },
      { id: 'uninstall', g: 'Paramètres', l: 'Désinstaller « PDF Convert Pro Free » et retirer l’extension « SearchBoost »', r: 'Désinstallation terminée. L’extension a été retirée d’Edge. Le processeur redescend à 9 %.', sets: ['uninstalled'], tag: 'key' },
      { id: 'avfull', g: 'Sécurité', l: 'Lancer une analyse antivirus complète (Defender)', r: 'Analyse complète (25 min) : 2 éléments indésirables de faible gravité mis en quarantaine (PUA:Win32/FastTools, Adware:JS/SearchBoost).', sets: ['av_full'], tag: 'good' },
      { id: 'pdf24', g: 'Centre logiciel', l: 'Centre logiciel : installer « PDF24 Creator » (outil PDF approuvé)', r: 'PDF24 Creator installé depuis le catalogue. Sophie peut convertir ses CV en PDF de façon sûre.', sets: ['alt_tool'], tag: 'good' }
    ],
    fixed: puaGone,
    yes: 'Oui, ça va beaucoup mieux : plus de pubs, Outlook s’ouvre normalement.',
    no: 'Non, c’est toujours aussi lent et les pubs continuent.',
    checks: [
      ['diag', 7, 'Identifier le changement récent (logiciel gratuit installé)', f => f('pua_install')],
      ['diag', 6, 'Repérer le processus qui sature le processeur', f => f('saw_proc') || f('cmd:topcpu') || f('cmd:tasklist')],
      ['diag', 4, 'Contrôler les applications installées récemment', f => f('saw_programs')],
      ['diag', 4, 'Vérifier qu’aucune information n’a été saisie dans les pubs', f => f('no_click')],
      ['res', 10, 'Désinstaller le logiciel indésirable et l’extension', puaGone],
      ['res', 6, 'Lancer une analyse antivirus complète', f => f('av_full') || f('av_scan')],
      ['res', 4, 'Proposer l’outil approuvé du Centre logiciel', f => f('alt_tool')]
    ],
    causes: [
      'Logiciel gratuit douteux (PUA/adware) installé hier : il sature le processeur et injecte des publicités',
      'Disque dur en fin de vie',
      'Mise à jour Windows en cours',
      'Pas assez de mémoire vive'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Sophie, le logiciel « PDF Convert Pro Free » installé hier était un logiciel indésirable : il saturait le processeur et affichait des publicités. Je l’ai désinstallé, l’antivirus a nettoyé les restes et je vous ai installé PDF24, l’outil validé, depuis le Centre logiciel. À l’avenir, passez par le Centre logiciel ou par nous pour tout nouveau logiciel. Bonne journée !',
      'Logiciel supprimé et analyse antivirus faite.',
      'Vous n’aviez pas le droit d’installer ce logiciel, c’est contraire à la charte informatique.'
    ],
    kw: ['pdf convert', 'desinstall', 'antivirus', 'pua', 'adware', 'processus', 'centre logiciel', 'cpu', 'processeur'],
    hints: ['Demande ce qui a changé depuis hier.', 'Prends la main et ouvre le Gestionnaire des tâches : qui consomme le processeur ?', 'Désinstalle le logiciel et l’extension, lance une analyse complète, propose l’alternative du Centre logiciel.'],
    ideal: ['Qualifier : incident, Sécurité, impact faible, urgence moyenne → P4', 'Chercher le changement récent : logiciel gratuit', 'Gestionnaire des tâches : processus qui sature le CPU', 'Désinstaller logiciel + extension, analyse antivirus complète', 'Proposer l’outil approuvé', 'Faire confirmer, sensibiliser sans culpabiliser'],
    lesson: '<p>« Mon PC est lent » a souvent une cause précise. La question <strong>« qu’est-ce qui a changé ? »</strong> fait gagner un temps énorme. Le Gestionnaire des tâches montre qui consomme le processeur et la mémoire.</p><p>Les logiciels gratuits téléchargés sur internet embarquent souvent des <strong>PUA</strong> (programmes potentiellement indésirables). On nettoie, puis on propose l’alternative validée, sans faire la leçon à l’utilisatrice.</p>',
    kb: ['poste', 'logiciels']
  });

  /* 7 ─ Phishing avec saisie des identifiants */
  S({
    id: 'phish', diff: 2, req: 'aicha', channel: 'Téléphone',
    title: 'J’ai cliqué sur un lien dans un mail du « service informatique »',
    desc: 'Bonjour, j’ai reçu un mail du « Service informatique » qui dit que ma boîte Microsoft 365 sera suspendue ce soir si je ne valide pas mon compte. J’ai cliqué sur le lien et… je crois que j’ai mis mon mot de passe. Ensuite la page s’est juste rechargée. Je vous ai transféré le mail. C’est grave ?',
    type: 'incident', cat: ['securite'], impact: 'moyen', urgency: 'haute',
    attach: {
      name: 'URGENT – Validation de votre compte.eml',
      from: 'Service Informatique <it-support@ostral-securite365.com>', to: 'aicha.diallo@ostral-bio.fr', date: 'lun. 02/11/2026 09:47', subject: '[URGENT] Votre boîte aux lettres sera suspendue aujourd’hui',
      body: '<p>Cher utilisateur,</p><p>Suite à une mise à jour de sécurité, votre compte Microsoft 365 doit être validé <strong>avant 18h00</strong>, sinon il sera suspendu définitivement et vos messages seront supprimés.</p><p><span class="fake-btn">Valider mon compte</span></p><p class="url">https://ostral-bio.login-office365-verify.com/auth/validate?id=a.diallo</p><p>Cordialement,<br>Le service informatique</p>'
    },
    ad: { users: { aicha: { signins: [['Aujourd’hui 08:31', 'Lyon, FR', 'Outlook (PC-DIR-002)', 'Réussie', false], ['Aujourd’hui 09:52', 'Lagos, NG', 'Navigateur – Chrome', 'Réussie (MFA validée)', true], ['Aujourd’hui 09:55', 'Lagos, NG', 'Exchange – création d’une règle de boîte', 'Réussie', true]], rules: [['« Sécurité » : si le message contient « virement », « RIB » ou « facture », le déplacer vers « Flux RSS » et le marquer comme lu', true]] } } },
    qs: [
      { id: 'entered', cat: 'Comprendre', q: 'Avez-vous saisi votre mot de passe sur la page ouverte par le lien ? À quelle heure ?', a: 'Oui… mon adresse et mon mot de passe. Vers 9 h 50, il y a une vingtaine de minutes.', tag: 'key', sets: ['creds_entered'] },
      { id: 'mfa', cat: 'Comprendre', q: 'Avez-vous saisi autre chose : un code reçu par SMS, une validation sur l’application ? Avez-vous téléchargé un fichier ?', a: 'Il m’a demandé le code reçu par SMS, je l’ai tapé aussi. Je n’ai rien téléchargé.', tag: 'key', sets: ['mfa_given'] },
      { id: 'colleagues', cat: 'Diagnostic', q: 'Savez-vous si des collègues ont reçu le même mail ?', a: 'Je crois que oui, M. Caron m’en a parlé ce matin, il ne l’a pas ouvert.', tag: 'good', sets: ['campaign'] },
      { id: 'report', cat: 'Procédure', q: 'Ne supprimez pas le mail : utilisez le bouton « Signaler » dans Outlook, s’il vous plaît.', a: 'D’accord, c’est fait.', tag: 'good', sets: ['reported'] },
      { id: 'blame', cat: 'Comprendre', q: 'Vous auriez dû voir que c’était une arnaque, c’est évident, non ?', a: '… Je suis désolée, j’avais peur de perdre ma boîte mail.', tag: 'bad' },
      { id: 'ignore', cat: 'Action', q: 'Ce n’est pas grave, ignorez simplement ce mail.', a: 'Ah bon ? D’accord… vous êtes sûr ?', tag: 'bad', sets: ['minimized'] },
      { id: 'g_reboot', hide: true }, { id: 'g_others', hide: true }
    ],
    fixed: f => f('ad:reset:aicha') && f('ad:revoke:aicha'),
    yes: 'Oui, je me suis reconnectée avec le mot de passe provisoire et j’en ai choisi un nouveau.',
    no: 'Je ne sais pas… vous avez fait quelque chose sur mon compte ?',
    checks: [
      ['diag', 5, 'Analyser le mail suspect (expéditeur, lien)', f => f('attach_viewed')],
      ['diag', 6, 'Savoir si des identifiants ont été saisis', f => f('creds_entered')],
      ['diag', 4, 'Savoir si le code MFA a été donné', f => f('mfa_given')],
      ['diag', 5, 'Consulter les connexions récentes du compte (connexion depuis Lagos)', f => f('cloud:view:aicha')],
      ['diag', 3, 'Évaluer l’ampleur (campagne visant d’autres collègues)', f => f('campaign')],
      ['res', 8, 'Réinitialiser le mot de passe après vérification d’identité', f => f('ad:reset:aicha') && f('identity')],
      ['res', 8, 'Révoquer toutes les sessions ouvertes', f => f('ad:revoke:aicha')],
      ['res', 4, 'Faire signaler le mail (preuve conservée)', f => f('reported')],
      ['res', 3, 'Supprimer la règle de boîte créée par l’attaquant', f => f('rule_removed')]
    ],
    pen: [[-6, 'Incident de sécurité minimisé auprès de l’utilisatrice', f => f('minimized')]],
    causes: [
      'Hameçonnage (phishing) : identifiants et code MFA saisis sur un faux site, compte compromis',
      'Simple spam sans conséquence',
      'Vraie opération de maintenance du service informatique',
      'Virus installé sur le poste'
    ],
    out: { mode: 'escalate', team: 'secu' },
    closing: [
      'Bonjour Aïcha, merci d’avoir réagi vite. Le mail était une tentative d’hameçonnage. J’ai réinitialisé votre mot de passe, déconnecté toutes les sessions ouvertes sur votre compte et supprimé une règle de messagerie suspecte. Le dossier est transmis à la cellule sécurité, qui pourra vous recontacter. Si vous voyez quelque chose d’inhabituel (mails envoyés que vous n’avez pas écrits), appelez immédiatement le 4000.',
      'Mot de passe changé. Transmis à la sécurité.',
      'Attention la prochaine fois : il ne faut jamais cliquer sur les liens. Je transmets.'
    ],
    kw: ['phishing', 'hameconnage', 'revoq', 'session', 'reinitialis', 'mfa', 'lagos', 'regle', 'securite'],
    hints: ['Ouvre la pièce jointe du ticket : regarde le domaine de l’expéditeur et l’adresse du lien.', 'Appelle Aïcha sans la culpabiliser : a-t-elle saisi son mot de passe ? un code SMS ?', 'Console cloud : regarde les connexions récentes et les règles de boîte. Vérifie son identité, réinitialise, révoque les sessions, supprime la règle, puis escalade à la cellule sécurité.'],
    ideal: ['Qualifier : incident, Sécurité, impact moyen, urgence haute → P2', 'Analyser le mail : faux domaine, urgence artificielle, lien piégé', 'Savoir ce qui a été saisi (mot de passe + code MFA)', 'Console cloud : connexion depuis Lagos et règle de boîte suspecte', 'Vérifier l’identité, réinitialiser, révoquer les sessions, supprimer la règle', 'Faire signaler le mail, escalader à la cellule sécurité avec les éléments'],
    lesson: '<p>Quand quelqu’un a saisi ses identifiants sur un faux site, <strong>chaque minute compte</strong> : réinitialiser le mot de passe ne suffit pas si l’attaquant a déjà une session ouverte. Il faut aussi <strong>révoquer les sessions</strong> et vérifier ce qu’il a pu faire (règles de transfert, mails envoyés).</p><p>On remercie l’utilisatrice d’avoir signalé vite. La culpabiliser, c’est la garantie qu’elle ne signalera pas la prochaine fois.</p>',
    kb: ['phishing', 'escalade', 'identite']
  });

  /* 8 ─ Arrivée d'un secrétaire médical */
  S({
    id: 'onboard', diff: 2, req: 'marc', channel: 'Portail',
    title: 'Arrivée d’Hugo Lambert, secrétaire médical à Villeurbanne',
    desc: 'Demande d’arrivée : Hugo Lambert rejoint le secrétariat du site de Villeurbanne le lundi 9 novembre comme secrétaire médical. Merci de préparer : compte Windows et messagerie, accès au dossier partagé des secrétariats et au SIL (module accueil). Pas de VPN, il sera sur place. Le poste d’accueil PC-VIL-015 est déjà installé. Merci ! – Marc Delorme, responsable des secrétariats',
    type: 'demande', cat: ['acces'], impact: 'faible', urgency: 'basse',
    remote: 'Aucune prise en main nécessaire : le poste PC-VIL-015 est déjà installé. Travaille dans l’Active Directory.',
    qs: [
      { id: 'details', cat: 'Comprendre', q: 'Pouvez-vous me confirmer la date d’arrivée et la fonction exacte d’Hugo ?', a: 'Lundi 9 novembre, secrétaire médical au site de Villeurbanne, rattaché à moi.', tag: 'good', sets: ['details'] },
      { id: 'same', cat: 'Comprendre', q: 'Doit-il avoir les mêmes droits que vous ?', a: 'Surtout pas, il n’a pas à voir les plannings ni le suivi RH. Les mêmes droits qu’Inès Garnier, la secrétaire de Villeurbanne, ça suffit.', tag: 'key', sets: ['rights_scope'] },
      { id: 'license', cat: 'Procédure', q: 'L’accès au SIL consomme une licence : avez-vous l’accord pour une licence de plus ?', a: 'Oui, c’est prévu dans le budget de l’embauche, validé par la direction.', tag: 'good', sets: ['license_ok'] },
      { id: 'pwdhand', cat: 'Procédure', q: 'Comment souhaitez-vous qu’on remette son mot de passe provisoire à Hugo ?', a: 'Le mieux est que le support l’appelle lundi à 8 h 30 sur le poste d’accueil, je serai avec lui.', tag: 'good', sets: ['handover'] },
      { id: 'g_consent', hide: true }, { id: 'g_reboot', hide: true }, { id: 'g_others', hide: true }, { id: 'g_error', hide: true }, { id: 'g_identity', hide: true }, { id: 'g_callback', hide: true }
    ],
    fixed: f => f.re(/^ad:create:hugo\.lambert$/),
    yes: 'Parfait, merci. On vous appelle lundi à 8 h 30 alors.',
    no: 'Le compte n’est pas encore créé, si ?',
    checks: [
      ['diag', 5, 'Confirmer la fonction et la date d’arrivée', f => f('details')],
      ['diag', 7, 'Définir le périmètre de droits (comme Inès, pas comme le manager)', f => f('rights_scope')],
      ['diag', 4, 'Vérifier qu’aucun compte hugo.lambert n’existe déjà (recherche AD)', f => f.re(/^ad:search:.*(hugo|lambert)/)],
      ['diag', 4, 'Valider la licence SIL', f => f('license_ok')],
      ['res', 8, 'Créer le compte avec l’identifiant hugo.lambert', (f, c) => !!c.created['hugo.lambert']],
      ['res', 4, 'Placer le compte dans l’OU Secretariat', (f, c) => c.created['hugo.lambert'] && c.created['hugo.lambert'].ou === 'Secretariat'],
      ['res', 8, 'Donner les groupes nécessaires (GG_Tous, GG_Secretariat, GG_SIL_Accueil)', (f, c) => { const u = c.created['hugo.lambert']; return u && ['GG_Tous', 'GG_Secretariat', 'GG_SIL_Accueil'].every(g => u.groups.includes(g)); }],
      ['res', 3, 'Mot de passe provisoire à changer à la première connexion', (f, c) => c.created['hugo.lambert'] && c.created['hugo.lambert'].mustChange],
      ['res', 2, 'Prévoir la remise du mot de passe à l’oral', f => f('handover')]
    ],
    pen: [
      [-6, 'Droits excessifs : GG_Secretariat_Responsables (réservé aux responsables)', (f, c) => c.created['hugo.lambert'] && c.created['hugo.lambert'].groups.includes('GG_Secretariat_Responsables')],
      [-10, 'Accès à la validation biologique donné à un secrétaire (GG_SIL_Biologiste)', (f, c) => c.created['hugo.lambert'] && c.created['hugo.lambert'].groups.includes('GG_SIL_Biologiste'), true],
      [-2, 'Accès VPN non demandé', (f, c) => c.created['hugo.lambert'] && c.created['hugo.lambert'].groups.includes('GG_VPN_Users')],
      [-3, 'Identifiant hors convention (prenom.nom attendu)', (f, c) => Object.keys(c.created).some(k => k !== 'hugo.lambert' && /hugo|lambert/.test(k))]
    ],
    causes: [
      'Demande d’arrivée : créer le compte avec les seuls droits du poste (secrétariat + SIL accueil), validée par le manager',
      'Incident : le compte d’Hugo est verrouillé',
      'Demande d’accès VPN pour un nomade',
      'Copie complète des droits du responsable des secrétariats'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Marc, le compte d’Hugo Lambert est prêt : identifiant hugo.lambert, adresse hugo.lambert@ostral-bio.fr, accès au dossier des secrétariats et au SIL (module accueil). Nous appellerons Hugo lundi à 8 h 30 sur le poste d’accueil pour lui donner son mot de passe provisoire, qu’il devra changer à la première connexion. Bonne intégration à Hugo !',
      'Compte créé. Ticket résolu.',
      'Compte créé : hugo.lambert, mot de passe Bienvenue2026! – transmettez-le-lui.'
    ],
    kw: ['hugo.lambert', 'secretariat', 'sil', 'gg_', 'provisoire', 'ou'],
    hints: ['C’est une demande, pas un incident. Appelle Marc pour préciser le périmètre de droits.', 'Avant de créer, cherche « lambert » dans l’AD pour éviter un doublon.', 'Clic droit sur l’OU Secretariat > Nouveau > Utilisateur. Prends Inès comme modèle de droits, pas Marc. Mot de passe provisoire à changer.'],
    ideal: ['Qualifier : demande, Comptes & accès, impact faible, urgence basse → P4', 'Valider le besoin et le périmètre avec le manager', 'Chercher un éventuel homonyme dans l’AD', 'Créer hugo.lambert dans l’OU Secretariat', 'Groupes strictement nécessaires : GG_Tous, GG_Secretariat, GG_SIL_Accueil', 'Mot de passe provisoire à changer, remise à l’oral prévue', 'Documenter et clôturer'],
    lesson: '<p>Le principe du <strong>moindre privilège</strong> : on donne les droits du poste, pas ceux du manager. Dans un laboratoire, donner par erreur la validation biologique à un secrétaire est une faute grave : c’est l’accès qui permet de libérer des résultats patients.</p><p>« Copier les droits d’un collègue » est pratique, à condition de choisir le bon collègue et de relire la liste.</p>',
    kb: ['arrivee', 'droits', 'ad']
  });

  /* 9 ─ Accès refusé à un dossier qualité */
  const shareOk = f => {
    const add = f.seq('ad:group+:elodie:GG_Qualite_Accreditation_RW');
    return add > 0 && (f.seq('relogon') > add || f.seq('cmd:klistpurge') > add);
  };
  S({
    id: 'share', diff: 2, req: 'elodie', channel: 'E-mail',
    title: 'Accès refusé au dossier Accreditation2027',
    desc: 'Bonjour, j’ai « Accès refusé » quand j’essaie d’ouvrir \\\\srv-fic-01\\Qualite\\Accreditation2027 pour mettre à jour les procédures avant l’audit COFRAC. Ma responsable Claire Vasseur est d’accord, elle est en copie. Ma collègue y a accès, elle. Merci ! Élodie',
    type: 'demande', cat: ['acces'], impact: 'faible', urgency: 'moyenne',
    machine: f => ({ tokenGroups: (f.seq('relogon') > f.seq('ad:group+:elodie:GG_Qualite_Accreditation_RW') && f('ad:group+:elodie:GG_Qualite_Accreditation_RW')) ? ['GG_Tous', 'GG_Qualite_Lecture', 'GG_Qualite_Accreditation_RW'] : ['GG_Tous', 'GG_Qualite_Lecture'] }),
    cmd: (line, f) => /accreditation2027/i.test(line) && /^(dir|ls|cd|start|explorer|get-childitem|gci)\b/i.test(line.trim()) ? (shareOk(f) ? ' Répertoire de \\\\srv-fic-01\\Qualite\\Accreditation2027\n\n28/10/2026  14:02    <DIR>          Procedures\n30/10/2026  09:15    <DIR>          Enregistrements\n31/10/2026  16:40            84 112 Planning_audit.xlsx' : 'Accès refusé.') : null,
    qs: [
      { id: 'before', cat: 'Comprendre', q: 'Aviez-vous déjà accès à ce dossier auparavant ?', a: 'Non, c’est nouveau : avant, c’est Claire qui gérait toute l’accréditation.', tag: 'key', sets: ['never_had'] },
      { id: 'read', cat: 'Diagnostic', q: 'Arrivez-vous à ouvrir les autres dossiers du partage Qualite ?', a: 'Oui, je peux lire les autres dossiers, mais pas modifier.', tag: 'good', sets: ['read_ok'] },
      { id: 'approval', cat: 'Procédure', q: 'Claire Vasseur peut-elle confirmer son accord par écrit dans le ticket ?', a: 'Je lui demande… voilà, elle vient de répondre.', tag: 'key', sets: ['approval'], third: ['Claire Vasseur (responsable qualité)', 'Je confirme : Élodie doit pouvoir modifier le dossier Accreditation2027 pour préparer l’audit. – Claire Vasseur'] },
      { id: 'relog', cat: 'Action', q: 'Pouvez-vous fermer votre session Windows puis la rouvrir ?', a: 'C’est fait, je suis reconnectée.', tag: 'good', sets: ['relogon'] },
      { id: 'g_others', a: 'Claire y a accès, oui.', tag: 'neutral' },
      { id: 'g_error', a: '« Vous n’avez pas l’autorisation d’accéder à ce dossier. Contactez votre administrateur réseau. »', tag: 'good' }
    ],
    noIdCheck: true,
    fixed: shareOk,
    yes: 'Ça marche : j’ouvre le dossier et je peux modifier les procédures. Merci !',
    no: f => f('ad:group+:elodie:GG_Qualite_Accreditation_RW') ? 'Toujours « Accès refusé »… vous êtes sûr que c’est fait ?' : 'Toujours « Accès refusé ».',
    checks: [
      ['diag', 6, 'Établir qu’il s’agit d’un nouveau droit (demande, pas panne)', f => f('never_had')],
      ['diag', 4, 'Vérifier ce qu’elle peut faire (lecture seule)', f => f('read_ok')],
      ['diag', 5, 'Consulter ses groupes dans l’AD', f => f('ad:view:elodie')],
      ['res', 8, 'Obtenir l’accord écrit du responsable AVANT d’ajouter le droit', f => f('approval') && f.seq('approval') < (f.seq('ad:group+:elodie:GG_Qualite_Accreditation_RW') || 1e9)],
      ['res', 8, 'Ajouter le bon groupe (GG_Qualite_Accreditation_RW)', f => f('ad:group+:elodie:GG_Qualite_Accreditation_RW')],
      ['res', 4, 'Faire rafraîchir le jeton (fermer/rouvrir la session ou klist purge)', shareOk]
    ],
    pen: [
      [-6, 'Droit ajouté sans accord écrit du responsable', f => f('ad:group+:elodie:GG_Qualite_Accreditation_RW') && (!f('approval') || f.seq('approval') > f.seq('ad:group+:elodie:GG_Qualite_Accreditation_RW'))],
      [-3, 'Groupe non demandé ajouté', f => f.re(/^ad:group\+:elodie:(?!GG_Qualite_Accreditation_RW)/)]
    ],
    causes: [
      'Élodie n’est pas membre du groupe GG_Qualite_Accreditation_RW (droit jamais attribué)',
      'Serveur srv-fic-01 en panne',
      'Compte d’Élodie verrouillé',
      'Dossier supprimé par erreur'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Élodie, avec l’accord écrit de Claire, je vous ai ajoutée au groupe qui donne le droit de modification sur le dossier Accreditation2027. Après avoir fermé et rouvert votre session, l’accès fonctionne. Bon courage pour l’audit !',
      'Ajoutée au groupe RW.',
      'C’est fait. Vous auriez dû demander à Claire avant de nous écrire.'
    ],
    kw: ['gg_qualite_accreditation_rw', 'groupe', 'accord', 'claire', 'session', 'jeton'],
    hints: ['Avait-elle déjà accès ? Si non, ce n’est pas une panne mais une demande de droit.', 'Un « je suis d’accord » en copie ne suffit pas : fais confirmer Claire par écrit dans le ticket, puis ajoute le bon groupe dans l’onglet « Membre de ».', 'Les groupes sont lus à l’ouverture de session : fais fermer et rouvrir la session (ou klist purge sur son poste).'],
    ideal: ['Qualifier : demande, Comptes & accès, impact faible, urgence moyenne → P4', 'Comprendre que le droit n’a jamais existé', 'Obtenir l’accord écrit du responsable du dossier', 'Ajouter GG_Qualite_Accreditation_RW, rien de plus', 'Faire rouvrir la session pour rafraîchir les groupes', 'Faire tester, documenter'],
    lesson: '<p>Un « accès refusé » n’est pas toujours une panne : si l’utilisatrice n’a <strong>jamais eu</strong> le droit, c’est une <strong>demande d’accès</strong>, qui exige l’accord du propriétaire des données.</p><p>Après un ajout de groupe, Windows ne voit le nouveau droit qu’à la <strong>prochaine ouverture de session</strong> : le jeton d’accès est calculé à la connexion.</p>',
    kb: ['droits', 'ad']
  });

  /* 10 ─ Deuxième écran sans signal */
  S({
    id: 'screen', diff: 1, req: 'karim', channel: 'Chat',
    title: 'Mon deuxième écran affiche « Pas de signal »',
    desc: 'Bonjour, mon deuxième écran est tout noir avec « Pas de signal », puis il se met en veille. Le premier écran marche. Je travaille quand même mais pour l’accueil des patients c’est pas pratique, j’ai le SIL et l’agenda sur deux écrans d’habitude. Personne n’a rien touché, promis !',
    type: 'incident', cat: ['materiel'], impact: 'faible', urgency: 'moyenne',
    qs: [
      { id: 'power', cat: 'Diagnostic', q: 'L’écran est-il allumé ? De quelle couleur est son voyant ?', a: 'Oui, le voyant est orange, puis il passe en veille.', tag: 'good', sets: ['power_ok'] },
      { id: 'g_change', a: 'Non… enfin, le ménage a été fait ce week-end, ils ont peut-être poussé le PC.', tag: 'good', sets: ['moved'] },
      { id: 'cable', cat: 'Action', q: 'Pouvez-vous vérifier que le câble de l’écran est bien enfoncé des deux côtés, écran et PC ?', a: 'Côté écran c’est bon… côté PC, ah ! Il était à moitié sorti. Je le renfonce… l’écran affiche quelque chose ! Mais il montre la même chose que l’autre.', tag: 'key', sets: ['cable_ok'] },
      { id: 'source', cat: 'Diagnostic', q: 'Sur l’écran, la source d’entrée (HDMI/DisplayPort) est-elle la bonne ?', a: f => f('cable_ok') ? 'L’image est là maintenant.' : 'Il y a un bouton « Input », il dit DisplayPort, c’est bien le câble branché.', tag: 'good' },
      { id: 'winp', cat: 'Action', q: 'Appuyez sur les touches Windows + P et choisissez « Étendre ».', a: f => f('cable_ok') ? 'Voilà ! J’ai mes deux écrans séparés, comme avant.' : 'Il me propose « Étendre », je clique… mais l’écran 2 reste noir.', tag: 'good', sets: f => f('cable_ok') ? ['extended'] : [] },
      { id: 'g_reboot', a: 'Non, pas encore.', tag: 'neutral' }
    ],
    acts: [
      { id: 'display', g: 'Paramètres', l: 'Paramètres > Affichage : détecter les écrans', r: f => f('cable_ok') ? (f('extended') ? '2 écrans détectés, mode « Étendre ».' : '2 écrans détectés, mode « Dupliquer ».') : '1 seul écran détecté (DELL P2422H). Bouton « Détecter » : aucun autre écran trouvé.', sets: ['display_checked'], tag: 'key' },
      { id: 'extend', g: 'Paramètres', l: 'Paramètres > Affichage : passer en « Étendre ces affichages »', r: f => f('cable_ok') ? 'Mode « Étendre » appliqué.' : 'Impossible : un seul écran est détecté.', sets: f => f('cable_ok') ? ['extended'] : [], tag: 'good' },
      { id: 'gpu', g: 'Système', l: 'Mettre à jour le pilote graphique', r: 'Pilote Intel UHD Graphics déjà à jour.', sets: ['gpu_driver'], tag: 'neutral' }
    ],
    site: [
      { id: 'look', g: 'Constat', l: 'Inspecter l’arrière du PC et les câbles', r: 'Le câble DisplayPort de l’écran 2 est à moitié sorti de son port à l’arrière du PC. Le câble d’alimentation de l’écran est bien branché.', sets: ['site_look'], tag: 'key' },
      { id: 'plug', g: 'Action', l: 'Renfoncer le câble DisplayPort jusqu’au clic', r: 'L’écran 2 affiche une image (mode « Dupliquer »).', sets: ['cable_ok'], tag: 'key' },
      { id: 'tidy', g: 'Action', l: 'Ranger et attacher les câbles (serre-câble)', r: 'Câbles regroupés et attachés au pied du bureau : ils ne seront plus arrachés au prochain ménage.', sets: ['tidy'], tag: 'good' }
    ],
    fixed: f => f('cable_ok') && f('extended'),
    yes: 'Parfait, mes deux écrans marchent comme avant. Merci !',
    no: f => f('cable_ok') ? 'L’écran marche, mais il affiche la même chose que l’autre.' : 'Non, toujours « Pas de signal ».',
    checks: [
      ['diag', 5, 'Vérifier l’alimentation de l’écran', f => f('power_ok') || f('site_look')],
      ['diag', 3, 'Chercher un changement récent (ménage, déplacement)', f => f('moved')],
      ['diag', 5, 'Vérifier ce que Windows détecte', f => f('display_checked')],
      ['res', 12, 'Faire rebrancher correctement le câble vidéo', f => f('cable_ok')],
      ['res', 8, 'Remettre le mode d’affichage « Étendre »', f => f('extended')]
    ],
    causes: [
      'Câble vidéo à moitié débranché côté PC, puis mode d’affichage à remettre sur « Étendre »',
      'Écran en panne',
      'Carte graphique défectueuse',
      'Pilote graphique obsolète'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Karim, le câble de votre second écran s’était à moitié débranché derrière le PC (sans doute pendant le ménage). Une fois rebranché, j’ai remis l’affichage en mode « Étendre » : vos deux écrans fonctionnent comme avant. Astuce : Windows + P permet de changer ce mode. Bonne journée !',
      'Câble rebranché.',
      'Il fallait juste vérifier le câble avant d’appeler.'
    ],
    kw: ['cable', 'etendre', 'win+p', 'ecran', 'debranch', 'displayport'],
    hints: ['« Personne n’a rien touché » : vérifie quand même les câbles, des deux côtés.', 'Une fois l’image revenue, regarde le mode d’affichage : Dupliquer ou Étendre ?'],
    ideal: ['Qualifier : incident, Matériel, impact faible, urgence moyenne → P4', 'Écran alimenté ? câble bien enfoncé des deux côtés ?', 'Rebrancher le câble', 'Remettre le mode « Étendre »', 'Faire confirmer, donner l’astuce Windows + P'],
    lesson: '<p>« Pas de signal » signifie que l’écran fonctionne mais ne reçoit rien : la cause est presque toujours le <strong>câble</strong> ou la <strong>source d’entrée</strong>, très rarement la carte graphique.</p><p>Même quand « personne n’a rien touché », on vérifie les branchements, gentiment, sans accuser.</p>',
    kb: ['poste', 'methode']
  });

  /* 11 ─ Installer un visionneur DWG */
  S({
    id: 'dwg', diff: 1, req: 'thomas', channel: 'Portail',
    title: 'Besoin d’un logiciel pour ouvrir des plans .dwg',
    desc: 'Bonjour, l’architecte m’envoie les plans du futur plateau technique au format .dwg. J’ai trouvé « DWG Viewer Pro » sur un site, mais Windows me demande un mot de passe administrateur. Vous pouvez me le donner ou l’installer vous-même ? Merci, Thomas',
    type: 'demande', cat: ['logiciel'], impact: 'faible', urgency: 'basse',
    qs: [
      { id: 'need', cat: 'Comprendre', q: 'Avez-vous seulement besoin de consulter les plans, ou aussi de les modifier ?', a: 'Juste les consulter et les imprimer pour les réunions de chantier.', tag: 'key', sets: ['need_view'] },
      { id: 'source', cat: 'Diagnostic', q: 'D’où vient le logiciel que vous avez téléchargé ?', a: 'D’un site trouvé sur Google, « dwg-viewer-free-download.net ».', tag: 'good', sets: ['source_bad'] },
      { id: 'catalog', cat: 'Procédure', q: 'Connaissez-vous le Centre logiciel, dans le menu Démarrer ?', a: 'Le quoi ? Non, je ne connais pas.', tag: 'good', sets: ['catalog_asked'] },
      { id: 'giveadmin', cat: 'Action', q: 'Le mot de passe admin local est « Adm1n-Poste! », vous pouvez l’utiliser.', a: 'Super, merci ! Je l’installe tout de suite.', tag: 'bad', sets: ['admin_given'] }
    ],
    acts: [
      { id: 'search', g: 'Centre logiciel', l: 'Centre logiciel : rechercher « DWG »', r: 'Résultat : « Autodesk DWG TrueView 2026 » – approuvé, gratuit, installation sans droits administrateur.', sets: ['catalog_found'], tag: 'key' },
      { id: 'install', g: 'Centre logiciel', l: 'Centre logiciel : installer DWG TrueView 2026', r: 'Installation terminée (4 min). Les fichiers .dwg s’ouvrent maintenant avec DWG TrueView.', sets: ['installed_ok'], tag: 'key' },
      { id: 'installbad', g: 'Téléchargements', l: 'Installer « DWG Viewer Pro » téléchargé par l’utilisateur, avec ton compte admin', r: 'Installation réalisée. Quelques secondes plus tard, l’antivirus signale « PUA:Win32/Bundler » et une barre d’outils apparaît dans le navigateur.', sets: ['installed_bad'], tag: 'bad' },
      { id: 'clean', g: 'Téléchargements', l: 'Supprimer l’installeur téléchargé (dwgviewerpro_setup.exe)', r: 'Fichier supprimé des Téléchargements.', sets: ['cleaned'], tag: 'good' }
    ],
    fixed: f => f('installed_ok'),
    yes: 'Ça marche, j’ouvre et j’imprime les plans. Merci !',
    no: 'Non, je ne peux toujours pas ouvrir les .dwg.',
    checks: [
      ['diag', 5, 'Comprendre le besoin réel (consulter, pas modifier)', f => f('need_view')],
      ['diag', 5, 'Vérifier la provenance du logiciel téléchargé', f => f('source_bad')],
      ['diag', 8, 'Chercher une solution approuvée dans le Centre logiciel', f => f('catalog_found')],
      ['res', 12, 'Installer le visionneur approuvé', f => f('installed_ok')],
      ['res', 4, 'Supprimer l’installeur douteux', f => f('cleaned')],
      ['res', 4, 'Faire connaître le Centre logiciel', f => f('catalog_asked')]
    ],
    pen: [
      [-12, 'Mot de passe administrateur communiqué à un utilisateur', f => f('admin_given'), true],
      [-8, 'Installation d’un logiciel non approuvé', f => f('installed_bad')]
    ],
    causes: [
      'Besoin de lire des .dwg : un visionneur approuvé existe dans le Centre logiciel, sans droit admin',
      'Il faut donner les droits administrateur à Thomas',
      'Le fichier de l’architecte est corrompu',
      'Il faut acheter une licence AutoCAD complète'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Bonjour Thomas, je vous ai installé DWG TrueView, le visionneur gratuit approuvé, depuis le Centre logiciel : vous pouvez ouvrir et imprimer les plans. J’ai supprimé l’installeur téléchargé, qui n’était pas sûr. À l’avenir, cherchez d’abord dans le Centre logiciel (menu Démarrer) : la plupart des outils y sont. Bonne journée !',
      'TrueView installé.',
      'Installer des logiciels est interdit, voyez la charte informatique.'
    ],
    kw: ['centre logiciel', 'trueview', 'catalogue', 'admin', 'dwg'],
    hints: ['Le mot de passe admin ne se donne jamais. Cherche d’abord le vrai besoin.', 'Prends la main et cherche « DWG » dans le Centre logiciel.'],
    ideal: ['Qualifier : demande, Logiciels, impact faible, urgence basse → P4', 'Comprendre le besoin : consulter et imprimer', 'Chercher dans le catalogue approuvé', 'Installer DWG TrueView via le Centre logiciel', 'Supprimer l’installeur douteux, expliquer le Centre logiciel'],
    lesson: '<p>Les utilisateurs n’ont pas de droits administrateur, et c’est voulu : c’est ce qui empêche la plupart des logiciels malveillants de s’installer. Le support ne contourne pas cette règle, il trouve la <strong>solution approuvée</strong>.</p><p>Commencer par le besoin (« lire des plans ») plutôt que par la solution demandée (« donnez-moi le mot de passe admin »).</p>',
    kb: ['logiciels']
  });

  /* 12 ─ Teams : personne ne m'entend (VIP) */
  S({
    id: 'teams', diff: 2, req: 'antoine', channel: 'Téléphone',
    title: 'Personne ne m’entend dans Teams, réunion dans 10 minutes',
    desc: 'Je suis en visio Teams avec la banque dans 10 minutes et personne ne m’entend ! J’ai branché mon nouveau casque Jabra ce matin. Faites vite, s’il vous plaît.',
    type: 'incident', cat: ['messagerie', 'logiciel'], impact: 'faible', urgency: 'haute',
    qs: [
      { id: 'headset', cat: 'Diagnostic', q: 'Le casque est-il bien branché et son voyant allumé ?', a: 'Oui, branché en USB sur la station d’accueil, le voyant est blanc.', tag: 'good', sets: ['headset_ok'] },
      { id: 'sound', cat: 'Diagnostic', q: 'Entendez-vous le son dans le casque, une vidéo par exemple ?', a: 'Oui, j’entends bien une vidéo dans le casque.', tag: 'good', sets: ['audio_out_ok'] },
      { id: 'mute', cat: 'Diagnostic', q: 'Le micro est-il coupé, dans Teams ou sur le casque ?', a: 'Le micro n’est pas barré dans Teams, et le casque n’a pas de voyant rouge.', tag: 'good', sets: ['not_muted'] },
      { id: 'testcall', cat: 'Diagnostic', q: 'Pouvez-vous passer un appel test dans Teams (Paramètres > Périphériques > Passer un appel test) ?', a: f => f('mic_fixed') ? 'Le test me renvoie bien ma voix, parfait !' : 'Il dit « Nous n’avons détecté aucun son provenant de votre micro ».', tag: 'key', sets: f => f('mic_fixed') ? ['testcall_ok'] : ['testcall_fail'] },
      { id: 'g_consent', a: 'Oui oui, allez-y, vite !' },
      { id: 'g_reboot', a: 'Je n’ai pas le temps de redémarrer !', tag: 'neutral' }
    ],
    acts: [
      { id: 'devices', g: 'Teams', l: 'Teams : Paramètres > Périphériques', r: f => f('mic_fixed') ? 'Haut-parleur : Jabra Evolve2 40\nMicro : Jabra Evolve2 40' : 'Haut-parleur : Jabra Evolve2 40\nMicro : Réseau de microphones (Realtek) – micro intégré du portable\n(le portable est sur la station d’accueil, écran rabattu)', sets: ['saw_devices'], tag: 'key' },
      { id: 'select', g: 'Teams', l: 'Teams : choisir « Jabra Evolve2 40 » comme micro', r: 'Micro réglé sur Jabra Evolve2 40. La jauge bouge quand Antoine parle.', sets: ['mic_fixed'], tag: 'key' },
      { id: 'privacy', g: 'Paramètres', l: 'Windows : vérifier l’autorisation d’accès au micro', r: 'Accès au microphone : activé pour les applications de bureau, dont Teams.', sets: ['privacy_checked'], tag: 'good' },
      { id: 'reinstall', g: 'Applications', l: 'Désinstaller et réinstaller Teams', r: 'Réinstallation en cours (15 min)… Antoine rate le début de sa réunion.', sets: ['teams_reinstall'], tag: 'bad' }
    ],
    fixed: f => f('mic_fixed'),
    yes: 'On m’entend, la réunion commence. Merci !',
    no: 'Non, toujours rien côté micro.',
    checks: [
      ['diag', 4, 'Vérifier que le son sort bien dans le casque', f => f('audio_out_ok')],
      ['diag', 4, 'Vérifier que le micro n’est pas coupé', f => f('not_muted')],
      ['diag', 8, 'Contrôler les périphériques sélectionnés dans Teams', f => f('saw_devices')],
      ['diag', 4, 'Utiliser l’appel test', f => f('testcall_fail') || f('testcall_ok')],
      ['res', 14, 'Sélectionner le micro du casque', f => f('mic_fixed')],
      ['res', 6, 'Valider avec un appel test après correction', f => f('testcall_ok')]
    ],
    pen: [
      [-5, 'Réinstallation longue alors que la réunion commence', f => f('teams_reinstall')],
      [-2, 'Redémarrage en pleine urgence : 3 minutes perdues', f => f('reboot')]
    ],
    causes: [
      'Teams utilise le micro intégré du portable (écran rabattu) au lieu du micro du nouveau casque',
      'Casque défectueux',
      'Teams doit être réinstallé',
      'Panne des serveurs Teams'
    ],
    out: { mode: 'resolve' },
    closing: [
      'Monsieur Caron, Teams utilisait le micro intégré de votre portable, inaudible écran rabattu, au lieu de celui de votre nouveau casque. J’ai sélectionné le Jabra comme micro et l’appel test est concluant. Bonne réunion !',
      'Micro changé dans Teams.',
      'Votre casque n’était pas configuré, il fallait regarder les paramètres.'
    ],
    kw: ['micro', 'jabra', 'peripherique', 'teams', 'appel test'],
    hints: ['Membre du comité de direction : pense à la règle VIP pour la priorité.', 'Le son sort mais le micro ne capte rien : quel micro Teams utilise-t-il ?', 'Prends la main : Teams > Paramètres > Périphériques.'],
    ideal: ['Qualifier : incident, impact faible, urgence haute → P3, relevé à P2 (VIP)', 'Vérifications rapides : son, micro coupé, appel test', 'Prise en main : Teams utilise le micro intégré', 'Sélectionner le micro du casque, appel test', 'Clôturer vite et clairement'],
    lesson: '<p>Sous pression, on garde la méthode mais on choisit les tests les plus rapides. Un nouveau casque, c’est un <strong>nouveau périphérique</strong> : les applications ne le sélectionnent pas toujours automatiquement.</p><p>La règle <strong>VIP</strong> relève la priorité d’un niveau pour le comité de direction : c’est une règle de l’entreprise, pas un passe-droit improvisé.</p>',
    kb: ['teams', 'priorite']
  });
})();
