/* DeskSim — terminal Windows simulé (cmd / PowerShell) */
(function () {
  const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, Math.max(n, String(s).length));
  const padL = (s, n) => (' '.repeat(n) + String(s)).slice(-Math.max(n, String(s).length));
  const dots = (label) => {
    // Imite l'alignement « Adresse IPv4. . . . . . . . . . . . . .: »
    let s = '   ' + label;
    while (s.length < 39) s += s.length % 2 ? ' ' : '.';
    return s + ': ';
  };

  const DEFAULT_PROCS = [
    ['System', 4, 'Services', 1488], ['smss.exe', 412, 'Services', 1204], ['csrss.exe', 628, 'Services', 5880],
    ['wininit.exe', 724, 'Services', 6912], ['services.exe', 868, 'Services', 11240], ['lsass.exe', 884, 'Services', 24988],
    ['svchost.exe', 1012, 'Services', 31544], ['svchost.exe', 1100, 'Services', 18220], ['spoolsv.exe', 2744, 'Services', 14736],
    ['MsMpEng.exe', 3320, 'Services', 212480], ['explorer.exe', 6120, 'Console', 128404], ['OUTLOOK.EXE', 7712, 'Console', 286112],
    ['ms-teams.exe', 8240, 'Console', 341208], ['msedge.exe', 9016, 'Console', 198764], ['OneDrive.exe', 9480, 'Console', 61228],
    ['EXCEL.EXE', 10112, 'Console', 152330]
  ];

  const SERVICE_NAMES = {
    Spooler: 'Spouleur d’impression', wuauserv: 'Windows Update', WinDefend: 'Service Antivirus Microsoft Defender',
    Dnscache: 'Client DNS', LanmanWorkstation: 'Station de travail', BITS: 'Service de transfert intelligent en arrière-plan',
    W32Time: 'Temps Windows', Dhcp: 'Client DHCP', AudioSrv: 'Audio Windows'
  };

  DS.defaultProfile = function (assetId) {
    const a = DS.assets[assetId] || DS.assets['PC-SUPPORT-01'];
    const u = a.user === 'tech' ? { login: 'tech.support', name: 'Technicien Support', groups: ['GG_Tous', 'GG_IT_Support'] } : Object.assign({ login: DS.loginOf(a.user) }, DS.users[a.user]);
    const ip = (a.ip || '10.20.6.15').split(' ')[0];
    const subnet = ip.split('.').slice(0, 3).join('.');
    return {
      host: assetId, login: u.login, fullName: u.name, ip, mask: '255.255.255.0', gw: subnet + '.1',
      dns: ['10.20.1.10', '10.20.1.11'], mac: a.mac || '00-00-00-00-00-00', adapter: a.kind === 'Portable' ? 'Wi-Fi' : 'Ethernet',
      desc: a.kind === 'Portable' ? 'Intel(R) Wi-Fi 6E AX211 160MHz' : 'Intel(R) Ethernet Connection (17) I219-LM',
      suffix: 'ostral.local', net: 'ok', down: [], extraHosts: {}, os: a.os, model: a.model,
      boot: '01/11/2026, 07:58:12', uptime: 'moins d’un jour',
      procs: DEFAULT_PROCS.slice(), cpu: {}, services: { Spooler: 'Running', wuauserv: 'Running', WinDefend: 'Running', Dnscache: 'Running', LanmanWorkstation: 'Running', BITS: 'Running', W32Time: 'Running', Dhcp: 'Running', AudioSrv: 'Running' },
      disk: { size: 237.3, free: 96.4 }, groups: u.groups || ['GG_Tous'],
      drives: [{ st: 'OK', l: 'P:', path: '\\\\srv-fic-01\\Commun' }], printers: [{ name: 'IMP-GEN-RDC', status: 'Normal', jobs: 0, driver: 'HP Universal Printing PCL 6', port: 'IP_10.20.1.31' }],
      vpn: false
    };
  };

  DS.loginOf = function (uid) {
    const u = DS.users[uid];
    if (!u) return uid;
    return u.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.').replace(/[^a-z.\-]/g, '');
  };

  function resolve(p, name) {
    const n = name.toLowerCase().replace(/\.ostral\.local$/, '');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(n)) return { ip: n, name: null };
    if (p.net === 'apipa' || p.net === 'nolink') return null;
    if (p.net === 'captive') return { ip: '10.1.1.1', name: name, portal: true };
    const all = Object.assign({}, DS.hosts, p.extraHosts);
    const ip = all[n];
    if (!ip) return null;
    const internal = ip.startsWith('10.20.');
    if (p.net === 'offsite' && internal && !p.vpn) return null;
    return { ip, name: n };
  }

  function reachable(p, target) {
    // retourne une latence en ms ou null
    if (p.net === 'apipa' || p.net === 'nolink') return null;
    if (p.down.some(d => d === target.name || d === target.ip)) return null;
    if (p.net === 'captive') return target.portal ? 3 : null;
    const internal = target.ip.startsWith('10.20.');
    if (p.net === 'offsite' && internal && !p.vpn) return null;
    if (internal) return p.net === 'offsite' ? 28 : 1;
    return p.net === 'offsite' ? 34 : 12;
  }

  function ipconfig(p, all) {
    const out = ['', 'Configuration IP de Windows', ''];
    if (all) {
      out.push(dots('Nom de l’hôte') + p.host, dots('Suffixe DNS principal') + (p.net === 'offsite' || p.net === 'captive' ? '' : 'ostral.local'),
        dots('Type de nœud') + 'Hybride', dots('Routage IP activé') + 'Non', '');
    }
    out.push('Carte ' + (p.adapter === 'Wi-Fi' ? 'réseau sans fil Wi-Fi' : 'Ethernet Ethernet') + ' :', '');
    if (p.net === 'nolink') {
      out.push(dots('Statut du média') + 'Média déconnecté', dots('Suffixe DNS propre à la connexion') + '');
      if (all) out.push(dots('Description') + p.desc, dots('Adresse physique') + p.mac);
      return out.join('\n');
    }
    const suffix = (p.net === 'ok' || p.net === 'apipa') ? 'ostral.local' : (p.net === 'captive' ? 'hotel-wifi.local' : 'home');
    out.push(dots('Suffixe DNS propre à la connexion') + (p.net === 'apipa' ? '' : suffix));
    if (all) {
      out.push(dots('Description') + p.desc, dots('Adresse physique') + p.mac, dots('DHCP activé') + 'Oui', dots('Configuration automatique activée') + 'Oui');
    }
    if (p.net === 'apipa') {
      out.push(dots('Adresse IPv4 de configuration automatique') + p.ip + '(préféré)', dots('Masque de sous-réseau') + '255.255.0.0', dots('Passerelle par défaut') + '');
      if (all) out.push(dots('Serveurs DNS') + 'fec0:0:0:ffff::1%1');
      return out.join('\n');
    }
    out.push(dots('Adresse IPv4') + p.ip + (all ? '(préféré)' : ''), dots('Masque de sous-réseau') + p.mask, dots('Passerelle par défaut') + p.gw);
    if (all) {
      out.push(dots('Bail obtenu') + 'dimanche 1 novembre 2026 08:02:11', dots('Bail expirant') + 'lundi 9 novembre 2026 08:02:11',
        dots('Serveur DHCP') + (p.dhcpServer || p.dns[0]), dots('Serveurs DNS') + p.dns[0]);
      p.dns.slice(1).forEach(d => out.push(' '.repeat(41) + d));
      out.push(dots('NetBIOS sur Tcpip') + 'Activé');
    }
    return out.join('\n');
  }

  function ping(p, args) {
    const host = args.find(a => !a.startsWith('-') && !/^\d+$/.test(a) || /^\d+\.\d+\.\d+\.\d+$/.test(a));
    if (!host) return 'Utilisation : ping [-t] [-n nombre] nom_cible';
    const t = resolve(p, host);
    if (!t) {
      if ((p.net === 'apipa' || p.net === 'nolink') && /^\d+\.\d+\.\d+\.\d+$/.test(host)) return 'PING : échec de la transmission. Défaillance générale.';
      return 'La requête Ping n’a pas pu trouver l’hôte ' + host + '. Vérifiez le nom et essayez à nouveau.';
    }
    if (p.net === 'apipa' || p.net === 'nolink') return 'PING : échec de la transmission. Défaillance générale.';
    const label = t.name && !/^\d/.test(host) ? host + ' [' + t.ip + ']' : t.ip;
    const lines = ['', 'Envoi d’une requête \'Ping\'  ' + label + ' avec 32 octets de données :'];
    const ms = reachable(p, t);
    for (let i = 0; i < 4; i++) {
      if (ms == null) lines.push('Délai d’attente de la demande dépassé.');
      else lines.push('Réponse de ' + t.ip + ' : octets=32 temps' + (ms < 1 ? '<1' : '=' + (ms + (i % 2))) + ' ms TTL=' + (t.ip.startsWith('10.') ? 127 : 116));
    }
    lines.push('', 'Statistiques Ping pour ' + t.ip + ':', '    Paquets : envoyés = 4, reçus = ' + (ms == null ? 0 : 4) + ', perdus = ' + (ms == null ? 4 : 0) + ' (perte ' + (ms == null ? 100 : 0) + '%),');
    if (ms != null) lines.push('Durée approximative des boucles en millisecondes :', '    Minimum = ' + ms + 'ms, Maximum = ' + (ms + 1) + 'ms, Moyenne = ' + ms + 'ms');
    return lines.join('\n');
  }

  function nslookup(p, args) {
    const host = args[0];
    const server = p.net === 'offsite' || p.net === 'captive' ? (p.net === 'captive' ? '10.1.1.1' : p.gw) : p.dns[0];
    const sname = p.net === 'ok' ? 'srv-dc-01.ostral.local' : 'UnKnown';
    if (p.net === 'apipa' || p.net === 'nolink') {
      return 'DNS request timed out.\n    timeout was 2 seconds.\nServeur :   UnKnown\nAddress:  ' + p.dns[0] + '\n\n*** Le délai de la requête vers UnKnown a expiré';
    }
    if (!host) return 'Serveur par défaut :   ' + sname + '\nAddress:  ' + server + '\n\n> (mode interactif non simulé : tapez nslookup nom)';
    const t = resolve(p, host);
    const head = 'Serveur :   ' + sname + '\nAddress:  ' + server + '\n\n';
    if (!t) return head + '*** ' + sname + ' ne parvient pas à trouver ' + host + ' : Non-existent domain';
    const ext = !t.ip.startsWith('10.20.');
    return head + (ext ? 'Réponse ne faisant pas autorité :\n' : '') + 'Nom :    ' + host.toLowerCase() + '\nAddress:  ' + t.ip;
  }

  function tracert(p, args) {
    const host = args.find(a => !a.startsWith('-'));
    if (!host) return 'Utilisation : tracert nom_cible';
    const t = resolve(p, host);
    if (!t) return 'Impossible de résoudre le nom système cible ' + host + '.';
    if (p.net === 'apipa' || p.net === 'nolink') return 'Échec de la transmission. Défaillance générale.';
    const lines = ['', 'Détermination de l’itinéraire vers ' + host + ' [' + t.ip + ']', 'avec un maximum de 30 sauts :', ''];
    const ms = reachable(p, t);
    const hop = (n, a, b) => lines.push(padL(n, 3) + padL(a, 8) + padL(a, 9) + padL(a, 9) + '  ' + b);
    hop(1, '<1 ms', p.gw);
    if (ms == null) {
      for (let i = 2; i <= 5; i++) lines.push(padL(i, 3) + '       *        *        *     Délai d’attente de la demande dépassé.');
      lines.push('', '(Interrompu après 5 sauts sans réponse.)');
      return lines.join('\n');
    }
    if (t.ip.startsWith('10.20.') && p.net === 'ok') { hop(2, '1 ms', t.ip); }
    else { hop(2, '2 ms', p.net === 'ok' ? '10.20.0.1' : '100.64.12.1'); hop(3, '8 ms', 'fw-edge [185.42.117.1]'); hop(4, '11 ms', 'lyon-ix.opérateur.net [194.68.129.10]'); hop(5, ms + ' ms', t.ip); }
    lines.push('', 'Itinéraire déterminé.');
    return lines.join('\n');
  }

  function tasklist(p) {
    const lines = ['', pad('Nom de l’image', 26) + padL('PID', 8) + ' ' + pad('Nom de la session', 17) + padL('Utilisation', 14),
      '========================= ======== ================ ============='];
    p.procs.forEach(pr => lines.push(pad(pr[0], 26) + padL(pr[1], 8) + ' ' + pad(pr[2], 17) + padL(pr[3].toLocaleString('fr-FR') + ' Ko', 14)));
    return lines.join('\n');
  }

  function getProcess(p, sortCpu) {
    let rows = p.procs.map(pr => ({ n: pr[0].replace(/\.exe$/i, ''), id: pr[1], ws: Math.round(pr[3] / 1024), cpu: p.cpu[pr[0]] != null ? p.cpu[pr[0]] : +(((pr[1] * 7) % 97) / 10).toFixed(2) }));
    if (sortCpu) rows.sort((a, b) => b.cpu - a.cpu);
    const lines = ['', 'Handles  WS(M)   CPU(s)      Id ProcessName', '-------  -----   ------      -- -----------'];
    rows.forEach(r => lines.push(padL(Math.round(r.id / 9) + 120, 7) + padL(r.ws, 7) + padL(r.cpu.toFixed(2), 9) + padL(r.id, 8) + ' ' + r.n));
    return lines.join('\n');
  }

  function serviceTable(p, name) {
    const names = name ? Object.keys(p.services).filter(k => k.toLowerCase() === name.toLowerCase()) : Object.keys(p.services);
    if (name && !names.length) return 'Get-Service : Impossible de trouver un service assorti du nom de service « ' + name + ' ».';
    const lines = ['', 'Status   Name               DisplayName', '------   ----               -----------'];
    names.forEach(k => lines.push(pad(p.services[k], 9) + pad(k, 19) + (SERVICE_NAMES[k] || k)));
    return lines.join('\n');
  }

  function disk(p, style) {
    const used = (p.disk.size - p.disk.free).toFixed(2).replace('.', ',');
    const free = p.disk.free.toFixed(2).replace('.', ',');
    if (style === 'wmic') {
      const gb = 1073741824;
      return 'Caption  FreeSpace     Size\nC:       ' + pad(Math.round(p.disk.free * gb), 14) + Math.round(p.disk.size * gb);
    }
    return '\nName           Used (GB)     Free (GB) Provider      Root\n----           ---------     --------- --------      ----\nC              ' + padL(used, 9) + padL(free, 14) + ' FileSystem    C:\\';
  }

  const HELP = [
    'Commandes disponibles dans ce terminal simulé :',
    '  ipconfig [/all | /release | /renew | /flushdns]   ping <hôte>   tracert <hôte>',
    '  nslookup <nom>   Test-NetConnection <hôte> [-Port n]   getmac',
    '  hostname   whoami [/groups]   systeminfo   quser',
    '  net use   net user <login> /domain   gpupdate /force   gpresult /r   klist purge',
    '  tasklist   taskkill /im <processus> /f   Get-Process [| Sort-Object CPU -Descending]',
    '  Get-Service [nom]   sc query <nom>   Restart-Service <nom>   net stop|start <nom>',
    '  Get-Printer   Get-PrintJob -PrinterName <nom>   Get-PSDrive C   wmic logicaldisk get size,freespace,caption',
    '  sfc /scannow   shutdown /r /t 0   cls   ver   date /t   time /t'
  ].join('\n');

  /* ctx: { profile, setFlag(f), scenarioCmd(line) -> string|null, findUser(login) } */
  DS.runCommand = function (raw, ctx) {
    const line = raw.trim();
    if (!line) return { out: '' };
    const p = ctx.profile;
    const set = (f) => ctx.setFlag && ctx.setFlag(f);
    if (ctx.scenarioCmd) {
      const r = ctx.scenarioCmd(line);
      if (r != null) return typeof r === 'string' ? { out: r } : r;
    }
    const lower = line.toLowerCase().replace(/\s+/g, ' ');
    const parts = lower.split(' ');
    const cmd = parts[0];
    const args = line.trim().split(/\s+/).slice(1);
    const largs = parts.slice(1);

    switch (cmd) {
      case 'help': case 'aide': case '/?': case 'get-help': return { out: HELP };
      case 'cls': case 'clear': case 'clear-host': return { clear: true, out: '' };
      case 'ver': return { out: '\nMicrosoft Windows [version 10.0.22631.4460]' };
      case 'date': return { out: 'dim. 01/11/2026' };
      case 'time': return { out: '10:42' };
      case 'echo': return { out: args.join(' ') };
      case 'hostname': set('cmd:hostname'); return { out: p.host };
      case 'getmac': set('cmd:getmac'); return { out: '\nAdresse physique    Nom du transport\n=================== ==========================================================\n' + p.mac + '   \\Device\\Tcpip_{6A1F2C3D-0B9E-4F11-9D2A-7C5E3B1A0F42}' };
      case 'whoami':
        if (largs[0] === '/groups') {
          set('cmd:whoami_groups');
          const lines = ['', 'INFORMATIONS DE GROUPE', '----------------------', '', 'Nom du groupe                              Type     Attributs', '========================================== ======== =========================================='];
          lines.push(pad('Tout le monde', 43) + pad('Groupe', 9) + 'Groupe obligatoire, Activé par défaut, Groupe activé');
          (p.tokenGroups || p.groups).forEach(g => lines.push(pad('OSTRAL\\' + g, 43) + pad('Groupe', 9) + 'Groupe obligatoire, Activé par défaut, Groupe activé'));
          return { out: lines.join('\n') };
        }
        set('cmd:whoami');
        return { out: 'ostral\\' + p.login };
      case 'ipconfig': {
        const opt = largs[0] || '';
        if (!opt) { set('cmd:ipconfig'); return { out: ipconfig(p, false) }; }
        if (opt === '/all') { set('cmd:ipconfig'); set('cmd:ipconfig_all'); return { out: ipconfig(p, true) }; }
        if (opt === '/flushdns') { set('cmd:flushdns'); return { out: '\nConfiguration IP de Windows\n\nCache de résolution DNS vidé.' }; }
        if (opt === '/displaydns') return { out: '\nConfiguration IP de Windows\n\n    intranet.ostral-bio.fr\n    ----------------------------------------\n    Nom d’enregistrement . . : intranet.ostral-bio.fr\n    Type d’enregistrement. . : 1\n    Durée de vie . . . . . . : 3412\n    Enregistrement A (hôte). : 10.20.1.40' };
        if (opt === '/release') { set('cmd:release'); return { out: '\nConfiguration IP de Windows\n\n' + (p.net === 'nolink' ? 'Aucune opération ne peut être effectuée sur ' + p.adapter + ' tant que son média est déconnecté.' : 'Carte ' + p.adapter + ' : adresse IP libérée. Pensez à faire ipconfig /renew.') }; }
        if (opt === '/renew') {
          set('cmd:renew');
          if (p.net === 'nolink') return { out: '\nConfiguration IP de Windows\n\nAucune opération ne peut être effectuée sur ' + p.adapter + ' tant que son média est déconnecté.' };
          if (p.net === 'apipa') return { out: '\nConfiguration IP de Windows\n\nUne erreur s’est produite lors du renouvellement de l’interface ' + p.adapter + ' : impossible de contacter votre serveur DHCP. Le délai d’attente de la demande a expiré.' };
          return { out: ipconfig(p, false) };
        }
        return { out: 'Option non reconnue. Essayez : ipconfig /all, /release, /renew, /flushdns' };
      }
      case 'ping': set('cmd:ping'); if (largs.length) set('ping:' + largs.filter(a => !a.startsWith('-')).pop()); return { out: ping(p, largs) };
      case 'tracert': set('cmd:tracert'); return { out: tracert(p, largs) };
      case 'nslookup': set('cmd:nslookup'); if (largs[0]) set('nslookup:' + largs[0]); return { out: nslookup(p, largs) };
      case 'test-netconnection': case 'tnc': {
        set('cmd:tnc');
        const host = largs.find(a => !a.startsWith('-') && !/^\d+$/.test(a)) || 'internetbeacon.msedge.net';
        const port = (largs.indexOf('-port') >= 0) ? largs[largs.indexOf('-port') + 1] : null;
        set('ping:' + host);
        const t = resolve(p, host);
        if (!t) return { out: 'AVERTISSEMENT : Échec de la résolution du nom ' + host + '\n\nComputerName   : ' + host + '\nRemoteAddress  :\nPingSucceeded  : False' };
        const ms = reachable(p, t);
        let o = '\nComputerName           : ' + host + '\nRemoteAddress          : ' + t.ip + '\nInterfaceAlias         : ' + p.adapter + '\nSourceAddress          : ' + p.ip;
        if (port) set('cmd:tncport');
        if (port) o += '\nRemotePort             : ' + port + '\nTcpTestSucceeded       : ' + (ms != null ? 'True' : 'False');
        else o += '\nPingSucceeded          : ' + (ms != null ? 'True' : 'False') + '\nPingReplyDetails (RTT) : ' + (ms != null ? ms + ' ms' : '0 ms');
        return { out: o };
      }
      case 'systeminfo': set('cmd:systeminfo');
        return { out: ['', 'Nom de l’hôte:                              ' + p.host, 'Nom du système d’exploitation:              Microsoft ' + p.os.replace(' 23H2', ''), 'Version du système:                         10.0.22631 N/A version 22631',
          'Fabricant du système:                       ' + (p.model || '').split(' ')[0], 'Modèle du système:                          ' + p.model, 'Heure de démarrage du système:              ' + p.boot,
          'Mémoire physique totale:                    16 088 Mo', 'Mémoire physique disponible:                ' + (p.freeRam || '7 412') + ' Mo', 'Domaine:                                    ostral.local', 'Serveur d’ouverture de session:             \\\\SRV-DC-01'].join('\n') };
      case 'quser': return { out: ' UTILISATEUR           SESSION           ID  ÉTAT    TEMPS INACT TEMPS SESSION\n>' + pad(p.login, 22) + 'console            1  Actif      aucun   ' + p.boot.split(',')[0] };
      case 'tasklist': set('cmd:tasklist'); return { out: tasklist(p) };
      case 'get-process': case 'gps': case 'ps': {
        set('cmd:getprocess');
        const sortCpu = /sort.*cpu/.test(lower);
        if (sortCpu) set('cmd:topcpu');
        return { out: getProcess(p, sortCpu) };
      }
      case 'taskkill': {
        const i = largs.indexOf('/im');
        const name = i >= 0 ? args[i + 1] : null;
        if (!name) return { out: 'Syntaxe : taskkill /im nom_du_processus.exe /f' };
        const pr = p.procs.find(x => x[0].toLowerCase() === name.toLowerCase());
        if (!pr) return { out: 'Erreur : le processus « ' + name + ' » est introuvable.' };
        set('kill:' + pr[0].toLowerCase());
        if (ctx.onKill) ctx.onKill(pr[0]);
        return { out: 'Opération réussie : le processus « ' + pr[0] + ' » de PID ' + pr[1] + ' a été arrêté.' };
      }
      case 'net': {
        const sub = largs[0];
        if (sub === 'use') {
          set('cmd:netuse');
          const lines = ['De nouvelles connexions seront mémorisées.', '', '', 'État         Local     Distant                        Réseau', '-------------------------------------------------------------------------------'];
          p.drives.forEach(d => lines.push(pad(d.st, 13) + pad(d.l, 10) + pad(d.path, 31) + 'Microsoft Windows Network'));
          lines.push('La commande s’est terminée correctement.');
          return { out: lines.join('\n') };
        }
        if (sub === 'user') {
          const login = largs[1];
          if (!login || login === '/domain') return { out: 'Syntaxe : net user identifiant /domain' };
          set('cmd:netuser');
          if (p.net !== 'ok' && !p.vpn) return { out: 'La demande sera traitée sur un contrôleur de domaine pour le domaine ostral.local.\n\nErreur système 1355.\n\nLe domaine spécifié n’existe pas ou n’a pas pu être contacté.' };
          const u = ctx.findUser && ctx.findUser(login);
          if (!u) return { out: 'La demande sera traitée sur un contrôleur de domaine pour le domaine ostral.local.\n\nLe nom d’utilisateur est introuvable.\n\nVous obtiendrez une aide supplémentaire en entrant NET HELPMSG 2221.' };
          return {
            out: ['La demande sera traitée sur un contrôleur de domaine pour le domaine ostral.local.', '',
              pad('Nom d’utilisateur', 38) + u.login, pad('Nom complet', 38) + u.name, pad('Commentaire', 38) + u.title,
              pad('Compte : actif', 38) + (u.enabled ? (u.locked ? 'Verrouillé' : 'Oui') : 'Non'), pad('Le compte expire', 38) + 'Jamais', '',
              pad('Dernier changem. du mot de passe', 38) + 'il y a ' + u.pwdAgeDays + ' jours', pad('Le mot de passe expire', 38) + (u.pwdExpired ? 'Expiré' : 'dans ' + Math.max(0, 90 - u.pwdAgeDays) + ' jours'),
              pad('L’utilisateur peut changer de mot de passe', 38) + 'Oui', pad('Dernier accès', 38) + u.lastLogon, '',
              pad('Appartient aux groupes globaux', 38) + u.groups.map(g => '*' + g).join(' '), 'La commande s’est terminée correctement.'].join('\n')
          };
        }
        if (sub === 'stop' || sub === 'start') {
          const name = largs[1];
          const key = Object.keys(p.services).find(k => k.toLowerCase() === (name || '').toLowerCase());
          if (!key) return { out: 'Le nom de service n’est pas valide.\n\nVous obtiendrez une aide supplémentaire en entrant NET HELPMSG 2185.' };
          const dn = SERVICE_NAMES[key] || key;
          if (sub === 'stop') { p.services[key] = 'Stopped'; set('svcstop:' + key.toLowerCase()); if (ctx.onService) ctx.onService(key, 'stop'); return { out: 'Le service ' + dn + ' s’arrête.\nLe service ' + dn + ' a été arrêté.' }; }
          p.services[key] = 'Running'; set('svcstart:' + key.toLowerCase()); if (ctx.onService) ctx.onService(key, 'start');
          return { out: 'Le service ' + dn + ' démarre.\nLe service ' + dn + ' a démarré.' };
        }
        return { out: 'La syntaxe de cette commande est :\n\nNET USE | USER | START | STOP' };
      }
      case 'get-service': case 'gsv': set('cmd:getservice'); if (largs[0]) set('getservice:' + largs[0].toLowerCase()); return { out: serviceTable(p, args[0]) };
      case 'sc': {
        if (largs[0] !== 'query' || !largs[1]) return { out: 'Syntaxe : sc query nom_du_service' };
        set('cmd:getservice'); set('getservice:' + largs[1]);
        const key = Object.keys(p.services).find(k => k.toLowerCase() === largs[1]);
        if (!key) return { out: '[SC] EnumQueryServicesStatus:OpenService échec(s) 1060 :\n\nLe service spécifié n’existe pas en tant que service installé.' };
        const st = p.services[key] === 'Running' ? '4  RUNNING' : '1  STOPPED';
        return { out: '\nSERVICE_NAME: ' + key + '\n        TYPE               : 10  WIN32_OWN_PROCESS\n        STATE              : ' + st + '\n        WIN32_EXIT_CODE    : 0  (0x0)' };
      }
      case 'restart-service': {
        const name = (args.find(a => !a.startsWith('-')) || '').replace(/"/g, '');
        const key = Object.keys(p.services).find(k => k.toLowerCase() === name.toLowerCase());
        if (!key) return { out: 'Restart-Service : Impossible de trouver un service assorti du nom de service « ' + name + ' ».' };
        p.services[key] = 'Running'; set('svcrestart:' + key.toLowerCase()); if (ctx.onService) ctx.onService(key, 'restart');
        return { out: 'AVERTISSEMENT : Attente de l’arrêt du service « ' + (SERVICE_NAMES[key] || key) + ' (' + key + ') »...\nAVERTISSEMENT : Attente du démarrage du service « ' + (SERVICE_NAMES[key] || key) + ' (' + key + ') »...' };
      }
      case 'get-printer': {
        set('cmd:getprinter');
        const lines = ['', 'Name                 Type     DriverName                        PortName          PrinterStatus', '----                 ----     ----------                        --------          -------------'];
        p.printers.forEach(pr => lines.push(pad(pr.name, 21) + pad('Local', 9) + pad(pr.driver, 34) + pad(pr.port, 18) + pr.status));
        return { out: lines.join('\n') };
      }
      case 'get-printjob': {
        set('cmd:getprintjob');
        const i = largs.indexOf('-printername');
        const name = (i >= 0 ? args[i + 1] : args[0] || '').replace(/"/g, '');
        const pr = p.printers.find(x => x.name.toLowerCase() === name.toLowerCase());
        if (!pr) return { out: 'Get-PrintJob : L’imprimante « ' + name + ' » est introuvable. Essayez Get-Printer pour la liste.' };
        if (!pr.jobs) return { out: '(aucun travail d’impression en attente)' };
        const lines = ['', '   Id ComputerName PrinterName   DocumentName                   SubmittedTime         JobStatus', '   -- ------------ -----------   ------------                   -------------         ---------'];
        (pr.jobList || []).forEach(j => lines.push(padL(j[0], 5) + ' ' + pad(p.host, 13) + pad(pr.name, 14) + pad(j[1], 31) + pad(j[2], 22) + j[3]));
        return { out: lines.join('\n') };
      }
      case 'get-psdrive': case 'get-volume': set('cmd:disk'); return { out: disk(p) };
      case 'wmic': if (/logicaldisk/.test(lower)) { set('cmd:disk'); return { out: disk(p, 'wmic') }; } return { out: 'wmic : seule la commande « wmic logicaldisk get size,freespace,caption » est simulée.' };
      case 'gpupdate':
        set('cmd:gpupdate');
        if (p.net !== 'ok' && !p.vpn) return { out: 'Mise à jour de la stratégie...\n\nImpossible de mettre à jour la stratégie d’ordinateur. Les erreurs suivantes se sont produites :\n\nÉchec du traitement de la stratégie de groupe. Windows n’a pas pu déterminer le nom de l’ordinateur. Cela peut être dû à un problème de résolution de noms.' };
        return { out: 'Mise à jour de la stratégie...\n\nLa mise à jour de la stratégie d’ordinateur s’est terminée sans erreur.\nLa mise à jour de la stratégie utilisateur s’est terminée sans erreur.' };
      case 'gpresult':
        set('cmd:gpresult');
        return { out: ['', 'Outil de résultats de stratégie de groupe du système d’exploitation Microsoft (R) v2.0', '', 'PARAMÈTRES UTILISATEUR', '----------------------', '    CN=' + p.fullName + ',OU=...,OU=Utilisateurs,DC=ostral,DC=local', '    Dernière application de la stratégie de groupe : 01/11/2026 à 08:03:40',
          '    Stratégie de groupe appliquée depuis : SRV-DC-01.ostral.local', '', '    Objets Stratégie de groupe appliqués', '    -------------------------------------', '        GPO_Utilisateurs_Lecteurs', '        GPO_Utilisateurs_Imprimantes', '        GPO_Securite_Verrouillage_Ecran', '',
          '    L’utilisateur est membre des groupes de sécurité suivants', '    ---------------------------------------------------------', '        Utilisateurs du domaine', ...(p.tokenGroups || p.groups).map(g => '        ' + g)].join('\n') };
      case 'klist':
        if (largs[0] === 'purge') { set('cmd:klistpurge'); return { out: '\nID d’ouverture de session actuel : 0:0x5d3e1a\n\tSupprimer tous les tickets :\n\tTicket(s) vidé(s) !' }; }
        return { out: '\nID d’ouverture de session actuel : 0:0x5d3e1a\n\nTickets mis en cache : (3)\n\n#0>\tClient : ' + p.login + ' @ OSTRAL.LOCAL\n\tServeur : krbtgt/OSTRAL.LOCAL @ OSTRAL.LOCAL' };
      case 'sfc':
        set('cmd:sfc');
        return { out: '\nDébut de l’analyse du système. Ce processus va prendre un certain temps.\n\nDébut de la phase de vérification de l’analyse du système.\nVérification 100 % terminée.\n\nLa protection des ressources Windows n’a trouvé aucune violation d’intégrité.' };
      case 'chkdsk': set('cmd:chkdsk'); return { out: 'Le type du système de fichiers est NTFS.\n\nAVERTISSEMENT : le paramètre /F n’a pas été spécifié.\nExécution de CHKDSK en mode lecture seule.\n\nWindows a analysé le système de fichiers sans trouver de problème.\nAucune autre action n’est requise.' };
      case 'shutdown':
        if (/\/r/.test(lower)) { set('reboot'); if (ctx.onReboot) ctx.onReboot(); return { out: 'Le poste ' + p.host + ' redémarre. La session distante va être fermée puis rétablie dans 2 minutes environ.' }; }
        return { out: 'Utilisez « shutdown /r /t 0 » pour redémarrer le poste à distance.' };
      case 'netstat': set('cmd:netstat');
        return { out: '\nConnexions actives\n\n  Proto  Adresse locale         Adresse distante       État\n  TCP    ' + pad(p.ip + ':49712', 23) + pad('10.20.1.10:389', 23) + 'ESTABLISHED\n  TCP    ' + pad(p.ip + ':49820', 23) + pad('52.97.146.10:443', 23) + 'ESTABLISHED\n  TCP    ' + pad(p.ip + ':50114', 23) + pad('10.20.1.21:445', 23) + 'ESTABLISHED' };
      case 'clear-dnsclientcache': set('cmd:flushdns'); return { out: '' };
      case 'cd': case 'dir': case 'ls': return { out: ' Le volume dans le lecteur C n’a pas de nom.\n Répertoire de C:\\Users\\' + p.login + '\n\n01/11/2026  08:03    <DIR>          Bureau\n01/11/2026  08:03    <DIR>          Documents\n01/11/2026  08:03    <DIR>          Téléchargements\n01/11/2026  08:03    <DIR>          OneDrive - Ostral Biologie' };
      default:
        return { out: '\'' + parts[0] + '\' n’est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.\n(Tapez « help » pour la liste des commandes simulées.)' };
    }
  };
})();
