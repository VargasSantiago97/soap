const fs = require('fs');
const forge = require('node-forge');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const WSAA_URL = "https://wsaa.afip.gov.ar/ws/services/LoginCms";

function formatearFecha(fecha) {
    var fechaEntrada = new Date(fecha)
    var fechaFormato = `${fechaEntrada.getFullYear()}-${(fechaEntrada.getMonth() + 1).toString().padStart(2, '0')}-${fechaEntrada.getDate().toString().padStart(2, '0')}`
    var horaFormato = `${fechaEntrada.getHours().toString().padStart(2, '0')}:${fechaEntrada.getMinutes().toString().padStart(2, '0')}:${fechaEntrada.getSeconds().toString().padStart(2, '0')}`
    return `${fechaFormato}T${horaFormato}Z`
}

class WSAA {
    constructor(cuitSolicitante, servicio) {
        this.cuitSolicitante = cuitSolicitante
        this.servicio = servicio
    }

    generarCMS() {
        const loginTicketRequestXML = `<?xml version="1.0" encoding="UTF-8"?>
        <loginTicketRequest version="1.0">
            <header>
                <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
                <generationTime>${formatearFecha(Date.now() + 10800000 - 180000)}</generationTime>
                <expirationTime>${formatearFecha(Date.now() + 1200 * 1000 + 10800000 - 180000)}</expirationTime>
            </header>
            <service>${this.servicio}</service>
        </loginTicketRequest>`;

        const CERT_FILE = `./certs/${this.cuitSolicitante}.crt`;
        const KEY_FILE = `./certs/${this.cuitSolicitante}.key`;

        const privateKeyPem = fs.readFileSync(KEY_FILE, 'utf-8');
        const certPem = fs.readFileSync(CERT_FILE, 'utf-8');

        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const cert = forge.pki.certificateFromPem(certPem);

        const signingTime = formatearFecha(Date.now())

        // Crear objeto PKCS#7
        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(loginTicketRequestXML, 'utf8');
        p7.addCertificate(cert);
        p7.addSigner({
            key: privateKey,
            certificate: cert,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
                { type: forge.pki.oids.signingTime, value: signingTime },
                { type: forge.pki.oids.messageDigest }
            ],
        });

        p7.sign();

        // Convertir a Base64 correctamente
        const cmsBase64 = Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary').toString('base64');

        return cmsBase64;
    }

    async generarTicket() {
        try {
            const cms = this.generarCMS(); // Asegúrate de que esta función existe y retorna un CMS válido.

            const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                                  xmlns:ar="http://ar.gov.afip.dif.wsaa/">
                    <soapenv:Header/>
                    <soapenv:Body>
                        <ar:loginCms>
                            <arg0>${cms}</arg0>
                        </ar:loginCms>
                    </soapenv:Body>
                </soapenv:Envelope>`;

            const { response } = await soapRequest({
                url: WSAA_URL,  // Asegúrate de que WSAA_URL está definida.
                headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '' },
                xml: xmlRequest,
            });

            const parser = new xml2js.Parser({ explicitArray: false });
            const parsedResponse = await parser.parseStringPromise(response.body);

            // Obtener el XML en base64
            const loginCmsReturnBase64 = parsedResponse['soapenv:Envelope']['soapenv:Body']['loginCmsResponse']['loginCmsReturn'];

            const parser_abajo = new xml2js.Parser({ explicitArray: false });
            const parsedTicket = await parser_abajo.parseStringPromise(loginCmsReturnBase64);

            const ticketAcceso = {
                token: parsedTicket.loginTicketResponse.credentials.token,
                sign: parsedTicket.loginTicketResponse.credentials.sign,
                expirationTime: parsedTicket.loginTicketResponse.header.expirationTime
            };

            // Guardar en archivo JSON
            const filePath = `./tickets/${this.servicio}_${this.cuitSolicitante}.json`;
            fs.writeFileSync(filePath, JSON.stringify(ticketAcceso, null, 2), 'utf8');

            return ticketAcceso; // Retorna el ticket
        } catch (error) {
            console.error('Error:', error);
            throw error; // Propaga el error
        }
    }

    async obtenerTicket() {
        if (fs.existsSync(`./tickets/${this.servicio}_${this.cuitSolicitante}.json`)) {
            const ticket = JSON.parse(fs.readFileSync(`./tickets/${this.servicio}_${this.cuitSolicitante}.json`, 'utf8'));

            const expirationTime = new Date(ticket.expirationTime).getTime()
            const ahora = Date.now()

            if (ahora < expirationTime) {
                return ticket
            }
        }

        const newTicket = await this.generarTicket()
        return newTicket
    }
}

module.exports = WSAA