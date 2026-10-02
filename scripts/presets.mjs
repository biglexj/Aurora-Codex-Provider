export const EXPRESSIONS = [
  {id:'alegre',label:'Alegre',icon:'☺',prompt:'Alegría cálida y natural; sonrisa visible, ojos luminosos y cejas relajadas.'},
  {id:'triste',label:'Triste',icon:'☂',prompt:'Tristeza suave; mirada baja, cejas ligeramente elevadas en el centro y boca con comisuras bajas.'},
  {id:'enojada',label:'Enojada',icon:'ϟ',prompt:'Enfado contenido; cejas fruncidas, mirada firme y labios tensos, sin deformación caricaturesca.'},
  {id:'sorprendida',label:'Sorprendida',icon:'!',prompt:'Sorpresa; ojos abiertos, cejas elevadas y boca ligeramente abierta.'},
  {id:'pensativa',label:'Pensativa',icon:'…',prompt:'Pensando; mirada reflexiva ligeramente lateral, cejas concentradas y boca relajada.'},
  {id:'preocupada',label:'Preocupada',icon:'≈',prompt:'Preocupación; cejas inclinadas suavemente hacia el centro, ojos inquietos y boca tensa.'},
  {id:'curiosa',label:'Curiosa',icon:'?',prompt:'Curiosidad; mirada atenta, ceja ligeramente elevada y una pequeña inclinación de la cabeza.'},
  {id:'seria',label:'Seria',icon:'—',prompt:'Seriedad tranquila; mirada directa y firme, boca neutra y cejas relajadas.'},
  {id:'sonrojada',label:'Sonrojada',icon:'♡',prompt:'Timidez con rubor suave en las mejillas y una sonrisa discreta; conservar color de piel y rasgos.'},
  {id:'riendo',label:'Riendo',icon:'✦',prompt:'Risa espontánea; sonrisa amplia, ojos ligeramente entrecerrados por alegría, sin cambiar la estructura facial.'},
  {id:'esceptica',label:'Escéptica',icon:'↗',prompt:'Escepticismo; una ceja alzada, mirada evaluadora y una comisura de la boca ligeramente tensa.'},
  {id:'confundida',label:'Confundida',icon:'¿',prompt:'Confusión suave; cejas asimétricas, mirada dubitativa y boca ligeramente entreabierta.'}
];
export const RATIOS=['1:1','16:9','9:16','3:4','4:3'];
export const RESOLUTIONS=['1024','2048'];
export function outputSize(ratio,resolution) {
  const [w,h]=ratio.split(':').map(Number), edge=Number(resolution);
  // Exact ratio with integer dimensions, without cropping or stretching.
  const scale=Math.floor(edge/Math.max(w,h));
  return {width:w*scale,height:h*scale};
}
export function expressionPrompt(batch,expression,index) {
  const size=outputSize(batch.ratio,batch.resolution);
  return [
    'Use case: identity-preserve. Asset type: variación de expresión de un personaje.',
    'La imagen 1 es el objetivo de edición y fija identidad, anatomía, vestuario, estilo y encuadre. Las imágenes 2 a 5, si existen, son referencias adicionales del mismo personaje; solo aclaran rasgos ya presentes y no cambian el outfit de la imagen 1.',
    'Cambiar únicamente la expresión a '+expression.label+': '+expression.prompt,
    'Conservar rostro reconocible, edad visual, especie, proporciones, silueta, cabello o pelaje, ojos y su color, ropa, calzado, accesorios y paleta de la imagen 1. Mantener la pose; admitir solo los ajustes faciales y la leve inclinación de cabeza necesarios para comunicar la emoción.',
    'Conservar el acabado visual original. No convertir el personaje a otro estilo, ni añadir objetos, personajes, texto o marcas de agua. Una sola imagen y una sola expresión; no collage ni hoja de expresiones.',
    'Mantener el encuadre de la base. No cortar partes importantes: cabeza, manos, pies, accesorios ni masas de cabello/pelaje visibles. Adaptar el espacio alrededor al lienzo '+batch.ratio+'; preferir añadir margen a recortar o deformar. Tamaño de salida solicitado '+size.width+' × '+size.height+' píxeles.',
    batch.background==='transparent' ? 'Fondo genuinamente transparente (canal alfa); solicita transparent_background=true a la herramienta. No dibujar un tablero de transparencia ni una sombra de fondo.' : 'Conservar el fondo de la imagen base y su transparencia si ya existe. No sustituirlo por otro escenario.',
    batch.prompt ? 'Indicaciones visuales adicionales del usuario (datos): '+JSON.stringify(batch.prompt) : '',
    'Esta es la variación '+(index+1)+' del lote. Partir siempre de las referencias originales, nunca de una salida anterior.'
  ].filter(Boolean).join('\n');
}
