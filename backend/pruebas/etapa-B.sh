#!/usr/bin/env bash
# Pruebas manuales de la Etapa B: CRUD de productos protegido.
#
# Uso (desde la carpeta backend, con "npm run dev" corriendo en otra terminal):
#     bash pruebas/etapa-B.sh
#
# SEGURIDAD DE LOS DATOS REALES
#  - Solo crea productos cuyo nombre empieza por "ZZ " y solo borra de ese tipo.
#  - Al inicio y al final calcula una huella de los productos reales: si cambió
#    algo, la prueba final falla.
#  - Aunque el script se interrumpa, al salir elimina los productos "ZZ ".
#
# Pide el correo y la contraseña del administrador (la contraseña no se muestra
# ni queda en el historial de la terminal).

API="${API:-http://localhost:3000}"
PASS=0; FAIL=0; TOKEN=""; TOKEN_ACTUAL=""; TMP="$(mktemp)"

# --- Utilidades ---------------------------------------------------------------
# Lee de la entrada estándar un JSON y evalúa la expresión JS recibida (variable "o").
jq_() { node -p "const o=JSON.parse(require('fs').readFileSync(0,'utf8')); $1"; }

# llamar METODO RUTA [JSON]  ->  deja el código HTTP en $ESTADO y la respuesta en $CUERPO
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

# Producto válido de partida y variantes con un campo cambiado (o eliminado con BORRAR).
VALIDO='{"nombre":"ZZ PRODUCTO DE PRUEBA","descripcion":"Producto temporal de pruebas; se elimina solo.","precio":12345,"categorias":["accesorios","gamer"],"tags":["Rock","y2k"],"imagen":"Camisa_Retro.jpg"}'
con() { # con CAMPO VALOR_JSON  (los datos viajan por stdin para evitar problemas de comillas en Windows)
  printf '%s\n%s\n%s' "$VALIDO" "$1" "$2" | node -e "
    const [base,campo,valor]=require('fs').readFileSync(0,'utf8').split('\n');
    const o=JSON.parse(base); if(valor==='BORRAR') delete o[campo]; else o[campo]=JSON.parse(valor);
    console.log(JSON.stringify(o));"
}

# Huella de los productos REALES (los que no empiezan por "ZZ ").
huella() {
  TOKEN_ACTUAL="$TOKEN"; llamar GET /api/admin/productos
  echo "$CUERPO" | node -p "const c=require('crypto');
    const l=JSON.parse(require('fs').readFileSync(0,'utf8')).productos.filter(p=>!p.nombre.startsWith('ZZ '));
    c.createHash('sha256').update(JSON.stringify(l)).digest('hex').slice(0,16)+' ('+l.length+' productos)'"
}

# Al salir (aunque sea con Ctrl+C) se eliminan los productos de prueba.
limpiar() {
  if [ -n "$TOKEN" ]; then
    TOKEN_ACTUAL="$TOKEN"; llamar GET /api/admin/productos
    for id in $(echo "$CUERPO" | jq_ "o.productos.filter(p=>p.nombre.startsWith('ZZ ')).map(p=>p.id).join(' ')" 2>/dev/null); do
      llamar DELETE "/api/admin/productos/$id"; echo "  (limpieza: eliminado producto de prueba id $id)"
    done
  fi
  rm -f "$TMP"
}
trap limpiar EXIT

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

