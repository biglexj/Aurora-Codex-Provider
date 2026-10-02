# Proveedor de imágenes con Codex CLI

Aurora Codex Provider inicia Codex CLI sin interfaz gráfica y usa su generación integrada con la cuenta de ChatGPT ya iniciada. No solicita ni usa claves de la API de OpenAI. La conexión está probada en Windows; Linux requiere su propia validación.

## Inicio

Requisitos: Node.js 20.9 o posterior, Codex CLI con generación integrada disponible y `codex login status` indicando sesión con ChatGPT. Usar el mismo usuario del sistema que tiene esa sesión. No iniciar sesión como otro usuario ni copiar tokens al proyecto.

```powershell
npm ci
npm start
```

Escucha exclusivamente en `127.0.0.1:54799`. Para elegir otro puerto: `node scripts/provider.mjs 54800`. `CODEX_BINARY` admite la ruta absoluta al ejecutable de Codex. Las carpetas predeterminadas `data/` y `generated/` están dentro del proyecto y funcionan aunque este se cambie de ubicación. `LOCAL_IMAGE_DATA_DIR` y `LOCAL_IMAGE_OUTPUT_DIR` permiten elegir carpetas externas.

El panel permite guardar los orígenes exactos del frontend en `data/provider-config.json`. Por defecto permite localhost y 127.0.0.1 en los puertos 4321 y 4322. `LOCAL_IMAGE_ALLOWED_ORIGINS`, separado por comas, tiene prioridad si se define. Si Aurora llama desde su backend local, CORS no interviene. No publicar este puerto directamente: para acceso desde el teléfono, Aurora autentica al usuario y llama a este servicio por loopback en el mismo servidor Linux.

## Contrato HTTP

La API es asíncrona: crear un trabajo devuelve HTTP 202 y un identificador. Consultar su estado hasta recibir `completed`. Es un contrato propio, no una sustitución idéntica de la API de imágenes de OpenAI.

| Operación | Método y ruta |
| --- | --- |
| Estado y capacidades | `GET /v1/status` |
| Subir una referencia | `POST /v1/references` |
| Generar desde texto | `POST /v1/images/generations` |
| Editar con 1–5 referencias | `POST /v1/images/edits` |
| Lote de expresiones | `POST /v1/batches` |
| Consultar trabajo | `GET /v1/jobs/{id}` |
| Historial reciente | `GET /v1/jobs` |
| Pausar después de la imagen actual | `POST /v1/jobs/{id}/pause` |
| Continuar; reintentar fallo explícitamente | `POST /v1/jobs/{id}/resume` |
| Detener después de la imagen actual | `POST /v1/jobs/{id}/cancel` |
| Descargar imágenes terminadas y manifest | `GET /v1/jobs/{id}/download` |
| Expresiones disponibles | `GET /api/presets` |

Subir la referencia con el archivo como cuerpo binario, `Content-Type: image/png`, `image/jpeg` o `image/webp`, y opcionalmente `X-File-Name` con el nombre codificado mediante `encodeURIComponent`. Límite: 12 MB por imagen estática, 32 megapíxeles. El servidor valida y guarda una copia PNG; devuelve `{reference:{id,name,width,height,url,hasAlpha}}`. La primera referencia es la base; las demás aclaran la identidad del mismo personaje. No recibe rutas arbitrarias ni descarga URLs externas.

Cada creación necesita un UUID en `Idempotency-Key` o en el campo `request_id`. Reutilizarlo para consultar/repetir una misma solicitud de transporte, sin generar de nuevo. Usar otro UUID para una nueva generación. Los identificadores se conservan tras reiniciar el servicio. No hay reintentos automáticos. Un trabajo activo impide empezar otro; pausarlo permite crear otro lote.

### Imagen o edición

Enviar JSON con `prompt` (obligatorio, máximo 2000 caracteres), `references` (solo en edición, IDs en orden), `aspect_ratio`, `resolution` y `background`. El proveedor devuelve una sola imagen; las ediciones obedecen el prompt libre y conservan lo que este no pida cambiar.

### Lote de expresiones

```json
{
  "name": "Ely · expresiones",
  "references": ["ID_DE_LA_IMAGEN_BASE", "ID_DE_REFERENCIA_ADICIONAL"],
  "expressions": ["alegre", "triste", "enojada", "sorprendida", "pensativa", "preocupada", "curiosa", "seria", "sonrojada", "riendo"],
  "count": 10,
  "aspect_ratio": "3:4",
  "resolution": "1024",
  "background": "original",
  "prompt": "Conservar el encuadre y el outfit de la imagen base."
}
```

