# Validación local · 2026-10-01

- `npm test`: siete pruebas de cola, referencias originales, interrupción e idempotencia aprobadas. El generador de esas pruebas es simulado.
- `npm run check`: aprobado. Dependencias instaladas con `npm ci`; auditoría sin vulnerabilidades.
- Lanzador Windows compilado desde `scripts/Launcher.cs`. «Detener» dejó el endpoint inaccesible; «Iniciar servidor» levantó de nuevo Node desde esta carpeta. Cuenta de Codex lista y trabajo previo conservado después del reinicio.
- `/v1/status`: nombre Aurora Codex Provider, engine codex-native, ready true. CORS localhost:4322 permitido; otro origen y cambio de configuración desde el frontend rechazados con 403. Guardar los orígenes desde el panel del proveedor funciona.
- Edición real con el adaptador de Aurora: trabajo `9321e820-85f5-4709-b3e7-96526bd2914b`, una referencia, completed, PNG de 768 × 1024. Se inspeccionó el zorro astronauta: mismo personaje/atuendo/escena y expresión sonriente. Imagen en `generated/9321e820-85f5-4709-b3e7-96526bd2914b/01_imagen.png`.
- Los intentos recientes rechazados por filtros de seguridad se conservaron como fallidos. El servicio informa ese motivo y no reintenta automáticamente.

La prueba del adaptador se ejecutó en Bun, no a través del selector de archivos del navegador. La interfaz de Outfit Changer detectó el proveedor; su subida manual y visualización final siguen pendientes. Linux, HTTPS desde el teléfono e historial remoto también están pendientes. Ningún despliegue ni publicación realizados.

- Inicio desde el lanzador de Windows: se corrigió la búsqueda del ejecutable instalado por Codex cuando Explorer no aporta su carpeta al PATH. Con PATH vacío, el resolver encontró codex.exe y login status confirmó la cuenta. Detener e Iniciar desde la ventana devolvió ready true.
