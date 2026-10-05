# Validación local · 2026-10-01

- `npm test`: siete pruebas de cola, referencias originales, interrupción e idempotencia aprobadas. El generador de esas pruebas es simulado.
- `npm run check`: aprobado. Dependencias instaladas con `npm ci`; auditoría sin vulnerabilidades.
- Lanzador Windows compilado desde `scripts/Launcher.cs`. «Detener» dejó el endpoint inaccesible; «Iniciar servidor» levantó de nuevo Node desde esta carpeta. Cuenta de Codex lista y trabajo previo conservado después del reinicio.
- `/v1/status`: nombre Aurora Codex Provider, engine codex-native, ready true. CORS localhost:4322 permitido; otro origen y cambio de configuración desde el frontend rechazados con 403. Guardar los orígenes desde el panel del proveedor funciona.
- Edición real con el adaptador de Aurora: trabajo `9321e820-85f5-4709-b3e7-96526bd2914b`, una referencia, completed, PNG de 768 × 1024. Se inspeccionó el zorro astronauta: mismo personaje/atuendo/escena y expresión sonriente. Imagen en `generated/9321e820-85f5-4709-b3e7-96526bd2914b/01_imagen.png`.
- Los intentos recientes rechazados por filtros de seguridad se conservaron como fallidos. El servicio informa ese motivo y no reintenta automáticamente.

La prueba del adaptador se ejecutó en Bun, no a través del selector de archivos del navegador. La interfaz de Outfit Changer detectó el proveedor; su subida manual y visualización final siguen pendientes. Linux, HTTPS desde el teléfono e historial remoto también están pendientes. Ningún despliegue ni publicación realizados.

- Inicio desde el lanzador de Windows: se corrigió la búsqueda del ejecutable instalado por Codex cuando Explorer no aporta su carpeta al PATH. Con PATH vacío, el resolver encontró codex.exe y login status confirmó la cuenta. Detener e Iniciar desde la ventana devolvió ready true.

## Prueba real en Linux · 2026-10-02

- Autorización: Biglex solicita subir el proveedor a GitHub y probarlo directamente en su servidor mediante el alias `server`. Se creó `biglexj/Aurora-Codex-Provider` como repositorio privado y se clonó en `/home/biglexj/Proyectos/Aurora-Codex-Provider`, sin trasladar credenciales ni resultados de Windows.
- Entorno comprobado: Node v26.10.0, npm 12.2.0, Codex CLI 0.160.0 y sesión activa del mismo usuario. La terminal interactiva encuentra Codex en `/home/biglexj/.local/bin/codex`; el servicio establece CODEX_BINARY explícitamente porque el PATH de SSH no lo incluía.
- `npm ci`, `npm run check` y siete pruebas aprobadas en Linux; auditoría de dependencias sin vulnerabilidades. Código probado: `b512255`.
- Servicio temporal de usuario `aurora-codex-provider-test.service`, iniciado con systemd-run. Endpoint exclusivamente en `127.0.0.1:54799`; GET /v1/status devuelve ready true y engine codex-native.
- POST /v1/images/generations aceptado con HTTP 202. Trabajo `aef91f1d-43b5-4f5f-a693-1622dc06a842`: completed, progreso 1/1, sin error. Resultado `generated/aef91f1d-43b5-4f5f-a693-1622dc06a842/01_imagen.png`, 1024 × 1024, 2.731.983 bytes. La API devuelve HTTP 200, image/png y firma PNG válida. Copia de evidencia revisada visualmente en el chat: `outputs/aurora-codex-linux.png`; zorro astronauta, Luna, Tierra y estrellas, sin texto.
- El servicio de prueba queda activo, sin arranque automático al reiniciar. No se abre el puerto público ni se modifica el backend de Aurora. Permanecen pendientes las ediciones con referencias en Linux, la integración autenticada de Aurora por HTTPS, el teléfono y el almacenamiento remoto.

## Formatos horizontal y vertical en Linux · 2026-10-02

Biglex solicita otra temática y acepta una imagen horizontal y otra vertical como prueba. Se generaron exactamente dos imágenes nuevas, consecutivamente y sin reintentos, mediante /v1/images/generations en el servicio Linux existente.

| Formato | Tema | Trabajo | Salida PNG | Tamaño nativo |
| --- | --- | --- | --- | --- |
| 16:9 | Pueblo costero mediterráneo al amanecer, fotografía cinematográfica | dad61a7e-f470-45bf-b503-1c1fd8bed41a | 1024 × 576 | 1672 × 941 |
| 9:16 | Torre de cristal con jardín botánico, ilustración de fantasía | bc7cc840-2b74-4435-a411-7677b4ad856b | 576 × 1024 | 941 × 1672 |

Ambos trabajos completed, progreso 1/1 y error null. Ambas imágenes devueltas por la API con HTTP 200 y MIME image/png; dimensiones y firma PNG contrastadas con los bytes reales. La exportación normaliza el tamaño nativo con fit contain, sin recorte ni deformación. Revisión visual de los PNG exportados: paisaje horizontal y torre completa en vertical, sin texto ni marcos visibles. No se generaron imágenes de 3:4 o 4:3 en esta prueba.

Imágenes conservadas en generated/{id}/01_imagen.png del servidor. Copias de evidencia en el chat: outputs/aurora-linux-horizontal-16x9.png y outputs/aurora-linux-vertical-9x16.png. Manifest de verificación con HTTP, tamaños y SHA-256: data/ratio-test-dad61a7e-f470-45bf-b503-1c1fd8bed41a.json (fuera de Git), copiado a outputs/aurora-linux-format-test.json del chat.

## Límite de prompt de Aurora · 2026-10-05

A solicitud de Biglex, cola, entrada nativa y API admiten 20 000 puntos de código Unicode; se rechaza 20 001 antes de generar. Cuerpo JSON de 128 KiB y capacidad max_prompt_chars publicada. No se recorta ni resume automáticamente. El contrato de la API GPT Image de 32 000 caracteres no prueba por sí solo el límite del imagegen integrado de Codex.

npm test: 12 pruebas pasan, incluidas frontera, emojis, cuerpo JSON con escapes y persistencia íntegra de instrucciones antes del generador simulado. npm run check: correcto. Sin imagen real nueva ni reinicio/despliegue de servicios. API.md y README.md actualizados. Git diff --check correcto; push autorizado por el usuario, pendiente de verificación remota al escribir esta nota.
