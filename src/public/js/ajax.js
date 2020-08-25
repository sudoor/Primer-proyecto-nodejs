
//--------------- FUNCION AJAX
function loadXMLDoc(metodo,urls,parametro)
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
  // 
  return new Promise(buscarDatos => {
    // Abre el archivo externo con los parametros recibidos
    xmlhttp.open(metodo,urls,parametro);
    //verifica si devolvio algun dato
    xmlhttp.onreadystatechange=function()
    {
      // ---------------- INPUTS ACOMODAR CIFRAS
      if (xmlhttp.readyState==4&&xmlhttp.status==200)
      {
       //recibe los datos

       //----------------INPUT ACOMODAR CIFRA AL PRESIONAR TECLA
        var data= JSON.parse(xmlhttp.responseText);
        if (data.respuesta) {
          //devuelva la respuesta a la funcion asincrona
          buscarDatos(data.respuesta);
        }
        if (data.contando) {
          //devuelva la respuesta a la funcion asincrona
          buscarDatos(data.contando);
        }

        // -------------- INPUT BUSCAR A PRESIONAR TECLA
        if (data.ProductoSend) {
          const arrayProductos=data.ProductoSend;
          var tablaPosicion = document.querySelector("#tablaVerProductos");
          tablaPosicion.innerHTML="";
          var textoTabla="";
          for (let i in arrayProductos) {
            textoTabla+=
            `<tr>
              <td> 
                <a class="btn btn-primary" href="/productos/editar/`+arrayProductos[i].id+`">
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
                  <button class="btn btn-danger" type="submit"><span>Eliminar</span></button>
                </form>
              </td>
            </tr>`;
          }
          tablaPosicion.innerHTML=textoTabla;
          buscarDatos(arrayProductos);  
        } // fin input buscar al presionar tecla
      }      
    }
    //-- Finaliza la ejecucion ajax
    xmlhttp.send();
  });
}

// -------------------------- CALCULAR SUMATORIA DE MONTOS EN CARRITO -----------------

function sumarCarrito(){
  if (document.querySelector("#tablaVerProductos")) { 
    var tabla = document.querySelector("#tablaVerProductos > tbody");
    console.log(tabla);
  } 
}

//Verificar los datos recibidos del input dollar

function respuestaDolar(respuesta, etiqueta, monto){
  // en caso de que la respuesta sea una letra coloca el valor antiguo al input
  if (respuesta=="letra") {
    etiqueta.disabled = true;
    etiqueta.value=monto;
    etiqueta.disabled = false;
    return monto;
  }
  else{
    //actualiza el valor del input
    etiqueta.value=respuesta;
    return respuesta;
  }
}

//Al cargar la página

function load() { 
  ///--------- BOTON para actualizar monto total
  if (document.querySelector("#btnActualizaTotal")!=null) { 
    var btnActualizaTotal = document.querySelector("#btnActualizaTotal");
    btnActualizaTotal.addEventListener("click", sumarCarrito, false); 
  }
}

document.addEventListener("DOMContentLoaded", load, false);