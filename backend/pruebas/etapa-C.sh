#!/usr/bin/env bash
# Pruebas manuales de la Etapa C: API administrativa de mensajes de contacto.
#
# Uso (desde la carpeta backend, con "npm run dev" corriendo en otra terminal):
#     bash pruebas/etapa-C.sh
#
# SEGURIDAD DE LOS DATOS REALES
#  - Crea 3 mensajes temporales por la vía pública real (POST /api/contacto) con
#    nombre "ZZ PRUEBA C ..." y SOLO modifica o borra mensajes con ese nombre.
#  - Al inicio y al final calcula una huella de tus mensajes reales (todos los que
#    no empiezan por "ZZ PRUEBA C"): si algo cambió, la prueba final falla.
#  - Si el script termina por error o lo interrumpes (Ctrl+C), al salir elimina
#    cualquier mensaje "ZZ PRUEBA C" que haya quedado.
#
# LÍMITE: el formulario público admite 5 envíos cada 10 minutos por IP y este script
# usa 3. Si lo ejecutas dos veces seguidas, la 2.ª puede dar 429: reinicia
# "npm run dev" (el contador está en memoria) o espera 10 minutos.
#
# Si un mensaje real llegara JUSTO mientras corre el script (un visitante enviando el
# formulario), la huella final podría diferir: en ese caso, repite la ejecución.

API="${API:-http://localhost:3000}"
PREFIJO="ZZ PRUEBA C"
PASS=0; FAIL=0; TOKEN=""; TOKEN_ACTUAL=""; TMP="$(mktemp)"

# --- Utilidades ---------------------------------------------------------------
# Lee un JSON de la entrada estándar y evalúa la expresión JS recibida (variable "o").
jq_() { node -p "const o=JSON.parse(require('fs').readFileSync(0,'utf8')); $1"; }

# llamar METODO RUTA [JSON] -> deja el código HTTP en $ESTADO y la respuesta en $CUERPO
llamar() {
  local metodo="$1" ruta="$2" cuerpo="$3"
  local args=(-s -o "$TMP" -w '%{http_code}' -X "$metodo" "$API$ruta")
  [ -n "$TOKEN_ACTUAL" ] && args+=(-H "Authorization: Bearer $TOKEN_ACTUAL")
  [ -n "$cuerpo" ] && args+=(-H "Content-Type: application/json" -d "$cuerpo")
  ESTADO=$(curl "${args[@]}"); CUERPO=$(cat "$TMP")
}

# verificar "descripción" esperado obtenido
verificar() {
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✔ $1"
  else FAIL=$((FAIL+1)); echo "  ✘ $1  (esperado: $2 | obtenido: $3)"; echo "      respuesta: ${CUERPO:0:200}"; fi
}

# Descarga TODOS los mensajes (recorre las páginas de 100 en 100) y los imprime como JSON.
todos() {
  printf '%s' "$TOKEN" | node -e "
    const token=require('fs').readFileSync(0,'utf8');
    (async()=>{
      const salida=[];
      for(let p=1;p<=500;p++){
        const r=await fetch('$API/api/admin/mensajes?limite=100&pagina='+p,{headers:{Authorization:'Bearer '+token}});
        if(!r.ok){console.error('HTTP '+r.status);process.exit(1);}
        const d=await r.json(); salida.push(...d.mensajes);
        if(d.mensajes.length<100) break;
      }
      console.log(JSON.stringify(salida));
    })();"
}

# Huella de los mensajes REALES (los que no empiezan por el prefijo de prueba).
huella() {
  todos | jq_ "const c=require('crypto');
    const l=o.filter(m=>!m.nombre.startsWith('$PREFIJO'));
    c.createHash('sha256').update(JSON.stringify(l)).digest('hex').slice(0,16)+' ('+l.length+' mensajes reales)'"
}

# Elimina SOLO los mensajes de prueba. Se usa al final y al salir (trap).
borrar_pruebas() {
  [ -z "$TOKEN" ] && return
  TOKEN_ACTUAL="$TOKEN"
  for id in $(todos 2>/dev/null | jq_ "o.filter(m=>m.nombre.startsWith('$PREFIJO')).map(m=>m.id).join(' ')" 2>/dev/null); do
    llamar DELETE "/api/admin/mensajes/$id"; echo "  (limpieza: eliminado mensaje de prueba id $id)"
  done
}
limpiar() { borrar_pruebas; rm -f "$TMP"; }
trap limpiar EXIT
trap 'echo; echo "Interrumpido: limpiando..."; exit 130' INT TERM

