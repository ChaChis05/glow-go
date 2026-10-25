/* ==========================================================
   Glow & Go - glow-fb.js
   Conexión única a Firebase (sesión, usuarios, pedidos).
   Todas las páginas que usan Firebase importan este archivo.
   ========================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signOut, updateProfile, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
    getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit,
    onSnapshot, getDocs, writeBatch, runTransaction, serverTimestamp, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export {
    onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
    updateProfile, sendPasswordResetEmail,
    doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, onSnapshot,
    getDocs, writeBatch, runTransaction, serverTimestamp, arrayUnion, arrayRemove
};

const firebaseConfig = {
    apiKey: "AIzaSyD9s7G1e7TOrPabANqttwITtsD_9oHTc5c",
    authDomain: "glow-and-go-ef2d2.firebaseapp.com",
    projectId: "glow-and-go-ef2d2",
    storageBucket: "glow-and-go-ef2d2.firebasestorage.app",
    messagingSenderId: "160375816652",
    appId: "1:160375816652:web:f42fe5d60cf48fec3fdd69",
    measurementId: "G-LWNM4HEHBK"
};

// Solo para mostrar u ocultar cosas en pantalla. La seguridad real está en las reglas de Firestore.
export const ADMIN_EMAIL = "zaidycanobenavides@gmail.com";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "es";
export const db = getFirestore(app);

/* ---------- Utilidades ---------- */
export function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, (c) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
}
export function soloDigitos(t) {
    return String(t || "").replace(/\D/g, "");
}
export function esAdminUsuario(user) {
    return !!user && (user.email || "").toLowerCase() === ADMIN_EMAIL;
}

/* ---------- Sesión ---------- */
// Se resuelve con el usuario (o null) cuando Firebase termina de revisar la sesión guardada
let resolverListo;
export const usuarioListo = new Promise((r) => { resolverListo = r; });

// El resto de las páginas muestran el menú de usuario leyendo localStorage("usuarioLogueado").
// Se mantiene ese dato igual a la sesión real de Firebase.
function recargarUnaVez() {
    if (window.GLOW_SIN_RECARGA) return;
    const ultima = Number(sessionStorage.getItem("glowRecarga") || 0);
    if (Date.now() - ultima < 8000) return;
    sessionStorage.setItem("glowRecarga", String(Date.now()));
    location.reload();
}

let primerEstado = true;
onAuthStateChanged(auth, (user) => {
    const actual = localStorage.getItem("usuarioLogueado") || "";
    if (user && user.email) {
        if (actual.toLowerCase() !== user.email.toLowerCase()) {
            localStorage.setItem("usuarioLogueado", user.email);
            recargarUnaVez();
        }
    } else if (actual) {
        localStorage.removeItem("usuarioLogueado");
        localStorage.removeItem("tokenUsuario");
        recargarUnaVez();
    }
    if (primerEstado) {
        primerEstado = false;
        resolverListo(user);
    }
});

// "Cerrar sesión" de los menús de las páginas ahora cierra también la sesión de Firebase
window.cerrarSesionUsuario = async function () {
    try { await signOut(auth); } catch (e) { /* se limpia igual */ }
    localStorage.removeItem("usuarioLogueado");
    localStorage.removeItem("tokenUsuario");
    window.location.reload();
};

/* ---------- Celular -> correo (para entrar con el número) ---------- */
export async function telefonoACorreo(tel) {
    const d = soloDigitos(tel);
    if (!d) return null;
    const s = await getDoc(doc(db, "telefonos", d));
    return s.exists() ? (s.data().correo || null) : null;
}

/* ---------- Pedidos ---------- */
// Número consecutivo (1001, 1002, ...) y guardado permanente del pedido
export async function crearPedido(datos) {
    await usuarioListo;
    const user = auth.currentUser;
    if (!user) throw new Error("SIN_SESION");

    const refContador = doc(db, "config", "contadorPedidos");
    const numero = await runTransaction(db, async (tx) => {
        const snap = await tx.get(refContador);
        let n;
        if (!snap.exists()) {
            n = 1001;
            tx.set(refContador, { ultimo: n });
        } else {
            n = (Number(snap.data().ultimo) || 1000) + 1;
            tx.update(refContador, { ultimo: n });
        }
        return n;
    });

    const pedido = {
        ...datos,
        numero: numero,
        id: numero,
        uid: user.uid,
        usuario: user.email,
        estado: "Pendiente a confirmación",
        guia: "",
        guiaTexto: "",
        tieneGuiaPdf: false,
        fecha: new Date().toLocaleString("es-CO"),
        creadoEn: serverTimestamp()
    };
    await setDoc(doc(db, "pedidos", String(numero)), pedido);
    return numero;
}

/* ---------- Datos de envío guardados (se conservan en cualquier dispositivo) ---------- */
export async function guardarEnvio(datos) {
    const u = auth.currentUser;
    if (!u) return;
    await setDoc(doc(db, "usuarios", u.uid), { envio: datos }, { merge: true });
}
export async function leerEnvio() {
    const u = auth.currentUser;
    if (!u) return null;
    const s = await getDoc(doc(db, "usuarios", u.uid));
    return s.exists() ? (s.data().envio || null) : null;
}

// Para las páginas con scripts normales (carrito.html)
window.glowFB = { auth, usuarioListo, crearPedido, guardarEnvio, leerEnvio, esAdminUsuario };
