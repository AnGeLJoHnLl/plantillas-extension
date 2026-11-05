/* ──────────────────────────────────────────────
   HITSS Tickets — App Logic v7
   ────────────────────────────────────────────── */

// ════════════════════════════════
//  MODELOS
// ════════════════════════════════
const MODELOS = {
  hfc:  ['CGA2121 CM','F@ST3686 CM','FAST3686V2.2 CM','FAST3890V3 CM','Infinity601 CM','TG2482AL CM','TG3442A CM'],
  ftth: ['HG8145V5','F6600PV9.0.12','F680V6.0.08','HG8145X6-10','HG8145X6-13','HG8245W5-6T','F@ST5670v2'],
};

// Modelos específicos ONT FTTH por marca
const MODELOS_ONT_HUAWEI = ['HG8145V5','HG8145X6-10','HG8145X6-13','HG8245W5-6T'];
const MODELOS_ONT_ZTE    = ['F6600PV9.0.12','F680V6.0.08'];

// Decos: IPTV (ambas techs) + exclusivos HFC
const MODELOS_DECO = {
  iptv: ['B866V2','B866V2-H','SEI800AMXPE'],
  hfc:  ['DCX525','DTA 101','DCX700'],
};

// Repetidores WiFi
const MODELOS_REPETIDOR = [
  'REPETIDOR ZXHN H3601P 180000528400 ZTE',
  'ROUTER K562E-10 50087708 HUAWEI'
];

