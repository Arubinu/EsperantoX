console.log( 'Welcome, EsperantoX loaded.' );

// this watches for messages from the popup
chrome.extension.onConnect.addListener( function( port ) {
	console.assert( port.name == 'EsperantoX' );
	port.onMessage.addListener( function( data ) {
		if ( data.action in main )
			main[ data.action ]();
	} );
} );

// check the storage for keys
chrome.storage.sync.get( 'config', function( items ) {
	if ( typeof( items ) !== 'object' || typeof( items.config ) !== 'object' || items.config.active )
		main.start();
	else if ( !items.config.active )
		main.stop();
} );

var main = {
	start: function() {
		main.stop( true );
		console.log( 'EsperantoX started.' );
		document.addEventListener( 'keyup', main.event );
	},
	stop: function( nlog ) {
		if ( !nlog )
			console.log( 'EsperantoX stopped.' );
		document.removeEventListener( 'keyup', main.event );
	},
	replace: function( elem, pos ) {
		if ( !elem.value[ pos ] )
			return ;

		var get = [ 'c', 'g', 'h', 'j', 's', 'u' ];
		var set = [ 'ĉ', 'ĝ', 'ĥ', 'ĵ', 'ŝ', 'ŭ' ];

		var l = elem.value[ pos ].toLowerCase();
		var u = ( l != elem.value[ pos ] );

		var p = get.indexOf( l );
		if ( p >= 0 && elem.value[ pos + 1 ] && elem.value[ pos + 1 ].toLowerCase() == 'x' )
		{
			var c = ( u ? set[ p ].toUpperCase() : set[ p ] );
			elem.value = ( elem.value.substr( 0, pos ) + c + elem.value.substr( pos + 2 ) );
		}
	},
	event: function( event, all ) {
		var elem = ( event ? event.target : document.querySelector( 'input:focus' ) );
		if ( !elem || !elem.value )
			return ;

		var len = elem.value.length;
		var i = ( all ? 0 : ( elem.selectionStart - 2 ) );
		for ( ; i >= 0 && i < len; ++i )
			main.replace( elem, i );
	}
};

//# sourceMappingURL=EsperantoXMainController.js.map
