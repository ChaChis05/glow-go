// ==========================================
// 1. CONFIGURACIÓN Y LISTADO OFICIAL DE CATEGORÍAS (EN MAYÚSCULAS)
// ==========================================
const categoriasOficiales = [
    { nombre: "BARBERIA E INSUMOS" },
    { nombre: "BELLEZA" },
    { nombre: "CACHARRERÍA" },
    { nombre: "FUTBOL 1.1" },
    { nombre: "ACCESORIOS" },
    { nombre: "CANASTA FAMILIAR" },
    { nombre: "CONTENEDOR CHINA" },
    { nombre: "DEPORTE" },
    { nombre: "DULCERÍA IMPORTADA" },
    { nombre: "FERRETERÍA" },
    { nombre: "HALLOWEEN" },
    { nombre: "HOGAR" },
    { nombre: "JOYERÍA" },
    { nombre: "MASCOTAS" },
    { nombre: "PAPELERÍA" },
    { nombre: "PERFUMERÍA" },
    { nombre: "PROMOCIONES" },
    { nombre: "RELOJERÍA ORIGINAL" },
    { nombre: "RELOJERÍA RÉPLICA" },
    { nombre: "SEX SHOP" },
    { nombre: "TECNOLOGÍA" },
    { nombre: "VAPES" },
    { nombre: "STREAMING" },
    { nombre: "CALZADO NACIONAL" },
    { nombre: "CALZADO IMPORTADO" }
];

let productosInventario = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let categoriaSeleccionada = "todos";

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ==========================================
// 2. CARGA AUTOMÁTICA DESDE EL ARCHIVO CSV
// ==========================================
async function cargarProductosDesdeExcel() {
    try {
        const respuesta = await fetch("catalogo.csv");
        if (!respuesta.ok) throw new Error("No se pudo cargar el archivo CSV.");

        const csvText = await respuesta.text();
        const lines = csvText.split('\n');
        if (lines.length === 0) return;

        const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, '').replace(/^\ufeff/, ''));
        const filasBrutas = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const currentLine = lines[i].split(';');
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j] ? currentLine[j].trim().replace(/^"|"$/g, '') : '';
            }
            filasBrutas.push(obj);
        }

        productosInventario = filasBrutas.map((fila, index) => {
            let brutoImagenes = fila["Imagen (Nombre o URL)"] ? String(fila["Imagen (Nombre o URL)"]).trim() : "";
            
            let arrayRutas = [];
            if (brutoImagenes) {
                const listaNombres = brutoImagenes.split(",");
                arrayRutas = listaNombres.map(nombre => {
                    let limpio = nombre.trim();
                    if (!limpio) return "";
                    
                    const conExt = limpio.toLowerCase().endsWith(".webp") || limpio.toLowerCase().endsWith(".jpg") || limpio.toLowerCase().endsWith(".png") ? limpio : `${limpio}.webp`;
                    return conExt.includes("IMAGENES PRODUCTOS") ? conExt : `IMAGENES PRODUCTOS/${conExt}`;
                }).filter(ruta => ruta !== "");
            }

            let precioCrudo = fila["Precio"] !== undefined ? fila["Precio"] : 0;
            let precioNumerico = typeof precioCrudo === "number" ? precioCrudo : parseFloat(String(precioCrudo).replace(/[^0-9.-]+/g,"")) || 0;

            return {
                id: index + 1,
                categoria: fila["Categoría"] ? String(fila["Categoría"]).trim().toUpperCase() : "GENERAL",
                nombre: fila["Nombre del Producto"] ? String(fila["Nombre del Producto"]).trim() : "Sin nombre",
                sku: fila["Referencia / SKU"] ? String(fila["Referencia / SKU"]).trim() : `SKU-${index + 1}`,
                descripcion: fila["Especificaciones"] ? String(fila["Especificaciones"]).trim() : "Sin especificaciones.",
                precio: `$${precioNumerico.toLocaleString("es-CO")}`,
                precioStr: `$${precioNumerico.toLocaleString("es-CO")}`,
                precioNum: precioNumerico,
                imagenes: arrayRutas
            };
        });
    } catch (error) {
        console.error("Error al procesar el archivo CSV:", error);
    }
}

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductosDesdeExcel();

    const urlParams = new URLSearchParams(window.location.search);
    const catUrl = urlParams.get("cat");
    
    if (catUrl) {
        categoriaSeleccionada = catUrl.toUpperCase();
    }

    renderizarCategoriasSidebar();
    renderizarMenuHeader();

    if (categoriaSeleccionada === "todos") {
        renderizarProductosGrilla(productosInventario);
    } else if (categoriaSeleccionada) {
        filtrarPorCategoria(categoriaSeleccionada);
    } else {
        renderizarProductosGrilla(productosInventario);
    }
    
    actualizarContadorCarrito();
});

