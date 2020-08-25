 function radios(tipo){
  if (tipo!=null) {
    if (tipo=="peso") {
      elemento = document.querySelector("#unidad");
      elemento.disabled = true;
      elemento.value="";
      elemento = document.querySelectorAll("#inputOnWriteNumero")[0];
      elemento.disabled = false;
    }
    else if(tipo=="unidad"){
      elemento = document.querySelector("#unidad");
      elemento.disabled = false;
      elemento = document.querySelectorAll("#inputOnWriteNumero")[0];
      elemento.disabled = true;
      elemento.value="";    
    }
 }
}
function load(){
  
  //----- Detecta si el input existe
  if (document.querySelector("#inputOnWriteNumero")!=null) { 
      var inputOnWrite = document.querySelectorAll("#inputOnWriteNumero");
      var montoOriginal = new Array(inputOnWrite.length);
      for(let i in inputOnWrite){
          // monto antes de que se realice cualquier cambio
        montoOriginal[i] = inputOnWrite[i].value;
        // -- llamada al evento de presionar la tecla
        inputOnWrite[i].addEventListener("keydown", function(){
          //codigo de la tecla
          tecla = event.keyCode;
          //tiempo mientras se escribe en el input
          var tiempo = setTimeout(async function(){
            //llamada al archivo ajax
            const respuesta = await loadXMLDoc("GET","/sugaar/ajaxNumeroInput/"+inputOnWrite[i].value+"/"+tecla+"/2",false);
            //Esto vuelve a colocar el monto antiguo en caso de que escriban varios numeros antes de que llegue la respuesta
            inputOnWrite[i].value=montoOriginal[i];
            //verifica la respuesta ejecutando la funcion en el archivo ajax y actualiza el monto
            montoOriginal[i] = respuestaDolar(respuesta, inputOnWrite[i], montoOriginal[i]);
          },1);
        }, false); 
      }
  }
  //---------------------Decorar monto con 3 decimales
  if (document.querySelector("#inputOnWriteNumero3")!=null) { 
      var inputOnWrite2 = document.querySelectorAll("#inputOnWriteNumero3");
      var montoOriginal2 = new Array(inputOnWrite2.length);
      for(let i in inputOnWrite2){
          // monto antes de que se realice cualquier cambio
        montoOriginal2[i] = inputOnWrite2[i].value;
        // -- llamada al evento de presionar la tecla
        inputOnWrite2[i].addEventListener("keydown", function(){
          //codigo de la tecla
          tecla2 = event.keyCode;
          //tiempo mientras se escribe en el input
          var tiempo = setTimeout(async function(){
            //llamada al archivo ajax
            const respuesta = await loadXMLDoc("GET","/sugaar/ajaxNumeroInput/"+inputOnWrite2[i].value+"/"+tecla2+"/3",false);
            //Esto vuelve a colocar el monto antiguo en caso de que escriban varios numeros antes de que llegue la respuesta
            inputOnWrite2[i].value=montoOriginal2[i];
            //verifica la respuesta ejecutando la funcion en el archivo ajax y actualiza el monto
            montoOriginal2[i] = respuestaDolar(respuesta, inputOnWrite2[i], montoOriginal2[i]);
          },1);
        }, false); 
      }
  }
  //----------------------------- Para buscar productos en formato de tabla
  if (document.querySelector("#inputOnWriteProducto")!=null) { 
    var inputOnWrite = document.querySelector("#inputOnWriteProducto");
    inputOnWrite.addEventListener("keyup", fTeclaProductos, true); 
  }
  // ----------------- Cronometro general para futuras funciones
  if (document.querySelector("#conteo")!=null) { 
    var conteo = document.querySelector("#conteo");
    var tiempo = setInterval(async function(){
          const respuesta = await loadXMLDoc("GET","/conteo/1",true);
          conteo.innerHTML = respuesta;

    },1000);
  }
}

  
async function fTeclaProductos(){
  var textoBuscar = document.querySelector("#inputOnWriteProducto").value;
  if (textoBuscar=="") { window.location = "/productos"}
  const respuesta = await loadXMLDoc("GET","/productos/ajax/"+textoBuscar,true);
}

document.addEventListener("DOMContentLoaded", load(null), false);