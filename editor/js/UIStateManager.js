/**
 * UIStateManager - Centralized LocalStorage persistence for UI 2D System
 * Handles save/load of canvas elements and overlay visibility
 */
function UIStateManager( editor ) {

	this.editor = editor;
	this.storageKey = 'three-editor-ui-state';

}

/**
 * Save complete UI state to LocalStorage
 * @param {Object} state - State object with canvas elements and overlay visibility
 */
UIStateManager.prototype.saveState = function ( state ) {

	try {

		localStorage.setItem( this.storageKey, JSON.stringify( state ) );
		this.editor.signals.uiStatePersisted.dispatch( state );

	} catch ( e ) {

		if ( e.name === 'QuotaExceededError' || e.code === 22 || e.message.includes( 'quota' ) ) {

			console.error( 'LocalStorage quota exceeded. Cannot save UI state.' );
			alert( 'Error: No se puede guardar el estado. El almacenamiento local está lleno.' );

		} else {

			console.error( 'Error saving UI state to LocalStorage:', e );
			alert( 'Error al guardar el estado de la interfaz.' );

		}

	}

};

/**
 * Load UI state from LocalStorage
 * @return {Object|null} Parsed state object or null if not found
 */
UIStateManager.prototype.loadState = function () {

	const stored = localStorage.getItem( this.storageKey );
	if ( ! stored ) return null;

	try {

		return JSON.parse( stored );

	} catch ( e ) {

		console.warn( 'Failed to load UI state from LocalStorage:', e );
		return null;

	}

};

/**
 * Save canvas elements to LocalStorage
 * @param {Array} elements - Array of UI elements
 */
UIStateManager.prototype.saveElements = function ( elements ) {

	const state = {
		canvas: {
			elements: elements.map( function ( el ) {

				return {
					id: el.id,
					type: el.type,
					pos: [ el.x, el.y ],
					size: [ el.width, el.height ],
					src: el.src || '',
					label: el.label || '',
					name: el.name || ''
				};

			} ),
			overlayVisible: this.editor.uiState.canvas.overlayVisible || false
		}
	};

	this.saveState( state );

};

/**
 * Load canvas elements from LocalStorage
 * @return {Array} Array of elements or empty array
 */
UIStateManager.prototype.loadElements = function () {

	const state = this.loadState();
	if ( ! state || ! state.canvas || ! state.canvas.elements ) {

		return [];

	}

	return state.canvas.elements.map( function ( el ) {

		return {
			id: el.id,
			type: el.type,
			x: el.pos[ 0 ],
			y: el.pos[ 1 ],
			width: el.size[ 0 ],
			height: el.size[ 1 ],
			src: el.src,
			label: el.label,
			name: el.name
		};

	} );

};

/**
 * Update overlay visibility in state and LocalStorage
 * @param {boolean} visible - Whether overlay should be visible
 */
UIStateManager.prototype.setOverlayVisible = function ( visible ) {

	this.editor.uiState.canvas.overlayVisible = visible;

	const stored = localStorage.getItem( this.storageKey );
	const state = stored ? JSON.parse( stored ) : {};

	state.canvas = state.canvas || {};
	state.canvas.overlayVisible = visible;

	this.saveState( state );

};

/**
 * Get overlay visibility from LocalStorage
 * @return {boolean} Whether overlay should be visible
 */
UIStateManager.prototype.getOverlayVisible = function () {

	const state = this.loadState();
	return state && state.canvas && state.canvas.overlayVisible === true;

};

export { UIStateManager };