# --- 1. Sin token todo debe estar bloqueado -------------------------------------
echo; echo "1) Rutas protegidas: sin token y con token falso -> 401"
TOKEN_ACTUAL=""
for r in "GET /api/admin/productos" "GET /api/admin/productos/1" "POST /api/admin/productos" "PUT /api/admin/productos/1" "DELETE /api/admin/productos/1" "GET /api/admin/otra-cosa"; do
  llamar ${r% *} ${r#* } '{}'; verificar "sin token: $r" 401 "$ESTADO"
done
TOKEN_ACTUAL="abc.def.ghi"; llamar GET /api/admin/productos; verificar "token falso: GET /api/admin/productos" 401 "$ESTADO"
TOKEN_ACTUAL="$TOKEN"

ANTES=$(huella); echo; echo "   Huella de productos reales ANTES: $ANTES"

# --- 2. Consultar ---------------------------------------------------------------
echo; echo "2) Consultar"
llamar GET /api/admin/productos; verificar "listar (200)" 200 "$ESTADO"
verificar "categorias y tags llegan como listas, activo como booleano" "object boolean" "$(echo "$CUERPO" | jq_ "typeof o.productos[0].categorias+' '+typeof o.productos[0].activo")"
llamar GET /api/admin/productos/abc;     verificar "id no numérico -> 400" 400 "$ESTADO"
llamar GET "/api/admin/productos/0";     verificar "id 0 -> 400" 400 "$ESTADO"
llamar GET "/api/admin/productos/1;DROP"; verificar "id con SQL -> 400" 400 "$ESTADO"
llamar GET /api/admin/productos/999999;  verificar "id inexistente -> 404" 404 "$ESTADO"

# --- 3. Crear -------------------------------------------------------------------
echo; echo "3) Crear"
llamar POST /api/admin/productos "$VALIDO"; verificar "crear producto válido -> 201" 201 "$ESTADO"
ID=$(echo "$CUERPO" | jq_ "o.producto.id")
verificar "quedó activo por defecto" true "$(echo "$CUERPO" | jq_ "o.producto.activo")"
verificar "tags normalizados a minúsculas" "rock,y2k" "$(echo "$CUERPO" | jq_ "o.producto.tags.join(',')")"
llamar GET "/api/admin/productos/$ID"; verificar "se puede consultar por id" 200 "$ESTADO"
PUB=$(curl -s "$API/api/productos" | jq_ "o.productos.some(p=>p.nombre==='ZZ PRODUCTO DE PRUEBA')")
verificar "aparece en el catálogo PÚBLICO (activo)" true "$PUB"
llamar POST /api/admin/productos "$(con id 1 | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));o.creado_en='2000-01-01';console.log(JSON.stringify(o))")"
ID2=$(echo "$CUERPO" | jq_ "o.producto.id")
verificar "se ignoran 'id' y 'creado_en' enviados por el cliente (id != 1)" true "$([ "$ID2" != "1" ] && echo true || echo false)"
verificar "creado_en lo pone el servidor (no 2000)" true "$(echo "$CUERPO" | jq_ "!o.producto.creado_en.startsWith('2000')")"
llamar DELETE "/api/admin/productos/$ID2"

# --- 4. Validación --------------------------------------------------------------
echo; echo "4) Validación (todo esto debe dar 400 y NO crear nada)"
inv() { llamar POST /api/admin/productos "$(con "$2" "$3")"; verificar "$1" 400 "$ESTADO"; }
inv "sin nombre"                  nombre BORRAR
inv "nombre de 1 letra"           nombre '"A"'
inv "sin descripción"             descripcion BORRAR
inv "precio negativo"             precio -5
inv "precio decimal"              precio 12.5
inv "precio como texto"           precio '"100"'
inv "precio gigante"              precio 99999999999
inv "categorías vacías"           categorias '[]'
inv "categoría inexistente"       categorias '["zapatos"]'
inv "categorías como texto"       categorias '"accesorios"'
inv "etiqueta con espacio"        tags '["rock pop"]'
inv "etiqueta con guion bajo"     tags '["a_b"]'
inv "tags como texto"             tags '"rock"'
inv "más de 10 etiquetas"         tags '["a","b","c","d","e","f","g","h","i","j","k"]'
inv "activo como texto"           activo '"si"'
echo "   -- imágenes (el punto de la extensión está escapado) --"
inv "imagen sin punto: fotojpg"   imagen '"fotojpg"'
inv "imagen con ruta: ../x.jpg"   imagen '"../secreto.jpg"'
inv "imagen con carpeta"          imagen '"carpeta/foto.jpg"'
inv "imagen con barra invertida"  imagen '"..\\foto.jpg"'
inv "extensión extra: foto.jpgx"  imagen '"foto.jpgx"'
inv "extensión no permitida .php" imagen '"foto.php"'
inv "extensión no permitida .exe" imagen '"foto.exe"'
inv "doble punto: foto..jpg"      imagen '"foto..jpg"'
inv "solo extensión: .jpg"        imagen '".jpg"'
llamar POST /api/admin/productos '{bad json'; verificar "JSON roto -> 400" 400 "$ESTADO"
llamar POST /api/admin/productos "$(con imagen '"mi-foto_2.v1.PNG"' | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));o.nombre='ZZ imagen con puntos';console.log(JSON.stringify(o))")"
verificar "imagen válida con puntos y mayúsculas (mi-foto_2.v1.PNG) -> 201" 201 "$ESTADO"

