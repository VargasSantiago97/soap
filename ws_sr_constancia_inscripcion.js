const fs = require('fs');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const WSAA = require('./wsaa')
const url = 'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5';

class WS_SR_CONSTANCIA_INSCRIPCION {

    async consultaSOAP(metodo, xmlRequest) {
        try {
            const { response } = await soapRequest({
                url: url,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': ``
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

    async dummy() {
        const xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
    <soapenv:Header/>
    <soapenv:Body>
        <a5:dummy/>
    </soapenv:Body>
</soapenv:Envelope>`

        try {
            const respuesta = await this.consultaSOAP('dummy', xmlRequest)

            return respuesta['soap:Envelope']['soap:Body']['ns2:dummyResponse']['return']
        } catch (error) {
            return error
        }
    }

    async getPersona({ cuitRepresentada, cuitConsulta }) {

        const wsaa = new WSAA(cuitRepresentada, 'ws_sr_constancia_inscripcion')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
    <soapenv:Header/>
    <soapenv:Body>
        <a5:getPersona>
            <token>${ticket.token}</token>
            <sign>${ticket.sign}</sign>
            <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            <idPersona>${cuitConsulta}</idPersona>
        </a5:getPersona>
    </soapenv:Body>
</soapenv:Envelope>`

        try {
            const respuesta = await this.consultaSOAP('getPersona', xmlRequest)

            return respuesta['soap:Envelope']['soap:Body']['ns2:getPersonaResponse']['personaReturn']

        } catch (error) {
            return error
        }

    }

    async getPersona_v2({ cuitRepresentada, cuitConsulta }) {

        const wsaa = new WSAA(cuitRepresentada, 'ws_sr_constancia_inscripcion')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
    <soapenv:Header/>
    <soapenv:Body>
        <a5:getPersona_v2>
            <token>${ticket.token}</token>
            <sign>${ticket.sign}</sign>
            <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            <idPersona>${cuitConsulta}</idPersona>
        </a5:getPersona_v2>
    </soapenv:Body>
</soapenv:Envelope>`

        try {
            const respuesta = await this.consultaSOAP('getPersona_v2', xmlRequest)

            return respuesta['soap:Envelope']['soap:Body']['ns2:getPersona_v2Response']['personaReturn']

        } catch (error) {
            return error
        }

    }

    async getPersonaList({ cuitRepresentada, cuitsConsulta = [] }) {

        const wsaa = new WSAA(cuitRepresentada, 'ws_sr_constancia_inscripcion')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
    <soapenv:Header/>
    <soapenv:Body>
        <a5:getPersonaList>
            <token>${ticket.token}</token>
            <sign>${ticket.sign}</sign>
            <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            ${cuitsConsulta.map( e => `<idPersona>${e}</idPersona>` ).join('') }
        </a5:getPersonaList>
    </soapenv:Body>
</soapenv:Envelope>`

        try {
            const respuesta = await this.consultaSOAP('getPersonaList', xmlRequest)

            return respuesta['soap:Envelope']['soap:Body']['ns2:getPersonaListResponse']['personaListReturn']['persona']

        } catch (error) {
            return error
        }

    }

    async getPersonaList_v2({ cuitRepresentada, cuitsConsulta = [] }) {

        const wsaa = new WSAA(cuitRepresentada, 'ws_sr_constancia_inscripcion')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
    <soapenv:Header/>
    <soapenv:Body>
        <a5:getPersonaList_v2>
            <token>${ticket.token}</token>
            <sign>${ticket.sign}</sign>
            <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
            ${cuitsConsulta.map( e => `<idPersona>${e}</idPersona>` ).join('') }
        </a5:getPersonaList_v2>
    </soapenv:Body>
</soapenv:Envelope>`

        try {
            const respuesta = await this.consultaSOAP('getPersonaList_v2', xmlRequest)

            return respuesta['soap:Envelope']['soap:Body']['ns2:getPersonaList_v2Response']['personaListReturn']['persona']

        } catch (error) {
            return error
        }

    }
}

module.exports = WS_SR_CONSTANCIA_INSCRIPCION