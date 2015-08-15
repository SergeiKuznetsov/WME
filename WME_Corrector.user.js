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
					unsafeWindow.WME_CRT_1_unconditionalRulesTxt = unconditionalRules.responseText;
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

function CheckRoadName() {

	WME_CRT_Dictionary = []; // déclaration Hors "loadFiles" pour compatibilité Chrome
	WME_CRT_MainCountry = "";

	// *****************   COMPATIBILITY WITH NEW EDITOR     ***********
	var WazeActionCreateObject = require("Waze/Action/CreateObject");
	var WazeActionMultiAction = require("Waze/Action/MultiAction");
	var WazeActionUpdateObject = require("Waze/Action/UpdateObject");
	var WazeModelObjectType = require("Waze/Model/ObjectType");
	// *****************************************************************

	loadFiles();

	function loadFiles() { // Passage en variable locales
		if (WME_CRT_1_mainDictionaryTxt != "In Progress" && WME_CRT_1_publicDictionaryTxt != "In Progress") {
			traiteDictionary(WME_CRT_1_unconditionalRulesTxt, 1); // main directory line 1 +
			traiteDictionary(WME_CRT_1_publicDictionaryTxt, 1001); // public directory line 1001 +
			delete WME_CRT_1_mainDictionaryTxt;
			delete WME_CRT_1_publicDictionaryTxt; // supprime les variables d'import de fichiers
			WME_CRT_onload = "Done";
			WME_CRT_MainCountry = Waze.model.countries.top.id;
			insertButton();
		} else {
			setTimeout(function() {
				loadFiles();
			}, 1000);
		}
	}

	function traiteDictionary(texte, N_ligne) {
		var generic = texte.replace(/\t\t/g, "\t"); // supprime les doubles tabulation
		var lignes = generic.split(/\n|\r|\r\n/); // split
		for (var i = 0; i < lignes.length; i++) {
			//alert (lignes[i]);
			if (lignes[i].search('"') == 0) { // elimine les guillemets involontaires de l'import
				lignes[i] = lignes[i].replace(/^"/, '');
				lignes[i] = lignes[i].replace(/",/, ',');
			}
			//alert (lignes[i]+' ' +lignes[i].search('//'));
			if (lignes[i].search('/') != 0) {
				continue;
			} // si la ligne ne commence pas par / , on saute
			if (lignes[i].search('//') == 0) {
				continue;
			} // si la ligne commence par // , on saute

			var pos = lignes[i].search("//");
			if (pos != -1) {
				lignes[i] = lignes[i].substring(0, pos - 1);
			}
			lignes[i] = lignes[i].replace(/"""/g, '"'); // Traitement des guillemets suite au CSV
			lignes[i] = lignes[i].replace(/""/g, '"'); // Traitement des guillemets suite au CSV
			//lignes[i] = lignes[i].replace (/^"/g,'');
			var inter1 = lignes[i].split(/,/); // Split with comma Char
			if (inter1.length < 2) {
				continue;
			} // jump over if incorrect syntax
			if (inter1[0].substring(0, 1) != "/") {
				inter1[0] = "/" + inter1[0] + "/";
			} //transform simple texte in regexp
			inter1[1] = "(" + inter1[1].replace(/[ ]*$/g, "") + ")";
			var toverified = inter1[0].substring(1, inter1[0].lastIndexOf("/")); // extrait la partie entre / pour egexp
			var flag = inter1[0].substring(inter1[0].lastIndexOf("/") + 1); // extrait le flag
			var correct = inter1[1].replace(/@/g, ","); // replace à by comma
			if (correct == "()") {
				correct = '("")';
			} // interprete une chaine vide
			WME_CRN_Dictionary.push({
				line: i + N_ligne,
				toVerify: toverified.replace(/@/g, ","),
				flags: flag.replace(/"/g, ""),
				corrected: correct
			});
		}

		//alert (WME_CRN_Dictionary.length)
		return;
	}

	function insertButton() {

		if (document.getElementById('WME_CRT_All') == null) {
			var chk1 = $('<Label style="font-weight:normal;margin-right:10px"><input type="checkbox"; style="vertical-align: middle;margin: 0px;" id="WME_CRT_enable" title="Enable or Disable WME CRT">On-Off</input></Label>');
			var cnt1 = $('<section id="WME_CRT_link" style="padding-top:2px;;display: inline;"/>');
			cnt1.append(chk1);
			cnt1.append(" ");
			cnt1.append('<div style="font-size:12px;display: inline;"> <u><i><a href="https://greasyfork.org/scripts/3776-wme-check-road-name" target="_blank">Check Road Name ' + WME_CRT_version + ' </a> </i></u>');
			cnt1.append(" ");
			cnt1.append('<div id="WME_CRT_Dictionary" style="display: inline;"  > <u><i><a style= "float:right; font-size:12px;padding:0 7px 0 3px;border-width:1px;border-color: SkyBlue; border-style:solid;border-radius:6px;" href="https://docs.google.com/spreadsheets/d/' + optionalRuleskey + '/edit#gid=0" target="_blank" title="Go to dictionary"> ' + searchIdOTAN(WME_CRT_MainCountry) + ' </a> </i></u>');

			delete unconditionalRulesKey; // on supprime les variables globales du dictionnaire
			delete optionalRuleskey; // on n'en a plus besoin

			var btn1 = $('<button class="btn btn-default" style="padding:0px 10px; height:22px" id="WME_CRT_chk" title="Нажмите, чтобы проверить видимую область">Проверить</button>');
			btn1.click(rename_Road);
			var btn2 = $('<button class="btn btn-default" style="padding:0px 10px; margin:0px 5px; height:22px" id="WME_CRT_stop" title="Нажмите, чтобы остановить">Стоп</button>');
			btn2.click(stop_check);
			var chk2 = $('<Label style="font-weight:normal"><input type="checkbox"; style="vertical-align: middle;margin: 0px;" id="WME_CRT_CheckRoadName" title="Нажмите, чтобы включить автоматическую проверку"> Авто </input></Label>');
			var btn3 = $('<button class="btn btn-default" style="padding:0px 10px; margin-left:5px; height:22px" id="WME_CRT_raz" title="Нажмите, чтобы очистить список объектов">Очистка</button>');
			btn3.click(RAZ);
			var cnt2 = $('<section id="WME_CRT_rename" style="padding-top:2px"/>');
			cnt2.append(btn1);
			cnt2.append(btn2);
			cnt2.append(chk2);
			cnt2.append(btn3);
			var btn4 = $('<button class="btn btn-default" style="padding:0px 10px; height:22px" title="Click this button to change to alternate name">Change To Altern. Name</button>');
			btn4.click(ChAlternate);
			var btn5 = $('<button class="btn btn-default" style="padding:0px 10px; margin:0px 5px; height:22px" title="Click this button to IDS">Street ID</button>');
			btn5.click(ShowPrimaryStreetID);
			var cnt3 = $('<section id="WME_CRT_ChangeToAltern" style="padding-top:2px; display : none"/>');
			cnt3.append(btn4);
			cnt3.append(btn5);
			var WME_CRT_Menu = $('<div id="WME_CRT_All" style="height: auto;width:100%;"/>');
			WME_CRT_Menu.append(cnt1);
			WME_CRT_Menu.append(cnt2);
			WME_CRT_Menu.append(cnt3);

			// ******* Mise en place des buttons
			var WME_CRT_MenuFlag = false,
				myAlertBoxFlag = false,
				myDialogBoxFlag = false;

			function put_WME_CRT_Menu() { // wait for 'sidebar'
				if (document.getElementById('sidebar') != null) {
					if (document.getElementById('WME_JCB_All') != null) { // si mon menu existe
						$("#WME_JCB_All").append('<hr style="margin-bottom:5px; margin-top:5px;width=100%;color:SkyBlue; background-color:SkyBlue; height:1px;">');
					} // on ajoute une barre
					else {
						var WME_JCB_Menu = $('<div id="WME_JCB_All" style="padding:2px 2px 2px 5px;margin:5px 0px 30px 0px;width:295px; border-width:3px; border-style:double;border-color: SkyBlue; border-radius:10px"/>');
						$("#sidebar").append(WME_JCB_Menu); // sinon on le créé
					}
					$("#WME_JCB_All").append(WME_CRT_Menu); // on ajoute le menu CRT
					WME_CRT_MenuFlag = true;
				} else {
					setTimeout(function() {
						put_WME_CRT_Menu();
					}, 500);
				}
			}
			put_WME_CRT_Menu();

			// Boite d'alerte

			function put_myAlertBox() {
				if (document.getElementById('map-search') != null) {
					if (document.getElementById('WME_JCB_AlertBox') == null) {
						var myAlertBox = $('<div id="WME_JCB_AlertBox" class="form-control search-query" style="opacity : 0.8;display :none;  height: auto;min-height: 30px; position: absolute;top :16px; margin-left: 350px; margin-right: auto; "/>');
						var myAlertTxt = $('<div id="WME_JCB_AlertTxt" style=" opacity : 1;display:inline;padding:0px 0px">City ID/');
						myAlertBox.append(myAlertTxt);
						$("#map-search").append(myAlertBox);
					}
					myAlertBoxFlag = true;
				} else {
					setTimeout(function() {
						put_myAlertBox();
					}, 501);
				}
			}
			put_myAlertBox();

			function start_init_WME_CRT() { // si tous les boutons sont chargés on démarre le script
				if (WME_CRT_MenuFlag && myAlertBoxFlag) {
					init_WME_CRT();
				} else {
					setTimeout(function() {
						start_init_WME_CRT();
					}, 501);
				}
			}
			start_init_WME_CRT();
		}
		console_log("Check Road Name initialized");
	}

	var WME_CRT_badStreet = [];
	var WME_CRT_goodStreet = [];
	var WME_CRT_badAlternateStreet = [];
	var listSegIDs = [];
	var listLmrkIDs = [];

	function ChAlternate(ev) {
		var selection = Waze.selectionManager.selectedItems; // **** Validate selection *****
		for (var i = 0; i < selection.length; i++) {
			var sel = Waze.selectionManager.selectedItems[i].model;
			if (sel.type == "segment") {
				var streetID = sel.attributes.primaryStreetID;
				var street = Waze.model.streets.objects[streetID];
				var streetName = (street.name) ? street.name : "";
				var altStreetName = "";
				var cityID = street.cityID;
				var city = Waze.model.cities.objects[cityID];
				var cityName = city.name;
				if (/[(]/.test(cityName) && /[)]/.test(cityName)) { // c'est un lieudit
					altStreetName = cityName.replace(/([a-zéèêîïëôâàû '-]*)[ ][(].*/gi, "$1"); // extrait le lieudit
					cityName = cityName.replace(/[a-zéèêîïëôâàû '-]*[ ][(](.*)/gi, "$1"); // extrait la ville d'origine
					cityName = cityName.replace(/([a-zéèêîïëôâàû '-)]*)([ ][(][0-9][0-9][)])*[)]/gi, "$1"); // supprime le département s'il existe
				}
				if (altStreetName != "") { // c'est un lieudit
					altStreetName = (streetName == "") ? altStreetName : streetName + " - " + altStreetName; // on concatène avec l'ancien nom de rue s'il existe
				} else {
					altStreetName = streetName;
					cityName = (streetName == "") ? "" : cityName; // on efface la ville si la rue est vide
				}
				streetName = (streetName == "") ? altStreetName : streetName; // si la rue est vide, on recopie l'alternate street
				var newPrimaryID = SearchPrimaryID(streetID, "", streetName); // on met  ajour le nom principal
				Waze.model.actionManager.add(new WazeActionUpdateObject(sel, {
					primaryStreetID: newPrimaryID
				}));
				if (altStreetName && altStreetName != "") {
					var altPrimaryID = SearchPrimaryID(streetID, cityName, altStreetName); // opn met a jour l'alternate street
					addAlternativeStreet(sel, altPrimaryID);
				}
			}
		}
		return;
	}

	function ShowPrimaryStreetID(ev) {
		if (Waze.selectionManager.selectedItems.length == 1) {
			var sel = Waze.selectionManager.selectedItems[0].model; // .model pour compatibilité
			if ((sel.type == "segment") && (sel.attributes.primaryStreetID != null)) {
				var Street = sel.model.streets.get(sel.attributes.primaryStreetID);
				var City = sel.model.cities.get(Street.cityID);
				var states = sel.model.states.get(City.stateID);
				var country = sel.model.countries.get(City.countryID);
				var message = "streetID = " + sel.attributes.primaryStreetID + "\t\tStreet name = " + Street.name;
				message = message + "\ncityID = " + Street.cityID + "\t\t\tCity name = " + City.name;
				message = message + "\nStateID = " + City.stateID + "\t\tState name = " + states.name;
				message = message + "\nCountryID = " + City.countryID + "\t\t\tCountry name = " + country.name;
				alert(message);
			}
		} else {
			alert("Sélection incorrecte");
		}
	}

	function RAZ(ev) {
		WME_CRT_badStreet.length = 0;
		WME_CRT_goodStreet.length = 0;
		WME_CRT_badAlternateStreet.length = 0;
		document.getElementById('WME_CRT_raz').disabled = true; // on desactive le bouton RAZ puisque les tableaux sont vides
		return;
	}

	function stop_check(ev) {
		listSegIDs.length = 0;
		listLmrkIDs.length = 0;
		document.getElementById('WME_CRT_CheckRoadName').checked = 0;
		document.getElementById('WME_CRT_CheckRoadName').disabled = false;
		document.getElementById('WME_CRT_chk').disabled = false;
		return;
	}

	function rename_Road(ev) {
		var name, oldName, newName;
		var modif = false;
		var road, ldmk, street, city;
		var roadID, ldmkID, cityID, goodstreet;
		listLmrkIDs.length = 0;
		listSegIDs.length = 0;
		if (findPending().length == 0 && Waze.map.zoom > 1 && limitForSaveNotReach()) { // wait for loading

			var date = new Date();
			var myWazeSegments = [];
			myWazeSegments = Waze.model.segments.objects;
			var myWazeStreets = [];
			myWazeStreets = Waze.model.streets.objects;
			var myWazeCities = [];
			myWazeCities = Waze.model.cities.objects;
			if (Object.keys(myWazeSegments).length > 1000 && document.getElementById('WME_CRT_CheckRoadName').checked == 1) {
				document.getElementById('WME_CRT_CheckRoadName').checked = 0;
				myAlert("Too many segments (>1000)");
				myAlert("Auto Check has been disabled");
			}
			document.getElementById('WME_CRT_chk').disabled = true; // on désactive le bouton "check" durant le check
			document.getElementById('WME_CRT_CheckRoadName').disabled = true;
			for (roadID in myWazeSegments) {
				road = myWazeSegments[roadID];
				if (onScreen(road) && road.isAllowed(road.PERMISSIONS.EDIT_GEOMETRY)) { // la rue existe et "on a les droits";)

					//cleanAlternativeStreet (road);

					street = myWazeStreets[road.attributes.primaryStreetID];
					if (street && street.cityID != null) {
						city = myWazeCities[street.cityID];
						if (city && city.name != null && city.countryID == WME_CRT_MainCountry) {
							if (notInArray(road.attributes.primaryStreetID, WME_CRT_badStreet) && notInArray(road.attributes.primaryStreetID, WME_CRT_goodStreet)) { //  Le segment remplit toutes les conditions pour analyse ultérieure
								listSegIDs.push(roadID); // alimente la base des rues a tester
							}
						}
					}
				}
			}
			listSegIDs = delete_multi_Ids(listSegIDs);
			modif = checkRoadName(listSegIDs); // vérfication de noms en prodécure externe

			if (checkLayerState("landmarks")) {
				var myWazeVenues = [];
				myWazeVenues = Waze.model.venues.objects;
				for (ldmkID in myWazeVenues) {
					ldmk = myWazeVenues[ldmkID];
					if (ldmk != null && ldmk.state != "Delete" && onScreen(ldmk) && (ldmk.attributes.approved) && (ldmk.attributes.streetID != null) && ldmk.isAllowed(ldmk.PERMISSIONS.EDIT_GEOMETRY)) {
						street = myWazeStreets[ldmk.attributes.streetID];
						if (street && street.cityID != null) {
							city = myWazeCities[street.cityID];
							oldName = ldmk.attributes.name;
							if (city && city.name != null && city.countryID == WME_CRT_MainCountry && oldName && oldName != "" && notInArray(oldName, WME_CRT_badStreet) && notInArray(oldName, WME_CRT_goodStreet)) { //  Le segment remplit toutes les conditions pour analyse ultérieure
								listLmrkIDs.push(ldmkID); // alimente la bsase des rues a tester
							}
						}
					}
				}
				listLmrkIDs = delete_multi_Ids(listLmrkIDs);
				modif = checkLandmarkName(listLmrkIDs);
			}

			if (userIsFrenchCM()) {
				checkAlternateRoad(myWazeSegments);
			} // vérification des DXXX - Rue xxx hors ville pour les CMs
			if (!limitForSaveNotReach()) {
				myAlert("<FONT color='red'><b>Please save and retry</b></FONT>");
			}
		}
		setTimeout(function() {
			manage_CheckRoadName();
		}, 4001);
	}

	function userIsCM() {
		return (Waze.model.loginManager.user.editableCountryIDs &&
			Waze.model.loginManager.user.editableCountryIDs.length != 0 &&
			Waze.model.loginManager.user.editableCountryIDs[0] != ' ');
	}

	function userIsFrenchCM() {
		return (userIsCM() && isInArray(73, Waze.model.loginManager.user.editableCountryIDs));
	}

	function checkAlternateRoad(myWazeSegments) {
		for (var roadID in myWazeSegments) {
			var road = myWazeSegments[roadID];
			if (road.attributes.roadType != 4) { //it's not a ramp
				if (onScreen(road) && notInArray(road.attributes.primaryStreetID, WME_CRT_badAlternateStreet) && road.isAllowed(road.PERMISSIONS.EDIT_GEOMETRY) && limitForSaveNotReach()) { // la rue existe et "on a les droits";)
					var street = Waze.model.streets.objects[road.attributes.primaryStreetID];
					if (street && street.cityID != null) {
						var city = Waze.model.cities.objects[street.cityID];
						if (city && city.countryID == "73" && (city.name == null || city.isEmpty)) {
							createAlternateStreet(road, street.name);
						}
					}
				}
			}
		}
	}

	function createAlternateStreet(seg, name) {
		if (/^[A|D|N|M][0-9]+/.test(name) && /( - [a-zA-ZéÉ][a-zA-Zéèê'])/.test(name)) { // c'est une route nommée et il y a un mot de 2 lettres après le séparateur
			var match = /( - [a-zA-Z][a-zA-Z'])/.exec(name); // position de la coupure
			var name1 = name.substr(0, match.index);
			var name2 = name.substr(match.index + 3);
			var message = "Wrong Street Name Detected\n\n  City : None\n  Street name: " + name + "\n";
			if (seg.attributes.streetIDs) {
				var altName = seg.attributes.streetIDs;
				for (var i = 0; i < altName.length; i++) {
					if (i == 0) {
						message = message + "  Alternate names :\n";
					}
					street = Waze.model.streets.objects[altName[i]];
					message = message + "  " + street.name + "\n";
				}
			}
			message = message + "\n  New name : " + name1 + "\n  New alternate name : " + name2;
			Waze.selectionManager.select([seg]);
			if (confirm(message)) {
				var name1ID = SearchPrimaryID(seg.attributes.primaryStreetID, "", name1);
				if (name1ID != null) {
					Waze.model.actionManager.add(new WazeActionUpdateObject(seg, {
						primaryStreetID: name1ID
					}));
				}
				var name2ID = SearchPrimaryID(seg.attributes.primaryStreetID, "", name2);
				if (name2ID != null) {
					addAlternativeStreet(seg, name2ID);
				}
			} else {
				WME_CRT_badAlternateStreet.push(seg.attributes.primaryStreetID); // on stocke l'entrée rejectée;
			}
			Waze.selectionManager.select([]);
		}
	}

	function addAlternativeStreet(sel, newPrimaryID) {
		if (!sel) {
			return null;
		}
		if (sel.attributes.streetIDs) {
			var myAltName = sel.attributes.streetIDs;
		} else {
			var myAltName = [];
		}
		if (notInArray(newPrimaryID, myAltName)) {
			Waze.model.actionManager.add(new WazeActionUpdateObject(sel, {
				streetIDs: myAltName.concat([newPrimaryID])
			}));
		}
	}

	function cleanAlternativeStreet(sel) {
		if (sel && sel.attributes.streetIDs) {
			var newAltName = [];
			var altName = sel.attributes.streetIDs;
			for (var i = 0; i < altName.length; i++) {
				var street = Waze.model.streets.objects[altName[i]];
				if (!street && street.name && street.name != "") {
					newAltName.push(altName[i]);
				}
			}
			if (newAltName.length != altName.length) {
				Waze.model.actionManager.add(new WazeActionUpdateObject(sel, {
					streetIDs: newAltName
				}));
				myAlert("Segment :" + sel.getID() + " has incorrect alternate Street. it's now corrected");
			}
		}
	}

	function onScreen(obj) {
		if (obj.geometry) {
			return (Waze.map.getExtent().intersectsBounds(obj.geometry.getBounds()));
		}
		return false;
	}

	function checkLandmarkName(listLmrkIDs) {
		var modif = false;
		var street, city, state, ldmark;
		var oldName, newName, cityName, ldmarkID;
		if (Waze.model.venues.objects.length == 0) {
			myAlert("No landmark in memory");
		}
		for (var i = 0; i < listLmrkIDs.length; i++) {
			ldmark = Waze.model.venues.objects[listLmrkIDs[i]];

			if (ldmark != null && onScreen(ldmark)) {
				//oldName = ldmark.attributes.name;
				oldName = Waze.model.streets.objects[ldmark.attributes.streetID].name;
				if (oldName != null && oldName != "" && !isInArray(oldName, WME_CRT_badStreet)) {
					if (ldmark.attributes.residential) { // on efface le nom sur place résidentielle
						newName = "";
					} else {
						newName = rename2(oldName);
					}
					newName = newName.replace(/ *:[ -]*/g, " - "); // remplacement des ":"par "-" pour les landmark
					if (newName != oldName && limitForSaveNotReach()) {
						Waze.selectionManager.select([ldmark]);
						street = Waze.model.streets.objects[ldmark.attributes.streetID];
						city = Waze.model.cities.objects[street.cityID];
						state = Waze.model.states.objects[city.stateID];
						if (typeof(city) === 'undefined' || city == null) {
							cityName = "";
						} else {
							cityName = city.name;
						}

						var I18n_locale = I18n.translations[I18n.locale];
						// I18n.translations.ru.livemap.route.instructions.op.start
						var message = I18n_locale.venues.update_requests.panel.flag_title.VENUE + "\n"; // Замечание к POI
						for (var j = 0; j < ldmark.attributes.categories.length; j++) {
							message = message + I18n_locale.venues.categories[ldmark.attributes.categories[j]] + "\n"; // Перечислим все категории
						}
						message = message + "\n" + I18n_locale.edit.landmark.fields.name + ": " + ldmark.attributes.name;
						message = message + "\n" + I18n_locale.edit.address.state + ": " + state.name;
						message = message + "\n" + I18n_locale.edit.address.city + ": " + cityName;
						message = message + "\n" + I18n_locale.edit.address.street + ": " + street.name;
						//message = message + "\nOld name is : " + oldName ;
						//message = message + "\n\n"+ I18n_locale.edit.address.street ;
						//edit.landmark.fields.name

						newName = prompt(message, newName);
						if (newName == null) {
							WME_CRT_badStreet.push(ldmark.attributes.name);
							document.getElementById('WME_CRT_raz').disabled = false;
						} else if (newName != oldName) {
							Waze.model.actionManager.add(new WazeActionUpdateObject(ldmark, {
								street: newName
							}));
							modif = true;
						}
						Waze.selectionManager.select([]);
					}
				}
			}
		}
		return modif;
	}

	function checkRoadName(listSegIDs) {
		var modif = false;
		while (listSegIDs.length > 0) {
			var sel = Waze.model.segments.objects[listSegIDs[0]];
			if (notInArray(sel.attributes.primaryStreetID, WME_CRT_goodStreet)) {
				var idemRoadIDs = [];
				for (var i = 0, len_i = listSegIDs.length; i < len_i; i++) { // поиск идентичных PrimaryStreetID (совпадает имя дороги)
					var sel1 = Waze.model.segments.objects[listSegIDs[i]];
					if (sel1.attributes.primaryStreetID == sel.attributes.primaryStreetID) {
						idemRoadIDs.push(listSegIDs[i]);
					}
				}
				var street = Waze.model.streets.objects[sel.attributes.primaryStreetID];
				var name = street.name;
				if (name != null) {
					var newName = rename2(name);
					if (newName != name && limitForSaveNotReach()) {
						selectSegments(idemRoadIDs); // on selectionne les segments a modifier
						var city = Waze.model.cities.objects[street.cityID];
						var state = Waze.model.states.objects[city.stateID];
						newName = prompt(idemRoadIDs.length + " segment(s) to rename : \n" + idemRoadIDs + "\n\nCity :" + city.name + "\nDépartement :" + state.name + "\nOld name is : " + name + "\n\nConfirm the new name or change it", newName);
						if (newName == null) {
							WME_CRT_badStreet.push(sel.attributes.primaryStreetID);
							document.getElementById('WME_CRT_raz').disabled = false;
						} else if (newName != name) {
							var newPrimaryID = SearchPrimaryID(sel.attributes.primaryStreetID, city.name, newName);
							if (newPrimaryID != null) {
								var action = [];
								for (var k = 0; k < Waze.selectionManager.selectedItems.length; k++) {
									action.push(new WazeActionUpdateObject(Waze.selectionManager.selectedItems[k].model, {
										primaryStreetID: newPrimaryID
									}));
								}
								Waze.model.actionManager.add(new WazeActionMultiAction(action));
								modif = true;
							}
						}
						selectSegments([]); // снять отметку
					}
				} else {
					WME_CRT_goodStreet.push(sel.attributes.primaryStreetID);
					WME_CRT_goodStreet = delete_multi_Ids(WME_CRT_goodStreet);
				}
				listSegIDs = soustraitArray(listSegIDs, idemRoadIDs);
			}
		}
		return modif;
	}

	function rename2(new_name) {
		new_name = genericCorrection(new_name);
		var list = WME_CRT_Dictionary;
		name = new_name;
		for (var i = 0; i < list.length; i++) {
			//console_log("Test de la ligne " + list[i].line +" "+  list[i].toVerify +" "+ list[i].flags +" "+ eval(list[i].corrected ));								// trace modification
			try { // Capture des erreurs de regexp
				var regexp = new RegExp(list[i].toVerify, list[i].flags);
				var name = new_name.replace(regexp, eval(list[i].corrected));
			} catch (e) { // Ca traite les erreurs
				var message = (list[i].line > 1000) ? (list[i].line - 1000) + " in public " : list[i].line + " in main ";
				message = e + "\nLine " + message + " dictionary has an error";
				message = message + "\n\nThis line is desactivated\n\nPlease correct it";
				alert(message);
				list.splice(i, 1); // delete incorrect line in array
			}
			if (new_name != name) {
				//console_log("WME_CRT line " + list[i].line + ' OldName="'+new_name+'" ==> New_Name="'+name+'"');								// trace modification
				new_name = name;
			}
		}

		new_name = genericCorrection(new_name);
		return new_name;
	}

	function genericCorrection(name) {
		name = name.replace(/ +/g, " "); // delete double spaces
		name = name.replace(/^[ ]*/g, ""); // delete "Space" at the beginninng of the name
		name = name.replace(/[ ]*$/g, ""); // delete "Space" at the end of the name
		return name;
	}

	function SearchCityID(country_ID, state_ID, cityName) {
		var emptyct = (cityName === "");
		var fattr = {
			countryID: country_ID,
			stateID: state_ID,
			isEmpty: emptyct,
			name: cityName
		};
		var city = Waze.model.cities.getByAttributes(fattr);
		if (city.length === 0) {
			myAlert("Create new city: " + cityName);
			var f = new WazeActionCreateObject(WazeModelObjectType.CITY, {
				countryID: country_ID,
				stateID: state_ID,
				isEmpty: emptyct,
				name: cityName
			});
			Waze.model.actionManager.add(f);
			return f.newObject.getID();
		}
		if (city.length === 1) {
			return city[0].getID();
		}
		if (city.length > 1) {
			myAlert("Problems with cityID : " + city.length + " cities with same name. Please save and redo");
			return null;
		}
		return null;
	}

	function SearchPrimaryID(oldStreetID, newCityName, newStreetName) {

		var oldStreet = Waze.model.streets.objects[oldStreetID];
		var oldCity = Waze.model.cities.objects[oldStreet.cityID];
		var newCityID = SearchCityID(oldCity.countryID, oldCity.stateID, newCityName);
		if (newCityID == null) {
			return null;
		}

		if (newStreetName == null) {
			newStreetName = "";
		}
		var emptyst = (newStreetName == "");
		var fattr = {
			cityID: newCityID,
			isEmpty: emptyst
		};
		if (emptyst == false) {
			fattr.name = newStreetName;
		}
		var st = Waze.model.streets.getByAttributes(fattr);
		if (st.length === 0) {
			myAlert("Create new street: " + newCityName + "  " + newStreetName);
			var a = new WazeActionCreateObject(WazeModelObjectType.STREET, {
				name: newStreetName,
				isEmpty: emptyst,
				cityID: newCityID
			});
			Waze.model.actionManager.add(a);
			var myNewPrimaryStreetID = a.newObject.getID();
		}
		if (st.length === 1) {
			var myNewPrimaryStreetID = st[0].getID();
		}
		if (st.length > 1) {
			myAlert("Problems with StreetID : " + st.length + " streets with same name. Please save and redo");
			return null;
		}
		return myNewPrimaryStreetID;
	}

	function checkLayerState(layerName) {
		var index = findLayerIndex(layerName);
		if (index != null) {
			return Waze.map.controls[0].map.layers[index].visibility;
		}
		return false;
	}

	function activateLayer(layerName, flag) {
		if (flag == true || flag == false) {
			var index = findLayerIndex(layerName);
			if (index != null) {
				var layerID = Waze.map.controls[0].map.layers[index].id;
				Waze.map.controls[0].map.getLayer(layerID).setVisibility(flag); //affiche le Layer "landmark"  "Waze.Layer.FeatureLayer_60"
			}
		}
	}

	function findLayerIndex(layerName) {
		var index;
		switch (layerName.toUpperCase()) {
			case "AERIALS":
				index = 0;
				break;
			case "CITIES":
				index = 1;
				break;
			case "NEW CITIES":
				index = 2;
				break;
			case "ROADS":
				index = 3;
				break;
			case "OLD ROADS":
				index = 4;
				break;
			case "GPS POINTS":
				index = 5;
				break;
			case "NEW GPS POINTS":
				index = 6;
				break;
			case "AREA MANAGERS":
				index = 8;
				break;
			case "LANDMARKS":
				index = 9;
				break;
			case "PLACES UPDATE":
				index = 10;
				break;
			case "BIG JUNCTIONS":
				index = 11;
				break;
			case "SPEED CAMERAS":
				index = 14;
				break;
			case "MAP PROBLEMS":
				index = 16;
				break;
			case "UPDATE REQUESTS":
				index = 17;
				break;
			case "EDITABLE AREAS":
				index = 18;
				break;
			case "CLOSURES":
				index = 20;
				break;
			case "LIVE USERS":
				index = 30;
				break;
		}
		return index;
	}

	function delete_multi_Ids(myArray) {
		var myNewArray = [];
		if (myArray.length > 0) {
			myNewArray[0] = myArray[0];
			for (var i = 0, len = myArray.length; i < len; i++) {
				if (notInArray(myArray[i], myNewArray)) {
					myNewArray.push(myArray[i]);
				}
			}
		}
		return myNewArray;
	}

	function soustraitArray(array1, array2) {
		var newArray = [];
		for (var i = 0, len = array1.length; i < len; i++) {
			if (notInArray(array1[i], array2)) {
				newArray.push(array1[i]);
			}
		}
		return newArray;
	}

	function isInArray(item, array) {
		return array.indexOf(item) !== -1;
	}

	function notInArray(item, array) {
		return array.indexOf(item) === -1;
	}

	function findPending() {
		return Waze.map.controls[5].pending;
	}

	function selectSegments(Select_IDs) {
		Select_IDs = delete_multi_Ids(Select_IDs); // suppression des doublons
		var foundSegs = [];
		for (var i = 0; i < Select_IDs.length; i++) {
			foundSegs.push(Waze.model.segments.objects[Select_IDs[i]]); // créer la selection
		}
		Waze.selectionManager.select(foundSegs);
	}

	function manage_WME_CRT(ev) {
		localStorage.WME_CRT_enable = document.getElementById('WME_CRT_enable').checked == 1;
		if (document.getElementById('WME_CRT_enable').checked == 1) {
			document.getElementById('WME_CRT_rename').style.display = "block";
			document.getElementById('WME_CRT_Dictionary').style.display = "inline";
			if (userIsFrenchCM() && WME_CRT_MainCountry == 73) {
				document.getElementById('WME_CRT_ChangeToAltern').style.display = "block";
			} else {
				document.getElementById('WME_CRT_ChangeToAltern').style.display = "none";
			}
		} else {
			document.getElementById('WME_CRT_rename').style.display = "none";
			document.getElementById('WME_CRT_CheckRoadName').checked = 0;
			document.getElementById('WME_CRT_ChangeToAltern').style.display = "none";
			document.getElementById('WME_CRT_Dictionary').style.display = "none";
		}
		manage_CheckRoadName();
		WME_CRT_goodStreet.length = 0; // vide le tableau des rues correctes
		return;
	}

	function manage_CheckRoadName() {
		if (document.getElementById('WME_CRT_CheckRoadName').checked == 1) {
			document.getElementById('WME_CRT_CheckRoadName').disabled = true; // on désactive la case
			document.getElementById('WME_CRT_chk').disabled = true; // on désactive le lancement manuel
			rename_Road();
		} else {
			document.getElementById('WME_CRT_CheckRoadName').disabled = false; // on désactive la case
			document.getElementById('WME_CRT_chk').disabled = false;
		}
		if (WME_CRT_badStreet.length == 0 && WME_CRT_goodStreet.length == 0) { // gestion du bouton raz
			document.getElementById('WME_CRT_raz').disabled = true;
		} else {
			document.getElementById('WME_CRT_raz').disabled = false;
		}
		return;
	}

	function afficheObjet(objet) {
		for (var e in objet) {
			alert("objet[" + e + "] =" + objet[e] + " !");
		}
	}

	function encodeHTML(var1) {
		var var2 = var1;
		var2 = var2.replace(/[&]/gi, "&amp;");
		var2 = var2.replace(/["]/gi, "&quot;");
		var2 = var2.replace(/[<]/gi, "&lsaquo;");
		var2 = var2.replace(/[>]/gi, "&rsaquo;");
		return var2;
	}

	function init_WME_CRT() {
		localStorage.removeItem('WME_CRT_CheckLdmkName'); // Remove old item in LocalStorage
		localStorage.removeItem('WME_Merge_Unknown_Roads_CheckLdmkName');
		localStorage.removeItem('WME_Merge_Unknown_Roads_CheckRoadName');
		localStorage.removeItem('WME_Merge_Unknown_Roads_enable');
		localStorage.removeItem('WME_CRT_CheckCityName');
		localStorage.removeItem('WME_CRT_CheckRoadName');

		if (localStorage.WME_CRT_enable == "true") { // restaure old Values (if exist)
			document.getElementById('WME_CRT_enable').checked = 1;
		}
		document.getElementById('WME_CRT_CheckRoadName').checked = 0;
		document.getElementById("WME_CRT_enable").onclick = manage_WME_CRT;
		document.getElementById("WME_CRT_CheckRoadName").onclick = manage_CheckRoadName;

		manage_WME_CRT();

		myAlert("WME_CRT initialized");
		myAlert("Dictionnaries : " + Waze.model.countries.objects[WME_CRT_MainCountry].name);
	}

	function searchIdOTAN(countryID) {
		switch (countryID) {
			case 73:
				return " FRA ";
				break;
			case 74:
				return "FR-FG";
				break;
			case 88:
				return "FR-GP";
				break;
			case 141:
				return "FR-MB";
				break;
			case 152:
				return " MAR ";
				break;
			case 184:
				return "FR-RE";
				break;
			case 186:
				return "RUS";
				break;
			default:
				return " ??? ";
		}
	}

	function myAlert(message) {
		if (document.getElementById('map-search') != null && !document.getElementById('WME_JCB_AlertTxt')) { // verif (et réafffichage) de l'alerteBox
			var myAlertBox = $('<div id="WME_JCB_AlertBox" class="form-control search-query" style="opacity : 0.8;display :none;  height: auto;min-height: 30px; position: absolute;top :16px; margin-left: 350px; margin-right: auto; "/>');
			var myAlertTxt = $('<div id="WME_JCB_AlertTxt" style=" opacity : 1;display:inline;padding:0px 0px">City ID/');
			myAlertBox.append(myAlertTxt);
			$("#map-search").append(myAlertBox);
		}
		if (document.getElementById('WME_JCB_AlertTxt')) {
			var myMessage = document.getElementById('WME_JCB_AlertTxt').innerHTML;
			var line = myMessage.split("<br>");
			if (line.length == 1 && line[0] == "") {
				line[0] = message;
			} else {
				line.push(message);
			}
			document.getElementById('WME_JCB_AlertTxt').innerHTML = line.join("<br>");
			document.getElementById('WME_JCB_AlertBox').style.display = "block";
			setTimeout(function() {
				endAlert();
			}, 3750 + 500 * Math.random());
		}
	}

	function endAlert() {
		var myMessage = document.getElementById('WME_JCB_AlertTxt').innerHTML;
		var line = myMessage.split("<br>");
		line.shift();
		document.getElementById('WME_JCB_AlertTxt').innerHTML = line.join("<br>");
		if (line.length == 0) {
			document.getElementById('WME_JCB_AlertBox').style.display = "none";
		}
	}


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
}
// вызываем загрузчик в конце скрипта test
WME_Corrector_bootstrap();
