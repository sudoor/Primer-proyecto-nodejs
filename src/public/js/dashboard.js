



function crearGraficasPCV(...datosGrafica){
  var nombres = []; //fechas de la grafica
  var ganancia = []; // montos de la grafica
  //recorre el array para crear los nuevos arrays
  for(let i of datosGrafica){
    nombres.push(i.nombre);
    ganancia.push(i.precioVenta - i.precioCompra);
  }
    // Graphs
    var ctx = document.getElementById('myChartPrecios')
    // eslint-disable-next-line no-unused-vars
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: nombres,
        datasets: [{
          data: ganancia,
          lineTension: 0,
          backgroundColor: "#007bff",
          borderColor: "#007bff",
          hoverBackgroundColor: "#007bff",
          hoverBorderColor: "#007bff",
          pointRadius: 5
        }]
      },
      options: {
        scales: {
          yAxes: [{
            gridLines: {
              display: false
            },
            ticks:{
              beginAtZero: true
            },
            stacked: false
          }],
          xAxes: [{
            stacked: false,
            gridLines: {
              color: "transparent"
            }
          }]
        },
        legend: {
          display: false
        }
      }
    })
  };
  //termina grafica de precio de compra vs precio de venta
  
  
  function crearGraficasPC(...datosGrafica){
    var nombres = []; //fechas de la grafica
    var cantidades = []; // montos de la grafica
    //recorre el array para crear los nuevos arrays
    for(let i of datosGrafica){
      nombres.push(i.nombre);
      cantidades.push(i.cantidad);
    }
    // Graphs
    var ctx = document.getElementById('myChartProductos')
    // eslint-disable-next-line no-unused-vars
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: nombres,
        datasets: [{
          data: cantidades,
          lineTension: 0,
          backgroundColor: "#007bff",
          borderColor: "#007bff",
          hoverBackgroundColor: "#007bff",
          hoverBorderColor: "#007bff",
        }]
      },
      options: {
        scales: {
          yAxes: [{
            gridLines: {
              display: false
            },
            ticks:{
              beginAtZero: true
            },
            stacked: false
          }],
          xAxes: [{
            stacked: false,
            gridLines: {
              color: "transparent"
            }
          }]
        },
        legend: {
          display: false
        }
      }
    })
  };

  //termina grafica de productos cantidad



function crearGraficaDolar(...datosGrafica) {
  var fechas = []; //fechas de la grafica
  var montos = []; // montos de la grafica
  var color = []; // colores que tendran los puntos en la grafica
  var n = 0;
  datosGrafica.reverse();//coloca la fecha ordenadamente
  //recorre el array para crear los nuevos arrays
  for(let i of datosGrafica){
    fechas.push(i.fecha);
    montos.push(i.monto);
    if (i.monto>n) {
      color.push("#dc3545");
    }
    else{
      color.push("#28a745");
    }
    n = i.monto;
  }
  // Graphs
  var ctx2 = document.getElementById('myChartDollarInicio')
  // eslint-disable-next-line no-unused-vars
  var myChart2 = new Chart(ctx2, {
    type: "line",
        data: {
          labels: fechas,
          datasets: [{
            label: "Bs ",
            fill: true,
            lineTension: 0.2,
            backgroundColor: "transparent",
            borderColor: "#007bff",
            borderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: "#000000",
            pointRadius: 4,
            data: montos
          }]
        },
        options: {
          legend: {
            display: false
          },
          tooltips: {
            intersect: false
          },
          hover: {
            intersect: true
          },
          plugins: {
            filler: {
              propagate: false
            }
          },
          scales: {
            xAxes: [{
              reverse: true,
              gridLines: {
                color: "rgba(0,0,0,0)"
              }
            }],
            yAxes: [{
              gridLines: {
                color: "rgba(0,0,0,0)",
                fontColor: "#fff"
              },
            }]
          }
        }
  });//cierra la creacion de la grafica
}//finaliza la funcion
