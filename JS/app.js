let db;
const fecha = new Date;

//db
function iniciarDb(){
    const formulario = document.querySelector('#formulario');
    formulario.addEventListener('submit', cargarVencimineto);
    let solicitud =  indexedDB.open('Productos-Vencimientos');

    solicitud.addEventListener('error', mostrarError);
    solicitud.addEventListener('success',comenzar);
    solicitud.addEventListener('upgradeneeded', crearAlmacen);
};

function mostrarError(e){
    const error = e.target.error;
    alert('Tenemos un ERROR:'+ error.code + '/' + error.message);
};

function comenzar(e){
    db = e.target.result;
    fechasProductosVencen();
    console.log('funcion comenzar..')
};

function crearAlmacen(e){
    let baseDeDatos = e.target.result;
    let almacen = baseDeDatos.createObjectStore('Productos',{keyPath: 'id'});
    almacen.createIndex('BuscarProducto', 'plu',{unique: false});
    console.log('Funcion Crear Almacen')
;}

window.addEventListener('load',iniciarDb)

//code app
function cargarVencimineto(e){
    e.preventDefault();
    

    const date = document.querySelector('#date').value.trim();
    const nombre= document.querySelector('#name').value.trim();
    const plu= document.querySelector('#plu').value.trim();
    const ean= document.querySelector('#ean').value.trim();

    const producto = {
        nombre,
        plu,
        date,
        ean
    }

    if(producto.ean === ""){
        producto.ean = "no se agrego un ean";
    }

    producto.id = Date.now();

    let mes = parseInt(date.slice(5,7));
    let dia = parseInt(date.slice(8,10));
    producto.cincoDiasVenc = contadorDiasVenc(dia,mes,5) ;
    producto.diezDiasVenc = contadorDiasVenc(dia,mes,10);
    producto.quinceDiasVenc = contadorDiasVenc(dia,mes,15);

    console.log(producto);

    let transaccion = db.transaction(['Productos'], 'readwrite');
    let almacen = transaccion.objectStore('Productos');

    almacen.add(producto);

    mostrarAlerta('se agrego con exito', 'access');

    document.querySelector('#date').value = '';
    document.querySelector('#name').value = '';
    document.querySelector('#plu').value = '';
    document.querySelector('#ean').value = '';
}

function contadorDiasVenc(dia, mes,diasVenc){
    let resultado;
    const meses31 =[1,3,5,7,8,10,12];
    const meses30 =[4,6,9,11];
    const feb = 2;

    for(let i=diasVenc;i>=1;i--){
        if(dia == 1){
            mes--;
            if(meses31.some((mes31)=> mes31 == mes)){
                dia = 32;
            };
            if(meses30.some((mes30)=> mes30 == mes)){
                dia = 31
            };
            if(mes == feb){
                dia = 29;
            };
        }
        dia--
    }

    resultado = fecha.getFullYear() + "-" +("0" + mes) + "-" + dia;
    return resultado;
}

function fechasProductosVencen(){

    let transaccion = db.transaction(['Productos'], 'readwrite');
    let almacen = transaccion.objectStore('Productos');
    let puntero = almacen.openCursor();

    puntero.onsuccess = (e)=>{
        const producto = e.target.result;
        if(producto){
            const fechaVencProducto = producto.value.date;
            const fecha5Dias = producto.value.cincoDiasVenc;
            const fecha10dias = producto.value.diezDiasVenc;
            const fecha15dias= producto.value.quinceDiasVenc;
            const fechaHoy = fecha.getFullYear() + "-" +("0" + ( fecha.getMonth() + 1)) + "-" +  fecha.getDate();
        
            if(fechaHoy === fechaVencProducto){
                almacen.delete(producto.value.id);
                alert(`el producto ${producto.value.nombre.toUpperCase()}, plu: ${producto.value.plu} vencio el dia de hoy ${fechaHoy}`);
            };

            if(fechaHoy === fecha5Dias){
                alert(`el producto ${producto.value.nombre.toUpperCase()}, plu: ${producto.value.plu} esta por vencer en 5 dias desde hoy (vence el: ${fechaVencProducto})`);
            };

            if(fechaHoy === fecha10dias){
                alert(`el producto ${producto.value.nombre.toUpperCase()}, plu: ${producto.value.plu} esta por vencer en 10 dias, pedir una baja de precio`);
            };

            if(fechaHoy === fecha15dias){
                alert(`el producto ${producto.value.nombre.toUpperCase()}, plu: ${producto.value.plu} esta por vencer en 15 dias, pedir una baja de precio`);
            };

            producto.continue();
        }
    };
}

//funcionalidades
export function mostrarAlerta(mensaje, tipo){
    const divAlerta = document.querySelector('.alerta');
    
    const msj = document.createElement('p');
    msj.textContent = mensaje;
    msj.classList.add(tipo);

    divAlerta.appendChild(msj);
    setTimeout(() => {
        divAlerta.removeChild(msj);
    }, 3000);
}