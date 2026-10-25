/* ==========================================================
   Glow & Go - firebase-glow.js
   - Lee en tiempo real la lista de productos agotados (Firestore)
   - Etiqueta flotante para la administradora con interruptor de
     "Edición de agotados" (ACTIVADA / DESACTIVADA)
   - También se puede entrar abriendo cualquier página con #admin al final
   Se carga con: <script type="module" src="js/firebase-glow.js"></script>
   DESPUÉS de js/extras.js
   ========================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
    getFirestore, doc, onSnapshot, setDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD9s7G1e7TOrPabANqttwITtsD_9oHTc5c",
    authDomain: "glow-and-go-ef2d2.firebaseapp.com",
    projectId: "glow-and-go-ef2d2",
    storageBucket: "glow-and-go-ef2d2.firebasestorage.app",
    messagingSenderId: "160375816652",
    appId: "1:160375816652:web:f42fe5d60cf48fec3fdd69",
    measurementId: "G-LWNM4HEHBK"
};

// Solo para mostrar u ocultar controles. La seguridad real está en las reglas de Firestore.
const ADMIN_EMAIL = "zaidycanobenavides@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const refAgotados = doc(db, "config", "agotados");

let listaActual = [];
let esAdmin = false;                                         // sesión de Firebase de la administradora
let editando = localStorage.getItem("glowEdicion") !== "0";  // interruptor de edición (se recuerda en este dispositivo)

// Si en el login normal de la página entró la administradora, se le ofrece activar la edición
function esAdminLocal() {
    const u = (localStorage.getItem("usuarioLogueado") || "").toLowerCase().trim();
    return u === ADMIN_EMAIL || u === ADMIN_EMAIL.split("@")[0];
}

/* ---------- Estilos ---------- */
const estilo = document.createElement("style");
estilo.textContent = `
    body.glow-editando .glow-estado{cursor:pointer;outline:2px dashed rgba(122,28,50,.55);outline-offset:2px}
    body.glow-editando .glow-estado::after{content:" · cambiar";font-weight:600;opacity:.8}
    #glow-admin-chip{position:fixed;left:1rem;bottom:1rem;z-index:60;max-width:calc(100vw - 6.5rem);background:#7A1C32;color:#fff;border-radius:1rem;padding:.5rem .8rem;font-size:.72rem;font-weight:700;display:flex;flex-wrap:wrap;gap:.45rem;align-items:center;box-shadow:0 6px 18px rgba(0,0,0,.25)}
    #glow-admin-chip button{background:#fff;color:#7A1C32;border:0;border-radius:9999px;padding:.25rem .65rem;font-weight:800;font-size:.7rem;cursor:pointer}
    #glow-admin-chip button.on{background:#dcfce7;color:#166534}
    #glow-admin-modal{position:fixed;inset:0;z-index:400000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:1rem}
    #glow-admin-modal .caja{background:#fff;border-radius:1.25rem;max-width:22rem;width:100%;padding:1.5rem;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:inherit}
    #glow-admin-modal h2{font-size:1.1rem;font-weight:900;color:#111827;margin:0 0 .75rem}
    #glow-admin-modal input{width:100%;border:1px solid #e5e7eb;border-radius:.75rem;padding:.7rem .9rem;font-size:.9rem;margin-bottom:.6rem;box-sizing:border-box}
    #glow-admin-modal .btn{width:100%;background:#7A1C32;color:#fff;border:0;border-radius:.75rem;padding:.75rem;font-weight:800;cursor:pointer}
    #glow-admin-modal .cerrar{width:100%;background:none;border:0;color:#6b7280;margin-top:.5rem;font-size:.8rem;cursor:pointer}
    #glow-admin-modal .err{color:#b91c1c;font-size:.78rem;font-weight:700;margin-bottom:.5rem;display:none}
`;
document.head.appendChild(estilo);

/* ---------- Lista de agotados en tiempo real ---------- */
function aplicarLista(lista, intento = 0) {
    listaActual = lista;
    if (typeof window.glowActualizarAgotados === "function") {
        window.glowActualizarAgotados(lista);
    } else if (intento < 25) {
        setTimeout(() => aplicarLista(lista, intento + 1), 200);
    }
}

onSnapshot(
    refAgotados,
    (snap) => {
        const datos = snap.exists() ? snap.data() : {};
        aplicarLista(Array.isArray(datos.skus) ? datos.skus : []);
    },
    (err) => console.error("No se pudo leer la lista de agotados:", err)
);

