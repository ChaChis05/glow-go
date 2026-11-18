/* ==========================================================
   Glow & Go - Premios del sorteo trimestral
   Solo se guardan SKU + nombre: la página toma imagen, descripción
   y precio del catálogo (con los precios del Panel Administrador).
   tipo "combo" = el ganador se lleva todos los productos.
   tipo "uno"   = el ganador escoge UNO de los productos.
   sorpresa: true = se muestra "+ Regalo sorpresa".
   ========================================================== */
window.GLOW_PREMIOS_SECCIONES = [
    { id: "tecnologia", nombre: "Tecnología", icono: "fa-headphones" },
    { id: "perfumeria", nombre: "Perfumería", icono: "fa-spray-can-sparkles" },
    { id: "relojeria", nombre: "Relojería", icono: "fa-clock" },
    { id: "belleza", nombre: "Belleza y cuidado personal", icono: "fa-wand-magic-sparkles" },
    { id: "hogar", nombre: "Hogar", icono: "fa-house" },
    { id: "papeleria", nombre: "Papelería y arte", icono: "fa-pencil" },
    { id: "dulceria", nombre: "Dulcería", icono: "fa-candy-cane" },
    { id: "moda", nombre: "Moda, deporte y calzado", icono: "fa-shirt" },
    { id: "streaming", nombre: "Streaming", icono: "fa-tv" }
];