# Crea un mensaje de prueba por la vía pública (sin token) y aborta si no se pudo.
crear_prueba() {
  TOKEN_ACTUAL=""
  llamar POST /api/contacto "{\"nombre\":\"$PREFIJO $1\",\"email\":\"zz-prueba-c@example.com\",\"mensaje\":\"Mensaje temporal de pruebas de la Etapa C ($1). Se elimina solo.\"}"
  if [ "$ESTADO" = "429" ]; then
    echo "✘ El formulario público alcanzó su límite (5 envíos/10 min). Reinicia 'npm run dev' o espera 10 minutos y repite."; exit 1
  fi
  verificar "crear mensaje temporal '$1' por el formulario público -> 201" 201 "$ESTADO"
  TOKEN_ACTUAL="$TOKEN"
}
id_de() { todos | jq_ "o.find(m=>m.nombre==='$PREFIJO $1').id"; }
no_leidos() { llamar GET "/api/admin/mensajes?limite=1"; echo "$CUERPO" | jq_ "o.no_leidos"; }

# --- Inicio de sesión ---------------------------------------------------------
read -p "Correo del administrador: " CORREO
read -s -p "Contraseña: " PW; echo
TOKEN=$(printf '%s\n%s' "$CORREO" "$PW" | node -e "
  const [e,p]=require('fs').readFileSync(0,'utf8').split('\n');
  fetch('$API/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})})
   .then(r=>r.json()).then(d=>console.log(d.token||''))")
unset PW
if [ -z "$TOKEN" ]; then echo "✘ No se pudo iniciar sesión. Revisa el correo/contraseña y que el backend esté corriendo."; TOKEN=""; exit 1; fi
echo "✔ Sesión iniciada"

# --- 1. Protección --------------------------------------------------------------
echo; echo "1) Rutas protegidas: sin token y con token falso -> 401"
TOKEN_ACTUAL=""
for r in "GET /api/admin/mensajes" "GET /api/admin/mensajes/1" "PATCH /api/admin/mensajes/1" "DELETE /api/admin/mensajes/1"; do
  llamar ${r% *} ${r#* } '{"leido":true}'; verificar "sin token: $r" 401 "$ESTADO"
done
for r in "GET /api/admin/mensajes" "PATCH /api/admin/mensajes/1" "DELETE /api/admin/mensajes/1"; do
  TOKEN_ACTUAL="abc.def.ghi"; llamar ${r% *} ${r#* } '{"leido":true}'; verificar "token falso: $r" 401 "$ESTADO"
done
TOKEN_ACTUAL="$TOKEN"

ANTES=$(huella)
echo; echo "   Huella de mensajes reales ANTES: $ANTES"

# --- 2. Datos temporales --------------------------------------------------------
echo; echo "2) Preparar 3 mensajes temporales"
NL0=$(no_leidos)
crear_prueba uno; crear_prueba dos; crear_prueba tres
I1=$(id_de uno); I2=$(id_de dos); I3=$(id_de tres)
echo "   (ids temporales: $I1, $I2, $I3)"
verificar "el contador no_leidos subió en 3" "$((NL0+3))" "$(no_leidos)"

# --- 3. Listar ------------------------------------------------------------------
echo; echo "3) Listar"
llamar GET /api/admin/mensajes; verificar "listar -> 200" 200 "$ESTADO"
verificar "estructura: mensajes[], total, no_leidos, pagina=1, limite=50" true \
  "$(echo "$CUERPO" | jq_ "Array.isArray(o.mensajes)&&typeof o.total==='number'&&typeof o.no_leidos==='number'&&o.pagina===1&&o.limite===50")"
verificar "cada mensaje trae exactamente sus 6 campos y leido es booleano" true \
  "$(echo "$CUERPO" | jq_ "o.mensajes.every(m=>Object.keys(m).sort().join()==='creado_en,email,id,leido,mensaje,nombre'&&typeof m.leido==='boolean')")"
verificar "los más recientes primero (los 3 temporales: tres, dos, uno)" "$I3,$I2,$I1" "$(echo "$CUERPO" | jq_ "o.mensajes.slice(0,3).map(m=>m.id).join()")"
verificar "orden por fecha descendente en toda la página" true "$(echo "$CUERPO" | jq_ "o.mensajes.every((m,i,a)=>i===0||a[i-1].creado_en>=m.creado_en)")"
llamar GET "/api/admin/mensajes?limite=2"; verificar "limite=2 devuelve 2 mensajes" "2 2" "$(echo "$CUERPO" | jq_ "o.mensajes.length+' '+o.limite")"
llamar GET "/api/admin/mensajes?limite=1&pagina=2"; verificar "pagina=2&limite=1 devuelve el 2.º más reciente (dos)" "$I2" "$(echo "$CUERPO" | jq_ "o.mensajes[0].id")"
llamar GET "/api/admin/mensajes?pagina=99999"; verificar "página inexistente -> 200 con lista vacía" "200 0" "$ESTADO $(echo "$CUERPO" | jq_ "o.mensajes.length")"
llamar GET "/api/admin/mensajes?leido=0&limite=100"; verificar "filtro leido=0 incluye los temporales" true "$(echo "$CUERPO" | jq_ "[$I1,$I2,$I3].every(i=>o.mensajes.some(m=>m.id===i))")"
llamar GET "/api/admin/mensajes?leido=1&limite=100"; verificar "filtro leido=1 NO incluye los temporales (aún sin leer)" false "$(echo "$CUERPO" | jq_ "[$I1,$I2,$I3].some(i=>o.mensajes.some(m=>m.id===i))")"
echo "   -- parámetros inválidos (todos deben dar 400) --"
for q in "leido=2" "leido=abc" "leido=1%20OR%201=1" "leido=0&leido=1" "pagina=0" "pagina=-1" "pagina=abc" "limite=0" "limite=101" "limite=abc" "limite=1;DROP"; do
  llamar GET "/api/admin/mensajes?$q"; verificar "?$q" 400 "$ESTADO"
done

# --- 4. Consultar por ID --------------------------------------------------------
echo; echo "4) Consultar por ID"
llamar GET "/api/admin/mensajes/$I1"; verificar "consultar mensaje temporal -> 200" 200 "$ESTADO"
verificar "devuelve el mensaje correcto (nombre y correo)" "$PREFIJO uno zz-prueba-c@example.com" "$(echo "$CUERPO" | jq_ "o.mensaje.nombre+' '+o.mensaje.email")"
verificar "consultar NO lo marca como leído" false "$(echo "$CUERPO" | jq_ "o.mensaje.leido")"
echo "   -- IDs inválidos (400) e inexistentes (404) --"
for id in abc 0 -1 1.5 01 "1;DROP" 99999999999 "%201"; do
  llamar GET "/api/admin/mensajes/$id"; verificar "GET id '$id' -> 400" 400 "$ESTADO"
done
llamar PATCH /api/admin/mensajes/abc '{"leido":true}'; verificar "PATCH id inválido -> 400" 400 "$ESTADO"
llamar DELETE /api/admin/mensajes/abc;                 verificar "DELETE id inválido -> 400" 400 "$ESTADO"
llamar GET    /api/admin/mensajes/999999999;           verificar "GET id inexistente -> 404" 404 "$ESTADO"
llamar PATCH  /api/admin/mensajes/999999999 '{"leido":true}'; verificar "PATCH id inexistente -> 404" 404 "$ESTADO"
llamar DELETE /api/admin/mensajes/999999999;           verificar "DELETE id inexistente -> 404" 404 "$ESTADO"

# --- 5. Marcar leído ------------------------------------------------------------
echo; echo "5) Marcar como leído / no leído"
NL1=$(no_leidos)
llamar GET "/api/admin/mensajes/$I1"; ORIG=$(echo "$CUERPO" | jq_ "JSON.stringify({...o.mensaje,leido:null})")
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":true}'; verificar "marcar leído -> 200" 200 "$ESTADO"
verificar "queda leido=true" true "$(echo "$CUERPO" | jq_ "o.mensaje.leido")"
verificar "solo cambió 'leido' (nombre, correo, texto y fecha intactos)" "$ORIG" "$(echo "$CUERPO" | jq_ "JSON.stringify({...o.mensaje,leido:null})")"
llamar GET "/api/admin/mensajes/$I1"; verificar "al consultarlo de nuevo sigue leído" true "$(echo "$CUERPO" | jq_ "o.mensaje.leido")"
verificar "el contador no_leidos bajó en 1" "$((NL1-1))" "$(no_leidos)"
llamar GET "/api/admin/mensajes?leido=1&limite=100"; verificar "ahora aparece en el filtro leido=1" true "$(echo "$CUERPO" | jq_ "o.mensajes.some(m=>m.id===$I1)")"
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":true}'; verificar "marcar leído dos veces es idempotente -> 200" 200 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":false}'; verificar "marcar como no leído -> leido=false" false "$(echo "$CUERPO" | jq_ "o.mensaje.leido")"
verificar "el contador vuelve a su valor" "$NL1" "$(no_leidos)"
echo "   -- cuerpos inválidos (400) --"
llamar PATCH "/api/admin/mensajes/$I1" '{}';              verificar "cuerpo vacío {}" 400 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1";                   verificar "sin cuerpo" 400 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":"si"}';  verificar "leido como texto" 400 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":1}';     verificar "leido como número" 400 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1" '{"leido":null}';  verificar "leido null" 400 "$ESTADO"
llamar PATCH "/api/admin/mensajes/$I1" '{bad json';       verificar "JSON roto" 400 "$ESTADO"
echo "   -- el contenido de un mensaje no se puede editar --"
llamar PATCH "/api/admin/mensajes/$I2" '{"leido":true,"nombre":"HACKEADO","email":"x@y.zz","mensaje":"cambiado","id":1}'
verificar "PATCH con campos extra -> 200 pero se ignoran" "$PREFIJO dos zz-prueba-c@example.com $I2" "$(echo "$CUERPO" | jq_ "o.mensaje.nombre+' '+o.mensaje.email+' '+o.mensaje.id")"
llamar PATCH "/api/admin/mensajes/$I2" '{"leido":false}'

# --- 6. Eliminar ----------------------------------------------------------------
echo; echo "6) Eliminar"
TOTAL0=$(echo "$(llamar GET '/api/admin/mensajes?limite=1'; echo "$CUERPO")" | jq_ "o.total")
llamar DELETE "/api/admin/mensajes/$I1"; verificar "eliminar -> 200" 200 "$ESTADO"
llamar GET "/api/admin/mensajes/$I1";    verificar "ya no existe (404)" 404 "$ESTADO"
llamar DELETE "/api/admin/mensajes/$I1"; verificar "eliminar otra vez -> 404" 404 "$ESTADO"
llamar GET '/api/admin/mensajes?limite=1'; verificar "el total bajó en 1" "$((TOTAL0-1))" "$(echo "$CUERPO" | jq_ "o.total")"
llamar GET "/api/admin/mensajes/$I2"; verificar "los otros temporales siguen ahí (no se borró de más)" 200 "$ESTADO"
llamar DELETE "/api/admin/mensajes/$I2"; verificar "eliminar 'dos' -> 200" 200 "$ESTADO"
llamar DELETE "/api/admin/mensajes/$I3"; verificar "eliminar 'tres' -> 200" 200 "$ESTADO"
verificar "no queda ningún mensaje de prueba" 0 "$(todos | jq_ "o.filter(m=>m.nombre.startsWith('$PREFIJO')).length")"

# --- 7. Integridad --------------------------------------------------------------
DESPUES=$(huella)
echo; echo "7) Integridad de tus mensajes reales"
echo "   Huella ANTES:   $ANTES"; echo "   Huella DESPUÉS: $DESPUES"
verificar "los mensajes reales quedaron EXACTAMENTE igual" "$ANTES" "$DESPUES"
verificar "el contador no_leidos volvió al valor inicial" "$NL0" "$(no_leidos)"

echo; echo "=============================="
echo " Resultado: $PASS correctas, $FAIL fallidas"
echo "=============================="
[ "$FAIL" -eq 0 ]
