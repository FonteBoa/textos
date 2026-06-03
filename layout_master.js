function fitTitulo() {
    const el = document.getElementById("titulo");
    if (!el) return;
    if (window.innerWidth >= 900) {
        el.style.fontSize = "3.5rem";
        return;
    }
    el.style.fontSize = "100px";
    const header = document.querySelector("header");
    const headerStyle = window.getComputedStyle(header);
    const marginLeft = parseInt(headerStyle.paddingLeft) || 40;
    const margin = marginLeft * 2;
    const scale = (window.innerWidth - margin) / el.scrollWidth;
    el.style.fontSize = (100 * scale) + "px";
}

function fitHero() {
    const el = document.getElementById("hero");
    if (!el) return;
    el.style.fontSize = "100px";
    const scale = (window.innerWidth * 1.8) / el.scrollWidth;
    el.style.fontSize = (100 * scale) + "px";
}

function fitTextTitle() {
    const el = document.getElementById('text-title');
    if (!el) return;
    el.style.fontSize = '1.8rem';
    const available = el.parentElement.offsetWidth;
    if (el.scrollWidth > available) {
        const scale = available / el.scrollWidth;
        el.style.fontSize = Math.max(0.9, 1.8 * scale) + 'rem';
    }
}

function positionContentArea() {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;
    const lastLink = nav.querySelector('a:last-child');
    if (!lastLink) return;
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    const offset = window.innerWidth <= 600 ? 10 : window.innerWidth >= 900 ? -15 : 50;
    contentArea.style.top = (lastLink.getBoundingClientRect().bottom + offset) + 'px';
}

function positionFade() {
    const scrollArea = document.querySelector('.scroll-area');
    const fade = document.getElementById('content-area-fade');
    if (!scrollArea || !fade) return;
    fade.style.top = (scrollArea.getBoundingClientRect().bottom - 80) + 'px';
}

function refreshLayout() {
    fitTitulo();
    fitHero();
    positionContentArea();
    fitTextTitle();
    positionFade();
}

function injectMenu(pageKey) {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;

    // Detecta se está numa subpasta (contos/, ensaios/, cronicas/)
    const partes = window.location.pathname.split('/').filter(Boolean);
    const emSubpasta = ['contos', 'ensaios', 'cronicas'].includes(partes[partes.length - 2]);
    const prefixo = emSubpasta ? '../' : '';

    const page = partes[partes.length - 1] || 'index.html';

    const links = [
        { id: 'contos',   href: prefixo + 'contos_index.html',   label: 'contos'    },
        { id: 'ensaios',  href: prefixo + 'ensaios_index.html',  label: 'ensaios'   },
        { id: 'cronicas', href: prefixo + 'cronicas_index.html', label: 'crônicas'  },
        { id: 'notas',    href: prefixo + 'anotacoes.html',       label: 'anotações' },
        { id: 'inicio',   href: prefixo + 'index.html',           label: 'início'    }
    ];

    const ehPaginaDeTexto = (
        page.startsWith('conto-')   ||
        page.startsWith('ensaio-')  ||
        page.startsWith('cronica-')
    );

    let html = '';
    links.forEach(item => {
        let texto = item.label;
        let classes = '';
        if (pageKey && item.id === pageKey) {
            classes = 'active';
            if (ehPaginaDeTexto) {
                if (item.id === 'contos')   texto = 'índice de contos';
                if (item.id === 'ensaios')  texto = 'índice de ensaios';
                if (item.id === 'cronicas') texto = 'índice de crônicas';
            }
        }
        html += `<a href="${item.href}" class="${classes}">${texto}</a>\n`;
    });
    nav.innerHTML = html;
}

function enableKeyboardScroll() {
    const scroller = document.getElementById('scroller');
    if (!scroller) return;
    const STEP = 120;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scroller.scrollBy({ top: STEP, behavior: 'smooth' });
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scroller.scrollBy({ top: -STEP, behavior: 'smooth' });
        }
    });
}

function initLayout(pageKey) {
    injectMenu(pageKey);
    document.fonts.ready.then(() => {
        refreshLayout();
        if (document.getElementById('scroller')) {
            enableKeyboardScroll();
        }
    });
    window.addEventListener("resize", refreshLayout);
}