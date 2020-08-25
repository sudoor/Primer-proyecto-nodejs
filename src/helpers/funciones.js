const numeroVisual = {
  //colocar los miles con . y decimales con ,
  aplicar: function(numero){
    numero += '';
       var x = numero.split('.');
       var x1 = x[0];
       var x2 = x.length > 1 ? ',' + x[1] : '';
       var rgx = /(\d+)(\d{3})/;
       while (rgx.test(x1)) {
           x1 = x1.replace(rgx, '$1' + '.' + '$2');
       }
       return x1 + x2;
  },
  //-- actualizar monto con el numero nuevo ingresado
  verificar: function(numero){
    //---- Eliminar puntos y comas para obtener solo los numeros
    numero = numeroVisual.quitar(numero);
    //separa decimales de enteros
    x=numero.split(".");
    // enteros
    x1=x[0];

    //-------------------------- verificar cuantos decimales hay -------------------
    if (x.length>1) { 
      // guardar decimales en x2
      x2=x[1].toString();
      // -- si hay un decimal es porque se presionó la tecla de borrar
      // NOTA: es imposible que exista un solo decimal sin presionar la tecla de borrar
      if (x2.length==1){ 
        // si hay un solo decimal
        if (x2.length == 1) {
          // guarda enteros en un array
          var arrayEnteros = x1.split("");
          // coloca antes del decimal el ultimo entero
          x2= arrayEnteros.pop()+x2;
          // actualiza los enteros sin el ultimo que ha pasado a ser decimal
          x1 = arrayEnteros.join("");
        }
      }
      // -- si hay mas de dos decimales se debe incorporar el primero a los numeros enteros
      // NOTA: es imposible que existan mas de 3 decimales, todo esto está bloqueado
      else if (x2.length==3){
        // guarda decimales en un array
        var arrayDecimales = x2.split("");
        // le suma el primer decimal a los numeros enteros
        x1+=arrayDecimales[0];
        // elimina el primer decimal de los decimales
        x2 = arrayDecimales[1] + arrayDecimales[2];
      }
    }
    // -- Ejecutar esto si no hay decimales
    else{
      // Si hay un solo entero se pasa a decimal, quedando 0,0(el entero es el segundo decimal)
      if (x1.length==1) {
        x2="0"+x1;
        x1="0";
      }
      // si no hay enteros se coloca el monto vacio 0,00
      else if(x1.length==0){
        x1="0";
        x2="00";
      }
      // Esta condicion se ejecuta en caso de que se borre la coma
      else if(x1.length>1){
        x2="00";
      }
    }

    return Number(x1 + "." + x2).toFixed(2);
  },
  //verificar con 3 decimales
  verificar3: function(numero){
    //---- Eliminar puntos y comas para obtener solo los numeros
    numero = numeroVisual.quitar(numero);
    //separa decimales de enteros
    x=numero.split(".");
    // enteros
    x1=x[0];

    //-------------------------- verificar cuantos decimales hay -------------------
    if (x.length>1) { 
      // guardar decimales en x2
      x2=x[1].toString();
      // -- si hay un decimal es porque se presionó la tecla de borrar
      // NOTA: es imposible que exista un solo decimal sin presionar la tecla de borrar
      if (x2.length==2){ 
        // si hay un solo decimal
        if (x2.length == 2) {
          // guarda enteros en un array
          var arrayEnteros = x1.split("");
          // coloca antes del decimal el ultimo entero
          x2= arrayEnteros.pop()+x2;
          // actualiza los enteros sin el ultimo que ha pasado a ser decimal
          x1 = arrayEnteros.join("");
        }
      }
      // -- si hay mas de dos decimales se debe incorporar el primero a los numeros enteros
      // NOTA: es imposible que existan mas de 3 decimales, todo esto está bloqueado
      else if (x2.length==4){
        // guarda decimales en un array
        var arrayDecimales = x2.split("");
        // le suma el primer decimal a los numeros enteros
        x1+=arrayDecimales[0];
        // elimina el primer decimal de los decimales
        x2 = arrayDecimales[1] + arrayDecimales[2] + arrayDecimales[3];
      }
    }
    // -- Ejecutar esto si no hay decimales
    else{
      // Si hay un solo entero se pasa a decimal, quedando 0,0(el entero es el segundo decimal)
      if (x1.length==1) {
        x2="00"+x1;
        x1="0";
      }
      // si no hay enteros se coloca el monto vacio 0,00
      else if(x1.length==0){
        x1="0";
        x2="000";
      }
      // Esta condicion se ejecuta en caso de que se borre la coma
      else if(x1.length>1){
        x2="000";
      }
    }

    return Number(x1 + "." + x2).toFixed(3);
  },
  //convertir numero a entero
  quitar: function(numero){
    numero+="";
    var x1="";
    var x = numero.split(",");
    var enteros = x[0].split('.');

    //---------------------------------- sumar los enteros
    for (let i in enteros) {
      x1+=enteros[i];
    }
    if (x.length==2) {
      x2=x[1];
      return x1 + "." + x2;
    }
    else{
      return x1;
    }
  }

};

module.exports = numeroVisual;