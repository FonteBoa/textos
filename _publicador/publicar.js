/**
 * publicar.js — fonteboa
 * Gera HTMLs nas subpastas contos/, ensaios/, cronicas/
 * e atualiza anotacoes.html a partir de rascunhos/anotacoes.txt
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  siteDir: process.argv[2] || '.',

  rascunhos: {
    contos:   'rascunhos/contos',
    ensaios:  'rascunhos/ensaios',
    cronicas: 'rascunhos/cronicas',
  },

  subpastas: {
    contos:   'contos',
    ensaios:  'ensaios',
    cronicas: 'cronicas',
  },

  indices: {
    contos:   'contos_index.html',
    ensaios:  'ensaios_index.html',
    cronicas: 'cronicas_index.html',
  },

  prefixos: {
    contos:   'conto',
    ensaios:  'ensaio',
    cronicas: 'cronica',
  },

  hero: {
    contos:   'contos',
    ensaios:  'ensaios',
    cronicas: 'crônicas',
  },

  menuAtivo: {
    contos:   'contos',
    ensaios:  'ensaios',
    cronicas: 'cronicas',
  },
};

function slugify(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function lerRascunho(caminho) {
  const raw = fs.readFileSync(caminho, 'utf8').replace(/\r\n/g, '\n');
  const linhas = raw.split('\n');
  let titulo = '', inicioCorpo = 0;
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i].trim();
    if (l) { titulo = l.replace(/^#+\s*/, ''); inicioCorpo = i + 1; break; }
  }
  return { titulo, corpo: linhas.slice(inicioCorpo).join('\n').trim() };
}

function mdParaHtml(texto) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/_(.+?)_/g,       '<em>$1</em>');
}

function paragrafosParaHtml(texto) {
  return texto
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${mdParaHtml(p.replace(/\n/g, ' '))}</p>`)
    .join('\n      ');
}

function publicarAnotacoes(siteDir, scriptDir) {
  const caminhoTxt = path.join(scriptDir, 'rascunhos', 'anotacoes.txt');
  if (!fs.existsSync(caminhoTxt)) return false;

  const raw = fs.readFileSync(caminhoTxt, 'utf8').replace(/\r\n/g, '\n');
  const corpoHtml = paragrafosParaHtml(raw.trim());

  const caminhoHtml = path.join(siteDir, 'anotacoes.html');
  let html = fs.readFileSync(caminhoHtml, 'utf8');

  html = html.replace(
    /(<div class="scroll-inner" id="scroller">)[\s\S]*?(<\/div>)/,
    `$1\n      ${corpoHtml}\n    $2`
  );

  fs.writeFileSync(caminhoHtml, html, 'utf8');
  console.log('  ✓ anotacoes.html atualizado');
  return true;
}

function gerarHtml(secao, titulo, corpo) {
  const corpoHtml = paragrafosParaHtml(corpo);
  const ativo = CONFIG.menuAtivo[secao];
  const hero  = CONFIG.hero[secao];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titulo} — fonteboa</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet"/>
  <link href="../style.css" rel="stylesheet"/>
  <link href="../comentarios.css" rel="stylesheet"/>
</head>
<body>

<header><div class="titulo" id="titulo"></div></header>
<nav id="nav-menu"></nav>

<div class="content-area" id="content-area">
  <div class="text-title" id="text-title">${titulo}</div>
  <div class="scroll-area">
    <div class="scroll-inner" id="scroller">
      ${corpoHtml}
    </div>
  </div>
</div>

<div class="content-area-fade" id="content-area-fade"></div>
<div class="hero-wrap"><div class="hero-text" id="hero">${hero}</div></div>

<script src="../layout_master.js"></script>
<script>initLayout('${ativo}');</script>
<script src="../comentarios.js"></script>

</body>
</html>
`;
}

function atualizarIndice(arquivoIndice, href, titulo) {
  let html = fs.readFileSync(arquivoIndice, 'utf8');
  if (html.includes(`href="${href}"`)) return false;
  const novoItem = `<li><a href="${href}">${titulo}</a></li>`;
  html = html.replace(/<ul([^>]*)>/, `<ul$1>\n      ${novoItem}`);
  fs.writeFileSync(arquivoIndice, html, 'utf8');
  return true;
}

function limparIndice(arquivoIndice, siteDir, subpasta) {
  if (!fs.existsSync(arquivoIndice)) return 0;
  let html = fs.readFileSync(arquivoIndice, 'utf8');
  const original = html;
  const regex = /<li><a href="([^"]+)">[^<]*<\/a><\/li>/g;
  let match, removidos = 0;
  while ((match = regex.exec(original)) !== null) {
    const href  = match[1];
    const linha = match[0];
    const dest  = path.join(siteDir, subpasta, path.basename(href));
    if (!fs.existsSync(dest)) {
      html = html.replace(linha + '\n', '').replace(linha, '');
      console.log(`    – removido do índice: "${href}"`);
      removidos++;
    }
  }
  if (removidos > 0) fs.writeFileSync(arquivoIndice, html, 'utf8');
  return removidos;
}

