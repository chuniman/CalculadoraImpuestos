// Objeto de Vue:
var impApp = new Vue({
  el: "#impuestos",
  data: {
    nominal: 0,

    bpsEmp: 0,
    fonEmp: 0,
    frlEmp: 0,
    EmpMoney: 0,

    bpsTra: 0,
    fonTra: 0,
    frlTra: 0,
    TraMoney: 0,

    FondoSol: 0,
    sumaFondo: 0,
    CajaProf: 0,

    irpf: 0,
    IrMoney: 0,
    ivaDinero: 0,

    porcentajeSubFinal: 0,

    porcentajeFinal: 0
  }
});

$("#calcular").on("click", function() {
  //var nominal = document.getElementById("salNom").value;
  var nominal = impApp.nominal;
  impApp.bpsEmp = nominal * 0.075;
  impApp.fonEmp = nominal * 0.05;
  impApp.frlEmp = nominal * 0.00125;

  impApp.EmpMoney =
    parseInt(nominal) +
    parseInt(impApp.bpsEmp) +
    parseInt(impApp.fonEmp) +
    parseInt(impApp.frlEmp);

  //impApp.EmpMoney = nominal - -impApp.bpsEmp - -impApp.fonEmp - -impApp.frlEmp;

  impApp.bpsTra = nominal * 0.15;
  impApp.frlTra = nominal * 0.00125;
  var conc = 0;
  var hijo = 0;
  if (document.getElementById("checkHijos").checked) {
    hijo = nominal * 0.015;
  }
  if (document.getElementById("checkPareja").checked) {
    hijo = nominal * 0.02;
  }
  impApp.fonTra = nominal * 0.045 + conc + hijo;

  //fondo soliraridad
  fonSol = impApp.FondoSol;
  //carrera larga
  if (document.getElementById("checkFondo").checked) {
    fonSol = parseInt(fonSol) + 6413;
  }
  impApp.sumaFondo = fonSol;

  //caja de los profesionales
  if (document.getElementById("checkCaja").checked) {
    impApp.CajaProf = nominal * 0.165;
  }
  else{
    impApp.CajaProf = 0;
  }


  impApp.TraMoney =
    nominal -
    impApp.bpsTra -
    impApp.fonTra -
    impApp.frlTra -
    fonSol -
    impApp.CajaProf;
  //                0         1     2        3      4       5       6
  var franjas = [26933, 38475, 57713, 115426, 192376, 288564, 442465];
  var porcentajes = [0.1, 0.15, 0.24, 0.25, 0.27, 0.31, 0.36];

  //aca va la suma de irpf
  let suma = 0;
  var neoSalario = nominal;
  if (nominal > 26933) {
    if (impApp.TraMoney > 38480) {
      neoSalario = nominal * 1.06;
    }

    var cont = 0;
    for (let i = 0; i < franjas.length; i++) {
      if (neoSalario > franjas[i] && i<6) {
        cont++;
      }
    }

    for (let i = 1; i <= cont; i++) {
      if (neoSalario > franjas[i] && cont < 7) {
        suma = suma + (franjas[i] - franjas[i - 1]) * porcentajes[i - 1];
      } else {
        suma = suma + (neoSalario - franjas[i - 1]) * porcentajes[i - 1];
      }
    }
  }

  //Deduciones:
  //standard
  if (nominal > 57200) {
    suma = suma * 0.92;
  } else {
    suma = suma * 0.9;
  }
  //por fondo de soliraridad
  suma = suma - fonSol / 12;
  //por hijos menores o discapacitados
  if (document.getElementById("checkHijos").checked) {
    suma = suma - 4.169;
  }
  if (document.getElementById("checkDiscapacitados").checked) {
    suma = suma - 8.337;
  }
  if (suma < 0) {
    suma = 0;
  }

  impApp.irpf = Math.round(suma);
  impApp.IrMoney = impApp.TraMoney - Math.round(suma);
  //despues del iva
  impApp.ivaDinero = Math.round(impApp.IrMoney * 0.23);
  //porcentaje que se te quedan

  impApp.porcentajeSubFinal = Math.round(
    ((nominal - impApp.IrMoney) / nominal) * 100
  );
  impApp.porcentajeFinal = Math.round(
    ((nominal - (impApp.IrMoney - impApp.ivaDinero)) / nominal) * 100
  );

  let bpsPorc=(impApp.bpsTra/nominal)*100;
  let fonaPorc=(impApp.fonTra/nominal)*100;
  let frlPorc=(impApp.frlTra/nominal)*100;
  let fondoPorc=(impApp.sumaFondo/nominal)*100;
  let cajaPorc=(impApp.CajaProf/nominal)*100;
  let irpfPorc=(impApp.irpf/nominal)*100;
  let ivaPorc=(impApp.ivaDinero/nominal)*100;
  let finalMoney=(((impApp.IrMoney - impApp.ivaDinero)/nominal))*100;


  $("#myChart").remove();

  $("#chart").append('<canvas id="myChart" width="40%"></canvas>')

  var ctx = document.getElementById("myChart");

  var data = {
    datasets: [
      {
        data: [finalMoney,bpsPorc, fonaPorc, frlPorc,fondoPorc,cajaPorc,irpfPorc,ivaPorc],
        backgroundColor: ["rgb(232, 11, 11)", "rgb(232, 209, 11)", "rgb(9, 181, 14)","rgb(7, 196, 183)","rgb(211, 99, 8)","rgb(173, 11, 198)","rgb(11, 19, 186)","rgb(14, 163, 126)"]
      }
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Lo que Te queda", "BPS", "Fonasa","FRL","fondo de Soliraridad","Caja de los Profesionales","IRPF","IVA"]
  };

  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: data
  });
});
