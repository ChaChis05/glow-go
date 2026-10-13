// ==========================================
// 1. CONFIGURACIÓN Y LISTADO OFICIAL
// ==========================================
const categoriasOficiales = [
    { nombre: "Barbería e insumos", disponible: true },
    { nombre: "Belleza", disponible: true },
    { nombre: "Cacharrería", disponible: true },
    { nombre: "Fútbol 1.1", disponible: false },
    { nombre: "Canasta familiar", disponible: false },
    { nombre: "Contenedor china", disponible: false },
    { nombre: "Deporte", disponible: false },
    { nombre: "Dulcería importada", disponible: false },
    { nombre: "Ferretería", disponible: false },
    { nombre: "Halloween", disponible: false },
    { nombre: "Hogar", disponible: false },
    { nombre: "Joyería", disponible: false },
    { nombre: "Mascotas", disponible: false },
    { nombre: "Papelería", disponible: false },
    { nombre: "Perfumería", disponible: false },
    { nombre: "Promociones", disponible: false },
    { nombre: "Relojería original", disponible: false },
    { nombre: "Relojería réplica", disponible: false },
    { nombre: "Sex shop", disponible: false },
    { nombre: "Tecnología", disponible: false },
    { nombre: "Vapes", disponible: false },
    { nombre: "Streaming", disponible: false },
    { nombre: "Calzado nacional", disponible: false },
    { nombre: "Calzado importado", disponible: false }
];

