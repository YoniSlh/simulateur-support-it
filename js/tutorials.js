/* DeskSim — mode tutoriel : pour chaque scénario, les étapes dans l'ordre, comment les faire et pourquoi.
   Étape : [titre, comment faire, pourquoi, terminé (drapeau ou fonction), application à ouvrir] */
(function () {
  const has = x => (typeof x === 'function' ? x : f => f(x));
  const ID = (who) => ['Vérifie son identité', 'Softphone › Procédure › « Pour votre sécurité, pouvez-vous me donner votre matricule ? ». ' + (who || 'La personne') + ' annonce son matricule. Clique « Ouvrir l’AD » dans le Softphone : onglet Général › Matricule. S’ils sont identiques, clique « Conforme », sinon « Non conforme ».', 'Avant toute action sur un compte, on s’assure de parler à la bonne personne. N’importe qui peut appeler en se faisant passer pour un collègue.', 'identity', 'phone'];
  const CONNECT = ['Demande l’accord, puis prends la main', 'Softphone › Procédure › « Puis-je prendre la main à distance sur votre poste pour regarder ? ». Ensuite, ouvre Assistance à distance et clique « Se connecter » (le nom du poste est déjà rempli).', 'On ne prend jamais la main sans prévenir : l’utilisateur voit sa souris bouger et peut avoir des informations confidentielles à l’écran.', f => f('remote:connect'), 'remote'];
  const Q = (title, quote, why, flag) => [title, 'Softphone › « ' + quote + ' »', why, flag, 'phone'];
  const RA = (title, action, why, flag) => [title, 'Assistance à distance › onglet « Écran et actions » › « ' + action + ' ».', why, flag, 'remote'];
  const spoolCleared = f => f('queue_cleared') || f('svcrestart:spooler') || (f.seq('svcstop:spooler') && f.seq('svcstart:spooler') > f.seq('svcstop:spooler'));
  const shareOk = f => { const a = f.seq('ad:group+:elodie:GG_Qualite_Accreditation_RW'); return a > 0 && (f.seq('relogon') > a || f.seq('cmd:klistpurge') > a); };
  const labelsOk = f => f('roll_ok') && f.seq('calibrated') > f.seq('roll_ok');
  const lxFreed = f => f('lx:truncate:debug') || f('lx:rm:debug');
  const lxPhp = f => lxFreed(f) && Math.max(f.seq('lx:restart:php8.2-fpm'), f.seq('lx:start:php8.2-fpm')) > Math.max(f.seq('lx:truncate:debug'), f.seq('lx:rm:debug'));

  DS.tutos = {
    lock: {
      note: 'Compte verrouillé après 5 saisies erronées au retour de congés (mot de passe oublié). Identité vérifiée (matricule OS-10482 conforme). Compte déverrouillé et mot de passe provisoire donné à l’oral, changement obligatoire à la connexion. Connexion testée avec l’utilisatrice.',
      steps: [
        Q('Fais lire le message d’erreur exact', 'Avez-vous un message d’erreur ? Pouvez-vous me le lire exactement ?', 'Le message dit « verrouillé » : ce n’est ni un mot de passe expiré, ni un compte désactivé. Lire le message exact évite de partir dans la mauvaise direction.', 'q:g_error'),
        Q('Demande si elle connaît encore son mot de passe', 'Vous souvenez-vous de votre mot de passe actuel ?', 'Si elle s’en souvient, déverrouiller suffit. Si elle l’a oublié, il faudra aussi le réinitialiser.', 'forgot'),
        ID('Camille'),
        ['Ouvre sa fiche dans l’Active Directory', 'Utilisateurs et ordinateurs AD › dossier Utilisateurs › Facturation › clique sur Camille Roussel. La colonne État affiche « Verrouillé ».', 'L’AD confirme le diagnostic : 5 échecs d’authentification, compte verrouillé.', 'ad:view:camille', 'ad'],
        ['Déverrouille le compte', 'Sélectionne Camille › bouton « Propriétés » › onglet Compte › coche « Déverrouiller le compte » › OK.', 'Le verrouillage se lève tout seul après 30 minutes, mais elle doit saisir ses factures avant midi.', 'ad:unlock:camille', 'ad'],
        ['Réinitialise son mot de passe', 'Sélectionne Camille › « Réinitialiser le mot de passe… » › tape deux fois un mot de passe provisoire conforme (exemple : Facturation#2611) › laisse cochée « L’utilisateur doit changer le mot de passe… » › OK. Donne-le-lui à l’oral.', 'Elle a oublié son mot de passe. Le provisoire se donne à l’oral, jamais par mail, et elle doit le changer pour que toi seule ne le connaisses pas.', f => f('ad:reset:camille') && !f('ad:reset_nochange:camille'), 'ad']
      ]
    },
    mailbox: {
      note: 'Boîte aux lettres pleine (49,9 Go sur 50 Go), dont 21,6 Go d’éléments supprimés jamais vidés. Avec l’accord de l’utilisateur : dossier Éléments supprimés vidé (28,3 Go utilisés) et archivage en ligne activé. Réception vérifiée avec Thomas.',
      steps: [
        Q('Fais lire le bandeau jaune d’Outlook', 'Avez-vous un message d’erreur ? Pouvez-vous me le lire exactement ?', 'Le bandeau dit « boîte pleine » : la cause est donnée par le message lui-même.', 'banner'),
        ['Mesure l’occupation de la boîte', 'Console cloud › clique sur Thomas Lefebvre › section Boîte aux lettres : 49,9 Go sur 50 Go.', 'On mesure avant d’agir : ça confirme le diagnostic et chiffre le problème.', f => f('cloud:view:thomas') || f('mbx_sizes'), 'cloud'],
        Q('Cherche ce qui remplit la boîte', 'Videz-vous de temps en temps le dossier « Éléments supprimés » ?', 'Les éléments supprimés comptent dans le quota tant qu’on ne vide pas le dossier.', 'deleted_info'),
        Q('Demande son accord avant de supprimer', 'Je vous propose de vider le dossier « Éléments supprimés »… Êtes-vous d’accord ?', 'On ne supprime jamais les données de quelqu’un sans son accord.', 'ok_empty'),
        CONNECT,
        RA('Vide les éléments supprimés', 'Outlook : vider le dossier « Éléments supprimés »', '21,6 Go libérés : les mails recommencent à arriver.', 'emptied'),
        ['Évite que ça recommence', 'Console cloud › Thomas Lefebvre › Actions de messagerie › « Activer l’archivage en ligne ».', 'Sans action de fond, la boîte sera de nouveau pleine dans quelques mois.', f => f('archive') || f('sorted'), 'cloud']
      ]
    },
    cable: {
      note: 'Plus de réseau après réaménagement du bureau : ipconfig « Média déconnecté », voyants éteints. Câble branché sur la prise murale P3-14, non brassée. Câble passé sur P3-13 : adresse 10.20.4.57 obtenue, connectivité vérifiée à distance. Prise P3-14 signalée pour brassage.',
      steps: [
        Q('Vérifie si d’autres personnes sont touchées', 'Vos collègues ont-ils le même problème ?', 'Si un seul PC est touché, on cherche sur ce poste et pas sur le réseau entier.', 'scope_single'),
        Q('Cherche ce qui a changé', 'Y a-t-il eu un changement récent : installation, déplacement, mise à jour ?', 'Le bureau a été déplacé : la piste physique (câble, prise) devient la plus probable.', 'moved'),
        Q('Fais taper ipconfig par téléphone', 'Pouvez-vous ouvrir l’invite de commandes (touche Windows, tapez cmd) et taper ipconfig ?', 'Le PC est hors ligne, tu ne peux pas prendre la main : tu guides l’utilisateur. « Média déconnecté » veut dire qu’il n’y a aucun lien physique.', 'ipconfig_read'),
        Q('Fais regarder les voyants de la carte réseau', 'Les petits voyants à côté du câble réseau, à l’arrière du PC, sont-ils allumés ?', 'Voyants éteints : le problème est le câble ou la prise, pas Windows.', 'leds'),
        Q('Fais lire l’étiquette de la prise murale', 'Dans quelle prise murale le câble est-il branché ? Il y a une étiquette dessus ?', 'Une prise peut être « morte » si elle n’est pas brassée dans la baie.', 'port_info'),
        Q('Fais brancher le câble sur l’autre prise', 'Pouvez-vous brancher le câble dans l’autre prise libre, la P3-13 ?', 'Le voyant s’allume : la prise P3-14 n’était pas active. (Autre possibilité : Intervention sur site.)', 'cable_fixed'),
        ['Vérifie à distance que tout marche', 'Demande l’accord au téléphone, puis Assistance à distance › « Se connecter » › onglet « Invite de commandes (admin) » › tape ipconfig puis ping srv-fic-01.', 'On vérifie soi-même avant de clôturer : adresse IP correcte et serveur joignable.', f => f('cable_fixed') && (f.seq('cmd:ipconfig') > f.seq('cable_fixed') || f.seq('cmd:ping') > f.seq('cable_fixed')), 'remote']
      ]
    },
    printer: {
      note: 'Document en erreur bloquant la file d’impression du poste PC-FAC-001 vers IMP-FAC-01 (les collègues impriment normalement). Spouleur d’impression redémarré : file purgée, documents imprimés, page de test OK.',
      steps: [
        Q('Vérifie si les collègues impriment', 'Vos collègues ont-ils le même problème ?', 'Camille imprime sans souci : l’imprimante va bien, le problème est sur le poste de Nathalie.', 'others_ok'),
        Q('Fais lire l’état de la file d’attente', 'Avez-vous un message d’erreur ? Pouvez-vous me le lire exactement ?', 'Un document en « Erreur – Impression » bloque tous ceux qui sont derrière lui.', 'queue_err'),
        Q('Propose un contournement', 'Si c’est urgent, vous pouvez imprimer en attendant sur IMP-GEN-RDC au rez-de-chaussée.', 'Elle a des bordereaux à imprimer avant 16 h : on la débloque pendant qu’on répare.', 'workaround'),
        CONNECT,
        RA('Redémarre le service d’impression', 'Services : redémarrer « Spouleur d’impression »', 'Le spouleur gère la file. Le redémarrer purge le document coincé. (En ligne de commande : Restart-Service Spooler.)', spoolCleared),
        RA('Imprime une page de test', 'Imprimer une page de test sur IMP-FAC-01', 'On vérifie que l’impression fonctionne avant de clôturer.', 'testpage')
      ]
    },
    vpn: {
      note: 'VPN impossible depuis l’hôtel : portail captif du Wi-Fi non validé (pas d’accès internet). Passerelle VPN vérifiée en ligne dans la supervision. Portail validé (numéro de chambre), VPN reconnecté, accès au CRM confirmé.',
      steps: [
        Q('Fais lire le message du VPN', 'Avez-vous un message d’erreur ? Pouvez-vous me le lire exactement ?', '« Impossible de joindre la passerelle » : le VPN n’arrive même pas jusqu’à nos serveurs.', 'q:g_error'),
        Q('Cherche ce qui a changé', 'Depuis quand avez-vous ce problème ?', 'Ça marchait chez lui hier : c’est l’endroit de connexion (l’hôtel) qui change.', 'works_home'),
        ['Vérifie que la passerelle VPN est en ligne', 'Ouvre Supervision : la ligne vpn.ostral-bio.fr est au vert.', 'Si nos serveurs vont bien, le problème est côté connexion de l’utilisateur.', 'monitor:view', 'monitor'],
        Q('Teste internet sans le VPN', 'Pouvez-vous ouvrir le navigateur et aller sur un site, par exemple google.fr ?', 'Une page de l’hôtel apparaît : c’est un portail captif, internet est bloqué tant qu’il n’est pas validé.', 'captive_seen'),
        Q('Fais valider la page de l’hôtel', 'Pouvez-vous remplir cette page (numéro de chambre) et accepter les conditions ?', 'Une fois validé, l’ordinateur a enfin accès à internet.', 'portal_ok'),
        Q('Fais relancer le VPN', 'Relancez la connexion VPN maintenant, s’il vous plaît.', 'Avec internet, le VPN se connecte. Donne-lui l’astuce : ouvrir un site avant de lancer le VPN.', 'vpn_ok')
      ]
    },
    slow: {
      note: 'Lenteurs et publicités depuis l’installation de « PDF Convert Pro Free » (logiciel indésirable) : PDFConvertProUpdater.exe à 71 % de processeur. Logiciel et extension SearchBoost désinstallés, analyse antivirus complète (2 PUA en quarantaine), PDF24 installé depuis le Centre logiciel.',
      steps: [
        Q('Cherche ce qui a changé', 'Y a-t-il eu un changement récent : installation, déplacement, mise à jour ?', 'Un logiciel gratuit installé hier : c’est la piste numéro un.', 'pua_install'),
        Q('Vérifie qu’elle n’a rien saisi dans les pubs', 'Avez-vous cliqué sur une de ces publicités ou saisi des informations dedans ?', 'Si elle avait saisi un mot de passe, ce serait un incident de sécurité plus grave.', 'no_click'),
        CONNECT,
        RA('Trouve le processus qui sature le PC', 'Ouvrir le Gestionnaire des tâches (trier par processeur)', 'PDFConvertProUpdater.exe prend 71 % du processeur : voilà la lenteur.', f => f('saw_proc') || f('cmd:topcpu')),
        RA('Regarde ce qui a été installé hier', 'Paramètres > Applications installées (tri par date)', 'On identifie précisément le logiciel et l’extension à retirer.', 'saw_programs'),
        RA('Désinstalle le logiciel et l’extension', 'Désinstaller « PDF Convert Pro Free » et retirer l’extension « SearchBoost »', 'On supprime la cause, pas seulement le symptôme (tuer le processus ne suffit pas : il revient au redémarrage).', 'uninstalled'),
        RA('Lance une analyse antivirus complète', 'Lancer une analyse antivirus complète (Defender)', 'L’antivirus nettoie les restes et confirme qu’il n’y a rien de plus grave.', f => f('av_full') || f('av_scan')),
        RA('Propose l’outil approuvé', 'Centre logiciel : installer « PDF24 Creator » (outil PDF approuvé)', 'Elle avait un vrai besoin (convertir des CV) : on lui donne la solution autorisée.', 'alt_tool')
      ]
    },
    phish: {
      note: 'Phishing : faux mail « Service Informatique » (domaine ostral-securite365.com), identifiants et code MFA saisis vers 9 h 50. Connexion depuis Lagos et règle de boîte suspecte constatées. Identité vérifiée, mot de passe réinitialisé, sessions révoquées, règle supprimée, mail signalé. Transmis à la cellule sécurité.',
      steps: [
        ['Analyse le mail suspect', 'Service Desk › dans la description du ticket, clique la pièce jointe « URGENT – Validation de votre compte.eml ». Regarde l’expéditeur et l’adresse du lien.', 'Le domaine est ostral-securite365.com au lieu d’ostral-bio.fr, et le lien mène à un faux site : c’est du phishing.', 'attach_viewed', 'sd'],
        Q('Demande si elle a saisi son mot de passe', 'Avez-vous saisi votre mot de passe sur la page ouverte par le lien ? À quelle heure ?', 'Oui : son compte est compromis, il faut agir vite.', 'creds_entered'),
        Q('Demande si elle a donné le code SMS', 'Avez-vous saisi autre chose : un code reçu par SMS…', 'Avec le code MFA, l’attaquant a pu ouvrir une session : il faudra la couper.', 'mfa_given'),
        ['Regarde les connexions récentes', 'Console cloud › clique sur Aïcha Diallo › Connexions récentes : connexion depuis Lagos et création d’une règle de boîte.', 'Ça confirme la compromission et montre ce que l’attaquant a fait.', 'cloud:view:aicha', 'cloud'],
        ID('Aïcha'),
        ['Réinitialise son mot de passe', 'Utilisateurs et ordinateurs AD › Direction › Aïcha Diallo › « Réinitialiser le mot de passe… » › mot de passe provisoire conforme › « doit changer » coché › OK.', 'Le mot de passe volé ne doit plus fonctionner.', 'ad:reset:aicha', 'ad'],
        ['Révoque toutes ses sessions', 'Console cloud › Aïcha Diallo › « Révoquer toutes les sessions ».', 'Changer le mot de passe ne déconnecte pas l’attaquant déjà connecté : il faut couper ses sessions.', 'ad:revoke:aicha', 'cloud'],
        ['Supprime la règle de boîte de l’attaquant', 'Console cloud › Règles de boîte de réception › « Supprimer » sur la règle créée depuis Lagos.', 'Cette règle cachait les mails contenant « virement » ou « RIB » : préparation d’une fraude.', 'rule_removed', 'cloud'],
        Q('Fais signaler le mail', 'Ne supprimez pas le mail : utilisez le bouton « Signaler » dans Outlook, s’il vous plaît.', 'La cellule sécurité a besoin du mail pour bloquer la campagne.', 'reported'),
        Q('Évalue l’ampleur', 'Savez-vous si des collègues ont reçu le même mail ?', 'Si d’autres l’ont reçu, la cellule sécurité doit le savoir.', 'campaign')
      ]
    },
    onboard: {
      note: 'Arrivée d’Hugo Lambert, secrétaire médical à Villeurbanne, le 9/11, demandée par Marc Delorme. Compte hugo.lambert créé dans OU=Secretariat, groupes GG_Tous, GG_Secretariat, GG_SIL_Accueil (droits d’Inès Garnier, pas du manager). Licence SIL validée. Mot de passe provisoire à changer, remis par téléphone lundi 8 h 30.',
      steps: [
        Q('Confirme la fonction et la date', 'Pouvez-vous me confirmer la date d’arrivée et la fonction exacte d’Hugo ?', 'Les droits dépendent de la fonction. On vérifie avant de créer quoi que ce soit.', 'details'),
        Q('Précise le périmètre des droits', 'Doit-il avoir les mêmes droits que vous ?', 'Réponse : les droits d’Inès, pas ceux du manager. C’est le moindre privilège.', 'rights_scope'),
        Q('Valide la licence du SIL', 'L’accès au SIL consomme une licence : avez-vous l’accord pour une licence de plus ?', 'Une licence coûte de l’argent : on s’assure qu’elle est prévue.', 'license_ok'),
        Q('Organise la remise du mot de passe', 'Comment souhaitez-vous qu’on remette son mot de passe provisoire à Hugo ?', 'Le mot de passe se donne à l’oral, jamais par mail au manager.', 'handover'),
        ['Vérifie qu’il n’existe pas déjà', 'Utilisateurs et ordinateurs AD › champ « Rechercher » : tape lambert. Aucun résultat.', 'Évite un doublon ou un homonyme (on aurait alors hugo.lambert2).', f => f.re(/^ad:search:.*(hugo|lambert)/), 'ad'],
        ['Crée le compte', 'AD › dossier Secretariat › « Nouvel utilisateur » › Prénom Hugo, Nom Lambert, nom d’ouverture de session hugo.lambert › « Copier les groupes de » Inès Garnier › vérifie qu’il n’y a que GG_Tous, GG_Secretariat et GG_SIL_Accueil › mot de passe provisoire conforme › « doit changer » coché › Terminer.', 'Bon identifiant, bonne OU, groupes strictement nécessaires. Jamais GG_SIL_Biologiste pour un secrétaire.', (f, t) => { const u = t && t.ad.created['hugo.lambert']; return !!u && ['GG_Tous', 'GG_Secretariat', 'GG_SIL_Accueil'].every(g => u.groups.includes(g)) && u.groups.length === 3; }, 'ad']
      ]
    },
    share: {
      note: 'Demande d’accès (droit jamais attribué) au dossier \\\\srv-fic-01\\Qualite\\Accreditation2027. Accord écrit de Claire Vasseur, responsable qualité, reçu dans le ticket. Élodie ajoutée au groupe GG_Qualite_Accreditation_RW, session rouverte pour rafraîchir le jeton, accès en modification vérifié.',
      steps: [
        Q('Demande si elle avait déjà cet accès', 'Aviez-vous déjà accès à ce dossier auparavant ?', 'Non : ce n’est pas une panne, c’est une demande d’accès. Pense à mettre le type « Demande de service ».', 'never_had'),
        Q('Vérifie ce qu’elle peut faire', 'Arrivez-vous à ouvrir les autres dossiers du partage Qualite ?', 'Elle lit mais ne modifie pas : il lui manque le groupe en modification.', 'read_ok'),
        ['Regarde ses groupes dans l’AD', 'Utilisateurs et ordinateurs AD › Qualite › Élodie Fabre › « Propriétés » › onglet « Membre de » : seulement GG_Tous et GG_Qualite_Lecture.', 'Le groupe GG_Qualite_Accreditation_RW manque.', 'ad:view:elodie', 'ad'],
        Q('Obtiens l’accord écrit de la responsable', 'Claire Vasseur peut-elle confirmer son accord par écrit dans le ticket ?', 'C’est la propriétaire des données qui décide. « En copie du mail » ne suffit pas : il faut un accord écrit dans le ticket.', 'approval'),
        ['Ajoute le bon groupe', 'AD › Élodie Fabre › « Ajouter à un groupe… » › coche GG_Qualite_Accreditation_RW (et rien d’autre) › OK.', 'Un seul groupe, celui qui correspond exactement au besoin.', 'ad:group+:elodie:GG_Qualite_Accreditation_RW', 'ad'],
        Q('Fais rouvrir sa session', 'Pouvez-vous fermer votre session Windows puis la rouvrir ?', 'Windows lit les groupes à l’ouverture de session : sans ça, le nouveau droit n’est pas pris en compte.', shareOk)
      ]
    },
    screen: {
      note: 'Second écran « Pas de signal » : câble DisplayPort à moitié débranché côté PC après le ménage. Câble renfoncé, affichage remis en mode « Étendre ». Fonctionnement confirmé par l’utilisateur.',
      steps: [
        Q('Vérifie que l’écran est alimenté', 'L’écran est-il allumé ? De quelle couleur est son voyant ?', 'Voyant orange = l’écran marche mais ne reçoit rien. On cherche du côté du câble.', 'power_ok'),
        Q('Cherche ce qui a changé', 'Y a-t-il eu un changement récent : installation, déplacement, mise à jour ?', '« Personne n’a rien touché »… sauf le ménage. Un câble a pu bouger.', 'moved'),
        CONNECT,
        RA('Regarde ce que Windows détecte', 'Paramètres > Affichage : détecter les écrans', 'Un seul écran détecté : Windows ne voit pas le second. C’est physique.', 'display_checked'),
        Q('Fais vérifier le câble des deux côtés', 'Pouvez-vous vérifier que le câble de l’écran est bien enfoncé des deux côtés, écran et PC ?', 'Le câble était à moitié sorti derrière le PC.', 'cable_ok'),
        RA('Remets l’affichage en « Étendre »', 'Paramètres > Affichage : passer en « Étendre ces affichages »', 'L’écran revient en mode « Dupliquer » : on rétablit ses deux écrans séparés. (Raccourci clavier : Windows + P.)', 'extended')
      ]
    },
    dwg: {
      note: 'Besoin : consulter et imprimer des plans .dwg. Mot de passe admin non communiqué, installeur téléchargé sur un site douteux supprimé. DWG TrueView 2026 (approuvé, gratuit) installé depuis le Centre logiciel. Centre logiciel présenté à l’utilisateur.',
      steps: [
        Q('Comprends le besoin réel', 'Avez-vous seulement besoin de consulter les plans, ou aussi de les modifier ?', 'Il veut seulement lire : un simple visionneur suffit.', 'need_view'),
        Q('Demande d’où vient le logiciel', 'D’où vient le logiciel que vous avez téléchargé ?', 'Un site trouvé sur Google : risque de logiciel malveillant. On ne l’installera pas.', 'source_bad'),
        Q('Parle-lui du Centre logiciel', 'Connaissez-vous le Centre logiciel, dans le menu Démarrer ?', 'La prochaine fois, il pourra se débrouiller seul et sans risque.', 'catalog_asked'),
        CONNECT,
        RA('Cherche une solution approuvée', 'Centre logiciel : rechercher « DWG »', 'DWG TrueView est dans le catalogue : approuvé, gratuit, sans droit admin.', 'catalog_found'),
        RA('Installe le visionneur approuvé', 'Centre logiciel : installer DWG TrueView 2026', 'Le besoin est couvert sans contourner la sécurité.', 'installed_ok'),
        RA('Supprime l’installeur douteux', 'Supprimer l’installeur téléchargé (dwgviewerpro_setup.exe)', 'Évite qu’il l’installe plus tard par erreur.', 'cleaned')
      ]
    },
    teams: {
      note: 'Micro inaudible dans Teams : Teams utilisait le micro intégré du portable (écran rabattu) au lieu du nouveau casque Jabra. Micro Jabra Evolve2 40 sélectionné dans les périphériques Teams, appel test concluant avant la réunion.',
      steps: [
        Q('Vérifie que le son sort dans le casque', 'Entendez-vous le son dans le casque, une vidéo par exemple ?', 'Le haut-parleur marche : le casque est reconnu. Le problème est côté micro.', 'audio_out_ok'),
        Q('Vérifie que le micro n’est pas coupé', 'Le micro est-il coupé, dans Teams ou sur le casque ?', 'Le test le plus rapide : un micro coupé est la cause la plus fréquente.', 'not_muted'),
        Q('Fais lancer un appel test', 'Pouvez-vous passer un appel test dans Teams…', '« Aucun son détecté » : Teams n’écoute pas le bon micro.', f => f('testcall_fail') || f('testcall_ok')),
        CONNECT,
        RA('Regarde les périphériques de Teams', 'Teams : Paramètres > Périphériques', 'Teams utilise le micro intégré du portable, inaudible écran rabattu.', 'saw_devices'),
        RA('Sélectionne le micro du casque', 'Teams : choisir « Jabra Evolve2 40 » comme micro', 'Le nouveau casque n’avait pas été sélectionné automatiquement.', 'mic_fixed'),
        Q('Refais l’appel test', 'Pouvez-vous passer un appel test dans Teams…', 'On valide avant la réunion, pas pendant.', 'testcall_ok')
      ]
    },
    server: {
      note: 'Incident majeur P1 : lecteur S: (\\\\srv-fic-02\\Plateau) inaccessible depuis 9 h 40 pour tout le plateau technique (environ 20 personnes) et les sites. Réseau, mails, SIL et P: OK. ping srv-fic-02 : délai dépassé ; ping srv-fic-01 OK ; supervision : srv-fic-02 injoignable depuis 09:41. Contournement : listes de travail depuis le SIL.',
      steps: [
        Q('Mesure le périmètre', 'Combien de personnes sont touchées, et dans quels services ?', 'Tout le plateau technique : c’est un incident majeur, priorité 1.', 'scope'),
        Q('Note l’heure de début', 'À quelle heure exactement est-ce que ça a commencé ?', 'L’équipe serveurs aura besoin de l’heure exacte pour chercher la cause.', 'time'),
        Q('Vérifie ce qui fonctionne encore', 'Arrivez-vous à accéder à autre chose : internet, la messagerie, le SIL, le dossier Commun (P:) ?', 'Tout marche sauf S: : le réseau va bien, c’est le serveur srv-fic-02.', 'other_ok'),
        CONNECT,
        ['Teste le serveur en ligne de commande', 'Assistance à distance › onglet « Invite de commandes (admin) » › tape ping srv-fic-02 (délai dépassé), puis ping srv-fic-01 (OK) pour comparer.', 'Un serveur ne répond plus alors que son voisin répond : la panne est sur srv-fic-02.', f => (f('ping:srv-fic-02') || f('ping:10.20.1.22')) && (f('ping:srv-fic-01') || f('nslookup:srv-fic-02')), 'remote'],
        ['Confirme avec la supervision', 'Ouvre Supervision : srv-fic-02 en rouge, « Hôte injoignable depuis 09:41 ».', 'Deux sources concordantes : tu peux escalader avec des faits.', 'monitor:view', 'monitor'],
        Q('Propose un contournement', 'En attendant, pouvez-vous reprendre les listes de travail directement depuis le SIL ?', 'Le plateau repart, même plus lentement, pendant la réparation.', 'workaround'),
        Q('Informe et organise l’attente', 'Je transmets en priorité à l’équipe serveurs. Pouvez-vous prévenir l’équipe…', 'Les utilisateurs savent qu’on s’en occupe et arrêtent de redémarrer leurs PC.', 'informed')
      ]
    },
    bitlocker: {
      note: 'Écran de récupération BitLocker après mise à jour du BIOS. Identité vérifiée (matricule conforme + rappel au 2650 de l’annuaire). Clé de l’objet LT-PRE-022 correspondant à l’ID 4F2A91C3 dictée à l’oral, poste démarré.',
      steps: [
        Q('Fais lire l’ID de clé', 'Pouvez-vous me lire l’ID de clé affiché à l’écran ? Les 8 premiers caractères suffisent.', 'Un poste peut avoir plusieurs clés : l’ID dit laquelle utiliser (4F2A91C3).', 'keyid'),
        Q('Cherche le déclencheur', 'Y a-t-il eu un changement récent : installation, déplacement, mise à jour ?', 'La mise à jour du BIOS explique l’écran : c’est un comportement normal de BitLocker.', 'bios'),
        ID('Julien'),
        Q('Rappelle-le sur le numéro de l’annuaire', 'Je vais raccrocher et vous rappeler sur votre numéro de l’annuaire, d’accord ?', 'Une clé BitLocker ouvre tout le disque : vérification renforcée.', 'callback'),
        ['Ouvre l’ordinateur dans l’AD', 'Utilisateurs et ordinateurs AD › dossier Ordinateurs › double-clic sur LT-PRE-022 › onglet « Récupération BitLocker ».', 'Les clés de récupération sont sauvegardées dans l’objet ordinateur.', 'ad:comp:LT-PRE-022', 'ad'],
        ['Affiche la bonne clé', 'Clique « Afficher le mot de passe de récupération » sur la clé dont l’ID commence par 4F2A91C3 (pas l’autre).', 'La mauvaise clé ne marchera pas, et on n’affiche pas des clés pour rien.', 'bl:reveal:4F2A91C3', 'ad'],
        Q('Dicte la clé', 'Je vais vous dicter la clé de récupération, par blocs de 6 chiffres. Vous êtes prêt ?', 'À l’oral uniquement : son PC est bloqué, et une clé ne s’envoie pas par mail.', 'bl_ok')
      ]
    },
    disk: {
      note: 'Disque C: plein (0,4 Go libres sur 237 Go) : 44 Go de vidéos de formation dans Téléchargements et 6,8 Go de fichiers temporaires. Nettoyage de disque effectué, vidéos supprimées avec l’accord de l’utilisatrice (disponibles en ligne), dossier Factures_scan conservé, OneDrive en fichiers à la demande. Plus de 50 Go libres.',
      steps: [
        CONNECT,
        RA('Mesure l’occupation du disque', 'Paramètres > Stockage : analyser l’espace utilisé', 'On mesure avant de supprimer : les Téléchargements pèsent 47 Go.', f => f('storage') || f('cmd:disk')),
        RA('Regarde ce qui prend la place', 'Ouvrir le dossier Téléchargements (trié par taille)', '44 Go de vidéos… et un dossier Factures_scan qu’il ne faut pas toucher.', 'dl_view'),
        Q('Comprends à quoi servent ces fichiers', 'Avez-vous beaucoup de fichiers dans vos Téléchargements ou sur le Bureau ?', 'Ce sont des vidéos de formation disponibles en ligne.', 'dl_info'),
        RA('Nettoie les fichiers temporaires', 'Nettoyage de disque : fichiers temporaires et cache des mises à jour', 'Sans risque pour l’utilisatrice : 6,8 Go libérés.', 'cleanmgr'),
        Q('Demande l’accord pour les vidéos', 'Puis-je supprimer les vidéos de formation si elles sont toujours disponibles en ligne ?', 'Ses fichiers lui appartiennent. Elle précise de ne pas toucher à Factures_scan.', 'ok_videos'),
        RA('Supprime uniquement les vidéos', 'Supprimer les vidéos Formation_Facturation_*.mp4 (44 Go)', 'Surtout pas « vider tout le dossier » : les scans de factures seraient perdus.', 'videos_deleted'),
        RA('Évite que ça recommence', 'OneDrive : activer « Fichiers à la demande »', 'Les fichiers restent accessibles sans occuper le disque.', 'onedrive')
      ]
    },
    restore: {
      note: 'Budget_2027.xlsx supprimé hier vers 18 h 30 sur \\\\srv-fic-01\\Facturation\\Budget (dernier enregistrement 17 h 50). Restauré à son emplacement depuis l’instantané d’hier 18:00 (version de 17:52), aucun fichier écrasé. Contenu vérifié par l’utilisatrice.',
      steps: [
        Q('Demande les heures précises', 'À quelle heure environ avez-vous supprimé le fichier, et quand l’aviez-vous enregistré pour la dernière fois ?', 'Enregistré à 17 h 50, supprimé à 18 h 30 : il faut un instantané pris entre les deux.', 'times'),
        Q('Confirme le chemin exact', 'Pouvez-vous me confirmer le chemin exact et le nom du fichier ?', 'On restaure le bon fichier au bon endroit.', 'path'),
        Q('Vérifie qu’on n’écrasera rien', 'Je vais restaurer le fichier à son emplacement. Avez-vous recréé un fichier du même nom depuis ?', 'Restaurer par-dessus un nouveau fichier détruirait son travail récent.', 'no_overwrite'),
        CONNECT,
        RA('Ouvre les versions précédentes', 'Dossier Budget > Propriétés > Versions précédentes', 'Sur un partage réseau, pas de corbeille : le serveur garde des instantanés.', 'prev_view'),
        RA('Restaure le bon instantané', 'Restaurer Budget_2027.xlsx depuis « Hier 18:00 »', 'C’est le dernier instantané qui contient encore le fichier : il garde le travail de l’après-midi.', 'restored_best')
      ]
    },
    bench: {
      note: 'PC de paillasse 3 : 3 bips longs et voyant orange (erreur mémoire selon la doc Lenovo) après un choc sur le meuble. Contournement sur la paillasse 4. Intervention sur site hors tension avec bracelet antistatique : barrette mémoire réinsérée, démarrage et SIL OK. Intervention tracée dans l’inventaire.',
      steps: [
        Q('Vérifie l’alimentation', 'Le câble d’alimentation est-il bien branché ? Avez-vous essayé une autre prise ?', 'On élimine la cause la plus simple en premier.', 'power_tested'),
        Q('Relève le code bips', 'Combien de bips exactement, longs ou courts ? Et le voyant ?', 'Les bips au démarrage sont un code d’erreur du constructeur.', 'beeps'),
        Q('Demande s’il s’est passé quelque chose', 'S’est-il passé quelque chose : choc, liquide renversé, coupure de courant ?', 'Un choc peut déloger une barrette mémoire.', 'shock'),
        Q('Propose un contournement', 'En attendant, pouvez-vous saisir sur le PC de la paillasse 4 ?', 'Le technicien continue de travailler pendant ton intervention.', 'workaround'),
        ['Va sur place', 'Ouvre Intervention sur site › « Se rendre sur place ».', 'Le PC ne démarre pas : impossible de le dépanner à distance.', 'onsite', 'site'],
        ['Interprète le code bips', 'Intervention sur site › « Consulter la documentation constructeur des codes bips ».', 'Lenovo : 3 bips longs = mémoire.', 'beep_doc', 'site'],
        ['Ouvre le boîtier en sécurité', 'Intervention sur site › « Éteindre, débrancher, mettre le bracelet antistatique et ouvrir le boîtier ». Jamais sous tension.', 'Sécurité pour toi et pour le matériel.', 'opened_safe', 'site'],
        ['Réinsère la barrette et teste', 'Intervention sur site › « Réinsérer la barrette mémoire jusqu’au clic » puis « Refermer, rebrancher et démarrer le PC ».', 'La barrette délogée par le choc était la cause.', 'boot_ok', 'site'],
        ['Trace l’intervention', 'Intervention sur site › « Consigner l’intervention dans la fiche du matériel ».', 'En laboratoire accrédité, toute intervention sur un équipement est tracée.', f => f('cmdb') || f('inv:PC-PAIL-03'), 'site']
      ]
    },
    fakeceo: {
      note: 'Appel suspect d’une personne se présentant comme Antoine Caron (DAF) depuis un numéro espagnol : matricule annoncé OS-05504 au lieu d’OS-05540, refus du rappel, demande d’envoi du mot de passe par SMS / Gmail pour un virement urgent. Contre-appel au 2001 : le vrai DAF est dans son bureau. Demande refusée, aucune action sur le compte. Transmis à la cellule sécurité.',
      steps: [
        ['Ouvre la fiche du vrai DAF', 'Utilisateurs et ordinateurs AD › Direction › Antoine Caron › « Propriétés » : note le matricule (OS-05540) et la dernière connexion (ce matin, au siège).', 'Il est censé être à Madrid… mais il s’est connecté au siège ce matin.', f => f('ad:view:antoine') || f('cloud:view:antoine'), 'ad'],
        ['Demande le matricule et compare', 'Softphone › « Pour votre sécurité, pouvez-vous me donner votre matricule ? ». Il annonce OS-05504 : différent d’OS-05540 → clique « Non conforme ».', 'Premier signal objectif : ce n’est pas lui.', 'id_mismatch_detected', 'phone'],
        Q('Demande le motif', 'Quel virement devez-vous valider ?', '« Urgent et confidentiel » : signature classique de la fraude au président.', 'fraud_sign'),
        Q('Contre-vérifie par un canal connu', 'Je vais raccrocher et vous rappeler sur votre numéro de l’annuaire, d’accord ?', 'Au 2001, le vrai Antoine Caron répond : il n’a jamais appelé. (Autre canal possible : son assistante.)', 'verified_fake'),
        Q('Refuse poliment', 'Je ne peux pas envoyer de mot de passe par SMS ni sur une adresse personnelle : c’est la procédure de sécurité.', 'On reste poli et ferme. Aucune action sur le compte, quoi qu’il arrive.', 'refused')
      ]
    },
    phone: {
      note: 'Accueil de Villeurbanne : téléphone IP éteint et PC sans réseau après le ménage. Câbles inversés sous le téléphone (câble mural sur le port PC, donc ni PoE ni réseau). Câbles remis (mur → LAN, PC → PC) : téléphone enregistré sur la ligne 5612, PC en réseau, appel test OK. Renvoi d’appels proposé pendant le dépannage.',
      steps: [
        Q('Vérifie si le téléphone est alimenté', 'L’écran du téléphone affiche-t-il quelque chose, même un message ?', 'Écran noir : il ne reçoit pas de courant.', 'phone_dead'),
        Q('Cherche comment il est alimenté', 'Le téléphone a-t-il un bloc d’alimentation branché sur une prise électrique ?', 'Pas de bloc : il est alimenté par le câble réseau (PoE).', 'poe_clue'),
        Q('Propose un contournement', 'En attendant, je peux demander le renvoi des appels de l’accueil vers le site de Caluire.', 'Les patients qui appellent ne tombent pas dans le vide.', 'workaround'),
        Q('Fais décrire les branchements', 'Sous le téléphone, il y a deux prises réseau. Comment sont-elles marquées, et quel câble va où ?', 'Câble du mur sur le port « PC » : le téléphone n’est pas alimenté et le PC, qui passe par lui, n’a plus de réseau.', 'ports_described'),
        Q('Fais inverser les câbles', 'Inversez les deux câbles : le câble du mur dans « LAN », celui de l’ordinateur dans « PC ».', 'Le téléphone démarre et le PC retrouve le réseau.', 'swapped_ports'),
        Q('Teste un appel', 'Pouvez-vous appeler le 4000 depuis le téléphone fixe pour tester ?', 'On vérifie que le téléphone est bien enregistré sur le standard.', 'phone_test')
      ]
    },
    prep: {
      note: 'Préparation du portable LT-BIO-003 (Dell Latitude 5450, n° de série 4ZTP8W4) pour la Dre Pauline Henry, profil biologiste : BIOS à jour, image W11-Ostral, nommage puis jonction à ostral.local, profil logiciel (SIL, Microsoft 365, VPN, PDF24), BitLocker avec clé sauvegardée dans l’AD, mises à jour. Inventaire mis à jour, remise accompagnée planifiée lundi 9 h.',
      steps: [
        Q('Demande le profil logiciel', 'De quels logiciels aura-t-elle besoin ? Aura-t-elle des astreintes depuis chez elle ?', 'Le profil dit quoi installer : SIL biologiste, Office et VPN (astreintes).', 'profile_ok'),
        Q('Note la date et le lieu d’arrivée', 'À quelle heure et où arrive-t-elle lundi ?', 'Tu dois être prêt avant, et prévoir la remise.', 'arrival'),
        ['Va à l’atelier', 'Ouvre Intervention sur site › « Aller à l’atelier ».', 'Le portable est encore dans son carton au stock IT.', 'onsite', 'site'],
        ['Réceptionne et inventorie', 'Atelier › « Déballer, relever le numéro de série, coller l’étiquette d’inventaire ».', 'Tout matériel doit être identifiable dans l’inventaire.', 'p_inv', 'site'],
        ['Mets à jour le BIOS', 'Atelier › « Mettre à jour le BIOS ».', 'On part d’une base saine, avant de chiffrer le disque.', 'p_bios', 'site'],
        ['Déploie l’image de l’entreprise', 'Atelier › « Déployer l’image Windows 11 de l’entreprise ».', 'Tous les postes partent de la même base, maîtrisée.', 'p_image', 'site'],
        ['Renomme le poste', 'Atelier › « Renommer le poste en LT-BIO-003 ». Fais-le AVANT la jonction au domaine.', 'Sinon il entre dans le domaine sous un nom automatique difficile à corriger.', f => f('p_name') && (!f('p_join') || f.seq('p_name') < f.seq('p_join')), 'site'],
        ['Joins le poste au domaine', 'Atelier › « Joindre le poste au domaine ostral.local ».', 'Le poste reçoit les stratégies, et l’AD pourra sauvegarder sa clé BitLocker.', 'p_join', 'site'],
        ['Installe le profil logiciel', 'Atelier › « Installer le profil logiciel « Biologiste » ».', 'Tout ce dont elle a besoin, rien de plus, via le canal approuvé.', 'p_apps', 'site'],
        ['Active BitLocker', 'Atelier › « Activer BitLocker et vérifier la sauvegarde de la clé dans l’AD ». APRÈS la jonction.', 'Sans clé sauvegardée, un problème matériel rendrait les données irrécupérables.', f => f('p_bl') && !f('p_bl_nokey'), 'site'],
        ['Fais les mises à jour', 'Atelier › « Installer les mises à jour Windows et redémarrer ».', 'Le poste est remis à jour de sécurité.', 'p_updates', 'site'],
        ['Mets à jour l’inventaire', 'Atelier › « Mettre à jour l’inventaire : LT-BIO-003 affecté à Pauline Henry ».', 'On sait qui a quel matériel, et depuis quand.', 'p_cmdb', 'site'],
        ['Planifie la remise', 'Atelier › « Planifier la remise lundi 9 h… ».', 'Première connexion accompagnée : tests SIL et VPN, bon de remise signé.', 'p_handover', 'site']
      ]
    },
    labels: {
      note: 'Étiquettes de tubes décalées à l’accueil de Saint-Priest depuis le changement de rouleau : rouleau 50 × 30 mm au lieu du format 50 × 25 attendu par le SIL. Contournement via l’imprimante du box 2. Bon rouleau installé, calibrage, étiquette de test lue par la douchette. Carton incompatible isolé, achats prévenus.',
      steps: [
        Q('Propose un contournement sûr', 'En attendant, pouvez-vous imprimer les étiquettes sur l’imprimante du box 2 ?', 'Des patients attendent. Surtout pas d’étiquettes écrites à la main (risque d’erreur d’identification).', 'workaround'),
        Q('Demande quand le rouleau a été changé', 'Quand le rouleau a-t-il été changé, et d’où vient le nouveau ?', 'La panne a commencé juste après : c’est la piste.', 'roll_changed'),
        Q('Fais lire les dimensions du rouleau', 'Pouvez-vous lire les dimensions ou la référence écrites sur le rouleau ?', '50 × 30 au lieu de 50 × 25 : mauvais format.', 'wrong_roll'),
        CONNECT,
        RA('Vérifie le format attendu', 'Propriétés de « ZDesigner ZD421 » : format d’étiquette configuré', 'Le pilote attend du 50 × 25 mm : confirmation.', 'driver_fmt'),
        Q('Fais installer le bon rouleau', 'Pouvez-vous installer un rouleau 50 × 25 mm à la place ?', 'Il en reste dans le carton bleu.', 'roll_ok'),
        Q('Fais calibrer l’imprimante', 'Lancez le calibrage automatique : maintenez les boutons PAUSE et CANCEL enfoncés 2 secondes.', 'Après chaque changement de rouleau, l’imprimante doit réapprendre l’espace entre deux étiquettes.', labelsOk),
        RA('Imprime une étiquette de test', 'SIL : imprimer une étiquette de test', 'On vérifie l’étiquette ET la lecture par la douchette.', 'test_ok'),
        ['Évite que ça recommence', 'Intervention sur site › « Se rendre sur place » › « Isoler le carton de rouleaux 50 × 30 mm et prévenir le référent achats ».', 'Sinon le même rouleau sera remis demain.', 'stock_fixed', 'site']
      ]
    },
    linux: {
      note: 'Intranet en 502 pour tous les sites depuis 9 h 15. Sur srv-intra-01 : php8.2-fpm en échec (« No space left on device »), / plein à 100 %, /var/log/intranet/debug.log de 17,9 Go (mode debug laissé activé le 28/10). Fichier vidé par truncate, php8.2-fpm redémarré, curl : HTTP 200. N2 prévenu pour désactiver le debug et ajouter une rotation des logs.',
      steps: [
        Q('Mesure le périmètre', 'Vos collègues ont-ils le même problème ?', 'Tout le monde, même les autres sites : c’est le serveur, pas les PC.', 'scope'),
        ['Regarde la supervision', 'Ouvre Supervision : srv-intra-01 en rouge, « 502 Bad Gateway » et « Disque / : 100 % ».', 'La supervision te donne déjà deux pistes.', 'monitor:view', 'monitor'],
        ['Connecte-toi en SSH', 'Ouvre PuTTY › nom d’hôte srv-intra-01 (déjà rempli) › « Ouvrir ».', 'On travaille directement sur le serveur Linux.', 'ssh:srv-intra-01', 'putty'],
        ['Vérifie l’état du service PHP', 'Dans PuTTY, tape : systemctl status php8.2-fpm', '« failed » : l’application derrière nginx est arrêtée, d’où l’erreur 502.', 'lx:status:php8.2-fpm', 'putty'],
        ['Lis le journal du service', 'Tape : journalctl -u php8.2-fpm -n 20', '« No space left on device » : le disque est plein.', 'lx:journal:php8.2-fpm', 'putty'],
        ['Vérifie l’espace disque', 'Tape : df -h', '/dev/sda1 monté sur / est à 100 %.', 'lx:df', 'putty'],
        ['Trouve ce qui remplit le disque', 'Tape : du -sh /var/log/*  (puis éventuellement ls -lh /var/log/intranet)', '/var/log/intranet pèse 18 Go : le fichier debug.log.', 'lx:du', 'putty'],
        ['Vide le journal de debug', 'Tape : sudo truncate -s 0 /var/log/intranet/debug.log', 'truncate libère la place sans supprimer le fichier. Ne jamais faire rm -rf /var/log.', lxFreed, 'putty'],
        ['Redémarre le service PHP', 'Tape : sudo systemctl restart php8.2-fpm', 'Maintenant qu’il y a de la place, le service peut démarrer.', lxPhp, 'putty'],
        ['Vérifie que l’intranet répond', 'Tape : curl -I http://localhost', 'HTTP/1.1 200 OK : l’intranet est revenu.', f => f('lx:curl') && lxPhp(f) && f.seq('lx:curl') > f.seq('lx:restart:php8.2-fpm'), 'putty'],
        Q('Préviens la demandeuse', 'Je m’en occupe. En attendant, les procédures sont aussi dans le partage Qualité…', 'Elle a une solution en attendant et sait qu’on la rappellera.', 'informed')
      ]
    },
    browser: {
      note: '« Internet ne marche plus » : le réseau fonctionnait (Outlook et SIL OK), l’icône d’Edge avait disparu de la barre des tâches après les mises à jour de la nuit. Edge réépinglé et raccourci vers le serveur de résultats créé sur le bureau.',
      steps: [
        Q('Demande comment il fait d’habitude', 'Comment faites-vous d’habitude pour aller sur internet ? Qu’est-ce qui se passe quand vous essayez ?', 'Pour lui, « internet » c’est l’icône bleue… qui a disparu.', 'icon_gone'),
        Q('Vérifie que le réseau marche', 'Le reste fonctionne-t-il : vos mails, le SIL ?', 'Mails et SIL marchent : le réseau va bien, inutile de toucher aux réglages réseau.', 'others_work'),
        Q('Aide-le à retrouver le navigateur', 'Pouvez-vous appuyer sur la touche Windows et taper « Edge » ?', 'Le navigateur s’ouvre : le problème est réglé pour l’instant.', 'edge_found'),
        CONNECT,
        RA('Remets l’icône à sa place', 'Épingler Microsoft Edge à la barre des tâches', 'Il retrouve son geste habituel.', 'pinned'),
        RA('Ajoute un raccourci utile', 'Créer un raccourci « Serveur de résultats » sur le bureau', 'Il accède directement à ce dont il a besoin. Explique-lui sans condescendance.', 'shortcut')
      ]
    }
  };

  /* Étapes complètes d'un ticket (communes + propres au scénario) */
  DS.tutoSteps = function (t) {
    const s = DS.sc(t), tu = DS.tutos[s.id] || { steps: [] };
    const L = (arr, id) => (arr.find(x => x.id === id) || {}).label || '';
    const H = (arr, id) => (arr.find(x => x.id === id) || {}).hint || '';
    const exp = DS.expPrio(s), vip = DS.users[s.req].vip && !s.prio;
    const steps = [];
    steps.push(['Prends le ticket en charge', 'Service Desk › ouvre le ticket › bouton bleu « Prendre en charge ». Il passe « En cours » et devient ton ticket actif (affiché en bas à droite).', 'Le demandeur et l’équipe savent que quelqu’un s’en occupe. Tant qu’il n’est pas pris en charge, les outils restent en lecture seule.', 'taken', 'sd']);
    steps.push(['Qualifie le ticket', 'Dans le formulaire du ticket, choisis : Type = ' + L(DS.types, s.type[0]) + ' · Catégorie = ' + L(DS.categories, s.cat[0]) + ' · Impact = ' + L(DS.impacts, s.impact) + ' · Urgence = ' + L(DS.urgencies, s.urgency) + (vip ? ' · coche « Relever d’un niveau (règle VIP) »' : '') + '. Priorité obtenue : ' + DS.prioLabels[exp] + '.',
      'Impact ' + L(DS.impacts, s.impact).toLowerCase() + ' : ' + H(DS.impacts, s.impact).toLowerCase() + '. Urgence ' + L(DS.urgencies, s.urgency).toLowerCase() + ' : ' + H(DS.urgencies, s.urgency).toLowerCase() + '.' + (vip ? ' Le demandeur fait partie du comité de direction : la règle VIP relève la priorité d’un niveau.' : '') + (s.prio && DS.users[s.req].vip ? ' Ici la règle VIP ne s’applique pas : rien ne prouve que l’appelant est vraiment le DAF.' : ''),
      (f, tk) => s.type.includes(tk.fields.type) && s.cat.includes(tk.fields.cat) && DS.myPrio(tk) === exp, 'sd']);
    steps.push(['Appelle le demandeur', 'Service Desk › bouton « Appeler le demandeur ». Le Softphone s’ouvre et l’appel démarre : tu choisis ensuite ce que tu dis dans la liste.', 'Même quand le ticket arrive par mail ou par le portail, un appel permet de comprendre vite et rassure l’utilisateur.', 'called', 'phone']);
    tu.steps.forEach(x => steps.push(x));
    if (s.out.mode === 'resolve' && !s.qs.some(q => q.id === 'g_confirm' && q.hide)) steps.push(['Fais vérifier que tout fonctionne', 'Softphone › Clôture › « Pouvez-vous vérifier que tout fonctionne maintenant ? »', 'C’est l’utilisateur qui confirme que c’est réglé, pas toi. Sinon le ticket risque d’être rouvert.', 'confirmed', 'phone']);
    const team = s.out.mode === 'escalate' ? (DS.teams.find(x => x.id === s.out.team) || {}).label : '';
    steps.push(['Clôture le ticket', 'Service Desk › onglet « Résolution » › Issue : ' + (s.out.mode === 'escalate' ? '« Escalader », équipe « ' + team + ' »' : '« Résoudre »') + ' › Cause : « ' + s.causes[0] + ' » › Message : « ' + s.closing[0].slice(0, 90) + '… » › Note : écris ce que tu as constaté et fait, par exemple : « ' + (tu.note || '') + ' » › bouton « ' + (s.out.mode === 'escalate' ? 'Transférer le ticket' : 'Résoudre le ticket') + ' ».',
      s.out.mode === 'escalate' ? 'Le support de premier niveau ne répare pas tout : il transmet vite à la bonne équipe, avec une note qui évite de refaire les tests.' : 'Une note précise sert au collègue qui retombera sur le même problème, et le message au demandeur doit être clair et sans jargon.', () => false, 'sd']);
    return steps.map(x => ({ t: x[0], how: x[1], why: x[2], done: x[3], app: x[4] }));
  };
  DS.tutoDone = function (step, t) {
    const f = DS.F(t);
    try { return typeof step.done === 'function' ? !!step.done(f, t) : f(step.done); } catch (e) { return false; }
  };
})();
