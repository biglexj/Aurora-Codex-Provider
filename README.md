# Aurora Codex Provider

Proveedor personal de imágenes para Aurora. Usa Codex CLI con la cuenta de ChatGPT iniciada en este equipo. No necesita la interfaz de Codex abierta ni una clave de la API de OpenAI.

El proyecto permanece privado. La integración como submódulo de Aurora y la preparación de una posible publicación open source están previstas en [ROADMAP.md](ROADMAP.md).

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

Usar Node.js 20.9 o posterior y el mismo usuario que tiene la sesión de Codex. El repositorio es privado: Git debe tener acceso a GitHub en ese servidor.

```bash
git clone https://github.com/biglexj/Aurora-Codex-Provider.git
cd Aurora-Codex-Provider
npm ci
CODEX_BINARY="$HOME/.local/bin/codex" npm start
```

La ruta de `CODEX_BINARY` debe coincidir con `command -v codex` en la terminal donde funciona Codex. Una sesión SSH o un servicio pueden tener un PATH distinto al de la terminal interactiva.

La plantilla `linux-service.example` permite ejecutar un servicio sin interfaz. Para comprobar el endpoint desde el propio servidor: `curl http://127.0.0.1:54799/v1/status`. `ready: true` confirma la sesión; la prueba funcional exige que un trabajo termine con una imagen real.

Para el teléfono, el backend autenticado de Aurora recibe HTTPS y llama al proveedor por loopback. Esa conexión pública y el arranque permanente se configuran por separado; la prueba local no los habilita.

### Instalación de prueba en el servidor de Biglex

Proyecto: `/home/biglexj/Proyectos/Aurora-Codex-Provider`. Servicio de usuario temporal: `aurora-codex-provider-test.service`, con Node `/usr/bin/node` y Codex `/home/biglexj/.local/bin/codex`. La generación real de una imagen completó correctamente; ver [VALIDATION.md](VALIDATION.md).

```bash
systemctl --user status aurora-codex-provider-test.service
curl http://127.0.0.1:54799/v1/status
```

El servicio de prueba permanece activo y no tiene arranque automático al reiniciar. Para detenerlo cuando no haya trabajos en curso: `systemctl --user stop aurora-codex-provider-test.service`.

### Servicio permanente en Linux · 04/10/2026

La prueba temporal anterior se sustituyó por `codex-image-provider.service`, habilitado como servicio de usuario con `Restart=on-failure` y `loginctl enable-linger biglexj`. Usa las rutas absolutas de Node y Codex, conserva `data/` y `generated/` y escucha únicamente en `127.0.0.1:54799`. No depende de mantener SSH o una terminal abiertos.

Para otro servidor, adaptar `linux-service.example`, guardarlo en `~/.config/systemd/user/codex-image-provider.service` y ejecutar:

```bash
systemctl --user daemon-reload
systemctl --user enable --now codex-image-provider.service
loginctl enable-linger "$USER"
systemctl --user status codex-image-provider.service
curl http://127.0.0.1:54799/v1/status
```

La activación de linger puede requerir permisos de administrador según el servidor. En el entorno de Biglex quedó `Linger=yes` y el proveedor respondió `ready=true`; una nueva solicitud del usuario completó y se entregó por el puente HTTPS de Aurora. No se reinició la máquina para probar este cambio.
