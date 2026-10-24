/* ==========================================================
   Glow & Go - firebase-glow.js
   - Lee en tiempo real la lista de productos agotados (Firestore)
   - Si quien navega es la administradora (sesión de Firebase),
     la barra verde/roja de cada producto se vuelve un botón para cambiarla
   - Para entrar como administradora: abrir cualquier página con #admin al final
     (ej: https://glowgo.site/categorias.html#admin)
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
let esAdmin = false;

/* ---------- Estilos ---------- */
const estilo = document.createElement("style");
estilo.textContent = `
    body.glow-admin .glow-estado{cursor:pointer;outline:2px dashed rgba(122,28,50,.55);outline-offset:2px}
    body.glow-admin .glow-estado::after{content:" · cambiar";font-weight:600;opacity:.8}
    #glow-admin-chip{position:fixed;left:1rem;bottom:1rem;z-index:60;background:#7A1C32;color:#fff;border-radius:9999px;padding:.45rem .9rem;font-size:.75rem;font-weight:700;display:flex;gap:.6rem;align-items:center;box-shadow:0 6px 18px rgba(0,0,0,.25)}
    #glow-admin-chip button{background:#fff;color:#7A1C32;border:0;border-radius:9999px;padding:.2rem .6rem;font-weight:800;font-size:.7rem;cursor:pointer}
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

/* ---------- Sesión de administradora ---------- */
function chipAdmin(mostrar) {
    let chip = document.getElementById("glow-admin-chip");
    if (!mostrar) { if (chip) chip.remove(); return; }
    if (chip) return;
    chip = document.createElement("div");
    chip.id = "glow-admin-chip";
    chip.innerHTML = '<span><i class="fa-solid fa-user-shield"></i> Modo administradora</span><button type="button">Salir</button>';
    chip.querySelector("button").addEventListener("click", () => signOut(auth));
    document.body.appendChild(chip);
}

onAuthStateChanged(auth, (user) => {
    esAdmin = !!user && (user.email || "").toLowerCase() === ADMIN_EMAIL;
    document.body.classList.toggle("glow-admin", esAdmin);
    chipAdmin(esAdmin);
});

/* ---------- Cambiar Disponible / Agotado ---------- */
document.addEventListener("click", async (e) => {
    if (!esAdmin) return;
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

/* ---------- Ventana para entrar como administradora (#admin) ---------- */
function abrirLoginAdmin() {
    if (document.getElementById("glow-admin-modal")) return;
    const m = document.createElement("div");
    m.id = "glow-admin-modal";
    m.innerHTML = `
        <div class="caja">
            <h2>Acceso de administradora</h2>
            <div class="err" id="glow-admin-err"></div>
            <input type="email" id="glow-admin-correo" placeholder="Correo" autocomplete="username">
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
            cerrar();
        } catch (ex) {
            err.textContent = "Correo o contraseña incorrectos.";
            err.style.display = "block";
        }
    }
    m.querySelector("#glow-admin-entrar").addEventListener("click", entrar);
    m.querySelector("#glow-admin-clave").addEventListener("keydown", (ev) => { if (ev.key === "Enter") entrar(); });
}

function revisarHash() {
    if (location.hash.toLowerCase() === "#admin" && !auth.currentUser) abrirLoginAdmin();
}
window.addEventListener("hashchange", revisarHash);
// Espera a que Firebase confirme si ya había una sesión abierta
setTimeout(revisarHash, 1200);