// ==========================================
// 4. MENÚ HEADER Y SIDEBAR
// ==========================================
window.toggleMenuCategoriasHeader = function() {
    const dropdown = document.getElementById("dropdown-categorias-header");
    if (dropdown) dropdown.classList.toggle("hidden");
};

function renderizarMenuHeader() {
    const dropdown = document.getElementById("dropdown-categorias-header");
    if (!dropdown) return;

    const catsEnCsvNorm = [...new Set(productosInventario.map(p => normalizarTexto(p.categoria)))];
    dropdown.innerHTML = "";

    categoriasOficiales.forEach(cat => {
        const catNorm = normalizarTexto(cat.nombre);
        const encontradaEnCsv = catsEnCsvNorm.includes(catNorm);
        
        const btn = document.createElement("button");
        btn.className = `w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${encontradaEnCsv ? 'text-gray-700 font-bold' : 'text-gray-400'}`;
        
        let badge = encontradaEnCsv ? '<span class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Disponible</span>' : '<span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Próximamente</span>';
        
        btn.innerHTML = `<span>${cat.nombre}</span> ${badge}`;
        
        if (encontradaEnCsv) {
            btn.onclick = () => {
                window.location.href = `categorias.html?cat=${encodeURIComponent(cat.nombre)}`;
            };
        } else {
            btn.onclick = () => alert(`La categoría "${cat.nombre}" estará disponible próximamente.`);
        }
        
        dropdown.appendChild(btn);
    });
}

function renderizarCategoriasSidebar() {
    const sidebarContainer = document.getElementById("categorias-sidebar");
    if (!sidebarContainer) return;

    sidebarContainer.innerHTML = "";

    const btnTodos = document.createElement("button");
    const esTodos = categoriaSeleccionada === "todos";
    btnTodos.className = `w-full text-left px-3 py-2 rounded-lg font-medium transition-colors mb-2 ${esTodos ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`;
    btnTodos.innerHTML = `Todos los productos`;
    btnTodos.onclick = () => filtrarPorCategoria("todos");
    sidebarContainer.appendChild(btnTodos);

    const catsEnCsvNorm = [...new Set(productosInventario.map(p => normalizarTexto(p.categoria)))];

    categoriasOficiales.forEach(cat => {
        const catNorm = normalizarTexto(cat.nombre);
        const encontradaEnCsv = catsEnCsvNorm.includes(catNorm);
        
        const btn = document.createElement("button");
        const estaSeleccionada = normalizarTexto(categoriaSeleccionada) === catNorm;
        
        btn.className = `w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex justify-between items-center mb-1 ${estaSeleccionada ? 'bg-[#7A1C32] text-white' : 'hover:bg-gray-100 text-gray-700'}`;

        let badgeHtml = encontradaEnCsv 
            ? `<span class="text-xs ${estaSeleccionada ? 'bg-white text-[#7A1C32]' : 'bg-green-100 text-green-700'} px-2 py-0.5 rounded-full font-semibold">Disponible</span>` 
            : `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Próximamente</span>`;

        if (encontradaEnCsv) {
            btn.onclick = () => filtrarPorCategoria(cat.nombre);
        } else {
            btn.classList.add("opacity-60");
            btn.onclick = () => alert(`La categoría "${cat.nombre}" estará disponible próximamente.`);
        }

        btn.innerHTML = `<span class="truncate mr-2 uppercase">${cat.nombre}</span> ${badgeHtml}`;
        sidebarContainer.appendChild(btn);
    });
}

