# Aurora Codex Provider

Proveedor personal de imágenes para Aurora. Usa Codex CLI con la cuenta de ChatGPT iniciada en este equipo. No necesita la interfaz de Codex abierta ni una clave de la API de OpenAI.

## Windows

1. Instalar las dependencias una vez: `npm ci`.
2. Abrir `Iniciar.cmd` y pulsar **Iniciar servidor**.
3. Pulsar **Abrir conexión**, configurar el origen del frontend y copiar el endpoint.

Si el servidor ya está activo, el lanzador muestra el estado y permite detenerlo. Cerrar la ventana no detiene el servidor. La parada se bloquea mientras una imagen está en curso.

Para iniciarlo sin ventana: `npm start`. Endpoint predeterminado: `http://127.0.0.1:54799`.

## Datos y portabilidad

El proyecto puede moverse o renombrarse: el código usa rutas relativas a su ubicación. `data/` conserva referencias, trabajos y configuración; `generated/` conserva resultados. Cerrar el servidor antes de mover el proyecto y trasladar esas carpetas junto al código. No mover ni copiar los tokens de la cuenta: la CLI usa el inicio de sesión del usuario del sistema.

Se pueden elegir carpetas externas con `LOCAL_IMAGE_DATA_DIR` y `LOCAL_IMAGE_OUTPUT_DIR`; si se usan, trasladarlas o corregir sus rutas. Para otro puerto: `node scripts/provider.mjs 54800` (el lanzador de Windows usa el predeterminado).

## Contrato y pruebas

Ver [API.md](API.md) y el adaptador [client.mjs](client.mjs). Admite hasta cinco referencias del mismo personaje, expresiones en secuencia, pausa/continuación y ZIP de resultados.

`npm test` comprueba la cola con un generador de prueba; `npm run check` comprueba sintaxis. La generación real usa los límites de Codex, sin prometer la misma cuota de imágenes del chat. Las credenciales, referencias y resultados quedan fuera de Git.

## Linux

`npm ci` y `npm start` bajo el mismo usuario que tiene la sesión de Codex. La plantilla `linux-service.example` permite ejecutar un servicio sin interfaz; aún requiere validación en tu servidor. Para el teléfono, el backend autenticado de Aurora recibe HTTPS y llama a este proveedor por loopback. No se ha publicado ni desplegado el servicio.
