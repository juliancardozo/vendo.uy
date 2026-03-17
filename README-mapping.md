Mapear fotos de `img/` a los productos

Este repositorio ahora incluye `map-images.js`, un pequeño script Node.js que sugiere y (opcionalmente) aplica mapeos entre los archivos en `img/` y los productos definidos en `index.html`.

Qué hace
- Lee `index.html` y extrae la variable `const products = [...]`.
- Lista archivos de `img/` con extensiones comunes (.jpg, .png, .svg, .webp, .gif).
- Calcula una coincidencia simple entre tokens del nombre del producto y tokens del nombre de archivo.
- Muestra las sugerencias en consola.
- Si se ejecuta con `--apply`, crea una copia de seguridad `index.html.bak` y reemplaza el array `products` en `index.html` por una versión donde cada producto tiene la propiedad `image: "img/<archivo>"` según la sugerencia.

Requisitos
- Node.js instalado (versión moderna, p.ej. 14+).

Uso
En PowerShell (Windows):

```powershell
# Solo vista previa de sugerencias
node map-images.js

# Aplicar sugerencias (crea index.html.bak)
node map-images.js --apply
```

Servidor backoffice (opcional)

Si querés una interfaz privada y la posibilidad de subir imágenes directamente desde un navegador, hay un pequeño servidor Node.js incluido (`admin-server.js`). Este servidor sirve la UI `admin.html` en `/admin`, permite subir imágenes a `img/`, listar imágenes, generar sugerencias de mapeo y aplicar el mapeo (crea `index.html.bak`).

Requisitos
- Node.js instalado (14+)

Instalación y uso (PowerShell)

```powershell
# Instalar dependencias (una sola vez)
npm install

# (Opcional) definir contraseña de administrador (por defecto: admin123)
$env:ADMIN_PASSWORD = 'miSuperClave'

# Iniciar el servidor
node admin-server.js

# Abrir en el navegador
# http://localhost:3000/admin
```

Notas de seguridad
- Este servidor está pensado para uso local o detrás de una red privada. La autenticación es por contraseña en memoria y no es adecuada para un entorno público sin más protecciones.
- Para producción usá un proxy con autenticación (p. ej. Basic Auth en nginx) o un sistema de autenticación robusto.

Notas y recomendaciones
- El mapeo es heurístico (búsqueda por tokens). Revisa las sugerencias antes de aplicar.
- Si no querés aplicar todos los mapeos automáticamente, ejecutá sin `--apply` y luego edita `index.html` manualmente con los nombres de archivo que prefieras.
- Si necesitás lógica de emparejado más avanzada (Levenshtein, aprobación interactiva), lo extiendo.

Si querés, puedo:
- Añadir una opción `--interactive` para confirmar cada asignación desde la terminal.
- Generar un fragmento JS listo para pegar con las rutas exactas en vez de sobrescribir `index.html`.
- Crear un pequeño formulario web (UI) que muestre productos y archivos y permita asignar manualmente (requiere servidor para listar `img/` o subir archivos).

Decime qué prefieres y lo implemento.