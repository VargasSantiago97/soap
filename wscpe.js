const fs = require('fs');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const WSAA = require('./wsaa')
const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

async function consultaSOAP(metodo, xmlRequest) {
    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/${metodo}`
            },
            xml: xmlRequest,
        });

        const parser = new xml2js.Parser({ explicitArray: false });

        try {
            const result = await parser.parseStringPromise(response.body)
            return result
        }
        catch (err) {
            console.error('Error al parsear XML:', err)
        }
    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}

function guardarPDF(base64String, nombreArchivo = "documento.pdf") {
    try {
        // Eliminar espacios en blanco y caracteres inválidos
        const base64Limpio = base64String.replace(/\s/g, '');

        // Convertir Base64 a buffer
        const buffer = Buffer.from(base64Limpio, 'base64');

        // Guardar el archivo PDF
        fs.writeFileSync(nombreArchivo, buffer);

        console.log(`Archivo guardado como: ${nombreArchivo}`);
    } catch (error) {
        console.error("Error al guardar el PDF:", error);
    }
}


async function consultarCPEAutomotor({ cuitRepresentada, nroCTG = 0, cuitSolicitante = null, tipoCPE = null, sucursal = null, nroOrden = null }) {

    const wsaa = new WSAA(cuitRepresentada, 'wscpe')
    const ticket = await wsaa.obtenerTicket()

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                      xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
        <soapenv:Header/>
        <soapenv:Body>
            <wsc:ConsultarCPEAutomotorReq>
                <auth>
                    <token>${ticket.token}</token>
                    <sign>${ticket.sign}</sign>
                    <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                </auth>
                <solicitud>
                    ${nroCTG
                    ? `<nroCTG>${nroCTG}</nroCTG>`
                    : `<cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
                           <cartaPorte>
                               <tipoCPE>${tipoCPE}</tipoCPE>
                               <sucursal>${sucursal}</sucursal>
                               <nroOrden>${nroOrden}</nroOrden>
                           </cartaPorte>`
        }
                </solicitud>
            </wsc:ConsultarCPEAutomotorReq>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const respuesta = await consultaSOAP('consultarCPEAutomotor', xmlRequest)
        return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarCPEAutomotorResp']['respuesta']
    } catch (error) {
        return error
    }
}

async function consultarPlantas({ cuitRepresentada, cuitConsulta }) {

    const wsaa = new WSAA(cuitRepresentada, 'wscpe')
    const ticket = await wsaa.obtenerTicket()

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
        <soapenv:Header/>
        <soapenv:Body>
            <wsc:ConsultarPlantasReq>
                <auth>
                    <token>${ticket.token}</token>
                    <sign>${ticket.sign}</sign>
                    <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                </auth>
                <solicitud>
                    <cuit>${cuitConsulta}</cuit>
                </solicitud>
            </wsc:ConsultarPlantasReq>
        </soapenv:Body>
    </soapenv:Envelope>`

    try {
        const respuesta = await consultaSOAP('consultarPlantas', xmlRequest)

        return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarPlantasResp']['respuesta']

    } catch (error) {
        return error
    }

}

async function consultarUltNumOrden({ cuitRepresentada, sucursal, tipoCPE }) {

    const wsaa = new WSAA(cuitRepresentada, 'wscpe')
    const ticket = await wsaa.obtenerTicket()

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
        <soapenv:Header/>
        <soapenv:Body>
            <wsc:ConsultarUltNroOrdenReq>
                <auth>
                    <token>${ticket.token}</token>
                    <sign>${ticket.sign}</sign>
                    <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                </auth>
                <solicitud>
                    <sucursal>${sucursal}</sucursal>
                    <tipoCPE>${tipoCPE}</tipoCPE>
                </solicitud>
            </wsc:ConsultarUltNroOrdenReq>
        </soapenv:Body>
    </soapenv:Envelope>`

    try {
        const respuesta = await consultaSOAP('consultarUltNroOrden', xmlRequest)

        return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarUltNroOrdenResp']['respuesta']
    } catch (error) {
        return error
    }
}

async function consultarLocalidadesProductor({ cuitRepresentada, cuitConsulta }) {

    const wsaa = new WSAA(cuitRepresentada, 'wscpe')
    const ticket = await wsaa.obtenerTicket()

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
        <soapenv:Header/>
        <soapenv:Body>
            <wsc:ConsultarLocalidadesProductorReq>
                <auth>
                    <token>${ticket.token}</token>
                    <sign>${ticket.sign}</sign>
                    <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                </auth>
                <solicitud>
                    <cuit>${cuitConsulta}</cuit>
                </solicitud>
            </wsc:ConsultarLocalidadesProductorReq>
        </soapenv:Body>
    </soapenv:Envelope>`

    try {
        const respuesta = await consultaSOAP('consultarLocalidadesProductor', xmlRequest)

        return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarLocalidadesProductorResp']['respuesta']
    } catch (error) {
        return error
    }
}

