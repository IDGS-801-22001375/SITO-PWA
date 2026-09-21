# SITO — Angular + Node.js + PWA

## Ejecutar desde cero

Requisitos: Node 22.12+ de la rama 22 o Node 24, npm y Chrome/Edge. Abre una terminal dentro de `04-sito` (la carpeta que contiene package.json):

```bash
npm ci
npm run build
npm start
```

Abre **http://localhost:3104**. La API está en **http://localhost:3104/api/avisos**. Mantén esa terminal abierta. Ctrl+C detiene el servidor.

Si conservaste el `dist` incluido, puedes ejecutar directamente `npm start` sin instalar paquetes: Node no tiene dependencias externas. Para modificar y recompilar Angular sí debes ejecutar `npm ci`.

## Paso a paso: qué construí, cómo y por qué

1. **Usé la captura entregada como referencia visual.** Reproduje la cabecera SITO, menú lateral, buscador de módulos y cuadrícula de siete avisos. El sitio público de referencia es https://sito.utleon.edu.mx/.
2. **Creé una versión académica identificada como tal.** Los carteles son recreaciones HTML/CSS; no son las imágenes originales ni información oficial vigente. No se copió una sesión de usuario ni se solicitó contraseña.
3. **Definí avisos en `datos.json`.** Conservan títulos visibles de la referencia, tipo, color y una descripción ilustrativa.
4. **Expuse `GET /api/avisos`.** Angular consulta esta API propia; no se conecta a sistemas internos de la universidad.
5. **Construí el menú.** Se filtra por texto. Al desplegar una sección aparece una indicación de demostración; no pretende ejecutar trámites.
6. **Añadí el detalle de aviso con `dialog`.** Abre una ficha informativa y un enlace explícito al portal oficial. Los tutoriales no reproducen video: el alcance es la pantalla principal.
7. **Adapté el diseño al teléfono.** La barra lateral se abre con el botón de menú; las tarjetas pasan de cuatro columnas a una según el ancho.
8. **Configuré la PWA.** La pantalla y avisos consultados funcionan offline. El enlace al portal oficial sí necesita conexión.

### Qué demostrar

Busca “BECAS”, despliega el módulo y abre una tarjeta. Reduce el ancho, abre el menú móvil y prueba de nuevo. Activa offline y recarga: los avisos guardados permanecen.

## Archivos que convierten Angular en PWA

| Archivo | Qué se añadió y por qué |
|---|---|
| `package.json` y `package-lock.json` | Dependencia `@angular/service-worker`, de la misma versión que Angular. El lock fija las dependencias para repetir la instalación. |
| `angular.json` | En `build.configurations.production`, `"serviceWorker": "ngsw-config.json"`. Hace que la compilación genere el worker y su inventario de archivos. `assets` copia `public`. |
| `src/app/app.config.ts` | `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerImmediately' })`. Registra el worker en producción. |
| `ngsw-config.json` | `assetGroups` descarga interfaz, imágenes e iconos al instalar. `dataGroups` conserva respuestas GET de `/api/**`: primero red, luego caché tras 3 segundos, máximo 50 entradas y 7 días. |
| `public/manifest.webmanifest` | Nombre, iconos, colores, idioma, inicio y modo `standalone` para la instalación. |
| `public/iconos/icono-192.png` y `icono-512.png` | Iconos locales con margen seguro para la aplicación instalada. |
| `src/index.html` | Enlace al manifest, color del navegador e icono de Apple. |

No escribas ni modifiques `dist/aplicacion/browser/ngsw-worker.js` ni `ngsw.json`: Angular los genera. Tampoco es necesario crear un `service-worker.js` propio. `src/main.ts` inicia Angular con `configuracion`; sin esos proveedores no se registra el worker.

### Si empiezas desde otro proyecto Angular

1. Revisa la versión con `npx ng version`.
2. Ejecuta `npx ng add @angular/pwa@20` si ese proyecto utiliza Angular 20. Para otra versión, usa su mismo número mayor.
3. Revisa los archivos de la tabla. El comando puede usar nombres diferentes según la versión.
4. Personaliza el manifest y sus iconos.
5. Añade las reglas de la API a `dataGroups`, como en este proyecto.
6. Compila y sirve el resultado. En estos proyectos ya está configurado: **no ejecutes de nuevo `ng add`**.

## Cómo se conectan Angular y Node

`HttpClient` solicita `/api/...`. Node responde con JSON desde `datos.json`. El mismo servidor también sirve el Angular compilado; por eso no hacen falta CORS, otra dirección de API ni Express. `servidor.cjs` usa únicamente `http`, `fs` y `path`, incluidos en Node. Solo admite GET/HEAD, devuelve 404 para recursos inexistentes y sirve el index en rutas de interfaz.

