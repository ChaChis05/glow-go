/* ==========================================================
   Glow & Go - extras.js
   - Celular: 2 productos por fila (PC igual que antes)
   - Celular: barra de búsqueda más larga
   - Carrito como botón flotante (estilo WhatsApp)
   - Productos agotados: barra verde/roja, imagen gris, botón desactivado
   Se carga DESPUÉS de js/app.js
   ========================================================== */
(function () {
    "use strict";

    var EN_CARRITO = /carrito\.html/i.test(location.pathname);

    /* ---------- 1. Estilos ---------- */
    var css = [
        /* El carrito del header se oculta (ahora es flotante) */
        'header a[href="carrito.html"]{display:none!important}',

        /* Botón flotante del carrito */
        '#glow-cart-fab{position:fixed;right:1.5rem;bottom:5.75rem;width:3.5rem;height:3.5rem;border-radius:9999px;background:#7A1C32;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;text-decoration:none;box-shadow:0 10px 25px rgba(0,0,0,.25);z-index:50;transition:transform .2s ease,background .2s ease}',
        '#glow-cart-fab:hover{background:#621628;transform:scale(1.1)}',
        '#glow-cart-fab .glow-badge{position:absolute;top:-4px;right:-4px;min-width:1.4rem;height:1.4rem;padding:0 .3rem;border-radius:9999px;background:#fff;color:#7A1C32;border:2px solid #7A1C32;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1}',

        /* Barra de estado del producto */
        '.glow-estado{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;margin:.5rem 0;padding:.3rem .5rem;border-radius:.6rem;font-size:.7rem;font-weight:800;letter-spacing:.02em}',
        '.glow-estado::before{content:"";width:.5rem;height:.5rem;border-radius:9999px;background:currentColor}',
        '.glow-estado.ok{background:#dcfce7;color:#166534}',
        '.glow-estado.no{background:#fee2e2;color:#991b1b}',

        /* Producto agotado */
        '.glow-agotado{position:relative}',
        '.glow-agotado img{filter:grayscale(1);opacity:.55}',
        '.glow-agotado::after{content:"AGOTADO";position:absolute;top:.6rem;left:.6rem;background:#dc2626;color:#fff;font-size:.65rem;font-weight:800;letter-spacing:.05em;padding:.2rem .5rem;border-radius:.4rem;z-index:2}',
        '.glow-btn-agotado{background:#9ca3af!important;border-color:#9ca3af!important;color:#fff!important;cursor:not-allowed!important;pointer-events:none}',

        /* Aviso */
        '#glow-aviso{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);z-index:300000;background:#7A1C32;color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease}',
        '#glow-aviso.visible{opacity:1;transform:translate(-50%,0)}',

        /* Celular y tablet: buscador más largo */
        '@media (max-width:1023px){',
        '  header .relative.flex.items-center.flex-grow{flex:1 1 0%;min-width:0}',
        '  #dropdown-busqueda{left:0!important;right:auto!important;width:min(24rem,calc(100vw - 1.5rem))!important}',
        '}',

        /* Celular: 2 productos por fila */
        '@media (max-width:639px){',
        '  #catalog-full-grid,#catalog-grid,#offers-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.6rem!important}',
        /* tarjetas de categorias.html */
        '  #catalog-full-grid article>div:first-child{height:8rem!important;padding:.5rem!important}',
        '  #catalog-full-grid article>div:last-child{padding:.6rem!important}',
        '  #catalog-full-grid article .mt-auto{flex-direction:column}',
        '  #catalog-full-grid article button{font-size:.7rem!important;padding-top:.5rem!important;padding-bottom:.5rem!important}',
        /* tarjetas generadas por app.js (inicio y catálogo) */
        '  #catalog-grid>div,#offers-grid>div,#catalog-full-grid>div:not(.col-span-full):not(article){padding:.6rem!important}',
        '  #catalog-grid img.h-48,#offers-grid img.h-48,#catalog-full-grid img.h-48{height:7.5rem!important;margin-bottom:.5rem!important}',
        '  #catalog-grid h3,#offers-grid h3{font-size:.8rem!important}',
        '  #catalog-grid button,#offers-grid button{font-size:.75rem!important}',
        '  #glow-cart-fab{right:1rem;bottom:5.25rem}',
        '}'
    ].join("\n");

    var estilo = document.createElement("style");
    estilo.id = "glow-extras-css";
    estilo.textContent = css;
    document.head.appendChild(estilo);

    /* ---------- 2. Aviso ---------- */
    var avisoTimer;
    function aviso(msg) {
        var el = document.getElementById("glow-aviso");
        if (!el) {
            el = document.createElement("div");
            el.id = "glow-aviso";
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add("visible");
        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(function () { el.classList.remove("visible"); }, 1800);
    }

    /* ---------- 3. Carrito flotante ---------- */
    function totalCarrito() {
        try {
            var c = JSON.parse(localStorage.getItem("carrito")) || [];
            return c.reduce(function (s, i) { return s + (parseInt(i.cantidad, 10) || 1); }, 0);
        } catch (e) { return 0; }
    }

    function crearCarritoFlotante() {
        if (EN_CARRITO || document.getElementById("glow-cart-fab")) return;

        var a = document.createElement("a");
        a.id = "glow-cart-fab";
        a.href = "carrito.html";
        a.setAttribute("aria-label", "Ir al carrito");
        a.innerHTML = '<i class="fa-solid fa-cart-shopping"></i><span class="glow-badge">0</span>';
        document.body.appendChild(a);

        var badge = a.querySelector(".glow-badge");
        var ultimo = -1;

        function pintar() {
            var n = totalCarrito();
            if (n === ultimo) return;
            badge.textContent = n;
            badge.style.display = n > 0 ? "flex" : "none";
            if (ultimo !== -1 && a.animate) {
                a.animate(
                    [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
                    { duration: 300, easing: "ease-out" }
                );
            }
            ultimo = n;
        }

        pintar();
        setInterval(pintar, 700);
        window.addEventListener("storage", pintar);
        document.addEventListener("click", function () {
            setTimeout(pintar, 60);
            setTimeout(pintar, 350);
        }, true);
    }

    /* ---------- 4. Productos agotados ---------- */
    var AGOTADOS = new Set();

    function claveSku(p) {
        return String((p && p.sku) || "").trim().toUpperCase();
    }

    window.productoAgotado = function (p) {
        return !!p && AGOTADOS.has(claveSku(p));
    };

    // Punto de conexión: más adelante Firebase llamará a esta función con la lista de SKUs agotados
    window.glowActualizarAgotados = function (lista) {
        AGOTADOS = new Set((lista || []).map(function (s) { return String(s).trim().toUpperCase(); }));
        decorar();
    };

    function productoDeBoton(btn) {
        if (typeof productosInventario === "undefined") return null;
        var idx = btn.getAttribute("data-add");
        if (idx !== null) return productosInventario[parseInt(idx, 10)] || null;
        var m = (btn.getAttribute("onclick") || "").match(/agregarAlCarrito\((\d+)\)/);
        if (m) {
            var id = parseInt(m[1], 10);
            return productosInventario.find(function (p) { return p.id === id; }) || null;
        }
        return null;
    }

    var observador = null;
    function observar() {
        if (observador && document.body) observador.observe(document.body, { childList: true, subtree: true });
    }

    function decorar() {
        if (typeof productosInventario === "undefined" || !productosInventario.length) return;
        if (observador) observador.disconnect();

        document.querySelectorAll('[data-add], button[onclick*="agregarAlCarrito("]').forEach(function (btn) {
            var p = productoDeBoton(btn);
            if (!p) return;
            var card = btn.closest("article") || btn.closest(".rounded-2xl");
            if (!card) return;

            var agotado = window.productoAgotado(p);

            // Barra verde / roja
            var barra = card.querySelector(".glow-estado");
            if (!barra) {
                var fila = btn.parentElement;
                var ancla = fila.querySelectorAll("button").length > 1 ? fila : btn;
                barra = document.createElement("div");
                ancla.parentNode.insertBefore(barra, ancla);
            }
            var clase = "glow-estado " + (agotado ? "no" : "ok");
            var texto = agotado ? "Agotado" : "Disponible";
            barra.dataset.sku = claveSku(p);
            if (barra.className !== clase) barra.className = clase;
            if (barra.textContent !== texto) barra.textContent = texto;

            // Imagen gris + etiqueta
            card.classList.toggle("glow-agotado", agotado);

            // Botón añadir
            if (agotado) {
                if (!btn.classList.contains("glow-btn-agotado")) {
                    btn.dataset.glowOrig = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-ban mr-1.5"></i> Agotado';
                    btn.disabled = true;
                    btn.classList.add("glow-btn-agotado");
                }
            } else if (btn.classList.contains("glow-btn-agotado")) {
                btn.innerHTML = btn.dataset.glowOrig || btn.innerHTML;
                delete btn.dataset.glowOrig;
                btn.disabled = false;
                btn.classList.remove("glow-btn-agotado");
            }
        });

        observar();
    }

    // Bloquea añadir al carrito un producto agotado (botones de app.js y su ventana emergente)
    if (typeof window.agregarAlCarrito === "function") {
        var original = window.agregarAlCarrito;
        window.agregarAlCarrito = function (id) {
            var p = (typeof productosInventario !== "undefined")
                ? productosInventario.find(function (x) { return x.id === id; })
                : null;
            if (p && window.productoAgotado(p)) {
                aviso("Producto agotado");
                return;
            }
            return original.apply(this, arguments);
        };
    }

    // Lista temporal de agotados (opcional): archivo agotados.json con los SKU, ej: ["SKU-1","ABC123"]
    function cargarAgotados() {
        fetch("agotados.json?v=" + Date.now(), { cache: "no-store" })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (lista) { if (Array.isArray(lista)) window.glowActualizarAgotados(lista); })
            .catch(function () {});
    }

    /* ---------- 5. Inicio ---------- */
    function iniciar() {
        crearCarritoFlotante();

        var temporizador;
        observador = new MutationObserver(function () {
            clearTimeout(temporizador);
            temporizador = setTimeout(decorar, 80);
        });
        observar();

        cargarAgotados();
        decorar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
