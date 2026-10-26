# Cebador

Sitio de una marca **ficticia** de mate soda en lata (mate frío con gas: pomelo, menta-limón y maracuyá). Es una pieza de portfolio hecha como ejercicio de diseño: **Cebador no es un producto real**, no se vende nada y ningún dato del sitio es verdadero (negocios, direcciones, reseñas, puntajes, precios, números de pedido). El nombre no es una marca registrada y cualquier parecido con una marca real es involuntario.

## Qué tiene

- Escena de lata con carrusel de sabores, giro al cambiar de sabor y arrastre con inercia.
- Apertura de la lata con una anilla que se desliza (o Enter/Espacio) y armador de caja de 6, 12 o 24 latas.
- Cajón "Tu caja", tabs de ciudad con lista de puntos de venta de ejemplo, newsletter con validación, barra de compra pegajosa.
- Mobile first (desde 390 px), teclado completo y `prefers-reduced-motion`.
- Sin build ni dependencias de red: HTML, CSS y JS estáticos.

## Cómo verlo

Cualquier servidor estático sirve:

```
npx serve .
# o
python -m http.server 8000
```

Abrir `index.html` directo con `file://` no alcanza: la secuencia de cuadros se carga con `fetch`.

## Cómo se hizo

- **Kit de trabajo con agentes** (SDD): requisitos congelados, pruebas por comportamiento y revisión por capturas a 390 y 1440 px.
- **Blender (Cycles)**: modelo de la lata, material de aluminio, gotas de condensación y las secuencias de cuadros (giro de 48 cuadros por sabor y apertura de 24), exportadas a WebP.
- **Modelo de imagen local**: el arte de las etiquetas (personajes y texturas) se generó en la máquina con Z-Image Turbo (cuantizado Q4_K, GGUF) a través de stable-diffusion.cpp, con Qwen3-4B-Instruct como codificador de texto. Después se retocó y compuso con scripts en Python.
- **Personaje, bombilla y mate (b4)**: el personaje se vectorizó (trazado con vtracer) y la bombilla y el mate se dibujaron a mano en SVG; Z-Image Turbo local generó solo la base. Los renders del giro salen de `assets/turn-b4`.
- **JavaScript propio** más GSAP y Lenis para animación y scroll suave. El sonido de apertura es una síntesis con WebAudio, sin archivos de audio.

## Créditos y licencias

| Parte | Origen | Licencia |
|---|---|---|
| HTML, CSS, JS (`index.html`, `*.css`, `*.js` de la raíz) | Propio | MIT (`LICENSE`) |
| Renders de la lata (`assets/turn-b4`, `assets/open`, `assets/can-*.webp`, `assets/rail`) | Propios, Blender | Derechos reservados por el autor; ver nota |
| Arte de etiqueta (dentro de los renders) | Generado con Z-Image Turbo (Tongyi-MAI), Q4_K GGUF de leejet; texto en Qwen3-4B-Instruct-2507; VAE `ae.safetensors` | Z-Image Turbo y Qwen3: Apache 2.0. VAE `ae.safetensors`: licencia sin verificar; confirmarla en la distribución usada antes de publicar. Personaje trazado con vtracer; bombilla y mate dibujados en SVG (propios) |
| Iluminación de los renders | HDRI de Poly Haven (`studio_small_09`) usado solo al renderizar; no se distribuye | CC0 |
| Fraunces (`fonts/`) | The Fraunces Project Authors | SIL OFL 1.1 (`fonts/OFL-Fraunces.txt`) |
| Schibsted Grotesk (`fonts/`) | The Schibsted-Grotesk Project Authors | SIL OFL 1.1 (`fonts/OFL-SchibstedGrotesk.txt`) |
| GSAP 3.12.5 (`vendor/gsap.min.js`) | GreenSock | Licencia estándar sin cargo de GSAP (https://gsap.com/standard-license), no es MIT |
| Lenis 1.1.18 (`vendor/lenis.min.js`) | darkroomengineering | MIT |

Nota sobre los assets: la licencia MIT cubre solo el código. El nombre y la marca "Cebador", las latas y el arte de etiqueta no se ceden para uso comercial.

## Aviso

Los puntos de venta, direcciones, reseñas y cifras son inventados para el ejercicio. Cualquier parecido con negocios reales es casual.
