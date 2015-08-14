// ==UserScript==
// @name WME Corrector
// @author buchet37
// @description This script rectifying errors in names
// @namespace WazeRus
// @match     https://world.waze.com/editor/*
// @match     https://*.waze.com/editor/*
// @match     https://*.waze.com/*/editor/*
// @match     https://world.waze.com/map-editor/*
// @match     https://world.waze.com/beta_editor/*
// @match     https://www.waze.com/map-editor/*
// @grant     GM_xmlhttpRequest
// @include   https://editor-beta.waze.com/*
// @include   https://*.waze.com/editor/editor/*
// @include   https://*.waze.com/*/editor/*
// @version   0.1
// ==/UserScript==

var WME_CRT_version = "0.1";

function WME_Corrector_bootstrap() {
	console_log("Wait...");
	var bGreasemonkeyServiceDefined = false;
	try
	{
		if ("object" === typeof Components.interfaces.gmIGreasemonkeyService)
		{
			bGreasemonkeyServiceDefined = true;
		}
	}
	catch (err)
	{
		// Ждем
	}
	if ( "undefined" === typeof unsafeWindow  ||  ! bGreasemonkeyServiceDefined)
	{
		unsafeWindow    = ( function ()
		{
			var dummyElem   = document.createElement('p');
			dummyElem.setAttribute ('onclick', 'return window;');
			return dummyElem.onclick ();
		} ) ();
	}
	/* можно начать выполнение кода! */
	WME_Corrector_init();
} // WME_Corrector_bootstrap

function WME_Corrector_init() {
	console_log("Init...");
	function waitForCountryTop () {
   	var myWaze = unsafeWindow.Waze;
  	if (myWaze && myWaze.model && myWaze.model.countries && myWaze.model.countries.top && myWaze.model.countries.top.id) {
    	var myCountryName = myWaze.model.countries.objects[myWaze.model.countries.top.id].name;  
      switch(myWaze.model.countries.top.id) {
            case 186:	// Russia
                unsafeWindow.mainDictionnaryKey = '18qup6nGuy6f0n0Jw-nCHcrJmH70aPJzYtkyfaWzZaPE';
                unsafeWindow.publicDictionnarykey = '1CLMGOuANq-1-XI4TYMoQ-Aqx5rlDXFPkZdryZt8IhT4';
                break;
            default:
                alert ("WME Corrector\n\nНе найдены правила для страны " + myCountryName + " " + myWaze.model.countries.top.id);
                unsafeWindow.WME_CRT_onload = "Error";
                delete WME_CRT_1_mainDictionaryTxt;
                delete WME_CRT_1_publicDictionaryTxt;
                return;
        }

        GM_xmlhttpRequest({            
            method:  'GET',
            url: 	'https://docs.google.com/spreadsheets/d/' + unsafeWindow.mainDictionnaryKey +'/export?format=csv' ,      // безусловные правила
            headers: {"User-Agent": "Mozilla/5.0", 
                      "Accept": "text/plain"  },     
            synchronous: false,
            onload: function (mainDictionary) {
                unsafeWindow.WME_CRN_1_mainDictionaryTxt = mainDictionary.responseText;
            }
        });

        GM_xmlhttpRequest({
            method:  'GET',
            url: 'https://docs.google.com/spreadsheets/d/' + unsafeWindow.publicDictionnarykey +'/export?format=csv' ,      // опциональные правила
            headers: {"User-Agent": "Mozilla/5.0",
                      "Accept": "text/plain"  },
            synchronous: false,
            onload: function (publicDictionary) {
                unsafeWindow.WME_CRT_1_publicDictionaryTxt = publicDictionary.responseText;
            }
        });
        return myWaze.model.countries.top.id ;
    }
    else {
        setTimeout (function () {waitForCountryTop();}, 1000);
    }
	} // waitForCountryTop

  if ('undefined' == typeof WME_CRT_onload) {       
        unsafeWindow.WME_CRT_onload = "In Progress";
        unsafeWindow.WME_CRT_1_mainDictionaryTxt = "In Progress";
        unsafeWindow.WME_CRT_1_publicDictionaryTxt  = "In Progress";
        var mainDictionnaryURL = '' ;
        var publicDictionnaryURL = '' ;
        waitForCountryTop();
  };

} // WME_Corrector_init

// другие функции

// Лимит несохраненных правок еще не достигнут
function limitForSaveNotReached() { 
	return (Waze.model.actionManager.index < 99);
}

// Отладочные сообщения
function console_log(msg) {
	if (console) { console.log("WME_Corrector: " + msg);}
}

// вызываем загрузчик в конце скрипта
WME_Corrector_bootstrap();
