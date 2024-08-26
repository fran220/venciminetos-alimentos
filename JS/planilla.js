let db;
let contenedorPlanilla ;

function iniciarDb(){
    const buscar = document.querySelector('#search');
    buscar.addEventListener('click', buscarProducto);
    contenedorPlanilla = document.querySelector('#tabla #body-tabla');

    let solicitud =  indexedDB.open('Productos-Vencimientos');

    solicitud.addEventListener('error', mostrarError);
    solicitud.addEventListener('success',comenzar);
    solicitud.addEventListener('upgradeneeded', crearAlmacen);
}

function mostrarError(e){
    const error = e.target.error;
    alert('Tenemos un ERROR:'+ error.code + '/' + error.message);
};

function comenzar(e){
    db = e.target.result;
    mostrarPlanilla()
    console.log('funcion comenzar..')
};

function crearAlmacen(e){
    let baseDeDatos = e.target.result;
    let almacen = baseDeDatos.createObjectStore('Productos',{keyPath: 'id'});
    almacen.createIndex('BuscarProducto', 'plu',{unique: false});
    console.log('Funcion Crear Almacen')
;}

window.addEventListener('load',iniciarDb)

//planilla
function mostrarPlanilla(){
    let i = 0;
    let transaccion = db.transaction(['Productos'], 'readonly');
    let almacen = transaccion.objectStore('Productos');
    let puntero = almacen.openCursor();
    puntero.onsuccess = (e)=>{
        const producto = e.target.result;
        if(producto){
            i += e.target.source.indexNames.length;
            obtenerDatosProducto(producto);
        }
        console.log(i)
        if((i > 9 && (screen.width > 1600))||(i > 4 && (screen.width < 480))){
            const plantillaCss = document.querySelector('.planilla');
            plantillaCss.classList.remove('h-100vh');
            plantillaCss.classList.add('h-auto');
        }
        if((i < 9 && (screen.width > 1600))||(i < 4 && (screen.width < 480))){
            const plantillaCss = document.querySelector('.planilla');
            plantillaCss.classList.remove('h-auto');
            plantillaCss.classList.add('h-100vh');
        }
    };
}

//modal
function extraerProductoSolicitado(key){
    let transaccion = db.transaction(['Productos'], 'readonly');
    let almacen = transaccion.objectStore('Productos');

    let producto = almacen.get(key);

    producto.onsuccess = ()=>{
        mostrarProductoModal(producto);
    }
}

function mostrarProductoModal(producto){
    const modal = document.querySelector('#modal-card');

    const card = document.createElement('div');
    const contTitulo = document.createElement('div');
    const titulo = document.createElement('h1');
    const bodyCard = document.createElement('div');
    const labelDate = document.createElement('label');
    const labelPlu = document.createElement('label');
    const labelEan = document.createElement('label');
    const dateInput = document.createElement('input');
    const pluInput = document.createElement('input');
    const eanInput = document.createElement('input');
    const contBtns = document.createElement('div');
    const btnAtras = document.createElement('button');
    const btnEditar = document.createElement('button');
    const btnEliminar = document.createElement('button');


    card.classList.add('card');
    contTitulo.classList.add('nombre-producto');
    bodyCard.classList.add('cuerpo');
    contBtns.classList.add('botones');
    btnEditar.classList.add('editar');
    btnEliminar.classList.add('eliminar');

    btnAtras.setAttribute('id','back');
    btnEditar.setAttribute('id','edit');
    btnEliminar.setAttribute('id','eliminar');
    labelDate.setAttribute('for','dateEdit');
    labelPlu.setAttribute('for','pluEdit');
    labelEan.setAttribute('for','eanEdit');
    dateInput.setAttribute('type','date');
    dateInput.setAttribute('id','dateEdit');
    dateInput.setAttribute('disabled','');
    pluInput.setAttribute('type','number');
    pluInput.setAttribute('id','pluEdit');
    pluInput.setAttribute('disabled','');
    eanInput.setAttribute('type','number');
    eanInput.setAttribute('id','eanEdit');
    eanInput.setAttribute('disabled','');
    btnAtras.setAttribute('type','button');
    btnAtras.setAttribute('id','back');
    btnEditar.setAttribute('type','button');
    btnEditar.setAttribute('id','edit');
    btnEliminar.setAttribute('type','button');
    btnEliminar.setAttribute('id','eliminar');

    titulo.textContent = producto.result.nombre;
    labelDate.textContent = 'Date: ';
    labelPlu.textContent = 'Plu: ';
    labelEan.textContent = 'Ean: ';
    dateInput.value = producto.result.date;
    pluInput.value = producto.result.plu;
    eanInput.value = producto.result.ean;
    btnAtras.textContent = 'Atras';
    btnEditar.textContent = 'Editar';
    btnEliminar.textContent = 'Eliminar';

    contTitulo.appendChild(titulo);
    labelDate.appendChild(dateInput);
    labelPlu.appendChild(pluInput);
    labelEan.appendChild(eanInput);
    bodyCard.appendChild(labelDate);
    bodyCard.appendChild(labelPlu);
    bodyCard.appendChild(labelEan);
    contBtns.appendChild(btnAtras);
    contBtns.appendChild(btnEditar);
    contBtns.appendChild(btnEliminar);

    card.appendChild(contTitulo);
    card.appendChild(bodyCard);
    card.appendChild(contBtns);
    modal.appendChild(card);

    btnAtras.addEventListener('click',cerrarModal)

    btnEditar.addEventListener('click',()=>{
        editarProducto(producto.result)
    });
    btnEliminar.addEventListener('click',()=>{
        const confirmar = confirm('desea eliminar este producto?'); //hacerlo con css (alerta)
        if(confirmar){
            eliminarProducto(producto.result);
        }
    });
}

