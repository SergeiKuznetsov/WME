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
	try {
		if ("object" === typeof Components.interfaces.gmIGreasemonkeyService) {
			bGreasemonkeyServiceDefined = true;
		}
	} catch (err) {
		// Ждем
	}
	if ("undefined" === typeof unsafeWindow || !bGreasemonkeyServiceDefined) {
		unsafeWindow = (function() {
			var dummyElem = document.createElement('p');
			dummyElem.setAttribute('onclick', 'return window;');
			return dummyElem.onclick();
		})();
	}
	/* можно начать выполнение кода! */
	WME_Corrector_init();
} // WME_Corrector_bootstrap

function WME_Corrector_init() {
	console_log("Init...");

	function loadingRules() {
		console_log("Loading rules...");
		var myWaze = unsafeWindow.Waze;
		if (myWaze && myWaze.model && myWaze.model.countries && myWaze.model.countries.top && myWaze.model.countries.top.id) {
			var myCountryName = myWaze.model.countries.objects[myWaze.model.countries.top.id].name;
			switch (myWaze.model.countries.top.id) {
				case 37: // Belarus
				case 186: // Russia
					unsafeWindow.unconditionalRulesKey = '18qup6nGuy6f0n0Jw-nCHcrJmH70aPJzYtkyfaWzZaPE';
					unsafeWindow.optionalRuleskey = '1CLMGOuANq-1-XI4TYMoQ-Aqx5rlDXFPkZdryZt8IhT4';
					break;
				default:
					alert("WME Corrector\n\nНе найдены правила для страны " + myCountryName + " " + myWaze.model.countries.top.id);
					unsafeWindow.WME_CRT_onload = "Error";
					delete WME_CRT_1_unconditionalRulesTxt;
					delete WME_CRT_1_optionalRulesTxt;
					return;
			}
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'https://docs.google.com/spreadsheets/d/' + unsafeWindow.unconditionalRulesKey + '/export?format=csv', // безусловные правила
				headers: {
					"User-Agent": "Mozilla/5.0",
					"Accept": "text/plain"
				},
				synchronous: false,
				onload: function(mainDictionary) {
					unsafeWindow.WME_CRN_1_unconditionalRulesTxt = unconditionalRules.responseText;
				}
			});
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'https://docs.google.com/spreadsheets/d/' + unsafeWindow.optionalRuleskey + '/export?format=csv', // опциональные правила
				headers: {
					"User-Agent": "Mozilla/5.0",
					"Accept": "text/plain"
				},
				synchronous: false,
				onload: function(publicDictionary) {
					unsafeWindow.WME_CRT_1_optionalRulesTxt = optionalRules.responseText;
				}
			});
			return myWaze.model.countries.top.id;
		} else {
			setTimeout(function() {
				loadingRules();
			}, 1000);
		}
	} // loadingRules

	if ('undefined' == typeof WME_CRT_onload) {
		unsafeWindow.WME_CRT_onload = "In Progress";
		unsafeWindow.WME_CRT_1_unconditionalRulesTxt = "In Progress";
		unsafeWindow.WME_CRT_1_optionalRulesTxt = "In Progress";
		var unconditionalRulesURL = '';
		var optionalRulesURL = '';
		loadingRules();
	};
	if ('undefined' == typeof __RTLM_PAGE_SCOPE_RUN__) {
		(function page_scope_runner() {
			// If we're _not_ already running in the page, grab the full source
			// of this script.
			var my_src = "(" + page_scope_runner.caller.toString() + ")();";

			// Create a script node holding this script, plus a marker that lets us
			// know we are running in the page scope (not the Greasemonkey sandbox).
			// Note that we are intentionally *not* scope-wrapping here.
			var script = document.createElement('script');
			script.setAttribute("type", "text/javascript");
			script.textContent = "var __RTLM_PAGE_SCOPE_RUN__ = true;\n" + my_src;

			// Insert the script node into the page, so it will run, and immediately
			// remove it to clean up.  Use setTimeout to force execution "outside" of
			// the user script scope completely.
			setTimeout(function() {
				document.body.appendChild(script);
				document.body.removeChild(script);
			}, 0);
		})()
	};

	// Stop running, because we know Greasemonkey actually runs us in
	// an anonymous wrapper.
	return;
} // WME_Corrector_init

// другие функции

// Лимит несохраненных правок еще не достигнут

function limitForSaveNotReached() {
	return (Waze.model.actionManager.index < 99);
}

// Отладочные сообщения

function console_log(msg) {
	if (console) {
		console.log("WME Corrector: " + msg);
	}
}

// вызываем загрузчик в конце скрипта test
WME_Corrector_bootstrap();
