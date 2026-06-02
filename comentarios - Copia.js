/**
 * comentarios.js — fonteboa (corrigido)
 */

(function () {
  const LIMITE = 280;

  const SUPABASE_URL = 'https://oolesbcxfiuneecgbxoo.supabase.co';

  // ⚠️ USE A ANON PUBLIC KEY (JWT LEGACY), NÃO publishable key
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGVzYmN4Zml1bmVlY2dieG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzYyMDIsImV4cCI6MjA5NDM1MjIwMn0.TcldtUy4oo2bkn3szrVQw7SqTa-HN6bTeyJpmK7T4Gs';

  const TABELA = 'comentarios';

  function nomePagina() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  /* ──────────────── SUPABASE ──────────────── */

  async function buscarComentarios() {
    try {
      const url =
        `${SUPABASE_URL}/rest/v1/${TABELA}` +
        `?pagina=eq.${encodeURIComponent(nomePagina())}` +
        `&order=criado_em.asc`;

      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        }
      });

      if (!res.ok) {
        console.error('Erro ao buscar comentários:', await res.text());
        return [];
      }

      return await res.json();
    } catch (err) {
      console.error('Falha de rede (buscar):', err);
      return [];
    }
  }

  async function publicarComentario(nome, texto) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${TABELA}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          pagina: nomePagina(),
          nome,
          texto,
        })
      });

      if (!res.ok) {
        console.error('Erro ao publicar:', await res.text());
        return false;
      }

      return true;
    } catch (err) {
      console.error('Falha de rede (insert):', err);
      return false;
    }
  }

  /* ──────────────── UI ──────────────── */

  function criarJanela() {
    const btn = document.createElement('button');
    btn.id = 'btn-comentar';
    btn.textContent = 'Quero comentar';
    document.body.appendChild(btn);

    const janela = document.createElement('div');
    janela.id = 'janela-comentarios';

    janela.innerHTML = `
      <div id="janela-titulo">
        Comentários dos leitores
        <button id="janela-fechar">✕</button>
      </div>

      <div id="janela-corpo">
        <input id="campo-nome" type="text" placeholder="Nome" maxlength="80"/>
        <textarea id="campo-comentario" placeholder="Comentário" maxlength="${LIMITE}"></textarea>
        <div id="contador-chars">0 / ${LIMITE}</div>
        <button id="btn-publicar">Publicar</button>
      </div>

      <div id="lista-comentarios">
        <p class="sem-comentarios">Carregando...</p>
      </div>
    `;

    document.body.appendChild(janela);
  }

  function renderizarLista(lista) {
    const el = document.getElementById('lista-comentarios');
    if (!el) return;

    if (!lista || lista.length === 0) {
      el.innerHTML = '<p class="sem-comentarios">Nenhum comentário ainda.</p>';
      return;
    }

    el.innerHTML = lista.map((c, i) => `
      ${i > 0 ? '<div class="comentario-divisor"></div>' : ''}
      <div class="comentario-item">
        <span class="comentario-autor">${escapar(c.nome)}</span>
        <span class="comentario-texto">${escapar(c.texto)}</span>
      </div>
    `).join('');
  }

  function escapar(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ──────────────── INIT ──────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    criarJanela();

    const janela = document.getElementById('janela-comentarios');
    const btnAbrir = document.getElementById('btn-comentar');
    const btnFechar = document.getElementById('janela-fechar');
    const btnPublicar = document.getElementById('btn-publicar');

    const campoNome = document.getElementById('campo-nome');
    const campoCom = document.getElementById('campo-comentario');
    const contador = document.getElementById('contador-chars');

    /* abrir */
    btnAbrir.addEventListener('click', async () => {
      janela.classList.toggle('visivel');
      if (janela.classList.contains('visivel')) {
        const lista = await buscarComentarios();
        renderizarLista(lista);
      }
    });

    /* fechar */
    btnFechar.addEventListener('click', () => {
      janela.classList.remove('visivel');
    });

    /* contador */
    campoCom.addEventListener('input', () => {
      const n = campoCom.value.length;
      contador.textContent = `${n} / ${LIMITE}`;
    });

    /* publicar */
    btnPublicar.addEventListener('click', async () => {
      const nome = campoNome.value.trim();
      const texto = campoCom.value.trim();

      if (!nome || !texto) return;

      btnPublicar.textContent = 'Enviando...';
      btnPublicar.disabled = true;

      const ok = await publicarComentario(nome, texto);

      if (ok) {
        campoNome.value = '';
        campoCom.value = '';

        const lista = await buscarComentarios();
        renderizarLista(lista);
      } else {
        alert('Erro ao enviar comentário. Veja o console (F12).');
      }

      btnPublicar.textContent = 'Publicar';
      btnPublicar.disabled = false;
    });
  });
})();
