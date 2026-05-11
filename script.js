document.addEventListener('DOMContentLoaded', function() {
    // Listeners para todos los inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', validarCampos);
        input.addEventListener('change', validarCampos);
    });
    
    // Checklist radios
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', calcularChecklist);
    });
});

function validarCampos() {
    const nit = document.getElementById('nitCliente');
    const valor = document.getElementById('valorTotal');
    const plazo = document.getElementById('plazoEntrega');
    const objeto = document.getElementById('objeto');
    
    // NIT 9-10 dígitos + guión + dígito
    if (/^[0-9]{9,10}-[0-9]$/.test(nit.value)) {
        nit.classList.add('valid');
        nit.classList.remove('error');
    } else if (nit.value) {
        nit.classList.add('error');
        nit.classList.remove('valid');
    }
    
    // Valor > 1M
    if (parseFloat(valor.value) >= 1000000) {
        valor.classList.add('valid');
    } else if (valor.value) {
        valor.classList.add('error');
    }
    
    // Plazo 1-365 días
    if (parseInt(plazo.value) >= 1 && parseInt(plazo.value) <= 365) {
        plazo.classList.add('valid');
    } else if (plazo.value) {
        plazo.classList.add('error');
    }
    
    // Objeto no vacío
    if (objeto.value.trim().length > 10) {
        objeto.classList.add('valid');
    } else if (objeto.value) {
        objeto.classList.add('error');
    }
}

function validarYcalcular() {
    validarCampos();
    calcularChecklist();
    
    const todosValidos = 
        document.getElementById('nitCliente').classList.contains('valid') &&
        document.getElementById('valorTotal').classList.contains('valid') &&
        document.getElementById('plazoEntrega').classList.contains('valid') &&
        document.getElementById('objeto').classList.contains('valid');
    
    const porcentaje = document.getElementById('porcentaje');
    if (todosValidos && porcentaje.classList.contains('ok')) {
        document.getElementById('btnPDF').disabled = false;
        porcentaje.innerHTML = '✅ <strong>VALIDADO 100% - PDF LISTO</strong>';
    } else {
        document.getElementById('btnPDF').disabled = true;
    }
}

function calcularChecklist() {
    let siCount = 0;
    for (let i = 1; i <= 4; i++) {
        if (document.querySelector(`input[name="chk${i}"][value="si"]:checked`)) siCount++;
    }
    
    const porc = Math.round((siCount / 4) * 100);
    const porcentaje = document.getElementById('porcentaje');
    
    if (siCount === 4) {
        porcentaje.innerHTML = `✅ <strong>APROBADO</strong><br>4/4 SÍ (${porc}%)`;
        porcentaje.className = 'porcentaje ok';
    } else if (siCount >= 3) {
        porcentaje.innerHTML = `⚠️ <strong>PENDIENTE</strong><br>${siCount}/4 SÍ (${porc}%)`;
        porcentaje.className = 'porcentaje warning';
    } else {
        porcentaje.innerHTML = `❌ <strong>BLOQUEADO</strong><br>${siCount}/4 SÍ (${porc}%)`;
        porcentaje.className = 'porcentaje error';
    }
}

function generarPDF() {
    const siCount = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
        .filter(r => r.value === 'si').length;
    
    if (siCount !== 4) {
        alert('❌ Requiere 100% SÍ (4/4) en Checklist Legal');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Header
    doc.setFillColor(52,152,219); doc.rect(0, 0, 297, 30, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(24);
    doc.text('ACUERDO COMPRAVENTA MERCANTIL - CAPITAL INVESTMENTS S.A.S.', 15, 22);
    
    // Datos Cliente
    doc.setFontSize(12); doc.setTextColor(0,0,0);
    doc.text('CLIENTE:', 15, 45);
    doc.text(`NIT/CC: ${document.getElementById('nitCliente').value}`, 15, 52);
    doc.text(`Razón Social: ${document.getElementById('razonSocial').value}`, 15, 59);
    doc.text(`Dirección: ${document.getElementById('direccion').value}`, 15, 66);
    
    // Objeto
    doc.text('OBJETO: (Art. 332 Código Comercio)', 15, 80);
    doc.text(document.getElementById('objeto').value, 15, 87, { maxWidth: 200 });
    
    // Valores
    doc.text(`VALOR TOTAL: $${parseFloat(document.getElementById('valorTotal').value).toLocaleString('es-CO')} (sin IVA)`, 15, 105);
    doc.text(`PLAZO ENTREGA: ${document.getElementById('plazoEntrega').value} días calendario`, 15, 112);
    
    // Checklist
    doc.text('CHECKLIST LEGAL APROBADA 100%:', 15, 130);
    doc.text('✓ Objeto mueble | ✓ NIT/RUT | ✓ Precio >$1M | ✓ Garantía 6 meses', 15, 137);
    
    // Footer legal
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('GARANTÍA LEGAL 6 MESES VICIOS OCULTOS - Art. 383 Cc', 15, 155);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Jurisdicción: Villavicencio Meta | Firma Cliente: _________________ | Firma CAPITAL: _________________', 15, 165);
    
    const nombrePDF = `AcuerdoClientes_${document.getElementById('nitCliente').value.replace(/[^0-9]/g,'')}.pdf`;
    doc.save(nombrePDF);
}

function resetForm() {
    document.getElementById('acuerdoForm').reset();
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('valid', 'error');
    });
    document.getElementById('btnPDF').disabled = true;
    document.getElementById('porcentaje').innerHTML = '0/4 SÍ (0%)';
    document.getElementById('porcentaje').className = 'porcentaje';
}