/* ---------- Etiqueta e interruptor de la administradora ---------- */
function pintarChip() {
    const previo = document.getElementById("glow-admin-chip");
    if (previo) previo.remove();
    if (!esAdmin && !esAdminLocal()) return;

    const chip = document.createElement("div");
    chip.id = "glow-admin-chip";
    if (esAdmin) {
        chip.innerHTML =
            '<span><i class="fa-solid fa-user-shield"></i> Administradora</span>' +
            '<button type="button" data-act="editar" class="' + (editando ? "on" : "") + '">Edición de agotados: ' + (editando ? "ACTIVADA" : "DESACTIVADA") + '</button>' +
            '<button type="button" data-act="salir">Salir</button>';
    } else {
        chip.innerHTML =
            '<span><i class="fa-solid fa-user-shield"></i> Administradora</span>' +
            '<button type="button" data-act="entrar">Activar edición de agotados</button>';
    }

    chip.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-act]");
        if (!b) return;
        const accion = b.dataset.act;
        if (accion === "editar") {
            editando = !editando;
            localStorage.setItem("glowEdicion", editando ? "1" : "0");
            aplicarModo();
        } else if (accion === "salir") {
            signOut(auth);
        } else if (accion === "entrar") {
            abrirLoginAdmin();
        }
    });
    document.body.appendChild(chip);
}

function aplicarModo() {
    document.body.classList.toggle("glow-admin", esAdmin);                 // sesión iniciada (ej: botón del PDF)
    document.body.classList.toggle("glow-editando", esAdmin && editando);  // barras de estado editables
    pintarChip();
}

onAuthStateChanged(auth, (user) => {
    esAdmin = !!user && (user.email || "").toLowerCase() === ADMIN_EMAIL;
    aplicarModo();
});

/* ---------- Cambiar Disponible / Agotado ---------- */
document.addEventListener("click", async (e) => {
    if (!esAdmin || !editando) return;
    const barra = e.target.closest(".glow-estado[data-sku]");
    if (!barra) return;
    e.preventDefault();
    e.stopPropagation();

    const sku = barra.dataset.sku;
    const agotado = listaActual.includes(sku);
    try {
        await setDoc(refAgotados, { skus: agotado ? arrayRemove(sku) : arrayUnion(sku) }, { merge: true });
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el cambio. Verifica que iniciaste sesión como administradora y que las reglas de Firestore estén publicadas.");
    }
}, true);

/* ---------- Ventana de acceso de la administradora ---------- */
function abrirLoginAdmin() {
    if (document.getElementById("glow-admin-modal")) return;
    const m = document.createElement("div");
    m.id = "glow-admin-modal";
    m.innerHTML = `
        <div class="caja">
            <h2>Acceso de administradora</h2>
            <div class="err" id="glow-admin-err"></div>
            <input type="email" id="glow-admin-correo" placeholder="Correo" autocomplete="username" value="${ADMIN_EMAIL}">
            <input type="password" id="glow-admin-clave" placeholder="Contraseña" autocomplete="current-password">
            <button class="btn" type="button" id="glow-admin-entrar">Entrar</button>
            <button class="cerrar" type="button" id="glow-admin-cerrar">Cancelar</button>
        </div>`;
    document.body.appendChild(m);

    const err = m.querySelector("#glow-admin-err");
    const cerrar = () => m.remove();
    m.querySelector("#glow-admin-cerrar").addEventListener("click", cerrar);

    async function entrar() {
        err.style.display = "none";
        const correo = m.querySelector("#glow-admin-correo").value.trim();
        const clave = m.querySelector("#glow-admin-clave").value;
        try {
            await signInWithEmailAndPassword(auth, correo, clave);
            editando = true;
            localStorage.setItem("glowEdicion", "1");
            cerrar();
            aplicarModo();
        } catch (ex) {
            err.textContent = "Correo o contraseña incorrectos.";
            err.style.display = "block";
        }
    }
    m.querySelector("#glow-admin-entrar").addEventListener("click", entrar);
    m.querySelector("#glow-admin-clave").addEventListener("keydown", (ev) => { if (ev.key === "Enter") entrar(); });
    m.querySelector("#glow-admin-clave").focus();
}

function revisarHash() {
    if (location.hash.toLowerCase() === "#admin" && !auth.currentUser) abrirLoginAdmin();
}
window.addEventListener("hashchange", revisarHash);
setTimeout(revisarHash, 1200);

// Primera pintura (por si la administradora ya inició sesión en el login normal)
pintarChip();
