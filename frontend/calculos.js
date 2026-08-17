// Calculos.js

function calcularPrecioConDescuento(precio, porcentajeDescuento){
  const valorDescuento = precio * (porcentajeDescuento / 100);
  const preciofinal = preciofinal - valorDescuento;
  return preciofinal;
}
/*

    FUNCIÓN 2

    Calcula el precio de un producto después de agregar un impuesto.

*/

function calcularPrecioConImpuesto(precio, porcentajeImpuesto) {

    const valorImpuesto = precio * (porcentajeImpuesto / 100);

    const precioFinal = precio + valorImpuesto;

    return precioFinal;

}

/*

    FUNCIÓN 3

    Calcula el total de un pedido teniendo en cuenta:

    precio unitario, cantidad de productos y costo de envío.

*/

function calcularTotalPedido(precioUnitario, cantidad, costoEnvio) {

    const subtotal = precioUnitario * cantidad;

    const totalPedido = subtotal + costoEnvio;

    return totalPedido;

}
