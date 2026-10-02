---
trigger: always_on
---

# Aurora Codex Provider

Proveedor personal local de imágenes para Aurora. Fuente compartida: `../Docs/README.md`.

- Servidor Node.js en loopback; Windows y Linux usan la CLI de Codex del mismo usuario autenticado con ChatGPT.
- No leer, copiar, mostrar ni guardar tokens de Codex. No sustituir la generación integrada por llamadas con API key.
- Una imagen a la vez; sin reintentos automáticos. Cada expresión usa las referencias originales del personaje.
- `data/`, `generated/`, credenciales y dependencias quedan fuera de Git. Conservar las imágenes existentes.
- No publicar el puerto ni desplegar sin petición explícita. En Linux el backend autenticado de Aurora es la entrada HTTPS.
- Distinguir pruebas de cola de generación real y de validación visual. No afirmar cuotas idénticas a las imágenes de ChatGPT.
- Ejecutar `npm test` y `npm run check` para cambios del servidor. Registrar cambios locales; no hacer push sin autorización.
