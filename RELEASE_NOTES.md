# Aurora Codex Provider · 1.0.0

Proyecto independiente y portable para proporcionar imágenes de Codex a Aurora. API asíncrona, hasta cinco referencias, expresiones secuenciales, pausa/continuación y ZIP. Lanzador Windows con inicio/parada del servidor y panel de conexión.

La generación integrada usa la sesión de Codex del usuario; no pide API key. Datos y resultados permanecen en `data/` y `generated/`, fuera de Git. Validación y límites en [VALIDATION.md](VALIDATION.md).

El inicio desde Windows encuentra el ejecutable de Codex instalado aunque su carpeta no figure en PATH. Aurora muestra Aurora Codex Provider y sitúa Generar imagen encima de los proveedores.

Prueba en Linux del 2026-10-02: repositorio privado en GitHub, instalación bajo el usuario autenticado y servicio de prueba en loopback. La CLI produjo un PNG real de 1024 × 1024 sin interfaz gráfica ni API key. Se documenta la ruta explícita de Codex para servicios y sesiones SSH; el acceso HTTPS desde Aurora y el arranque permanente siguen pendientes.

Formatos comprobados con dos generaciones reales y temas distintos: 16:9 a 1024 × 576 y 9:16 a 576 × 1024. Ambas completaron en Linux, se entregaron por la API y se revisaron visualmente; la exportación conserva la imagen sin recortar ni estirar.
