import { UIPanel, UIRow, UIText, UISelect } from './libs/ui.js';

function SidebarEvent( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	//

	const objectEventRow = new UIRow();
	const objectEvent = new UISelect().setWidth( '150px' ).setFontSize( '12px' ).setOptions( {

		'Ninguno': 'Ninguno',
		'Rotación Horizontal': 'Rotación Horizontal',
		'Rotación Vertical': 'Rotación Vertical'

	} ).onChange( function () {

		const object = editor.selected;
		if ( object !== null ) {

			object.userData.activeEvent = this.getValue();
			editor.signals.objectChanged.dispatch( object );

		}

	} );

	objectEventRow.add( new UIText( 'Evento:' ).setClass( 'Label' ) );
	objectEventRow.add( objectEvent );

	const objectEventSection = new UIPanel();
	objectEventSection.setClass( '' );
	objectEventSection.add( objectEventRow );

	container.add( objectEventSection );

	//

	function updateUI() {

		const object = editor.selected;

		if ( object !== null && object.isMesh && object.userData && object.userData.activeEvent ) {

			objectEvent.setValue( object.userData.activeEvent || 'Ninguno' );

		}

	}

	signals.objectSelected.add( updateUI );
	signals.objectChanged.add( updateUI );

	return container;

}

export { SidebarEvent };
