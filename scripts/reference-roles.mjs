const roles = new Set(['base','identity','outfit','pose','style','background']);
export function validateReferenceRoles(input, count, kind) {
  if (input === undefined) return undefined;
  if (!Array.isArray(input) || input.length !== count || input.some(role => !roles.has(role)) || input.filter(role=>role==='base').length > 1 || (input.includes('base') && input[0] !== 'base')) throw new Error('Las funciones de referencia deben corresponder a las imágenes; la base, si existe, va primero.');
  if (kind === 'expressions') throw new Error('Los lotes de expresiones conservan las referencias de identidad originales.');
  return [...input];
}
export function referenceGuide(referenceRoles) {
  if (!referenceRoles) return 'La primera imagen es el objetivo de edición y las demás aclaran su identidad.';
  const meaning = {base:'objetivo de edición; conserva los aspectos no solicitados', identity:'solo identidad y rasgos', outfit:'solo ropa y accesorios; no identidad', pose:'solo postura y articulaciones; no rostro, ropa, encuadre ni aspecto del maniquí', style:'solo acabado visual; no identidad ni vestimenta', background:'solo escenario y distribución del fondo; adapta al formato final y al estilo del sujeto base o estilo elegido, sin copiar personas, textos ni imponer estilo fotográfico'};
  return (referenceRoles.includes('base') ? '' : 'Ninguna imagen es base de edición; genera según el encargo y estas referencias. ') + referenceRoles.map((role,index)=>'Imagen '+(index+1)+': '+meaning[role]+'.').join(' ');
}