async function autorizarCPE({
    cuitRepresentada,

    //CABECERA
    tipoCP,
    cuitSolicitante,
    sucursal,
    nroOrden,

    //ORIGEN
    origen_operador_codProvincia, //OPC SI OPERADOR
    origen_operador_codLocalidad, //OPC SI OPERADOR
    origen_operador_planta, //OPC SI OPERADOR

    origen_productor_codProvincia, //OPC SI PRODUCTOR
    origen_productor_codLocalidad, //OPC SI PRODUCTOR
    latitud_grados, //OPC SI PRODUCTOR // OPCIONAL
    latitud_minutos, //OPC SI PRODUCTOR // OPCIONAL
    latitud_segundos, //OPC SI PRODUCTOR // OPCIONAL
    longitud_grados, //OPC SI PRODUCTOR // OPCIONAL
    longitud_minutos, //OPC SI PRODUCTOR // OPCIONAL
    longitud_segundos, //OPC SI PRODUCTOR // OPCIONAL
    ubicacionGeoreferencial, //OPC SI PRODUCTOR // OPCIONAL

    correspondeRetiroProductor,

    esSolicitanteCampo,

    cuitRemitenteComercialProductor, //OPC SI CORRESPONDE RETIRO PRODUCTOR

    //INTERVINIENTES OPC
    cuitRemitenteComercialVentaPrimaria,
    cuitRemitenteComercialVentaSecundaria,
    cuitRemitenteComercialVentaSecundaria2,
    cuitMercadoATermino,
    cuitCorredorVentaPrimaria,
    cuitCorredorVentaSecundaria,
    cuitRepresentanteEntregador,
    cuitRepresentanteRecibidor,

    //DATOS CARGA
    codGrano,
    cosecha,
    pesoBruto,
    pesoTara,

    //DESTINO
    cuit_destino,
    esDestinoCampo,
    destino_codProvincia,
    destino_codLocalidad,
    destino_planta, //OPC

    //DESTINATARIO
    cuit_destinatario,

    //TRANSPORTE
    cuitTransportista,
    dominios = [],
    fechaHoraPartida,
    kmRecorrer,
    codigoTurno, //OPCIONAL
    cuitChofer,
    tarifa, //OPCIONAL
    cuitPagadorFlete,
    cuitIntermediarioFlete, //OPCIONAL
    mercaderiaFumigada,
    observaciones //OPCIONAL
}) {

    const wsaa = new WSAA(cuitRepresentada, 'wscpe')
    const ticket = await wsaa.obtenerTicket()

    const xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
    <soapenv:Header/>
    <soapenv:Body>
        <wsc:AutorizarCPEAutomotorReq>
            <auth>
                <token>${ticket.token}</token>
                <sign>${ticket.sign}</sign>
                <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            </auth>
            <solicitud>
                <cabecera>
                    <tipoCP>${tipoCP}</tipoCP>
                    <cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
                    <sucursal>${sucursal}</sucursal>
                    <nroOrden>${nroOrden}</nroOrden>
                </cabecera>
                <origen>
                    ${origen_operador_planta ?
                    `<operador>
                        <codProvincia>${origen_operador_codProvincia}</codProvincia>
                        <codLocalidad>${origen_operador_codLocalidad}</codLocalidad>
                        <planta>${origen_operador_planta}</planta>
                    </operador>`
                    :
                    `<productor>
                        <codProvincia>${origen_productor_codProvincia}</codProvincia>
                        <codLocalidad>${origen_productor_codLocalidad}</codLocalidad>
                        ${latitud_grados && latitud_minutos && latitud_segundos && longitud_grados && longitud_minutos && longitud_segundos ?
                        `<coordenadasGPS>
                            <latitud>
                                <grados>${latitud_grados}</grados>
                                <minutos>${latitud_minutos}</minutos>
                                <segundos>${latitud_segundos}</segundos>
                            </latitud>
                            <longitud>
                                <grados>${longitud_grados}</grados>
                                <minutos>${longitud_minutos}</minutos>
                                <segundos>${longitud_segundos}</segundos>
                            </longitud>
                            ${ubicacionGeoreferencial ? 
                            `<ubicacionGeoreferencial>${ubicacionGeoreferencial}</ubicacionGeoreferencial>` : ``}
                        </coordenadasGPS>`:``}
                    </productor>`
                    }
                </origen>
                <correspondeRetiroProductor>${correspondeRetiroProductor}</correspondeRetiroProductor>
                <esSolicitanteCampo>${esSolicitanteCampo}</esSolicitanteCampo>
                ${correspondeRetiroProductor ? 
                `<retiroProductor>
                    <cuitRemitenteComercialProductor>${cuitRemitenteComercialProductor}</cuitRemitenteComercialProductor>
                </retiroProductor>` : ``}
                ${cuitRemitenteComercialVentaPrimaria || 
                  cuitRemitenteComercialVentaSecundaria || 
                  cuitRemitenteComercialVentaSecundaria2 || 
                  cuitMercadoATermino || 
                  cuitCorredorVentaPrimaria || 
                  cuitCorredorVentaSecundaria || 
                  cuitRepresentanteEntregador || 
                  cuitRepresentanteRecibidor ? `
                <intervinientes>
                    ${ cuitRemitenteComercialVentaPrimaria ? `<cuitRemitenteComercialVentaPrimaria>${cuitRemitenteComercialVentaPrimaria}</cuitRemitenteComercialVentaPrimaria>` : `` }
                    ${ cuitRemitenteComercialVentaSecundaria ? `<cuitRemitenteComercialVentaSecundaria>${cuitRemitenteComercialVentaSecundaria}</cuitRemitenteComercialVentaSecundaria>` : `` }
                    ${ cuitRemitenteComercialVentaSecundaria2 ? `<cuitRemitenteComercialVentaSecundaria2>${cuitRemitenteComercialVentaSecundaria2}</cuitRemitenteComercialVentaSecundaria2>` : `` }
                    ${ cuitMercadoATermino ? `<cuitMercadoATermino>${cuitMercadoATermino}</cuitMercadoATermino>` : `` }
                    ${ cuitCorredorVentaPrimaria ? `<cuitCorredorVentaPrimaria>${cuitCorredorVentaPrimaria}</cuitCorredorVentaPrimaria>` : `` }
                    ${ cuitCorredorVentaSecundaria ? `<cuitCorredorVentaSecundaria>${cuitCorredorVentaSecundaria}</cuitCorredorVentaSecundaria>` : `` }
                    ${ cuitRepresentanteEntregador ? `<cuitRepresentanteEntregador>${cuitRepresentanteEntregador}</cuitRepresentanteEntregador>` : `` }
                    ${ cuitRepresentanteRecibidor ? `<cuitRepresentanteRecibidor>${cuitRepresentanteRecibidor}</cuitRepresentanteRecibidor>` : `` }
                </intervinientes>`:``}
                <datosCarga>
                    <codGrano>${codGrano}</codGrano>
                    <cosecha>${cosecha}</cosecha>
                    <pesoBruto>${pesoBruto}</pesoBruto>
                    <pesoTara>${pesoTara}</pesoTara>
                </datosCarga>
                <destino>
                    <cuit>${cuit_destino}</cuit>
                    <esDestinoCampo>${esDestinoCampo}</esDestinoCampo>
                    <codProvincia>${destino_codProvincia}</codProvincia>
                    <codLocalidad>${destino_codLocalidad}</codLocalidad>
                    ${destino_planta ? `<planta>${destino_planta}</planta>` : ``}
                </destino>
                <destinatario>
                    <cuit>${cuit_destinatario}</cuit>
                </destinatario>
                <transporte>
                    <cuitTransportista>${cuitTransportista}</cuitTransportista>
                    ${dominios.map(dominio => {
                        return `<dominio>${dominio}</dominio>`
                    }).join('\n                    ')}
                    <fechaHoraPartida>${fechaHoraPartida}</fechaHoraPartida>
                    <kmRecorrer>${kmRecorrer}</kmRecorrer>
                    ${codigoTurno ? `<codigoTurno>${codigoTurno}</codigoTurno>` : ``}
                    <cuitChofer>${cuitChofer}</cuitChofer>
                    ${tarifa ? `<tarifa>${tarifa}</tarifa>` : ``}
                    <cuitPagadorFlete>${cuitPagadorFlete}</cuitPagadorFlete>
                    ${cuitIntermediarioFlete ? `<cuitIntermediarioFlete>${cuitIntermediarioFlete}</cuitIntermediarioFlete>` : ``}
                    <mercaderiaFumigada>${mercaderiaFumigada}</mercaderiaFumigada>
                </transporte>
                ${observaciones ? `<observaciones>${observaciones}</observaciones>` : ``}
            </solicitud>
        </wsc:AutorizarCPEAutomotorReq>
    </soapenv:Body>
</soapenv:Envelope>`
    
    console.log(xmlRequest)

    return 0

    try {
        const respuesta = await consultaSOAP('autorizarCPEAutomotor', xmlRequest)

        return respuesta['soap:Envelope']['soap:Body']['ns2:AutorizarCPEAutomotorResp']['respuesta']
    } catch (error) {
        return error
    }
}



/*
consultarCPEAutomotor({ cuitRepresentada: 30714518549, cuitSolicitante: 30714518549, tipoCPE: 74, sucursal: 1, nroOrden: 1000 })
    .then(res => {
        fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarPlantas({ cuitRepresentada: 30714518549, cuitConsulta: 30700869918})
.then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarUltNumOrden({ cuitRepresentada: 30714518549, sucursal: 1, tipoCPE: 74})
.then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarLocalidadesProductor({ cuitRepresentada: 30714518549, cuitConsulta: 30714518549 })
    .then(res => {
        fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
    })
consultarCPEAutomotor({ cuitRepresentada: 30714518549, cuitSolicitante: 30714518549, tipoCPE: 74, sucursal: 1, nroOrden: 123 })
    .then(res => {
        fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})*/

autorizarCPE({
    cuitRepresentada: '30714518549',
    tipoCP: 'tipoCP',
    cuitSolicitante: 'cuitSolicitante',
    sucursal: 'sucursal',
    nroOrden: 'nroOrden',
    origen_operador_codProvincia: 'origen_operador_codProvincia',
    origen_operador_codLocalidad: 'origen_operador_codLocalidad',
    origen_operador_planta: 'origen_operador_planta',
    origen_productor_codProvincia: 'origen_productor_codProvincia',
    origen_productor_codLocalidad: 'origen_productor_codLocalidad',
    latitud_grados: 'latitud_grados',
    latitud_minutos: 'latitud_minutos',
    latitud_segundos: 'latitud_segundos',
    longitud_grados: 'longitud_grados',
    longitud_minutos: 'longitud_minutos',
    longitud_segundos: 'longitud_segundos',
    ubicacionGeoreferencial: 'ubicacionGeoreferencial',
    correspondeRetiroProductor: 0,
    esSolicitanteCampo: 'esSolicitanteCampo',
    cuitRemitenteComercialProductor: '',
    cuitRemitenteComercialVentaPrimaria: '',
    cuitRemitenteComercialVentaSecundaria: '',
    cuitRemitenteComercialVentaSecundaria2: '',
    cuitMercadoATermino: '',
    cuitCorredorVentaPrimaria: '',
    cuitCorredorVentaSecundaria: '',
    cuitRepresentanteEntregador: '',
    cuitRepresentanteRecibidor: '',
    codGrano: 'codGrano',
    cosecha: 'cosecha',
    pesoBruto: 'pesoBruto',
    pesoTara: 'pesoTara',
    cuit_destino: 'cuit_destino',
    esDestinoCampo: 'esDestinoCampo',
    destino_codProvincia: 'destino_codProvincia',
    destino_codLocalidad: 'destino_codLocalidad',
    destino_planta: 'destino_planta',
    cuit_destinatario: 'cuit_destinatario',
    cuitTransportista: 'cuitTransportista',
    dominios: [1,2,3,4],
    fechaHoraPartida: 'fechaHoraPartida',
    kmRecorrer: 'kmRecorrer',
    codigoTurno: 'codigoTurno',
    cuitChofer: 'cuitChofer',
    tarifa: 'tarifa',
    cuitPagadorFlete: 'cuitPagadorFlete',
    cuitIntermediarioFlete: 'cuitIntermediarioFlete',
    mercaderiaFumigada: 'mercaderiaFumigada',
    observaciones: ''
})