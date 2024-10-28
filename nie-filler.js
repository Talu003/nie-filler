document.body.style.border = "15px solid green";

// NTFY Config
var ntfy_topic = "" // enter something unique here and use ntfy app to receive notifications when a cita was found

// Delay Config
var ACTION_DELAY_MS = 500;
var RETRY_DELAY_MIN = 0.3;
var RETRY_DELAY_SEC = 60 * RETRY_DELAY_MIN;
var TOO_MANY_REQUESTS_RESTART_DELAY_MIN = 5;
var TOO_MANY_REQUESTS_RESTART_DELAY_SEC = 60 * TOO_MANY_REQUESTS_RESTART_DELAY_MIN;

// Doctype options
var DOCTYPE = {
    NIE: 'rdbTipoDocNie',
    DNI: 'rdbTipoDocDni',
    PASSPORT: 'rdbTipoDocPas'
}

// User data
var APPLICANT =
{
    name: "Gianluca Fasolato ",
    city: "Barcelona",
    appointment_type: "POLICIA-CERTIFICADO DE REGISTRO DE CIUDADANO DE LA U.E.",
    docType: Pasaporte.NIE,
    docNumber: "YC6075760",
    phone: "3465120073",
    email: "fasolato49@gmail.com",
};


// Website constants
var PAGE_1_BASE_URL = "https://icp.administracionelectronica.gob.es/";
var PAGE_1_INDEX = "index.html";
var PAGE_1_BASE_URL_REDIRECT = "acOpcDirect";
var PAGE_2_CITAR = "citar";
var PAGE_3_VOLVER_INFO = "volverInfo";
var PAGE_3_AC_INFO = "acInfo";
var PAGE_4_ENTRADA = "acEntrada";
var PAGE_5_VALIDATE = "acValidarEntrada";
var PAGE_6_RESULT = "acCitar";
var PAGE_7_VER_FORMULARIO = "acVerFormulario";
var PAGE_8_OFERTA = "acOfertarCita";

var restart_url = PAGE_1_BASE_URL + "icpplus/" + PAGE_1_INDEX;

var RETRY_DELAY_SEC = 60 * RETRY_DELAY_MIN;


// Website navigation
if (window.location.href.startsWith(PAGE_1_BASE_URL)) {
    var body = document.body.innerText.toLowerCase();

    restartBrowser(6*60, text="Restart browser if still stuck in {0} seconds (to prevent getting stuck forever)...");
    if(body.indexOf("too many requests") != -1){
        restartBrowser(TOO_MANY_REQUESTS_RESTART_DELAY_SEC);
    }
    else if (body.indexOf("requested url was rejected") != -1) {
        restartBrowser();
    }
    else if (body.indexOf("no hay citas") != -1 && window.location.href.indexOf(PAGE_2_CITAR) == -1) {
        retry(RETRY_DELAY_SEC);
    }
    else if (window.location.href.indexOf(PAGE_1_INDEX) != -1 || window.location.href.indexOf(PAGE_1_BASE_URL_REDIRECT) != -1) {
        navigatePage1();

    } else if (window.location.href.indexOf(PAGE_2_CITAR) != -1) {
        navigatePage2();

    } else if (window.location.href.indexOf(PAGE_3_VOLVER_INFO) != -1 || window.location.href.indexOf(PAGE_3_AC_INFO) != -1) {
        navigatePage3();

    } else if (window.location.href.indexOf(PAGE_4_ENTRADA) != -1) {
        navigatePage4();

    } else if (window.location.href.indexOf(PAGE_5_VALIDATE) != -1) {
        navigatePage5();

    } else if (window.location.href.indexOf(PAGE_6_RESULT) != -1) {
        navigatePage6();

    } else if (window.location.href.indexOf(PAGE_7_VER_FORMULARIO) != -1) {
        navigatePage7();

    } else if (window.location.href.indexOf(PAGE_8_OFERTA) != -1) {
        ring_success();
    }
}

function request_rejected() {
    var infoElement = document.createElement("div");
    infoElement.innerHTML = "Try to close the browser and try again in a new instance.<br>If this does not work, just wait a little and then try again :)";
    infoElement.style.fontSize = "24";
    infoElement.style.fontWeight = "bold";
    document.body.prepend(infoElement);
    ring_rejected();
}

