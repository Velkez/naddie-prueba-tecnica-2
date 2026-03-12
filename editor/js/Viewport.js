import * as THREE from 'three';
import { PMREMGenerator } from 'three/webgpu';

import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { UIPanel } from './libs/ui.js';

import { EditorControls } from './EditorControls.js';

import { ViewportControls } from './Viewport.Controls.js';
import { ViewportInfo } from './Viewport.Info.js';

import { ViewHelper } from './Viewport.ViewHelper.js';
import { XR } from './Viewport.XR.js';

import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';
import { SetScaleCommand } from './commands/SetScaleCommand.js';

import { ColorEnvironment } from 'three/addons/environments/ColorEnvironment.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ViewportPathtracer } from './Viewport.Pathtracer.js';

import { UI_BUTTON_COLORS, ELEMENT_TYPE } from './UIConstants.js';

function Viewport( editor ) {

	const selector = editor.selector;
	const signals = editor.signals;

	const container = new UIPanel();

	// UI 2D Overlay
	let uiOverlay = null;
	let uiCanvas = null;
	let uiElementsContainer = null;

	function createUIOverlay() {

		uiOverlay = document.createElement( 'div' );
		uiOverlay.id = 'ui-overlay';
		uiOverlay.style.position = 'absolute';
		uiOverlay.style.top = '0';
		uiOverlay.style.left = '0';
		uiOverlay.style.width = '100%';
		uiOverlay.style.height = '100%';
		uiOverlay.style.zIndex = '1000';
		uiOverlay.style.display = 'none';
		uiOverlay.style.pointerEvents = 'none';

		// Canvas visualization box (4:3 proportion)
		uiCanvas = document.createElement( 'div' );
		uiCanvas.id = 'ui-canvas-box';
		uiCanvas.style.position = 'absolute';
		uiCanvas.style.top = '50%';
		uiCanvas.style.left = '50%';
		uiCanvas.style.transform = 'translate(-50%, -50%)';
		// Border and background are set in CSS via #ui-canvas-box
		uiCanvas.style.boxSizing = 'border-box';
		uiCanvas.style.overflow = 'hidden';

		// Container for UI elements
		uiElementsContainer = document.createElement( 'div' );
		uiElementsContainer.id = 'ui-elements';
		uiElementsContainer.style.position = 'absolute';
		uiElementsContainer.style.top = '0';
		uiElementsContainer.style.left = '0';
		uiElementsContainer.style.width = '100%';
		uiElementsContainer.style.height = '100%';
		uiElementsContainer.style.pointerEvents = 'none';

		uiCanvas.appendChild( uiElementsContainer );
		uiOverlay.appendChild( uiCanvas );
		container.dom.appendChild( uiOverlay );

	}

	createUIOverlay();

	// Update CSS variable for canvas box size based on viewport width
	function updateCanvasBoxSize() {

		if ( ! container.dom ) return;

		const viewportWidth = container.dom.offsetWidth;
		document.documentElement.style.setProperty( '--viewport-available-width', viewportWidth + 'px' );

	}

	// Initial size update
	updateCanvasBoxSize();

	// Restore overlay visibility from persisted state
	function restoreOverlayVisibility() {

		const uiStateManager = editor.uiStateManager;
		if ( uiStateManager.getOverlayVisible() ) {

			editor.uiState.canvas.overlayVisible = true;
			if ( uiOverlay ) {

				uiOverlay.style.display = 'block';

			}

		}

	}

	restoreOverlayVisibility();

	// Create UI Toggle Button
	const uiToggleButton = document.createElement( 'button' );
	uiToggleButton.id = 'ui-toggle-button';
	uiToggleButton.textContent = 'Overlay UI';
	uiToggleButton.title = 'Toggle UI Overlay';
	uiToggleButton.style.position = 'absolute';
	uiToggleButton.style.bottom = '20px';
	uiToggleButton.style.right = '10px';

	uiToggleButton.addEventListener( 'click', onToggleUIClick );

	function onToggleUIClick() {

		const elements = editor.uiState.canvas.elements || [];
		if ( elements.length === 0 ) {

			alert( 'Añade al menos un elemento UI' );
			return;

		}

		const isVisible = uiOverlay.style.display !== 'none';
		const newVisible = ! isVisible;

		// Use UIStateManager to persist visibility
		editor.uiStateManager.setOverlayVisible( newVisible );
		signals.uiOverlayToggled.dispatch( newVisible );

	}

	container.dom.appendChild( uiToggleButton );

	// Render UI elements from uiState
	function renderUIElements() {

		if ( ! uiElementsContainer ) return;

		// Clear current elements
		uiElementsContainer.innerHTML = '';

		const elements = editor.uiState.canvas.elements;
		if ( ! elements || elements.length === 0 ) return;

		// Render each element in order (z-index = array order)
		elements.forEach( function ( element ) {

			let domElement = null;

			if ( element.type === ELEMENT_TYPE.IMAGE ) {

				domElement = document.createElement( 'img' );
				domElement.src = element.src;
				domElement.style.objectFit = 'contain';

			} else if ( element.type === ELEMENT_TYPE.BUTTON ) {

				domElement = document.createElement( 'button' );
				domElement.textContent = element.label || 'Button';
				domElement.className = 'ui-button';
				domElement.style.pointerEvents = 'auto';

				if ( uiButtonLight ) {

					domElement.style.boxShadow = '0 0 10px #ffffff, 0 0 20px #ffffff';
					domElement.style.borderColor = '#ffffff';
					domElement.style.opacity = '0.7';

				}

				domElement.addEventListener( 'click', function () {

					handleUIButtonClick();

				} );

			}

			if ( domElement ) {

				domElement.style.position = 'absolute';
				domElement.style.left = element.x + '%';
				domElement.style.top = element.y + '%';
				domElement.style.width = element.width + '%';
				domElement.style.height = element.height + '%';
				domElement.style.pointerEvents = 'auto';

				uiElementsContainer.appendChild( domElement );

			}

		} );

	}

	// Signal listeners for UI updates
	signals.uiElementTransformed.add( function () {

		renderUIElements();

		// Remove light if no buttons exist
		const elements = editor.uiState.canvas.elements || [];
		const hasButton = elements.some( function ( el ) {

			return el.type === ELEMENT_TYPE.BUTTON;

		} );

		if ( ! hasButton && uiButtonLight ) {

			if ( uiButtonAnimationId ) {

				cancelAnimationFrame( uiButtonAnimationId );
				uiButtonAnimationId = null;

			}

			editor.scene.remove( uiButtonLight );
			uiButtonLight = null;
			render();

		}

		// Auto-close overlay when all elements are deleted
		if ( elements.length === 0 && editor.uiState.canvas.overlayVisible ) {

			editor.uiStateManager.setOverlayVisible( false );
			signals.uiOverlayToggled.dispatch( false );

		}

	} );

	signals.uiOverlayToggled.add( function ( visible ) {

		if ( uiOverlay ) {

			uiOverlay.style.display = visible ? 'block' : 'none';

		}

	} );

	// UI Button Event (T-033 to T-040): DirectionalLight with color animation
	let uiButtonLight = null;
	let uiButtonAnimationId = null;
	let uiButtonClock = null;
	let uiButtonRandomOrder = [];

	function handleUIButtonClick() {

		if ( uiButtonLight ) {

			// Remove existing light
			if ( uiButtonAnimationId ) {

				cancelAnimationFrame( uiButtonAnimationId );
				uiButtonAnimationId = null;

			}

			editor.scene.remove( uiButtonLight );
			uiButtonLight = null;
			render();
			renderUIElements();

		} else {

			// Create new DirectionalLight
			uiButtonLight = new THREE.DirectionalLight( UI_BUTTON_COLORS[ 0 ], 2 );
			uiButtonLight.name = 'UIButtonLight';
			uiButtonLight.position.set( 5, 10, 7.5 );
			editor.scene.add( uiButtonLight );

			// Generate random color order (Red, Green, Blue in random sequence)
			uiButtonRandomOrder = [ ...UI_BUTTON_COLORS ];

			for ( let i = uiButtonRandomOrder.length - 1; i > 0; i -- ) {

				const j = Math.floor( Math.random() * ( i + 1 ) );
				[ uiButtonRandomOrder[ i ], uiButtonRandomOrder[ j ] ] =
					[ uiButtonRandomOrder[ j ], uiButtonRandomOrder[ i ] ];

			}

			// Start color animation with THREE.Clock
			uiButtonClock = new THREE.Clock();
			animateUIButtonLight();
			renderUIElements();

		}

	}

	function animateUIButtonLight() {

		if ( ! uiButtonLight ) return;

		const elapsed = uiButtonClock.getElapsedTime();
		const colorDuration = 1 / 3; // 333ms per color (1 second total)
		const colorIndex = Math.floor( elapsed / colorDuration ) % 3;
		uiButtonLight.color.setHex( uiButtonRandomOrder[ colorIndex ] );

		render();
		uiButtonAnimationId = requestAnimationFrame( animateUIButtonLight );

	}

	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new ViewportControls( editor ) );
	container.add( new ViewportInfo( editor ) );

	//

	let renderer = null;
	let pmremGenerator = null;
	let pathtracer = null;

	const camera = editor.camera;
	const scene = editor.scene;
	const sceneHelpers = editor.sceneHelpers;

	// helpers

	const GRID_COLORS_LIGHT = [ 0x999999, 0x777777 ];
	const GRID_COLORS_DARK = [ 0x555555, 0x888888 ];

	const grid = new THREE.Group();

	const grid1 = new THREE.GridHelper( 30, 30 );
	grid1.material.color.setHex( GRID_COLORS_LIGHT[ 0 ] );
	grid1.material.vertexColors = false;
	grid.add( grid1 );

	const grid2 = new THREE.GridHelper( 30, 6 );
	grid2.material.color.setHex( GRID_COLORS_LIGHT[ 1 ] );
	grid2.material.vertexColors = false;
	grid.add( grid2 );

	const viewHelper = new ViewHelper( camera, container );

	//

	const box = new THREE.Box3();

	const selectionBox = new THREE.Box3Helper( box );
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	let objectPositionOnDown = null;
	let objectRotationOnDown = null;
	let objectScaleOnDown = null;
	let transformControlsDragging = false;

	const transformControls = new TransformControls( camera );
	transformControls.addEventListener( 'axis-changed', function () {

		if ( editor.viewportShading !== 'realistic' ) render();

	} );
	transformControls.addEventListener( 'objectChange', function () {

		signals.objectChanged.dispatch( transformControls.object );

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		const object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;
		transformControlsDragging = true;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		const object = transformControls.object;

		transformControlsDragging = false;

		if ( object !== undefined ) {

			switch ( transformControls.getMode() ) {

				case 'translate':

					if ( ! objectPositionOnDown.equals( object.position ) ) {

						editor.execute( new SetPositionCommand( editor, object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

						editor.execute( new SetRotationCommand( editor, object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if ( ! objectScaleOnDown.equals( object.scale ) ) {

						editor.execute( new SetScaleCommand( editor, object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}

		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls.getHelper() );

	//

	const xr = new XR( editor, transformControls ); // eslint-disable-line no-unused-vars

	// events

	function updateAspectRatio() {

		for ( const uuid in editor.cameras ) {

			const camera = editor.cameras[ uuid ];

			const aspect = container.dom.offsetWidth / container.dom.offsetHeight;

			if ( camera.isPerspectiveCamera ) {

				camera.aspect = aspect;

			} else {

				camera.left = - aspect;
				camera.right = aspect;

			}

			camera.updateProjectionMatrix();

			const cameraHelper = editor.helpers[ camera.id ];
			if ( cameraHelper ) cameraHelper.update();

		}

	}

	const onDownPosition = new THREE.Vector2();
	const onUpPosition = new THREE.Vector2();
	const onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		const rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			const intersects = selector.getPointerIntersects( onUpPosition, camera );
			signals.intersectionsDetected.dispatch( intersects );

			render();

		}

	}

	function onMouseDown( event ) {

		// event.preventDefault();

		if ( event.target !== renderer.domElement ) return;

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp );

	}

	function onMouseUp( event ) {

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp );

	}

	function onTouchStart( event ) {

		const touch = event.changedTouches[ 0 ];

		const array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd );

	}

	function onTouchEnd( event ) {

		const touch = event.changedTouches[ 0 ];

		const array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd );

	}

	function onDoubleClick( event ) {

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		const intersects = selector.getPointerIntersects( onDoubleClickPosition, camera );

		if ( intersects.length > 0 ) {

			const intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown );
	container.dom.addEventListener( 'touchstart', onTouchStart, { passive: false } );
	container.dom.addEventListener( 'dblclick', onDoubleClick );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	const controls = new EditorControls( camera );
	controls.addEventListener( 'change', function () {

		signals.cameraChanged.dispatch( camera );
		signals.refreshSidebarObject3D.dispatch( camera );

	} );
	viewHelper.center = controls.center;

	editor.controls = controls;

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		if ( pathtracer ) pathtracer.reset();

		initPT();

		signals.sceneEnvironmentChanged.dispatch( editor.environmentType );

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

		render();

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

		render();

	} );

	signals.rendererUpdated.add( function () {

		scene.traverse( function ( child ) {

			if ( child.material !== undefined ) {

				child.material.needsUpdate = true;

			}

		} );

		render();

	} );

	signals.rendererCreated.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			renderer.setAnimationLoop( null );

			try {

				pmremGenerator.dispose();

			} catch ( e ) {

				console.warn( 'PMREMGenerator dispose error:', e );

			}

			renderer.dispose();

			container.dom.removeChild( renderer.domElement );

		}

		controls.connect( newRenderer.domElement );
		transformControls.connect( newRenderer.domElement );

		renderer = newRenderer;

		renderer.setAnimationLoop( animate );
		renderer.setClearColor( 0xaaaaaa );

		if ( window.matchMedia ) {

			const mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
			mediaQuery.addEventListener( 'change', function ( event ) {

				renderer.setClearColor( event.matches ? 0x333333 : 0xaaaaaa );
				updateGridColors( grid1, grid2, event.matches ? GRID_COLORS_DARK : GRID_COLORS_LIGHT );

				render();

			} );

			renderer.setClearColor( mediaQuery.matches ? 0x333333 : 0xaaaaaa );
			updateGridColors( grid1, grid2, mediaQuery.matches ? GRID_COLORS_DARK : GRID_COLORS_LIGHT );

		}

		renderer.getClearColor( editor.viewportColor );

		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		if ( renderer.isWebGLRenderer ) {

			pmremGenerator = new THREE.PMREMGenerator( renderer );
			pmremGenerator.compileEquirectangularShader();

			pathtracer = new ViewportPathtracer( renderer );

		} else {

			pmremGenerator = new PMREMGenerator( renderer );

			pathtracer = null;

		}

		container.dom.appendChild( renderer.domElement );

		signals.sceneEnvironmentChanged.dispatch( editor.environmentType );

		render();

	} );

	signals.rendererDetectKTX2Support.add( function ( ktx2Loader ) {

		ktx2Loader.detectSupport( renderer );

	} );

	signals.sceneGraphChanged.add( function () {

		initPT();
		render();

	} );

	signals.cameraChanged.add( function () {

		if ( pathtracer ) pathtracer.reset();

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null && object !== scene && object !== camera ) {

			box.setFromObject( object, true );

			if ( box.isEmpty() === false ) {

				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			box.setFromObject( object, true );

		}

		initPT();
		render();

	} );

	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			box.setFromObject( object, true );

		}

		if ( object.isPerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		const helper = editor.helpers[ object.id ];

		if ( helper !== undefined && helper.isSkeletonHelper !== true ) {

			helper.update();

		}

		initPT();
		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		controls.enabled = true; // see #14180

		if ( object === transformControls.object ) {

			transformControls.detach();

		}

	} );

	signals.materialChanged.add( function () {

		updatePTMaterials();
		render();

	} );

	// background

	signals.sceneBackgroundChanged.add( function ( backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture, backgroundColorSpace, backgroundBlurriness, backgroundIntensity, backgroundRotation ) {

		editor.backgroundType = backgroundType;

		scene.background = null;

		switch ( backgroundType ) {

			case 'Color':

				scene.background = new THREE.Color( backgroundColor );

				break;

			case 'Texture':

				if ( backgroundTexture ) {

					backgroundTexture.colorSpace = backgroundColorSpace;
					backgroundTexture.needsUpdate = true;

					scene.background = backgroundTexture;

				}

				break;

			case 'Equirectangular':

				if ( backgroundEquirectangularTexture ) {

					backgroundEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
					backgroundEquirectangularTexture.colorSpace = backgroundColorSpace;
					backgroundEquirectangularTexture.needsUpdate = true;

					scene.background = backgroundEquirectangularTexture;
					scene.backgroundBlurriness = backgroundBlurriness;
					scene.backgroundIntensity = backgroundIntensity;
					scene.backgroundRotation.y = backgroundRotation * THREE.MathUtils.DEG2RAD;

				}

				break;

		}

		if ( useBackgroundAsEnvironment ) {

			signals.sceneEnvironmentChanged.dispatch( editor.environmentType );

		}

		updatePTBackground();
		render();

	} );

	// environment

	let useBackgroundAsEnvironment = false;

	signals.sceneEnvironmentChanged.add( function ( environmentType, environmentEquirectangularTexture ) {

		editor.environmentType = environmentType;

		scene.environment = null;

		useBackgroundAsEnvironment = false;

		switch ( environmentType ) {

			case 'Equirectangular':

				if ( environmentEquirectangularTexture ) {

					scene.environment = environmentEquirectangularTexture;
					scene.environment.mapping = THREE.EquirectangularReflectionMapping;

				}

				break;

			case 'Default':

				useBackgroundAsEnvironment = true;

				if ( scene.background !== null ) {

					if ( scene.background.isColor ) {

						scene.environment = pmremGenerator.fromScene( new ColorEnvironment( scene.background ), 0.04 ).texture;

					} else if ( scene.background.isTexture ) {

						scene.environment = scene.background;
						scene.environment.mapping = THREE.EquirectangularReflectionMapping;
						scene.environmentRotation.y = scene.backgroundRotation.y;

					}

				} else {

					scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

				}

				break;

		}

		updatePTEnvironment();
		render();

	} );

	// fog

	signals.sceneFogChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'None':
				scene.fog = null;
				break;
			case 'Fog':
				scene.fog = new THREE.Fog( fogColor, fogNear, fogFar );
				break;
			case 'FogExp2':
				scene.fog = new THREE.FogExp2( fogColor, fogDensity );
				break;

		}

		render();

	} );

	signals.sceneFogSettingsChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'Fog':
				scene.fog.color.setHex( fogColor );
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;
				break;
			case 'FogExp2':
				scene.fog.color.setHex( fogColor );
				scene.fog.density = fogDensity;
				break;

		}

		render();

	} );

	signals.viewportCameraChanged.add( function () {

		const viewportCamera = editor.viewportCamera;

		if ( viewportCamera.isPerspectiveCamera || viewportCamera.isOrthographicCamera ) {

			updateAspectRatio();

		}

		// disable EditorControls when setting a user camera

		controls.enabled = ( viewportCamera === editor.camera );

		initPT();
		render();

	} );

	signals.viewportShadingChanged.add( function () {

		const viewportShading = editor.viewportShading;

		switch ( viewportShading ) {

			case 'realistic':
				if ( pathtracer ) pathtracer.init( scene, editor.viewportCamera );
				break;

			case 'solid':
				scene.overrideMaterial = null;
				break;

			case 'normals':
				scene.overrideMaterial = new THREE.MeshNormalMaterial();
				break;

			case 'wireframe':
				scene.overrideMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
				break;

		}

		render();

	} );

	//

	signals.windowResize.add( function () {

		updateAspectRatio();
		updateCanvasBoxSize();

		if ( renderer === null ) return;

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		if ( pathtracer ) pathtracer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		// Re-render UI elements on window resize to maintain correct positions
		renderUIElements();

		render();

	} );

	signals.showHelpersChanged.add( function ( appearanceStates ) {

		grid.visible = appearanceStates.gridHelper;

		sceneHelpers.traverse( function ( object ) {

			switch ( object.type ) {

				case 'CameraHelper':

				{

					object.visible = appearanceStates.cameraHelpers;
					break;

				}

				case 'PointLightHelper':
				case 'DirectionalLightHelper':
				case 'SpotLightHelper':
				case 'HemisphereLightHelper':

				{

					object.visible = appearanceStates.lightHelpers;
					break;

				}

				case 'SkeletonHelper':

				{

					object.visible = appearanceStates.skeletonHelpers;
					break;

				}

				default:

				{

					// not a helper, skip.

				}

			}

		} );


		render();

	} );

	signals.cameraResetted.add( updateAspectRatio );

	// animations

	let prevActionsInUse = 0;

	const timer = new THREE.Timer(); // only used for animations

	function animate() {

		timer.update();

		const mixer = editor.mixer;
		const delta = timer.getDelta();

		let needsUpdate = false;

		// Animations

		const actions = mixer.stats.actions;

		if ( actions.inUse > 0 || prevActionsInUse > 0 ) {

			prevActionsInUse = actions.inUse;

			mixer.update( delta );
			needsUpdate = true;

			if ( editor.selected !== null ) {

				editor.selected.updateWorldMatrix( false, true ); // avoid frame late effect for certain skinned meshes (e.g. Michelle.glb)
				selectionBox.box.setFromObject( editor.selected, true ); // selection box should reflect current animation state

			}

			signals.morphTargetsUpdated.dispatch();

		}

		// View Helper

		if ( viewHelper.animating === true ) {

			viewHelper.update( delta );
			needsUpdate = true;

		}

		if ( renderer.xr.isPresenting === true ) {

			needsUpdate = true;

		}

		// Animación de eventos (Rotación Horizontal y Rotación Vertical)

		scene.traverse( function ( object ) {

			if ( object.isMesh && object.userData && object.userData.activeEvent ) {

				// Solo pausar animación si el usuario está activamente transformando el objeto (arrastrando con el mouse)
				// No pausar solo por estar seleccionado
				if ( transformControlsDragging && object === transformControls.object ) return;

				const currentEvent = object.userData.activeEvent;

				if ( currentEvent === 'Ninguno' ) {

					// Restaurar valores originales si existen
					if ( object.userData.originalRotationX !== undefined ) {

						object.rotation.x = object.userData.originalRotationX;
						delete object.userData.originalRotationX;

					}

					if ( object.userData.originalRotationY !== undefined ) {

						object.rotation.y = object.userData.originalRotationY;
						delete object.userData.originalRotationY;

					}

				} else if ( currentEvent === 'Rotación Horizontal' ) {

					// Si viene de Rotación Vertical, restaurar X primero
					if ( object.userData.originalRotationX !== undefined ) {

						object.rotation.x = object.userData.originalRotationX;
						delete object.userData.originalRotationX;

					}

					// Guardar rotación Y original solo una vez
					if ( object.userData.originalRotationY === undefined ) {

						object.userData.originalRotationY = object.rotation.y;

					}

					// Rotación en eje Y (horizontal)
					object.rotation.y += delta * 2;
					needsUpdate = true;

				} else if ( currentEvent === 'Rotación Vertical' ) {

					// Si viene de Rotación Horizontal, restaurar Y primero
					if ( object.userData.originalRotationY !== undefined ) {

						object.rotation.y = object.userData.originalRotationY;
						delete object.userData.originalRotationY;

					}

					// Guardar rotación X original solo una vez
					if ( object.userData.originalRotationX === undefined ) {

						object.userData.originalRotationX = object.rotation.x;

					}

					// Rotación en eje X (vertical)
					object.rotation.x += delta * 2;
					needsUpdate = true;

				}

			}

		} );

		if ( needsUpdate === true ) render();

		updatePT();

	}

	function initPT() {

		if ( pathtracer && editor.viewportShading === 'realistic' ) {

			pathtracer.init( scene, editor.viewportCamera );

		}

	}

	function updatePTBackground() {

		if ( pathtracer && editor.viewportShading === 'realistic' ) {

			pathtracer.setBackground( scene.background, scene.backgroundBlurriness );

		}

	}

	function updatePTEnvironment() {

		if ( pathtracer && editor.viewportShading === 'realistic' ) {

			pathtracer.setEnvironment( scene.environment );

		}

	}

	function updatePTMaterials() {

		if ( pathtracer && editor.viewportShading === 'realistic' ) {

			pathtracer.updateMaterials();

		}

	}

	function updatePT() {

		if ( pathtracer && editor.viewportShading === 'realistic' ) {

			pathtracer.update();
			editor.signals.pathTracerUpdated.dispatch( pathtracer.getSamples() );

		}

	}

	//

	let startTime = 0;
	let endTime = 0;

	function render() {

		if ( renderer === null ) return;

		startTime = performance.now();

		renderer.setViewport( 0, 0, container.dom.offsetWidth, container.dom.offsetHeight );
		renderer.render( scene, editor.viewportCamera );

		if ( camera === editor.viewportCamera ) {

			renderer.autoClear = false;
			if ( grid.visible === true ) renderer.render( grid, camera );
			if ( sceneHelpers.visible === true ) renderer.render( sceneHelpers, camera );
			if ( renderer.xr.isPresenting !== true ) viewHelper.render( renderer );
			renderer.autoClear = true;

		}

		endTime = performance.now();
		editor.signals.sceneRendered.dispatch( endTime - startTime );

	}

	return container;

}

function updateGridColors( grid1, grid2, colors ) {

	grid1.material.color.setHex( colors[ 0 ] );
	grid2.material.color.setHex( colors[ 1 ] );

}

export { Viewport };