`src/app/app.component.ts` contiene la lógica, `app.component.html` la pantalla y `src/styles.css` el diseño adaptable. Se emplean `signal` y `computed` para actualizar la vista de forma sencilla. `app.config.ts` activa detección sin Zone.js y HttpClient. No hay controladores, repositorios, autenticación, capas ni base de datos.

Las palabras del framework (`import`, `Component`, `signal`, etc.) no pueden traducirse. Las variables propias, métodos, comentarios y textos se escribieron en español, sin acentos en identificadores cuando resulta conveniente.

## Prueba offline paso a paso

1. Ejecuta la compilación de producción y `npm start`.
2. Abre la dirección **localhost** indicada arriba con Chrome o Edge.
3. Espera a que carguen los datos. En F12 → Application/Aplicación → Service Workers, comprueba que `ngsw-worker.js` está activado.
4. Recarga una vez con conexión para que la página quede bajo control del worker y las solicitudes GET alimenten su caché.
5. En F12 → Network/Red, selecciona Offline/Sin conexión. Recarga la página.
6. Comprueba que aparecen interfaz, iconos, imágenes y datos guardados. Prueba las interacciones locales descritas para esta app.
7. Devuelve Network a Online. Para una demostración más clara, también puedes detener Node después de la primera carga y recargar.

Una PWA no ejecuta Node sin internet: el backend sigue siendo un servidor. Se guardan archivos y datos en el dispositivo. Además del caché del worker, guardamos la última consulta en localStorage para que la primera visita, antes de quedar controlada por el worker, también pueda conservar datos. No existe sincronización de escrituras ni cola de pedidos.

La primera visita requiere conexión al servidor y esperar la instalación. Borrar los datos del navegador elimina caché, tareas y carrito. La API tiene caché de 7 días; la copia local dura hasta que se borre o se reemplace con una nueva consulta. Los datos locales pueden estar desactualizados.

## Instalar y probar en el teléfono

En Chrome/Edge de escritorio usa el botón de instalación de la barra o el menú del navegador cuando esté disponible. En Android usa “Instalar aplicación” o “Añadir a pantalla de inicio”. En Safari de iPhone usa Compartir → Añadir a pantalla de inicio. El menú depende del navegador.

`http://localhost` funciona para desarrollo. **Una IP local por HTTP desde el teléfono no equivale a localhost:** normalmente no activa el service worker. Para probar en otro dispositivo publica cada proyecto en un servidor HTTPS capaz de ejecutar Node. `PORT` permite cambiar el puerto en el hosting. Cada app debe tener su propio origen/dominio o puerto; estas configuraciones están diseñadas para la raíz `/`, no para alojar las cuatro bajo subcarpetas del mismo dominio.

## Desarrollo y cambios

- Cambia contenido en `datos.json`; reinicia Node para releerlo.
- Cambia diseño en `src/styles.css` y `src/app/app.component.html`.
- Cambia comportamiento en `src/app/app.component.ts`.
- Para editar con recarga rápida: deja `npm start` en una terminal y ejecuta `npm run dev -- --port 4201` en otra. `proxy.conf.json` dirige `/api` a Node. Puedes elegir 4202, 4203 o 4204 para otras apps. Este modo de desarrollo no activa la PWA.
- Para comprobar cambios PWA: detén Node, ejecuta `npm run build` y vuelve a iniciar. Cierra las pestañas antiguas y abre otra vez. Durante desarrollo puedes usar Application → Clear storage para retirar una versión vieja, sabiendo que también borra datos locales.

## Solución de problemas

- **Puerto ocupado:** cierra el servidor anterior con Ctrl+C. Si cambias PORT, actualiza también `proxy.conf.json` para desarrollo.
- **“Primero ejecuta npm run build”:** falta la carpeta `dist`.
- **No aparecen datos:** abre `/api/signos`, `/api/productos`, `/api/materias` o `/api/avisos`, según la app. Revisa que Node esté iniciado.
- **No funciona offline:** usa la versión compilada, espera la activación y comprueba localhost/HTTPS.
- **Cambios invisibles:** es posible que el worker mantenga una versión anterior; cierra todas sus pestañas y vuelve a abrir.
- **Instalación de dependencias:** usa Node 22.12 o superior de la rama 22, o Node 24. Este proyecto fue probado con Node 24.19.0. No necesita Angular CLI global.

## Referencias técnicas

- [PWA y service workers en Angular](https://angular.dev/ecosystem/service-workers/getting-started)
- [Configuración del caché](https://angular.dev/ecosystem/service-workers/config)
- [Compatibilidad de versiones](https://angular.dev/reference/versions)
- [Servidor HTTP de Node.js](https://nodejs.org/api/http.html)
