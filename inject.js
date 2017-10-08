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
	state: true,
	enable: false,
	backout: '', // hold the text if they want to back out
	start: function( nlog ) {
		if ( !nlog )
			console.log( 'EsperantoX started.' );

		main.state = true;
	},
	stop: function( nlog ) {
		if ( !nlog )
			console.log( 'EsperantoX stopped.' );

		main.state = false;
	},
	editable: function( active ) {
		var elems = document.querySelectorAll( ':not(input):not(textarea)[editable], :not(input):not(textarea)[contenteditable]' );
		for ( var i = 0; i < elems.length; ++i )
		{
			elems[ i ].removeEventListener( 'keydown', main.event, false );
			elems[ i ].addEventListener( 'keydown', main.event, false );
		}
	},
	replace: function( search ) {
		var get = [ 'c', 'g', 'h', 'j', 's', 'u' ];
		var set = [ 'ĉ', 'ĝ', 'ĥ', 'ĵ', 'ŝ', 'ŭ' ];

		for ( var i = 0; i < get.length; ++i )
		{
			if ( ( get[ i ] + 'x' ) == search )
				return ( set[ i ] );
		}

		return ( null );
	},
	event: function( event ) {
		var elem = event.srcElement;
		if ( !main.state || [ 'text', 'textarea' ].indexOf( elem.type ) < 0 )
			return ;

		if ( event.keyCode === 32 && main.enable )
		{
			// spacebar
			var words = elem.value.split( ' ' );
			var lastWord = words[ words.length - 1 ];

			var replacement = main.replace( lastWord );
			if ( replacement )
			{
				event.preventDefault();

				main.enable = false;
				main.backout = elem.value;

				var location = elem.value.lastIndexOf( lastWord );
				elem.value = elem.value.substring( 0, location ) + replacement;
			}
		}
		else if ( event.keyCode === 8 )
		{
			// backspace... time to back it out
			if ( main.backout )
			{
				event.preventDefault();

				elem.value = main.backout;
				main.backout = null;
			}
		}
		else
		{
			main.enable = true;
			main.backout = null;
		}
	}
};

// bind the listener
var timeout = false;
document.addEventListener( 'keydown', main.event );
document.addEventListener( 'DOMNodeInserted', function() {
	if ( timeout )
	{
		clearTimeout( timeout );
		timeout = false;
	}

	timeout = setTimeout( function() {
		if ( main.state )
			console.log( 'EsperantoX refreshed' );
		main.editable( main.state );
	}, 100 );
}, false );

//# sourceMappingURL=EsperantoXMainController.js.map