let productosInventario = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let categoriaSeleccionada = "todos";

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ==========================================
// 2. CARGA AUTOMÁTICA DESDE EL EXCEL (CON LIMPIEZA DE ESPACIOS Y COMAS)
// ==========================================
async function cargarProductosDesdeExcel() {
    try {
        const respuesta = await fetch("catalogo para codigo.xlsx");
        if (!respuesta.ok) throw new Error("No se pudo cargar el archivo Excel.");

        const arrayBuffer = await respuesta.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const filasBrutas = XLSX.utils.sheet_to_json(hoja);

        productosInventario = filasBrutas.map((fila, index) => {
            let brutoImagenes = fila["Imagen (Nombre o URL)"] ? String(fila["Imagen (Nombre o URL)"]).trim() : "";
            
            let arrayRutas = [];
            if (brutoImagenes) {
                // Separamos por comas y limpiamos los espacios que tengan alrededor (" , ")
                const listaNombres = brutoImagenes.split(",");
                arrayRutas = listaNombres.map(nombre => {
                    let limpio = nombre.trim(); // Elimina espacios antes y después
                    if (!limpio) return "";
                    
                    const conExt = limpio.toLowerCase().endsWith(".webp") || limpio.toLowerCase().endsWith(".jpg") || limpio.toLowerCase().endsWith(".png") ? limpio : `${limpio}.webp`;
                    return conExt.includes("IMAGENES PRODUCTOS") ? conExt : `IMAGENES PRODUCTOS/${conExt}`;
                }).filter(ruta => ruta !== ""); // Filtra vacíos por si acaso
            }

            let precioCrudo = fila["Precio"] !== undefined ? fila["Precio"] : 0;
            let precioNumerico = typeof precioCrudo === "number" ? precioCrudo : parseFloat(String(precioCrudo).replace(/[^0-9.-]+/g,"")) || 0;

            return {
                id: index + 1,
                categoria: fila["Categoría"] ? String(fila["Categoría"]).trim() : "General",
                nombre: fila["Nombre del Producto"] ? String(fila["Nombre del Producto"]).trim() : "Sin nombre",
                sku: fila["Referencia / SKU"] ? String(fila["Referencia / SKU"]).trim() : `SKU-${index + 1}`,
                descripcion: fila["Especificaciones"] ? String(fila["Especificaciones"]).trim() : "Sin especificaciones.",
                precio: `$${precioNumerico.toLocaleString("es-CO")}`,
                imagenes: arrayRutas
            };
        });
    } catch (error) {
        console.error("Error al procesar el Excel:", error);
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
        categoriaSeleccionada = catUrl;
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

    const catsEnExcelNorm = [...new Set(productosInventario.map(p => normalizarTexto(p.categoria)))];
    dropdown.innerHTML = "";

    categoriasOficiales.forEach(cat => {
        const catNorm = normalizarTexto(cat.nombre);
        const encontradaEnExcel = catsEnExcelNorm.includes(catNorm);
        
        const btn = document.createElement("button");
        btn.className = `w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${encontradaEnExcel ? 'text-gray-700' : 'text-gray-400'}`;
        
        let badge = encontradaEnExcel ? '<span class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Disponible</span>' : '<span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Próximamente</span>';
        
        btn.innerHTML = `<span>${cat.nombre}</span> ${badge}`;
        
        if (encontradaEnExcel) {
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

    const catsEnExcelNorm = [...new Set(productosInventario.map(p => normalizarTexto(p.categoria)))];

    categoriasOficiales.forEach(cat => {
        const catNorm = normalizarTexto(cat.nombre);
        const encontradaEnExcel = catsEnExcelNorm.includes(catNorm);
        
        const btn = document.createElement("button");
        const estaSeleccionada = normalizarTexto(categoriaSeleccionada) === catNorm;
        
        btn.className = `w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex justify-between items-center mb-1 ${estaSeleccionada ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`;

        let badgeHtml = encontradaEnExcel 
            ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Disponible</span>` 
            : `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Próximamente</span>`;

        if (encontradaEnExcel) {
            btn.onclick = () => filtrarPorCategoria(cat.nombre);
        } else {
            btn.classList.add("opacity-60");
            btn.onclick = () => alert(`La categoría "${cat.nombre}" estará disponible próximamente.`);
        }

        btn.innerHTML = `<span class="truncate mr-2">${cat.nombre}</span> ${badgeHtml}`;
        sidebarContainer.appendChild(btn);
    });
}

// ==========================================
// 5. FILTRAR PRODUCTOS
// ==========================================
window.filtrarPorCategoria = function(nombreCat) {
    categoriaSeleccionada = nombreCat;
    renderizarCategoriasSidebar();

    const tituloCat = document.getElementById("titulo-categoria-activa");
    if (tituloCat) {
        tituloCat.textContent = nombreCat === "todos" ? "Todos los Productos" : `Categoría: ${nombreCat}`;
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

    let productosFinales = productosAcesar;

    if (categoriaSeleccionada === "todos" && productosAcesar === productosInventario) {
        const nombresUnicos = new Set();
        productosFinales = productosInventario.filter(prod => {
            const nombreNormalizado = prod.nombre.trim().toLowerCase();
            if (nombresUnicos.has(nombreNormalizado)) {
                return false;
            }
            nombresUnicos.add(nombreNormalizado);
            return true;
        });
    }

    if (!productosFinales || productosFinales.length === 0) {
        gridCatalogo.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8">No hay productos disponibles en esta categoría.</p>`;
        return;
    }

    productosFinales.forEach(prod => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between border border-gray-100 hover:shadow-md transition-shadow";
        
        const portadaImg = prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0] : "";

        const imagenHtml = portadaImg 
            ? `<img src="${portadaImg}" alt="${prod.nombre}" class="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300" onclick="abrirModalProducto(${prod.id})" onerror="this.parentElement.innerHTML='<span class=\'text-xs text-gray-400 font-medium\'>Sin imagen</span>';">`
            : `<span class="text-xs text-gray-400 font-medium">Sin imagen</span>`;

        card.innerHTML = `
            <div class="w-full h-64 bg-white flex items-center justify-center p-4 border-b border-gray-50">
                ${imagenHtml}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <span class="text-xs text-gray-400 mb-1 font-medium">${prod.sku}</span>
                <h3 class="font-bold text-gray-900 text-base mb-1 line-clamp-1 cursor-pointer hover:text-indigo-600" onclick="abrirModalProducto(${prod.id})">${prod.nombre}</h3>
                <p class="text-gray-600 text-xs mb-3 line-clamp-2">${prod.descripcion}</p>
                <div class="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                    <span class="text-indigo-600 font-bold text-base">${prod.precio}</span>
                    <button onclick="agregarAlCarrito(${prod.id})" class="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                        <i class="fa-solid fa-cart-plus mr-1"></i> Agregar
                    </button>
                </div>
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
    
    contenedorMiniaturas.innerHTML = "";

    if (prod.imagenes && prod.imagenes.length > 0) {
        imgPrincipal.src = prod.imagenes[0];

        if (prod.imagenes.length > 1) {
            prod.imagenes.forEach((rutaImg, idx) => {
                const miniatura = document.createElement("button");
                miniatura.className = `w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-indigo-600 scale-105 shadow-md' : 'border-gray-200 opacity-70 hover:opacity-100'}`;
                miniatura.innerHTML = `<img src="${rutaImg}" class="w-full h-full object-contain bg-gray-50">`;
                
                miniatura.onclick = function() {
                    imgPrincipal.src = rutaImg;
                    contenedorMiniaturas.querySelectorAll("button").forEach(btn => {
                        btn.className = "w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 opacity-70 hover:opacity-100 transition-all";
                    });
                    miniatura.className = "w-16 h-16 rounded-xl overflow-hidden border-2 border-indigo-600 scale-105 shadow-md transition-all";
                };

                contenedorMiniaturas.appendChild(miniatura);
            });
        }
    } else {
        imgPrincipal.src = "";
    }

    document.getElementById("modal-sku").textContent = prod.sku;
    document.getElementById("modal-nombre").textContent = prod.nombre;
    document.getElementById("modal-categoria").textContent = prod.categoria;
    document.getElementById("modal-descripcion").textContent = prod.descripcion;
    document.getElementById("modal-precio").textContent = prod.precio;

    const btnAgregar = document.getElementById("modal-btn-agregar");
    btnAgregar.onclick = function() {
        agregarAlCarrito(prod.id);
        cerrarModalProducto();
    };

    document.getElementById("modal-producto").classList.remove("hidden");
};

window.cerrarModalProducto = function() {
    document.getElementById("modal-producto").classList.add("hidden");
};

// ==========================================
// 🔍 BUSCADOR EN TIEMPO REAL (COINCIDE SOLO CON EL INICIO DE LAS PALABRAS)
// ==========================================
window.buscarProductosTiempoReal = function(textoBusqueda) {
    const dropdown = document.getElementById("dropdown-busqueda");
    if (!dropdown) return;

    const query = normalizarTexto(textoBusqueda);

    if (!query || query.length === 0) {
        dropdown.classList.add("hidden");
        dropdown.innerHTML = "";
        return;
    }

    dropdown.classList.remove("hidden");

    // Dividimos lo que escribe el usuario en palabras individuales (por si busca varias palabras)
    const palabrasQuery = query.split(/\s+/).filter(p => p.length > 0);

    const resultados = productosInventario.filter(prod => {
        const nombreNorm = normalizarTexto(prod.nombre);
        const skuNorm = normalizarTexto(prod.sku);
        
        // Unimos nombre y SKU en un solo texto analizable
        const textoCompleto = `${nombreNorm} ${skuNorm}`;
        const palabrasTexto = textoCompleto.split(/\s+/);

        // Verificamos que CADA palabra escrita por el usuario coincida con el INICIO de alguna palabra del producto
        return palabrasQuery.every(qp => 
            palabrasTexto.some(pt => pt.startsWith(qp))
        );
    });

    dropdown.innerHTML = "";

    if (resultados.length === 0) {
        dropdown.innerHTML = `
            <div class="p-4 text-center bg-amber-50 rounded-xl my-1 border border-amber-200 text-amber-900 flex items-center justify-center space-x-2">
                <span class="text-xl">🚨</span>
                <span class="text-sm font-semibold">Este producto no está disponible</span>
            </div>
        `;
        return;
    }

    resultados.forEach(prod => {
        const portada = prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0] : "";
        
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-2.5 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors";
        
        item.innerHTML = `
            <div class="flex items-center space-x-3 overflow-hidden">
                <div class="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    ${portada ? `<img src="${portada}" class="w-full h-full object-contain">` : `<i class="fa-solid fa-box text-gray-300 text-xs"></i>`}
                </div>
                <div class="overflow-hidden">
                    <h4 class="text-xs font-bold text-gray-900 truncate">${prod.nombre}</h4>
                    <span class="text-[10px] text-gray-400">${prod.sku}</span>
                </div>
            </div>
            <div class="text-right flex-shrink-0 ml-2">
                <span class="text-xs font-black text-indigo-600 block">${prod.precio}</span>
            </div>
        `;

        item.onclick = function() {
            dropdown.classList.add("hidden");
            document.getElementById("input-buscador").value = "";
            abrirModalProducto(prod.id);
        };

        dropdown.appendChild(item);
    });
};