`count`: 1–30. Las expresiones se recorren en el orden indicado y se repiten si se piden más imágenes que expresiones. Cada llamada incluye las referencias originales, no la imagen recién generada. También están disponibles `esceptica` y `confundida`. Los presets están en este proveedor de prueba; al integrarlo en Aurora, sus presets existentes deben seguir siendo la fuente de instrucciones.

Proporciones: `1:1`, `16:9`, `9:16`, `3:4`, `4:3`. Resolución de **exportación**: lado mayor `1024` o `2048`. Se pide esa composición al generador y después se ajusta a las dimensiones de salida exactas, sin recortar ni estirar: se añade margen transparente cuando hace falta. No se promete generación nativa de 2K; el manifest informa las dimensiones nativas y si se normalizó el archivo.

Fondo: `original` conserva el de la base; `transparent` solicita alfa real. Si se solicitó transparencia y el generador devolvió un fondo opaco, el lote se detiene para revisión. Una referencia con alfa también pide conservarlo. La fidelidad de identidad y outfit necesita revisión visual: las restricciones del prompt no constituyen una verificación automática de semejanza.

### Respuesta de estado

```json
{
  "id": "UUID_DEL_TRABAJO",
  "status": "running",
  "progress": {"completed": 1, "total": 10},
  "outputs": [{"index": 1, "expression": "Alegre", "url": "/images/UUID_DEL_TRABAJO/01_alegre.png", "width": 768, "height": 1024, "filename": "01_alegre.png"}],
  "error": null,
  "batch": {"items": []}
}
```

Estados: `queued`, `running`, `pausing`, `paused`, `cancelling`, `cancelled`, `failed`, `completed`. Al pausar o detener, la generación actual termina; no se inicia la siguiente. Al reiniciar, un trabajo interrumpido queda pausado y no se vuelve a generar sin una acción explícita. Reintentar una imagen interrumpida puede gastar otra generación.

## Adaptador JavaScript

`client.mjs` se puede importar en un cliente web o backend Node.js. Entrega URLs absolutas en `outputs` y admite progreso y cancelación de la espera con `AbortSignal`. Cancelar la espera no cancela el trabajo: usar `control(id,'cancel')` para detener el lote después de la imagen en curso.

```js
import {LocalImageProvider} from './client.mjs';

const provider = new LocalImageProvider('http://127.0.0.1:54799');
const base = await provider.upload(fileInput.files[0]);
const job = await provider.create({
  prompt: 'Cambiar solo la expresión a alegre. Conservar identidad, outfit y estilo.',
  references: [base],
  aspectRatio: '3:4',
  resolution: '1024'
});
const result = await provider.wait(job.id, {
  onProgress(job) { console.log(job.progress); }
});
preview.src = result.outputs[0].url;
```

## Encaje en Aurora

Inspección del código actual: Outfit Changer envía a `/api/creador/outfit-changer/generate`; esa ruta Astro resuelve el modelo, construye el prompt, llama al gateway Rust `/api/v1/ai/image`, sube el resultado a storage y registra la creación. `ImageService` exige una clave antes de despachar al proveedor. Añadir `codex-local` necesita una ruta de despacho sin clave de OpenAI y un adaptador del contrato asíncrono; cambiar solo la URL no basta.

Diseño para Linux: teléfono → frontend de Aurora → API de Aurora por HTTPS y con sesión de usuario → proveedor por `127.0.0.1` → Codex CLI del usuario ya autenticado → imagen → storage e historial existentes. Mantener `api.biglexj.com/api/v1/` como API pública. El servicio de Codex y su sesión permanecen privados. El backend Rust deberá admitir trabajos largos y progreso; su cliente actual de proveedores tiene un timeout de 60 segundos, que no cubre todas las generaciones.

Aurora tiene un adaptador local disponible únicamente en desarrollo: Outfit Changer ofrece el proveedor incluso si el servicio está apagado y muestra «Aurora Codex Provider». Envía referencias, crea la edición y espera su resultado. El catálogo remoto y el almacenamiento no se modificaron; las imágenes locales aún no se sincronizan con el historial de Aurora. La subida desde el navegador requiere validación manual porque la prueba automatizada del selector de archivo se bloqueó. La sesión en Linux la debe usar el mismo usuario que ya ejecuta Codex; no hace falta interfaz gráfica. Falta probar una generación real allí y luego el recorrido desde el teléfono a Aurora.

Documentación oficial: [generación integrada](https://learn.chatgpt.com/docs/image-generation), [CLI en Linux](https://learn.chatgpt.com/docs/cli), [autenticación](https://learn.chatgpt.com/docs/auth).