// ==========================================
// 5. FILTRAR PRODUCTOS
// ==========================================
window.filtrarPorCategoria = function(nombreCat) {
    categoriaSeleccionada = nombreCat.toUpperCase();
    renderizarCategoriasSidebar();

    const tituloCat = document.getElementById("titulo-categoria-activa") || document.getElementById("categoria-titulo");
    if (tituloCat) {
        tituloCat.textContent = nombreCat === "todos" ? "Todos los Productos" : `Categoría: ${nombreCat.toUpperCase()}`;
    }

    if (nombreCat === "todos") {
        renderizarProductosGrilla(productosInventario);
    } else {
        const normTarget = normalizarTexto(nombreCat);
        const filtrados = productosInventario.filter(p => normalizarTexto(p.categoria) === normTarget);
        renderizarProductosGrilla(filtrados);
    }
};

// ==========================================
// 6. RENDERIZAR GRILLA
// ==========================================
function renderizarProductosGrilla(productosAcesar) {
    const gridCatalogo = document.getElementById("catalog-full-grid") || document.getElementById("catalog-grid") || document.getElementById("offers-grid");
    if (!gridCatalogo) return;

    gridCatalogo.innerHTML = "";

    if (!productosAcesar || productosAcesar.length === 0) {
        gridCatalogo.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12 font-medium">No hay productos disponibles en esta categoría.</p>`;
        return;
    }

    productosAcesar.forEach(prod => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow";
        
        const portadaImg = prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0] : "";

        card.innerHTML = `
            <div>
                <img src="${portadaImg}" alt="${prod.nombre}" onerror="this.src='logo_glow.jpg'" class="h-48 w-full object-contain rounded-xl mb-4 bg-gray-50 p-2 cursor-pointer" onclick="abrirModalProducto(${prod.id})">
                <span class="text-xs text-[#7A1C32] font-bold uppercase">${prod.categoria}</span>
                <h3 class="font-bold text-gray-900 text-base mt-1 mb-2 cursor-pointer hover:text-[#7A1C32]" onclick="abrirModalProducto(${prod.id})">${prod.nombre}</h3>
            </div>
            <div>
                <div class="text-lg font-black text-[#7A1C32] mb-3">${prod.precio}</div>
                <button onclick="agregarAlCarrito(${prod.id})" class="w-full bg-[#7A1C32] hover:bg-[#621628] text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer">
                    <i class="fa-solid fa-cart-plus mr-2"></i> Añadir
                </button>
            </div>
        `;
        gridCatalogo.appendChild(card);
    });
}

// ==========================================
// 7. CARRITO Y MODAL
// ==========================================
window.agregarAlCarrito = function(idProducto) {
    const productoEncontrado = productosInventario.find(p => p.id === idProducto);
    if (!productoEncontrado) return;

    const itemExistente = carrito.find(item => item.id === idProducto);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ ...productoEncontrado, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
};

function actualizarContadorCarrito() {
    const contador = document.getElementById("cart-count");
    if (contador) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = totalItems;
    }
}

window.abrirModalProducto = function(idProducto) {
    const prod = productosInventario.find(p => p.id === idProducto);
    if (!prod) return;

    const imgPrincipal = document.getElementById("modal-img");
    const contenedorMiniaturas = document.getElementById("modal-galeria-miniaturas");
    
    if (contenedorMiniaturas) contenedorMiniaturas.innerHTML = "";

    if (imgPrincipal && prod.imagenes && prod.imagenes.length > 0) {
        imgPrincipal.src = prod.imagenes[0];
        
        if (contenedorMiniaturas) {
            contenedorMiniaturas.innerHTML = prod.imagenes.map((img, idx) => `
                <button onclick="document.getElementById('modal-img').src='${img}'" class="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-1 flex-shrink-0 cursor-pointer hover:border-[#7A1C32]">
                    <img src="${img}" class="w-full h-full object-contain">
                </button>
            `).join('');
        }
    }

    if (document.getElementById("modal-sku")) document.getElementById("modal-sku").textContent = prod.sku;
    if (document.getElementById("modal-nombre")) document.getElementById("modal-nombre").textContent = prod.nombre;
    if (document.getElementById("modal-categoria")) document.getElementById("modal-categoria").textContent = prod.categoria;
    if (document.getElementById("modal-descripcion")) document.getElementById("modal-descripcion").textContent = prod.descripcion;
    if (document.getElementById("modal-precio")) document.getElementById("modal-precio").textContent = prod.precio;

    const btnAgregarModal = document.getElementById("modal-btn-agregar") || document.getElementById("btn-agregar-carrito-modal");
    if (btnAgregarModal) {
        btnAgregarModal.onclick = function() {
            agregarAlCarrito(prod.id);
            if (typeof cerrarModalProducto === "function") cerrarModalProducto();
        };
    }

    const modal = document.getElementById("modal-producto") || document.getElementById("modal-detalle");
    if (modal) modal.classList.remove("hidden");
};

