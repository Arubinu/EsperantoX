document.addEventListener( 'DOMContentLoaded', function() {
	// object that sets the storage key value and toggles the buttons
	var toggle = function( active ) {
		document.querySelector( '#popup' ).className = ( active ? 'active' : 'inactive' );
		chrome.storage.sync.set( { config: { active: active } }, function() {} );

		var message = { action: ( active ? 'start' : 'stop' ) };
		chrome.tabs.query( {}, function( tabs ) {
			for ( var i = 0; i < tabs.length; ++i )
				chrome.tabs.connect( tabs[ i ].id, { name: 'EsperantoX' } ).postMessage( message, '*' );
		} );
	};

	// localization
	var localize = {
		replace_i18n: function( obj, tag ) {
			var msg = tag.replace( /__MSG_(\w+)__/g, function( match, v1 ) {
				return ( v1 ? chrome.i18n.getMessage( v1 ) : '' );
			} );

			if ( msg != tag )
				obj.innerHTML = msg;
		},
		localizeHtmlPage: function() {
			// Localize using __MSG_***__ data tags
			var data = document.querySelectorAll( '[data-localize]' );
			for ( var i in data )
			{
				if ( !data.hasOwnProperty( i ) )
					continue ;

				var obj = data[i];
				var tag = obj.getAttribute( 'data-localize' ).toString();
				localize.replace_i18n(obj, tag);
			}

			// Localize everything else by replacing all __MSG_***__ tags
			var page = document.getElementsByTagName( 'html' );
			for ( var j = 0; j < page.length; ++j )
			{
				var obj = page[ j ];
				var tag = obj.innerHTML.toString();
				localize.replace_i18n( obj, tag );
			}
		}
	};

	// get saved config
	chrome.storage.sync.get( 'config', function( items ) {
		if ( typeof( items ) !== 'object' || typeof( items.config ) !== 'object' || items.config.active )
			toggle( true );
		else if ( !items.config.active )
			toggle( false );
	} );

	// initialize the localization
	localize.localizeHtmlPage();

	// add click event on buttons
	document.querySelector( '.box.active' ).addEventListener( 'click', function() { toggle( false ); }, false );
	document.querySelector( '.box.inactive' ).addEventListener( 'click', function() { toggle( true ); }, false );
} );

//# sourceMappingURL=script.js.map
