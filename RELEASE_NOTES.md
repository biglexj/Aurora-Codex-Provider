# Aurora Codex Provider · 1.0.0

Proyecto independiente y portable para proporcionar imágenes de Codex a Aurora. API asíncrona, hasta cinco referencias, expresiones secuenciales, pausa/continuación y ZIP. Lanzador Windows con inicio/parada del servidor y panel de conexión.

La generación integrada usa la sesión de Codex del usuario; no pide API key. Datos y resultados permanecen en `data/` y `generated/`, fuera de Git. Validación y límites en [VALIDATION.md](VALIDATION.md).

El inicio desde Windows encuentra el ejecutable de Codex instalado aunque su carpeta no figure en PATH. Aurora muestra Aurora Codex Provider y sitúa Generar imagen encima de los proveedores.
