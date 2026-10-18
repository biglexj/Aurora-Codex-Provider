---
trigger: always_on
---

# Aurora Codex Provider

## Documentación Core — entrada compartida

Consultar primero [Documentación Core](../../../Docs/README.md) y seleccionar solo los módulos pertinentes. Los estándares compartidos se mantienen allí; este archivo conserva el alcance y los contratos específicos del proyecto.

- [Calidad y entrega proporcionales](../../../Docs/global/quality/quality-baseline.md): build para ajustes visuales pequeños; pruebas pertinentes para elementos, lógica o páginas nuevos y cambios grandes; revisión acotada para documentación.
- [Procesos según alcance](../../../Docs/global/documentation/process-workflow.md): no añadir fases, archivos ni nuevas aprobaciones por rutina a ajustes pequeños ya autorizados.
- [Diseño común](../../../Docs/global/design/design_system.md): contenido preciso, espacio útil, mínimo scroll innecesario, fondo global y presets compartidos, conservando la identidad del producto.
- [Diagnósticos reutilizables](../../../Docs/troubleshooting/README.md) y [promoción a Core](../../../Docs/global/documentation/core-promotion-workflow.md): documentar en Core los fallos confirmados o aprendizajes generalizables y enlazarlos desde el proyecto; mantener locales los detalles exclusivos.

En estos criterios comunes, aplicar las bases vigentes enlazadas en lugar de copias históricas de este archivo. Respetar la dirección actual de Biglex y los contratos específicos del producto; ante una contradicción, comprobar la implementación vigente y resolverla explícitamente. Las skills generales importadas son apoyo técnico, no una autoridad para redefinir estas reglas.

Proveedor personal local de imágenes para Aurora. Fuente compartida: [Docs](../../../Docs/README.md).

- Servidor Node.js en loopback; Windows y Linux usan la CLI de Codex del mismo usuario autenticado con ChatGPT.
- No leer, copiar, mostrar ni guardar tokens de Codex. No sustituir la generación integrada por llamadas con API key.
- Una imagen a la vez; sin reintentos automáticos. Cada expresión usa las referencias originales del personaje.
- `data/`, `generated/`, credenciales y dependencias quedan fuera de Git. Conservar las imágenes existentes.
- No publicar el puerto ni desplegar sin petición explícita. En Linux el backend autenticado de Aurora es la entrada HTTPS.
- Distinguir pruebas de cola de generación real y de validación visual. No afirmar cuotas idénticas a las imágenes de ChatGPT.
- Ejecutar `npm test` y `npm run check` para cambios del servidor. Registrar cambios locales; no hacer push sin autorización.