// ==========================================
// 8. BÚSQUEDA INTELIGENTE EN TIEMPO REAL
// ==========================================
window.buscarProductosTiempoReal = function(texto) {
    const dropdown = document.getElementById("dropdown-busqueda");
    if (!dropdown) return;
    
    const query = texto.toLowerCase().trim();

    if (!query || query.length < 2) {
        dropdown.classList.add("hidden");
        dropdown.innerHTML = "";
        return;
    }

    if (productosInventario.length === 0) {
        dropdown.innerHTML = `<div class="p-3 text-xs text-gray-500 text-center">Cargando inventario...</div>`;
        dropdown.classList.remove("hidden");
        return;
    }

    const palabrasBusqueda = query.split(/\s+/).filter(Boolean);

    const resultados = productosInventario.filter(p => {
        const nombreLower = (p.nombre || "").toLowerCase();
        const categoriaLower = (p.categoria || "").toLowerCase();
        const skuLower = (p.sku || "").toLowerCase();

        const palabrasNombre = nombreLower.split(/\s+/);

        return palabrasBusqueda.every(palabraQuery => {
            const coincideNombre = palabrasNombre.some(pNombre => pNombre.startsWith(palabraQuery));
            const coincideCategoria = categoriaLower.startsWith(palabraQuery);
            const coincideSku = skuLower.startsWith(palabraQuery);

            return coincideNombre || coincideCategoria || coincideSku;
        });
    }).slice(0, 6);

    if (resultados.length === 0) {
        dropdown.innerHTML = `<div class="p-3 text-xs text-gray-500 text-center">No se encontraron productos</div>`;
        dropdown.classList.remove("hidden");
        return;
    }

    dropdown.innerHTML = resultados.map(p => {
        const imagenProd = (p.imagenes && p.imagenes[0]) ? p.imagenes[0] : 'logo_glow.jpg';
        const precioProd = p.precioStr || p.precio || '$0';

        return `
            <div onclick="seleccionarProductoBusqueda(${p.id}, '${p.categoria || ''}')" class="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                <img src="${imagenProd}" class="w-10 h-10 object-contain rounded-lg bg-gray-100 p-1 flex-shrink-0" onerror="this.src='logo_glow.jpg'">
                <div class="flex-grow min-w-0">
                    <h4 class="text-xs font-bold text-gray-800 truncate">${p.nombre}</h4>
                    <span class="text-[10px] text-[#7A1C32] font-semibold">${precioProd}</span>
                </div>
            </div>
        `;
    }).join('');
    dropdown.classList.remove("hidden");
};

window.seleccionarProductoBusqueda = function(idProducto, categoria) {
    const dropdown = document.getElementById("dropdown-busqueda");
    if (dropdown) dropdown.classList.add("hidden");

    if (typeof abrirModalProducto === "function") {
        abrirModalProducto(idProducto);
        return;
    }

    if (categoria) {
        window.location.href = `categorias.html?cat=${encodeURIComponent(categoria)}`;
    } else {
        window.location.href = `catalogo.html`;
    }
};

window.addEventListener("click", function(e) {
    const dropdownBusqueda = document.getElementById("dropdown-busqueda");
    const inputBuscador = document.getElementById("input-buscador") || document.getElementById("buscador-productos");
    if (dropdownBusqueda && inputBuscador && !inputBuscador.contains(e.target) && !dropdownBusqueda.contains(e.target)) {
        dropdownBusqueda.classList.add("hidden");
    }
});