const siteDir   = path.resolve(CONFIG.siteDir);
const scriptDir = path.dirname(path.resolve(process.argv[1] || __filename));

let totalNovos = 0, totalRemovidos = 0;
const erros = [];

console.log('\n══════════════════════════════════════');
console.log('  fonteboa — publicador');
console.log('══════════════════════════════════════\n');

// Garante que as subpastas existem
for (const subpasta of Object.values(CONFIG.subpastas)) {
  const dir = path.join(siteDir, subpasta);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Atualiza anotações
const anotacoesAtualizadas = publicarAnotacoes(siteDir, scriptDir);
if (anotacoesAtualizadas) totalNovos++;

// Limpa índices
for (const [secao, nomeIndice] of Object.entries(CONFIG.indices)) {
  const arquivoIndice = path.join(siteDir, nomeIndice);
  totalRemovidos += limparIndice(arquivoIndice, siteDir, CONFIG.subpastas[secao]);
}

// Publica textos novos
for (const [secao, pastaTxt] of Object.entries(CONFIG.rascunhos)) {
  const pastaAbsoluta = path.resolve(scriptDir, pastaTxt);
  if (!fs.existsSync(pastaAbsoluta)) {
    console.log(`  [aviso] Pasta não encontrada: ${pastaAbsoluta}`);
    continue;
  }
  const txts = fs.readdirSync(pastaAbsoluta).filter(f => f.endsWith('.txt'));
  if (txts.length === 0) continue;

  console.log(`  Seção: ${secao} (${txts.length} arquivo(s))`);

  for (const nomeArquivo of txts) {
    const caminhoTxt = path.join(pastaAbsoluta, nomeArquivo);
    try {
      const { titulo, corpo } = lerRascunho(caminhoTxt);
      if (!titulo) { erros.push(`${nomeArquivo}: sem título`); continue; }

      const slug     = slugify(titulo);
      const prefixo  = CONFIG.prefixos[secao];
      const subpasta = CONFIG.subpastas[secao];
      const nomeHtml = `${prefixo}-${slug}.html`;
      const destHtml = path.join(siteDir, subpasta, nomeHtml);
      const indice   = path.join(siteDir, CONFIG.indices[secao]);
      const hrefIndice = `${subpasta}/${nomeHtml}`;

      fs.writeFileSync(destHtml, gerarHtml(secao, titulo, corpo), 'utf8');

      const adicionado = atualizarIndice(indice, hrefIndice, titulo);
      if (adicionado) {
        console.log(`    ✓ "${titulo}" → ${subpasta}/${nomeHtml}`);
        totalNovos++;
        const pastaPublicados = path.join(pastaAbsoluta, 'publicados');
        if (!fs.existsSync(pastaPublicados)) fs.mkdirSync(pastaPublicados);
        fs.renameSync(caminhoTxt, path.join(pastaPublicados, nomeArquivo));
      } else {
        console.log(`    – "${titulo}" já publicado, ignorado.`);
      }
    } catch (e) {
      erros.push(`${nomeArquivo}: ${e.message}`);
    }
  }
}

if (erros.length > 0) {
  console.log('\n  [erros]');
  erros.forEach(e => console.log(`    ! ${e}`));
}

console.log('\n  Verificando alterações para enviar ao GitHub...');
try {
  process.chdir(siteDir);
  execSync('git add -A', { stdio: 'pipe' });
  const status = execSync('git status --porcelain').toString().trim();
  if (status.length > 0) {
    const partes = [];
    if (totalNovos > 0)     partes.push(`${totalNovos} novo(s)`);
    if (totalRemovidos > 0) partes.push(`${totalRemovidos} removido(s)`);
    const msg = partes.length > 0 ? `publica: ${partes.join(', ')}` : `atualiza arquivos do site`;
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
    try {
      execSync('git push', { stdio: 'inherit' });
    } catch(e) {
      console.log('\n  Branch divergido — forçando sincronização...');
      execSync('git push --force', { stdio: 'inherit' });
    }
    console.log('\n  ✓ Enviado com sucesso para o GitHub Pages!');
    console.log('  As alterações estarão no ar em cerca de 1 minuto.\n');
  } else {
    console.log('\n  Nenhuma alteração pendente. Site já está atualizado.\n');
  }
} catch (e) {
  console.log('\n  [ERRO no envio ao GitHub]');
  console.log('  Detalhes: ' + e.message);
}