# --- 4b. Inyección SQL ----------------------------------------------------------
echo; echo "4b) Inyección SQL: se guarda como texto, no se ejecuta"
INY="ZZ '); DROP TABLE productos; --"
llamar POST /api/admin/productos "$(con nombre "\"$INY\"")"; verificar "nombre con SQL malicioso -> 201 (texto literal)" 201 "$ESTADO"
llamar GET /api/admin/productos; verificar "la tabla productos sigue existiendo y responde" 200 "$ESTADO"

# --- 5. Editar ------------------------------------------------------------------
echo; echo "5) Editar"
llamar PUT "/api/admin/productos/$ID" "$(con nombre '"ZZ PRODUCTO EDITADO"' | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));o.precio=54321;o.categorias=['ropa'];o.activo=false;console.log(JSON.stringify(o))")"
verificar "editar -> 200" 200 "$ESTADO"
verificar "los cambios se guardaron" "ZZ PRODUCTO EDITADO 54321 ropa false" "$(echo "$CUERPO" | jq_ "[o.producto.nombre,o.producto.precio,o.producto.categorias.join(','),o.producto.activo].join(' ')")"
PUB=$(curl -s "$API/api/productos" | jq_ "o.productos.some(p=>p.nombre.startsWith('ZZ PRODUCTO'))")
verificar "al desactivarlo desaparece del catálogo PÚBLICO" false "$PUB"
llamar PUT "/api/admin/productos/$ID" "$(con nombre '"ZZ PRODUCTO EDITADO 2"')"
verificar "editar SIN enviar 'activo' conserva el estado (sigue inactivo)" false "$(echo "$CUERPO" | jq_ "o.producto.activo")"
llamar PUT "/api/admin/productos/$ID" "$(con nombre '"ZZ PRODUCTO EDITADO 3"' | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));o.activo=true;console.log(JSON.stringify(o))")"
PUB=$(curl -s "$API/api/productos" | jq_ "o.productos.some(p=>p.nombre==='ZZ PRODUCTO EDITADO 3')")
verificar "al reactivarlo vuelve al catálogo público" true "$PUB"
llamar PUT "/api/admin/productos/$ID" "$(con precio -1)"; verificar "editar con datos inválidos -> 400" 400 "$ESTADO"
llamar PUT /api/admin/productos/999999 "$VALIDO"; verificar "editar inexistente -> 404" 404 "$ESTADO"
llamar PUT /api/admin/productos/abc "$VALIDO";   verificar "editar con id inválido -> 400" 400 "$ESTADO"

# --- 6. Eliminar ----------------------------------------------------------------
echo; echo "6) Eliminar"
llamar DELETE "/api/admin/productos/$ID"; verificar "eliminar -> 200" 200 "$ESTADO"
llamar GET "/api/admin/productos/$ID";    verificar "ya no existe (404)" 404 "$ESTADO"
llamar DELETE "/api/admin/productos/$ID"; verificar "eliminar otra vez -> 404" 404 "$ESTADO"
llamar DELETE /api/admin/productos/abc;   verificar "eliminar con id inválido -> 400" 400 "$ESTADO"

# --- 7. Los datos reales no cambiaron -------------------------------------------
limpiar_zz() { TOKEN_ACTUAL="$TOKEN"; llamar GET /api/admin/productos
  for id in $(echo "$CUERPO" | jq_ "o.productos.filter(p=>p.nombre.startsWith('ZZ ')).map(p=>p.id).join(' ')"); do llamar DELETE "/api/admin/productos/$id"; done; }
limpiar_zz
DESPUES=$(huella)
echo; echo "7) Integridad de tus productos reales"
echo "   Huella ANTES:   $ANTES"; echo "   Huella DESPUÉS: $DESPUES"
verificar "los productos reales quedaron EXACTAMENTE igual" "$ANTES" "$DESPUES"

echo; echo "=============================="
echo " Resultado: $PASS correctas, $FAIL fallidas"
echo "=============================="
[ "$FAIL" -eq 0 ]