//buscador
function buscarProducto(){
    const productoPlu = document.querySelector('#buscador-input').value.trim();

    if(productoPlu === ""){
        alert('ingrese un plu');
        return
    }

    let transaccion = db.transaction(['Productos'], 'readonly');
    let almacen = transaccion.objectStore('Productos');

    let indice = almacen.index('BuscarProducto');
    let rango = IDBKeyRange.only(productoPlu);
    let puntero = indice.openCursor(rango);
    let i = 0; //bandera

    puntero.onsuccess = (e)=>{
        const producto = e.target.result;
        const buscador = document.querySelector('#buscador-input');
        buscador.value = "";


        if(producto){
            if(i === 0){
                limpiarHtml(contenedorPlanilla);
            };

            obtenerDatosProducto(producto);
            i++ ;
        };
    };
}

//funconaidades
function obtenerDatosProducto(producto){

    const tr = document.createElement('tr');
    const tdName = document.createElement('td'); 
    const tdPlu = document.createElement('td'); 
    const tdDate = document.createElement('td'); 
    const tdEan = document.createElement('td'); 
    const tdBtn = document.createElement('td'); 
    const btn = document.createElement('input');
    
    btn.classList.add('btn-ver');
    tdBtn.classList.add('td-btn');

    btn.setAttribute("type","button");
    btn.setAttribute("value","Ver");
    btn.setAttribute("id", producto.value.id );

    tdName.textContent = producto.value.nombre;
    tdPlu.textContent = producto.value.plu;
    tdDate.textContent = producto.value.date;
    tdEan.textContent = producto.value.ean;

    tdBtn.appendChild(btn);
    tr.appendChild(tdName);
    tr.appendChild(tdPlu);
    tr.appendChild(tdDate);
    tr.appendChild(tdEan);
    tr.appendChild(tdBtn);
    contenedorPlanilla.appendChild(tr);

    producto.continue();

    btn.addEventListener('click',()=>{
            const id =  btn.getAttribute('id');
            const modal = document.querySelector('.modal');
            modal.classList.add('show');
            extraerProductoSolicitado(parseInt(id));
    });
};

function cerrarModal(){
    const modal = document.querySelector('#modal-card');
    modal.classList.remove('show');
    limpiarHtml(modal);
}

function editarProducto(producto){
    const dateInput = document.querySelector('#dateEdit');
    const pluInput = document.querySelector('#pluEdit');
    const eanInput = document.querySelector('#eanEdit');
    const btnSubir = document.querySelector('#edit');

    btnSubir.textContent = 'Subir';

    dateInput.removeAttribute('disabled');
    pluInput.removeAttribute('disabled');
    eanInput.removeAttribute('disabled');

    btnSubir.addEventListener('click',()=>{
        producto.date = dateInput.value;
        producto.plu = pluInput.value;
        producto.ean = eanInput.value;

        if(eanInput.value == ""){
            producto.ean = 'no se agrego un ean'
        }
        let transaccion = db.transaction(['Productos'], 'readwrite');
        let almacen = transaccion.objectStore('Productos');

        transaccion.oncomplete = ()=>{
            const bodyTable = document.querySelector('#body-tabla');
            
            cerrarModal();
            limpiarHtml(bodyTable);
            mostrarPlanilla();
        };

        almacen.put(producto);
        cerrarModal();
    });
}

function eliminarProducto(producto){
    
    const bodyTable = document.querySelector('#body-tabla');

    let transaccion = db.transaction(['Productos'], 'readwrite');
    let almacen = transaccion.objectStore('Productos');

    transaccion.oncomplete = ()=>{
        cerrarModal();
        limpiarHtml(bodyTable);
        mostrarPlanilla();
    }

    almacen.delete(producto.id);

}

function limpiarHtml(contenedor){
    while(contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}