async function navigatePage1() {
    var form = getElement('form');
    form.selectedIndex = formIndexMatchingText(form, APPLICANT.city)
    await clickElement('btnAceptar');
}

async function navigatePage2() {
    function getForm() {
        var forms = document.getElementsByTagName("select");
        for (var i = 0; i < forms.length; i++) {
            var form = forms.item(i);
            console.log(form.previousElementSibling.textContent);
            console.log(form.previousElementSibling.textContent.indexOf("POLICÍA NACIONAL") != -1);
            if (form.previousElementSibling.textContent.indexOf("POLICÍA NACIONAL") != -1) {
                return form;
            }
        }
        return null;
    }
    var form = getForm();
    if (form === null) {
        form = getElement('tramiteGrupo[0]');
    }
    form.selectedIndex = formIndexMatchingText(form, APPLICANT.appointment_type)
    await clickElement('btnAceptar');
}


async function navigatePage3() {
    await clickElement('btnEntrar');
}


async function navigatePage4() {
    clickElement(APPLICANT.docType, delay = 150);
    await sleep(150);
    getElement('txtIdCitado').value = APPLICANT.docNumber;
    await sleep(150);
    getElement('txtDesCitado').value = APPLICANT.name;
    clickElement('btnEnviar');
}

function navigatePage5() {
    clickElement('btnEnviar', delay = 0);
}
function navigatePage6() {
    var form = getElement('idSede');
    if (form == null) {
        retry(RETRY_DELAY_SEC);
        return;
    }
    form.selectedIndex = form.options.length - 1;
    clickElement('btnSiguiente');
}

function navigatePage7() {
    getElement('txtTelefonoCitado').value = APPLICANT.phone;
    getElement('emailUNO').value = APPLICANT.email;
    getElement('emailDOS').value = APPLICANT.email;
    clickElement('btnSiguiente', delay = 0);
}

// Common Functions
async function countdown(duration, text="Restart in {0} seconds..."){
    var id = 'countdown';
    var countdownElement = document.createElement("div");
    countdownElement.id = id;
    countdownElement.style.width = "100%";
    countdownElement.style.height = "40px";
    countdownElement.style.margin = "0 auto";

    countdownElement.style.fontSize = "30px";
    countdownElement.style.fontWeight = "bold";
    countdownElement.style.alignContent = "center";
    countdownElement.style.alignSelf = "center";

    document.body.prepend(countdownElement);
    for (var i = duration; i > 0; i--) {
        console.log("Retry the process in " + i + " seconds...");
        countdownElement.innerHTML = text.replace("{0}", i);
        await sleep(1000);
    }
}
async function retry(delay, text="Restart in {0} seconds...") {
    await countdown(delay, text=text);
    window.open(restart_url, "_self");
}

async function clickElement(id, delay = ACTION_DELAY_MS) {
    await sleep(delay);
    getElement(id).click();
}
function getElement(id) {
    return document.getElementById(id);
}
function formIndexMatchingText(ele, text) {
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].childNodes[0].nodeValue === text) {
            return i;
        }
    }
    return undefined;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function restartBrowser(delay=null, text="Restart browser in {0} seconds..."){
    if(delay != null){
        await countdown(delay, text=text);
    }
    console.log("Restarting the browser.");
    browser.runtime.sendMessage({
        action: "restartBrowser",
        url: restart_url,
        incognito: true
    }).then(response => {
        console.log(response.status);
    }).catch(error => {
        console.error("Error restarting the browser:", error);
    });
}

function ring(sound) {
    console.log("Requesting the alarm to be set.");
    browser.runtime.sendMessage({
        action: "setAlarm",
        delayInSeconds: 2,
        soundfile: sound
    }).then(response => {
        console.log(response.status);  // Should log "Alarm set"
    }).catch(error => {
        console.error("Error setting alarm:", error);
    });
}

function ring_success() {
    ring("success.mp3");
    if(ntfy_topic.length > 0){
        fetch('http://ntfy.sh/'+ntfy_topic, {
            method: 'POST', // Specify the request method
            headers: {
                'Content-Type': 'application/text' // Specify the content type
            },
            body: "I might have found an appointment!\nCheck your Browser!"
        });
    }
}

function ring_rejected() {
    ring("rejected.mp3");
}