// ════════════════════════════════
//  GESTIONES ESTÁNDAR
// ════════════════════════════════
const GESTIONES = {
  activacion:          { titulo:'ACTIVACION',          labelEquipo:'EQUIPO ACTIVADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  migracion:           { titulo:'MIGRACION',           labelEquipo:'EQUIPO ACTIVADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  cambio_plan:         { titulo:'CAMBIO DE PLAN',      labelEquipo:'EQUIPO ACTIVADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  traslado_externo:    { titulo:'TRASLADO EXTERNO',    labelEquipo:'EQUIPO ACTIVADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  reenvio_senal:       { titulo:'REENVIO DE SEÑAL',    labelEquipo:'EQUIPO CON REENVIO DE SEÑAL', labelEstado:'CONFORMIDAD', mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  activacion_mesh:     { titulo:'ACTIVACION MESH',     labelEquipo:null,                          labelEstado:'ESTADO',      mostrarEquipo:false, mostrarMesh:true,  mostrarAgregar:true  },
  codigo_autorizacion: { titulo:'CODIGO AUTORIZACION', labelEquipo:'EQUIPO CON CODIGO',           labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  cambio_equipo:       { titulo:'CAMBIO DE EQUIPO',    labelEquipo:'EQUIPO DENEGADO / DAÑADO',    labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  sot_mantto:          { titulo:'SOT DE MANTO',        labelEquipo:'EQUIPO AFECTADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
  cambio_plano:        { titulo:'CAMBIO DE PLANO',     labelEquipo:'EQUIPO AFECTADO',             labelEstado:'ESTADO',      mostrarEquipo:true,  mostrarMesh:false, mostrarAgregar:true  },
};

// ════════════════════════════════
//  DERIVACION PEXT HFC SUBTIPOS
// ════════════════════════════════
const DERIVACION_PEXT_HFC_SUBTIPOS = {
  'PROBLEMAS CALIDAD CONECTIVIDAD': {
    campos: [
      { key:'niv_tap_us', key2:'niv_tap_ds', type:'dual', label:'Niveles TAP',  pre1:'Us=', pre2:'Ds=' },
      { key:'niv_cm_us',  key2:'niv_cm_ds',  type:'dual', label:'Niveles CM',   pre1:'Us=', pre2:'Ds=' },
      { key:'snr_ud',    label:'SNR Us-Ds',            type:'text', ph:'Ej. 30/38 dB' },
      { key:'ping',      label:'PING EXTENDIDO =',      type:'text', ph:'Ej. 100 ENV / 0 PERD' },
      { key:'ubic_tap',  label:'Ubicación TAP',         type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE / PISO', pre1:'TORRE:', pre2:'PISO:' },
      { key:'plano',     label:'Plano',                 type:'text' },
      { key:'valor_tap', label:'Valor TAP',             type:'text' },
      { key:'cint_cli',  label:'Cintillo CLI',          type:'text' },
      { key:'cint_ref',  label:'Cintillo REF',          type:'text' },
      { key:'obs',       label:'OBS',                   type:'text' },
    ],
    tmpl: [
      'Niveles TAP: Us={niv_tap_us}        Ds={niv_tap_ds}',
      'Niveles CM: Us={niv_cm_us}          Ds={niv_cm_ds}',
      'SNR Us-Ds: {snr_ud}',
      'PING EXTENDIDO = {ping}',
      'Ubicación TAP: {ubic_tap}',
      'TORRE: {torre}                 PISO: {piso}',
      'Plano: {plano}',
      'Valor TAP: {valor_tap}',
      'Cintillo CLI: {cint_cli}',
      'Cintillo REF: {cint_ref}',
      'OBS: {obs}',
    ],
  },
  'MALA SEÑAL CATV BASICO/DIGITAL': {
    campos: [
      { key:'snr_ib',  key2:'sig_ib',  type:'dual', label:'IN BAND SNR / SIGNAL POWER', pre1:'IN BAND SNR=', pre2:'SIGNAL POWER=' },
      { key:'frec_ib', label:'FRECUENCIA INBAND=',      type:'text', ph:'Ej. 123.45 MHz' },
      { key:'errores', label:'ERRORES / CORRECCIONES=', type:'text' },
      { key:'canal_tv',label:'CANAL TV PRUEBA=',         type:'text' },
      { key:'snr_obb', key2:'sig_obb', type:'dual', label:'OBB SNR / SIGNAL POWER', pre1:'OBB SNR=', pre2:'SIGNAL POWER=' },
      { key:'valor_tap',  label:'Valor TAP=',        type:'text' },
      { key:'ubic_tap',   label:'Ubicación TAP=',    type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE= / PISO=', pre1:'TORRE=', pre2:'PISO=' },
      { key:'plano',      label:'Plano=',             type:'text' },
      { key:'cint_cli',   label:'Cintillo CLI=',     type:'text' },
      { key:'cint_ref',   label:'Cintillo REF=',     type:'text' },
      { key:'obs',        label:'OBS', type:'text', def:'PRUEBA EN TAP, IMAGEN PIXELEADA' },
    ],
    tmpl: [
      'IN BAND SNR={snr_ib}            SIGNAL POWER={sig_ib}',
      'FRECUENCIA INBAND= {frec_ib}',
      'ERRORES / CORRECCIONES= {errores}',
      'CANAL TV PRUEBA= {canal_tv}',
      'OBB SNR={snr_obb}                SIGNAL POWER={sig_obb}',
      'Valor TAP= {valor_tap}',
      'Ubicación TAP= {ubic_tap}',
      'TORRE= {torre}                  PISO= {piso}',
      'Plano= {plano}',
      'Cintillo CLI= {cint_cli}',
      'Cintillo REF= {cint_ref}',
      'OBS: {obs}',
    ],
  },
  'PROBLEMAS DE INTERMITENCIA': {
    campos: [
      { key:'mac_cm',    label:'MAC CM',                     type:'text' },
      { key:'frec_prob', label:'Frecuencia con problemas',   type:'text' },
      { key:'iface',     label:'Interface(s) con problemas', type:'text' },
      { key:'niv_tap_us', key2:'niv_tap_ds', type:'dual', label:'Niveles TAP', pre1:'Us=', pre2:'Ds=' },
      { key:'niv_cm_us',  key2:'niv_cm_ds',  type:'dual', label:'Niveles CM',  pre1:'Us=', pre2:'Ds=' },
      { key:'snr_us',  key2:'snr_ds',  type:'dual', label:'SNR',       pre1:'Us=', pre2:'Ds=' },
      { key:'mod_us',  key2:'mod_ds',  type:'dual', label:'Modulación', pre1:'Us=', pre2:'Ds=' },
      { key:'atten',     label:'Atenuación (mts.)',           type:'text', ph:'Ej. 45' },
      { key:'ubic_tap',  label:'Ubicación TAP',               type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE / PISO', pre1:'TORRE:', pre2:'PISO:' },
      { key:'plano',     label:'Plano',                       type:'text' },
      { key:'valor_tap', label:'Valor TAP',                   type:'text' },
      { key:'cint_cli',  label:'Cintillo CLI',                type:'text' },
      { key:'cint_ref',  label:'Cintillo REF',                type:'text' },
      { key:'obs',       label:'OBS',                         type:'text' },
    ],
    tmpl: [
      'MAC CM: {mac_cm}',
      'Frecuencia con problemas: {frec_prob}',
      'Interface(s) con problemas: {iface}',
      'Niveles TAP: Us={niv_tap_us}        Ds={niv_tap_ds}',
      'Niveles CM: Us={niv_cm_us}          Ds={niv_cm_ds}',
      'SNR: Us={snr_us}                Ds={snr_ds}',
      'Modulación: Us={mod_us}         Ds={mod_ds}',
      'Atenuación: {atten}             mts.',
      'Ubicación TAP: {ubic_tap}',
      'TORRE: {torre}                  PISO: {piso}',
      'Plano: {plano}',
      'Valor TAP: {valor_tap}',
      'Cintillo CLI: {cint_cli}',
      'Cintillo REF: {cint_ref}',
      'OBS: {obs}',
    ],
  },
  'SIN SERVICIO HFC': {
    campos: [
      { key:'tipo_sot',  label:'Tipo SOT',           type:'text' },
      { key:'cmts',      label:'CMTS',                type:'text' },
      { key:'valor_tap', label:'VALOR TAP',           type:'text' },
      { key:'mac',       label:'MAC',                 type:'text' },
      { key:'niv_us', key2:'niv_ds', type:'dual', label:'NIVELES', pre1:'US=', pre2:'DS=' },
      { key:'dir_tap',   label:'DIRECCIÓN TAP',       type:'text' },
      { key:'plano',     label:'PLANO',               type:'text' },
      { key:'distrito',  label:'Distrito',            type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE / PISO', pre1:'TORRE:', pre2:'PISO:' },
      { key:'cint_cli',  label:'CINTILLO CLI',        type:'text' },
      { key:'cint_ref',  label:'CINTILLO REF',        type:'text' },
      { key:'contacto',  label:'CONTACTO CLIENTE',    type:'text' },
      { key:'nombres',   label:'NOMBRES CLIENTE',     type:'text' },
      { key:'obs',       label:'OBS',                 type:'text' },
    ],
    tmpl: [
      'Tipo SOT: {tipo_sot}',
      'CMTS: {cmts}',
      'VALOR TAP: {valor_tap}',
      'MAC: {mac}',
      'NIVELES: US={niv_us}            DS={niv_ds}',
      'DIRECCIÓN TAP: {dir_tap}',
      'PLANO: {plano}',
      'Distrito: {distrito}',
      'TORRE: {torre}                  PISO: {piso}',
      'CINTILLO CLI: {cint_cli}',
      'CINTILLO REF: {cint_ref}',
      'CONTACTO CLIENTE: {contacto}',
      'NOMBRES CLIENTE: {nombres}',
      'OBS: {obs}',
    ],
  },
};

// ════════════════════════════════
//  DERIVACION PEXT FTTH SUBTIPOS
// ════════════════════════════════
const DERIVACION_PEXT_FTTH_SUBTIPOS = {
  'NIVELES FUERA DE RANGO': {
    campos: [
      { key:'ont',        label:'ONT',                type:'text' },
      { key:'plano',      label:'PLANO',              type:'text' },
      { key:'fat',        label:'FAT',                type:'text' },
      { key:'coordenadas',label:'COORDENADAS',        type:'text' },
      { key:'borne_fat',  label:'BORNE DE FAT',       type:'text' },
      { key:'pot_tx', key2:'pot_rx', type:'dual', label:'POTENCIA OPTICA', pre1:'TX=', pre2:'RX=' },
      { key:'dir_fat',    label:'DIRECCIÓN DE FAT',   type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE / PISO', pre1:'TORRE:', pre2:'PISO:' },
      { key:'cint_cli',   label:'CINTILLO CLI',       type:'text' },
      { key:'cint_ref',   label:'CINTILLO REF',       type:'text' },
      { key:'obs',        label:'OBS',                type:'text' },
    ],
    tmpl: [
      'Derivación PEXT',
      'ONT: {ont}',
      'PLANO: {plano}',
      'FAT: {fat}',
      'COORDENADAS: {coordenadas}',
      'BORNE DE FAT: {borne_fat}',
      'POTENCIA OPTICA: TX={pot_tx}        RX={pot_rx}',
      'DIRECCIÓN DE FAT: {dir_fat}',
      'TORRE: {torre}                      PISO: {piso}',
      'CINTILLO CLI: {cint_cli}',
      'CINTILLO REF: {cint_ref}',
      'OBS: {obs}',
    ],
  },
  'SIN SERVICIO FTTH': {
    campos: [
      { key:'tipo',     label:'Tipo', type:'select', options:['','Mantenimiento','Instalación','Postventa'] },
      { key:'cmts_olt', label:'CMTS/OLT',       type:'text' },
      { key:'serie_ont',label:'SERIE ONT',       type:'text', ph:'*MANTT/POSTV* + Serie',  def:'*MANTT/POSTV*' },
      { key:'fat',      label:'FAT',             type:'text' },
      { key:'borne_fat',label:'BORNE DE FAT',    type:'text' },
      { key:'coordenadas',label:'COORDENADAS',   type:'text' },
      { key:'pot_opt',  label:'POTENCIA OPTICA', type:'text', ph:'Ej. LOW', def:'LOW' },
      { key:'dir_fat',  label:'DIRECCIÓN FAT',   type:'text' },
      { key:'torre', key2:'piso', type:'dual', label:'TORRE / PISO', pre1:'TORRE:', pre2:'PISO:' },
      { key:'plano',    label:'PLANO',            type:'text' },
      { key:'distrito', label:'Distrito',         type:'text' },
      { key:'cint_cli', label:'CINTILLO CLI',     type:'text' },
      { key:'cint_ref', label:'CINTILLO REF',     type:'text' },
      { key:'obs',      label:'OBS',              type:'text' },
    ],
    tmpl: [
      'Tipo: {tipo}',
      'CMTS/OLT: {cmts_olt}',
      'SERIE ONT: {serie_ont}',
      'FAT: {fat}',
      'BORNE DE FAT: {borne_fat}',
      'COORDENADAS: {coordenadas}',
      'POTENCIA OPTICA: {pot_opt}',
      'DIRECCIÓN FAT: {dir_fat}',
      'TORRE: {torre}                      PISO: {piso}',
      'PLANO: {plano}',
      'Distrito: {distrito}',
      'CINTILLO CLI: {cint_cli}',
      'CINTILLO REF: {cint_ref}',
      'OBS: {obs}',
    ],
  },
};

// ════════════════════════════════
//  MOTIVOS RECHAZO GENERAL
// ════════════════════════════════
const MOTIVOS_RECHAZO = [
  'ERROR DE TOA NO VALIDO',
  'TECNICO NO ENVIA ERROR DE TOA',
  'TECNICO NO CONTESTA',
  'TECNICO NO ENVIA EVIDENCIAS SUFICIENTES',
  'TECNICO NO ENVIA EQUIPOS CORRECTOS',
  'SOT INCORRECTA',
  'SOT EN ESTADO RECHAZADA',
  'SOT EN ESTADO ATENDIDA',
  'SOT MAL GENERADA',
  'SE CIERRA TICKET A SOLICITUD DEL TECNICO'
];

// ════════════════════════════════
//  MOTIVOS CAMBIO DE EQUIPO & CODIGO AUTORIZACION
// ════════════════════════════════
const MOTIVOS_CAMBIO_AUTORIZACION = [
  'EQUIPO CON DAÑO FISICO',
  'EQUIPO NO REGISTRA',
  'EQUIPO CON INTERMITENCIA',
  'EQUIPO NO ENGANCHA',
  'CAMBIO A DOCSIS 3.0 A 3.1',
  'SOT DE CAMBIO DE EQUIPO',
  'SOT DE MANTO GENERADA'
];

// ════════════════════════════════
//  MOTIVOS SOT DE MANTO
// ════════════════════════════════
const MOTIVOS_SOT_MANTTO = [
  'CAMBIO DE ACOMETIDA',
  'CAMBIO DE EQUIPO POR COMPATIBILIDAD',
  'CAMBIO DE EQUIPO DAÑADO'
];

// ════════════════════════════════
//  GESTIONES ESPECIALES
// ════════════════════════════════
const GESTIONES_ESPECIALES = {
  codigo_autorizacion: {
    titulo:'CODIGO AUTORIZACION', header:'MESA MULTISKILL HITSS - CODIGO AUTORIZACION', realizadoPorSuffix:'',
    campos:[
      { key:'equipo_retirar',  label:'EQUIPO A RETIRAR',  type:'text', ph:'Ej. MODEM HFC / ONT FTTH' },
      { key:'modelo',          label:'MODELO',             type:'model_select' },
      { key:'motivo',          label:'MOTIVO',             type:'motivo_select' },
      { key:'se_autoriza_cod', label:'SE AUTORIZA CÓDIGO', type:'text' },
    ],
  },
  cambio_equipo: {
    titulo:'CAMBIO DE EQUIPO', header:'MESA MULTISKILL HITSS - CAMBIO DE EQUIPO', realizadoPorSuffix:'',
    campos:[
      { key:'equipo_retirar', label:'EQUIPO A RETIRAR',  type:'text', ph:'Ej. MODEM HFC / ONT FTTH' },
      { key:'modelo_ret',     label:'MODELO A RETIRAR',   type:'model_select' },
      { key:'equipo_activar', label:'EQUIPO POR ACTIVAR', type:'text', ph:'Ej. ONT FTTH / MODEM HFC' },
      { key:'modelo_act',     label:'MODELO POR ACTIVAR', type:'model_select' },
      { key:'motivo_cambio',  label:'MOTIVO DEL CAMBIO',  type:'motivo_select' },
      { key:'cod_aut',        label:'CODIGO DE AUT.',      type:'text' },
      { key:'estado',         label:'ESTADO', type:'select', options:['', 'ATENDIDA', 'ATENDIDA SIN CONFORMIDAD', 'PENDIENTE SE DERIVA A SISTEMAS', 'DENEGADA'] },
    ],
  },
  sot_mantto: {
    titulo:'SOT DE MANTO', header:'MESA MULTISKILL HITSS - SOT DE MANTO', realizadoPorSuffix:'',
    campos:[
      { key:'motivo', label:'MOTIVO', type:'motivo_mantto_select' },
      { key:'equipo_retirar',   label:'EQUIPO A RETIRAR',    type:'text', ph:'Ej. MODEM HFC / ONT FTTH', grupo:'mantto_equipo' },
      { key:'modelo_ret',       label:'MODELO',             type:'model_select', grupo:'mantto_equipo' },
      { key:'cod_autorizacion', label:'COD. DE AUTORIZACION', type:'text', ph:'Ej. COD-001',            grupo:'mantto_equipo' },
      { key:'tecnico',  label:'TECNICO',  type:'text', ph:'Nombre del técnico' },
      { key:'contrata', label:'CONTRATA', type:'text', ph:'Nombre de la contrata' },
    ],
  },
  cambio_plano: {
    titulo:'CAMBIO DE PLANO', header:'MESA MULTISKILL HITSS', realizadoPorSuffix:' - HITSS',
    campos:[
      { key:'plano_correcto', label:'PLANO CORRECTO',     type:'text',  ph:'Ej. PL-2024-001' },
      { key:'coordenada',     label:'COORDENADA CLIENTE', type:'text',  ph:'Ej. -12.0464, -77.0428' },
    ],
  },
  activacion_plume: {
    titulo: 'ACTIVACION PLUME', header: 'MESA MULTISKILL HITSS – ACTIVACION PLUME', realizadoPorSuffix: '',
    campos: [
      { key: 'mac',    label: 'MAC',                   type: 'text', ph: 'Ej. 00:1A:2B:3C:4D:5E' },
      { key: 'sn',     label: 'SN (Número de Serie)',  type: 'text', ph: 'Ej. 1234567890' },
      { key: 'correo', label: 'CORREO',                type: 'text', ph: 'Ej. cliente@gmail.com' },
      { key: 'estado', label: 'ESTADO',                type: 'select', options: ['', 'ATENDIDA', 'ATENDIDA SIN CONFORMIDAD', 'PENDIENTE SE DERIVA A SISTEMAS', 'DENEGADA'] }
    ]
  },
  rechazo_general: {
    titulo: 'RECHAZO GENERAL',
    header: 'MESA MULTISKILL HITSS – RECHAZO',
    realizadoPorSuffix: '',
    campos: [
      { key: 'motivo', label: 'MOTIVO DE RECHAZO', type: 'motivo_rechazo_select' },
      { key: 'estado', label: 'ESTADO', type: 'select', options: ['DENEGADO', 'ATENDIDA', 'ATENDIDA SIN CONFORMIDAD', 'PENDIENTE SE DERIVA A SISTEMAS'], def: 'DENEGADO' }
    ]
  },
  // Custom rendered types (no campos array)
  cintillos_ftth:       { titulo:'CONSULTA DE CINTILLOS FTTH', realizadoPorSuffix:'' },
  cintillos_hfc:        { titulo:'CONSULTA DE CINTILLOS HFC',  realizadoPorSuffix:'' },
  derivacion_pext_hfc:  { titulo:'DERIVACION PEXT HFC',  header:'MESA MULTISKILL - DERIVACION PEXT', realizadoPorSuffix:'' },
  derivacion_pext_ftth: { titulo:'DERIVACION PEXT FTTH', header:'MESA MULTISKILL - DERIVACION PEXT', realizadoPorSuffix:'' },
  derivar_conmutacion:  { titulo:'DERIVAR A CONMUTACION', header:'MESA MULTISKILL HITSS - DERIVAR A CONMUTACION', realizadoPorSuffix:'' },
};

// ════════════════════════════════
//  HELPERS DE TIPO
// ════════════════════════════════
function esEspecial(tipo) { return (tipo in GESTIONES_ESPECIALES) || tipo === 'rechazo_tecnico'; }
function esEstandar(tipo) { return tipo in GESTIONES; }
function esCintillo(tipo) { return tipo === 'cintillos_ftth' || tipo === 'cintillos_hfc'; }
function esPext(tipo)     { return tipo === 'derivacion_pext_hfc' || tipo === 'derivacion_pext_ftth'; }
function esRechazo(tipo)  { return tipo === 'rechazo_general' || tipo === 'rechazo_tecnico'; }

// ════════════════════════════════
//  DATA STORE
// ════════════════════════════════
let secciones     = [];
let seccionActiva = 0;
let eqCounter     = 0;
let fatCounter    = 0;
let tapCounter    = 0;
let cintCounter   = 0;
let isLoadingSection = false;

// ════════════════════════════════
//  PERFIL DE USUARIO / ASESOR
// ════════════════════════════════
function getStoredUserName() {
  return (localStorage.getItem('hitss_username') || '').toUpperCase().trim();
}

function getStoredUserE() {
  return (localStorage.getItem('hitss_euser') || '').toUpperCase().trim();
}

function checkInitialUserProfile() {
  const savedName = localStorage.getItem('hitss_username');
  const savedE    = localStorage.getItem('hitss_euser');
  updateHeaderProfileDisplay();
  if (!savedName || !savedE) {
    setTimeout(() => openUserProfileModal(), 300);
  }
}

function updateHeaderProfileDisplay() {
  const name = getStoredUserName();
  const euser = getStoredUserE();
  const hdrEl = g('hdrUserName');
  const codeEl = g('hdrUserCode');
  if (hdrEl) {
    if (codeEl) {
      hdrEl.textContent = name || 'Configurar Asesor';
      codeEl.textContent = euser ? `(${euser})` : '';
    } else {
      if (name && euser) {
        hdrEl.textContent = `${name} (${euser})`;
      } else if (name) {
        hdrEl.textContent = name;
      } else {
        hdrEl.textContent = 'Configurar Asesor';
      }
    }
  }
}

function openUserProfileModal() {
  const m = g('userProfileModal');
  if (!m) return;
  const pName = g('profNombre');
  const pE = g('profUserE');
  if (pName) pName.value = getStoredUserName();
  if (pE) pE.value = getStoredUserE();
  m.classList.remove('hidden');
}

function closeUserProfileModal() {
  const m = g('userProfileModal');
  if (m) m.classList.add('hidden');
}

function saveUserProfile(e) {
  if (e) e.preventDefault();
  const name = gv('profNombre').trim().toUpperCase();
  const euser = gv('profUserE').trim().toUpperCase();

  if (!name || !euser) {
    alert('Por favor completa tu Nombre y Usuario E');
    return;
  }

  localStorage.setItem('hitss_username', name);
  localStorage.setItem('hitss_euser', euser);

  // Actualizar inputs en pantalla
  sv('realizadoPor', name);
  sv('codeEUser', euser);

  // Actualizar objeto sección activa
  if (secciones.length > 0) {
    secciones[seccionActiva].realizadoPor = name;
  }

  updateHeaderProfileDisplay();
  closeUserProfileModal();

  if (typeof mostrarAvisoSerial === 'function') {
    mostrarAvisoSerial(`👤 Perfil guardado: ${name} (${euser})`);
  }
}

function crearSeccion() {
  return {
    id: Date.now() + Math.random(),
    numero: '',
    tipoGestion: '',
    tecnologia: '',
    nTicket: '',
    equipoActivado: '', modeloEquipo: '',
    repetidorActivado: '', modeloRepetidor: '',
    equiposAdicionales: [],
    estado: '', observaciones: '',
    camposPersonalizados: {},
    realizadoPor: getStoredUserName(),
    notas: '', plantillaGenerada: '',
  };
}

// ════════════════════════════════
//  PERSISTENCIA EN LOCALSTORAGE (F5)
// ════════════════════════════════
function guardarSeccionesStorage() {
  try {
    localStorage.setItem('hitss_saved_secciones', JSON.stringify(secciones));
    localStorage.setItem('hitss_saved_sec_activa', String(seccionActiva));
  } catch (e) {
    console.warn('Error al guardar secciones:', e);
  }
}

function cargarSeccionesStorage() {
  try {
    const raw = localStorage.getItem('hitss_saved_secciones');
    const rawAct = localStorage.getItem('hitss_saved_sec_activa');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        arr.forEach(sec => {
          if (!Array.isArray(sec.equiposAdicionales)) sec.equiposAdicionales = [];
          if (!sec.camposPersonalizados || typeof sec.camposPersonalizados !== 'object') sec.camposPersonalizados = {};
        });
        secciones = arr;
        const act = parseInt(rawAct, 10);
        seccionActiva = (!isNaN(act) && act >= 0 && act < secciones.length) ? act : 0;
        return true;
      }
    }
  } catch (e) {
    console.warn('Error al cargar secciones:', e);
  }
  return false;
}

// ════════════════════════════════
//  SISTEMA DE SEGURIDAD / CONTRASEÑA DE ACCESO
// ════════════════════════════════
const DEFAULT_PASS_HASH = 'db79cf39950ba6effffafefd10a0fd2ad8b37e33c9d77160fe7c3190b1fb17c2'; // SHA-256 para 5754986

async function getSha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredPassHash() {
  return localStorage.getItem('hitss_app_password_hash') || DEFAULT_PASS_HASH;
}

function checkAppLockState() {
  const isUnlocked = sessionStorage.getItem('hitss_auth_unlocked') === 'true';
  const lockEl = g('appLockScreen');
  if (lockEl) {
    if (isUnlocked) {
      lockEl.classList.add('hidden');
    } else {
      lockEl.classList.remove('hidden');
      const passInp = g('appPassInput');
      if (passInp) setTimeout(() => passInp.focus(), 200);
    }
  }
}

async function verificarContrasenaApp(e) {
  if (e) e.preventDefault();
  const val = gv('appPassInput').trim();
  const hash = await getSha256(val);
  const targetHash = getStoredPassHash();

  if (hash === targetHash) {
    sessionStorage.setItem('hitss_auth_unlocked', 'true');
    const lockEl = g('appLockScreen');
    if (lockEl) lockEl.classList.add('hidden');
    const errEl = g('lockPassError');
    if (errEl) errEl.classList.add('hidden');
    if (typeof mostrarAvisoSerial === 'function') {
      mostrarAvisoSerial('🔓 Acceso concedido');
    }
  } else {
    const errEl = g('lockPassError');
    if (errEl) errEl.classList.remove('hidden');
    const passInp = g('appPassInput');
    if (passInp) { passInp.value = ''; passInp.focus(); }
  }
}

function bloquearPantallaApp() {
  sessionStorage.removeItem('hitss_auth_unlocked');
  checkAppLockState();
  if (typeof mostrarAvisoSerial === 'function') {
    mostrarAvisoSerial('🔒 Pantalla bloqueada');
  }
}

function abrirModalCambiarClave() {
  const m = g('changePassModal');
  if (m) {
    sv('passActualInput', '');
    sv('passNuevaInput', '');
    m.classList.remove('hidden');
  }
}

function cerrarModalCambiarClave() {
  const m = g('changePassModal');
  if (m) m.classList.add('hidden');
}

async function guardarNuevaClaveApp(e) {
  if (e) e.preventDefault();
  const actualVal = gv('passActualInput').trim();
  const nuevaVal = gv('passNuevaInput').trim();

  const actualHash = await getSha256(actualVal);
  if (actualHash !== getStoredPassHash()) {
    alert('La contraseña actual es incorrecta.');
    return;
  }

  if (nuevaVal.length < 4) {
    alert('La nueva contraseña debe tener al menos 4 caracteres.');
    return;
  }

  const nuevaHash = await getSha256(nuevaVal);
  localStorage.setItem('hitss_app_password_hash', nuevaHash);
  cerrarModalCambiarClave();

  if (typeof mostrarAvisoSerial === 'function') {
    mostrarAvisoSerial('🔑 Contraseña de acceso actualizada');
  }
}

// ════════════════════════════════
//  INIT / SECCIONES
// ════════════════════════════════
function inicializar() {
  checkAppLockState();
  const loaded = cargarSeccionesStorage();
  if (!loaded) {
    secciones.push(crearSeccion());
    seccionActiva = 0;
  }
  renderSidebar();
  cargarSeccion(seccionActiva);
  initCuentas();
  initCodeGenerator();
  setupNotesSmartPaste();
  initPanelReordering();
  checkInitialUserProfile();

  // Guardar formulario automáticamente ante cualquier cambio
  const formEl = g('ticketForm');
  if (formEl) {
    formEl.addEventListener('input', () => guardarFormActual());
    formEl.addEventListener('change', () => guardarFormActual());
  }
  const notasEl = g('notasTexto');
  if (notasEl) {
    notasEl.addEventListener('input', () => guardarFormActual());
  }

  // Sincronizar UI de temas
  updateThemeMenuUI();

  // Cerrar menú flotante de temas al hacer clic fuera
  document.addEventListener('click', (e) => {
    const menu = g('themeDropdownMenu');
    const btn = g('btnThemeDropdown');
    if (menu && !menu.classList.contains('hidden')) {
      if (btn && btn.contains(e.target)) return;
      if (!menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    }
  });
}

function toggleThemeMenu(event) {
  if (event) event.stopPropagation();
  const menu = g('themeDropdownMenu');
  if (menu) {
    menu.classList.toggle('hidden');
    updateThemeMenuUI();
  }
}

function updateThemeMenuUI(themeName) {
  const currentTheme = themeName || document.documentElement.getAttribute('data-theme') || 'purple';
  const themes = [
    'christmas', 'halloween',
    'pink', 'purple-light', 'red-light', 'cyan-light',
    'pink-dark', 'purple-dark', 'red-dark', 'cyan-dark', 'purple'
  ];
  themes.forEach(t => {
    const badge = g('badge-' + t);
    if (badge) {
      badge.style.display = (t === currentTheme) ? 'inline-block' : 'none';
    }
  });
  const btnHw = g('btnQuickHalloween');
  if (btnHw) {
    btnHw.classList.toggle('is-active-hw', currentTheme === 'halloween');
  }
  const btnXmas = g('btnQuickXmas');
  if (btnXmas) {
    btnXmas.classList.toggle('is-active-xmas', currentTheme === 'christmas');
  }
}

function spawnHalloweenSparks(originEl) {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme !== 'halloween' && theme !== 'christmas') return;
  const el = originEl || g('btnCopy') || document.body;
  const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 40 };
  const hwEmojis = ['🎃', '🦇', '👻', '🍬', '🕸️', '✨'];
  const xmasEmojis = ['❄️', '🎁', '🎄', '⭐', '🔔', '✨', '❅'];
  const emojis = theme === 'christmas' ? xmasEmojis : hwEmojis;
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = theme === 'christmas' ? 'xmas-burst-spark' : 'mascot-ghost-particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const tx = (Math.random() - 0.5) * 110;
    p.style.setProperty('--tx', `${tx}px`);
    p.style.left = `${rect.left + (rect.width / 2) + (i - 2.5) * 14}px`;
    p.style.top = `${rect.top}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

function nuevaSeccion() {
  guardarFormActual();
  const nueva = crearSeccion();
  secciones.push(nueva);
  seccionActiva = secciones.length - 1;
  cargarSeccion(seccionActiva);
  renderSidebar();
  guardarSeccionesStorage();
  spawnHalloweenSparks(document.querySelector('.btn-nueva-sot-top'));
}

function cambiarSeccion(idx) {
  if (idx < 0 || idx >= secciones.length) return;
  if (idx === seccionActiva) return;
  guardarFormActual();
  seccionActiva = idx;
  cargarSeccion(idx);
  renderSidebar();
  guardarSeccionesStorage();

  const formEl = g('ticketForm');
  if (formEl) {
    formEl.classList.remove('sec-switch-anim');
    void formEl.offsetWidth;
    formEl.classList.add('sec-switch-anim');
  }
}

// ════════════════════════════════
//  GUARDAR FORM → OBJETO
// ════════════════════════════════
function guardarFormActual() {
  if (isLoadingSection) return;
  if (secciones.length === 0) return;
  const s = secciones[seccionActiva];
  s.numero       = gv('seccionNumero').trim();
  s.tipoGestion  = gv('tipoGestion');
  s.nTicket      = gv('nTicket');
  const rPor     = gv('realizadoPor').trim().toUpperCase();
  s.realizadoPor = rPor;
  if (rPor) {
    localStorage.setItem('hitss_username', rPor);
    updateHeaderProfileDisplay();
  }
  s.notas        = gv('notasTexto');

  if (s.tipoGestion === 'cintillos_ftth') {
    guardarCintillosFTTH(s);
  } else if (s.tipoGestion === 'cintillos_hfc') {
    guardarCintillosHFC(s);
  } else if (esEspecial(s.tipoGestion)) {
    guardarCamposCustom(s);
  } else if (esEstandar(s.tipoGestion)) {
    // Read modelo: if manual option selected, read from text input
    const rawModelo = gv('modeloEquipo');
    s.modeloEquipo  = rawModelo === '__manual__' ? gv('modeloManual') : rawModelo;
    s.equipoActivado    = gv('equipoActivado');
    s.repetidorActivado = gv('repetidorActivado');

    // Read modeloRepetidor select & manual fallback
    const rawRepMod = gv('modeloRepetidor');
    s.modeloRepetidor = (rawRepMod === '__manual__') ? gv('modeloRepetidorManual') : rawRepMod;

    // Read estado select & manual fallback
    const rawEstado = gv('estado');
    s.estado = (rawEstado === '__manual__') ? gv('estadoManual') : rawEstado;

    s.observaciones     = gv('observaciones');
    const ab = document.querySelector('.tech-btn.active');
    s.tecnologia = ab ? ab.dataset.tech : '';
    s.equiposAdicionales = capturarEquiposDOM();
  }

  guardarSeccionesStorage();
}

function guardarCamposCustom(s) {
  if (isLoadingSection) return;
  s.camposPersonalizados = s.camposPersonalizados || {};

  if (s.tipoGestion === 'cambio_equipo') {
    const retItems = [];
    document.querySelectorAll('#cambioRetirarContainer .cambio-eq-item').forEach(b => {
      const eqInp = b.querySelector('.input-cambio-eq');
      const modSel = b.querySelector('.input-cambio-mod');
      const modMan = b.querySelector('.input-cambio-mod-man');
      const modelo = (modSel?.value === '__manual__') ? (modMan?.value || '') : (modSel?.value || '');
      retItems.push({ uid: b.dataset.uid, equipo: eqInp ? eqInp.value : '', modelo });
    });
    s.camposPersonalizados.equipos_retirar = retItems;
    if (retItems.length > 0) {
      s.camposPersonalizados.equipo_retirar = retItems[0].equipo;
      s.camposPersonalizados.modelo_ret = retItems[0].modelo;
    }

    const actItems = [];
    document.querySelectorAll('#cambioActivarContainer .cambio-eq-item').forEach(b => {
      const eqInp = b.querySelector('.input-cambio-eq');
      const modSel = b.querySelector('.input-cambio-mod');
      const modMan = b.querySelector('.input-cambio-mod-man');
      const modelo = (modSel?.value === '__manual__') ? (modMan?.value || '') : (modSel?.value || '');
      actItems.push({ uid: b.dataset.uid, equipo: eqInp ? eqInp.value : '', modelo });
    });
    s.camposPersonalizados.equipos_activar = actItems;
    if (actItems.length > 0) {
      s.camposPersonalizados.equipo_activar = actItems[0].equipo;
      s.camposPersonalizados.modelo_act = actItems[0].modelo;
    }
  }

  document.querySelectorAll('#customFormArea [id^="cesp_"]').forEach(el => {
    if (el.id.endsWith('_manual')) return;
    const key = el.id.replace('cesp_', '');
    if (el.tagName === 'SELECT' && el.value === '__manual__') {
      const manEl = g(`cesp_${key}_manual`);
      s.camposPersonalizados[key] = manEl ? manEl.value : '';
    } else {
      s.camposPersonalizados[key] = el.value;
    }
  });
}

function capturarEquiposDOM() {
  if (isLoadingSection) {
    return (secciones[seccionActiva] && Array.isArray(secciones[seccionActiva].equiposAdicionales))
      ? JSON.parse(JSON.stringify(secciones[seccionActiva].equiposAdicionales))
      : [];
  }
  const r = [];
  document.querySelectorAll('#equiposAdicionales .eq-block-adicional').forEach(b => {
    const modSel = b.querySelector('.input-mod');
    const modMan = b.querySelector('.input-mod-manual');
    // If "__manual__" selected, use the text input value
    const modelo = (modSel?.value === '__manual__') ? (modMan?.value || '') : (modSel?.value || '');
    r.push({ uid:b.dataset.uid, tipo:b.dataset.tipo, equipo:b.querySelector('.input-eq')?.value||'', modelo });
  });
  return r;
}

// ════════════════════════════════
//  CARGAR OBJETO → FORM
// ════════════════════════════════
function cargarSeccion(idx) {
  if (idx < 0 || idx >= secciones.length) return;
  isLoadingSection = true;
  try {
    const s = secciones[idx];
    g('seccionNumero').value = s.numero || '';
    sv('tipoGestion', s.tipoGestion);
    sv('nTicket',     s.nTicket);
    sv('realizadoPor', s.realizadoPor || getStoredUserName());
    sv('notasTexto',  s.notas);

    // Limpiar siempre contenedores dinámicos al inicio para evitar cruce de datos
    g('equiposAdicionales').innerHTML = '';
    g('customFormArea').innerHTML = '';

    if (esEspecial(s.tipoGestion)) {
      sv('equipoActivado', '');
      sv('repetidorActivado', '');
      sv('modeloRepetidor', '');
      sv('estado', '');
      sv('observaciones', '');
      ocultarBloquesEstandar();
      renderFormEspecial(s.tipoGestion, s.camposPersonalizados || {});
      show('bloqueRealizadoPor'); show('actionRow');
    } else {
      hide('customFormArea');
      aplicarVisibilidad(s.tipoGestion);

      sv('equipoActivado', s.equipoActivado);
      sv('repetidorActivado', s.repetidorActivado);

      resetTechBtns();
      if (s.tecnologia) {
        setTech(s.tecnologia, false);
      } else {
        populateModelosSelect(s.tipoGestion, '');
      }

      // Restore modeloEquipo select & manual fallback
      const storedModel = s.modeloEquipo || '';
      const modSel = g('modeloEquipo');
      const modMan = g('modeloManual');
      if (modSel) {
        if (storedModel) {
          const isInList = Array.from(modSel.options).some(o => o.value === storedModel && o.value !== '' && o.value !== '__manual__');
          if (isInList) {
            modSel.value = storedModel;
            if (modMan) { modMan.value = ''; modMan.classList.add('hidden'); }
          } else {
            modSel.value = '__manual__';
            if (modMan) { modMan.value = storedModel; modMan.classList.remove('hidden'); }
          }
        } else {
          modSel.value = '';
          if (modMan) { modMan.value = ''; modMan.classList.add('hidden'); }
        }
      }

      // Cargar modeloRepetidor select & manual text input
      const knownRepMods = ['REPETIDOR ZXHN H3601P 180000528400 ZTE', 'ROUTER K562E-10 50087708 HUAWEI'];
      const repModVal = s.modeloRepetidor || '';
      const isManRep = repModVal !== '' && !knownRepMods.includes(repModVal);
      if (g('modeloRepetidor')) sv('modeloRepetidor', isManRep ? '__manual__' : repModVal);
      const manRep = g('modeloRepetidorManual');
      if (manRep) {
        manRep.value = isManRep ? repModVal : '';
        if (isManRep) manRep.classList.remove('hidden');
        else manRep.classList.add('hidden');
      }

      // Cargar estado select & manual text input
      const knownEstados = ['ATENDIDA', 'ATENDIDA SIN CONFORMIDAD', 'PENDIENTE SE DERIVA A SISTEMAS', 'DENEGADA'];
      const estVal = s.estado || '';
      const isManEst = estVal !== '' && !knownEstados.includes(estVal);
      if (g('estado')) sv('estado', isManEst ? '__manual__' : estVal);
      const manEst = g('estadoManual');
      if (manEst) {
        manEst.value = isManEst ? estVal : '';
        if (isManEst) manEst.classList.remove('hidden');
        else manEst.classList.add('hidden');
      }

      sv('observaciones', s.observaciones);
      g('equiposAdicionales').innerHTML = '';
      if (Array.isArray(s.equiposAdicionales)) {
        s.equiposAdicionales.forEach(eq => renderEqAdicional(eq.tipo, eq.uid, eq.equipo, eq.modelo));
      }
    }

    actualizarBadge(s.tipoGestion);

    if (s.plantillaGenerada) {
      g('plantillaTexto').textContent = s.plantillaGenerada;
      hide('previewEmpty'); show('previewContent'); g('btnCopy').disabled = false;
    } else {
      show('previewEmpty'); hide('previewContent'); g('btnCopy').disabled = true;
    }
    hide('copyFeedback');
  } finally {
    isLoadingSection = false;
  }
}

function ocultarBloquesEstandar() {
  ['bloqueEquipoPrincipal','bloqueRepetidor','botonesAgregar','bloqueEstado','bloqueObs'].forEach(hide);
  g('equiposAdicionales').innerHTML = '';
  const modMan = g('modeloManual'); if (modMan) modMan.classList.add('hidden');
  resetTechBtns();
}

// ════════════════════════════════
//  CAMBIO TIPO ── FIX: guardar tipoGestion antes de cambiar
// ════════════════════════════════
function onTipoChange() {
  if (isLoadingSection) return;
  const tipo = gv('tipoGestion');

  // 1) Save datos del tipo ANTERIOR si era especial
  if (secciones.length > 0) {
    const prevTipo = secciones[seccionActiva].tipoGestion;
    if (prevTipo === 'cintillos_ftth') guardarCintillosFTTH(secciones[seccionActiva]);
    else if (prevTipo === 'cintillos_hfc') guardarCintillosHFC(secciones[seccionActiva]);
    else if (esEspecial(prevTipo)) guardarCamposCustom(secciones[seccionActiva]);
    // 2) Actualizar tipo en la sección AHORA para que los helpers del render lo vean correctamente
    secciones[seccionActiva].tipoGestion = tipo;
  }

  if (esEspecial(tipo)) {
    ocultarBloquesEstandar();
    hide('customFormArea');
    const vals = secciones.length > 0 ? (secciones[seccionActiva].camposPersonalizados || {}) : {};
    renderFormEspecial(tipo, vals);
    show('bloqueRealizadoPor'); show('actionRow');
  } else {
    hide('customFormArea'); g('customFormArea').innerHTML = '';
    aplicarVisibilidad(tipo);
  }
  actualizarBadge(tipo);
  if (secciones.length > 0) secciones[seccionActiva].plantillaGenerada = '';
  hide('previewContent'); show('previewEmpty'); g('btnCopy').disabled = true;
  renderSidebar();
}

// ════════════════════════════════
//  RENDER FORM ESPECIAL (dispatch)
// ════════════════════════════════
function renderFormEspecial(tipo, vals) {
  if (tipo === 'rechazo_tecnico') tipo = 'rechazo_general';
  if (tipo === 'cintillos_ftth')        { renderFormCintillosFTTH(vals); return; }
  if (tipo === 'cintillos_hfc')         { renderFormCintillosHFC(vals);  return; }
  if (tipo === 'cambio_equipo')         { renderFormCambioEquipo(vals);  return; }
  if (esPext(tipo))                     { renderFormDerivacionPext(tipo, vals); return; }
  if (tipo === 'derivar_conmutacion')   { renderFormDerivarConmutacion(vals); return; }

  // Genérico (codigo_autorizacion, sot_mantto, cambio_plano, etc.)
  const cfg = GESTIONES_ESPECIALES[tipo];
  if (!cfg || !cfg.campos) return;
  const area = g('customFormArea');
  let html = '<div class="custom-form-area">';
  html += renderSubtipoCampos(cfg.campos, vals);
  html += '</div>';
  area.innerHTML = html;
  area.classList.remove('hidden');
  if (tipo === 'sot_mantto') onManttoMotivoChange();
}

// ════════════════════════════════
//  ── CAMBIO DE EQUIPO (MÚLTIPLES EQUIPOS A RETIRAR / ACTIVAR) ──
// ════════════════════════════════
function getTodosLosModelos() {
  return [...new Set([
    ...MODELOS.hfc,
    ...MODELOS.ftth,
    ...MODELOS_DECO.iptv,
    ...MODELOS_DECO.hfc,
    ...MODELOS_REPETIDOR
  ])];
}

function buildModelosOptionsHtml(selectedModel) {
  const models = getTodosLosModelos();
  const isMan = selectedModel !== '' && !models.includes(selectedModel);
  const selVal = isMan ? '__manual__' : selectedModel;
  let html = '<option value="">— Selecciona modelo —</option>';
  models.forEach(m => {
    html += `<option value="${m}" ${selVal === m ? 'selected' : ''}>${m}</option>`;
  });
  html += `<option value="__manual__" ${selVal === '__manual__' ? 'selected' : ''}>✏️ Escribir manualmente…</option>`;
  return html;
}

function onCambioModeloChange(sel) {
  const block = sel.closest('.cambio-eq-item') || sel.closest('.field-group');
  if (!block) return;
  const man = block.querySelector('.input-cambio-mod-man');
  if (!man) return;
  if (sel.value === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
}

function onMotivoSelectChange(sel, manualId) {
  const man = g(manualId);
  if (!man) return;
  if (sel.value === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
}

function renderFormCambioEquipo(vals) {
  const area = g('customFormArea');
  if (!area) return;

  let retItems = vals.equipos_retirar;
  if (!Array.isArray(retItems) || retItems.length === 0) {
    retItems = [{
      uid: 'ret_1',
      equipo: vals.equipo_retirar || '',
      modelo: vals.modelo_ret || ''
    }];
  }

  let actItems = vals.equipos_activar;
  if (!Array.isArray(actItems) || actItems.length === 0) {
    actItems = [{
      uid: 'act_1',
      equipo: vals.equipo_activar || '',
      modelo: vals.modelo_act || ''
    }];
  }

  const motivoVal = vals.motivo_cambio || '';
  const isManMot = motivoVal !== '' && !MOTIVOS_CAMBIO_AUTORIZACION.includes(motivoVal);
  const selMot = isManMot ? '__manual__' : motivoVal;
  const manMot = isManMot ? motivoVal : '';

  const estadoVal = vals.estado || '';
  const codAutVal = vals.cod_aut || '';

  const estados = ['', 'ATENDIDA', 'ATENDIDA SIN CONFORMIDAD', 'PENDIENTE SE DERIVA A SISTEMAS', 'DENEGADA'];

  let html = `
    <div class="custom-form-area cambio-equipo-area">
      <!-- SECCION: EQUIPOS A RETIRAR -->
      <div class="cambio-section-header">
        <span class="cambio-sec-title">📦 EQUIPOS A RETIRAR</span>
      </div>
      <div id="cambioRetirarContainer" class="cambio-items-container"></div>
      <div class="add-btns" style="margin-top:0.4rem; margin-bottom:1.1rem;">
        <div class="add-btns-row">
          <button type="button" class="btn-add" onclick="addCambioEquipoRetirar()">+ Agregar equipo a retirar</button>
        </div>
      </div>

      <!-- SECCION: EQUIPOS POR ACTIVAR -->
      <div class="cambio-section-header">
        <span class="cambio-sec-title">⚡ EQUIPOS POR ACTIVAR</span>
      </div>
      <div id="cambioActivarContainer" class="cambio-items-container"></div>
      <div class="add-btns" style="margin-top:0.4rem; margin-bottom:1.1rem;">
        <div class="add-btns-row">
          <button type="button" class="btn-add" onclick="addCambioEquipoActivar()">+ Agregar equipo por activar</button>
        </div>
      </div>

      <!-- SECCION: MOTIVO, CODIGO Y ESTADO -->
      <div class="field-group">
        <label class="field-label">MOTIVO DEL CAMBIO</label>
        <div class="sel-wrap">
          <select id="cesp_motivo_cambio" onchange="onMotivoSelectChange(this, 'cesp_motivo_cambio_manual')">
            <option value="">— Selecciona motivo —</option>
            ${MOTIVOS_CAMBIO_AUTORIZACION.map(m => `<option value="${m}" ${selMot===m?'selected':''}>${m}</option>`).join('')}
            <option value="__manual__" ${selMot==='__manual__'?'selected':''}>✏️ Otro / Agregar motivo manualmente…</option>
          </select>
          <span class="sel-arrow">▾</span>
        </div>
        <input type="text" id="cesp_motivo_cambio_manual" class="input-mod-manual ${isManMot ? '' : 'hidden'}"
               value="${manMot}" placeholder="Escribe el motivo del cambio…" style="margin-top:0.4rem" />
      </div>

      <div class="field-group">
        <label class="field-label">CODIGO DE AUT.</label>
        <input type="text" id="cesp_cod_aut" value="${codAutVal}" placeholder="Ej. COD-12345" />
      </div>

      <div class="field-group">
        <label class="field-label">ESTADO</label>
        <div class="sel-wrap">
          <select id="cesp_estado">
            ${estados.map(e => `<option value="${e}" ${estadoVal===e?'selected':''}>${e || '— Selecciona estado —'}</option>`).join('')}
          </select>
          <span class="sel-arrow">▾</span>
        </div>
      </div>
    </div>
  `;

  area.innerHTML = html;
  area.classList.remove('hidden');

  retItems.forEach((item, i) => renderCambioItemDOM('retirar', item.uid || `ret_${Date.now()}_${i}`, item.equipo, item.modelo));
  actItems.forEach((item, i) => renderCambioItemDOM('activar', item.uid || `act_${Date.now()}_${i}`, item.equipo, item.modelo));
}

function renderCambioItemDOM(tipo, uid, equipo = '', modelo = '') {
  const isRet = tipo === 'retirar';
  const container = g(isRet ? 'cambioRetirarContainer' : 'cambioActivarContainer');
  if (!container) return;

  const count = container.querySelectorAll('.cambio-eq-item').length + 1;
  const title = isRet ? `EQUIPO A RETIRAR #${count}` : `EQUIPO POR ACTIVAR #${count}`;
  const ph = isRet ? 'Ej. MODEM HFC / ONT FTTH' : 'Ej. ONT FTTH / MODEM HFC';
  const color = isRet ? 'var(--danger)' : 'var(--accent)';

  const models = getTodosLosModelos();
  const isMan = modelo !== '' && !models.includes(modelo);
  const selVal = isMan ? '__manual__' : modelo;
  const manVal = isMan ? modelo : '';

  const optsHtml = buildModelosOptionsHtml(selVal);

  const div = document.createElement('div');
  div.className = `cambio-eq-item eq-block ${isRet ? 'cambio-ret-item' : 'cambio-act-item'}`;
  div.dataset.uid = uid;
  div.dataset.tipo = tipo;
  div.innerHTML = `
    <div class="block-row">
      <span class="blk-label" style="color:${color}">${isRet ? '📦' : '⚡'} ${title}</span>
      <button type="button" class="btn-remove" onclick="removeCambioItem('${tipo}', '${uid}')">✕ Quitar</button>
    </div>
    <div class="field-group inner">
      <label class="field-label">${isRet ? 'Equipo a Retirar' : 'Equipo por Activar'}</label>
      <input type="text" class="input-cambio-eq input-eq" value="${equipo}" placeholder="${ph}" />
    </div>
    <div class="field-group inner">
      <label class="field-label">${isRet ? 'Modelo a Retirar' : 'Modelo por Activar'}</label>
      <div class="sel-wrap">
        <select class="input-cambio-mod input-mod" onchange="onCambioModeloChange(this)">${optsHtml}</select>
        <span class="sel-arrow">▾</span>
      </div>
      <input type="text" class="input-cambio-mod-man input-mod-manual ${isMan ? '' : 'hidden'}"
             value="${manVal}" placeholder="Escribe el modelo…" style="margin-top:0.4rem" />
    </div>
  `;

  container.appendChild(div);
  updateCambioItemLabels(tipo);
}

function updateCambioItemLabels(tipo) {
  const isRet = tipo === 'retirar';
  const container = g(isRet ? 'cambioRetirarContainer' : 'cambioActivarContainer');
  if (!container) return;
  const items = container.querySelectorAll('.cambio-eq-item');
  items.forEach((item, idx) => {
    const lbl = item.querySelector('.blk-label');
    const title = isRet ? `EQUIPO A RETIRAR #${idx + 1}` : `EQUIPO POR ACTIVAR #${idx + 1}`;
    if (lbl) lbl.innerHTML = `${isRet ? '📦' : '⚡'} ${title}`;
    const btnRem = item.querySelector('.btn-remove');
    if (btnRem) {
      if (items.length === 1) btnRem.classList.add('hidden');
      else btnRem.classList.remove('hidden');
    }
  });
}

function addCambioEquipoRetirar() {
  const uid = `ret_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  renderCambioItemDOM('retirar', uid, '', '');
  guardarFormActual();
}

function addCambioEquipoActivar() {
  const uid = `act_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  renderCambioItemDOM('activar', uid, '', '');
  guardarFormActual();
}

function removeCambioItem(tipo, uid) {
  const isRet = tipo === 'retirar';
  const container = g(isRet ? 'cambioRetirarContainer' : 'cambioActivarContainer');
  if (!container) return;
  const items = container.querySelectorAll('.cambio-eq-item');
  if (items.length <= 1) return;

  const el = container.querySelector(`[data-uid="${uid}"]`);
  if (el) {
    el.remove();
    updateCambioItemLabels(tipo);
    guardarFormActual();
  }
}

// ════════════════════════════════
//  CONDICIONAL SOT MANTTO
// ════════════════════════════════
function onManttoMotivoChange() {
  const sel = g('cesp_motivo');
  if (!sel) return;
  const isMan = sel.value === '__manual__';
  const man = g('cesp_motivo_manual');
  if (man) {
    if (isMan) {
      man.classList.remove('hidden');
      man.focus();
    } else {
      man.classList.add('hidden');
    }
  }
  const manVal = (man ? man.value : '').trim().toUpperCase();
  const ok = ['CAMBIO DE EQUIPO POR COMPATIBILIDAD','CAMBIO DE EQUIPO DAÑADO'].includes(sel.value) ||
             (isMan && manVal.includes('EQUIPO'));
  document.querySelectorAll('[data-grupo="mantto_equipo"]').forEach(el =>
    ok ? el.classList.remove('hidden') : el.classList.add('hidden'));
  guardarFormActual();
}

function onManttoMotivoInput() {
  const sel = g('cesp_motivo');
  const man = g('cesp_motivo_manual');
  if (sel && sel.value === '__manual__' && man) {
    const manVal = man.value.trim().toUpperCase();
    const ok = manVal.includes('EQUIPO');
    document.querySelectorAll('[data-grupo="mantto_equipo"]').forEach(el =>
      ok ? el.classList.remove('hidden') : el.classList.add('hidden'));
  }
  guardarFormActual();
}

// ════════════════════════════════
//  ── CINTILLOS FTTH ──
// ════════════════════════════════
function renderFormCintillosFTTH(vals) {
  const plano = vals.plano !== undefined ? vals.plano : '';
  g('customFormArea').innerHTML = `
    <div class="custom-form-area">
      <div class="field-group">
        <label class="field-label">🗺️ PLANO</label>
        <input type="text" id="cesp_plano" value="${plano}" placeholder="Ej. PL-001" />
      </div>
      <div id="fatItemsContainer"></div>
      <div class="add-btns"><div class="add-btns-row">
        <button type="button" class="btn-add" onclick="addFATItem()">📡 Agregar FAT</button>
      </div></div>
    </div>`;
  g('customFormArea').classList.remove('hidden');
  const items = vals.fat_items || [];
  if (items.length > 0) items.forEach(item => addFATItem(item));
  else addFATItem();
}

function addFATItem(data) {
  fatCounter++;
  const fatId  = `fat_${fatCounter}`;
  const numero = data?.numero || '';
  const status = data?.status || 'saturado';
  const cints  = data?.cintillos || [];
  const div    = document.createElement('div');
  div.className = 'item-block fat-item'; div.dataset.fatId = fatId; div.dataset.status = status;
  div.innerHTML = `
    <div class="item-header-row">
      <span class="item-label">📡 FAT #</span>
      <input type="text" class="item-num" placeholder="18" value="${numero}" />
      <div class="status-toggle">
        <button type="button" class="stog-btn stog-sat ${status==='saturado'?'active-sat':''}" onclick="setFATStatus('${fatId}','saturado')">SATURADO</button>
        <button type="button" class="stog-btn stog-nosat ${status==='no_saturado'?'active-nosat':''}" onclick="setFATStatus('${fatId}','no_saturado')">NO SATURADO</button>
      </div>
      <button type="button" class="btn-remove" onclick="removeFATItem('${fatId}')">✕ Quitar</button>
    </div>
    <div class="cintillos-area ${status==='saturado'?'hidden':''}" id="cints_${fatId}">
      <div class="cint-list" id="cint_list_${fatId}"></div>
      <button type="button" class="btn-add-cint" onclick="addFATCintillo('${fatId}')">+ Agregar cintillo</button>
    </div>`;
  g('fatItemsContainer').appendChild(div);
  if (cints.length > 0) cints.forEach(c => addFATCintillo(fatId, c));
  else if (status === 'no_saturado') addFATCintillo(fatId);
}

function removeFATItem(fatId) {
  const el = document.querySelector(`[data-fat-id="${fatId}"]`);
  if (el) { el.style.opacity='0'; el.style.transition='opacity 0.15s'; setTimeout(()=>el.remove(),160); }
}

function setFATStatus(fatId, status) {
  const block = document.querySelector(`[data-fat-id="${fatId}"]`);
  if (!block) return;
  block.dataset.status = status;
  block.querySelectorAll('.stog-btn')[0].className = `stog-btn stog-sat ${status==='saturado'?'active-sat':''}`;
  block.querySelectorAll('.stog-btn')[1].className = `stog-btn stog-nosat ${status==='no_saturado'?'active-nosat':''}`;
  const ca = g(`cints_${fatId}`);
  if (status === 'saturado') { ca.classList.add('hidden'); }
  else { ca.classList.remove('hidden'); if (!g(`cint_list_${fatId}`).children.length) addFATCintillo(fatId); }
}

function addFATCintillo(fatId, value='') {
  cintCounter++;
  const cintId = `cint_${cintCounter}`;
  const li = document.createElement('div');
  li.className = 'cint-item'; li.dataset.cintId = cintId;
  li.innerHTML = `<input type="text" class="cint-input" placeholder="Número de cintillo" value="${value}" /><button type="button" class="btn-remove-sm" onclick="removeFATCintillo('${fatId}','${cintId}')">✕</button>`;
  g(`cint_list_${fatId}`).appendChild(li);
}
function removeFATCintillo(_, cintId) { document.querySelector(`[data-cint-id="${cintId}"]`)?.remove(); }

function guardarCintillosFTTH(s) {
  if (isLoadingSection) return;
  s.camposPersonalizados = s.camposPersonalizados || {};
  s.camposPersonalizados.plano = gv('cesp_plano');
  const items = [];
  document.querySelectorAll('#fatItemsContainer .fat-item').forEach(block => {
    const numero = block.querySelector('.item-num').value;
    const status = block.dataset.status || 'saturado';
    const cintillos = [];
    block.querySelectorAll('.cint-input').forEach(inp => { if (inp.value.trim()) cintillos.push(inp.value.trim()); });
    items.push({ numero, status, cintillos });
  });
  s.camposPersonalizados.fat_items = items;
}

function generarTextoCintillosFTTH(s) {
  const vals = s.camposPersonalizados || {};
  const L = ['MESA MULTISKILL HITSS - CONSULTA DE CINTILLOS FTTH'];
  const ticketVal = (s.nTicket || '').trim();
  if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
    L.push(`N. TICKET: ${ticketVal}`);
  }
  L.push(`PLANO: ${vals.plano||'—'}`);
  (vals.fat_items||[]).forEach(item => {
    const num = item.numero||'?';
    if (item.status === 'saturado') L.push(`FAT #${num} SATURADO`);
    else { const c = (item.cintillos||[]).length > 0 ? item.cintillos.join(' / ') : '—'; L.push(`FAT #${num} NO SATURADO / ${c}`); }
  });
  L.push(`REALIZADO POR: ${s.realizadoPor||'ANGEL LLAMACPONCCA'}`);
  return L.join('\n');
}

// ════════════════════════════════
//  ── CINTILLOS HFC ──
// ════════════════════════════════
function renderFormCintillosHFC(vals) {
  const plano = vals.plano !== undefined ? vals.plano : '';
  g('customFormArea').innerHTML = `
    <div class="custom-form-area">
      <div class="field-group">
        <label class="field-label">🗺️ PLANO</label>
        <input type="text" id="cesp_plano" value="${plano}" placeholder="Ej. PL-001" />
      </div>
      <div id="tapItemsContainer"></div>
      <div class="add-btns"><div class="add-btns-row">
        <button type="button" class="btn-add" onclick="addTAPItem()">📡 Agregar TAP</button>
      </div></div>
    </div>`;
  g('customFormArea').classList.remove('hidden');
  const items = vals.tap_items || [];
  if (items.length > 0) items.forEach(item => addTAPItem(item));
  else addTAPItem();
}

function addTAPItem(data) {
  tapCounter++;
  const tapId = `tap_${tapCounter}`;
  const tap   = data?.tap   || '';
  const borne = data?.borne || '';
  const status = data?.status || 'saturado';
  const cints  = data?.cintillos || [];
  const div = document.createElement('div');
  div.className = 'item-block tap-item'; div.dataset.tapId = tapId; div.dataset.status = status;
  div.innerHTML = `
    <div class="item-header-row">
      <span class="item-label">📡 TAP #</span>
      <input type="text" class="item-num tap-a" placeholder="12" value="${tap}" />
      <span class="item-sep">X</span>
      <input type="text" class="item-num borne-b" placeholder="8" value="${borne}" />
      <div class="status-toggle">
        <button type="button" class="stog-btn stog-sat ${status==='saturado'?'active-sat':''}" onclick="setTAPStatus('${tapId}','saturado')">SATURADO</button>
        <button type="button" class="stog-btn stog-nosat ${status==='no_saturado'?'active-nosat':''}" onclick="setTAPStatus('${tapId}','no_saturado')">NO SATURADO</button>
      </div>
      <button type="button" class="btn-remove" onclick="removeTAPItem('${tapId}')">✕ Quitar</button>
    </div>
    <div class="cintillos-area ${status==='saturado'?'hidden':''}" id="cints_${tapId}">
      <div class="cint-list" id="cint_list_${tapId}"></div>
      <button type="button" class="btn-add-cint" onclick="addTAPCintillo('${tapId}')">+ Agregar cintillo</button>
    </div>`;
  g('tapItemsContainer').appendChild(div);
  if (cints.length > 0) cints.forEach(c => addTAPCintillo(tapId, c));
  else if (status === 'no_saturado') addTAPCintillo(tapId);
}

function removeTAPItem(tapId) {
  const el = document.querySelector(`[data-tap-id="${tapId}"]`);
  if (el) { el.style.opacity='0'; el.style.transition='opacity 0.15s'; setTimeout(()=>el.remove(),160); }
}

function setTAPStatus(tapId, status) {
  const block = document.querySelector(`[data-tap-id="${tapId}"]`);
  if (!block) return;
  block.dataset.status = status;
  block.querySelectorAll('.stog-btn')[0].className = `stog-btn stog-sat ${status==='saturado'?'active-sat':''}`;
  block.querySelectorAll('.stog-btn')[1].className = `stog-btn stog-nosat ${status==='no_saturado'?'active-nosat':''}`;
  const ca = g(`cints_${tapId}`);
  if (status === 'saturado') ca.classList.add('hidden');
  else { ca.classList.remove('hidden'); if (!g(`cint_list_${tapId}`).children.length) addTAPCintillo(tapId); }
}

function addTAPCintillo(tapId, value='') {
  cintCounter++;
  const cintId = `cint_${cintCounter}`;
  const li = document.createElement('div');
  li.className = 'cint-item'; li.dataset.cintId = cintId;
  li.innerHTML = `<input type="text" class="cint-input" placeholder="Número de cintillo" value="${value}" /><button type="button" class="btn-remove-sm" onclick="removeTAPCintillo('${tapId}','${cintId}')">✕</button>`;
  g(`cint_list_${tapId}`).appendChild(li);
}
function removeTAPCintillo(_, cintId) { document.querySelector(`[data-cint-id="${cintId}"]`)?.remove(); }

function guardarCintillosHFC(s) {
  if (isLoadingSection) return;
  s.camposPersonalizados = s.camposPersonalizados || {};
  s.camposPersonalizados.plano = gv('cesp_plano');
  const items = [];
  document.querySelectorAll('#tapItemsContainer .tap-item').forEach(block => {
    const inputs = block.querySelectorAll('.item-num');
    const tap = inputs[0]?.value||''; const borne = inputs[1]?.value||'';
    const status = block.dataset.status || 'saturado';
    const cintillos = [];
    block.querySelectorAll('.cint-input').forEach(inp => { if (inp.value.trim()) cintillos.push(inp.value.trim()); });
    items.push({ tap, borne, status, cintillos });
  });
  s.camposPersonalizados.tap_items = items;
}

function generarTextoCintillosHFC(s) {
  const vals = s.camposPersonalizados || {};
  const L = ['MESA MULTISKILL HITSS - CONSULTA DE CINTILLOS HFC'];
  const ticketVal = (s.nTicket || '').trim();
  if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
    L.push(`N. TICKET: ${ticketVal}`);
  }
  L.push(`PLANO: ${vals.plano||'—'}`);
  (vals.tap_items||[]).forEach(item => {
    const t = item.tap||'?'; const b = item.borne||'?';
    if (item.status === 'saturado') L.push(`TAP #${t}X${b} SATURADO`);
    else { const c = (item.cintillos||[]).length > 0 ? item.cintillos.join(' / ') : '—'; L.push(`TAP #${t}X${b} NO SATURADO / ${c}`); }
  });
  L.push(`REALIZADO POR: ${s.realizadoPor||'ANGEL LLAMACPONCCA'}`);
  return L.join('\n');
}

// ════════════════════════════════
//  ── DERIVACION PEXT ──
// ════════════════════════════════
function renderFormDerivacionPext(tipo, vals) {
  // FIX: use the TYPE passed as parameter (not from stale section data)
  const isHFC    = tipo === 'derivacion_pext_hfc';
  const subtipos = isHFC ? DERIVACION_PEXT_HFC_SUBTIPOS : DERIVACION_PEXT_FTTH_SUBTIPOS;
  const currSub  = vals.pext_subtipo || '';
  const opts     = Object.keys(subtipos).map(k =>
    `<option value="${k}" ${currSub===k?'selected':''}>${k}</option>`).join('');

  let html = `
    <div class="field-group">
      <label class="field-label">⚠️ Motivo de Derivación</label>
      <div class="sel-wrap">
        <select id="cesp_pext_subtipo" onchange="onPextSubtipoChange()">
          <option value="">— Selecciona el motivo —</option>
          ${opts}
        </select>
        <span class="sel-arrow">▾</span>
      </div>
    </div>`;

  if (currSub && subtipos[currSub]) {
    html += renderSubtipoCampos(subtipos[currSub].campos, vals);
  }

  const area = g('customFormArea');
  area.innerHTML = html;
  area.classList.remove('hidden');
}

// FIX: get tipo from DOM (not from section which may be stale)
function onPextSubtipoChange() {
  if (secciones.length === 0) return;
  const s    = secciones[seccionActiva];
  const tipo = gv('tipoGestion'); // ← KEY FIX: always read from DOM
  guardarCamposCustom(s);
  renderFormDerivacionPext(tipo, s.camposPersonalizados);
}

function generarTextoDerivacionPext(s) {
  const tipo     = s.tipoGestion;
  const cfg      = GESTIONES_ESPECIALES[tipo];
  const vals     = s.camposPersonalizados || {};
  const sub      = vals.pext_subtipo || '';
  if (!sub) return `${cfg.header}\n[Sin motivo seleccionado]`;
  const isHFC    = tipo === 'derivacion_pext_hfc';
  const subtipos = isHFC ? DERIVACION_PEXT_HFC_SUBTIPOS : DERIVACION_PEXT_FTTH_SUBTIPOS;
  const scfg     = subtipos[sub];
  if (!scfg) return '';
  const L = [cfg.header, sub];

  const ticketVal = (s.nTicket || '').trim();
  if (ticketVal !== '') {
    L.push(`N. TICKET: ${ticketVal}`);
  }

  scfg.tmpl.forEach(line => {
    if (line.includes('TORRE') || line.includes('PISO')) {
      const vTorre = (vals.torre || '').trim();
      const vPiso  = (vals.piso || '').trim();
      if (!vTorre && !vPiso) {
        return; // Omitir si ambos están vacíos
      }
      if (vTorre && vPiso) {
        L.push(line.replace('{torre}', vTorre).replace('{piso}', vPiso));
      } else if (vTorre) {
        L.push(`TORRE: ${vTorre}`);
      } else if (vPiso) {
        L.push(`PISO: ${vPiso}`);
      }
    } else {
      L.push(line.replace(/\{(\w+)\}/g, (_, k) => vals[k] || '—'));
    }
  });

  const realizado = s.realizadoPor?.trim() || getStoredUserName();
  L.push(`REALIZADO POR: ${realizado}`);
  return L.join('\n');
}

// ════════════════════════════════
//  DERIVAR A CONMUTACION
// ════════════════════════════════
function setFechaHoyConmutacion(inputId) {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const el = g(inputId);
  if (el) {
    el.value = `${d}/${m}/${y}`;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
window.setFechaHoyConmutacion = setFechaHoyConmutacion;

function setFechaHoraAhoraConmutacion(inputId) {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const el = g(inputId);
  if (el) {
    el.value = `${d}/${m}/${y} ${hh}:${mm}`;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
window.setFechaHoraAhoraConmutacion = setFechaHoraAhoraConmutacion;

function renderFormDerivarConmutacion(vals) {
  const area = g('customFormArea');
  if (!area) return;

  const tipoServ = vals.tipo_servicio || 'HFC';
  const tipoCli = vals.tipo_cliente || 'MASIVOS';
  const fechaAct = vals.fecha_activacion || '';
  const lineaOri = vals.linea_origen || '';
  const nomCli = vals.nombre_razon_social || '';
  const cusId = vals.customer_id || '';
  const descProb = vals.descripcion_problema || '';

  // Destinos
  const dest1 = vals.linea_destino_1 || '';
  const op1 = vals.operador_destino_1 || 'CLARO';
  const fh1 = vals.fecha_hora_1 || '';

  const dest2 = vals.linea_destino_2 || '';
  const op2 = vals.operador_destino_2 || 'CLARO';
  const fh2 = vals.fecha_hora_2 || '';

  // Por defecto
  const plan = vals.plan || 'CONTROL';
  const cv = vals.sva_central_virtual || 'SI';
  const hunting = vals.sva_hunting || '';
  const desvio = vals.sva_desvio || '';
  const loc = vals.locucion || 'SIN TONO';
  const nCaso = vals.n_caso || 'No aplica';
  const dInc = vals.descarte_incognito || 'SI – CMTS – NCOS – OCSI – ESTADO FISICO: CONECTADO';
  const dSga = vals.descarte_sga || 'SI – ACTIVO';
  const dJanus = vals.descarte_janus || 'SI – ACTIVO';
  const dPorta = vals.descarte_porta || '-';
  const dOtro = vals.descarte_otro || '-';

  let html = `
    <div class="custom-form-area conmutacion-form-wrap">
      <div class="conmutacion-section-title">
        <i class="fa-solid fa-phone-volume"></i> Datos del Servicio y Cliente
      </div>

      <div class="conmutacion-grid-2">
        <div class="field-group">
          <label class="field-label">Tipo de Servicio (FTTH o HFC)</label>
          <div class="sel-wrap">
            <select id="cesp_tipo_servicio">
              <option value="HFC" ${tipoServ === 'HFC' ? 'selected' : ''}>HFC</option>
              <option value="FTTH" ${tipoServ === 'FTTH' ? 'selected' : ''}>FTTH</option>
            </select>
            <span class="sel-arrow">▾</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Tipo de Cliente (Consumer/Business)</label>
          <div class="sel-wrap">
            <select id="cesp_tipo_cliente">
              <option value="MASIVOS" ${tipoCli === 'MASIVOS' ? 'selected' : ''}>MASIVOS</option>
              <option value="CONSUMER" ${tipoCli === 'CONSUMER' ? 'selected' : ''}>CONSUMER</option>
              <option value="BUSINESS" ${tipoCli === 'BUSINESS' ? 'selected' : ''}>BUSINESS</option>
              <option value="CORPORATIVO" ${tipoCli === 'CORPORATIVO' ? 'selected' : ''}>CORPORATIVO</option>
            </select>
            <span class="sel-arrow">▾</span>
          </div>
        </div>
      </div>

      <div class="conmutacion-grid-2">
        <div class="field-group">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label class="field-label">Fecha de Activación (DD/MM/AAAA)</label>
            <button type="button" class="btn-micro-helper" onclick="setFechaHoyConmutacion('cesp_fecha_activacion')" title="Poner fecha de hoy">📅 Hoy</button>
          </div>
          <input type="text" id="cesp_fecha_activacion" value="${fechaAct}" placeholder="DD/MM/AAAA (Ej. 22/09/2026)" />
        </div>

        <div class="field-group">
          <label class="field-label">Línea de Origen</label>
          <input type="text" id="cesp_linea_origen" value="${lineaOri}" placeholder="Ej. 16478472" />
        </div>
      </div>

      <div class="conmutacion-grid-2">
        <div class="field-group">
          <label class="field-label">Nombre / Razón Social</label>
          <input type="text" id="cesp_nombre_razon_social" value="${nomCli}" placeholder="Ej. FERNANDO GABRIEL FERNANDEZ MANOSALVA" />
        </div>

        <div class="field-group">
          <label class="field-label">CustomerID / Código SGA</label>
          <input type="text" id="cesp_customer_id" value="${cusId}" placeholder="Ej. 36665144" />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">Descripción del Problema</label>
        <textarea id="cesp_descripcion_problema" rows="2" style="width:100%; border-radius:var(--r-sm, 6px); padding:0.5rem; resize:vertical; font-family:inherit; background:var(--bg-input); color:var(--text-primary); border:1px solid var(--border);" placeholder="Ej. NO PUEDE REALIZAR LLAMADAS NI RECIBIR LLAMADAS">${descProb}</textarea>
      </div>

      <!-- BLOQUE DE PRUEBAS DE LLAMADA -->
      <div class="conmutacion-section-title" style="margin-top:0.6rem;">
        <i class="fa-solid fa-tower-broadcast"></i> Pruebas con Líneas de Destino
      </div>

      <!-- Destino 1 -->
      <div class="conmutacion-test-card">
        <div class="conmutacion-test-header">
          <span>Prueba 1 (Principal)</span>
          <button type="button" class="btn-micro-helper" onclick="setFechaHoraAhoraConmutacion('cesp_fecha_hora_1')" title="Poner fecha y hora actual">🕒 Ahora</button>
        </div>
        <div class="conmutacion-grid-3">
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Línea Destino 1</label>
            <input type="text" id="cesp_linea_destino_1" value="${dest1}" placeholder="Ej. 953814487" />
          </div>
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Operador Destino 1</label>
            <div class="sel-wrap">
              <select id="cesp_operador_destino_1">
                <option value="CLARO" ${op1==='CLARO'?'selected':''}>CLARO</option>
                <option value="MOVISTAR" ${op1==='MOVISTAR'?'selected':''}>MOVISTAR</option>
                <option value="ENTEL" ${op1==='ENTEL'?'selected':''}>ENTEL</option>
                <option value="BITEL" ${op1==='BITEL'?'selected':''}>BITEL</option>
                <option value="OTRO" ${op1==='OTRO'?'selected':''}>OTRO</option>
              </select>
              <span class="sel-arrow">▾</span>
            </div>
          </div>
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Fecha y Hora Prueba 1</label>
            <input type="text" id="cesp_fecha_hora_1" value="${fh1}" placeholder="DD/MM/AAAA HH:MM" />
          </div>
        </div>
      </div>

      <!-- Destino 2 -->
      <div class="conmutacion-test-card">
        <div class="conmutacion-test-header">
          <span>Prueba 2 (Opcional)</span>
          <button type="button" class="btn-micro-helper" onclick="setFechaHoraAhoraConmutacion('cesp_fecha_hora_2')" title="Poner fecha y hora actual">🕒 Ahora</button>
        </div>
        <div class="conmutacion-grid-3">
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Línea Destino 2</label>
            <input type="text" id="cesp_linea_destino_2" value="${dest2}" placeholder="Ej. 967556596" />
          </div>
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Operador Destino 2</label>
            <div class="sel-wrap">
              <select id="cesp_operador_destino_2">
                <option value="CLARO" ${op2==='CLARO'?'selected':''}>CLARO</option>
                <option value="MOVISTAR" ${op2==='MOVISTAR'?'selected':''}>MOVISTAR</option>
                <option value="ENTEL" ${op2==='ENTEL'?'selected':''}>ENTEL</option>
                <option value="BITEL" ${op2==='BITEL'?'selected':''}>BITEL</option>
                <option value="OTRO" ${op2==='OTRO'?'selected':''}>OTRO</option>
              </select>
              <span class="sel-arrow">▾</span>
            </div>
          </div>
          <div class="field-group inner" style="margin-bottom:0;">
            <label class="field-label">Fecha y Hora Prueba 2</label>
            <input type="text" id="cesp_fecha_hora_2" value="${fh2}" placeholder="DD/MM/AAAA HH:MM" />
          </div>
        </div>
      </div>

      <!-- VALORES POR DEFECTO -->
      <details class="conmutacion-details-accordion">
        <summary class="conmutacion-summary">
          <span>⚙️ Valores por Defecto (Preconfigurados)</span>
          <span class="summary-hint">Clic para ver o modificar</span>
        </summary>
        <div class="conmutacion-defaults-body" style="padding-top:0.8rem;">
          <div class="conmutacion-grid-2">
            <div class="field-group">
              <label class="field-label">Plan (CONTROL/ABIERTO)</label>
              <div class="sel-wrap">
                <select id="cesp_plan">
                  <option value="CONTROL" ${plan==='CONTROL'?'selected':''}>CONTROL</option>
                  <option value="ABIERTO" ${plan==='ABIERTO'?'selected':''}>ABIERTO</option>
                </select>
                <span class="sel-arrow">▾</span>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Locución</label>
              <input type="text" id="cesp_locucion" value="${loc}" placeholder="SIN TONO" />
            </div>
          </div>

          <div class="conmutacion-grid-3">
            <div class="field-group">
              <label class="field-label">SVA: Central Virtual</label>
              <input type="text" id="cesp_sva_central_virtual" value="${cv}" placeholder="SI" />
            </div>
            <div class="field-group">
              <label class="field-label">SVA: Config. Hunting</label>
              <input type="text" id="cesp_sva_hunting" value="${hunting}" placeholder="" />
            </div>
            <div class="field-group">
              <label class="field-label">SVA: Desvío Llamadas</label>
              <input type="text" id="cesp_sva_desvio" value="${desvio}" placeholder="" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">N.° Caso / N° Incidencia</label>
            <input type="text" id="cesp_n_caso" value="${nCaso}" placeholder="No aplica" />
          </div>

          <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin:0.6rem 0 0.3rem 0; text-transform:uppercase;">
            Descartes Realizados (SÍ / NO / N/A)
          </div>

          <div class="field-group inner">
            <label class="field-label">Incognito</label>
            <input type="text" id="cesp_descarte_incognito" value="${dInc}" />
          </div>
          <div class="field-group inner">
            <label class="field-label">SGA/SIAC</label>
            <input type="text" id="cesp_descarte_sga" value="${dSga}" />
          </div>
          <div class="field-group inner">
            <label class="field-label">Janus (solo cliente Masivo)</label>
            <input type="text" id="cesp_descarte_janus" value="${dJanus}" />
          </div>
          <div class="conmutacion-grid-2">
            <div class="field-group inner">
              <label class="field-label">Estado Portabilidad</label>
              <input type="text" id="cesp_descarte_porta" value="${dPorta}" />
            </div>
            <div class="field-group inner">
              <label class="field-label">Otro (especificar)</label>
              <input type="text" id="cesp_descarte_otro" value="${dOtro}" />
            </div>
          </div>
        </div>
      </details>
    </div>
  `;

  area.innerHTML = html;
  area.classList.remove('hidden');
}

// ════════════════════════════════
//  RENDER CAMPOS SUBTIPO (shared by PEXT + RECHAZO)
// ════════════════════════════════
function renderSubtipoCampos(campos, vals) {
  let html = '';
  campos.forEach(c => {
    const isManttoGroup = c.grupo === 'mantto_equipo';
    const motivoVal     = vals.motivo || '';
    const esCambioEq    = ['CAMBIO DE EQUIPO POR COMPATIBILIDAD','CAMBIO DE EQUIPO DAÑADO'].includes(motivoVal) ||
                          motivoVal.toUpperCase().includes('EQUIPO');
    const hiddenCls     = (isManttoGroup && !esCambioEq) ? 'hidden' : '';
    const groupAttr     = isManttoGroup ? 'data-grupo="mantto_equipo"' : '';

    if (c.type === 'dual') {
      const v1 = (c.key  in vals) ? vals[c.key]  : '';
      const v2 = (c.key2 in vals) ? vals[c.key2] : '';
      html += `
        <div class="field-group ${hiddenCls}" ${groupAttr}>
          <label class="field-label">${c.label}</label>
          <div class="dual-inputs">
            <div class="dual-part"><span class="dual-prefix">${c.pre1}</span><input type="text" id="cesp_${c.key}" class="dual-input" value="${v1}" placeholder="—"/></div>
            <div class="dual-part"><span class="dual-prefix">${c.pre2}</span><input type="text" id="cesp_${c.key2}" class="dual-input" value="${v2}" placeholder="—"/></div>
          </div>
        </div>`;
    } else if (c.type === 'select') {
      const currVal = (c.key in vals && vals[c.key] !== '') ? vals[c.key] : (c.def || '');
      const onchAttr = c.onchange ? `onchange="${c.onchange}"` : '';
      const opts = c.options.map(o => `<option value="${o}" ${currVal===o?'selected':''}>${o||'— Selecciona —'}</option>`).join('');
      html += `<div class="field-group ${hiddenCls}" ${groupAttr}><label class="field-label">${c.label}</label><div class="sel-wrap"><select id="cesp_${c.key}" ${onchAttr}>${opts}</select><span class="sel-arrow">▾</span></div></div>`;
    } else if (c.type === 'motivo_rechazo_select') {
      const currVal = (c.key in vals) ? vals[c.key] : '';
      const isMan = currVal !== '' && !MOTIVOS_RECHAZO.includes(currVal);
      const selVal = isMan ? '__manual__' : currVal;
      const manVal = isMan ? currVal : '';

      let optsHtml = `<option value="">— Selecciona motivo de rechazo —</option>`;
      MOTIVOS_RECHAZO.forEach(m => {
        optsHtml += `<option value="${m}" ${selVal===m?'selected':''}>${m}</option>`;
      });
      optsHtml += `<option value="__manual__" ${selVal==='__manual__'?'selected':''}>✏️ Otro / Escribir motivo manualmente…</option>`;

      html += `
        <div class="field-group ${hiddenCls}" ${groupAttr}>
          <label class="field-label">${c.label}</label>
          <div class="sel-wrap">
            <select id="cesp_${c.key}" onchange="onMotivoSelectChange(this, 'cesp_${c.key}_manual')">
              ${optsHtml}
            </select>
            <span class="sel-arrow">▾</span>
          </div>
          <input type="text" id="cesp_${c.key}_manual" class="input-mod-manual ${isMan ? '' : 'hidden'}"
                 value="${manVal}" placeholder="Escribe el motivo de rechazo…" style="margin-top:0.4rem" />
        </div>`;
    } else if (c.type === 'motivo_select') {
      const currVal = (c.key in vals) ? vals[c.key] : '';
      const isMan = currVal !== '' && !MOTIVOS_CAMBIO_AUTORIZACION.includes(currVal);
      const selVal = isMan ? '__manual__' : currVal;
      const manVal = isMan ? currVal : '';

      let optsHtml = `<option value="">— Selecciona motivo —</option>`;
      MOTIVOS_CAMBIO_AUTORIZACION.forEach(m => {
        optsHtml += `<option value="${m}" ${selVal===m?'selected':''}>${m}</option>`;
      });
      optsHtml += `<option value="__manual__" ${selVal==='__manual__'?'selected':''}>✏️ Otro / Agregar motivo manualmente…</option>`;

      html += `
        <div class="field-group ${hiddenCls}" ${groupAttr}>
          <label class="field-label">${c.label}</label>
          <div class="sel-wrap">
            <select id="cesp_${c.key}" onchange="onMotivoSelectChange(this, 'cesp_${c.key}_manual')">
              ${optsHtml}
            </select>
            <span class="sel-arrow">▾</span>
          </div>
          <input type="text" id="cesp_${c.key}_manual" class="input-mod-manual ${isMan ? '' : 'hidden'}"
                 value="${manVal}" placeholder="Escribe el motivo…" style="margin-top:0.4rem" />
        </div>`;
    } else if (c.type === 'motivo_mantto_select') {
      const currVal = (c.key in vals) ? vals[c.key] : '';
      const isMan = currVal !== '' && !MOTIVOS_SOT_MANTTO.includes(currVal);
      const selVal = isMan ? '__manual__' : currVal;
      const manVal = isMan ? currVal : '';

      let optsHtml = `<option value="">— Selecciona motivo —</option>`;
      MOTIVOS_SOT_MANTTO.forEach(m => {
        optsHtml += `<option value="${m}" ${selVal===m?'selected':''}>${m}</option>`;
      });
      optsHtml += `<option value="__manual__" ${selVal==='__manual__'?'selected':''}>✏️ Otro / Agregar motivo manualmente…</option>`;

      html += `
        <div class="field-group ${hiddenCls}" ${groupAttr}>
          <label class="field-label">${c.label}</label>
          <div class="sel-wrap">
            <select id="cesp_${c.key}" onchange="onManttoMotivoChange()">
              ${optsHtml}
            </select>
            <span class="sel-arrow">▾</span>
          </div>
          <input type="text" id="cesp_${c.key}_manual" class="input-mod-manual ${isMan ? '' : 'hidden'}"
                 value="${manVal}" placeholder="Escribe el motivo…" style="margin-top:0.4rem" oninput="onManttoMotivoInput()" />
        </div>`;
    } else if (c.type === 'model_select') {
      const currVal = (c.key in vals) ? vals[c.key] : '';
      const knownAll = [
        ...MODELOS.hfc,
        ...MODELOS.ftth,
        ...MODELOS_DECO.iptv,
        ...MODELOS_DECO.hfc
      ];
      const uniqueModels = [...new Set(knownAll)];
      const isMan = currVal !== '' && !uniqueModels.includes(currVal);
      const selVal = isMan ? '__manual__' : currVal;
      const manVal = isMan ? currVal : '';

      let optsHtml = `<option value="">— Selecciona modelo —</option>`;
      uniqueModels.forEach(m => {
        optsHtml += `<option value="${m}" ${selVal===m?'selected':''}>${m}</option>`;
      });
      optsHtml += `<option value="__manual__" ${selVal==='__manual__'?'selected':''}>✏️ Escribir manualmente…</option>`;

      html += `
        <div class="field-group ${hiddenCls}" ${groupAttr}>
          <label class="field-label">${c.label}</label>
          <div class="sel-wrap">
            <select id="cesp_${c.key}" onchange="onModelSelectChange(this, 'cesp_${c.key}_manual')">
              ${optsHtml}
            </select>
            <span class="sel-arrow">▾</span>
          </div>
          <input type="text" id="cesp_${c.key}_manual" class="input-mod-manual ${isMan ? '' : 'hidden'}"
                 value="${manVal}" placeholder="Escribe el modelo…" style="margin-top:0.4rem" />
        </div>`;
    } else {
      const val = (c.key in vals) ? vals[c.key] : (c.def || '');
      html += `<div class="field-group ${hiddenCls}" ${groupAttr}><label class="field-label">${c.label}</label><input type="text" id="cesp_${c.key}" value="${val}" placeholder="${c.ph||''}"/></div>`;
    }
  });
  return html;
}

function onModelSelectChange(sel, manualId) {
  const man = g(manualId);
  if (!man) return;
  if (sel.value === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
}

function onModeloRepetidorChange() {
  const sel = g('modeloRepetidor');
  const man = g('modeloRepetidorManual');
  if (!sel || !man) return;
  if (sel.value === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
}

// ════════════════════════════════
//  VISIBILIDAD / BADGE
// ════════════════════════════════
function aplicarVisibilidad(tipo) {
  const cfg    = tipo ? GESTIONES[tipo] : null;
  const extras = ['bloqueEstado','bloqueObs','bloqueRealizadoPor','actionRow'];
  hide('customFormArea');
  if (!cfg) {
    ['bloqueEquipoPrincipal','bloqueRepetidor','botonesAgregar'].forEach(hide);
    extras.forEach(hide); return;
  }
  if (cfg.mostrarEquipo) {
    show('bloqueEquipoPrincipal');
    g('labelEquipoActivado').textContent  = cfg.labelEquipo;
    g('equipoPrincipalLabel').textContent = cfg.labelEquipo;
    populateModelosSelect(tipo, getCurrentTech());
  } else hide('bloqueEquipoPrincipal');
  cfg.mostrarMesh    ? show('bloqueRepetidor') : hide('bloqueRepetidor');
  if (cfg.mostrarAgregar) {
    show('botonesAgregar');
    const btnDeco = g('btnAddDeco');
    const btnRep  = g('btnAddRepetidor');
    if (tipo === 'activacion_mesh') {
      if (btnDeco) hide(btnDeco);
      if (btnRep) {
        show(btnRep);
        btnRep.textContent = '+ Agregar Repetidor Mesh';
      }
    } else {
      if (btnDeco) show(btnDeco);
      if (btnRep) {
        show(btnRep);
        btnRep.textContent = '+ Repetidor';
      }
    }
  } else {
    hide('botonesAgregar');
  }
  g('labelEstado').textContent = cfg.labelEstado;
  extras.forEach(show);
}

function actualizarBadge(tipo) {
  const badge = g('seccionTipoBadge');
  badge.className = 'sec-tipo-badge';
  if (!tipo) { badge.textContent = 'SIN GESTIÓN'; return; }
  const titulo = esEspecial(tipo) ? GESTIONES_ESPECIALES[tipo].titulo : GESTIONES[tipo]?.titulo;
  badge.textContent = titulo || tipo;
  badge.classList.add(`badge-${tipo}`);
}

// ════════════════════════════════
//  TECNOLOGÍA / MODELOS ── SELECT COMPLETO O POR TECNOLOGÍA
// ════════════════════════════════
function populateModelosSelect(tipo, tech, brandFilter = null) {
  const sel = g('modeloEquipo');
  if (!sel) return;

  const sinDiscriminar = ['cambio_equipo', 'codigo_autorizacion', 'sot_mantto'].includes(tipo);

  let modelosList = [];
  if (sinDiscriminar) {
    modelosList = [
      ...MODELOS.hfc,
      ...MODELOS.ftth,
      ...MODELOS_DECO.iptv,
      ...MODELOS_DECO.hfc
    ];
    modelosList = [...new Set(modelosList)];
  } else if (tech === 'hfc') {
    // en caso de la tecnologia hfc deja las opciones como estan
    modelosList = MODELOS.hfc;
  } else if (tech === 'ftth') {
    if (brandFilter === 'huawei') {
      modelosList = MODELOS_ONT_HUAWEI;
    } else if (brandFilter === 'zte') {
      modelosList = MODELOS_ONT_ZTE;
    } else {
      modelosList = MODELOS.ftth;
    }
  } else {
    modelosList = [...MODELOS.hfc, ...MODELOS.ftth];
  }

  const promptTxt = sinDiscriminar
    ? '— Selecciona modelo (Todos) —'
    : (tech === 'ftth' && brandFilter === 'huawei')
      ? '— Selecciona modelo HUAWEI —'
      : (tech === 'ftth' && brandFilter === 'zte')
        ? '— Selecciona modelo ZTE —'
        : tech
          ? `— Selecciona modelo ${tech.toUpperCase()} —`
          : '— Selecciona modelo —';

  const currentVal = sel.value;
  sel.innerHTML = `<option value="">${promptTxt}</option>`;
  modelosList.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m; sel.appendChild(opt);
  });
  const manOpt = document.createElement('option');
  manOpt.value = '__manual__'; manOpt.textContent = '✏️ Escribir manualmente…';
  sel.appendChild(manOpt);

  if (currentVal && (modelosList.includes(currentVal) || currentVal === '__manual__')) {
    sel.value = currentVal;
  }
}

function setTech(tech, save=true) {
  resetTechBtns();
  const btn = document.querySelector(`.tech-btn[data-tech="${tech}"]`);
  if (btn) btn.classList.add('active', tech);

  const tipo = gv('tipoGestion');
  let brandFilter = null;
  if (tech === 'ftth') {
    const eqVal = (gv('equipoActivado') || '').trim().toUpperCase();
    if (eqVal.startsWith('48575443')) brandFilter = 'huawei';
    else if (eqVal.startsWith('5A544547')) brandFilter = 'zte';
  }
  populateModelosSelect(tipo, tech, brandFilter);

  // Hide manual input when tech changes
  const man = g('modeloManual');
  if (man) { man.classList.add('hidden'); man.value = ''; }

  if (save) {
    if (secciones.length > 0) secciones[seccionActiva].tecnologia = tech;
    sincronizarMarcaRepetidoresConOnt();
  }
}

function getOntBrand() {
  const currentTech = getCurrentTech();
  if (currentTech === 'hfc') return null;

  const mod = (gv('modeloEquipo') || '').toUpperCase();
  const eq  = (gv('equipoActivado') || '').toUpperCase();

  if (MODELOS_ONT_HUAWEI.some(m => m.toUpperCase() === mod) || mod.includes('HUAWEI') || mod.startsWith('HG8')) {
    return 'huawei';
  }
  if (MODELOS_ONT_ZTE.some(m => m.toUpperCase() === mod) || mod.includes('ZTE') || mod.startsWith('F6')) {
    return 'zte';
  }

  if (eq.startsWith('48575443')) return 'huawei';
  if (eq.startsWith('5A544547')) return 'zte';

  return null;
}

function sincronizarMarcaRepetidoresConOnt() {
  if (isLoadingSection) return;
  const brand = getOntBrand();
  if (!brand) return;

  const targetModel = (brand === 'huawei')
    ? 'ROUTER K562E-10 50087708 HUAWEI'
    : 'REPETIDOR ZXHN H3601P 180000528400 ZTE';

  // 1. Sincronizar bloqueRepetidor si visible y no personalizado manualmente
  const selPrincipal = g('modeloRepetidor');
  if (selPrincipal && selPrincipal.value !== '__manual__') {
    if (!selPrincipal.value || (brand === 'huawei' && selPrincipal.value.includes('ZTE')) || (brand === 'zte' && selPrincipal.value.includes('HUAWEI'))) {
      selPrincipal.value = targetModel;
      if (typeof onModeloRepetidorChange === 'function') onModeloRepetidorChange();
    }
  }

  // 2. Sincronizar repetidores adicionales (Decos omitidos)
  const repBlocks = document.querySelectorAll('.eq-block-adicional[data-tipo="repetidor"]');
  repBlocks.forEach(b => {
    const sel = b.querySelector('.input-mod');
    const uid = b.dataset.uid;
    if (sel && sel.value !== '__manual__') {
      if (!sel.value || (brand === 'huawei' && sel.value.includes('ZTE')) || (brand === 'zte' && sel.value.includes('HUAWEI'))) {
        sel.value = targetModel;
        if (secciones.length > 0 && secciones[seccionActiva]) {
          const item = (secciones[seccionActiva].equiposAdicionales || []).find(e => e.uid === uid);
          if (item) item.modelo = targetModel;
        }
      }
    }
  });

  guardarFormActual();
  generarPlantilla();
}

function onModeloChange() {
  const man = g('modeloManual');
  if (!man) return;
  if (gv('modeloEquipo') === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
  sincronizarMarcaRepetidoresConOnt();
}

function onEstadoChange() {
  const man = g('estadoManual');
  if (!man) return;
  if (gv('estado') === '__manual__') {
    man.classList.remove('hidden');
    man.focus();
  } else {
    man.classList.add('hidden');
  }
}

function resetTechBtns() {
  document.querySelectorAll('.tech-btn').forEach(b => b.classList.remove('active','hfc','ftth'));
}

// ════════════════════════════════
//  EQUIPOS ADICIONALES
// ════════════════════════════════
function agregarEquipoAdicional(tipo) {
  eqCounter++;
  const uid = `eq_${Date.now()}_${eqCounter}`;

  let defaultModelo = '';
  if (tipo === 'repetidor') {
    const ontBrand = getOntBrand();
    if (ontBrand === 'huawei') {
      defaultModelo = 'ROUTER K562E-10 50087708 HUAWEI';
    } else if (ontBrand === 'zte') {
      defaultModelo = 'REPETIDOR ZXHN H3601P 180000528400 ZTE';
    }
  }

  renderEqAdicional(tipo, uid, '', defaultModelo);
  if (secciones.length > 0) {
    const arr = secciones[seccionActiva].equiposAdicionales;
    const newItem = { uid, tipo, equipo: '', modelo: defaultModelo };
    if (tipo === 'deco') {
      let lastDecoIndex = -1;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].tipo === 'deco') lastDecoIndex = i;
      }
      if (lastDecoIndex >= 0) {
        arr.splice(lastDecoIndex + 1, 0, newItem);
      } else {
        arr.unshift(newItem);
      }
    } else {
      arr.push(newItem);
    }
  }

  if (tipo === 'repetidor' && defaultModelo) {
    const brandName = defaultModelo.includes('HUAWEI') ? 'HUAWEI' : 'ZTE';
    mostrarAvisoSerial(`✨ Repetidor ${brandName} asignado según marca de ONT`);
  }

  guardarFormActual();
  generarPlantilla();
}

function getCurrentTech() {
  const ab = document.querySelector('.tech-btn.active');
  if (ab) return ab.dataset.tech;
  return secciones.length > 0 ? secciones[seccionActiva].tecnologia : '';
}

function buildDecoOptions(modelo) {
  const tech   = getCurrentTech();
  // IPTV decos always visible; HFC-only decos only when HFC selected
  const all = tech === 'ftth'
    ? [...MODELOS_DECO.iptv]
    : [...MODELOS_DECO.hfc, ...MODELOS_DECO.iptv];
  let html = `<option value="">— Selecciona modelo —</option>`;
  all.forEach(m => html += `<option value="${m}" ${modelo===m?'selected':''}>${m}</option>`);
  html += `<option value="__manual__" ${modelo==='__manual__'?'selected':''}>✏️ Escribir manualmente…</option>`;
  return html;
}

function buildRepetidorOptions(modelo) {
  let html = `<option value="">— Selecciona modelo —</option>`;
  MODELOS_REPETIDOR.forEach(m => html += `<option value="${m}" ${modelo===m?'selected':''}>${m}</option>`);
  html += `<option value="__manual__" ${modelo==='__manual__'?'selected':''}>✏️ Escribir manualmente…</option>`;
  return html;
}

function onAdicionalModeloChange(sel) {
  const block = sel.closest('.eq-block-adicional');
  if (!block) return;
  const man = block.querySelector('.input-mod-manual');
  if (!man) return;
  if (sel.value === '__manual__') { man.classList.remove('hidden'); man.focus(); }
  else man.classList.add('hidden');
}

function renderEqAdicional(tipo, uid, equipo, modelo) {
  const esDeco  = tipo === 'deco';
  const label   = esDeco ? '📺 DECO ACTIVADO' : '📡 REPETIDOR ACTIVADO';
  const clase   = esDeco ? 'adicional-deco' : 'adicional-rep';
  const color   = esDeco ? 'var(--accent)' : 'var(--accent2)';
  const phEq    = esDeco ? 'Ej. DECO HD / 4K' : 'Ej. Repetidor WiFi';
  const lblEq   = esDeco ? 'Deco Activado' : 'Repetidor Activado';

  // Resolve model value for the select
  const knownList = esDeco
    ? [...MODELOS_DECO.hfc, ...MODELOS_DECO.iptv]
    : MODELOS_REPETIDOR;
  const isManual  = modelo !== '' && !knownList.includes(modelo);
  const selVal    = isManual ? '__manual__' : modelo;
  const manVal    = isManual ? modelo : '';

  const optsHtml  = esDeco ? buildDecoOptions(selVal) : buildRepetidorOptions(selVal);

  const div = document.createElement('div');
  div.className = `eq-block-adicional ${clase}`;
  div.dataset.uid  = uid;
  div.dataset.tipo = tipo;
  div.innerHTML = `
    <div class="block-row">
      <span class="blk-label" style="color:${color}">${label}</span>
      <button type="button" class="btn-remove" onclick="quitarEqAdicional('${uid}')">✕ Quitar</button>
    </div>
    <div class="field-group inner">
      <label class="field-label">${lblEq}</label>
      <input type="text" class="input-eq" value="${equipo}" placeholder="${phEq}"/>
    </div>
    <div class="field-group inner">
      <label class="field-label">Modelo</label>
      <div class="sel-wrap">
        <select class="input-mod" onchange="onAdicionalModeloChange(this)">${optsHtml}</select>
        <span class="sel-arrow">▾</span>
      </div>
      <input type="text" class="input-mod-manual ${isManual ? '' : 'hidden'}"
             value="${manVal}" placeholder="Escribe el modelo…" style="margin-top:0.4rem"/>
    </div>`;

  const container = g('equiposAdicionales');
  if (tipo === 'deco') {
    // Si agregamos un deco, debe ordenarse después del último deco existente, antes de cualquier repetidor
    const decoBlocks = container.querySelectorAll('.eq-block-adicional[data-tipo="deco"]');
    if (decoBlocks.length > 0) {
      const lastDeco = decoBlocks[decoBlocks.length - 1];
      lastDeco.after(div);
    } else {
      if (container.firstChild) {
        container.insertBefore(div, container.firstChild);
      } else {
        container.appendChild(div);
      }
    }
  } else {
    // Repetidores siempre van al final
    container.appendChild(div);
  }
}

function quitarEqAdicional(uid) {
  const el = document.querySelector(`[data-uid="${uid}"]`);
  if (!el) return;
  const secIdx = seccionActiva;
  el.remove();
  if (secciones.length > 0 && secciones[secIdx]) {
    secciones[secIdx].equiposAdicionales = (secciones[secIdx].equiposAdicionales || []).filter(e => e.uid !== uid);
  }
  guardarFormActual();
  generarPlantilla();
}

// ════════════════════════════════
//  GENERAR PLANTILLA
// ════════════════════════════════
function generarPlantilla() {
  if (isLoadingSection) return;
  guardarFormActual();
  const s = secciones[seccionActiva];
  if (!s.tipoGestion) return;
  let texto;
  if (s.tipoGestion === 'cintillos_ftth')       texto = generarTextoCintillosFTTH(s);
  else if (s.tipoGestion === 'cintillos_hfc')   texto = generarTextoCintillosHFC(s);
  else if (esPext(s.tipoGestion))               texto = generarTextoDerivacionPext(s);
  else if (esEspecial(s.tipoGestion))           texto = generarTextoEspecial(s);
  else                                          texto = generarTextoEstandar(s);
  s.plantillaGenerada = texto;
  g('plantillaTexto').textContent = texto;
  hide('previewEmpty'); show('previewContent'); g('btnCopy').disabled=false;
  const prevBox = g('previewContent');
  if (prevBox) {
    prevBox.classList.remove('preview-pop-anim');
    void prevBox.offsetWidth;
    prevBox.classList.add('preview-pop-anim');
  }
  spawnHalloweenSparks(g('panelVistaPrevia'));
  renderSidebar();
}

function generarTextoEstandar(s) {
  const cfg = GESTIONES[s.tipoGestion]; const L=[];
  L.push(`MESA MULTISKILL HITSS – ${cfg.titulo}`);
  
  const ticketVal = (s.nTicket || '').trim();
  if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
    L.push(`N. TICKET: ${ticketVal}`);
  }

  // 1. EMTA o ONT primero (equipo principal)
  const eqName = (s.equipoActivado || '').trim();
  const eqMod  = (s.modeloEquipo || '').trim();
  if (cfg.mostrarEquipo && (eqName !== '' || eqMod !== '')) {
    L.push(`${cfg.labelEquipo}: ${eqName || '—'}`);
    L.push(`MODELO: ${eqMod || '—'}`);
  }

  // 2. Luego el deco o la cantidad de decos que haya
  const decos = (s.equiposAdicionales || []).filter(eq => eq.tipo === 'deco');
  decos.forEach(eq => {
    const eName = (eq.equipo || '').trim();
    const eMod  = (eq.modelo || '').trim();
    if (eName !== '' || eMod !== '') {
      L.push(`DECO ACTIVADO: ${eName || '—'}`);
      L.push(`MODELO: ${eMod || '—'}`);
    }
  });

  // 3. Por último el repetidor / repetidores
  const repName = (s.repetidorActivado || '').trim();
  const repMod  = (s.modeloRepetidor || '').trim();
  if (cfg.mostrarMesh && (repName !== '' || repMod !== '')) {
    L.push(`REPETIDOR ACTIVADO: ${repName || '—'}`);
    L.push(`MODELO: ${repMod || '—'}`);
  }

  const repetidores = (s.equiposAdicionales || []).filter(eq => eq.tipo === 'repetidor');
  repetidores.forEach(eq => {
    const eName = (eq.equipo || '').trim();
    const eMod  = (eq.modelo || '').trim();
    if (eName !== '' || eMod !== '') {
      L.push(`REPETIDOR ACTIVADO: ${eName || '—'}`);
      L.push(`MODELO: ${eMod || '—'}`);
    }
  });

  const estVal = (s.estado || '').trim();
  if (estVal !== '') {
    L.push(`${cfg.labelEstado}: ${estVal}`);
  }

  const obsVal = (s.observaciones || '').trim();
  if (obsVal !== '') {
    L.push(`OBSERVACIONES: ${obsVal}`);
  }

  L.push(`REALIZADO POR: ${s.realizadoPor?.trim() || 'ANGEL LLAMACPONCCA'}`);
  return L.join('\n');
}

function generarTextoEspecial(s) {
  const cfg = GESTIONES_ESPECIALES[s.tipoGestion];
  const vals= s.camposPersonalizados||{}; const L=[];

  // Plantilla personalizada para DERIVAR A CONMUTACION
  if (s.tipoGestion === 'derivar_conmutacion') {
    L.push('MESA MULTISKILL HITSS - DERIVAR A CONMUTACION');
    const ticketVal = (s.nTicket || '').trim();
    if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
      L.push(`N. TICKET: ${ticketVal}`);
    }

    const tipoServ = (vals.tipo_servicio || 'HFC').trim();
    L.push(`TIPO DE SERVICIO (FTTH o HFC): ${tipoServ}`);

    const tipoCli = (vals.tipo_cliente || 'MASIVOS').trim();
    L.push(`TIPO DE CLIENTE (Consumer/Business): ${tipoCli}`);

    const fechaAct = (vals.fecha_activacion || '').trim();
    L.push(`FECHA DE ACTIVACIÓN (DD/MM/AAAA): ${fechaAct || '-'}`);

    const plan = (vals.plan || 'CONTROL').trim();
    L.push(`PLAN: (CONTROL/ABIERTO): ${plan}`);

    L.push('SVA:');
    const cv = (vals.sva_central_virtual || 'SI').trim();
    L.push(`CENTRAL VIRTUAL: ${cv}`);
    const hunting = (vals.sva_hunting || '').trim();
    L.push(`CONFIGURACIÓN HUNTING: ${hunting}`);
    const desvio = (vals.sva_desvio || '').trim();
    L.push(`DESVÍO DE LLAMADAS: ${desvio}`);

    const origen = (vals.linea_origen || '').trim();
    L.push(`LINEA DE ORIGEN: ${origen || '-'}`);

    const dest1 = (vals.linea_destino_1 || '').trim();
    const dest2 = (vals.linea_destino_2 || '').trim();
    const destList = [dest1, dest2].filter(Boolean);
    L.push(`LINEA DE DESTINO: ${destList.length > 0 ? destList.join(' | ') : '-'}`);

    const opList = [];
    if (dest1) opList.push((vals.operador_destino_1 || 'CLARO').trim());
    if (dest2) opList.push((vals.operador_destino_2 || 'CLARO').trim());
    L.push(`OPERADOR DE LÍNEA DESTINO: ${opList.length > 0 ? opList.join(' | ') : '-'}`);

    const fhList = [];
    if (dest1) fhList.push((vals.fecha_hora_1 || '-').trim());
    if (dest2) fhList.push((vals.fecha_hora_2 || '-').trim());
    L.push(`FECHA Y HORA DE PRUEBA: ${fhList.length > 0 ? fhList.join(' | ') : '-'}`);

    const nombre = (vals.nombre_razon_social || '').trim();
    L.push(`NOMBRE / RAZÓN SOCIAL: ${nombre || '-'}`);

    const cusId = (vals.customer_id || '').trim();
    L.push(`CUSTOMERID / CÓDIGO SGA: ${cusId || '-'}`);

    const descProb = (vals.descripcion_problema || '').trim();
    L.push(`DESCRIPCIÓN DEL PROBLEMA: ${descProb || '-'}`);

    const loc = (vals.locucion || 'SIN TONO').trim();
    L.push(`LOCUCIÓN: ${loc}`);

    const caso = (vals.n_caso || 'No aplica').trim();
    L.push(`N.° CASO / N° INCIDENCIA: ${caso}`);

    L.push('DESCARTES REALIZADOS (SÍ / NO / N/A):');
    L.push(`Incognito: ${(vals.descarte_incognito || 'SI – CMTS – NCOS – OCSI – ESTADO FISICO: CONECTADO').trim()}`);
    L.push(`SGA/SIAC: ${(vals.descarte_sga || 'SI – ACTIVO').trim()}`);
    L.push(`Janus(solo cliente Masivo): ${(vals.descarte_janus || 'SI – ACTIVO').trim()}`);
    L.push(`Estado Portabilidad: ${(vals.descarte_porta || '-').trim()}`);
    L.push(`Otro (especificar): ${(vals.descarte_otro || '-').trim()}`);

    L.push(`REALIZADO POR: ${s.realizadoPor?.trim() || getStoredUserName()}`);
    return L.join('\n');
  }

  // Plantilla personalizada para RECHAZO GENERAL
  if (s.tipoGestion === 'rechazo_general' || s.tipoGestion === 'rechazo_tecnico') {
    L.push('MESA MULTISKILL HITSS – RECHAZO');
    const ticketVal = (s.nTicket || '').trim();
    if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
      L.push(`N. TICKET: ${ticketVal}`);
    }
    const mot = (vals.motivo || '').trim();
    L.push(`MOTIVO: ${mot || '—'}`);
    L.push(`ESTADO: ${(vals.estado || 'DENEGADO').trim()}`);
    L.push(`REALIZADO POR: ${s.realizadoPor?.trim() || getStoredUserName()}`);
    return L.join('\n');
  }

  // Plantilla personalizada para ACTIVACION PLUME
  if (s.tipoGestion === 'activacion_plume') {
    L.push('MESA MULTISKILL HITSS – ACTIVACION PLUME');
    const ticketVal = (s.nTicket || '').trim();
    if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
      L.push(`N. TICKET: ${ticketVal}`);
    }
    L.push(`MAC: ${vals.mac || ''}`);
    L.push(`SN: ${vals.sn || ''}`);
    L.push(`CORREO: ${vals.correo || ''}`);
    if ((vals.estado || '').trim()) {
      L.push(`ESTADO: ${vals.estado.trim()}`);
    }
    L.push(`REALIZADO POR: ${s.realizadoPor?.trim() || 'ANGEL LLAMACPONCCA'}`);
    return L.join('\n');
  }

  // Plantilla personalizada para CAMBIO DE EQUIPO
  if (s.tipoGestion === 'cambio_equipo') {
    L.push('MESA MULTISKILL HITSS - CAMBIO DE EQUIPO');
    const ticketVal = (s.nTicket || '').trim();
    if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
      L.push(`N. TICKET: ${ticketVal}`);
    }

    const retList = vals.equipos_retirar || (vals.equipo_retirar ? [{ equipo: vals.equipo_retirar, modelo: vals.modelo_ret || '' }] : []);
    if (retList.length === 0) retList.push({ equipo: '', modelo: '' });

    retList.forEach(item => {
      const eq = (item.equipo || '').trim();
      const mod = (item.modelo || '').trim();
      L.push(`EQUIPO A RETIRAR: ${eq || '—'}`);
      L.push(`MODELO A RETIRAR: ${mod || '—'}`);
    });

    const actList = vals.equipos_activar || (vals.equipo_activar ? [{ equipo: vals.equipo_activar, modelo: vals.modelo_act || '' }] : []);
    if (actList.length === 0) actList.push({ equipo: '', modelo: '' });

    actList.forEach(item => {
      const eq = (item.equipo || '').trim();
      const mod = (item.modelo || '').trim();
      L.push(`EQUIPO POR ACTIVAR: ${eq || '—'}`);
      L.push(`MODELO POR ACTIVAR: ${mod || '—'}`);
    });

    const mot = (vals.motivo_cambio || '').trim();
    L.push(`MOTIVO DEL CAMBIO: ${mot || '—'}`);

    const cod = (vals.cod_aut || '').trim();
    L.push(`CODIGO DE AUT.: ${cod || '—'}`);

    const est = (vals.estado || '').trim();
    L.push(`ESTADO: ${est || '—'}`);

    L.push(`REALIZADO POR: ${s.realizadoPor?.trim() || 'ANGEL LLAMACPONCCA'}`);
    return L.join('\n');
  }

  L.push(cfg.header);
  const ticketVal = (s.nTicket || '').trim();
  if (ticketVal !== '' && ticketVal !== '—' && ticketVal !== '-') {
    L.push(`N. TICKET: ${ticketVal}`);
  }

  cfg.campos.forEach(c => {
    if (c.grupo==='mantto_equipo') {
      const motUpper = (vals.motivo||'').toUpperCase();
      const esCambioEq = ['CAMBIO DE EQUIPO POR COMPATIBILIDAD','CAMBIO DE EQUIPO DAÑADO'].includes(vals.motivo||'') ||
                         motUpper.includes('EQUIPO');
      if (!esCambioEq) return;
    }
    if (c.type==='fixed')  L.push(`${c.label}: ${c.value}`);
    else                   L.push(`${c.label}: ${vals[c.key]||'—'}`);
  });
  L.push(`REALIZADO POR: ${s.realizadoPor||'ANGEL LLAMACPONCCA'}${cfg.realizadoPorSuffix||''}`);
  return L.join('\n');
}

// ════════════════════════════════
//  SIDEBAR
// ════════════════════════════════
function renderSidebar() {
  const list = g('sectionsList');
  if (!list) return;
  list.innerHTML = '';
  secciones.forEach((sec, idx) => {
    const isActive = idx === seccionActiva;
    const tipo = sec.tipoGestion;
    const tipoLabel = tipo ? (esEspecial(tipo) ? GESTIONES_ESPECIALES[tipo].titulo : (GESTIONES[tipo]?.titulo || tipo)) : 'SIN GESTIÓN';
    const isAtendida = sec.estado && sec.estado.toUpperCase().includes('ATENDIDA');
    const dotEmoji = isAtendida ? '🟢' : '🔴';
    const estadoText = (sec.estado && sec.estado.trim()) ? sec.estado.trim().toUpperCase() : 'SIN GESTIÓN';
    const hasPlant = !!sec.plantillaGenerada;
    const sotVal = (sec.numero !== undefined && sec.numero !== null && String(sec.numero).trim() !== '') ? sec.numero : '—';
    
    const item = document.createElement('div');
    item.className = `section-item sot-card-item${isActive ? ' active' : ''}`;
    item.style.setProperty('--i', idx);
    item.onclick = () => cambiarSeccion(idx);
    
    item.innerHTML = `
      <div class="sot-card-icon-wrap">
        <span class="sot-card-icon">🏷️</span>
      </div>
      <div class="sot-card-body">
        <div class="sot-card-top-row">
          <span class="sot-card-title">SOT: ${sotVal}</span>
          ${hasPlant ? '<span class="plantilla-dot" title="Plantilla generada">●</span>' : ''}
          <button type="button" class="sot-card-close" onclick="confirmarEliminar(${idx}, event)" title="Eliminar SOT">✕</button>
        </div>
        <div class="sot-card-status-row">
          <span class="sot-status-dot">${dotEmoji}</span>
          <span class="sot-status-text">${estadoText}</span>
        </div>
        <div class="sot-card-bottom-row">
          <span class="sot-sub-text">${tipoLabel}</span>
        </div>
      </div>
    `;
    list.appendChild(item);
  });

  // Mostrar/ocultar botón "Borrar todas las SOT" cuando se acumulan más de 1 SOT
  const btnClearAll = g('btnBorrarTodasSot');
  const btnClearTop = g('btnBorrarTodasTop');
  if (secciones.length > 1) {
    if (btnClearAll) {
      btnClearAll.textContent = `🗑️ Borrar todas (${secciones.length})`;
      btnClearAll.classList.remove('hidden');
    }
    if (btnClearTop) {
      btnClearTop.title = `Borrar todas las SOT (${secciones.length})`;
      btnClearTop.classList.remove('hidden');
    }
  } else {
    if (btnClearAll) btnClearAll.classList.add('hidden');
    if (btnClearTop) btnClearTop.classList.add('hidden');
  }
}

// ════════════════════════════════
//  ELIMINAR / LIMPIAR
// ════════════════════════════════
function confirmarEliminarSeccion() { confirmarEliminar(seccionActiva,null); }

function borrarTodasLasSot() {
  secciones = [crearSeccion()];
  seccionActiva = 0;
  sv('seccionNumero', '');
  limpiarSeccionActual();
  cargarSeccion(0);
  renderSidebar();
  guardarSeccionesStorage();
  if (typeof mostrarAvisoSerial === 'function') {
    mostrarAvisoSerial('🗑️ Se eliminaron todas las SOT acumuladas.');
  }
}

function confirmarEliminar(idx, event) {
  if (event) event.stopPropagation();
  guardarFormActual();
  if (secciones.length === 1) {
    limpiarSeccionActual();
    return;
  }
  secciones.splice(idx, 1);
  if (seccionActiva >= secciones.length) {
    seccionActiva = secciones.length - 1;
  } else if (idx < seccionActiva) {
    seccionActiva--;
  }
  renderSidebar();
  cargarSeccion(seccionActiva);
  guardarSeccionesStorage();
}

function limpiarSeccionActual() {
  const num = secciones[seccionActiva].numero;
  secciones[seccionActiva] = crearSeccion();
  secciones[seccionActiva].numero = num;
  sv('tipoGestion',''); sv('nTicket','');
  sv('realizadoPor', getStoredUserName()); sv('notasTexto','');
  sv('equipoActivado',''); sv('repetidorActivado',''); sv('modeloRepetidor','');
  sv('estado',''); sv('observaciones','');
  g('equiposAdicionales').innerHTML=''; g('customFormArea').innerHTML='';
  const modSel = g('modeloEquipo');
  if (modSel) modSel.innerHTML='<option value="">— Selecciona tecnología primero —</option>';
  const modMan = g('modeloManual'); if (modMan) { modMan.value=''; modMan.classList.add('hidden'); }
  resetTechBtns();
  aplicarVisibilidad(''); actualizarBadge('');
  show('previewEmpty'); hide('previewContent'); hide('copyFeedback');
  g('btnCopy').disabled=true; renderSidebar();
  guardarSeccionesStorage();
}

function actualizarNumero(val) {
  if (secciones.length === 0) return;
  secciones[seccionActiva].numero = (val || '').trim();
  renderSidebar();
  guardarSeccionesStorage();
}

// ════════════════════════════════
//  COPIAR PLANTILLA
// ════════════════════════════════
async function copiarPlantilla() {
  await copiarAlPortapapeles(g('plantillaTexto').textContent);
  flashFeedback('copyFeedback');
}

// ════════════════════════════════
//  CONVERTIDOR MAC
// ════════════════════════════════
function convertirMAC() {
  const inputEl = g('macInput');
  if (!inputEl) return;
  const rawVal = inputEl.value;

  // Aviso si se ingresa un carácter fuera de 0-9 y A-F
  if (/[^0-9A-Fa-f]/.test(rawVal)) {
    mostrarAvisoSerial('⚠️ Carácter inválido. Solo 0-9 y A-F');
  }

  const clean = rawVal.replace(/[^A-Fa-f0-9]/g, '').slice(0, 12).toUpperCase();
  if (inputEl.value !== clean) {
    inputEl.value = clean;
  }

  const len = clean.length;
  const counter = g('macCounter');
  const valEl = g('macValue');
  const btn = g('btnCopyMAC');

  if (counter) {
    counter.textContent = `${len} / 12`;
    counter.className = 'mac-counter' + (len === 12 ? ' ready' : len > 12 ? ' over' : '');
  }

  if (len < 12) {
    if (valEl) {
      valEl.textContent = len === 0 ? '—' : `Faltan ${12 - len} caracteres…`;
      valEl.className = 'mac-value' + (len > 0 ? ' error' : '');
    }
    if (btn) btn.disabled = true;
    return;
  }

  const mac = clean.match(/.{2}/g).join(':');
  if (valEl) {
    valEl.textContent = mac;
    valEl.className = 'mac-value valid';
  }
  if (btn) btn.disabled = false;
}

async function copiarMAC() {
  await copiarAlPortapapeles(g('macValue').textContent);
  flashFeedback('macFeedback');
}

// ════════════════════════════════
//  ACCESOS RÁPIDOS (Quick Links)
// ════════════════════════════════
async function quickCopy(btn, url) {
  await copiarAlPortapapeles(url);
  const fb = g('qlFeedback');
  if (fb) { fb.classList.remove('hidden'); setTimeout(() => fb.classList.add('hidden'), 2200); }
  const origTxt = btn.querySelector('.ql-num')?.textContent;
  btn.classList.add('ql-copied');
  setTimeout(() => btn.classList.remove('ql-copied'), 1600);
}

// ════════════════════════════════
//  MÓDULO DE SEÑAL
// ════════════════════════════════

/* Evaluador SNR (EMTA HFC) */
function evaluarEstabilidad() {
  const texto = gv('valoresSNR');
  const valores = texto.split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v));

  const resultado = g('resultadoSNR');
  if (!resultado) return;

  if (valores.length === 0) {
    resultado.innerHTML = '<span style="color:var(--danger); font-weight:700;">Ingresa valores válidos separados por comas</span>';
    return;
  }

  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const diferencia = max - min;
  const estable = diferencia < 4;

  if (estable) {
    resultado.innerHTML = `Diferencia: <strong>${diferencia.toFixed(2)} dB</strong> → Señal <span style="color:#15803d; font-weight:800;">ESTABLE</span>`;
  } else {
    resultado.innerHTML = `Diferencia: <strong>${diferencia.toFixed(2)} dB</strong> → Señal <span style="color:#b91c1c; font-weight:800;">INESTABLE</span>`;
  }
}

function limpiarSNR() {
  sv('valoresSNR', '');
  if (g('resultadoSNR')) g('resultadoSNR').innerHTML = '—';
}

/* Verificación de Nivel FTTH - ONT */
function verificarNivelFTTH() {
  const valStr = gv('rxValue').trim();
  const valor = parseFloat(valStr);
  const resultado = g('resultadoRX');
  const barra = g('barraRX');

  if (!resultado || !barra) return;

  if (isNaN(valor)) {
    resultado.innerHTML = '<span style="color:var(--danger); font-weight:700;">Ingresa un número válido</span>';
    barra.className = 'bar-indicator';
    return;
  }

  barra.className = 'bar-indicator';

  if (valor > -6) {
    resultado.innerHTML = `Nivel <strong>${valor} dBm</strong>: <span style="color:#b91c1c; font-weight:800;">NO ACEPTABLE</span>`;
    barra.classList.add('noaceptable');
  } else if (valor >= -8.9) {
    resultado.innerHTML = `Nivel <strong>${valor} dBm</strong>: <span style="color:#c2410c; font-weight:800;">ACEPTABLE</span>`;
    barra.classList.add('aceptable');
  } else if (valor >= -21.9) {
    resultado.innerHTML = `Nivel <strong>${valor} dBm</strong>: <span style="color:#15803d; font-weight:800;">ÓPTIMO</span>`;
    barra.classList.add('optimo');
  } else if (valor >= -24.9) {
    resultado.innerHTML = `Nivel <strong>${valor} dBm</strong>: <span style="color:#c2410c; font-weight:800;">ACEPTABLE</span>`;
    barra.classList.add('aceptable');
  } else if (valor >= -40) {
    resultado.innerHTML = `Nivel <strong>${valor} dBm</strong>: <span style="color:#b91c1c; font-weight:800;">NO ACEPTABLE</span>`;
    barra.classList.add('noaceptable');
  } else {
    resultado.innerHTML = '<span style="color:var(--text-muted);">Valor fuera de rango</span>';
  }
}

function limpiarRXFTTH() {
  sv('rxValue', '');
  if (g('resultadoRX')) g('resultadoRX').innerHTML = '—';
  if (g('barraRX')) g('barraRX').className = 'bar-indicator';
}

// ════════════════════════════════
//  HELPERS
// ════════════════════════════════
function g(id)     { return document.getElementById(id); }
function gv(id)    { const el=g(id); return el?el.value:''; }
function sv(id,v)  { const el=g(id); if(el) el.value=v||''; }
function show(id)  { g(id)?.classList.remove('hidden'); }
function hide(id)  { g(id)?.classList.add('hidden'); }

// Muestra un mensaje de feedback (ej. "Copiado") con una animación de entrada,
// y lo oculta solo automáticamente. Reinicia la animación si se llama varias veces seguidas.
function flashFeedback(elId, timeout = 1800) {
  const el = g(elId);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.remove('copy-flash');
  void el.offsetWidth; // fuerza reflow para poder repetir la animación CSS
  el.classList.add('copy-flash');
  clearTimeout(el._flashTimer);
  el._flashTimer = setTimeout(() => el.classList.add('hidden'), timeout);
}

async function copiarAlPortapapeles(texto) {
  try { await navigator.clipboard.writeText(texto); }
  catch { const ta=document.createElement('textarea'); ta.value=texto; ta.style.cssText='position:fixed;opacity:0;'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

// ════════════════════════════════
//  BLOC DE CUENTAS & CONTRASEÑAS (8 SLOTS)
// ════════════════════════════════
function initCuentas() {
  const container = g('cuentasList');
  if (!container) return;
  const saved = JSON.parse(localStorage.getItem('hitss_cuentas') || '[]');
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const data = saved[i] || { title: '', user: '', pass: '' };
    const div = document.createElement('div');
    div.className = 'cuenta-slot';
    div.innerHTML = `
      <div class="cs-num">#${i + 1}</div>
      <input type="text" class="cs-input cs-title" value="${data.title || ''}" placeholder="Título" data-idx="${i}" oninput="guardarCuentas()" />
      <input type="text" class="cs-input cs-user" value="${data.user || ''}" placeholder="Usuario" data-idx="${i}" oninput="guardarCuentas()" />
      <input type="password" class="cs-input cs-pass" value="${data.pass || ''}" placeholder="Contraseña" data-idx="${i}" oninput="guardarCuentas()" />
      <button type="button" class="cs-eye" onclick="togglePassVisibility(this)">👁</button>`;
    container.appendChild(div);
  }
}

function togglePassVisibility(btn) {
  const inp = btn.previousElementSibling;
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.classList.add('active');
  } else {
    inp.type = 'password';
    btn.classList.remove('active');
  }
}

function guardarCuentas() {
  const slots = [];
  document.querySelectorAll('#cuentasList .cuenta-slot').forEach(slot => {
    const title = slot.querySelector('.cs-title')?.value || '';
    const user  = slot.querySelector('.cs-user')?.value || '';
    const pass  = slot.querySelector('.cs-pass')?.value || '';
    slots.push({ title, user, pass });
  });
  localStorage.setItem('hitss_cuentas', JSON.stringify(slots));
}

function toggleCuentasPanel() {
  const el = g('cuentasDropdown');
  if (el) el.classList.toggle('hidden');
}

// ════════════════════════════════
//  GENERADOR DE CÓDIGOS DE AUTORIZACIÓN (A/B)
// ════════════════════════════════
let generatedCodesList = [];
let codeCounter = 0;

function initCodeGenerator() {
  const savedE = localStorage.getItem('hitss_euser') || '';
  const inputE = g('codeEUser');
  if (inputE && savedE) inputE.value = savedE;
}

function guardarCodeEUser() {
  const val = gv('codeEUser').trim().toUpperCase();
  localStorage.setItem('hitss_euser', val);
  updateHeaderProfileDisplay();
}

function dateNowFormatted() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${month}${year}`;
}

function generarCodigoAB() {
  const euser = gv('codeEUser').trim().toUpperCase();
  if (!euser || euser.length < 3) {
    showCodeFeedback('⚠️ Ingresa una Cuenta E válida (ej. E758975)', true);
    g('codeEUser')?.focus();
    return;
  }
  codeCounter++;
  const suffix = (codeCounter % 2 !== 0) ? 'A' : 'B';
  const newCode = `${codeCounter}${euser}${dateNowFormatted()}${suffix}`;
  generatedCodesList.push(newCode);

  g('codeOutput').value = generatedCodesList.join('\n');
  showCodeFeedback(`⚡ Código #${codeCounter} generado (${suffix})`);

  // Auto-copiar al portapapeles
  navigator.clipboard.writeText(newCode).catch(() => {});

  // Si la gestión activa es Código Autorización o Cambio de Equipo (NO en SOT DE MANTO), rellenar el campo de código
  const s = secciones[seccionActiva];
  if (s && (s.tipoGestion === 'codigo_autorizacion' || s.tipoGestion === 'cambio_equipo')) {
    const codInput = g('cesp_se_autoriza_cod') || g('cesp_cod_aut');
    if (codInput) {
      codInput.value = newCode;
      guardarCamposCustom(s);
    }
  }
}

