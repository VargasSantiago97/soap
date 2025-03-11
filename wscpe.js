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

async function autorizarCPE() {

    const xmlRequestUltNumOrden = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
    <soapenv:Header/>
    <soapenv:Body>
        <wsc:AutorizarCPEAutomotorReq>
            <auth>
                <token>${token}</token>
                <sign>${sign}</sign>
                <cuitRepresentada>30714518549</cuitRepresentada>
            </auth>
            <solicitud>
                <cabecera>
                    <tipoCP>?</tipoCP>
                    <cuitSolicitante>?</cuitSolicitante>
                    <sucursal>?</sucursal>
                    <nroOrden>?</nroOrden>
                </cabecera>
                <origen>
                    <!--Optional:-->
                    <operador>
                        <codProvincia>?</codProvincia>
                        <codLocalidad>?</codLocalidad>
                        <planta>?</planta>
                    </operador>
                    <!--Optional:-->
                    <productor>
                        <codProvincia>?</codProvincia>
                        <codLocalidad>?</codLocalidad>
                        <!--Optional:-->
                        <coordenadasGPS>
                            <latitud>
                                <grados>?</grados>
                                <minutos>?</minutos>
                                <segundos>?</segundos>
                            </latitud>
                            <longitud>
                                <grados>?</grados>
                                <minutos>?</minutos>
                                <segundos>?</segundos>
                            </longitud>
                            <!--Optional:-->
                            <ubicacionGeoreferencial>?</ubicacionGeoreferencial>
                        </coordenadasGPS>
                    </productor>
                </origen>
                <correspondeRetiroProductor>?</correspondeRetiroProductor>
                <esSolicitanteCampo>?</esSolicitanteCampo>
                <!--Optional:-->
                <retiroProductor>
                    <cuitRemitenteComercialProductor>?</cuitRemitenteComercialProductor>
                </retiroProductor>
                <!--Optional:-->
                <intervinientes>
                    <!--Optional:-->
                    <cuitRemitenteComercialVentaPrimaria>?</cuitRemitenteComercialVentaPrimaria>
                    <!--Optional:-->
                    <cuitRemitenteComercialVentaSecundaria>?</cuitRemitenteComercialVentaSecundaria>
                    <!--Optional:-->
                    <cuitRemitenteComercialVentaSecundaria2>?</cuitRemitenteComercialVentaSecundaria2>
                    <!--Optional:-->
                    <cuitMercadoATermino>?</cuitMercadoATermino>
                    <!--Optional:-->
                    <cuitCorredorVentaPrimaria>?</cuitCorredorVentaPrimaria>
                    <!--Optional:-->
                    <cuitCorredorVentaSecundaria>?</cuitCorredorVentaSecundaria>
                    <!--Optional:-->
                    <cuitRepresentanteEntregador>?</cuitRepresentanteEntregador>
                    <!--Optional:-->
                    <cuitRepresentanteRecibidor>?</cuitRepresentanteRecibidor>
                </intervinientes>
                <datosCarga>
                    <codGrano>?</codGrano>
                    <cosecha>?</cosecha>
                    <pesoBruto>?</pesoBruto>
                    <pesoTara>?</pesoTara>
                </datosCarga>
                <destino>
                    <cuit>?</cuit>
                    <esDestinoCampo>?</esDestinoCampo>
                    <codProvincia>?</codProvincia>
                    <codLocalidad>?</codLocalidad>
                    <!--Optional:-->
                    <planta>?</planta>
                </destino>
                <destinatario>
                    <cuit>?</cuit>
                </destinatario>
                <transporte>
                    <cuitTransportista>?</cuitTransportista>
                    <!--1 or more repetitions:-->
                    <dominio>?</dominio>
                    <fechaHoraPartida>?</fechaHoraPartida>
                    <kmRecorrer>?</kmRecorrer>
                    <!--Optional:-->
                    <codigoTurno>?</codigoTurno>
                    <cuitChofer>?</cuitChofer>
                    <!--Optional:-->
                    <tarifa>?</tarifa>
                    <cuitPagadorFlete>?</cuitPagadorFlete>
                    <!--Optional:-->
                    <cuitIntermediarioFlete>?</cuitIntermediarioFlete>
                    <mercaderiaFumigada>?</mercaderiaFumigada>
                </transporte>
                <!--Optional:-->
                <observaciones>?</observaciones>
            </solicitud>
        </wsc:AutorizarCPEAutomotorReq>
    </soapenv:Body>
</soapenv:Envelope>`

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
*/

//autorizarCPE()