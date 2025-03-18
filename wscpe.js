const fs = require('fs');
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const WSAA = require('./wsaa')
const url = 'https://cpea-ws.afip.gob.ar/wscpe/services/soap';

class WSCPE {

    async consultaSOAP(metodo, xmlRequest) {
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

    async guardarPDF(base64String, nombreArchivo = "documento.pdf") {
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

    async dummy() {
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body/>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('dummy', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:DummyResp']['respuesta']
        } catch (error) {
            return error
        }
    }

    async consultarCPEAutomotor({ cuitRepresentada, nroCTG = 0, cuitSolicitante = null, tipoCPE = null, sucursal = null, nroOrden = null }) {
    
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
            const respuesta = await this.consultaSOAP('consultarCPEAutomotor', xmlRequest)
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }

    async consultarPlantas({ cuitRepresentada, cuitConsulta }) {
    
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
            const respuesta = await this.consultaSOAP('consultarPlantas', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarPlantasResp']['respuesta']
    
        } catch (error) {
            return error
        }
    
    }

    async consultarUltNumOrden({ cuitRepresentada, sucursal, tipoCPE }) {

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
            const respuesta = await this.consultaSOAP('consultarUltNroOrden', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarUltNroOrdenResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarLocalidadesProductor({ cuitRepresentada, cuitConsulta }) {
    
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
            const respuesta = await this.consultaSOAP('consultarLocalidadesProductor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarLocalidadesProductorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarLocalidadesPorProvincia({ cuitRepresentada, codProvincia }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConsultarLocalidadesPorProvinciaReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <codProvincia>${codProvincia}</codProvincia>
                    </solicitud>
                </wsc:ConsultarLocalidadesPorProvinciaReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('consultarLocalidadesPorProvincia', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarLocalidadesPorProvinciaResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarProvincias({ cuitRepresentada }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConsultarProvinciasReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                </wsc:ConsultarProvinciasReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('consultarProvincias', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarProvinciasResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarTiposGrano({ cuitRepresentada }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConsultarTiposGranoReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                </wsc:ConsultarTiposGranoReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('consultarTiposGrano', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarTiposGranoResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async autorizarCPEAutomotor({
        cuitRepresentada,
    
        //CABECERA
        tipoCP,
        cuitSolicitante,
        sucursal,
    
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
    
        const ultNroOrden = await this.consultarUltNumOrden({ cuitRepresentada: cuitRepresentada, sucursal: sucursal, tipoCPE: tipoCP })
        const nroOrden = parseInt(ultNroOrden['nroOrden']) + 1
    
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
                            </coordenadasGPS>`: ``}
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
                        ${cuitRemitenteComercialVentaPrimaria ? `<cuitRemitenteComercialVentaPrimaria>${cuitRemitenteComercialVentaPrimaria}</cuitRemitenteComercialVentaPrimaria>` : ``}
                        ${cuitRemitenteComercialVentaSecundaria ? `<cuitRemitenteComercialVentaSecundaria>${cuitRemitenteComercialVentaSecundaria}</cuitRemitenteComercialVentaSecundaria>` : ``}
                        ${cuitRemitenteComercialVentaSecundaria2 ? `<cuitRemitenteComercialVentaSecundaria2>${cuitRemitenteComercialVentaSecundaria2}</cuitRemitenteComercialVentaSecundaria2>` : ``}
                        ${cuitMercadoATermino ? `<cuitMercadoATermino>${cuitMercadoATermino}</cuitMercadoATermino>` : ``}
                        ${cuitCorredorVentaPrimaria ? `<cuitCorredorVentaPrimaria>${cuitCorredorVentaPrimaria}</cuitCorredorVentaPrimaria>` : ``}
                        ${cuitCorredorVentaSecundaria ? `<cuitCorredorVentaSecundaria>${cuitCorredorVentaSecundaria}</cuitCorredorVentaSecundaria>` : ``}
                        ${cuitRepresentanteEntregador ? `<cuitRepresentanteEntregador>${cuitRepresentanteEntregador}</cuitRepresentanteEntregador>` : ``}
                        ${cuitRepresentanteRecibidor ? `<cuitRepresentanteRecibidor>${cuitRepresentanteRecibidor}</cuitRepresentanteRecibidor>` : ``}
                    </intervinientes>`: ``}
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
                }).join('')}
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
    
        try {
            const respuesta = await this.consultaSOAP('autorizarCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:AutorizarCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async anularCPE({ cuitRepresentada, tipoCPE, sucursal, nroOrden, anulacionMotivo, anulacionObservaciones }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:AnularCPEReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        ${anulacionMotivo ? `<anulacionMotivo>${anulacionMotivo}</anulacionMotivo>` : ``}
                        ${anulacionObservaciones ? `<anulacionObservaciones>${anulacionObservaciones}</anulacionObservaciones>` : ``}
                    </solicitud>
                </wsc:AnularCPEReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('anularCPE', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:AnularCPEResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async informarContingencia({
        cuitRepresentada,
    
        tipoCPE,
        sucursal,
        nroOrden,
    
        concepto, //A, B, C, D, E, F: descripcion
        descripcion //si concepto F
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        /*
        A: Siniestro
        B: Imposibilidad de tránsito por zona desfavorable
        C: Desperfecto Mecánico
        D: Accidente
        E: Demora de descarga
        F: Otro //detallar
        */
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:InformarContingenciaReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        <contingencia>
                            <concepto>${concepto}</concepto>
                            ${concepto == 'F' ? `<descripcion>${descripcion}</descripcion>` : ``}
                        </contingencia>
                    </solicitud>
                </wsc:InformarContingenciaReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('informarContingencia', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:InformarContingenciaResp']['respuesta']
        } catch (error) {
            return error
        }
    
    }
    
    async cerrarContingenciaCPE({
        cuitRepresentada,
        tipoCPE,
        sucursal,
        nroOrden,
        concepto, //A reactivacion, B extension, C desactivacion
        reactivacion_cuitTransportista, //si concepto A ó reactivacion_nroOperativo
        reactivacion_nroOperativo, //si concepto A ó reactivacion_cuitTransportista
        desactivacion_concepto, //A destruccion del vehiculo, B destruccion de la carga, C otro
        desactivacion_descripcion //si des C
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        /*
        MOTIVO CIERRE CONTINGENCIA:
        A: Reactivación para Descarga en Destino
        B: Extensión de tiempo de contingencia
        C: Desactivar definitivamente la Carta de Porte //DETALLAR MOTIVO (ABAJO)
    
        MOTIVO DESACTIVACION CONTINGENCIA:
        A: Destrucción del Vehículo
        B: Destrucción de la Carga
        C: Otro //DETALLAR
        */
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:CerrarContingenciaCPEReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        <concepto>${concepto}</concepto>
                        ${concepto == 'A' ?
                `<reactivacionDestino>
                            ${reactivacion_cuitTransportista ?
                    `<cuitTransportista>${reactivacion_cuitTransportista}</cuitTransportista>` :
                    `<nroOperativo>${reactivacion_nroOperativo}</nroOperativo>`}
                        </reactivacionDestino>
                        `: ``}
                        ${concepto == 'C' ?
                `<motivoDesactivacionCP>
                            <concepto>${desactivacion_concepto}</concepto>
                            ${desactivacion_concepto == 'C' ? `<descripcion>${desactivacion_descripcion}</descripcion>` : ``}
                        </motivoDesactivacionCP>
                        `: ``}
                    </solicitud>
                </wsc:CerrarContingenciaCPEReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('cerrarContingenciaCPE', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:CerrarContingenciaCPEResp']['respuesta']
        } catch (error) {
            return error
        }
    
    }
    
    async editarCPEAutomotor({
        cuitRepresentada,
        nroCTG,
        cuitRemitenteComercialVentaPrimaria, //OPC
        cuitRemitenteComercialVentaSecundaria, //OPC
        cuitRemitenteComercialVentaSecundaria2, //OPC
        cuitCorredorVentaPrimaria, //OPC
        cuitCorredorVentaSecundaria, //OPC
        cuitDestinatario,
        cuitChofer,
        cuitTransportista,
    
        //DESTINO
        cuitDestino,
        esDestinoCampo,
        codProvincia,
        codLocalidad,
        planta, //OPC
    
        cosecha, //OPC
        pesoBruto,
        codGrano,
        dominios = [],
        kmRecorrer, //OPC
        tarifa, //OPC
        observaciones //OPC
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:EditarCPEAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <nroCTG>${nroCTG}</nroCTG>
                        ${cuitRemitenteComercialVentaPrimaria ? `<cuitRemitenteComercialVentaPrimaria>${cuitRemitenteComercialVentaPrimaria}</cuitRemitenteComercialVentaPrimaria>` : ``}
                        ${cuitRemitenteComercialVentaSecundaria ? `<cuitRemitenteComercialVentaSecundaria>${cuitRemitenteComercialVentaSecundaria}</cuitRemitenteComercialVentaSecundaria>` : ``}
                        ${cuitRemitenteComercialVentaSecundaria2 ? `<cuitRemitenteComercialVentaSecundaria2>${cuitRemitenteComercialVentaSecundaria2}</cuitRemitenteComercialVentaSecundaria2>` : ``}
                        ${cuitCorredorVentaPrimaria ? `<cuitCorredorVentaPrimaria>${cuitCorredorVentaPrimaria}</cuitCorredorVentaPrimaria>` : ``}
                        ${cuitCorredorVentaSecundaria ? `<cuitCorredorVentaSecundaria>${cuitCorredorVentaSecundaria}</cuitCorredorVentaSecundaria>` : ``}
                        <cuitDestinatario>${cuitDestinatario}</cuitDestinatario>
                        <cuitChofer>${cuitChofer}</cuitChofer>
                        <cuitTransportista>${cuitTransportista}</cuitTransportista>
                        <destino>
                            <cuit>${cuitDestino}</cuit>
                            <esDestinoCampo>${esDestinoCampo}</esDestinoCampo>
                            <codProvincia>${codProvincia}</codProvincia>
                            <codLocalidad>${codLocalidad}</codLocalidad>
                            ${planta ? `<planta>${planta}</planta>` : ``}
                        </destino>
                        ${cosecha ? `<cosecha>${cosecha}</cosecha>` : ``}
                        <pesoBruto>${pesoBruto}</pesoBruto>
                        <codGrano>${codGrano}</codGrano>
                        ${dominios.map(dominio => {
            return `<dominio>${dominio}</dominio>`
        }).join('')}
                        ${kmRecorrer ? `<kmRecorrer>${kmRecorrer}</kmRecorrer>` : ``}
                        ${tarifa ? `<tarifa>${tarifa}</tarifa>` : ``}
                        ${observaciones ? `<observaciones>${observaciones}</observaciones>` : ``}
                    </solicitud>
                </wsc:EditarCPEAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('editarCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:EditarCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }

    async nuevoDestinoDestinatarioCPEAutomotor({
        cuitRepresentada,
    
        tipoCPE,
        sucursal,
        nroOrden,
    
        //DESTINO
        cuitDestino,
        esDestinoCampo,
        codProvincia,
        codLocalidad,
        planta, //OPC
    
        //DESTINATARIO
        cuitDestinatario,
    
        //TRANSPORTE
        fechaHoraPartida,
        kmRecorrer,
        codigoTurno //OPC
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:NuevoDestinoDestinatarioCPEAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        <destino>
                            <cuit>${cuitDestino}</cuit>
                            <esDestinoCampo>${esDestinoCampo}</esDestinoCampo>
                            <codProvincia>${codProvincia}</codProvincia>
                            <codLocalidad>${codLocalidad}</codLocalidad>
                            ${planta ? `<planta>${planta}</planta>` : ``}
                        </destino>
                        ${cuitDestinatario ? `<destinatario>
                            <cuit>${cuitDestinatario}</cuit>
                        </destinatario>` : ``}
                        <transporte>
                            <fechaHoraPartida>${fechaHoraPartida}</fechaHoraPartida>
                            <kmRecorrer>${kmRecorrer}</kmRecorrer>
                            ${codigoTurno ? `<codigoTurno>${codigoTurno}</codigoTurno>` : ``}
                        </transporte>
                    </solicitud>
                </wsc:NuevoDestinoDestinatarioCPEAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('nuevoDestinoDestinatarioCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:NuevoDestinoDestinatarioCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async regresoOrigenCPEAutomotor({
        cuitRepresentada,
    
        tipoCPE,
        sucursal,
        nroOrden,
    
        //TRANSPORTE
        fechaHoraPartida,
        kmRecorrer,
        codigoTurno //OPC
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:RegresoOrigenCPEAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        <transporte>
                            <fechaHoraPartida>${fechaHoraPartida}</fechaHoraPartida>
                            <kmRecorrer>${kmRecorrer}</kmRecorrer>
                            ${codigoTurno ? `<codigoTurno>${codigoTurno}</codigoTurno>` : ``}
                        </transporte>
                    </solicitud>
                </wsc:RegresoOrigenCPEAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('regresoOrigenCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:RegresoOrigenCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async editarCPEConfirmadaAutomotor({
        cuitRepresentada,
        nroCTG,
    
        cuitRemitenteComercialVentaPrimaria, //OPC
        cuitRemitenteComercialVentaSecundaria, //OPC
        cuitCorredorVentaPrimaria, //OPC
        cuitCorredorVentaSecundaria, //OPC
        cuitRemitenteComercialProductor //OPC
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:EditarCPEConfirmadaAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <nroCTG>${nroCTG}</nroCTG>
                        <intervinientes>
                            ${cuitRemitenteComercialVentaPrimaria ? `<cuitRemitenteComercialVentaPrimaria>${cuitRemitenteComercialVentaPrimaria}</cuitRemitenteComercialVentaPrimaria>` : ``}
                            ${cuitRemitenteComercialVentaSecundaria ? `<cuitRemitenteComercialVentaSecundaria>${cuitRemitenteComercialVentaSecundaria}</cuitRemitenteComercialVentaSecundaria>` : ``}
                            ${cuitCorredorVentaPrimaria ? `<cuitCorredorVentaPrimaria>${cuitCorredorVentaPrimaria}</cuitCorredorVentaPrimaria>` : ``}
                            ${cuitCorredorVentaSecundaria ? `<cuitCorredorVentaSecundaria>${cuitCorredorVentaSecundaria}</cuitCorredorVentaSecundaria>` : ``}
                            ${cuitRemitenteComercialProductor ? `<cuitRemitenteComercialProductor>${cuitRemitenteComercialProductor}</cuitRemitenteComercialProductor>` : ``}
                        </intervinientes>
                    </solicitud>
                </wsc:EditarCPEConfirmadaAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('editarCPEConfirmadaAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:EditarCPEConfirmadaAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    //Para PLANTAS
    async desvioCPEAutomotor({
        cuitRepresentada,
        cuitSolicitante,
        tipoCPE,
        sucursal,
        nroOrden,
    
        destinoCuit,
        codProvincia,
        codLocalidad,
        planta,
        esDestinoCampo,
        fechaHoraPartida,
        kmRecorrer,
        codigoTurno //OPCIONAL
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:DesvioCPEAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        <destino>
                            <cuit>${destinoCuit}</cuit>
                            <codProvincia>${codProvincia}</codProvincia>
                            <codLocalidad>${codLocalidad}</codLocalidad>
                            <planta>${planta}</planta>
                            <esDestinoCampo>${esDestinoCampo}</esDestinoCampo>
                        </destino>
                        <transporte>
                            <fechaHoraPartida>${fechaHoraPartida}</fechaHoraPartida>
                            <kmRecorrer>${kmRecorrer}</kmRecorrer>
                            <codigoTurno>${codigoTurno}</codigoTurno>
                        </transporte>
                    </solicitud>
                </wsc:DesvioCPEAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('desvioCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:DesvioCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async confirmarArriboCPE({ cuitRepresentada, cuitSolicitante, tipoCPE, sucursal, nroOrden }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConfirmarArriboCPEReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                    </solicitud>
                </wsc:ConfirmarArriboCPEReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('confirmarArriboCPE', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConfirmarArriboCPEResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async confirmacionDefinitivaCPEAutomotor({
        cuitRepresentada,
        cuitSolicitante,
        tipoCPE,
        sucursal,
        nroOrden,
        cuitRepresentanteRecibidor, //OPC
        pesoBrutoDescarga,
        pesoTaraDescarga
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConfirmacionDefinitivaCPEAutomotorReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <cuitSolicitante>${cuitSolicitante}</cuitSolicitante>
                        <cartaPorte>
                            <tipoCPE>${tipoCPE}</tipoCPE>
                            <sucursal>${sucursal}</sucursal>
                            <nroOrden>${nroOrden}</nroOrden>
                        </cartaPorte>
                        ${cuitRepresentanteRecibidor ?
                `<intervinientes>
                            <cuitRepresentanteRecibidor>${cuitRepresentanteRecibidor}</cuitRepresentanteRecibidor>
                        </intervinientes>` : ``}
                        <pesoBrutoDescarga>${pesoBrutoDescarga}</pesoBrutoDescarga>
                        <pesoTaraDescarga>${pesoTaraDescarga}</pesoTaraDescarga>
                    </solicitud>
                </wsc:ConfirmacionDefinitivaCPEAutomotorReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('confirmacionDefinitivaCPEAutomotor', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConfirmacionDefinitivaCPEAutomotorResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarCPEPorDestino({
        cuitRepresentada,
        planta,
        fechaPartidaDesde,
        fechaPartidaHasta,
        tipoCartaPorte //OPCIONAL
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConsultarCPEPorDestinoReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <planta>${planta}</planta>
                        <fechaPartidaDesde>${fechaPartidaDesde}</fechaPartidaDesde>
                        <fechaPartidaHasta>${fechaPartidaHasta}</fechaPartidaHasta>
                        ${tipoCartaPorte ? `<tipoCartaPorte>${tipoCartaPorte}</tipoCartaPorte>` : ``}
                    </solicitud>
                </wsc:ConsultarCPEPorDestinoReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('consultarCPEPorDestino', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarCPEPorDestinoResp']['respuesta']
        } catch (error) {
            return error
        }
    }
    
    async consultarCPEPPendientesDeResolucion({
        cuitRepresentada,
        perfil,
        planta, //OPCIONAL
    }) {
    
        const wsaa = new WSAA(cuitRepresentada, 'wscpe')
        const ticket = await wsaa.obtenerTicket()
    
        const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="https://serviciosjava.afip.gob.ar/wscpe/">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:ConsultarCPEPPendientesDeResolucionReq>
                    <auth>
                        <token>${ticket.token}</token>
                        <sign>${ticket.sign}</sign>
                        <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
                    </auth>
                    <solicitud>
                        <perfil>${perfil}</perfil>
                        ${planta ? `<planta>${planta}</planta>` : ``}
                    </solicitud>
                </wsc:ConsultarCPEPPendientesDeResolucionReq>
            </soapenv:Body>
        </soapenv:Envelope>`
    
        try {
            const respuesta = await this.consultaSOAP('consultarCPEPPendientesDeResolucion', xmlRequest)
    
            return respuesta['soap:Envelope']['soap:Body']['ns2:ConsultarCPEPPendientesDeResolucionResp']['respuesta']
        } catch (error) {
            return error
        }
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
})
autorizarCPEAutomotor({
    cuitRepresentada: '30714518549',
    tipoCP: '74',
    cuitSolicitante: 'cuitSolicitante',
    sucursal: '1',
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
}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
anularCPE({ cuitRepresentada, tipoCPE, sucursal, nroOrden, anulacionMotivo, anulacionObservaciones }).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})

MOTIVOS ANULACION:
1 - Siniestro
2 - Pérdida de la carga
3 - Otro //detallar

MOTIVOS CONTINGENCIA:
A: Siniestro
B: Imposibilidad de tránsito por zona desfavorable
C: Desperfecto Mecánico
D: Accidente
E: Demora de descarga
F: Otro //detallar


MOTIVO CIERRE CONTINGENCIA: ( concepto (? )
A: Reactivación para Descarga en Destino
B: Extensión de tiempo de contingencia
C: Desactivar definitivamente la Carta de Porte //DETALLAR MOTIVO (ABAJO)

MOTIVO DESACTIVACION CONTINGENCIA:
A: Destrucción del Vehículo
B: Destrucción de la Carga
C: Otro //DETALLAR

cerrarContingenciaCPE({
    cuitRepresentada: 30714518549,
    tipoCPE: 74,
    sucursal: 2,
    nroOrden: 425,
    concepto: 'A', //A reactivacion, B extension, C desactivacion
    reactivacion_cuitTransportista: 30714518549, //si concepto A ó reactivacion_nroOperativo
    reactivacion_nroOperativo: '', //si concepto A ó reactivacion_cuitTransportista
    desactivacion_concepto: '', //si concepto C: A destruccion del vehiculo, B destruccion de la carga, C otro
    desactivacion_descripcion: '' //si des C
}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
editarCPEAutomotor({
    cuitRepresentada: 30714518549, 
    nroCTG: 10121036917,
    cuitRemitenteComercialVentaPrimaria: '', //OPC
    cuitRemitenteComercialVentaSecundaria: '', //OPC
    cuitRemitenteComercialVentaSecundaria2: '', //OPC
    cuitCorredorVentaPrimaria: '', //OPC
    cuitCorredorVentaSecundaria: '', //OPC
    cuitDestinatario: 30714518549,
    cuitChofer: 20429875405,
    cuitTransportista: 30714518549,
    
    //DESTINO
    cuitDestino: 30714518549,
    esDestinoCampo: 1,
    codProvincia: 16,
    codLocalidad: 10583,
    planta: '', //OPC

    cosecha: 2425, //OPC
    pesoBruto: 45000,
    codGrano: 2,
    dominios: ['SGI191', 'LCA847'],
    kmRecorrer: 5, //OPC
    tarifa: 5000, //OPC
    observaciones: '' //OPC
}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
confirmarArriboCPE({ cuitRepresentada: 30714518549, cuitSolicitante: 30714518549, tipoCPE: 74, sucursal: 2, nroOrden: 425}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
confirmacionDefinitivaCPEAutomotor({ cuitRepresentada: 30714518549, cuitSolicitante: 30714518549, tipoCPE: 74, sucursal: 2, nroOrden: 425, cuitRepresentanteRecibidor: "", pesoBrutoDescarga: 45000, pesoTaraDescarga:15440}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarCPEPorDestino({ 
    cuitRepresentada: 30714518549,
    planta: 23475,
    fechaPartidaDesde: '2025-02-25',
    fechaPartidaHasta: '2025-02-27',
    tipoCartaPorte: 74 //OPCIONAL
}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarCPEPPendientesDeResolucion({ 
    cuitRepresentada: 30714518549,
    perfil: 'S', //S: Solicitante - D: Destino
    planta: 23475, //OPCIONAL
}).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarLocalidadesPorProvincia({ cuitRepresentada: 30714518549, codProvincia: 16 }).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})
consultarTiposGrano({ cuitRepresentada: 30714518549 }).then(res => {
    fs.writeFileSync(`ticketresultCPE-${new Date().getTime()}.json`, JSON.stringify(res, null, 4), 'utf8');
})

NuevoDestinoDestinatarioCPEAutomotorReq

RegresoOrigenCPEAutomotorReq
*/

module.exports = WSCPE