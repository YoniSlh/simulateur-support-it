/* DeskSim — Base de connaissances (articles pédagogiques) */
window.DS = window.DS || {};

DS.kb = [
  {
    id: 'methode',
    title: 'Méthode de dépannage en 7 étapes',
    cat: 'Méthode',
    minutes: 4,
    summary: 'La démarche à suivre sur chaque ticket, du premier appel à la clôture.',
    body: `
<p>Un bon technicien N1 ne connaît pas toutes les pannes par cœur. Il applique la même méthode à chaque ticket, ce qui lui évite d’oublier une étape ou de partir sur une fausse piste.</p>
<h3>1. Écouter et qualifier</h3>
<p>Laissez l’utilisateur expliquer sans l’interrompre, puis posez les questions de base : quel est le message d’erreur exact, depuis quand, qui est touché, qu’est-ce qui a changé récemment. Qualifiez ensuite le ticket : type (incident ou demande), catégorie, impact et urgence.</p>
<h3>2. Reproduire</h3>
<p>Demandez à l’utilisateur de refaire la manipulation pendant que vous regardez (prise en main à distance, avec son accord). Un message lu à l’écran vaut mieux qu’un souvenir approximatif.</p>
<h3>3. Isoler</h3>
<ul>
<li>Un seul utilisateur ou plusieurs ? Si tout un service est touché, cherchez du côté du serveur, du réseau ou de l’imprimante partagée.</li>
<li>Un seul poste ou tous les postes de cette personne ?</li>
<li>Une seule application ou tout le poste ?</li>
</ul>
<h3>4. Formuler des hypothèses, de la plus simple à la plus complexe</h3>
<p>Câble débranché, compte verrouillé, mauvais périphérique sélectionné : vérifiez les causes simples et fréquentes avant d’envisager une réinstallation.</p>
<h3>5. Agir</h3>
<p>Faites <strong>une seule modification à la fois</strong> et notez-la dans le ticket. Si vous changez trois choses d’un coup, vous ne saurez pas laquelle a réglé le problème.</p>
<h3>6. Vérifier avec l’utilisateur</h3>
<p>Demandez-lui de tester : se connecter, imprimer, ouvrir le dossier. Ne clôturez jamais un ticket sans cette confirmation.</p>
<h3>7. Documenter</h3>
<p>Rédigez la note de résolution : cause trouvée, actions réalisées, résultat. Le prochain technicien qui aura le même cas gagnera du temps.</p>
<div class="callout">La question la plus utile du métier : « Qu’est-ce qui a changé depuis la dernière fois que ça fonctionnait ? » Un déménagement, une mise à jour, un nouveau casque ou un logiciel installé expliquent une grande partie des pannes.</div>
<div class="callout warn">Évitez les actions lourdes (réinstaller Windows, recréer un profil, remplacer un PC) tant que les causes simples n’ont pas été écartées.</div>
`
  },
  {
    id: 'itil',
    title: 'Incident, demande, problème, changement',
    cat: 'Méthode',
    minutes: 4,
    summary: 'Les quatre types de tickets ITIL et le cycle de vie d’un ticket.',
    body: `
<p>ITIL est un référentiel de bonnes pratiques utilisé par la plupart des services informatiques. Il donne un vocabulaire commun. Au centre de services de Ostral Biologie, chaque ticket reçoit un type.</p>
<table>
<thead><tr><th>Type</th><th>Définition</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td><strong>Incident</strong></td><td>Quelque chose qui fonctionnait ne fonctionne plus, ou fonctionne mal.</td><td>Outlook ne reçoit plus de mails depuis ce matin.</td></tr>
<tr><td><strong>Demande de service</strong></td><td>Un besoin nouveau et prévu par le catalogue : accès, compte, installation, matériel.</td><td>Créer le compte d’un nouvel arrivant, installer un logiciel du Centre logiciel.</td></tr>
<tr><td><strong>Problème</strong></td><td>La cause inconnue d’un ou plusieurs incidents. Géré par le N2/N3.</td><td>La même erreur d’impression revient chaque lundi chez 15 personnes.</td></tr>
<tr><td><strong>Changement</strong></td><td>Une modification planifiée et validée de l’infrastructure.</td><td>Remplacer le serveur de fichiers srv-fic-02 un samedi.</td></tr>
</tbody>
</table>
<p>Au N1, vous traitez surtout des incidents et des demandes. Le bon type compte : une demande se planifie, un incident se rétablit le plus vite possible.</p>
<h3>Cycle de vie d’un ticket</h3>
<ol>
<li><strong>Nouveau</strong> : le ticket arrive (téléphone, mail, portail).</li>
<li><strong>En cours</strong> : vous l’avez pris en charge et il porte votre nom.</li>
<li><strong>En attente</strong> : vous attendez l’utilisateur (une capture, une disponibilité) ou un tiers (fournisseur, autre équipe).</li>
<li><strong>Escaladé</strong> : il est assigné à une équipe de niveau 2 ou à la cellule sécurité.</li>
<li><strong>Résolu</strong> : la solution est appliquée <em>et</em> l’utilisateur a confirmé que tout fonctionne.</li>
<li><strong>Clos</strong> : le ticket est archivé, automatiquement après quelques jours ou à la confirmation de l’utilisateur.</li>
</ol>
<div class="callout">Un ticket = un sujet. Si l’utilisateur signale une deuxième panne sans rapport pendant l’appel, ouvrez un second ticket. Le suivi et les statistiques restent justes.</div>
<div class="callout warn">Passer un ticket à « Résolu » sans confirmation de l’utilisateur est l’erreur la plus fréquente des débutants. Le ticket revient, et l’utilisateur perd confiance.</div>
`
  },
  {
    id: 'priorite',
    title: 'Calculer la priorité d’un ticket',
    cat: 'Procédures',
    minutes: 4,
    summary: 'La matrice impact × urgence, les délais cibles (SLA) et la règle VIP.',
    body: `
<p>La priorité ne dépend pas de qui crie le plus fort. Elle se calcule à partir de deux critères.</p>
<ul>
<li><strong>Impact</strong> : combien de personnes sont touchées. Élevé = plusieurs services ou toute l’entreprise ; Moyen = un service ou un groupe ; Faible = un seul utilisateur.</li>
<li><strong>Urgence</strong> : à quel point le travail est bloqué. Haute = bloqué sans contournement ; Moyenne = dégradé, contournement possible ; Basse = gêne mineure ou besoin planifié.</li>
</ul>
<h3>Matrice de Ostral Biologie</h3>
<table>
<thead><tr><th>Impact \\ Urgence</th><th>Haute</th><th>Moyenne</th><th>Basse</th></tr></thead>
<tbody>
<tr><td><strong>Élevé</strong></td><td>P1</td><td>P2</td><td>P3</td></tr>
<tr><td><strong>Moyen</strong></td><td>P2</td><td>P3</td><td>P4</td></tr>
<tr><td><strong>Faible</strong></td><td>P3</td><td>P4</td><td>P4</td></tr>
</tbody>
</table>
<h3>Délais de résolution cibles (SLA)</h3>
<table>
<thead><tr><th>Priorité</th><th>Délai cible</th></tr></thead>
<tbody>
<tr><td>P1 – Critique</td><td>1 h</td></tr>
<tr><td>P2 – Haute</td><td>4 h</td></tr>
<tr><td>P3 – Moyenne</td><td>8 h (1 jour ouvré)</td></tr>
<tr><td>P4 – Basse</td><td>24 h (3 jours ouvrés)</td></tr>
</tbody>
</table>
<h3>Règle VIP</h3>
<p>Pour les membres du comité de direction, la priorité est relevée d’un niveau : un P3 devient P2.</p>
<h3>Exemples</h3>
<ul>
<li>Camille ne peut plus ouvrir sa session : un utilisateur, travail bloqué → Faible + Haute = <strong>P3</strong>.</li>
<li>Le deuxième écran de Karim ne s’affiche pas, il travaille sur un seul écran → Faible + Moyenne = <strong>P4</strong>.</li>
<li>Le DAF n’a plus de micro dans Teams 15 minutes avant une visio → Faible + Haute = P3, relevé à <strong>P2</strong> par la règle VIP.</li>
<li>La messagerie est en panne pour toute l’entreprise → Élevé + Haute = <strong>P1</strong>.</li>
</ul>
<div class="callout">Quand l’arrêt d’un service bloque l’activité de l’entreprise (plateau technique à l’arrêt et plus aucun résultat ne sort, par exemple), l’impact est considéré comme élevé.</div>
`
  },
  {
    id: 'identite',
    title: 'Vérifier l’identité d’un appelant',
    cat: 'Procédures',
    minutes: 3,
    summary: 'La procédure obligatoire avant toute action sur un compte.',
    body: `
<p>Au téléphone, n’importe qui peut prétendre être Camille de la facturation. Une réinitialisation de mot de passe accordée à la mauvaise personne lui ouvre la messagerie, les dossiers partagés et parfois les virements. La vérification d’identité est donc obligatoire, même quand on reconnaît la voix.</p>
<h3>La procédure</h3>
<ol>
<li><strong>Demandez le matricule</strong> (format OS-xxxxx) et comparez-le à la fiche de l’utilisateur dans l’annuaire Active Directory.</li>
<li><strong>Pour un mot de passe ou une clé BitLocker</strong>, rappelez l’utilisateur sur le numéro inscrit dans l’annuaire (son poste fixe, par exemple le 2214), jamais sur un numéro qu’il vous donne pendant l’appel. Si c’est impossible, faites valider la demande par son manager.</li>
<li><strong>Tracez la vérification</strong> dans le ticket : « Identité vérifiée : matricule conforme + rappel au 2214 ».</li>
</ol>
<h3>Les pièges classiques</h3>
<ul>
<li><strong>Confirmer à la place de l’appelant</strong> : ne dites jamais « Votre matricule, c’est bien OS-10482 ? ». Demandez-lui de le donner.</li>
<li><strong>L’urgence et l’autorité</strong> : « Je suis le directeur, je n’ai pas le temps. » La procédure s’applique à tout le monde, VIP compris.</li>
<li><strong>Le collègue serviable</strong> : « J’appelle pour ma collègue qui est en réunion. » La personne concernée appelle elle-même, ou son manager valide.</li>
<li><strong>L’adresse personnelle</strong> : une demande d’envoi sur une adresse Gmail ou un numéro inconnu est un signal d’alerte.</li>
</ul>
<div class="callout">Formulation simple et polie : « Pour protéger votre compte, je dois vérifier votre identité. Pouvez-vous me donner votre matricule ? Je vais ensuite vous rappeler sur votre poste. »</div>
<div class="callout warn">Si le matricule ne correspond pas, ou si l’appelant refuse le rappel, ne faites aucune action sur le compte. Notez les informations de l’appel (heure, numéro, demande) et escaladez à la cellule sécurité.</div>
`
  },
  {
    id: 'ad',
    title: 'Active Directory pour le N1',
    cat: 'Active Directory',
    minutes: 5,
    summary: 'Utilisateurs, groupes, OU, et la différence entre un compte verrouillé, expiré ou désactivé.',
    body: `
<p>Active Directory (AD) est l’annuaire de l’entreprise. Il contient les comptes des salariés, les ordinateurs et les groupes qui donnent les droits. Le domaine d’Ostral s’appelle <code>OSTRAL</code> (ostral.local).</p>
<h3>Les objets que vous manipulez</h3>
<ul>
<li><strong>Utilisateur</strong> : identifiant au format <code>prenom.nom</code> (ex. <code>camille.roussel</code>), matricule, service, téléphone, manager.</li>
<li><strong>Unité d’organisation (OU)</strong> : un dossier qui range les comptes par service, par exemple <code>OU=Facturation,OU=Utilisateurs,DC=ostral,DC=local</code>.</li>
<li><strong>Groupe</strong> : il donne un accès. Les groupes commençant par <code>GG_</code> sont des groupes globaux : <code>GG_Facturation</code> ouvre le dossier <code>\\\\srv-fic-01\\Facturation</code>, <code>GG_VPN_Users</code> autorise le VPN.</li>
<li><strong>Ordinateur</strong> : chaque poste (ex. <code>PC-FAC-014</code>) a son objet, qui stocke notamment les clés BitLocker.</li>
</ul>
<h3>Verrouillé, expiré ou désactivé</h3>
<table>
<thead><tr><th>État</th><th>Cause</th><th>Action du N1</th></tr></thead>
<tbody>
<tr><td><strong>Verrouillé</strong></td><td>5 mots de passe erronés. Déverrouillage automatique après 30 min.</td><td>Vérifier l’identité, déverrouiller, chercher la cause (mot de passe oublié, ancien mot de passe enregistré sur le téléphone).</td></tr>
<tr><td><strong>Mot de passe expiré</strong></td><td>Le mot de passe a plus de 90 jours.</td><td>Faire changer le mot de passe, ou le réinitialiser après vérification d’identité.</td></tr>
<tr><td><strong>Désactivé</strong></td><td>Décision volontaire : départ, longue absence, sécurité.</td><td>Ne jamais réactiver sans validation du manager ou des RH.</td></tr>
</tbody>
</table>
<h3>Le jeton de groupes</h3>
<p>Quand un utilisateur ouvre sa session, Windows lit la liste de ses groupes et la garde en mémoire dans un jeton (ticket Kerberos). Si vous l’ajoutez à un groupe pendant la journée, ce nouveau droit n’est <strong>pas</strong> pris en compte tout de suite. Il doit fermer puis rouvrir sa session. Pour certains accès réseau, <code>klist purge</code> suivi d’une reconnexion au partage suffit.</p>
<div class="callout">Lisez toujours la fiche entière avant d’agir : état du compte, date du dernier changement de mot de passe, nombre d’essais ratés, groupes. Elle donne souvent la réponse.</div>
<div class="callout warn">Les groupes <code>GG_Admins_Postes</code> et <code>Admins du domaine</code> sont réservés à l’IT. Un N1 n’y ajoute jamais un utilisateur.</div>
`
  },
  {
    id: 'mdp',
    title: 'Réinitialiser un mot de passe proprement',
    cat: 'Procédures',
    minutes: 4,
    summary: 'La politique de mot de passe et les étapes d’une réinitialisation sûre.',
    body: `
<h3>Politique de Ostral Biologie</h3>
<ul>
<li>12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.</li>
<li>Expiration tous les 90 jours.</li>
<li>Verrouillage du compte pendant 30 minutes après 5 essais ratés.</li>
</ul>
<h3>Les étapes</h3>
<ol>
<li><strong>Vérifier l’identité</strong> : matricule comparé à l’annuaire, puis rappel sur le numéro de l’annuaire (voir l’article sur la vérification d’identité).</li>
<li><strong>Choisir un mot de passe temporaire conforme</strong>, différent à chaque fois. Exemple de construction : trois mots, des chiffres et un symbole, comme <code>Tube-Orange-47!</code>.</li>
<li><strong>Cocher « L’utilisateur doit changer le mot de passe à la prochaine ouverture de session »</strong>. Ainsi, vous seul et l’utilisateur avez connu le mot de passe temporaire, et seulement quelques minutes.</li>
<li><strong>Déverrouiller le compte</strong> s’il est verrouillé : la réinitialisation ne le fait pas toujours.</li>
<li><strong>Communiquer le mot de passe à l’oral</strong>, au téléphone, en épelant les caractères ambigus (l majuscule ou i, zéro ou O).</li>
<li><strong>Rester en ligne</strong> pendant que l’utilisateur se connecte et choisit son nouveau mot de passe.</li>
<li><strong>Noter dans le ticket</strong> ce qui a été fait, sans jamais écrire le mot de passe.</li>
</ol>
<h3>Ce qu’il ne faut jamais faire</h3>
<ul>
<li>Envoyer le mot de passe par mail, chat ou SMS : ces messages sont conservés, transférés et parfois piratés.</li>
<li>Utiliser le même mot de passe temporaire pour tout le monde (« Ostral2026! »).</li>
<li>Demander à l’utilisateur son mot de passe actuel. Le support n’en a jamais besoin.</li>
<li>Décocher le changement obligatoire « pour aller plus vite ».</li>
</ul>
<div class="callout">Si le compte se reverrouille dans l’heure, cherchez un appareil qui tente encore l’ancien mot de passe : smartphone avec la messagerie, Outlook resté ouvert sur un autre poste, lecteur réseau enregistré.</div>
`
  },
  {
    id: 'reseau',
    title: 'Les bases du réseau pour le support',
    cat: 'Réseau',
    minutes: 6,
    summary: 'Adresse IP, masque, passerelle, DNS, DHCP, APIPA, Wi-Fi et portail captif.',
    body: `
<h3>Les quatre réglages d’un poste</h3>
<table>
<thead><tr><th>Réglage</th><th>Rôle</th><th>Valeur chez Ostral</th></tr></thead>
<tbody>
<tr><td>Adresse IP</td><td>L’adresse du poste sur le réseau.</td><td>10.20.x.x (ex. 10.20.2.114)</td></tr>
<tr><td>Masque</td><td>Indique quelles adresses sont « locales ».</td><td>255.255.0.0 (réseau 10.20.0.0/16)</td></tr>
<tr><td>Passerelle</td><td>La porte de sortie vers les autres réseaux et internet.</td><td>10.20.x.1</td></tr>
<tr><td>DNS</td><td>Traduit un nom (srv-fic-01) en adresse IP (10.20.1.21).</td><td>10.20.1.10 et 10.20.1.11 (srv-dc-01 et srv-dc-02)</td></tr>
</tbody>
</table>
<p>Ces réglages sont distribués automatiquement par le serveur <strong>DHCP</strong> quand le poste se branche. Cette attribution s’appelle un bail.</p>
<h3>L’adresse 169.254.x.x (APIPA)</h3>
<p>Si <code>ipconfig</code> affiche une adresse en 169.254, le poste n’a reçu aucune réponse du DHCP et s’est donné une adresse au hasard. Il ne peut joindre personne. Causes fréquentes : câble mal enfoncé, câble abîmé, ou <strong>prise murale non brassée</strong>. Dans les bureaux, chaque boîtier mural a souvent deux prises (A et B) et seules celles reliées au switch fonctionnent. Après un déménagement, l’utilisateur se branche souvent sur la mauvaise. Le voyant de la carte réseau éteint est un bon indice. Une fois le câble corrigé, <code>ipconfig /renew</code> redemande une adresse.</p>
<h3>Ordre de diagnostic</h3>
<ol>
<li><code>ipconfig</code> : le poste a-t-il une adresse valide ?</li>
<li><code>ping</code> de la passerelle : le réseau local répond-il ?</li>
<li><code>ping 8.8.8.8</code> : internet est-il joignable par adresse ?</li>
<li><code>nslookup google.fr</code> : la traduction des noms fonctionne-t-elle ?</li>
<li><code>ping srv-fic-01</code> : le serveur visé répond-il ?</li>
</ol>
<p>Si le ping par adresse fonctionne mais pas le ping par nom, le problème vient du DNS.</p>
<h3>Wi-Fi</h3>
<ul>
<li><strong>OSTRAL-CORP</strong> : réservé aux postes de l’entreprise, connexion avec les identifiants Windows.</li>
<li><strong>OSTRAL-INVITE</strong> : pour les visiteurs, avec un code temporaire généré sur le portail invité. Ne donnez jamais vos identifiants ni ceux d’un collègue à un visiteur.</li>
</ul>
<h3>Portail captif et VPN</h3>
<p>Dans un hôtel ou une gare, le Wi-Fi impose souvent d’accepter des conditions sur une page web avant d’ouvrir l’accès à internet. Tant que ce n’est pas fait, le VPN (<code>vpn.ostral-bio.fr</code>) ne peut pas se connecter. Faites ouvrir le navigateur sur un site quelconque pour faire apparaître la page de l’hôtel, accepter, puis relancer le VPN.</p>
`
  },
  {
    id: 'commandes',
    title: 'Commandes Windows essentielles',
    cat: 'Windows',
    minutes: 6,
    summary: 'Les commandes de l’invite de commandes et de PowerShell qu’un N1 utilise chaque jour.',
    body: `
<p>Ouvrez l’invite de commandes (<code>cmd</code>) ou PowerShell. Les commandes ci-dessous ne modifient rien, sauf celles indiquées.</p>
<h3>Réseau</h3>
<table>
<thead><tr><th>Commande</th><th>À quoi elle sert</th><th>Quand l’utiliser</th></tr></thead>
<tbody>
<tr><td><code>ipconfig</code></td><td>Adresse IP, masque, passerelle.</td><td>Premier réflexe sur tout souci réseau.</td></tr>
<tr><td><code>ipconfig /all</code></td><td>Tout le détail : adresse MAC, DHCP, serveurs DNS.</td><td>Vérifier les DNS ou relever la MAC.</td></tr>
<tr><td><code>ipconfig /release</code> puis <code>/renew</code></td><td>Rend puis redemande une adresse au DHCP.</td><td>Adresse 169.254 après correction du câble.</td></tr>
<tr><td><code>ipconfig /flushdns</code></td><td>Vide le cache DNS du poste.</td><td>Un site ou serveur a changé d’adresse.</td></tr>
<tr><td><code>ping srv-fic-01</code></td><td>Teste si une machine répond.</td><td>Savoir si un serveur est joignable.</td></tr>
<tr><td><code>tracert 8.8.8.8</code></td><td>Montre le chemin, routeur par routeur.</td><td>Trouver où la connexion s’arrête.</td></tr>
<tr><td><code>nslookup intranet.ostral-bio.fr</code></td><td>Interroge le DNS.</td><td>Vérifier qu’un nom donne la bonne adresse.</td></tr>
<tr><td><code>Test-NetConnection srv-fic-01 -Port 445</code></td><td>Teste un port précis (PowerShell).</td><td>Le ping passe mais le service ne répond pas.</td></tr>
<tr><td><code>net use</code></td><td>Liste les lecteurs réseau (S:, P:).</td><td>Lecteur absent ou déconnecté.</td></tr>
</tbody>
</table>
<h3>Compte et stratégies</h3>
<table>
<thead><tr><th>Commande</th><th>À quoi elle sert</th><th>Quand l’utiliser</th></tr></thead>
<tbody>
<tr><td><code>hostname</code></td><td>Nom du poste.</td><td>Identifier la machine de l’utilisateur.</td></tr>
<tr><td><code>whoami</code> / <code>whoami /groups</code></td><td>Compte connecté et ses groupes.</td><td>Vérifier qu’un droit est bien actif.</td></tr>
<tr><td><code>net user camille.roussel /domain</code></td><td>Fiche du compte dans le domaine.</td><td>État du compte, dernier changement de mot de passe.</td></tr>
<tr><td><code>gpupdate /force</code></td><td>Réapplique les stratégies de groupe (modifie).</td><td>Un réglage poussé par l’IT n’est pas arrivé.</td></tr>
<tr><td><code>gpresult /r</code></td><td>Liste les stratégies appliquées.</td><td>Vérifier qu’une stratégie est bien reçue.</td></tr>
<tr><td><code>klist purge</code></td><td>Vide les tickets Kerberos (modifie).</td><td>Après un ajout à un groupe, pour certains accès.</td></tr>
</tbody>
</table>
<h3>Poste de travail</h3>
<table>
<thead><tr><th>Commande</th><th>À quoi elle sert</th><th>Quand l’utiliser</th></tr></thead>
<tbody>
<tr><td><code>systeminfo</code></td><td>Version de Windows, heure de démarrage, mémoire.</td><td>PC lent : depuis quand n’a-t-il pas redémarré ?</td></tr>
<tr><td><code>tasklist</code> / <code>taskkill /im nom.exe</code></td><td>Liste ou arrête un processus.</td><td>Application figée, processus suspect.</td></tr>
<tr><td><code>sfc /scannow</code></td><td>Vérifie et répare les fichiers système (modifie).</td><td>Erreurs Windows inexpliquées.</td></tr>
<tr><td><code>Get-Service Spooler</code></td><td>État d’un service (PowerShell).</td><td>Impression bloquée.</td></tr>
<tr><td><code>Restart-Service Spooler</code></td><td>Redémarre un service (modifie).</td><td>Vider une file d’impression bloquée.</td></tr>
<tr><td><code>Get-PSDrive C</code></td><td>Espace utilisé et libre du disque.</td><td>Message « espace disque insuffisant ».</td></tr>
</tbody>
</table>
<div class="callout">Copiez le résultat utile d’une commande dans votre note interne. Il servira de preuve si vous devez escalader.</div>
`
  },
  {
    id: 'impression',
    title: 'Dépanner une impression',
    cat: 'Matériel',
    minutes: 4,
    summary: 'File d’attente bloquée, spouleur, et la question qui oriente tout le diagnostic.',
    body: `
<h3>La première question</h3>
<p>« Vos collègues arrivent-ils à imprimer sur la même imprimante ? » La réponse oriente tout le diagnostic.</p>
<ul>
<li><strong>Tout le service est bloqué</strong> : le problème est sur l’imprimante (papier, bourrage, toner, message sur l’écran de l’imprimante, câble réseau) ou sur le serveur d’impression <code>srv-print-01</code>. Un seul ticket suffit, l’impact est moyen.</li>
<li><strong>Une seule personne est bloquée</strong> : le problème est sur son poste (file d’attente, service spouleur, pilote, droits).</li>
</ul>
<h3>La file d’attente bloquée</h3>
<p>Windows envoie les documents à l’imprimante dans l’ordre. Si un document passe en « Erreur », il bloque tous ceux qui suivent. L’utilisateur voit ses documents « en attente » et rien ne sort.</p>
<ol>
<li>Ouvrez la file d’attente de l’imprimante (Paramètres &gt; Imprimantes, ou <code>Get-PrintJob -PrinterName IMP-FAC-01</code>).</li>
<li>Annulez tous les documents de la file.</li>
<li>Si la file ne se vide pas, redémarrez le service <strong>Spouleur d’impression</strong> : <code>Restart-Service Spooler</code>.</li>
<li>Faites imprimer une page de test et demandez à l’utilisateur de relancer son document.</li>
</ol>
<h3>Autres causes côté poste</h3>
<ul>
<li>L’utilisateur imprime sur la mauvaise imprimante (imprimante par défaut d’un ancien bureau).</li>
<li>Il n’est pas membre du groupe de l’imprimante, par exemple <code>GG_Impression_Facturation</code> pour IMP-FAC-01.</li>
<li>Le pilote est corrompu : la réinstallation vient <strong>après</strong> le vidage de la file et le redémarrage du spouleur.</li>
</ul>
<div class="callout">Commandes utiles : <code>Get-Printer</code> (imprimantes installées), <code>Get-Service Spooler</code> (état du spouleur), <code>Get-PrintJob</code> (documents en file).</div>
<div class="callout warn">N’appelez pas le prestataire de maintenance de l’imprimante si les collègues impriment sans souci : la panne est sur le poste.</div>
`
  },
  {
    id: 'outlook',
    title: 'Outlook : les pannes classiques',
    cat: 'Messagerie',
    minutes: 4,
    summary: 'Boîte pleine, mode hors connexion, mode cache et profil.',
    body: `
<h3>Boîte aux lettres pleine</h3>
<p>Chaque boîte a un quota de 50 Go. À l’approche du quota, Outlook affiche un bandeau d’avertissement. Une fois plein, l’utilisateur ne peut plus envoyer, puis ne reçoit plus rien : les expéditeurs reçoivent un message d’erreur.</p>
<ol>
<li>Vérifiez l’occupation dans la fiche de messagerie (ex. 49,8 Go sur 50).</li>
<li>Faites vider le dossier <strong>Éléments supprimés</strong> et le <strong>Courrier indésirable</strong> : c’est souvent plusieurs Go.</li>
<li>Faites trier les mails par taille et enregistrer les grosses pièces jointes sur le partage du service ou OneDrive, puis supprimer les mails concernés.</li>
<li>Proposez l’archive en ligne pour les anciens mails.</li>
<li>Faites un envoi de test et vérifiez la réception.</li>
</ol>
<p>Augmenter le quota reste une exception, validée par le N2, pas la solution par défaut.</p>
<h3>« Travailler hors connexion »</h3>
<p>Si la barre d’état indique « Déconnecté » ou « Travail hors connexion », Outlook ne synchronise plus. Vérifiez l’onglet Envoi/Réception : le bouton « Travailler hors connexion » a pu être activé par erreur.</p>
<h3>Mode Exchange mis en cache</h3>
<p>Outlook garde une copie locale de la boîte dans un fichier OST. Si la recherche ne trouve plus rien ou si des dossiers sont incohérents, ce fichier peut être abîmé. Le N1 peut le faire reconstruire en fermant Outlook et en renommant le fichier OST : il est retéléchargé.</p>
<h3>Profil Outlook</h3>
<p>En dernier recours, créez un nouveau profil Outlook (Panneau de configuration &gt; Courrier). C’est plus long : à réserver aux cas où les causes simples ont été écartées.</p>
<div class="callout">Le webmail (<code>outlook.office365.com</code>) sert de test rapide : si les mails y arrivent, la boîte fonctionne et le problème vient d’Outlook sur le poste.</div>
`
  },
  {
    id: 'teams',
    title: 'Teams : son, micro et caméra',
    cat: 'Messagerie',
    minutes: 3,
    summary: 'Régler un micro ou un casque qui ne fonctionne pas dans Teams.',
    body: `
<p>La plupart des pannes audio dans Teams viennent d’un mauvais périphérique sélectionné, surtout après le branchement d’un nouveau casque. Teams continue d’utiliser le micro intégré du PC ou un ancien casque.</p>
<h3>Les vérifications, dans l’ordre</h3>
<ol>
<li><strong>Le casque est-il branché ou appairé ?</strong> Un casque Bluetooth doit apparaître « Connecté » dans les paramètres Bluetooth.</li>
<li><strong>Le micro est-il coupé ?</strong> Bouton de sourdine sur le casque, sur le clavier, ou micro barré dans Teams.</li>
<li><strong>Teams &gt; Paramètres &gt; Périphériques</strong> : choisissez le casque (ex. « Jabra Evolve2 ») comme haut-parleur <em>et</em> comme micro.</li>
<li><strong>Passer un appel test</strong> depuis la même page : Teams enregistre un message et le rejoue.</li>
<li><strong>Autorisations Windows</strong> : Paramètres &gt; Confidentialité et sécurité &gt; Microphone, l’accès doit être autorisé pour les applications.</li>
</ol>
<h3>Le cas pressé</h3>
<p>Si la réunion commence dans quelques minutes, privilégiez ce qui marche vite. Le changement de périphérique prend une minute. En contournement, l’utilisateur peut rejoindre la réunion depuis Teams sur son smartphone.</p>
<div class="callout warn">Réinstaller Teams prend plus de temps qu’il n’en reste avant la réunion et ne corrige pas un mauvais choix de périphérique. Gardez cette option pour plus tard.</div>
<div class="callout">Pour un membre du comité de direction, n’oubliez pas la règle VIP lors de la qualification : la priorité est relevée d’un niveau.</div>
`
  },
  {
    id: 'phishing',
    title: 'Phishing : reconnaître et réagir',
    cat: 'Sécurité',
    minutes: 5,
    summary: 'Les indices d’un mail frauduleux et la conduite à tenir si l’utilisateur a saisi son mot de passe.',
    body: `
<p>Le phishing (hameçonnage) est un mail qui imite un service connu pour voler des identifiants ou installer un logiciel malveillant. C’est la première porte d’entrée des attaques en entreprise.</p>
<h3>Les indices</h3>
<ul>
<li><strong>Le domaine de l’expéditeur</strong> : le nom affiché dit « Service Informatique », mais l’adresse est <code>it-support@ostral-securite365.com</code>. Le vrai domaine de l’entreprise est <code>ostral-bio.fr</code>.</li>
<li><strong>L’urgence ou la menace</strong> : « Votre compte sera supprimé ce soir ».</li>
<li><strong>Le lien</strong> : au survol, l’adresse réelle ne pointe pas vers un site d’Ostral ou de Microsoft.</li>
<li><strong>La demande d’identifiants</strong> : le service informatique ne demande jamais un mot de passe par mail.</li>
<li>Pièce jointe inattendue, fautes, salutation impersonnelle.</li>
</ul>
<h3>La conduite à tenir</h3>
<table>
<thead><tr><th>Situation</th><th>Action</th></tr></thead>
<tbody>
<tr><td>L’utilisateur a seulement reçu le mail</td><td>Le remercier, lui faire utiliser le bouton « Signaler ».</td></tr>
<tr><td>Il a cliqué, sans rien saisir</td><td>Analyse antivirus du poste, signalement à la cellule sécurité.</td></tr>
<tr><td>Il a saisi son mot de passe</td><td>Urgence : voir ci-dessous.</td></tr>
</tbody>
</table>
<h3>Si le mot de passe a été saisi</h3>
<ol>
<li>Vérifiez l’identité, puis <strong>réinitialisez immédiatement le mot de passe</strong>.</li>
<li><strong>Révoquez les sessions</strong> ouvertes (Entra ID / Microsoft 365) pour déconnecter un éventuel attaquant déjà connecté.</li>
<li>Demandez à l’utilisateur de <strong>ne pas supprimer le mail</strong> : les analystes en ont besoin, avec ses en-têtes.</li>
<li><strong>Escaladez à la cellule sécurité (RSSI / SOC)</strong> en précisant l’heure du clic, ce qui a été saisi, et les actions déjà faites.</li>
</ol>
<div class="callout">Ne reprochez rien à l’utilisateur. Une personne qui signale vite son erreur rend un vrai service : remerciez-la. Celle qui a peur d’être grondée ne signalera pas la prochaine fois.</div>
<div class="callout warn">Le phishing touche souvent plusieurs personnes en même temps. Le signalement à la cellule sécurité permet de bloquer l’expéditeur pour toute l’entreprise.</div>
`
  },
  {
    id: 'ingenierie-sociale',
    title: 'Faux appels et fraude au président',
    cat: 'Sécurité',
    minutes: 4,
    summary: 'Reconnaître la manipulation par téléphone et y répondre sans se mettre en faute.',
    body: `
<p>L’ingénierie sociale consiste à manipuler une personne plutôt qu’un système. Le support informatique est une cible de choix, parce qu’il a le pouvoir de réinitialiser des mots de passe et qu’il veut aider.</p>
<h3>Les leviers utilisés</h3>
<ul>
<li><strong>L’urgence</strong> : « Je dois valider un virement dans dix minutes. »</li>
<li><strong>L’autorité</strong> : « Je suis le directeur financier, vous savez qui je suis ? »</li>
<li><strong>La sympathie</strong> : « Vous êtes le seul à pouvoir m’aider, les autres ne comprennent rien. »</li>
<li><strong>Le contournement de la procédure</strong> : envoyer le mot de passe sur une adresse Gmail, rappeler sur un numéro de portable inconnu, ne pas « déranger » le manager.</li>
</ul>
<h3>La fraude au président</h3>
<p>Un escroc se fait passer pour un dirigeant afin d’obtenir un accès ou un virement. Il appelle souvent un vendredi soir ou pendant les vacances, dit être en déplacement, et insiste sur la confidentialité.</p>
<h3>Comment répondre</h3>
<ol>
<li>Restez poli et calme. Vous appliquez une procédure, vous n’accusez personne.</li>
<li>Appliquez la vérification d’identité : matricule, puis rappel sur le numéro de l’annuaire.</li>
<li>Refusez tout envoi vers une adresse ou un numéro qui n’est pas dans l’annuaire.</li>
<li>Ne faites aucune action sur le compte tant que l’identité n’est pas confirmée.</li>
<li>Notez tout : heure, numéro affiché, nom donné, demandes exactes.</li>
<li>Escaladez à la <strong>cellule sécurité (RSSI / SOC)</strong>, même si l’appelant a raccroché.</li>
</ol>
<div class="callout">Phrase type : « Je comprends que c’est urgent. Pour protéger votre compte, je dois vous rappeler sur votre numéro de l’annuaire. Je le fais tout de suite. » Le vrai dirigeant acceptera. L’escroc trouvera une excuse.</div>
<div class="callout warn">Personne ne vous reprochera d’avoir appliqué la procédure, même avec un vrai dirigeant. En revanche, un compte de direction donné à un escroc peut coûter très cher à l’entreprise.</div>
`
  },
  {
    id: 'escalade',
    title: 'Escalader un ticket',
    cat: 'Procédures',
    minutes: 5,
    summary: 'Quand escalader, vers quelle équipe, et comment rédiger une note d’escalade utile.',
    body: `
<p>Escalader, c’est transmettre un ticket à une équipe qui a les compétences ou les droits nécessaires. Ce n’est pas un échec. Garder trop longtemps un ticket qu’on ne peut pas résoudre en est un.</p>
<h3>Quand escalader</h3>
<ul>
<li>La panne est hors de votre périmètre : serveur, switch, matériel à remplacer, droits d’administration.</li>
<li>Plusieurs utilisateurs ou tout un service sont touchés.</li>
<li>Il y a une question de sécurité : phishing, appel suspect, compromission possible.</li>
<li>Vous avez fait un diagnostic raisonnable et vous êtes bloqué.</li>
</ul>
<h3>Vers quelle équipe</h3>
<table>
<thead><tr><th>Équipe</th><th>Exemples</th></tr></thead>
<tbody>
<tr><td>N2 – Systèmes &amp; serveurs</td><td>Serveur de fichiers qui ne répond plus, sauvegarde à restaurer, problème AD avancé.</td></tr>
<tr><td>N2 – Réseau &amp; télécom</td><td>Switch en panne, Wi-Fi d’un étage, VPN en panne pour tout le monde, téléphonie.</td></tr>
<tr><td>Support de proximité</td><td>PC qui ne démarre plus, écran cassé, remplacement de matériel sur site.</td></tr>
<tr><td>Cellule sécurité (RSSI / SOC)</td><td>Phishing, appel suspect, virus, fraude.</td></tr>
<tr><td>Applications métier</td><td>Erreur dans l’ERP ou le CRM.</td></tr>
<tr><td>Prestataire externe</td><td>Panne d’un fabricant, d’un opérateur ou d’un éditeur sous contrat.</td></tr>
</tbody>
</table>
<h3>Une bonne note d’escalade</h3>
<ol>
<li><strong>Symptôme</strong> : ce qui ne fonctionne pas, avec le message exact.</li>
<li><strong>Périmètre</strong> : qui est touché, depuis quand.</li>
<li><strong>Tests effectués</strong> et leurs <strong>résultats</strong>.</li>
<li><strong>Impact et urgence</strong>.</li>
<li><strong>Contact</strong> : qui joindre et comment.</li>
</ol>
<pre>Lecteur S: inaccessible pour tout le plateau technique depuis 9 h 40
(environ 20 utilisateurs, fiches de paillasse inaccessibles).
Tests : ping srv-fic-02 -> délai d'attente dépassé ;
ping srv-fic-01 -> OK ; nslookup srv-fic-02 -> 10.20.1.22 (DNS OK).
Le serveur srv-fic-02 semble arrêté ou isolé du réseau.
Contact : Mehdi Benali, poste 3105.</pre>
<h3>Incident majeur</h3>
<p>Quand tout un service ou l’entreprise est touché : escaladez immédiatement, rattachez les tickets similaires au ticket principal, et prévenez les utilisateurs de ce qui se passe. Inutile de faire redémarrer chaque PC.</p>
<div class="callout">Après une escalade, restez le point de contact de l’utilisateur : dites-lui à qui le ticket est transmis et quand il aura des nouvelles.</div>
`
  },
  {
    id: 'redaction',
    title: 'Rédiger des notes utiles',
    cat: 'Communication',
    minutes: 3,
    summary: 'Notes internes et notes de résolution : ce qu’il faut écrire, avec des exemples.',
    body: `
<p>Un ticket bien documenté sert à trois personnes : vous-même si le problème revient, le collègue qui reprend le ticket, et le N2 si vous escaladez.</p>
<h3>Deux types d’écrits</h3>
<ul>
<li><strong>La note interne</strong> : visible uniquement par l’IT. Vous y notez les faits techniques, les tests, les résultats.</li>
<li><strong>Le message à l’utilisateur</strong> : en langage simple, sans jargon, poli.</li>
</ul>
<h3>Une note de résolution contient</h3>
<ol>
<li>La <strong>cause</strong> trouvée.</li>
<li>Les <strong>actions</strong> réalisées.</li>
<li>Le <strong>résultat</strong> et la <strong>vérification</strong> faite avec l’utilisateur.</li>
</ol>
<h3>Exemples</h3>
<table>
<thead><tr><th>À éviter</th><th>À préférer</th></tr></thead>
<tbody>
<tr><td>« Réglé. »</td><td>« Compte verrouillé après 5 essais erronés (mot de passe oublié après congés). Identité vérifiée : matricule + rappel au 2214. Compte déverrouillé, mot de passe réinitialisé avec changement obligatoire. Connexion confirmée par l’utilisatrice. »</td></tr>
<tr><td>« Problème réseau, j’ai fait des trucs. »</td><td>« ipconfig : 169.254.x.x (pas de bail DHCP). Câble branché sur la prise murale B non brassée. Rebranché sur la prise A, ipconfig /renew : 10.20.4.57. Internet et lecteur S: OK. »</td></tr>
<tr><td>« Utilisateur pas content, imprimante pourrie. »</td><td>« Document en erreur bloquant la file d’IMP-FAC-01 sur ce poste. File vidée, service Spouleur redémarré, page de test imprimée. »</td></tr>
</tbody>
</table>
<div class="callout warn">N’écrivez jamais un mot de passe, une clé BitLocker ou une information personnelle sensible dans un ticket. Restez factuel : pas de jugement sur l’utilisateur.</div>
<div class="callout">Notez au fil de l’eau, pas à la fin. Vous oublierez le résultat exact du deuxième ping au bout de vingt minutes.</div>
`
  },
  {
    id: 'communication',
    title: 'Bien communiquer avec l’utilisateur',
    cat: 'Communication',
    minutes: 4,
    summary: 'Accueil, empathie, reformulation, vocabulaire et clôture d’un échange.',
    body: `
<p>Pour l’utilisateur, le support, c’est vous. Une panne réglée avec froideur laisse un mauvais souvenir. Une panne longue mais bien expliquée laisse souvent un bon souvenir.</p>
<h3>L’accueil</h3>
<p>« Support informatique, Léa, bonjour. Que puis-je faire pour vous ? » Présentez-vous, puis laissez la personne parler jusqu’au bout.</p>
<h3>L’empathie</h3>
<p>L’utilisateur est souvent stressé : il ne peut pas travailler. Reconnaissez-le avant de poser vos questions : « Je comprends, c’est pénible quand ça arrive juste avant une réunion. On va regarder ça ensemble. »</p>
<h3>La reformulation</h3>
<p>« Si je résume : depuis ce matin, vos documents restent en attente et rien ne sort de l’imprimante, c’est bien ça ? » Vous vérifiez que vous avez compris, et l’utilisateur sent qu’il est écouté.</p>
<h3>Un vocabulaire simple</h3>
<p>Remplacez « votre poste n’a pas obtenu de bail DHCP » par « votre ordinateur n’arrivait pas à se connecter au réseau à cause de la prise utilisée ». Expliquez ce que vous faites pendant une prise en main : l’utilisateur voit sa souris bouger.</p>
<h3>Phrases à éviter</h3>
<table>
<thead><tr><th>À éviter</th><th>À dire plutôt</th></tr></thead>
<tbody>
<tr><td>« Calmez-vous. »</td><td>« Je comprends, on va régler ça. »</td></tr>
<tr><td>« C’est de votre faute. »</td><td>« Ça arrive souvent, voici comment l’éviter. »</td></tr>
<tr><td>« Je ne sais pas. »</td><td>« Je vérifie et je reviens vers vous avant 15 h. »</td></tr>
<tr><td>« Ce n’est pas mon problème. »</td><td>« Je transmets à l’équipe concernée et je vous tiens informé. »</td></tr>
<tr><td>« C’est impossible. »</td><td>« Ce n’est pas possible de cette façon, mais voici ce que je peux faire. »</td></tr>
</tbody>
</table>
<h3>La clôture</h3>
<ol>
<li>Récapitulez ce qui a été fait et pourquoi.</li>
<li>Faites tester à l’utilisateur.</li>
<li>Dites comment revenir vers vous si le problème réapparaît.</li>
</ol>
<div class="callout">Promettez un délai que vous pouvez tenir. Mieux vaut annoncer « avant ce soir » et rappeler à 15 h que promettre « dans 5 minutes » et rappeler à 16 h.</div>
`
  },
  {
    id: 'droits',
    title: 'Gérer une demande d’accès',
    cat: 'Active Directory',
    minutes: 4,
    summary: 'Validation du propriétaire des données, moindre privilège et prise en compte des droits.',
    body: `
<p>« Je n’ai pas accès au dossier Accreditation2027, alors que ma collègue y a accès. » Cette demande paraît simple, mais un accès donné trop vite peut exposer des données confidentielles (salaires, marges, dossiers RH).</p>
<h3>Le propriétaire des données</h3>
<p>Chaque dossier partagé a un responsable : en général le chef du service. Pour le dossier Accreditation2027 de la Qualité, c’est Claire Vasseur. C’est lui ou elle qui décide qui y accède, pas le support, et pas un collègue.</p>
<h3>La procédure</h3>
<ol>
<li>Identifiez le dossier exact (chemin complet, ex. <code>\\\\srv-fic-01\\Qualite\\Accreditation2027</code>) et le droit demandé : lecture ou modification.</li>
<li>Trouvez le groupe correspondant. Ici, <code>GG_Qualite_Lecture</code> donne la lecture du partage Qualite, <code>GG_Qualite_Accreditation_RW</code> la modification du dossier Accreditation2027.</li>
<li>Obtenez l’<strong>accord du responsable du dossier ou du manager</strong> et tracez-le dans le ticket (mail joint ou commentaire).</li>
<li>Ajoutez l’utilisateur au groupe.</li>
<li>Demandez-lui de <strong>fermer et rouvrir sa session</strong> : les groupes ne sont lus qu’à l’ouverture de session.</li>
<li>Faites-lui tester l’accès.</li>
</ol>
<h3>Le moindre privilège</h3>
<p>On donne à chacun uniquement les droits nécessaires à son travail. Si la personne doit seulement consulter, la lecture suffit.</p>
<div class="callout warn">Ne copiez jamais les droits d’un collègue « pour aller plus vite ». Le collègue peut avoir des droits liés à un ancien poste ou à des fonctions de manager (<code>GG_Secretariat_Responsables</code>, par exemple).</div>
<div class="callout warn">Les groupes <code>GG_Admins_Postes</code> et <code>Admins du domaine</code> ne s’attribuent jamais sur demande d’un utilisateur.</div>
`
  },
  {
    id: 'logiciels',
    title: 'Installer un logiciel',
    cat: 'Windows',
    minutes: 3,
    summary: 'Le Centre logiciel, l’absence de droits administrateur et les logiciels gratuits douteux.',
    body: `
<h3>Pourquoi les utilisateurs ne sont pas administrateurs</h3>
<p>Un compte administrateur peut installer n’importe quoi, y compris un logiciel malveillant, et désactiver l’antivirus. Chez Ostral Biologie, les utilisateurs n’ont donc pas de droits administrateur. Le groupe <code>GG_Admins_Postes</code> est réservé à l’IT.</p>
<h3>Le Centre logiciel</h3>
<p>Le Centre logiciel propose un <strong>catalogue de logiciels approuvés</strong> : testés, licenciés, à jour. L’utilisateur les installe lui-même en un clic, sans droits administrateur, ou le support les déploie à distance sur son poste.</p>
<ol>
<li>Cherchez le besoin réel (« lire des fichiers .dwg », « compresser des fichiers »).</li>
<li>Vérifiez si un logiciel du catalogue répond au besoin.</li>
<li>Si oui : guidez l’utilisateur dans le Centre logiciel, ou déployez-le.</li>
<li>Si non : demande de logiciel hors catalogue, validée par le manager et le RSSI.</li>
</ol>
<h3>Les logiciels gratuits douteux (PUA)</h3>
<p>Les « convertisseurs PDF gratuits », « optimiseurs de PC » ou barres d’outils trouvés sur internet sont souvent des logiciels potentiellement indésirables : publicités, collecte de données, ralentissements. Signes : PC soudainement lent, processus inconnu qui consomme beaucoup de processeur, nouvelle page d’accueil du navigateur.</p>
<p>Conduite à tenir : désinstaller le logiciel, lancer une analyse antivirus complète, redémarrer, puis rappeler la charte informatique avec bienveillance.</p>
<div class="callout warn">Ne communiquez jamais un mot de passe administrateur et ne désactivez jamais l’antivirus pour « faire passer » une installation.</div>
`
  },
  {
    id: 'bitlocker',
    title: 'BitLocker : donner une clé de récupération',
    cat: 'Sécurité',
    minutes: 4,
    summary: 'Pourquoi la clé est demandée, comment trouver la bonne, et comment la transmettre.',
    body: `
<p>BitLocker chiffre le disque des portables. Si le PC est volé, les données restent illisibles. Au démarrage, le PC vérifie que rien n’a changé. S’il détecte une modification, il bloque et demande une <strong>clé de récupération</strong> de 48 chiffres.</p>
<h3>Pourquoi la clé est demandée</h3>
<ul>
<li>Mise à jour du BIOS ou du firmware pendant la nuit.</li>
<li>Changement de matériel, ou démarrage sur une nouvelle station d’accueil.</li>
<li>Réinitialisation de la puce de sécurité (TPM).</li>
<li>Trop d’essais de code PIN erronés.</li>
</ul>
<h3>Trouver la bonne clé</h3>
<ol>
<li>Demandez à l’utilisateur de lire l’<strong>ID de clé de récupération</strong> affiché à l’écran (les 8 premiers caractères suffisent, ex. <code>4F2A91C3</code>).</li>
<li>Dans l’Active Directory, ouvrez l’objet ordinateur (ex. <code>LT-PRE-022</code>), onglet BitLocker.</li>
<li>Plusieurs clés peuvent exister (une par chiffrement du disque). Choisissez celle dont l’<strong>ID correspond</strong> exactement à celui de l’écran, pas forcément la plus récente.</li>
</ol>
<h3>Une clé = l’accès complet au disque</h3>
<p>La vérification d’identité est renforcée : matricule comparé à l’annuaire, <strong>et</strong> rappel sur le numéro de l’annuaire ou validation du manager.</p>
<h3>Transmettre la clé</h3>
<ul>
<li>À l’oral, bloc par bloc (8 blocs de 6 chiffres), en faisant répéter chaque bloc.</li>
<li>Jamais par mail ou SMS vers une adresse ou un numéro non vérifié.</li>
<li>Dans le ticket, notez « clé de récupération communiquée (ID 4F2A91C3) », jamais la clé elle-même.</li>
</ul>
<div class="callout">Si le PC redemande la clé à chaque démarrage, escaladez au Support de proximité : la puce TPM ou la configuration BitLocker doit être vérifiée.</div>
`
  },
  {
    id: 'stockage',
    title: 'Disque plein et fichiers supprimés',
    cat: 'Windows',
    minutes: 4,
    summary: 'Libérer de l’espace sans risque, et restaurer un fichier avec les versions précédentes.',
    body: `
<h3>Disque plein</h3>
<p>Message « Espace disque insuffisant » : l’utilisateur ne peut plus enregistrer, et Windows ralentit.</p>
<ol>
<li>Mesurez : <code>Get-PSDrive C</code> ou l’Explorateur (Ce PC).</li>
<li>Lancez le <strong>nettoyage de disque</strong> (<code>cleanmgr</code>) en incluant les fichiers système : fichiers temporaires, anciennes mises à jour Windows. Souvent plusieurs Go.</li>
<li>Regardez le dossier <strong>Téléchargements</strong> et la <strong>Corbeille</strong>, souvent remplis de vidéos ou d’installateurs.</li>
<li>Proposez à l’utilisateur de déplacer ses gros fichiers vers OneDrive ou le partage de son service.</li>
</ol>
<div class="callout warn">Ne supprimez jamais de fichiers personnels sans l’accord de l’utilisateur, et ne touchez jamais au dossier <code>C:\\Windows</code> : vous pourriez rendre le PC inutilisable.</div>
<h3>Restaurer un fichier supprimé sur un partage</h3>
<p>Un fichier supprimé sur un partage réseau (<code>\\\\srv-fic-01\\Compta</code>) ne va pas dans la Corbeille du poste. Le serveur prend en revanche des <strong>instantanés</strong> plusieurs fois par jour (par exemple à 7 h, 12 h et 18 h).</p>
<ol>
<li>Faites préciser le nom exact du fichier, le dossier, et l’heure de la suppression.</li>
<li>Clic droit sur le dossier qui contenait le fichier &gt; <strong>Propriétés &gt; Versions précédentes</strong>.</li>
<li>Choisissez <strong>le dernier instantané qui contient encore le fichier</strong>, donc le plus récent pris avant la suppression. Un instantané plus ancien fait perdre le travail de la journée ; un instantané pris après la suppression ne contient plus le fichier.</li>
<li>Restaurez de préférence une copie à côté de l’original, et faites vérifier le contenu par l’utilisateur.</li>
</ol>
<p>Exemple : fichier supprimé hier à 18 h 30, instantanés d’hier 12 h, d’hier 18 h et d’aujourd’hui 7 h. Le bon choix est celui d’hier 18 h.</p>
<div class="callout">Si aucun instantané ne contient le fichier, escaladez au N2 Systèmes &amp; serveurs, qui gère les sauvegardes complètes.</div>
`
  },
  {
    id: 'poste',
    title: 'Poste lent, écran noir, panne matérielle',
    cat: 'Matériel',
    minutes: 5,
    summary: 'Les pannes courantes du poste de travail et les bons réflexes pour chacune.',
    body: `
<h3>PC lent</h3>
<ol>
<li><strong>Depuis quand le PC n’a-t-il pas redémarré ?</strong> La mise en veille n’est pas un redémarrage. Vérifiez le temps d’activité dans le Gestionnaire des tâches (onglet Performances) ou avec <code>systeminfo</code> (ligne « Heure de démarrage du système »). Après plusieurs semaines, un vrai redémarrage règle beaucoup de lenteurs.</li>
<li><strong>Qu’est-ce qui a changé ?</strong> Un logiciel installé récemment, une nouvelle extension du navigateur.</li>
<li><strong>Gestionnaire des tâches</strong> (Ctrl + Maj + Échap) : triez par processeur, puis par mémoire. Un processus inconnu à 90 % de processeur est suspect.</li>
<li><strong>Espace disque</strong> : un disque presque plein ralentit tout le système.</li>
</ol>
<h3>Écran externe « Pas de signal »</h3>
<ol>
<li>L’écran est-il allumé ? Voyant orange = en veille, il ne reçoit rien.</li>
<li>Le câble est-il bien enfoncé <strong>des deux côtés</strong> ? Derrière le PC, il se débranche souvent quand on bouge le bureau.</li>
<li>La bonne source est-elle choisie sur l’écran (HDMI, DisplayPort) ?</li>
<li><strong>Win + P</strong> : choisir « Étendre » (deux bureaux différents) ou « Dupliquer » (même image).</li>
<li>Paramètres &gt; Affichage &gt; <strong>Détecter</strong>.</li>
<li>Tester un autre câble ou un autre port.</li>
</ol>
<h3>Panne matérielle</h3>
<p>Le PC ne s’allume plus, un voyant orange clignote, ou il émet une série de bips au démarrage : c’est le signe d’une panne de composant (mémoire, carte mère, alimentation). Faites d’abord vérifier la prise électrique et le bouton. Ensuite :</p>
<ul>
<li>La prise en main à distance est impossible : le PC est éteint.</li>
<li>Escaladez au <strong>Support de proximité</strong> pour un diagnostic sur site ou un remplacement.</li>
<li>Proposez un contournement : un poste de prêt, ou une borne voisine pour un poste partagé.</li>
<li>Notez le modèle, le numéro d’inventaire et l’état de la garantie.</li>
</ul>
<div class="callout warn">Ne demandez jamais à un utilisateur d’ouvrir le boîtier de son PC.</div>
`
  },
  {
    id: 'arrivee',
    title: 'Créer le compte d’un nouvel arrivant',
    cat: 'Active Directory',
    minutes: 4,
    summary: 'Prérequis, identifiant, OU, groupes strictement nécessaires et mot de passe temporaire.',
    body: `
<p>La création d’un compte est une <strong>demande de service</strong> planifiée, en général P4. Elle se prépare avant le premier jour de l’arrivant.</p>
<h3>Les prérequis</h3>
<p>La demande vient du manager ou des RH et précise : prénom, nom, service, fonction, date d’arrivée, et les accès nécessaires. Sans demande validée, pas de compte.</p>
<h3>Les étapes</h3>
<ol>
<li><strong>Identifiant</strong> : <code>prenom.nom</code>, en minuscules, sans accents ni espaces. Hugo Lambert devient <code>hugo.lambert</code>, Élodie Fabre <code>elodie.fabre</code>. En cas d’homonyme : <code>prenom.nom2</code>.</li>
<li><strong>Unité d’organisation</strong> : celle du service, par exemple <code>OU=Secretariat,OU=Utilisateurs,DC=ostral,DC=local</code>. Un compte mal rangé ne reçoit pas les bonnes stratégies.</li>
<li><strong>Groupes</strong> : <code>GG_Tous</code>, le groupe du service, et uniquement les accès demandés. Pour un secrétaire médical de site : <code>GG_Tous</code>, <code>GG_Secretariat</code>, <code>GG_SIL_Accueil</code>. Jamais <code>GG_SIL_Biologiste</code>, réservé à la validation biologique.</li>
<li><strong>Licences</strong> : Microsoft 365 pour la messagerie, et une licence CRM (une par utilisateur).</li>
<li><strong>Mot de passe temporaire</strong> conforme, avec « L’utilisateur doit changer le mot de passe à la prochaine ouverture de session ».</li>
<li><strong>Remise</strong> : le mot de passe est donné à l’arrivant en main propre le premier jour, ou au manager par téléphone. Jamais par mail.</li>
<li><strong>Note dans le ticket</strong> : identifiant créé, OU, groupes, licences.</li>
</ol>
<h3>Les erreurs fréquentes</h3>
<ul>
<li><strong>Copier les droits d’un collègue</strong>, surtout d’un manager : l’arrivant hérite par exemple de <code>GG_Secretariat_Responsables</code> (plannings et suivi RH), qui ne le concerne pas.</li>
<li>Ajouter <code>GG_VPN_Users</code> ou d’autres accès « au cas où » : chaque accès doit être demandé.</li>
<li>Laisser le compte dans l’OU par défaut.</li>
</ul>
<div class="callout">Si un accès semble manquer (le VPN pour un délégué prescripteurs nomade, par exemple), posez la question au manager au lieu de l’ajouter de vous-même.</div>
`
  }
];