document.addEventListener("click", function(e) {
    const buscadorContainer = document.getElementById("input-buscador")?.closest(".relative");
    const dropdown = document.getElementById("dropdown-busqueda");
    if (buscadorContainer && dropdown && !buscadorContainer.contains(e.target)) {
        dropdown.classList.add("hidden");
    }
});

// ==========================================
// 👤 GESTIÓN DE SESIÓN DE USUARIO EN EL HEADER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    verificarSesionUsuario();
});

function verificarSesionUsuario() {
    const usuarioLogueado = localStorage.getItem("usuarioLogueado");
    
    // Buscamos el contenedor del botón de login en el header
    // (Buscamos el elemento por el texto o la ruta que contiene "login.html")
    const enlacesNav = document.querySelectorAll("nav a");
    
    enlacesNav.forEach(enlace => {
        if (enlace.getAttribute("href") === "login.html") {
            if (usuarioLogueado) {
                // Si el usuario ya inició sesión, transformamos el botón en su nombre
                enlace.href = "#";
                enlace.className = "bg-[#7A1C32]/10 text-[#7A1C32] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-xs cursor-pointer relative group";
                enlace.innerHTML = `<i class="fa-solid fa-user-check mr-2"></i> <span class="truncate max-w-[120px]">${usuarioLogueado}</span> <i class="fa-solid fa-chevron-down ml-1.5 text-xs"></i>`;
                
                // Creamos un menú desplegable al hacer clic para opcionalmente cerrar sesión
                enlace.onclick = function(e) {
                    e.preventDefault();
                    if (confirm(`¿Deseas cerrar sesión, ${usuarioLogueado}?`)) {
                        localStorage.removeItem("usuarioLogueado");
                        window.location.reload();
                    }
                };
            }
        }
    });
}