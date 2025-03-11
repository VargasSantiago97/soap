const fs = require('fs');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const ticket = JSON.parse(fs.readFileSync('ticket.json', 'utf8'));

const token = ticket.token;
const sign = ticket.sign;
const cuitRepresentada = 30714518549

const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';


async function consultarCPEAutomotor({cuitRepresentada, nroCTG = 0, cuitSolicitante = null, tipoCPE = null, sucursal = null, nroOrden = null}) {

    var xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
    <soapenv:Header/>
    <soapenv:Body>
        <wsc:ConsultarCPEAutomotorReq>
            <auth>
                <token>${token}</token>
                <sign>${sign}</sign>
                <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            </auth>
            <solicitud>`

    if(nroCTG){
        xmlRequest += `<nroCTG>${nroCTG}</nroCTG>`
    } else {
        xmlRequest += `<cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
            <cartaPorte>
                <tipoCPE>${tipoCPE}</tipoCPE>
                <sucursal>${sucursal}</sucursal>
                <nroOrden>${nroOrden}</nroOrden>
            </cartaPorte>`
    }

    xmlRequest += `</solicitud>
        </wsc:ConsultarCPEAutomotorReq>
    </soapenv:Body>
</soapenv:Envelope>`

    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/consultarCPEAutomotor`
            },
            xml: xmlRequest,
        });

        const parser = new xml2js.Parser({ explicitArray: false });

        parser.parseStringPromise(response.body)
            .then(result => {

                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');
            })
            .catch(err => console.error('Error al parsear XML:', err));

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

async function consultarPlantas() {
    const soapRequest = require('easy-soap-request');
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

    const xmlRequestPlantas = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
   <soapenv:Header/>
   <soapenv:Body>
      <wsc:ConsultarPlantasReq>
            <auth>
                <token>${token}</token>
                <sign>${sign}</sign>
                <cuitRepresentada>30714518549</cuitRepresentada>
            </auth>
            <solicitud>
                <cuit>30700869918</cuit>
            </solicitud>
      </wsc:ConsultarPlantasReq>
   </soapenv:Body>
</soapenv:Envelope>`

    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/consultarPlantas`
            },
            xml: xmlRequestPlantas,
        });

        parser.parseStringPromise(response.body)
            .then(result => {
                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');
            })
            .catch(err => console.error('Error al parsear XML:', err));

    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}

async function consultarUltNumOrden() {
    const soapRequest = require('easy-soap-request');
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

    const xmlRequestUltNumOrden = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
   <soapenv:Header/>
   <soapenv:Body>
      <wsc:ConsultarUltNroOrdenReq>
            <auth>
                <token>${token}</token>
                <sign>${sign}</sign>
                <cuitRepresentada>30714518549</cuitRepresentada>
            </auth>
         <solicitud>
            <sucursal>2</sucursal>
            <tipoCPE>74</tipoCPE>
         </solicitud>
      </wsc:ConsultarUltNroOrdenReq>
   </soapenv:Body>
</soapenv:Envelope>`

    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/consultarUltNroOrden`
            },
            xml: xmlRequestUltNumOrden,
        });

        parser.parseStringPromise(response.body)
            .then(result => {
                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');
            })
            .catch(err => console.error('Error al parsear XML:', err));

    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}

async function consultarLocalidadesProductor() {
    const soapRequest = require('easy-soap-request');
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

    const xmlRequestUltNumOrden = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
   <soapenv:Header/>
   <soapenv:Body>
      <wsc:ConsultarLocalidadesProductorReq>
            <auth>
                <token>${token}</token>
                <sign>${sign}</sign>
                <cuitRepresentada>30714518549</cuitRepresentada>
            </auth>
         <solicitud>
            <cuit>30715327720</cuit>
         </solicitud>
      </wsc:ConsultarLocalidadesProductorReq>
   </soapenv:Body>
</soapenv:Envelope>`

    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/consultarLocalidadesProductor`
            },
            xml: xmlRequestUltNumOrden,
        });

        parser.parseStringPromise(response.body)
            .then(result => {
                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');
            })
            .catch(err => console.error('Error al parsear XML:', err));

    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}


async function autorizarCPE() {
    const soapRequest = require('easy-soap-request');
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

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
               <tipoCP>74</tipoCP>
               <cuitSolicitante>30714518549</cuitSolicitante>
               <sucursal>1</sucursal>
               <nroOrden>1665</nroOrden>
            </cabecera>
            <origen>
               <!--Optional:-->
               <productor>
                  <codProvincia>16</codProvincia>
                  <codLocalidad>10583</codLocalidad>
               </productor>
            </origen>
            <correspondeRetiroProductor>0</correspondeRetiroProductor>
            <esSolicitanteCampo>1</esSolicitanteCampo>
            <datosCarga>
               <codGrano>19</codGrano>
               <cosecha>2324</cosecha>
               <pesoBruto>45000</pesoBruto>
               <pesoTara>15000</pesoTara>
            </datosCarga>
            <destino>
               <cuit>30700869918</cuit>
               <esDestinoCampo>0</esDestinoCampo>
               <codProvincia>16</codProvincia>
               <codLocalidad>943</codLocalidad>
               <!--Optional:-->
               <planta>23475</planta>
            </destino>
            <destinatario>
               <cuit>30700869918</cuit>
            </destinatario>
            <transporte>
               <cuitTransportista>30714518549</cuitTransportista>
               <!--1 or more repetitions:-->
               <dominio>NPM337</dominio>
               <dominio>AF336PH</dominio>
               <fechaHoraPartida>2025-03-10T23:30:00Z</fechaHoraPartida>
               <kmRecorrer>25</kmRecorrer>
               <cuitChofer>20237400195</cuitChofer>
               <cuitPagadorFlete>30714518549</cuitPagadorFlete>
               <mercaderiaFumigada>1</mercaderiaFumigada>
            </transporte>
         </solicitud>
      </wsc:AutorizarCPEAutomotorReq>
   </soapenv:Body>
</soapenv:Envelope>`

    try {
        const { response } = await soapRequest({
            url: url,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `https://serviciosjava.afip.gob.ar/wscpe/autorizarCPEAutomotor`
            },
            xml: xmlRequestUltNumOrden,
        });

        parser.parseStringPromise(response.body)
            .then(result => {
                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');
            })
            .catch(err => console.error('Error al parsear XML:', err));

    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}

//consultarWSCPE();
//consultarPlantas();
//consultarUltNumOrden()
//consultarLocalidadesProductor()
consultarCPEAutomotor({cuitRepresentada: cuitRepresentada, nroCTG: 10121719398})