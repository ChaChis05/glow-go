/* ==========================================================
   Glow & Go - precios.js
   Precios editables desde el Panel Administrador (pestaña "Precios").

   - Los precios que la administradora cambia en el panel se guardan en
     Firestore (documento config/agotados, campo "precios") y aquí se
     aplican sobre catalogo.csv ANTES de que cualquier página lo lea.
     Así no hay que tocar el CSV para cambiar un precio.
   - Los productos con precio $0 NO se muestran en la tienda hasta que
     tengan precio (en el panel sí aparecen como "pendientes").

   Se carga en el <head> de cada página, ANTES de js/app.js:
       <script src="js/precios.js"></script>
   ========================================================== */
(function () {
    "use strict";

    var PROYECTO = "glow-and-go-ef2d2";
    var API_KEY = "AIzaSyD9s7G1e7TOrPabANqttwITtsD_9oHTc5c";
    var URL_PRECIOS = "https://firestore.googleapis.com/v1/projects/" + PROYECTO +
        "/databases/(default)/documents/config/agotados?mask.fieldPaths=precios&key=" + API_KEY;
    var CLAVE_CACHE = "glowPreciosCache";

    // Identificador de un producto: SKU + nombre normalizado (hay SKUs repetidos en productos distintos)
    function normalizar(t) {
        return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
            .toUpperCase().replace(/[^A-Z0-9]/g, "");
    }
    function clavePrecio(sku, nombre) {
        return String(sku || "").trim().toUpperCase() + "|" + normalizar(nombre);
    }
    window.glowClavePrecio = clavePrecio;

    function leerCache() {
        try { return JSON.parse(localStorage.getItem(CLAVE_CACHE) || "{}") || {}; } catch (e) { return {}; }
    }

    // Lee los precios de Firestore (lectura pública, sin iniciar sesión)
    function pedirPrecios() {
        var tiempo = new Promise(function (r) { setTimeout(function () { r(null); }, 3500); });
        var pedido = fetch(URL_PRECIOS, { cache: "no-store" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d) return null;
                var campos = (d.fields && d.fields.precios && d.fields.precios.mapValue &&
                    d.fields.precios.mapValue.fields) || {};
                var mapa = {};
                Object.keys(campos).forEach(function (k) {
                    var v = campos[k];
                    var n = Number(v.integerValue != null ? v.integerValue : v.doubleValue);
                    if (isFinite(n)) mapa[k] = n;
                });
                try { localStorage.setItem(CLAVE_CACHE, JSON.stringify(mapa)); } catch (e) {}
                return mapa;
            })
            .catch(function () { return null; });
        return Promise.race([pedido, tiempo]).then(function (m) { return m || leerCache(); });
    }
    var preciosListos = pedirPrecios();

    function decodificar(buf) {
        try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); }
        catch (e) { return new TextDecoder("windows-1252").decode(buf); }
    }

    function digitos(t) { return Number(String(t || "").replace(/[^0-9]/g, "")) || 0; }

    // Aplica los precios del panel al texto del CSV y quita los productos en $0
    function aplicarPrecios(texto, mapa, conCeros) {
        var lineas = texto.split("\n");
        if (!lineas.length) return texto;
        var cab = lineas[0].split(";").map(function (h) {
            return h.trim().replace(/^"|"$/g, "").replace(/^﻿/, "");
        });
        var iPrecio = cab.indexOf("Precio");
        var iSku = cab.indexOf("Referencia / SKU");
        var iNombre = cab.indexOf("Nombre del Producto");
        if (iPrecio < 0 || iSku < 0 || iNombre < 0) return texto;

        var salida = [lineas[0]];
        for (var i = 1; i < lineas.length; i++) {
            var linea = lineas[i];
            if (!linea.trim()) { salida.push(linea); continue; }
            var fin = /\r$/.test(linea) ? "\r" : "";
            var cols = linea.replace(/\r$/, "").split(";");
            var limpio = function (j) { return (cols[j] || "").trim().replace(/^"|"$/g, ""); };
            var clave = clavePrecio(limpio(iSku), limpio(iNombre));
            if (Object.prototype.hasOwnProperty.call(mapa, clave)) {
                while (cols.length <= iPrecio) cols.push("");
                cols[iPrecio] = "$ " + Math.round(mapa[clave]).toLocaleString("en-US");
            }
            if (!conCeros && digitos(cols[iPrecio]) === 0) continue;   // sin precio: no se muestra
            salida.push(cols.join(";") + fin);
        }
        return salida.join("\n");
    }

    var fetchOriginal = window.fetch.bind(window);

    // CSV tal cual está en el repositorio (para el panel)
    window.glowCsvCrudo = function () {
        return fetchOriginal("catalogo.csv?v=" + Date.now(), { cache: "no-store" })
            .then(function (r) { if (!r.ok) throw new Error("No se pudo leer catalogo.csv"); return r.arrayBuffer(); })
            .then(decodificar);
    };

    window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : ((input && input.url) || "");
        if (!/(^|\/)catalogo\.csv(\?|#|$)/i.test(url)) return fetchOriginal(input, init);

        var conCeros = /[?&]todos=1/.test(url);
        return Promise.all([fetchOriginal(input, init), preciosListos]).then(function (res) {
            var resp = res[0], mapa = res[1] || {};
            if (!resp.ok) return resp;
            return resp.arrayBuffer().then(function (buf) {
                var texto = aplicarPrecios(decodificar(buf), mapa, conCeros);
                return new Response(texto, {
                    status: resp.status,
                    headers: { "Content-Type": "text/csv; charset=utf-8" }
                });
            });
        });
    };
})();
