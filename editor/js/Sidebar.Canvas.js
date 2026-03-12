import { UIPanel, UIBreak, UIRow, UISpan, UIText, UINumber, UIDiv } from './libs/ui.js';

import { UI, ELEMENT_TYPE } from './UIConstants.js';

function SidebarCanvas( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setId( 'canvas' );
	container.setBorderTop( '0' );
	container.setPaddingTop( '10px' );

	// Title
	const titleRow = new UIRow();
	titleRow.add( new UIText( 'UI Elements' ).setFontSize( '12px' ) );
	container.add( titleRow );
	container.add( new UIBreak() );

	// UI Outliner - Custom implementation that mimics SCENE outliner visual style
	const outlinerContainer = new UIDiv();
	outlinerContainer.setId( 'outliner' );
	outlinerContainer.setClass( 'Outliner' );
	container.add( outlinerContainer );
	container.add( new UIBreak() );

	// Canvas Editor Section
	const canvasTitleRow = new UIRow();
	canvasTitleRow.add( new UIText( 'Canvas Editor' ).setFontSize( '12px' ) );
	container.add( canvasTitleRow );

	// Canvas container with 4:3 aspect ratio
	const canvasContainer = document.createElement( 'div' );
	canvasContainer.id = 'sidebar-canvas-container';

	// Canvas for rendering UI elements
	const canvas = document.createElement( 'div' );
	canvas.id = 'sidebar-ui-canvas';

	canvasContainer.appendChild( canvas );

	// Add hit area detection on canvas (for expanded hit area)
	// Use capture phase to catch events before they reach child elements
	canvas.addEventListener( 'mousedown', onCanvasMouseDown, true );

	// Make canvas focusable for keyboard events (delete selected element)
	canvas.tabIndex = 0;

	const canvasPanel = new UIPanel();
	canvasPanel.dom.appendChild( canvasContainer );
	container.add( canvasPanel );

	// Position Properties Section
	const positionTitleRow = new UIRow();
	positionTitleRow.add( new UIText( 'Position' ).setFontSize( '12px' ) );
	container.add( positionTitleRow );

	const positionPanel = new UIPanel();
	positionPanel.setClass( 'panel' );

	const positionRow = new UISpan();
	positionRow.setDisplay( 'flex' );
	positionRow.setWidth( '100%' );
	positionRow.setMarginBottom( '4px' );

	const xLabel = new UIText( 'X:' );
	xLabel.setMarginRight( '4px' );

	const xInput = new UINumber( 0 );
	xInput.setWidth( '50px' );
	xInput.setRange( UI.POSITION.MIN, UI.POSITION.MAX );
	xInput.setStep( UI.POSITION.STEP );

	const yLabel = new UIText( 'Y:' );
	yLabel.setMarginRight( '4px' );
	yLabel.setMarginLeft( '8px' );

	const yInput = new UINumber( 0 );
	yInput.setWidth( '50px' );
	yInput.setRange( UI.POSITION.MIN, UI.POSITION.MAX );
	yInput.setStep( UI.POSITION.STEP );

	positionRow.add( xLabel, xInput, yLabel, yInput );
	positionPanel.add( positionRow );

	container.add( positionPanel );

	positionPanel.setDisplay( 'none' );

	// State for drag operations
	let selectedElementId = null;
	let isDragging = false;
	const dragOffset = { x: 0, y: 0 };

	// State for resize operations
	let isResizing = false;
	let activeHandle = null;
	const resizeStart = { x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 };

	// Hit area padding for easier element selection (in percentage)
	const HIT_PADDING = UI.HIT_PADDING;

	// Escape HTML
	function escapeHTML( html ) {

		return html
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' );

	}

	// Build HTML for UI element (simple text, no spans to avoid style conflicts)
	function buildHTML( element ) {

		const icon = element.type === ELEMENT_TYPE.IMAGE ? '[IMG]' : '[BTN]';
		const name = escapeHTML( element.name || 'Unnamed ' + element.type );

		return icon + ' ' + name;

	}

	// Custom Outliner Implementation (mimics UIOutliner but for UI elements)
	let outlinerValue = null;
	const outlinerChangeCallbacks = [];

	// Custom setOptions - render options in the outliner
	function outlinerSetOptions( options ) {

		outlinerContainer.dom.innerHTML = '';

		options.forEach( function ( option ) {

			const optionEl = document.createElement( 'div' );
			optionEl.className = 'option';
			optionEl.draggable = true;
			optionEl.innerHTML = option.html || '';
			optionEl.value = option.value;

			// Click handler
			optionEl.addEventListener( 'click', function () {

				outlinerSetValue( this.value );
				outlinerChangeCallbacks.forEach( function ( cb ) {

					cb( outlinerValue );

				} );

			} );

			// Drag start
			optionEl.addEventListener( 'dragstart', function ( e ) {

				e.dataTransfer.setData( 'text', 'foo' );
				currentDragElement = this;

			} );

			// Drag over
			optionEl.addEventListener( 'dragover', function ( e ) {

				e.preventDefault();
				if ( currentDragElement && currentDragElement !== this ) {

					const area = e.offsetY / this.clientHeight;
					if ( area < 0.2 ) this.className = 'option dragTop';
					else if ( area > 0.7 ) this.className = 'option dragBottom';
					else this.className = 'option drag';

				}

			} );

			// Drag leave
			optionEl.addEventListener( 'dragleave', function () {

				this.className = 'option';

			} );

			// Drop
			optionEl.addEventListener( 'drop', function ( e ) {

				e.preventDefault();
				this.className = 'option';

				if ( ! currentDragElement ) return;

				const draggedId = currentDragElement.value;
				const targetId = this.value;

				const elements = editor.uiState.canvas.elements;
				const draggedIndex = elements.findIndex( function ( el ) {

					return el.id === draggedId;

				} );
				const targetIndex = elements.findIndex( function ( el ) {

					return el.id === targetId;

				} );

				if ( draggedIndex === - 1 || targetIndex === - 1 ) return;

				const area = e.offsetY / this.clientHeight;
				let newIndex = targetIndex;

				if ( area > 0.7 ) newIndex = targetIndex + 1;

				// Reorder array
				const movedElement = elements[ draggedIndex ];
				elements.splice( draggedIndex, 1 );

				const insertIndex = newIndex > draggedIndex ? newIndex - 1 : newIndex;
				elements.splice( insertIndex < 0 ? 0 : insertIndex, 0, movedElement );

				// Notify and persist
				signals.uiElementTransformed.dispatch();
				persistUIState();
				refreshUI();

				currentDragElement = null;

			} );

			outlinerContainer.dom.appendChild( optionEl );

		} );

	}

	// Custom setValue - select an option
	function outlinerSetValue( value ) {

		outlinerValue = value;

		// Update visual selection
		const options = outlinerContainer.dom.querySelectorAll( '.option' );
		options.forEach( function ( opt ) {

			if ( String( opt.value ) === String( value ) ) opt.classList.add( 'selected' );
			else opt.classList.remove( 'selected' );

		} );

	}


	// Custom onChange - register callback
	function outlinerOnChange( callback ) {

		outlinerChangeCallbacks.push( callback );

	}

	// State for drag operations in outliner
	let currentDragElement = null;

	// Configure outliner callbacks
	outlinerOnChange( function ( value ) {

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === value;

		} );

		if ( element ) {

			selectedElementId = element.id;
			signals.uiElementSelected.dispatch( element );

		}

	} );

	// Delete element from outliner (Delete or Backspace key)
	outlinerContainer.dom.addEventListener( 'keydown', function ( event ) {

		if ( ( event.code === 'Delete' || event.code === 'Backspace' ) && selectedElementId ) {

			event.preventDefault();

			const elements = editor.uiState.canvas.elements;
			const index = elements.findIndex( function ( el ) {

				return el.id === selectedElementId;

			} );

			if ( index !== - 1 ) {

				elements.splice( index, 1 );
				selectedElementId = null;

				// Notify signals
				signals.uiElementSelected.dispatch( null );
				signals.uiElementTransformed.dispatch();

				// If no elements left, close the overlay automatically
				if ( elements.length === 0 ) {

					editor.uiStateManager.setOverlayVisible( false );
					signals.uiOverlayToggled.dispatch( false );

				}

				// Persist and refresh
				persistUIState();
				refreshUI();

			}

		}

	} );

	// Delete element from canvas with Delete/Backspace key
	canvas.addEventListener( 'keydown', function ( event ) {

		if ( ( event.code === 'Delete' || event.code === 'Backspace' ) && selectedElementId ) {

			event.preventDefault();

			const elements = editor.uiState.canvas.elements;
			const index = elements.findIndex( function ( el ) {

				return el.id === selectedElementId;

			} );

			if ( index !== - 1 ) {

				elements.splice( index, 1 );
				selectedElementId = null;

				// Notify signals
				signals.uiElementSelected.dispatch( null );
				signals.uiElementTransformed.dispatch();

				// If no elements left, close the overlay automatically
				if ( elements.length === 0 ) {

					editor.uiStateManager.setOverlayVisible( false );
					signals.uiOverlayToggled.dispatch( false );

				}

				// Persist and refresh
				persistUIState();
				refreshUI();

			}

		}

	} );
	outlinerContainer.dom.tabIndex = 0;

	// Update position inputs from selected element
	function updatePositionInputs() {

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );

		if ( element ) {

			xInput.setValue( element.x );
			yInput.setValue( element.y );
			positionPanel.setDisplay( 'block' );

		} else {

			positionPanel.setDisplay( 'none' );

		}

	}

	// Position input change handlers
	xInput.onChange( function () {

		if ( ! selectedElementId ) return;

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );
		if ( ! element ) return;

		let newX = this.getValue();
		newX = Math.max( 0, Math.min( 100 - element.width, newX ) );
		element.x = newX;

		renderCanvas();
		signals.uiElementTransformed.dispatch();

	} );

	yInput.onChange( function () {

		if ( ! selectedElementId ) return;

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );
		if ( ! element ) return;

		let newY = this.getValue();
		newY = Math.max( 0, Math.min( 100 - element.height, newY ) );
		element.y = newY;

		renderCanvas();
		signals.uiElementTransformed.dispatch();

	} );

	// Render Canvas Editor
	function renderCanvas() {

		canvas.innerHTML = '';

		const elements = editor.uiState.canvas.elements || [];

		let selectedElement = null;

		elements.forEach( function ( element ) {

			let domElement = null;

			if ( element.type === ELEMENT_TYPE.IMAGE ) {

				domElement = document.createElement( 'img' );
				domElement.src = element.src;
				domElement.style.left = element.x + '%';
				domElement.style.top = element.y + '%';
				domElement.style.width = element.width + '%';
				domElement.style.height = element.height + '%';

			} else if ( element.type === ELEMENT_TYPE.BUTTON ) {

				domElement = document.createElement( 'div' );
				domElement.style.left = element.x + '%';
				domElement.style.top = element.y + '%';
				domElement.style.width = element.width + '%';
				domElement.style.height = element.height + '%';
				domElement.className = 'canvas-button';
				domElement.textContent = element.label || 'Button';

			}

			if ( domElement ) {

				domElement.dataset.elementId = element.id;

				if ( element.id === selectedElementId ) {

					domElement.classList.add( 'selected' );
					selectedElement = element;

				}

				canvas.appendChild( domElement );

			}

		} );

		// Render resize handles for selected element
		if ( selectedElement ) {

			const elemLeft = selectedElement.x;
			const elemTop = selectedElement.y;
			const elemRight = selectedElement.x + selectedElement.width;
			const elemBottom = selectedElement.y + selectedElement.height;
			const elemCenterX = selectedElement.x + selectedElement.width / 2;
			const elemCenterY = selectedElement.y + selectedElement.height / 2;

			const handles = [
				{ name: 'nw', cursor: 'nwse-resize', left: elemLeft, top: elemTop },
				{ name: 'n', cursor: 'ns-resize', left: elemCenterX, top: elemTop },
				{ name: 'ne', cursor: 'nesw-resize', left: elemRight, top: elemTop },
				{ name: 'e', cursor: 'ew-resize', left: elemRight, top: elemCenterY },
				{ name: 'se', cursor: 'nwse-resize', left: elemRight, top: elemBottom },
				{ name: 's', cursor: 'ns-resize', left: elemCenterX, top: elemBottom },
				{ name: 'sw', cursor: 'nesw-resize', left: elemLeft, top: elemBottom },
				{ name: 'w', cursor: 'ew-resize', left: elemLeft, top: elemCenterY }
			];

			handles.forEach( function ( handle ) {

				const handleEl = document.createElement( 'div' );
				handleEl.className = 'resize-handle';
				handleEl.dataset.handle = handle.name;
				handleEl.style.left = handle.left + '%';
				handleEl.style.top = handle.top + '%';
				handleEl.style.cursor = handle.cursor;

				handleEl.addEventListener( 'mousedown', onResizeStart );

				canvas.appendChild( handleEl );

			} );

		}

	}

	// Mouse handlers for drag & drop (with expanded hit area)
	function onCanvasMouseDown( event ) {

		event.preventDefault();

		const rect = canvas.getBoundingClientRect();
		const clickX = ( ( event.clientX - rect.left ) / rect.width ) * 100;
		const clickY = ( ( event.clientY - rect.top ) / rect.height ) * 100;

		// Find element with expanded hit area (hit padding)
		const elements = editor.uiState.canvas.elements || [];
		let clickedElement = null;

		for ( let i = elements.length - 1; i >= 0; i -- ) {

			const el = elements[ i ];
			const hitLeft = el.x - HIT_PADDING;
			const hitRight = el.x + el.width + HIT_PADDING;
			const hitTop = el.y - HIT_PADDING;
			const hitBottom = el.y + el.height + HIT_PADDING;

			if ( clickX >= hitLeft && clickX <= hitRight &&
				clickY >= hitTop && clickY <= hitBottom ) {

				clickedElement = el;
				break;

			}

		}

		if ( ! clickedElement ) {

			// Click on empty canvas - deselect element
			selectedElementId = null;
			signals.uiElementSelected.dispatch( null );
			renderCanvas();
			updatePositionInputs();
			return;

		}

		const elementId = clickedElement.id;
		selectedElementId = elementId;
		signals.uiElementSelected.dispatch( clickedElement );

		// Focus canvas so keyboard events work (delete with Delete/Backspace)
		canvas.focus();

		isDragging = true;
		dragOffset.x = clickX - clickedElement.x;
		dragOffset.y = clickY - clickedElement.y;

		renderCanvas();
		updatePositionInputs();

	}

	// Resize handle mouse down
	function onResizeStart( event ) {

		event.preventDefault();
		event.stopPropagation();

		activeHandle = event.target.dataset.handle;
		isResizing = true;

		const rect = canvas.getBoundingClientRect();
		resizeStart.x = ( event.clientX - rect.left ) / rect.width * 100;
		resizeStart.y = ( event.clientY - rect.top ) / rect.height * 100;

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );
		if ( element ) {

			resizeStart.width = element.width;
			resizeStart.height = element.height;
			resizeStart.elementX = element.x;
			resizeStart.elementY = element.y;

		}

		document.addEventListener( 'mousemove', onResizeMove );
		document.addEventListener( 'mouseup', onResizeEnd );

	}

	// Calculate resize for buttons (free resize)
	function calculateButtonResize( handle, deltaX, deltaY, startState ) {

		let newX, newY, newWidth, newHeight;

		switch ( handle ) {

			case 'nw':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = Math.max( UI.SIZE.MIN, startState.height - deltaY );
				newX = startState.elementX + ( startState.width - newWidth );
				newY = startState.elementY + ( startState.height - newHeight );
				break;

			case 'n':
				newWidth = startState.width;
				newHeight = Math.max( UI.SIZE.MIN, startState.height - deltaY );
				newX = startState.elementX;
				newY = startState.elementY + ( startState.height - newHeight );
				break;

			case 'ne':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = Math.max( UI.SIZE.MIN, startState.height - deltaY );
				newX = startState.elementX;
				newY = startState.elementY + ( startState.height - newHeight );
				break;

			case 'e':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = startState.height;
				newX = startState.elementX;
				newY = startState.elementY;
				break;

			case 'se':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = Math.max( UI.SIZE.MIN, startState.height + deltaY );
				newX = startState.elementX;
				newY = startState.elementY;
				break;

			case 's':
				newWidth = startState.width;
				newHeight = Math.max( UI.SIZE.MIN, startState.height + deltaY );
				newX = startState.elementX;
				newY = startState.elementY;
				break;

			case 'sw':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = Math.max( UI.SIZE.MIN, startState.height + deltaY );
				newX = startState.elementX + ( startState.width - newWidth );
				newY = startState.elementY;
				break;

			case 'w':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = startState.height;
				newX = startState.elementX + ( startState.width - newWidth );
				newY = startState.elementY;
				break;

			default:
				return null;

		}

		return { x: newX, y: newY, width: newWidth, height: newHeight };

	}

	// Calculate resize for images (maintain aspect ratio)
	function calculateImageResize( handle, deltaX, deltaY, startState ) {

		const aspectRatio = startState.width / startState.height;
		let newX, newY, newWidth, newHeight;

		switch ( handle ) {

			case 'nw':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX + startState.width - newWidth;
				newY = startState.elementY + startState.height - newHeight;
				break;

			case 'n':
				newHeight = Math.max( UI.SIZE.MIN, startState.height - deltaY );
				newWidth = newHeight * aspectRatio;
				newX = startState.elementX + ( startState.width - newWidth ) / 2;
				newY = startState.elementY + ( startState.height - newHeight );
				break;

			case 'ne':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX;
				newY = startState.elementY + startState.height - newHeight;
				break;

			case 'e':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX;
				newY = startState.elementY + ( startState.height - newHeight ) / 2;
				break;

			case 'se':
				newWidth = Math.max( UI.SIZE.MIN, startState.width + deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX;
				newY = startState.elementY;
				break;

			case 's':
				newHeight = Math.max( UI.SIZE.MIN, startState.height + deltaY );
				newWidth = newHeight * aspectRatio;
				newX = startState.elementX + ( startState.width - newWidth ) / 2;
				newY = startState.elementY;
				break;

			case 'sw':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX + startState.width - newWidth;
				newY = startState.elementY;
				break;

			case 'w':
				newWidth = Math.max( UI.SIZE.MIN, startState.width - deltaX );
				newHeight = newWidth / aspectRatio;
				newX = startState.elementX + ( startState.width - newWidth );
				newY = startState.elementY;
				break;

			default:
				return null;

		}

		return { x: newX, y: newY, width: newWidth, height: newHeight };

	}

	// Resize mouse move
	function onResizeMove( event ) {

		if ( ! isResizing || ! selectedElementId ) return;

		const rect = canvas.getBoundingClientRect();
		const currentX = ( event.clientX - rect.left ) / rect.width * 100;
		const currentY = ( event.clientY - rect.top ) / rect.height * 100;
		const deltaX = currentX - resizeStart.x;
		const deltaY = currentY - resizeStart.y;

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );
		if ( ! element ) return;

		// Calculate resize based on element type
		let result;

		if ( element.type === ELEMENT_TYPE.BUTTON ) {

			result = calculateButtonResize( activeHandle, deltaX, deltaY, resizeStart );

		} else {

			result = calculateImageResize( activeHandle, deltaX, deltaY, resizeStart );

		}

		if ( ! result ) return;

		// Ensure minimum size
		const newWidth = Math.max( UI.SIZE.MIN, result.width );
		const newHeight = Math.max( UI.SIZE.MIN, result.height );

		// Update element
		element.x = Math.max( 0, Math.min( 100 - newWidth, result.x ) );
		element.y = Math.max( 0, Math.min( 100 - newHeight, result.y ) );
		element.width = newWidth;
		element.height = newHeight;

		renderCanvas();
		signals.uiElementTransformed.dispatch();

	}

	// Resize mouse up
	function onResizeEnd() {

		isResizing = false;
		activeHandle = null;

		document.removeEventListener( 'mousemove', onResizeMove );
		document.removeEventListener( 'mouseup', onResizeEnd );

		persistUIState();
		updatePositionInputs();

	}

	// Global mouse move for dragging
	document.addEventListener( 'mousemove', function ( event ) {

		if ( ! isDragging || ! selectedElementId ) return;

		const rect = canvas.getBoundingClientRect();
		const currentX = ( event.clientX - rect.left ) / rect.width * 100;
		const currentY = ( event.clientY - rect.top ) / rect.height * 100;

		const element = editor.uiState.canvas.elements.find( function ( e ) {

			return e.id === selectedElementId;

		} );
		if ( ! element ) return;

		let newX = currentX - dragOffset.x;
		let newY = currentY - dragOffset.y;

		// Constrain to canvas bounds
		newX = Math.max( 0, Math.min( 100 - element.width, newX ) );
		newY = Math.max( 0, Math.min( 100 - element.height, newY ) );

		element.x = newX;
		element.y = newY;

		renderCanvas();
		signals.uiElementTransformed.dispatch();

	} );

	// Global mouse up for drag end
	document.addEventListener( 'mouseup', function () {

		if ( isDragging ) {

			isDragging = false;
			persistUIState();
			updatePositionInputs();

		}

	} );

	// Persist UI state to LocalStorage
	function persistUIState() {

		editor.uiStateManager.saveElements( editor.uiState.canvas.elements );

	}

	// Load UI state from LocalStorage
	function loadUIState() {

		const elements = editor.uiStateManager.loadElements();
		if ( elements.length > 0 ) {

			editor.uiState.canvas.elements = elements;
			return true;

		}

		return false;

	}

	// Refresh UI (outliner + canvas)
	function refreshUI() {

		// Update outliner with current elements
		const elements = editor.uiState.canvas.elements || [];
		const options = elements.map( function ( element ) {

			return {
				value: element.id,
				html: buildHTML( element )
			};

		} );

		outlinerSetOptions( options );

		// Render canvas
		renderCanvas();

	}

	// Signal handlers
	signals.uiElementSelected.add( function ( element ) {

		selectedElementId = element ? element.id : null;

		// Sync outliner selection
		if ( element ) {

			outlinerSetValue( element.id );

		} else {

			outlinerSetValue( null );

		}

		renderCanvas();
		updatePositionInputs();

	} );

	signals.uiElementTransformed.add( function () {

		refreshUI();

	} );

	// Initialize
	loadUIState();
	refreshUI();

	return container;

}

export { SidebarCanvas };
