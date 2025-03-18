const fs = require('fs');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const WSAA = require('./wsaa')
const url = 'https://servicios1.afip.gov.ar/wsfev1/service.asmx';

class WSFE {

    async consultaSOAP(metodo, xmlRequest) {
        try {
            const { response } = await soapRequest({
                url: url,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': `http://ar.gov.afip.dif.FEV1/${metodo}`
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

    async FECompUltimoAutorizado(cuitRepresentada, PtoVta, CbteTipo) {

        const wsaa = new WSAA(cuitRepresentada, 'wsfe')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
    <soapenv:Header/>
    <soapenv:Body>
        <ar:FECompUltimoAutorizado>
            <ar:Auth>
                <ar:Token>${ticket.token}</ar:Token>
                <ar:Sign>${ticket.sign}</ar:Sign>
                <ar:Cuit>${cuitRepresentada}</ar:Cuit>
            </ar:Auth>
            <ar:PtoVta>${PtoVta}</ar:PtoVta>
            <ar:CbteTipo>${CbteTipo}</ar:CbteTipo>
        </ar:FECompUltimoAutorizado>
    </soapenv:Body>
    </soapenv:Envelope>`;

        try {
            const respuesta = await this.consultaSOAP('FECompUltimoAutorizado', xmlRequest)
            return respuesta ['soap:Envelope']['soap:Body']['FECompUltimoAutorizadoResponse']['FECompUltimoAutorizadoResult']
        } catch (error) {
            return error
        }
    }

    async FEParamGetPtosVenta(cuitRepresentada) {

        const wsaa = new WSAA(cuitRepresentada, 'wsfe')
        const ticket = await wsaa.obtenerTicket()

        const xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
    <soapenv:Header/>
    <soapenv:Body>
        <ar:FEParamGetPtosVenta>
            <ar:Auth>
                <ar:Token>${ticket.token}</ar:Token>
                <ar:Sign>${ticket.sign}</ar:Sign>
                <ar:Cuit>${cuitRepresentada}</ar:Cuit>
            </ar:Auth>
        </ar:FEParamGetPtosVenta>
    </soapenv:Body>
    </soapenv:Envelope>`;

        try {
            const respuesta = await this.consultaSOAP('FEParamGetPtosVenta', xmlRequest)
            return respuesta ['soap:Envelope']['soap:Body']['FEParamGetPtosVentaResponse']['FEParamGetPtosVentaResult']
        } catch (error) {
            return error
        }
    }
}

const wsfe = new WSFE()
/*
wsfe.FECompUltimoAutorizado(27160862691, 3, 6).then(res => {
    //fs.writeFileSync(`ticketresultFE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
    console.log(res)
})
*/
wsfe.FEParamGetPtosVenta(27160862691).then(res => {
    //fs.writeFileSync(`ticketresultFE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
    console.log(res['ResultGet']['PtoVenta'])
})