function eliminarUltimoCodigo() {
  if (generatedCodesList.length === 0) {
    showCodeFeedback('No hay códigos para eliminar', true);
    return;
  }
  generatedCodesList.pop();
  codeCounter = generatedCodesList.length;
  g('codeOutput').value = generatedCodesList.join('\n');
  showCodeFeedback('Código eliminado');
}

function copiarCodigosGenerados() {
  const txt = gv('codeOutput');
  if (!txt) {
    showCodeFeedback('No hay códigos generados', true);
    return;
  }
  navigator.clipboard.writeText(txt).then(() => {
    showCodeFeedback('📋 Códigos copiados');
  }).catch(() => {});
}

function descargarCodigosTXT() {
  if (generatedCodesList.length === 0) {
    showCodeFeedback('No hay códigos para descargar', true);
    return;
  }
  const euser = gv('codeEUser').trim().toUpperCase() || 'EUSER';
  const blob = new Blob([generatedCodesList.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codigos_${euser}_${dateNowFormatted()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showCodeFeedback('📥 Descargando TXT...');
}

function showCodeFeedback(msg, isErr = false) {
  const fb = g('codeFeedback');
  if (!fb) return;
  fb.textContent = msg;
  fb.style.color = isErr ? 'var(--danger)' : '#22c55e';
  fb.classList.remove('hidden');
  clearTimeout(window.codeFbTimer);
  window.codeFbTimer = setTimeout(() => fb.classList.add('hidden'), 2500);
}

// ════════════════════════════════
//  LIMPIEZA AUTOMÁTICA DE SERIALES & DETECCIÓN DE REPETIDOR
// ════════════════════════════════
function autoLimpiarYDetectarSerial(el, isRepeater = false, targetModelSelectId = null) {
  if (isLoadingSection) return;
  let val = el.value;
  if (!val) return;

  // 1. Eliminar todos los espacios
  let sinEspacios = val.replace(/\s+/g, '');

  // 2. Reemplazar 'O' / 'o' por '0'
  let corregido = sinEspacios.replace(/[oO]/g, '0');

  // Si hubo cambio, actualizar input y mostrar aviso toast
  if (val !== corregido) {
    el.value = corregido;
    mostrarAvisoSerial('✨ Serie corregida (Sin espacios / O → 0)');
  }

  const upper = corregido.toUpperCase();

  // 3. DETECCIÓN EN ONT PRINCIPAL (FTTH)
  // Prefijo 48575443 -> opciones Huawei; prefijo 5A544547 -> 2 opciones ZTE; HFC intacto
  const isMainOntInput = (el.id === 'equipoActivado' || el.id === 'cesp_serie_ont');
  if (isMainOntInput) {
    const currentTech = getCurrentTech();
    const tipo = gv('tipoGestion');
    if (upper.startsWith('48575443')) {
      setTech('ftth', true);
      populateModelosSelect(tipo, 'ftth', 'huawei');
      sincronizarMarcaRepetidoresConOnt();
      mostrarAvisoSerial('✨ ONT HUAWEI: opciones Huawei desplegadas');
    } else if (upper.startsWith('5A544547')) {
      setTech('ftth', true);
      populateModelosSelect(tipo, 'ftth', 'zte');
      sincronizarMarcaRepetidoresConOnt();
      mostrarAvisoSerial('✨ ONT ZTE: 2 opciones ZTE desplegadas');
    } else {
      if (currentTech === 'ftth') {
        populateModelosSelect(tipo, 'ftth', null);
      }
      sincronizarMarcaRepetidoresConOnt();
    }
    return;
  }

  // 4. DETECCIÓN EN DECOS
  // Prefijo ZTE -> B866V2; prefijo GZ2 -> SEI800AMXPE / SEI800AMX; otras series libres
  const decoBlock = el.closest ? el.closest('.eq-block-adicional[data-tipo="deco"]') : null;
  if (decoBlock) {
    const sel = decoBlock.querySelector('.input-mod');
    const uid = decoBlock.dataset.uid;
    if (sel) {
      if (upper.startsWith('ZTE')) {
        sel.value = 'B866V2';
        if (typeof onAdicionalModeloChange === 'function') onAdicionalModeloChange(sel);
        if (secciones.length > 0 && secciones[seccionActiva]) {
          const item = (secciones[seccionActiva].equiposAdicionales || []).find(e => e.uid === uid);
          if (item) item.modelo = 'B866V2';
        }
        guardarFormActual();
        generarPlantilla();
        mostrarAvisoSerial('✨ Deco ZTE detectado (B866V2)');
      } else if (upper.startsWith('GZ2')) {
        const seiOpt = Array.from(sel.options).find(o => o.value.toUpperCase().startsWith('SEI800AMX'));
        const valToSet = seiOpt ? seiOpt.value : 'SEI800AMXPE';
        sel.value = valToSet;
        if (typeof onAdicionalModeloChange === 'function') onAdicionalModeloChange(sel);
        if (secciones.length > 0 && secciones[seccionActiva]) {
          const item = (secciones[seccionActiva].equiposAdicionales || []).find(e => e.uid === uid);
          if (item) item.modelo = valToSet;
        }
        guardarFormActual();
        generarPlantilla();
        mostrarAvisoSerial('✨ Deco detectado (' + (seiOpt ? seiOpt.value : 'SEI800AMX') + ')');
      }
    }
    return;
  }

  // 5. DETECCIÓN EN REPETIDORES
  // Prefijo 48575443 -> Huawei; prefijo ZTE -> ZTE
  if (isRepeater) {
    let sel = targetModelSelectId ? g(targetModelSelectId) : null;
    let uid = null;
    if (!sel && el.closest) {
      const block = el.closest('.eq-block-adicional');
      if (block && block.dataset.tipo === 'repetidor') {
        sel = block.querySelector('.input-mod');
        uid = block.dataset.uid;
      }
    }

    if (sel) {
      if (upper.startsWith('48575443')) {
        sel.value = 'ROUTER K562E-10 50087708 HUAWEI';
        if (typeof onModeloRepetidorChange === 'function') onModeloRepetidorChange();
        if (typeof onAdicionalModeloChange === 'function') onAdicionalModeloChange(sel);
        if (uid && secciones.length > 0 && secciones[seccionActiva]) {
          const item = (secciones[seccionActiva].equiposAdicionales || []).find(e => e.uid === uid);
          if (item) item.modelo = 'ROUTER K562E-10 50087708 HUAWEI';
        }
        guardarFormActual();
        generarPlantilla();
        mostrarAvisoSerial('✨ Repetidor HUAWEI seleccionado automáticamente');
      } else if (upper.startsWith('ZTE')) {
        sel.value = 'REPETIDOR ZXHN H3601P 180000528400 ZTE';
        if (typeof onModeloRepetidorChange === 'function') onModeloRepetidorChange();
        if (typeof onAdicionalModeloChange === 'function') onAdicionalModeloChange(sel);
        if (uid && secciones.length > 0 && secciones[seccionActiva]) {
          const item = (secciones[seccionActiva].equiposAdicionales || []).find(e => e.uid === uid);
          if (item) item.modelo = 'REPETIDOR ZXHN H3601P 180000528400 ZTE';
        }
        guardarFormActual();
        generarPlantilla();
        mostrarAvisoSerial('✨ Repetidor ZTE seleccionado automáticamente');
      }
    }
    return;
  }
}

function mostrarAvisoSerial(msg) {
  let toast = g('serialToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'serialToast';
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 1000;
      background: #7e22ce; color: #ffffff; padding: 0.45rem 0.85rem;
      border-radius: 8px; font-size: 0.75rem; font-weight: 800;
      box-shadow: 0 4px 14px rgba(126, 34, 206, 0.4);
      animation: fadeUp 0.2s ease; transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.classList.remove('hidden');
  clearTimeout(window.serialToastTimer);
  window.serialToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2000);
}

function isEquipmentInput(el) {
  if (!el || el.tagName !== 'INPUT' || el.type !== 'text') return false;

  const id = el.id || '';
  const cls = el.className || '';

  // 1. REGLA ESTRICTA: SI ES UN CAMPO DE MODELO, NUNCA ES UN SERIAL.
  // Debe permitir espacios, número '0', letras 'o'/'O' y cualquier carácter sin alteración.
  if (
    id.toLowerCase().includes('modelo') ||
    id.toLowerCase().includes('model') ||
    id.endsWith('_manual') ||
    cls.includes('input-mod')
  ) {
    return false;
  }

  // 2. Excluir explícitamente nombres, correos, notas, tickets y campos generales
  if (['profNombre', 'profUserE', 'realizadoPor', 'codeEUser', 'seccionNumero', 'search', 'notasTexto', 'observaciones', 'nTicket'].includes(id)) {
    return false;
  }
  if (id.includes('tecnico') || id.includes('nombres') || id.includes('direccion') || id.includes('contacto') || id.includes('correo') || id.includes('plano') || id.includes('coord') || id.includes('motivo') || id.includes('estado') || id.includes('contrata')) {
    return false;
  }

  // 3. Incluir ÚNICAMENTE los inputs donde se ingresan números de serie o MACs
  if (
    id === 'equipoActivado' ||
    id === 'repetidorActivado' ||
    id === 'cesp_equipo_retirar' ||
    id === 'cesp_equipo_activar' ||
    id === 'cesp_serie_ont' ||
    id === 'cesp_mac_cm' ||
    id === 'cesp_mac' ||
    id === 'cesp_sn' ||
    id === 'cesp_serie_repetidor' ||
    cls.includes('input-eq') ||
    cls.includes('mac-input')
  ) {
    return true;
  }

  return false;
}

// Listener global para capturar entrada o pegado ÚNICAMENTE en inputs de equipos/seriales
document.addEventListener('input', function (e) {
  const el = e.target;
  if (!isEquipmentInput(el)) return;

  const isRepeater = (
    el.id === 'repetidorActivado' ||
    el.id === 'cesp_serie_repetidor' ||
    (el.closest && el.closest('.eq-block-adicional')?.dataset.tipo === 'repetidor')
  );

  let modelSelId = null;
  if (el.id === 'repetidorActivado') modelSelId = 'modeloRepetidor';

  autoLimpiarYDetectarSerial(el, isRepeater, modelSelId);
});

// ════════════════════════════════
//  SMART BLOC DE NOTAS (Pegado limpio por líneas y copia sin espacios)
// ════════════════════════════════
function setupNotesSmartPaste() {
  const ta = g('notasTexto');
  if (!ta) return;

  // Pegado Inteligente: Separa por líneas, elimina espacios bordes y salta de línea automáticamente
  ta.addEventListener('paste', function (e) {
    e.preventDefault();
    const rawPasted = (e.clipboardData || window.clipboardData).getData('text');
    if (!rawPasted) return;

    // Procesar líneas: recortar espacios iniciales/finales de cada línea
    const cleanedLines = rawPasted
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (cleanedLines.length === 0) return;

    const formattedText = cleanedLines.join('\n');

    // Insertar en la posición actual del cursor
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const currentVal = ta.value;

    let prefix = currentVal.substring(0, start);
    let suffix = currentVal.substring(end);

    // Si hay texto antes y no termina en salto de línea, agregar salto
    if (prefix.length > 0 && !prefix.endsWith('\n')) {
      prefix += '\n';
    }

    // Unir texto con salto final para el siguiente pegado
    ta.value = prefix + formattedText + '\n' + suffix;

    // Colocar cursor al final del texto pegado
    const newCursorPos = (prefix + formattedText + '\n').length;
    ta.selectionStart = ta.selectionEnd = newCursorPos;

    // Guardar en la sección activa
    if (secciones.length > 0) {
      secciones[seccionActiva].notas = ta.value;
    }

    mostrarAvisoSerial('📋 Pegado en Bloc de Notas (1 por línea, sin espacios)');
  });

  // Copiado Limpio (Ctrl+C): Elimina automáticamente cualquier espacio alrededor del texto seleccionado
  ta.addEventListener('copy', function (e) {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = ta.value.substring(start, end);
    if (selectedText) {
      e.preventDefault();
      const cleaned = selectedText.trim();
      if (e.clipboardData || window.clipboardData) {
        (e.clipboardData || window.clipboardData).setData('text/plain', cleaned);
      } else {
        navigator.clipboard.writeText(cleaned).catch(() => {});
      }
      mostrarAvisoSerial('📋 Copiado limpio del Bloc de Notas (Sin espacios)');
    }
  });

  // Doble clic rápido: Selecciona y copia automáticamente el número/texto limpio
  ta.addEventListener('dblclick', function () {
    setTimeout(() => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selectedText = ta.value.substring(start, end).trim();
      if (selectedText) {
        navigator.clipboard.writeText(selectedText).then(() => {
          mostrarAvisoSerial(`📋 Copiado limpio: "${selectedText}"`);
        }).catch(() => {});
      }
    }, 10);
  });
}

// ════════════════════════════════
//  REORDENAMIENTO DE PANELES (COLUMNA 2)
// ════════════════════════════════
const PANEL_STORAGE_KEY = 'hitss_center_panel_order';

function moverPanel(panelId, direccion) {
  const container = g('centerColHerramientas');
  const panel = g(panelId);
  if (!container || !panel) return;

  if (direccion === 'arriba') {
    const prev = panel.previousElementSibling;
    if (prev && prev.classList.contains('reorderable-panel')) {
      container.insertBefore(panel, prev);
      animarPanelReordenado(panel);
      guardarOrdenPaneles();
    }
  } else if (direccion === 'abajo') {
    const next = panel.nextElementSibling;
    if (next && next.classList.contains('reorderable-panel')) {
      container.insertBefore(next, panel);
      animarPanelReordenado(panel);
      guardarOrdenPaneles();
    }
  }
}

function animarPanelReordenado(panel) {
  panel.classList.remove('panel-reordered-anim');
  void panel.offsetWidth; // Forzar reflow para reiniciar animación
  panel.classList.add('panel-reordered-anim');
  setTimeout(() => panel.classList.remove('panel-reordered-anim'), 400);
}

function guardarOrdenPaneles() {
  const container = g('centerColHerramientas');
  if (!container) return;
  const panels = Array.from(container.children).filter(el => el.classList.contains('reorderable-panel'));
  const ids = panels.map(p => p.id);
  localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(ids));
}

function restaurarOrdenPaneles() {
  const container = g('centerColHerramientas');
  if (!container) return;
  try {
    const raw = localStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    if (Array.isArray(ids) && ids.length > 0) {
      ids.forEach(id => {
        const panel = g(id);
        if (panel && panel.parentElement === container) {
          container.appendChild(panel);
        }
      });
    }
  } catch (e) {
    console.error('Error al restaurar orden de paneles:', e);
  }
}

function initPanelReordering() {
  const container = g('centerColHerramientas');
  if (!container) return;

  // Restaurar orden guardado
  restaurarOrdenPaneles();

  // Configurar Drag & Drop nativo
  let draggedPanel = null;

  container.querySelectorAll('.reorderable-panel').forEach(panel => {
    const handle = panel.querySelector('.panel-drag-handle');
    if (handle) {
      handle.setAttribute('draggable', 'true');
      handle.addEventListener('dragstart', (e) => {
        draggedPanel = panel;
        panel.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', panel.id);
      });

      handle.addEventListener('dragend', () => {
        if (draggedPanel) {
          draggedPanel.classList.remove('dragging');
          draggedPanel = null;
        }
        container.querySelectorAll('.reorderable-panel').forEach(p => p.classList.remove('drag-over'));
        guardarOrdenPaneles();
      });
    }

    panel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedPanel && draggedPanel !== panel) {
        panel.classList.add('drag-over');
      }
    });

    panel.addEventListener('dragleave', (e) => {
      if (!panel.contains(e.relatedTarget)) {
        panel.classList.remove('drag-over');
      }
    });

    panel.addEventListener('drop', (e) => {
      e.preventDefault();
      panel.classList.remove('drag-over');
      if (!draggedPanel || draggedPanel === panel) return;

      const rect = panel.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        container.insertBefore(draggedPanel, panel);
      } else {
        container.insertBefore(draggedPanel, panel.nextElementSibling);
      }
      animarPanelReordenado(draggedPanel);
      guardarOrdenPaneles();
    });
  });
}

