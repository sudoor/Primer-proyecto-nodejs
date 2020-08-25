function load() { 
  //----- Agregar evento de ajax al input que no sea nulo
  if (document.querySelector("#inputOnWriteNumero")!=null) { 
    var inputOnWrite = document.querySelector("#inputOnWriteNumero");
    inputOnWrite.addEventListener("keydown", acomodarMonto, true); 
  }
  else if (document.querySelector("#inputOnWriteProducto")!=null) { 
    var inputOnWrite = document.querySelector("#inputOnWriteProducto");
    inputOnWrite.addEventListener("keypress", verProductosBuscar, true); 
  }
}
//--------------- FUNCION AJAX
function loadXMLDoc()
{
  var xmlhttp;
  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }
  else
  {// code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;  
}

//------------------ Buscar producto
function verProductosBuscar(){
  document.querySelector("body > main > div > div > main > div > div > div > table > tbody").innerHTML="";
  //El intervalo de tiempo mientras se escribe la letra en el input
  var tiempo = setTimeout(function(){
    //llamada a funcion de ajax
    var xmlhttp = loadXMLDoc();
    //guarda el texto a buscar colocado en el input
    var textoBuscar = document.querySelector("#inputOnWriteProducto").value;
    //abre un archivo externo para buscar en la base de datos la palabra
    xmlhttp.open("GET","/productos/ajax/"+textoBuscar+"/hola",true);
    //verifica si devolvio algun dato
    xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4&&xmlhttp.status==200)
      {
        var data=JSON.parse(xmlhttp.responseText);
        if (data.ProductoSend.length!=0) {
          const arrayProductos=data.ProductoSend;
          for (let i in arrayProductos) {
            var tablaPosicion = document.querySelector("body > main > div > div > main > div > div > div > table > tbody");
            tablaPosicion.innerHTML+=
            `<tr>
              <td> 
                <a class="mr-3 btn btn-primary" href="/productos/editar/`+arrayProductos[i].id+`">
                  <span>Editar</span>
                </a>
              </td>
              <td>`+arrayProductos[i].nombre+`</td>
              <td>`+arrayProductos[i].cantidad+`</td>
              <td>`+arrayProductos[i].precioCompra+`</td>
              <td>`+arrayProductos[i].precioVenta+`</td>
              <td>`+arrayProductos[i].descripcion+`</td>
              <td>
                <form action="/productos/borrar/`+arrayProductos[i].id+`?_method=DELETE" method="POST" style="display: inline-block;">
                  <input type="hidden" name="_method" value="DELETE">
                  <button class="btn-danger" type="submit"><span>Eliminar</span></button>
                </form>
              </td>
            </tr>`;
          }  
        }
      }
    }
    //-- Finaliza la ejecucion ajax
    xmlhttp.send();
  },1);//1 ms mientras se espera a que la tecla presionada se escriba en el input
}

//------------------ Decorar Monto
function acomodarMonto(){
  //teclas permitidas que no son numeros
  var teclasPermitidas = [8,37,38,39,40,96,97,98,99,100,101,102,103,104,105];
  //monto de input sin cambiar
  var monto = document.querySelector("#inputOnWriteNumero").value;
  //obtener codigo de la tecla
  tecla=event.keyCode;
  console.log(String.fromCharCode(tecla));
  //buscar si la tecla esta en la lista de permitidas
  var buscar = teclasPermitidas.find(buscando => buscando==tecla);
  // --- IMPORTANTE -- si la tecla es una letra guardar el valor y esperar 1ms para volver a colocarlo
  // esto permite que no se escriba la tecla que escribistes
  if (isNaN(String.fromCharCode(tecla))==true && buscar==undefined || tecla==32) { // 32 es la tecla de espacio
    //para desabilitar y evitar que escriban una letra por accidente
    document.querySelector("#inputOnWriteNumero").disabled=true;
    //El intervalo de tiempo mientras se escribe la letra en el input
    var tiempo = setTimeout(function(){
      //colocar el monto sin la tecla presionada
      document.querySelector("#inputOnWriteNumero").value = monto;
      //habilitar de nuevo el input
      document.querySelector("#inputOnWriteNumero").disabled=false;
    },1);//1 ms mientras se espera a que la tecla presionada se escriba en el input para luego revertir los cambios
  }
  else{
    //El intervalo de tiempo mientras se escribe la letra en el input
    var tiempo = setTimeout(function(){
      //llamada a funcion de ajax
      var xmlhttp = loadXMLDoc();
      //guarda el numero para acomodar colocado en el input
      monto = document.querySelector("#inputOnWriteNumero").value;
      //abre un archivo externo para buscar en la base de datos la palabra
      xmlhttp.open("GET","/dolar/ajax/"+monto,true);
      //verifica si devolvio algun dato
      xmlhttp.onreadystatechange=function()
      {
        if (xmlhttp.readyState==4&&xmlhttp.status==200)
        {
          //recibe los datos
          var data=JSON.parse(xmlhttp.responseText);
          if (data.respuesta.length!=0) {
            var cifra = data.respuesta;
            //actualiza la cifra
            document.querySelector("#inputOnWriteNumero").value = cifra;
          }
        }
      }
      //-- Finaliza la ejecucion ajax
      xmlhttp.send();
    },1);//1 ms mientras se espera a que la tecla presionada se escriba en el input
  }
}



document.addEventListener("DOMContentLoaded", load, false);