window.GLOW_PREMIOS = [
    {
        "id": "p15",
        "seccion": "tecnologia",
        "titulo": "Tecnología a tu elección",
        "tipo": "uno",
        "productos": [
            {
                "sku": "R-00012ML",
                "nombre": "SMART WACHT GUS-16",
                "sorpresa": true
            },
            {
                "sku": "14554",
                "nombre": "APPLE 1.1 AIRPODS PRO 2DA GENERACION ANC",
                "sorpresa": true
            },
            {
                "sku": "TG-00003R",
                "nombre": "GAME RETRO 400 JUEGOS (2) JUGADORES",
                "sorpresa": true
            },
            {
                "sku": "TG-00001N",
                "nombre": "MOUSE GAMER 3200 DPI",
                "sorpresa": true
            },
            {
                "sku": "TG-00022N",
                "nombre": "BAFLE KOLEER ORIGINAL",
                "sorpresa": true
            },
            {
                "sku": "REF-54F88",
                "nombre": "DIADEMA BLUETOOH B31"
            },
            {
                "sku": "REF2154411",
                "nombre": "PARLANTE OKOP KP-539"
            },
            {
                "sku": "ER-1013",
                "nombre": "AUDÍFONOS DEPORTIVOS BLUETOOTH MOVISUN S20"
            },
            {
                "sku": "REF-2033",
                "nombre": "AIRPODS ORIGINAL ES48"
            },
            {
                "sku": "REF-2036",
                "nombre": "CARGADOR INALAMBRICO KI90",
                "sorpresa": true
            },
            {
                "sku": "REF-2047",
                "nombre": "BAFLE SMART SPEAKER APP"
            },
            {
                "sku": "8497573",
                "nombre": "KIT LABUBU",
                "sorpresa": true
            },
            {
                "sku": "REF-2059",
                "nombre": "SMART WATCH S11 KZ-W42"
            },
            {
                "sku": "REF-2052",
                "nombre": "COMBO AIRPODS TWS-K30"
            },
            {
                "sku": "TEC-00030",
                "nombre": "SMARTWACHT SERIE 11 MINI",
                "sorpresa": true
            },
            {
                "sku": "REF-2068",
                "nombre": "SMART WATCH + AUDIFONOS I20"
            },
            {
                "sku": "REF-74605gg",
                "nombre": "LOCALIZADOR INTELIGENTE LOSHALL F15",
                "sorpresa": true
            },
            {
                "sku": "REF-2084",
                "nombre": "AIRPODS ORIGINALES ES57",
                "sorpresa": true
            },
            {
                "sku": "REF-2085",
                "nombre": "AIRPODS ORIGINALES ES56"
            },
            {
                "sku": "migueltm",
                "nombre": "PARLANTE KIMISO KMS-295"
            },
            {
                "sku": "REF-2079",
                "nombre": "SMARTWACHT ULTRA COMBO PRO"
            },
            {
                "sku": "REF-2090",
                "nombre": "TECLADO GAMER"
            },
            {
                "sku": "REF-2108",
                "nombre": "SMART WATCH ACE-180",
                "sorpresa": true
            }
        ]
    },
    {
        "id": "p12",
        "seccion": "perfumeria",
        "titulo": "Perfume a tu elección",
        "tipo": "uno",
        "productos": [
            {
                "sku": "FIRMA-03",
                "nombre": "HUGO BOSS 1.1 BOTTLED"
            },
            {
                "sku": "REF-HBU-05",
                "nombre": "HUGO BOSS AAA BOTTLED UNLIMITED",
                "sorpresa": true
            },
            {
                "sku": "REF-LAC-08",
                "nombre": "AAA HOMBRE LACOSTE RED",
                "sorpresa": true
            },
            {
                "sku": "ERIK-10",
                "nombre": "AAA DAMA LACOSTE HC14",
                "sorpresa": true
            },
            {
                "sku": "2333256",
                "nombre": "AAA DAMA LACOSTE HC20",
                "sorpresa": true
            },
            {
                "sku": "ERIKA-27",
                "nombre": "1.1 DAMA PARIS HILTON"
            },
            {
                "sku": "ERIKA-28",
                "nombre": "1.1 HOMBRE PARIS HILTON"
            }
        ]
    },
    {
        "id": "p13",
        "seccion": "relojeria",
        "titulo": "Reloj Kairos original",
        "tipo": "uno",
        "productos": [
            {
                "sku": "DM1851N",
                "nombre": "KAIROS ORIGINAL HOMBRE DM1851 NEGRO",
                "sorpresa": true
            },
            {
                "sku": "DM1851",
                "nombre": "KAIROS ORIGINAL HOMBRE DM1851 ROJO",
                "sorpresa": true
            }
        ]
    },
    {
        "id": "p14",
        "seccion": "relojeria",
        "titulo": "Reloj a tu elección",
        "tipo": "uno",
        "productos": [
            {
                "sku": "REF-474S",
                "nombre": "CASIO TORNAZOL HOMBRE 474S"
            },
            {
                "sku": "REF-F1564",
                "nombre": "FOSIL HOMBRE CH1564",
                "sorpresa": true
            },
            {
                "sku": "REF-547",
                "nombre": "CASIO HOMBRE 547"
            }
        ]
    },
    {
        "id": "p01",
        "seccion": "belleza",
        "titulo": "Kit de barbería",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-BARB-12",
                "nombre": "MAQUINA DE AFEITAR ORIGINAL CH1"
            },
            {
                "sku": "REF-AFEITADORADRAGON",
                "nombre": "MAQUINA ELECTRICA AFEITADORA"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p02",
        "seccion": "belleza",
        "titulo": "Kit facial Vitamina C",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-GG5GG1F",
                "nombre": "KIT FACIAL ORANGE X6 VITAMINA C"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p05",
        "seccion": "belleza",
        "titulo": "Combo cuidado capilar y sonrisa",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-BEL-18",
                "nombre": "SHAMPO PROFESIONAL ROMERO 500 ML"
            },
            {
                "sku": "REF-BEL-90",
                "nombre": "ACONDICIONADOR CRECIMIENTO ROMERO"
            },
            {
                "sku": "A509",
                "nombre": "COLGATE LUMINOUS WHITE CARBON"
            }
        ],
        "sorpresa": true
    },
    {
        "id": "p06",
        "seccion": "hogar",
        "titulo": "Combo hogar práctico",
        "tipo": "combo",
        "productos": [
            {
                "sku": "DIS-PASTA",
                "nombre": "DISPENSADOR PASTA DENTAL + PORTA CEPILLOS"
            },
            {
                "sku": "50AW",
                "nombre": "ASPIRADORA PORTABLE 3 EN 1 50AW"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p09",
        "seccion": "hogar",
        "titulo": "Ventilador triple para carro",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-VENT360",
                "nombre": "VENTILADOR TRIPLE PARA CARRO"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p10",
        "seccion": "hogar",
        "titulo": "Combo relax en casa",
        "tipo": "combo",
        "productos": [
            {
                "sku": "Ref: REF-8574",
                "nombre": "LAMPARA DE ESCRITORIO ASTRONAUTA Y-598"
            },
            {
                "sku": "REF-54CBB",
                "nombre": "MASAJEADOR ELECTRICO"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p03",
        "seccion": "papeleria",
        "titulo": "Marcadores + organizador",
        "tipo": "combo",
        "productos": [
            {
                "sku": "BOG-1",
                "nombre": "X80 MARCADORES DOBLE PUNTA"
            },
            {
                "sku": "ER-337",
                "nombre": "SOPORTE DE CEPILLOS CON VENTOSA"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p11",
        "seccion": "papeleria",
        "titulo": "Combo arte y color",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-SETARTESONIC",
                "nombre": "SET ARTE METÁLICO"
            },
            {
                "sku": "REF-S21",
                "nombre": "LIBRO COLOREAR"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p08",
        "seccion": "dulceria",
        "titulo": "Combo dulcería importada",
        "tipo": "combo",
        "productos": [
            {
                "sku": "CHAM-01",
                "nombre": "CHAMOY DULCE SALADO Y PICANTE"
            },
            {
                "sku": "GOM-CONO",
                "nombre": "GOMAS CONO X60 UND"
            },
            {
                "sku": "PIT-MANGO",
                "nombre": "PITILLO ACIDO MANGO X24 UND"
            },
            {
                "sku": "PIT-ENCH",
                "nombre": "PITILLO ENCHILADO X24 UND"
            },
            {
                "sku": "CHUP-30",
                "nombre": "CHUPITOS X30 UND"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p04",
        "seccion": "moda",
        "titulo": "Conjunto deportivo de fútbol",
        "tipo": "uno",
        "productos": [
            {
                "sku": "REF-FUT-01",
                "nombre": "ASTON VILLA CONJUNTO DEPORTIVO 2026"
            },
            {
                "sku": "REF-FUT-03",
                "nombre": "ARSENAL CONJUNTO DEPORTIVO"
            }
        ]
    },
    {
        "id": "p07",
        "seccion": "moda",
        "titulo": "Combo motero",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-74802gg",
                "nombre": "BALACLAVA / PASAMONTAÑAS PROTECCION FACIAL"
            },
            {
                "sku": "REF-CHALECOMALETA",
                "nombre": "CHALECO MALETA"
            }
        ],
        "sorpresa": false
    },
    {
        "id": "p16",
        "seccion": "moda",
        "titulo": "Combo calzado",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-SD3P",
                "nombre": "SANDALIA DAMA TIPO TRES PUNTADAS"
            },
            {
                "sku": "REF-74708gg",
                "nombre": "ZAPATOS ACUATICOS PARA HOMBRE FINOS"
            }
        ],
        "sorpresa": true
    },
    {
        "id": "p17",
        "seccion": "streaming",
        "titulo": "Combo streaming + IA",
        "tipo": "combo",
        "productos": [
            {
                "sku": "REF-5",
                "nombre": "SPOTIFY ORIGINAL X30 DIAS"
            },
            {
                "sku": "REF-CLAUDE1D",
                "nombre": "CLAUDE IA PRO X1 DISPOSITIVO"
            }
        ],
        "sorpresa": true
    }
];
