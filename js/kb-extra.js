/* DeskSim — fiches du wiki propres au poste : Linux, scripting, téléphonie, préparation de postes, laboratoire, entretien */
DS.kb.push(
  {
    id: 'linux', title: 'Linux : les commandes du support', cat: 'Linux', minutes: 6,
    summary: 'Se repérer, lire les journaux, vérifier un service et l’espace disque sur un serveur Debian.',
    body: `
<p>Beaucoup de serveurs (intranet, impression, supervision) tournent sous Linux. On s’y connecte en <strong>SSH</strong> (avec PuTTY sous Windows) : <code>ssh tech@srv-intra-01</code>. On travaille avec un compte nominatif, et on passe administrateur seulement pour une commande précise avec <code>sudo</code>.</p>
<h3>Se repérer</h3>
<table><thead><tr><th>Commande</th><th>Rôle</th></tr></thead><tbody>
<tr><td><code>pwd</code></td><td>Affiche le dossier courant.</td></tr>
<tr><td><code>ls -l</code>, <code>ls -lh</code></td><td>Liste le contenu, avec tailles lisibles (<code>-h</code>).</td></tr>
<tr><td><code>cd /var/log</code>, <code>cd ~</code></td><td>Change de dossier ; <code>~</code> est ton dossier personnel.</td></tr>
<tr><td><code>cat</code>, <code>less</code>, <code>tail -n 50</code></td><td>Lit un fichier ; <code>tail -f</code> suit un journal en direct.</td></tr>
<tr><td><code>grep -i erreur fichier</code></td><td>Garde les lignes qui contiennent un mot.</td></tr>
<tr><td><code>find / -size +1G</code></td><td>Trouve les très gros fichiers.</td></tr>
</tbody></table>
<h3>Où sont les choses</h3>
<ul><li><code>/etc</code> : la configuration (réseau, services).</li><li><code>/var/log</code> : les journaux. C’est souvent lui qui remplit le disque.</li><li><code>/home</code> : les dossiers des utilisateurs.</li></ul>
<h3>Services et ressources</h3>
<table><thead><tr><th>Commande</th><th>Rôle</th></tr></thead><tbody>
<tr><td><code>systemctl status nginx</code></td><td>État d’un service : <em>active (running)</em> ou <em>failed</em>.</td></tr>
<tr><td><code>sudo systemctl restart nginx</code></td><td>Redémarre un service.</td></tr>
<tr><td><code>systemctl --failed</code></td><td>Liste les services en échec.</td></tr>
<tr><td><code>journalctl -u nginx -n 30</code></td><td>Les 30 dernières lignes du journal d’un service.</td></tr>
<tr><td><code>df -h</code></td><td>Espace libre par disque.</td></tr>
<tr><td><code>du -sh /var/log/*</code></td><td>Taille de chaque élément d’un dossier.</td></tr>
<tr><td><code>free -h</code>, <code>top</code>, <code>ps aux</code></td><td>Mémoire, processeur, processus.</td></tr>
<tr><td><code>ip a</code>, <code>ip r</code>, <code>ping -c 4</code>, <code>ss -tulpn</code></td><td>Adresse IP, routes, connectivité, ports en écoute.</td></tr>
</tbody></table>
<h3>Méthode : un service tombe</h3>
<ol><li><code>systemctl status</code> : le service est-il en échec, depuis quand ?</li><li><code>journalctl -u</code> : que dit le journal juste avant l’arrêt ?</li><li>Ressources : <code>df -h</code> (disque), <code>free -h</code> (mémoire).</li><li>Corriger la cause, puis redémarrer le service et vérifier (<code>curl -I http://localhost</code> pour un site web).</li><li>Noter la cause de fond dans le ticket et prévenir le N2 si elle dépasse ton périmètre.</li></ol>
<div class="callout warn">Un message « No space left on device » veut dire disque plein. Pour vider un journal trop gros, préfère <code>sudo truncate -s 0 fichier.log</code> à <code>rm</code> : si un programme tient le fichier ouvert, <code>rm</code> ne libère pas la place. Ne fais jamais <code>rm -rf /var/log</code>.</div>`
  },
  {
    id: 'scripting', title: 'Scripting : bash et PowerShell utiles', cat: 'Linux', minutes: 5,
    summary: 'Automatiser les vérifications répétitives avec des tubes, des boucles et quelques scripts sûrs.',
    body: `
<p>Un script, c’est une suite de commandes qu’on aurait tapées à la main. Au support, il sert surtout à <strong>vérifier vite</strong> plusieurs choses d’un coup, et à éviter les erreurs de frappe.</p>
<h3>Les briques de base en bash</h3>
<ul><li><strong>Tube</strong> <code>|</code> : la sortie d’une commande devient l’entrée de la suivante. <code>grep ERROR app.log | wc -l</code> compte les erreurs.</li><li><strong>Redirection</strong> : <code>&gt; fichier</code> écrit, <code>&gt;&gt; fichier</code> ajoute.</li><li><strong>Variable</strong> : <code>h=srv-dc-01</code> puis <code>ping -c 1 $h</code>.</li><li><strong>Boucle</strong> : <code>for h in srv-dc-01 srv-fic-01; do ping -c 1 $h; done</code>.</li><li><strong>Condition</strong> : <code>if ping -c 1 $h &gt; /dev/null; then echo "$h OK"; else echo "$h KO"; fi</code>.</li></ul>
<h3>Exemple : vérifier tous les serveurs</h3>
<pre><code>#!/bin/bash
# Ping chaque serveur de la liste et affiche OK ou KO
for h in $(cat serveurs.txt); do
  if ping -c 1 -W 1 "$h" &gt; /dev/null; then echo "$h OK"; else echo "$h KO"; fi
done</code></pre>
<h3>Les équivalents PowerShell</h3>
<table><thead><tr><th>Besoin</th><th>PowerShell</th></tr></thead><tbody>
<tr><td>Comptes verrouillés</td><td><code>Search-ADAccount -LockedOut</code></td></tr>
<tr><td>Fiche complète d’un compte</td><td><code>Get-ADUser camille.roussel -Properties *</code></td></tr>
<tr><td>Déverrouiller</td><td><code>Unlock-ADAccount camille.roussel</code></td></tr>
<tr><td>Processus les plus gourmands</td><td><code>Get-Process | Sort-Object CPU -Descending | Select-Object -First 5</code></td></tr>
<tr><td>Tester plusieurs serveurs</td><td><code>"srv-dc-01","srv-fic-01" | ForEach-Object { Test-Connection $_ -Count 1 }</code></td></tr>
<tr><td>Exporter un résultat</td><td><code>... | Export-Csv rapport.csv -NoTypeInformation</code></td></tr>
</tbody></table>
<h3>Bonnes pratiques</h3>
<ul><li>Tester d’abord sur une seule machine ou en lecture seule.</li><li>Commenter le script : ce qu’il fait, qui l’a écrit, quand.</li><li>Ne jamais lancer un script trouvé sur internet sans l’avoir lu et compris.</li><li>Ne jamais écrire un mot de passe en clair dans un script.</li></ul>
<div class="callout">En entretien, un petit script concret (pinger une liste de serveurs, lister les comptes verrouillés) montre plus de maîtrise qu’une longue liste de langages.</div>`
  },
  {
    id: 'telephonie', title: 'Téléphonie IP : comprendre et dépanner', cat: 'Matériel', minutes: 5,
    summary: 'Téléphones IP, PoE, ports LAN et PC, enregistrement SIP : les pannes classiques et leurs causes.',
    body: `
<p>Les téléphones de bureau sont des <strong>téléphones IP</strong> : ils passent par le réseau informatique et s’enregistrent sur le standard (IPBX) avec le protocole <strong>SIP</strong>. Les appels voyagent sur un <strong>VLAN voix</strong> séparé du réseau des PC.</p>
<h3>Les deux ports sous le téléphone</h3>
<ul><li><strong>LAN</strong> (ou SW, Internet) : vers la prise murale.</li><li><strong>PC</strong> : vers l’ordinateur. Le PC passe à travers le téléphone, ce qui économise une prise murale.</li></ul>
<p>Le téléphone est alimenté par le câble réseau grâce au <strong>PoE</strong> (Power over Ethernet) : le switch envoie le courant. Il n’y a donc souvent aucun bloc d’alimentation.</p>
<h3>Pannes classiques</h3>
<table><thead><tr><th>Symptôme</th><th>Causes probables</th></tr></thead><tbody>
<tr><td>Écran noir, aucun voyant</td><td>Pas de PoE : câble mural branché sur le port PC, prise non brassée, port du switch sans PoE.</td></tr>
<tr><td>Téléphone ET PC sans réseau en même temps</td><td>Câbles inversés sous le téléphone, ou câble mural débranché.</td></tr>
<tr><td>« Enregistrement… », « Pas de service »</td><td>Le téléphone n’arrive pas à joindre le standard : VLAN voix, panne de l’IPBX, mauvaise configuration.</td></tr>
<tr><td>Son haché, voix robotique</td><td>Réseau saturé, qualité de service mal réglée : à escalader au N2 réseau.</td></tr>
<tr><td>Un seul sens audio</td><td>Problème de routage ou de pare-feu : escalade.</td></tr>
</tbody></table>
<h3>Méthode</h3>
<ol><li>Le téléphone est-il alimenté (écran, voyant) ?</li><li>Faire décrire les branchements : mur vers LAN, PC vers PC.</li><li>Tester avec un autre câble ou une autre prise.</li><li>Faire un appel test (vers le 4000 par exemple).</li><li>Si plusieurs postes ou tout un site sont touchés, c’est le standard ou le réseau : escalade au N2 réseau et télécom.</li></ol>
<h3>Autres équipements</h3>
<ul><li><strong>Softphone</strong> : téléphone logiciel sur le PC, avec casque.</li><li><strong>DECT</strong> : téléphones sans fil reliés à des bornes, pratiques sur un plateau technique.</li><li><strong>Provisionnement</strong> : le téléphone récupère sa configuration automatiquement au démarrage ; on évite de le configurer à la main.</li></ul>
<div class="callout">Pense à proposer un contournement pendant le dépannage : renvoi des appels de l’accueil vers un autre site, par exemple.</div>`
  },
  {
    id: 'preparation-poste', title: 'Préparer un poste de travail', cat: 'Procédures', minutes: 5,
    summary: 'De la réception du PC à la remise à l’utilisateur : les étapes, leur ordre et les raccourcis à éviter.',
    body: `
<p>Préparer un PC fixe ou portable, c’est une <strong>procédure</strong> : si chaque technicien fait à sa façon, le parc devient ingérable. Voici l’ordre utilisé chez Ostral Biologie.</p>
<ol>
<li><strong>Réception</strong> : relever le numéro de série, coller l’étiquette d’inventaire, vérifier l’état et les accessoires.</li>
<li><strong>Matériel</strong> : mettre à jour le BIOS avec l’outil du constructeur.</li>
<li><strong>Système</strong> : déployer l’image de l’entreprise (MDT, Autopilot), câble réseau branché.</li>
<li><strong>Nommage</strong> selon la convention <code>type-service-numéro</code> (<code>PC</code> fixe, <code>LT</code> portable : <code>LT-BIO-003</code>). On nomme <strong>avant</strong> la jonction au domaine.</li>
<li><strong>Jonction au domaine</strong> <code>ostral.local</code> (ou Entra ID), dans la bonne OU d’ordinateurs.</li>
<li><strong>Profil logiciel</strong> du poste via le Centre logiciel : client SIL, Office, VPN si l’utilisateur est nomade ou d’astreinte, lecteur PDF…</li>
<li><strong>Sécurité</strong> : activer BitLocker <strong>après</strong> la jonction, pour que la clé de récupération soit sauvegardée dans l’AD. Installer les mises à jour.</li>
<li><strong>Inventaire</strong> : mettre à jour la fiche (statut « En service », utilisateur, site).</li>
<li><strong>Remise</strong> : première connexion accompagnée, test des applications (SIL, mail, VPN, imprimante), signature du bon de remise.</li>
</ol>
<h3>Pourquoi l’ordre compte</h3>
<ul><li>Un PC joint au domaine sous un nom automatique (<code>DESKTOP-8F2KQ1L</code>) doit être renommé ensuite dans Windows <strong>et</strong> dans l’AD.</li><li>Sans jonction, la clé BitLocker n’est sauvegardée nulle part : au premier souci matériel, les données sont perdues.</li><li>Un inventaire à jour permet de retrouver qui a quel matériel, la garantie, l’historique des interventions.</li></ul>
<h3>Raccourcis interdits</h3>
<ul><li>Compte administrateur local partagé du type « support / support ».</li><li>Pare-feu Windows désactivé « pour éviter les soucis ».</li><li>Logiciel de prise en main personnel ou gratuit non approuvé.</li><li>Droits administrateur laissés à l’utilisateur.</li></ul>
<div class="callout">Pour un poste de laboratoire (paillasse, accueil), vérifie aussi les périphériques : imprimante d’étiquettes, douchette, lecteur de carte Vitale. Le poste n’est prêt que si toute la chaîne fonctionne.</div>`
  },
  {
    id: 'peripheriques-labo', title: 'Périphériques du laboratoire', cat: 'Matériel', minutes: 5,
    summary: 'Imprimantes d’étiquettes, douchettes, lecteurs de carte : pannes fréquentes et pourquoi elles sont critiques.',
    body: `
<p>Dans un laboratoire, l’informatique touche directement le patient. Une étiquette de tube illisible, c’est un prélèvement qu’on ne peut pas identifier. Ces périphériques sont donc traités avec une <strong>priorité élevée</strong> quand ils bloquent un accueil ou une paillasse.</p>
<h3>Imprimantes d’étiquettes thermiques (Zebra…)</h3>
<ul><li>Elles détectent l’espace entre deux étiquettes. Après <strong>chaque changement de rouleau</strong>, surtout d’un autre format, il faut <strong>calibrer</strong> (combinaison de boutons, ou depuis le pilote).</li><li>Le format du rouleau doit correspondre au format attendu par le SIL et le pilote (par exemple 50 × 25 mm).</li><li>Étiquettes pâles ou rayées : tête sale (stylo à l’alcool isopropylique) ou ruban usé.</li><li>Une étiquette sur deux blanche, code-barres coupé : calibrage ou mauvais rouleau.</li></ul>
<h3>Douchettes (lecteurs de code-barres)</h3>
<ul><li>Elles se comportent comme un clavier : elles « tapent » le code lu.</li><li>Ne lit plus : câble ou base USB, batterie (modèles sans fil), mauvais mode. Un code-barres de configuration du fabricant remet les réglages d’usine.</li><li>Lit mais le SIL ne réagit pas : vérifier que le curseur est dans le bon champ, ou la disposition clavier (AZERTY/QWERTY donne des caractères faux).</li></ul>
<h3>Lecteurs de carte Vitale et CPS</h3>
<ul><li>Ils nécessitent un pilote et un service de lecture : après une mise à jour, vérifier que le service tourne.</li><li>La carte CPS est personnelle au professionnel de santé : on ne la prête jamais.</li></ul>
<h3>Identitovigilance</h3>
<p>C’est l’ensemble des règles qui garantissent que le bon résultat est rattaché au bon patient. Côté IT, cela veut dire :</p>
<ul><li>Jamais d’étiquette écrite à la main pour « dépanner ».</li><li>Un contournement sûr : imprimer sur le poste voisin, depuis le SIL.</li><li>Tester avec une étiquette de test et la douchette avant de rendre le poste.</li></ul>
<div class="callout warn">Si un périphérique bloque l’accueil d’un site avec des patients en salle d’attente, l’urgence est haute et l’impact au moins moyen.</div>`
  },
  {
    id: 'labo-medical', title: 'L’informatique dans un laboratoire de biologie médicale', cat: 'Méthode', minutes: 5,
    summary: 'SIL, automates, données de santé, accréditation : ce qui change pour le support.',
    body: `
<p>Un laboratoire de biologie médicale reçoit des prélèvements (sites de prélèvement, cliniques, cabinets), les analyse sur un <strong>plateau technique</strong> et transmet les résultats aux patients et aux prescripteurs. L’informatique est présente à chaque étape.</p>
<h3>Les briques du système</h3>
<ul><li><strong>SIL</strong> (système d’information de laboratoire) : dossiers patients, demandes d’analyses, étiquettes, résultats, validation biologique.</li><li><strong>Automates d’analyses</strong> et leurs PC pilotes : reliés au SIL. Le support n’y touche pas sans le <strong>biomédical</strong> ou le fournisseur.</li><li><strong>Postes d’accueil</strong> des sites de prélèvement : SIL, imprimante d’étiquettes, douchette, lecteur de carte Vitale, téléphone.</li><li><strong>PC de paillasse</strong> partagés au plateau technique.</li><li><strong>Serveur de résultats</strong> pour les patients et les médecins.</li></ul>
<h3>Ce que ça change pour le support</h3>
<ul><li><strong>Continuité</strong> : le plateau technique travaille souvent en continu. Une panne qui bloque les analyses ou la sortie des résultats est un incident majeur (P1).</li><li><strong>Données de santé</strong> : secret médical et RGPD. Aucune donnée patient dans un ticket, un mail personnel ou une clé USB non chiffrée. Les données sont hébergées chez un hébergeur certifié HDS.</li><li><strong>Droits</strong> : la validation biologique est réservée aux biologistes. Donner ce droit à quelqu’un d’autre est une faute grave.</li><li><strong>Traçabilité</strong> : le laboratoire est accrédité (COFRAC). Chaque intervention sur un équipement doit être tracée : ticket, fiche d’inventaire, date, action.</li><li><strong>Discrétion</strong> : à l’accueil, on intervient devant des patients. On ne lit pas les écrans à voix haute.</li></ul>
<h3>Escalades spécifiques</h3>
<table><thead><tr><th>Problème</th><th>Équipe</th></tr></thead><tbody>
<tr><td>Le SIL ne répond plus, un résultat ne remonte pas d’un automate</td><td>Applications métier (SIL)</td></tr>
<tr><td>Automate ou son PC pilote en panne</td><td>Biomédical / fournisseur</td></tr>
<tr><td>Lien inter-sites coupé, standard en panne</td><td>N2 Réseau &amp; télécom</td></tr>
<tr><td>Suspicion de fuite ou de compromission de données</td><td>Cellule sécurité (RSSI)</td></tr>
</tbody></table>
<div class="callout">En entretien, montrer que tu as compris ces enjeux (patients, continuité, confidentialité, traçabilité) compte autant que la technique.</div>`
  },
  {
    id: 'cablage', title: 'Câblage et environnement de travail', cat: 'Matériel', minutes: 4,
    summary: 'Prises murales, brassage, étiquetage, câbles au sol : la couche physique au quotidien.',
    body: `
<p>Une grande partie des pannes « réseau » est en réalité physique : un câble débranché, une prise non brassée, un câble écrasé par une chaise.</p>
<h3>Le chemin d’un câble</h3>
<ol><li>Le PC (ou le téléphone) est relié par un <strong>cordon RJ45</strong> à la <strong>prise murale</strong>.</li><li>La prise murale est reliée par un câble fixe à un <strong>panneau de brassage</strong> dans la baie du local technique.</li><li>Un cordon de brassage relie ce panneau au <strong>switch</strong>.</li></ol>
<p>Si le cordon de brassage n’est pas posé, la prise murale est « morte » : c’est une prise <strong>non brassée</strong>. Après un réaménagement de bureaux, c’est la cause la plus fréquente de « plus de réseau ».</p>
<h3>Les bons réflexes</h3>
<ul><li>Regarder les <strong>voyants</strong> de la carte réseau : éteints = pas de lien physique.</li><li>Lire l’<strong>étiquette</strong> de la prise (ex. P3-14) : elle permet de retrouver le port dans la baie.</li><li>Tester avec un <strong>testeur de câble</strong> ou un autre cordon.</li><li>Étiqueter les câbles qui posent problème (« MUR → LAN », « PC »).</li><li>Signaler une prise morte dans le ticket pour qu’elle soit brassée.</li></ul>
<h3>Catégories et longueurs</h3>
<ul><li>Cat 6 ou 6A pour les installations récentes, jusqu’à 90 m de câble fixe.</li><li>Un câble pincé, plié à angle droit ou au clip cassé provoque des coupures aléatoires.</li></ul>
<h3>Sécurité et propreté</h3>
<ul><li>Pas de câble « temporaire » au sol : risque de chute, et il finit arraché.</li><li>Serre-câbles et goulottes pour regrouper les câbles sous le bureau.</li><li>Jamais d’intervention dans un boîtier sous tension, toujours le bracelet antistatique.</li></ul>
<h3>La trousse du technicien</h3>
<p>Testeur de câble, quelques cordons RJ45 de longueurs différentes, tournevis cruciformes, bracelet antistatique, serre-câbles, étiquettes, clé USB d’outils de diagnostic, lampe.</p>`
  },
  {
    id: 'entretien', title: 'Préparer un entretien de support IT', cat: 'Méthode', minutes: 7,
    summary: 'Se présenter, répondre aux questions classiques avec des exemples concrets, et poser les bonnes questions.',
    body: `
<p>Pour un poste de support, le recruteur cherche trois choses : <strong>de la méthode</strong>, <strong>du calme avec les utilisateurs</strong> et <strong>l’envie d’apprendre</strong>. Les débutants motivés sont souvent bienvenus : tout l’enjeu est de montrer que tu sais déjà raisonner comme un technicien.</p>
<h3>Te présenter en une minute</h3>
<p>Qui tu es, pourquoi le support, ce que tu as déjà pratiqué (formation, dépannages pour ton entourage, ce simulateur, un labo Linux), ce qui t’attire dans ce poste et dans un laboratoire médical.</p>
<h3>Dix questions classiques</h3>
<ol>
<li><strong>« Internet ne marche plus. Que faites-vous ? »</strong> Je fais décrire ce que la personne voit et ce qu’elle fait d’habitude. Je vérifie si le reste marche (mails, applications), si les collègues ont le même problème, puis je descends couche par couche : câble ou Wi-Fi, adresse IP (<code>ipconfig</code>), passerelle, DNS. Souvent, c’est l’icône du navigateur qui a disparu.</li>
<li><strong>« Un PC ne démarre plus. »</strong> Alimentation, prise, voyants, bips (doc constructeur), écran. Je propose un poste de remplacement pour que l’utilisateur continue, puis j’interviens hors tension.</li>
<li><strong>« Un utilisateur est énervé. »</strong> Je l’écoute sans l’interrompre, je reformule, je reconnais la gêne, je dis ce que je vais faire et dans quel délai. Je ne promets pas ce que je ne maîtrise pas.</li>
<li><strong>« Différence entre incident et demande ? »</strong> Un incident, c’est ce qui marchait et ne marche plus ; une demande, c’est un besoin nouveau (accès, matériel, compte).</li>
<li><strong>« Vous ne savez pas résoudre un problème. »</strong> Je cherche dans la base de connaissances, je documente ce que j’ai testé et j’escalade avec une note claire. Ne pas savoir n’est pas grave ; bloquer un ticket sans rien dire, si.</li>
<li><strong>« C’est quoi DHCP et DNS ? »</strong> Le DHCP distribue automatiquement les adresses IP ; le DNS traduit un nom en adresse IP.</li>
<li><strong>« Une commande Linux pour l’espace disque ? »</strong> <code>df -h</code> pour les disques, <code>du -sh</code> pour trouver ce qui prend la place.</li>
<li><strong>« Trois tickets arrivent en même temps. »</strong> J’applique la matrice impact × urgence : un service entier bloqué passe avant un utilisateur seul, et un utilisateur bloqué avant une gêne mineure.</li>
<li><strong>« Pourquoi ce poste ? »</strong> Parle du concret : un environnement varié, du matériel, des utilisateurs, et un travail qui sert directement les patients.</li>
<li><strong>« Parlez-moi d’une panne que vous avez résolue. »</strong> Utilise la méthode <strong>STAR</strong> : Situation, Tâche, Action, Résultat.</li>
</ol>
<h3>Exemple de réponse STAR</h3>
<p><em>Situation</em> : plus de réseau sur un PC après un déménagement de bureau. <em>Tâche</em> : remettre l’utilisateur au travail. <em>Action</em> : ipconfig indiquait « média déconnecté », voyants éteints, j’ai identifié une prise murale non brassée et branché le câble sur une prise active, puis signalé la prise. <em>Résultat</em> : réseau rétabli en dix minutes, prise réparée le lendemain.</p>
<h3>Parler de ton entraînement</h3>
<p>Dis simplement que tu t’es entraîné sur un simulateur de poste de support : qualification de tickets, Active Directory, PowerShell, SSH Linux, téléphonie IP, préparation de postes, avec un suivi de tes scores. Cite deux ou trois cas précis et ce que tu en as retenu. C’est la preuve que tu prépares sérieusement.</p>
<h3>Questions à poser au recruteur</h3>
<ul><li>Quels outils utilisez-vous (ticketing, déploiement, supervision) ?</li><li>Comment se répartissent le support à distance et les interventions sur site ?</li><li>Comment se passe l’intégration d’un nouveau technicien ?</li><li>Y a-t-il des astreintes ?</li></ul>
<div class="callout">Phrase utile : « Je ne connais pas encore cet outil, mais voici comment je m’y prendrais pour l’apprendre. » Elle montre de l’honnêteté et de la méthode.</div>`
  }
);
