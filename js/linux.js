/* DeskSim — shell Linux simulé (bash) pour PuTTY/SSH et le labo */
(function () {
  const G = 1073741824, M = 1048576, K = 1024;
  const human = (b) => b >= G ? (b / G).toFixed(1).replace('.0', '').replace('.', ',') + 'G' : b >= M ? Math.round(b / M) + 'M' : b >= K ? Math.round(b / K) + 'K' : b + '';
  const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, Math.max(n, String(s).length));
  const padL = (s, n) => (' '.repeat(n) + String(s)).slice(-Math.max(n, String(s).length));

  /* Fabrique un système de fichiers à partir d'une liste { chemin: contenu | {size} } */
  function makeFs(spec) {
    const fs = { '/': { d: 1 } };
    Object.keys(spec).forEach(p => {
      const parts = p.split('/').filter(Boolean);
      let cur = '';
      parts.forEach((seg, i) => {
        cur += '/' + seg;
        if (i < parts.length - 1 || p.endsWith('/')) { if (!fs[cur]) fs[cur] = { d: 1 }; }
      });
      if (!p.endsWith('/')) {
        const v = spec[p];
        fs['/' + parts.join('/')] = typeof v === 'string' ? { c: v, size: v.length } : Object.assign({ c: '' }, v);
      }
    });
    return fs;
  }

  const NGINX_ERR = '2026/11/02 09:12:44 [error] 812#812: *4411 connect() to unix:/run/php/php8.2-fpm.sock failed (2: No such file or directory) while connecting to upstream, client: 10.20.3.140, server: intranet.ostral-bio.fr, request: "GET / HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.2-fpm.sock:", host: "intranet.ostral-bio.fr"\n2026/11/02 09:13:02 [error] 812#812: *4417 connect() to unix:/run/php/php8.2-fpm.sock failed (2: No such file or directory) while connecting to upstream, client: 10.30.1.88, server: intranet.ostral-bio.fr';

  DS.linuxHosts = {
    'srv-intra-01': {
      ip: '10.20.1.40', os: 'Debian GNU/Linux 12 (bookworm)', kernel: '6.1.0-26-amd64',
      fs: () => makeFs({
        '/etc/hostname': 'srv-intra-01\n',
        '/etc/os-release': 'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\nNAME="Debian GNU/Linux"\nVERSION_ID="12"\nVERSION="12 (bookworm)"\nID=debian\n',
        '/etc/hosts': '127.0.0.1\tlocalhost\n10.20.1.40\tsrv-intra-01.ostral.local srv-intra-01\n',
        '/etc/resolv.conf': 'search ostral.local\nnameserver 10.20.1.10\nnameserver 10.20.1.11\n',
        '/etc/nginx/sites-enabled/intranet': 'server {\n    listen 443 ssl;\n    server_name intranet.ostral-bio.fr;\n    root /var/www/intranet;\n    location ~ \\.php$ {\n        fastcgi_pass unix:/run/php/php8.2-fpm.sock;\n        include fastcgi_params;\n    }\n}\n',
        '/etc/logrotate.d/nginx': '/var/log/nginx/*.log {\n    daily\n    rotate 14\n    compress\n}\n',
        '/etc/logrotate.d/php8.2-fpm': '/var/log/php8.2-fpm.log {\n    weekly\n    rotate 12\n    compress\n}\n',
        '/var/www/intranet/index.php': '<?php require __DIR__ . \'/config.php\'; /* … */',
        '/var/www/intranet/config.php': '<?php\nreturn [\n    \'site\' => \'Intranet Ostral Biologie\',\n    \'db_host\' => \'localhost\',\n    \'debug\' => true,   // activé le 28/10 pour un test, à remettre à false\n    \'log_file\' => \'/var/log/intranet/debug.log\',\n];\n',
        '/var/log/syslog': 'Nov  2 09:12:40 srv-intra-01 kernel: [EXT4-fs warning (device sda1)]: ext4_dx_add_entry: Directory index full!\nNov  2 09:12:41 srv-intra-01 systemd[1]: php8.2-fpm.service: Failed with result \'exit-code\'.\nNov  2 09:12:41 srv-intra-01 systemd[1]: Failed to start php8.2-fpm.service - The PHP 8.2 FastCGI Process Manager.\n',
        '/var/log/auth.log': 'Nov  2 10:41:12 srv-intra-01 sshd[2101]: Accepted password for tech from 10.20.6.15 port 51522 ssh2\n',
        '/var/log/nginx/access.log': { size: 48 * M, c: '10.20.3.140 - - [02/Nov/2026:09:13:02 +0100] "GET / HTTP/1.1" 502 157 "-" "Mozilla/5.0"\n10.30.1.88 - - [02/Nov/2026:09:13:05 +0100] "GET /procedures HTTP/1.1" 502 157 "-" "Mozilla/5.0"\n' },
        '/var/log/nginx/error.log': { size: 2 * M, c: NGINX_ERR + '\n' },
        '/var/log/intranet/debug.log': { size: 0, c: '[2026-11-02 09:12:39] DEBUG SQL: SELECT * FROM procedures WHERE site_id = 3 ORDER BY updated_at DESC\n[2026-11-02 09:12:39] DEBUG Template render: procedures/list.twig (12 ms)\n[2026-11-02 09:12:40] DEBUG SQL: SELECT * FROM news WHERE published = 1\n', dyn: 'debug' },
        '/var/log/intranet/app.log': { size: 120 * M, c: '[2026-11-01 18:02:11] INFO Publication procédure PRE-014 v3 par claire.vasseur\n' },
        '/var/log/php8.2-fpm.log': { size: 3 * M, c: '[02-Nov-2026 09:12:41] ERROR: failed to write to log file \'/var/log/php8.2-fpm.log\': No space left on device (28)\n' },
        '/var/log/journal/': true,
        '/var/log/apt/history.log': { size: 600 * K, c: 'Start-Date: 2026-10-28  14:02:11\nCommandline: apt upgrade\n' },
        '/home/tech/notes.txt': 'Serveur intranet – rappel :\n- nginx devant PHP-FPM (socket /run/php/php8.2-fpm.sock)\n- logs applicatifs : /var/log/intranet/\n- en cas de souci disque : vérifier /var/log\n',
        '/home/tech/scripts/ping_serveurs.sh': '#!/bin/bash\n# Ping chaque serveur de la liste et affiche OK / KO\nfor h in srv-dc-01 srv-fic-01 srv-fic-02 srv-sil-01; do\n  if ping -c 1 -W 1 "$h" > /dev/null; then echo "$h OK"; else echo "$h KO"; fi\ndone\n',
        '/tmp/': true, '/usr/': true, '/run/': true
      })
    },
    'lab-debian': {
      ip: '10.20.6.40', os: 'Debian GNU/Linux 12 (bookworm)', kernel: '6.1.0-26-amd64',
      fs: () => makeFs({
        '/etc/hostname': 'lab-debian\n',
        '/etc/os-release': 'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\nNAME="Debian GNU/Linux"\nVERSION_ID="12"\nID=debian\n',
        '/etc/hosts': '127.0.0.1\tlocalhost\n10.20.6.40\tlab-debian.ostral.local lab-debian\n',
        '/etc/resolv.conf': 'search ostral.local\nnameserver 10.20.1.10\n',
        '/var/log/syslog': 'Nov  2 08:01:02 lab-debian systemd[1]: Started cups.service - CUPS Scheduler.\nNov  2 08:01:03 lab-debian NetworkManager[512]: <info> device (enp1s0): state change: activated\n',
        '/var/log/cups/error_log': 'E [02/Nov/2026:08:30:12 +0100] [Job 41] Printer not connected; will retry in 30 seconds.\n',
        '/home/tech/bienvenue.txt': 'Bienvenue sur le poste Linux de formation.\nTape « help » pour la liste des commandes simulées.\n',
        '/home/tech/serveurs.txt': 'srv-dc-01\nsrv-fic-01\nsrv-fic-02\nsrv-sil-01\n',
        '/home/tech/logs/app.log': '2026-11-02 08:00:01 INFO Démarrage du service\n2026-11-02 08:15:22 ERROR Connexion à srv-sil-01 refusée\n2026-11-02 08:15:30 INFO Nouvelle tentative\n2026-11-02 08:16:02 ERROR Délai dépassé vers srv-sil-01\n2026-11-02 08:20:44 WARNING Disque /data à 85 %\n2026-11-02 09:02:10 INFO Synchronisation terminée\n',
        '/home/tech/Documents/procedure_imprimante.txt': 'Ajouter une imprimante : lpadmin -p NOM -E -v ipp://ADRESSE/ipp/print\n',
        '/tmp/': true, '/usr/': true
      })
    }
  };

  DS.newLinuxSession = function (host) {
    const h = DS.linuxHosts[host];
    return { host, user: 'tech', cwd: '/home/tech', fs: h.fs(), hist: [], sudoOk: false, connected: true };
  };

  function norm(path, cwd) {
    if (!path || path === '~') return '/home/tech';
    if (path.startsWith('~/')) path = '/home/tech/' + path.slice(2);
    const abs = path.startsWith('/') ? path : (cwd === '/' ? '' : cwd) + '/' + path;
    const out = [];
    abs.split('/').forEach(seg => { if (!seg || seg === '.') return; if (seg === '..') out.pop(); else out.push(seg); });
    return '/' + out.join('/');
  }
  const children = (fs, dir) => Object.keys(fs).filter(p => p !== dir && p.startsWith(dir === '/' ? '/' : dir + '/') && p.slice(dir === '/' ? 1 : dir.length + 1).indexOf('/') === -1).sort();

  /* ctx: { sess, state (fonction -> état scénario), setFlag } */
  DS.runLinux = function (raw, ctx) {
    const line = raw.trim();
    if (!line) return { out: '' };
    ctx.sess.hist.push(line);
    // séquences ; et &&
    if (/;|&&/.test(line) && !/^\s*for\s/.test(line)) {
      const parts = line.split(/;|&&/).map(s => s.trim()).filter(Boolean);
      const outs = [];
      for (const p of parts) { const r = runPipeline(p, ctx); if (r.clear) return r; if (r.out) outs.push(r.out); if (r.exit) return { out: outs.join('\n'), exit: true }; }
      return { out: outs.join('\n') };
    }
    const m = line.match(/^for\s+(\w+)\s+in\s+(.+?);\s*do\s+(.+?);\s*done$/);
    if (m) {
      ctx.setFlag('lx:for');
      const items = m[2].trim().split(/\s+/);
      let items2 = items;
      if (items.length === 1 && /^\$\(cat\s+(.+)\)$/.test(items[0])) {
        const f = ctx.sess.fs[norm(items[0].match(/^\$\(cat\s+(.+)\)$/)[1], ctx.sess.cwd)];
        items2 = f && !f.d ? f.c.trim().split(/\s+/) : [];
      }
      return { out: items2.map(it => runPipeline(m[3].replace(new RegExp('\\$\\{?' + m[1] + '\\}?', 'g'), it).replace(/"/g, ''), ctx).out).join('\n') };
    }
    return runPipeline(line, ctx);
  };

  function runPipeline(line, ctx) {
    const segs = line.split('|').map(s => s.trim());
    let r = runOne(segs[0], ctx);
    if (r.clear || r.exit) return r;
    for (let i = 1; i < segs.length; i++) {
      ctx.setFlag('lx:pipe');
      const [c, ...a] = segs[i].split(/\s+/);
      let lines = (r.out || '').split('\n');
      if (c === 'grep') {
        ctx.setFlag('lx:grep');
        const inv = a.includes('-v'), ci = a.includes('-i');
        const pat = a.filter(x => !x.startsWith('-')).join(' ').replace(/^["']|["']$/g, '');
        const re = new RegExp(pat.replace(/[.*+?^${}()[\]\\]/g, '\\$&'), ci ? 'i' : '');
        lines = lines.filter(l => re.test(l) !== inv);
      } else if (c === 'head' || c === 'tail') {
        const n = parseInt((a.find(x => /^-?\d+$/.test(x)) || (a[a.indexOf('-n') + 1]) || '10').replace('-', ''), 10) || 10;
        lines = c === 'head' ? lines.slice(0, n) : lines.slice(-n);
      } else if (c === 'sort') {
        const hv = s => { const mm = s.trim().match(/^([\d,.]+)([KMG]?)/); if (!mm) return 0; return parseFloat(mm[1].replace(',', '.')) * ({ K: 1, M: 1e3, G: 1e6 }[mm[2]] || 0.001); };
        lines = lines.slice().sort((x, y) => a.some(o => o.includes('h')) ? hv(x) - hv(y) : x.localeCompare(y));
        if (a.some(o => o.includes('r'))) lines.reverse();
      } else if (c === 'wc') {
        ctx.setFlag('lx:wc');
        lines = [String(lines.filter(l => l !== '').length)];
      } else if (c === 'less' || c === 'more' || c === 'cat') {
        /* rien */
      } else if (c === 'uniq') {
        lines = lines.filter((l, j) => l !== lines[j - 1]);
      } else {
        return { out: c + ' : commande non simulée dans un tube (essayez grep, head, tail, sort, wc -l).' };
      }
      r = { out: lines.join('\n') };
    }
    return r;
  }

  function runOne(cmdline, ctx) {
    const s = ctx.sess;
    const st = ctx.state ? ctx.state() : {};
    const set = ctx.setFlag;
    let toks = cmdline.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    toks = toks.map(t => t.replace(/^["']|["']$/g, ''));
    let sudo = false;
    if (toks[0] === 'sudo') { sudo = true; toks = toks.slice(1); set('lx:sudo'); }
    const pre = sudo && !s.sudoOk ? (s.sudoOk = true, '[sudo] Mot de passe de tech : ********\n') : '';
    const cmd = toks[0] || '';
    const args = toks.slice(1);
    const opts = args.filter(a => a.startsWith('-')).join('');
    const pos = args.filter(a => !a.startsWith('-'));
    const deny = (what) => ({ out: pre + what + ' : Permission non accordée' });
    const fs = s.fs;
    const res = (o) => ({ out: pre + o });
    const fileSize = (p) => {
      const f = fs[p];
      if (!f) return 0;
      if (f.dyn === 'debug') return Math.round((st.debugSize || 0) * G) + (st.debugSize ? 0 : 342);
      if (p === '/var/log/journal') return 0;
      if (f.d) return children(fs, p).reduce((a, c) => a + fileSize(c), 0) + (p === '/var/log/journal' ? 0 : 4096);
      return f.size || (f.c || '').length;
    };
    const dirSize = (p) => {
      if (p === '/var/log/journal') return Math.round((st.journalSize || 0.1) * G);
      const f = fs[p];
      if (!f) return 0;
      if (!f.d) return fileSize(p);
      return 4096 + children(fs, p).reduce((a, c) => a + dirSize(c), 0);
    };

    switch (cmd) {
      case 'help': case 'aide':
        return res(['Commandes simulées :', '  navigation : pwd  ls [-l] [-a] [-h]  cd  cat  head  tail [-n N]  less  grep [-i] motif fichier  find / -size +1G',
          '  système    : whoami  hostname  uname -a  uptime  date  free -h  df -h  du -sh <chemin>  top  ps aux  history',
          '  services   : systemctl status|restart|start|stop <service>  systemctl --failed  journalctl -u <service> [-n N]',
          '               journalctl --disk-usage  journalctl --vacuum-size=200M',
          '  réseau     : ip a  ip r  ping -c 4 <hôte>  ss -tulpn  curl -I <url>  nslookup <nom>',
          '  fichiers   : truncate -s 0 <fichier>  rm <fichier>  (avec sudo pour les fichiers système)',
          '  paquets    : apt update  apt list --upgradable     impression : lpstat -p   usb : lsusb',
          '  scripts    : tubes « | grep | sort -h | head | wc -l », enchaînement « ; » et « && »,',
          '               boucle : for h in srv-dc-01 srv-fic-01; do ping -c 1 $h; done',
          '  sortie     : exit'].join('\n'));
      case 'clear': return { clear: true, out: '' };
      case 'exit': case 'logout': s.connected = false; return { out: 'déconnexion\nConnexion à ' + s.host + ' fermée.', exit: true };
      case 'pwd': set('lx:pwd'); return res(s.cwd);
      case 'whoami': set('lx:whoami'); return res(sudo ? 'root' : 'tech');
      case 'id': return res('uid=1000(tech) gid=1000(tech) groupes=1000(tech),27(sudo),4(adm)');
      case 'hostname': set('lx:hostname'); return res(s.host);
      case 'uname': set('lx:uname'); return res(opts.includes('a') ? 'Linux ' + s.host + ' ' + DS.linuxHosts[s.host].kernel + ' #1 SMP PREEMPT_DYNAMIC Debian 6.1.112-1 (2026-09-30) x86_64 GNU/Linux' : 'Linux');
      case 'date': return res('lun. 02 nov. 2026 10:42:17 CET');
      case 'uptime': set('lx:uptime'); return res(' 10:42:17 up 12 days,  3:05,  1 user,  load average: 0,08, 0,05, 0,01');
      case 'history': return res(s.hist.map((h, i) => padL(i + 1, 5) + '  ' + h).join('\n'));
      case 'echo': return res(args.join(' '));
      case 'man': return res('Le manuel n’est pas simulé. Essayez « help ».');
      case 'nano': case 'vi': case 'vim': return res('Éditeur non simulé : utilisez cat, less ou grep pour lire les fichiers.');
      case 'cd': {
        set('lx:cd');
        const p = norm(pos[0] || '~', s.cwd);
        if (!fs[p]) return res('bash: cd: ' + pos[0] + ': Aucun fichier ou dossier de ce type');
        if (!fs[p].d) return res('bash: cd: ' + pos[0] + ': N’est pas un dossier');
        s.cwd = p; return { out: pre };
      }
      case 'ls': case 'll': {
        set('lx:ls');
        const p = norm(pos[0] || '.', s.cwd);
        const f = fs[p];
        if (!f) return res('ls: impossible d’accéder à \'' + pos[0] + '\': Aucun fichier ou dossier de ce type');
        const items = f.d ? children(fs, p) : [p];
        const long = opts.includes('l') || cmd === 'll';
        const names = items.map(c => c.split('/').pop()).filter(n => opts.includes('a') || !n.startsWith('.'));
        if (!long) return res(names.join('  '));
        const lines = ['total ' + Math.round(items.reduce((a, c) => a + fileSize(c), 0) / 1024)];
        items.forEach(c => {
          const it = fs[c], n = c.split('/').pop();
          const size = it.d ? 4096 : fileSize(c);
          const own = c.startsWith('/home/tech') ? 'tech tech' : (c.startsWith('/var/log') ? 'root adm ' : 'root root');
          lines.push((it.d ? 'drwxr-xr-x' : (c.endsWith('.sh') ? '-rwxr-xr-x' : '-rw-r--r--')) + ' 1 ' + own + ' ' + padL(opts.includes('h') ? human(size) : size, opts.includes('h') ? 5 : 12) + ' nov.  2 09:12 ' + n);
        });
        return res(lines.join('\n'));
      }
      case 'cat': case 'less': case 'more': case 'head': case 'tail': {
        const p = norm(pos.filter(x => !/^\d+$/.test(x))[0], s.cwd);
        if (!pos.length) return res(cmd + ' : il manque un nom de fichier');
        const f = fs[p];
        set('lx:cat'); set('lx:cat:' + p);
        if (cmd === 'tail') set('lx:tail');
        if (!f) return res(cmd + ': ' + pos[0] + ': Aucun fichier ou dossier de ce type');
        if (f.d) return res(cmd + ': ' + pos[0] + ': est un dossier');
        if (p === '/var/log/auth.log' && !sudo) return deny(cmd + ': ' + pos[0]);
        let lines = (f.c || '').replace(/\n$/, '').split('\n');
        const n = parseInt((args.find(x => /^-\d+$/.test(x)) || '').slice(1) || args[args.indexOf('-n') + 1] || '10', 10);
        if (cmd === 'head') lines = lines.slice(0, n);
        if (cmd === 'tail') lines = lines.slice(-n);
        let out = lines.join('\n');
        if (f.dyn === 'debug' && st.debugSize) out = '(fichier de ' + human(fileSize(p)) + ' : affichage des dernières lignes)\n' + out;
        if (cmd === 'tail' && opts.includes('f')) out += '\n(suivi interrompu : tail -f n’est pas interactif dans ce simulateur)';
        return res(out);
      }
      case 'grep': {
        set('lx:grep');
        const ci = opts.includes('i');
        const pat = pos[0];
        const file = pos[1];
        if (!pat || !file) return res('Utilisation : grep [-i] MOTIF FICHIER');
        const paths = file.endsWith('*') ? children(fs, norm(file.replace(/\/?\*$/, '') || '.', s.cwd)) : [norm(file, s.cwd)];
        const out = [];
        paths.forEach(p => { const f = fs[p]; if (!f || f.d) return; (f.c || '').split('\n').forEach(l => { if ((ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat)) && l) out.push((paths.length > 1 ? p + ':' : '') + l); }); });
        if (!fs[paths[0]]) return res('grep: ' + file + ': Aucun fichier ou dossier de ce type');
        return res(out.join('\n'));
      }
      case 'find': {
        set('lx:find');
        if (/size/.test(args.join(' '))) {
          const big = Object.keys(fs).filter(p => !fs[p].d && fileSize(p) > (args.join(' ').includes('+1G') ? G : 100 * M));
          return res(big.join('\n') + (big.length ? '' : '') + '\nfind: ‘/proc/1/fd’: Permission non accordée');
        }
        const name = args[args.indexOf('-name') + 1];
        if (name) { const re = new RegExp('^' + name.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'); return res(Object.keys(fs).filter(p => re.test(p.split('/').pop())).join('\n')); }
        return res(Object.keys(fs).filter(p => p.startsWith(norm(pos[0] || '.', s.cwd))).join('\n'));
      }
      case 'df': {
        set('lx:df');
        const used = st.rootUsed != null ? st.rootUsed : 6.2, size = st.rootSize || 20;
        const avail = Math.max(0, size - used);
        const pct = Math.min(100, Math.round(used / size * 100));
        const f = v => opts.includes('h') ? (v >= 1 ? v.toFixed(1).replace('.0', '').replace('.', ',') + 'G' : Math.round(v * 1024) + 'M') : Math.round(v * 1048576);
        return res(['Sys. de fichiers Taille Utilisé Dispo Uti% Monté sur', 'udev               982M       0  982M   0% /dev', 'tmpfs              197M    1,1M  196M   1% /run',
          pad('/dev/sda1', 17) + padL(f(size), 6) + padL(f(used), 9) + padL(avail ? f(avail) : '0', 6) + padL(pct + '%', 5) + ' /', 'tmpfs              984M       0  984M   0% /dev/shm', '/dev/sda15         124M     12M  113M  10% /boot/efi'].join('\n'));
      }
      case 'du': {
        set('lx:du');
        const targets = pos.length ? pos : ['.'];
        const out = [];
        targets.forEach(t => {
          if (t.endsWith('*')) {
            const dir = norm(t.replace(/\/?\*$/, '') || '.', s.cwd);
            children(fs, dir).forEach(c => out.push(pad(human(dirSize(c)), 8) + c));
          } else if (/max-depth=1|-d\s*1/.test(args.join(' '))) {
            const dir = norm(t, s.cwd);
            children(fs, dir).forEach(c => out.push(pad(human(dirSize(c)), 8) + c));
            out.push(pad(human(dirSize(dir)), 8) + dir);
          } else {
            const p = norm(t, s.cwd);
            if (!fs[p]) out.push('du: impossible d’accéder à \'' + t + '\': Aucun fichier ou dossier de ce type');
            else out.push(pad(human(dirSize(p)), 8) + t);
          }
        });
        return res(out.join('\n'));
      }
      case 'free': set('lx:free'); return res('               total        utilisé      libre     partagé tamp/cache   disponible\nMem:           1,9Gi       412Mi       1,0Gi       8,0Mi       610Mi       1,4Gi\nÉchange:       975Mi          0B       975Mi');
      case 'top': case 'htop':
        set('lx:top');
        return res('top - 10:42:17 up 12 days,  3:05,  1 user,  load average: 0,08, 0,05, 0,01\nTâches: 112 total,   1 en cours, 111 en veille\n%Cpu(s):  1,3 ut,  0,7 sy, 97,8 id\nMiB Mem :   1987,4 total,   1024,2 libr,    412,6 util,    610,1 tamp/cache\n\n    PID UTIL.     %CPU  %MEM  COM.\n    812 www-data   0,3   0,6  nginx\n    640 mysql      0,7   9,8  mariadbd\n    501 root       0,0   0,4  sshd\n   2101 tech       0,0   0,3  bash\n(instantané : top n’est pas interactif dans ce simulateur)');
      case 'ps': {
        set('lx:ps');
        const rows = ['USER         PID %CPU %MEM COMMAND', 'root           1  0.0  0.5 /sbin/init', 'root         501  0.0  0.4 sshd: /usr/sbin/sshd -D', 'mysql        640  0.7  9.8 /usr/sbin/mariadbd', 'www-data     812  0.0  0.6 nginx: worker process', 'tech        2101  0.0  0.3 -bash'];
        if (st.services && st.services['php8.2-fpm'] === 'active') rows.push('root        2210  0.0  0.9 php-fpm: master process (/etc/php/8.2/fpm/php-fpm.conf)', 'www-data    2211  0.1  1.8 php-fpm: pool www');
        if (s.host === 'lab-debian') rows.push('root         733  0.0  0.6 /usr/sbin/cupsd -l');
        return res(rows.join('\n'));
      }
      case 'systemctl': {
        const sub = pos[0];
        const svcs = st.services || { ssh: 'active', cron: 'active', cups: 'active', NetworkManager: 'active' };
        if (sub === '--failed' || opts.includes('-failed') || (sub === 'list-units' && args.includes('--failed'))) {
          set('lx:failed');
          const failed = Object.keys(svcs).filter(k => svcs[k] === 'failed');
          return res('  UNIT                LOAD   ACTIVE SUB    DESCRIPTION\n' + failed.map(k => '● ' + pad(k + '.service', 19) + ' loaded failed failed ' + (k.startsWith('php') ? 'The PHP 8.2 FastCGI Process Manager' : k)).join('\n') + '\n\n' + failed.length + ' loaded units listed.');
        }
        const name = (pos[1] || '').replace(/\.service$/, '');
        if (!sub) return res('Utilisation : systemctl status|restart|start|stop <service>');
        if (!name) return res('Il manque le nom du service.');
        if (!(name in svcs)) return res('Unit ' + name + '.service could not be found.');
        if (sub === 'status') {
          set('lx:status:' + name);
          const active = svcs[name] === 'active';
          const desc = { nginx: 'A high performance web server and a reverse proxy server', 'php8.2-fpm': 'The PHP 8.2 FastCGI Process Manager', ssh: 'OpenBSD Secure Shell server', cron: 'Regular background program processing daemon', mariadb: 'MariaDB 10.11.6 database server', cups: 'CUPS Scheduler', NetworkManager: 'Network Manager' }[name] || name;
          if (active) return res('● ' + name + '.service - ' + desc + '\n     Loaded: loaded (/lib/systemd/system/' + name + '.service; enabled; preset: enabled)\n     Active: active (running) since lun. 2026-11-02 ' + (name.startsWith('php') ? '10:44:02 CET; 1min ago' : '08:01:02 CET; 2h 41min ago') + '\n   Main PID: ' + (name.startsWith('php') ? '2210 (php-fpm8.2)\n     Status: "Ready to handle connections"' : '812 (' + name + ')') + '\n      Tasks: 3 (limit: 2307)\n     Memory: 18.4M');
          return res('× ' + name + '.service - ' + desc + '\n     Loaded: loaded (/lib/systemd/system/' + name + '.service; enabled; preset: enabled)\n     Active: failed (Result: exit-code) since lun. 2026-11-02 09:12:41 CET; 1h 30min ago\n    Process: 811 ExecStart=/usr/sbin/php-fpm8.2 --nodaemonize --fpm-config /etc/php/8.2/fpm/php-fpm.conf (code=exited, status=78)\n   Main PID: 811 (code=exited, status=78)\n\nnov. 02 09:12:41 ' + s.host + ' php-fpm8.2[811]: [ERROR] failed to write to log file \'/var/log/php8.2-fpm.log\': No space left on device (28)\nnov. 02 09:12:41 ' + s.host + ' systemd[1]: ' + name + '.service: Failed with result \'exit-code\'.');
        }
        if (['restart', 'start', 'stop', 'reload'].includes(sub)) {
          if (!sudo) return res('==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ====\nAuthentification requise. Relancez la commande avec sudo.');
          set('lx:' + (sub === 'reload' ? 'restart' : sub) + ':' + name);
          if (ctx.onChange) ctx.onChange();
          const st2 = ctx.state ? ctx.state() : {};
          if (sub !== 'stop' && st2.services && st2.services[name] === 'failed') return res('Job for ' + name + '.service failed because the control process exited with error code.\nSee "systemctl status ' + name + '.service" and "journalctl -xeu ' + name + '.service" for details.');
          return { out: pre };
        }
        return res('Sous-commande non simulée : ' + sub);
      }
      case 'journalctl': {
        if (args.some(a => a.startsWith('--vacuum'))) {
          if (!sudo) return deny('journalctl');
          set('lx:vacuum'); if (ctx.onChange) ctx.onChange();
          return res('Vacuuming done, freed 812.0M of archived journals from /var/log/journal/8f3c1e0a2b4d4e9c.');
        }
        if (args.includes('--disk-usage')) return res('Archived and active journals take up ' + ((st.journalSize || 0.1) >= 1 ? (st.journalSize || 0.1).toFixed(1) + 'G' : Math.round((st.journalSize || 0.1) * 1024) + 'M') + ' in the file system.');
        const ui = args.indexOf('-u');
        const name = ui >= 0 ? (args[ui + 1] || '').replace(/\.service$/, '') : null;
        if (name) set('lx:journal:' + name);
        set('lx:journal');
        if (name === 'php8.2-fpm') {
          const lines = ['nov. 02 09:12:41 ' + s.host + ' php-fpm8.2[811]: [ERROR] failed to write to log file \'/var/log/php8.2-fpm.log\': No space left on device (28)', 'nov. 02 09:12:41 ' + s.host + ' php-fpm8.2[811]: [ERROR] FPM initialization failed', 'nov. 02 09:12:41 ' + s.host + ' systemd[1]: php8.2-fpm.service: Main process exited, code=exited, status=78/CONFIG', 'nov. 02 09:12:41 ' + s.host + ' systemd[1]: php8.2-fpm.service: Failed with result \'exit-code\'.', 'nov. 02 09:12:41 ' + s.host + ' systemd[1]: Failed to start php8.2-fpm.service - The PHP 8.2 FastCGI Process Manager.'];
          if (st.services && st.services['php8.2-fpm'] === 'active') lines.push('nov. 02 10:44:02 ' + s.host + ' systemd[1]: Started php8.2-fpm.service - The PHP 8.2 FastCGI Process Manager.');
          return res(lines.join('\n'));
        }
        if (name === 'cups') return res('nov. 02 08:01:02 ' + s.host + ' systemd[1]: Starting cups.service - CUPS Scheduler...\nnov. 02 08:01:02 ' + s.host + ' systemd[1]: Started cups.service - CUPS Scheduler.\nnov. 02 08:30:12 ' + s.host + ' cupsd[733]: [Job 41] Printer not connected; will retry in 30 seconds.');
        if (name === 'nginx') return res('nov. 02 08:01:02 ' + s.host + ' systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.');
        if (name) return res('-- No entries --');
        return res(fs['/var/log/syslog'].c.trim());
      }
      case 'truncate': {
        const file = norm(pos[pos.length - 1], s.cwd);
        if (!fs[file]) return res('truncate: impossible d’ouvrir \'' + pos[pos.length - 1] + '\' : Aucun fichier ou dossier de ce type');
        if (file.startsWith('/var') || file.startsWith('/etc')) { if (!sudo) return deny('truncate: impossible d’ouvrir \'' + pos[pos.length - 1] + '\' en écriture'); }
        if (fs[file].dyn === 'debug') { set('lx:truncate:debug'); if (ctx.onChange) ctx.onChange(); }
        else { fs[file].c = ''; fs[file].size = 0; }
        set('lx:truncate');
        return { out: pre };
      }
      case 'rm': {
        const rec = /r/.test(opts);
        const target = pos[0];
        if (!target) return res('rm: opérande manquant');
        const p = norm(target.replace(/\/?\*$/, ''), s.cwd);
        if (rec && (p === '/' || p.startsWith('/var/log') || p === '/var' || p === '/etc' || p === '/usr')) {
          if (!sudo) return deny('rm: impossible de supprimer \'' + target + '\'');
          set('lx:rmrf'); if (ctx.onChange) ctx.onChange();
          return res('(suppression de tous les journaux du serveur… les traces nécessaires aux diagnostics et à la sécurité sont perdues)');
        }
        if (!fs[p]) return res('rm: impossible de supprimer \'' + target + '\': Aucun fichier ou dossier de ce type');
        if (fs[p].d && !rec) return res('rm: impossible de supprimer \'' + target + '\': est un dossier');
        if ((p.startsWith('/var') || p.startsWith('/etc')) && !sudo) return deny('rm: impossible de supprimer \'' + target + '\'');
        if (fs[p].dyn === 'debug') { set('lx:rm:debug'); if (ctx.onChange) ctx.onChange(); fs[p] = { c: '', size: 0, dyn: 'debug' }; return { out: pre }; }
        delete fs[p]; set('lx:rm');
        return { out: pre };
      }
      case 'ip': {
        set('lx:ip');
        if (pos[0] === 'r' || pos[0] === 'route') return res('default via 10.20.' + (s.host === 'lab-debian' ? '6' : '1') + '.1 dev ens18 proto static\n10.20.' + (s.host === 'lab-debian' ? '6' : '1') + '.0/24 dev ens18 proto kernel scope link src ' + DS.linuxHosts[s.host].ip);
        set('lx:ipa');
        return res('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: ens18: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP qlen 1000\n    link/ether 00:50:56:9a:11:40 brd ff:ff:ff:ff:ff:ff\n    inet ' + DS.linuxHosts[s.host].ip + '/24 brd 10.20.1.255 scope global ens18');
      }
      case 'ping': {
        const host = pos.filter(x => !/^\d+$/.test(x))[0];
        if (!host) return res('ping: usage error: Adresse de destination requise');
        set('lx:ping'); set('lx:ping:' + host);
        const ip = /^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : DS.hosts[host.replace(/\.ostral\.local$/, '')];
        if (!ip) return res('ping: ' + host + ': Nom ou service inconnu');
        const n = parseInt(args[args.indexOf('-c') + 1], 10) || 4;
        const down = (st.down || []).includes(host) || host === 'srv-fic-02' && ctx.downFic;
        const lines = ['PING ' + host + ' (' + ip + ') 56(84) octets de données.'];
        for (let i = 1; i <= Math.min(n, 6); i++) if (!down) lines.push('64 octets de ' + ip + ' : icmp_seq=' + i + ' ttl=' + (ip.startsWith('10.') ? 64 : 117) + ' temps=' + (ip.startsWith('10.') ? '0.' + (3 + i) : 11 + i) + ' ms');
        lines.push('', '--- statistiques ping ' + host + ' ---', n + ' paquets transmis, ' + (down ? 0 : n) + ' reçus, ' + (down ? '100' : '0') + '% packet loss, time ' + (n * 1001 - 1) + 'ms');
        return res(lines.join('\n'));
      }
      case 'nslookup': case 'dig': case 'host': {
        const host = pos[0];
        const ip = DS.hosts[(host || '').replace(/\.ostral\.local$/, '')];
        return res(ip ? 'Server:\t\t10.20.1.10\nAddress:\t10.20.1.10#53\n\nName:\t' + host + '\nAddress: ' + ip : '** server can’t find ' + host + ': NXDOMAIN');
      }
      case 'ss': case 'netstat':
        set('lx:ss');
        return res('Netid State  Local Address:Port  Peer Address:Port Process\ntcp   LISTEN 0.0.0.0:22          0.0.0.0:*     users:(("sshd",pid=501))\ntcp   LISTEN 0.0.0.0:443         0.0.0.0:*     users:(("nginx",pid=812))\ntcp   LISTEN 127.0.0.1:3306      0.0.0.0:*     users:(("mariadbd",pid=640))' + (s.host === 'lab-debian' ? '\ntcp   LISTEN 127.0.0.1:631       0.0.0.0:*     users:(("cupsd",pid=733))' : ''));
      case 'curl': case 'wget': {
        set('lx:curl');
        const ok = !st.services || st.services['php8.2-fpm'] !== 'failed';
        if (s.host === 'lab-debian') return res('HTTP/1.1 200 OK\nServer: CUPS/2.4 IPP/2.1\nContent-Type: text/html');
        return res(ok ? 'HTTP/1.1 200 OK\nServer: nginx/1.22.1\nDate: Mon, 02 Nov 2026 09:44:10 GMT\nContent-Type: text/html; charset=UTF-8' : 'HTTP/1.1 502 Bad Gateway\nServer: nginx/1.22.1\nDate: Mon, 02 Nov 2026 09:42:18 GMT\nContent-Type: text/html\nContent-Length: 157');
      }
      case 'apt': case 'apt-get':
        if (pos[0] === 'update') { if (!sudo) return res('E: Impossible d’ouvrir le fichier verrou /var/lib/apt/lists/lock - open (13: Permission non accordée)\nE: Impossible de verrouiller le répertoire /var/lib/apt/lists/\nÊtes-vous root ?'); set('lx:aptupdate'); return res('Atteint :1 http://deb.debian.org/debian bookworm InRelease\nAtteint :2 http://security.debian.org/debian-security bookworm-security InRelease\nLecture des listes de paquets... Fait\n3 paquets peuvent être mis à jour. Exécutez « apt list --upgradable » pour les voir.'); }
        if (pos[0] === 'list') return res('En train de lister... Fait\nlibssl3/stable-security 3.0.15-1~deb12u1 amd64 [pouvant être mis à jour depuis : 3.0.14-1~deb12u2]\nopenssl/stable-security 3.0.15-1~deb12u1 amd64\ntzdata/stable-updates 2026b-0+deb12u1 all');
        if (pos[0] === 'upgrade' || pos[0] === 'install') return res(sudo ? 'Opération non simulée : sur un serveur de production, une mise à jour se planifie (fenêtre de maintenance).' : 'E: Êtes-vous root ?');
        return res('apt : sous-commande non simulée');
      case 'lpstat': set('lx:lpstat'); return res(s.host === 'lab-debian' ? 'imprimante ZEB-LAB-01 désactivée depuis lun. 02 nov. 2026 08:30:12\n\tPrinter not connected; will retry in 30 seconds.\nimprimante IMP-GEN-RDC est inactive. Activée depuis lun. 02 nov. 2026 08:01:03' : 'lpstat : aucune imprimante configurée sur ce serveur.');
      case 'lsusb': set('lx:lsusb'); return res('Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\nBus 001 Device 003: ID 05e0:1200 Symbol Technologies Bar Code Scanner\nBus 001 Device 004: ID 0a5f:0164 Zebra ZD421');
      case 'reboot': case 'shutdown':
        if (!sudo) return res('Échec : accès refusé. Utilisez sudo.');
        set('lx:reboot'); s.connected = false;
        return { out: pre + 'Le système va redémarrer maintenant !\nConnexion à ' + s.host + ' fermée par l’hôte distant.', exit: true };
      case 'chmod': case 'chown': case 'mkdir': case 'touch': case 'cp': case 'mv':
        return { out: pre + (pos.length < 1 ? cmd + ' : opérande manquant' : '') };
      case 'bash': case 'sh': case './ping_serveurs.sh': case 'ping_serveurs.sh': {
        const file = cmd.includes('ping_serveurs') ? 'scripts/ping_serveurs.sh' : pos[0];
        if (!file || !/ping_serveurs/.test(file)) return res('Seul le script ~/scripts/ping_serveurs.sh est simulé.');
        set('lx:script');
        return res(['srv-dc-01', 'srv-fic-01', 'srv-fic-02', 'srv-sil-01'].map(h => h + ' ' + ((st.down || []).includes(h) ? 'KO' : 'OK')).join('\n'));
      }
      default:
        if (/^\.\/?scripts\/ping_serveurs\.sh$/.test(cmd) || cmd === 'scripts/ping_serveurs.sh') return runOne('bash scripts/ping_serveurs.sh', ctx);
        return res('bash: ' + cmd + ' : commande introuvable (tapez « help »)');
    }
  }
})();
