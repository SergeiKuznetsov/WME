function coolscript_bootstrap()
{
	var bGreasemonkeyServiceDefined     = false;

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
	coolscript_init();
}

function coolscript_init()
{
	// выполнить свой код здесь
}

// другие функции

// вызываем загрузчик в конце скрипта
coolscript_bootstrap();
