const fs = require('fs');

// Leer el archivo JSON con las credenciales
const ticket = JSON.parse(fs.readFileSync('ticket.json', 'utf8'));

const token = ticket.token;
const sign = ticket.sign;

const operacion = 'FEParamGetPtosVenta';

const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soapenv:Header/>
    <soapenv:Body>
        <${operacion} xmlns="http://ar.gov.afip.dif.FEV1/">
            <Auth>
                <Token>${token}</Token>
                <Sign>${sign}</Sign>
                <Cuit>27160862691</Cuit> <!-- TU CUIT -->
            </Auth>
            <PtoVta>3</PtoVta> <!-- Punto de venta -->
            <CbteTipo>6</CbteTipo> <!-- Tipo de comprobante (Factura B = 6) -->
        </${operacion}>
    </soapenv:Body>
</soapenv:Envelope>`;



const axios = require('axios');

async function consultarWSFE() {
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    const url = 'https://servicios1.afip.gov.ar/wsfev1/service.asmx';
    const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `http://ar.gov.afip.dif.FEV1/${operacion}`
    };

    try {
        const response = await axios.post(url, xmlRequest, { headers });
        console.log('Respuesta de AFIP:', response.data);

        parser.parseStringPromise(response.data)
            .then(result => {

                // Guardar en archivo JSON
                fs.writeFileSync(`ticketresult-${new Date().getTime()}.json`, JSON.stringify(result, null, 2), 'utf8');

            })
            .catch(err => console.error('Error al parsear XML:', err));
    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}

consultarWSFE();