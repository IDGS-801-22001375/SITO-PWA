// API propia y archivos de Angular en un solo servidor.
// Sin Express ni base de datos.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const datos = require('./datos.json');

const puerto = Number(process.env.PORT || 3104);
const carpeta = path.join(__dirname, 'dist/aplicacion/browser');

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http
  .createServer((peticion, respuesta) => {
    let ruta;

    try {
      ruta = decodeURIComponent(
        new URL(peticion.url, 'http://localhost').pathname
      );
    } catch {
      respuesta.writeHead(400);

      return respuesta.end('Ruta incorrecta');
    }

    if (!['GET', 'HEAD'].includes(peticion.method)) {
      respuesta.writeHead(405, {
        Allow: 'GET, HEAD'
      });

      return respuesta.end('Método no permitido');
    }

    if (ruta.startsWith('/api/')) {
      const recurso = ruta.slice(5);
      const contenido = datos[recurso];

      respuesta.writeHead(contenido ? 200 : 404, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });

      return respuesta.end(
        peticion.method === 'HEAD'
          ? ''
          : JSON.stringify(
              contenido || {
                error: 'Recurso no encontrado'
              }
            )
      );
    }

    let archivo = path.resolve(carpeta, '.' + ruta);

    if (
      archivo !== carpeta &&
      !archivo.startsWith(carpeta + path.sep)
    ) {
      respuesta.writeHead(403);

      return respuesta.end();
    }

    if (ruta === '/') {
      archivo = path.join(carpeta, 'index.html');
    }

    if (
      !fs.existsSync(archivo) ||
      !fs.statSync(archivo).isFile()
    ) {
      if (path.extname(ruta)) {
        respuesta.writeHead(404);

        return respuesta.end('Archivo no encontrado');
      }

      archivo = path.join(carpeta, 'index.html');
    }

    fs.readFile(archivo, (error, contenido) => {
      if (error) {
        respuesta.writeHead(503);

        return respuesta.end('Primero ejecuta npm run build');
      }

      respuesta.writeHead(200, {
        'Content-Type':
          tipos[path.extname(archivo)] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });

      respuesta.end(
        peticion.method === 'HEAD' ? '' : contenido
      );
    });
  })
  .listen(puerto, () => {
    console.log(`SITO: http://localhost:${puerto}`);
  });