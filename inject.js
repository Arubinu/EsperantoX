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
	start: function( nlog ) {
		main.stop( true );
		if ( !nlog )
			console.log( 'EsperantoX started.' );

		main.state = true;
		main.editable( true );
		document.addEventListener( 'keyup', main.event );
	},
	stop: function( nlog ) {
		if ( !nlog )
			console.log( 'EsperantoX stopped.' );

		main.state = false;
		main.editable( false );
		document.removeEventListener( 'keyup', main.event );
	},
	editable: function( active ) {
		var elems = document.querySelectorAll( ':not(input):not(textarea)[editable], :not(input):not(textarea)[contenteditable]' );
		for ( var i = 0; i < elems.length; ++i )
		{
			elems[ i ].removeEventListener( 'keyup', main.event, false );
			if ( active )
			{
				elems[ i ].addEventListener( 'keyup', main.event, false );
				main.event( { target: elems[ i ] } );
			}
		}
	},
	value: function( elem, value ) {
		var type = elem.nodeName.toLowerCase();
		if ( typeof( value ) === 'string' )
		{
			switch ( type )
			{
				case 'input': elem.value = value; break ;
				case 'textarea': elem.value = value; break ;
				default:
					if ( typeof( elem.textContent ) === 'string' )
						elem.textContent = value;
					else
						elem.nodeValue = value;
			}
		}

		switch ( type )
		{
			case 'input': value = elem.value; break ;
			case 'textarea': value = elem.value; break ;
			default: value = ( elem.textContent || elem.nodeValue );
		}

		return ( value );
	},
	selection: function( elem, start, end ) {
		var type = elem.nodeName.toLowerCase();
		if ( typeof( start ) === 'object' )
		{
			if ( Array.isArray( start ) )
			{
				end = start[ 1 ];
				start = start[ 0 ];
			}
			else
			{
				end = ( ( typeof( start.end ) === 'number' ) ? start.end : end );
				start = ( ( typeof( start.start ) === 'number' ) ? start.start : start );
			}
		}

		end = ( ( typeof( end ) === 'number' ) ? end : start );
		try
		{
			if ( typeof( start ) === 'number' )
			{
				if ( [ 'input', 'textarea' ].indexOf( type ) >= 0 )
				{
					elem.selectionStart = start;
					elem.selectionEnd = end;
				}
				else
				{
					var range = document.createRange();
					range.setStart( elem, start );
					range.setEnd( elem, end );
				}
			}
		}
		catch ( e ) {}

		if ( [ 'input', 'textarea' ].indexOf( type ) >= 0 )
		{
			start = elem.selectionStart;
			end = elem.selectionEnd;
		}
		else
			start = end = window.getSelection().focusOffset;

		return ( { start: start, end: end } );
	},
	replace: function( elem, pos ) {
		var value = main.value( elem );
		if ( !value[ pos ] )
			return ( false );

		var get = [ 'c', 'g', 'h', 'j', 's', 'u' ];
		var set = [ 'ĉ', 'ĝ', 'ĥ', 'ĵ', 'ŝ', 'ŭ' ];

		var l = value[ pos ].toLowerCase();
		var u = ( l != value[ pos ] );

		var p = get.indexOf( l );
		if ( p >= 0 && value[ pos + 1 ] && value[ pos + 1 ].toLowerCase() == 'x' )
		{
			var c = ( u ? set[ p ].toUpperCase() : set[ p ] );
			main.value( elem, ( value.substr( 0, pos ) + c + value.substr( pos + 2 ) ) );
			return ( true );
		}

		return ( false );
	},
	event: function( event, all ) {
		var elem = ( event ? event.target : document.querySelector( 'input:focus, textarea:focus' ) );
		if ( event && ( ( event.keyCode >= 37 && event.keyCode <= 40 ) || typeof( event.button ) === 'number' ) )
			return ;

		var selection = main.selection( elem );
		if ( elem && elem.children && elem.children.length )
		{
			var pos = 0;
			for ( var i = 0; i >= 0 && i < elem.childNodes.length; ++i )
				pos += ( main.event( { target: elem.childNodes[ i ] } ) ? 1 : 0 );

			main.selection( elem, [ ( selection.start - pos ), ( selection.end - pos ) ] );
			return ;
		}

		var value = false;
		if ( !elem || !( value = main.value( elem ) ) )
			return ;

		var pos = 0;
		var i = ( all ? 0 : ( selection.start - 2 ) );
		var s = ( all ? value.length : ( i + 1 ) );
		for ( ; i >= 0 && i < s; ++i )
			pos += ( main.replace( elem, i ) ? 1 : 0 );

		main.selection( elem, [ ( selection.start - pos ), ( selection.end - pos ) ] );
	}
};

var timeout = false;
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
