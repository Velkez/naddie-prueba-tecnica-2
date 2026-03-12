import * as THREE from 'three';

import { UIPanel, UIRow } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

import { createImageElement, createButtonElement, ELEMENT_TYPE } from './UIConstants.js';

function MenubarAdd( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/add' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Group

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/group' ) );
	option.onClick( function () {

		const mesh = new THREE.Group();
		mesh.name = 'Group';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Mesh

	const meshSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/mesh' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	meshSubmenuTitle.onMouseOver( function () {

		const { top, right } = meshSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );
		meshSubmenu.setLeft( right + 'px' );
		meshSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		meshSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		meshSubmenu.setDisplay( 'block' );

	} );
	meshSubmenuTitle.onMouseOut( function () {

		meshSubmenu.setDisplay( 'none' );

	} );
	options.add( meshSubmenuTitle );

	const meshSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	meshSubmenuTitle.add( meshSubmenu );

	// Mesh / Box

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/box' ) );
	option.onClick( function () {

		const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Box';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Capsule

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/capsule' ) );
	option.onClick( function () {

		const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8, 1 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Capsule';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Circle

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/circle' ) );
	option.onClick( function () {

		const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Circle';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Cylinder

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/cylinder' ) );
	option.onClick( function () {

		const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Cylinder';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Dodecahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/dodecahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.DodecahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Dodecahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Icosahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/icosahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.IcosahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Icosahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Lathe

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/lathe' ) );
	option.onClick( function () {

		const geometry = new THREE.LatheGeometry();
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
		mesh.name = 'Lathe';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Octahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/octahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.OctahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Octahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Plane

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/plane' ) );
	option.onClick( function () {

		const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Ring

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/ring' ) );
	option.onClick( function () {

		const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Ring';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Sphere

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/sphere' ) );
	option.onClick( function () {

		const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Sphere';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Sprite

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/sprite' ) );
	option.onClick( function () {

		const sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite';

		editor.execute( new AddObjectCommand( editor, sprite ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Tetrahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/tetrahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.TetrahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tetrahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Torus

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/torus' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Torus';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / TorusKnot

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/torusknot' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'TorusKnot';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Tube

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/tube' ) );
	option.onClick( function () {

		const path = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 2, 2, - 2 ),
			new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
			new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
			new THREE.Vector3( - 2, 2, 2 )
		] );

		const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tube';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Light

	const lightSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/light' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	lightSubmenuTitle.onMouseOver( function () {

		const { top, right } = lightSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		lightSubmenu.setLeft( right + 'px' );
		lightSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		lightSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		lightSubmenu.setDisplay( 'block' );

	} );
	lightSubmenuTitle.onMouseOut( function () {

		lightSubmenu.setDisplay( 'none' );

	} );
	options.add( lightSubmenuTitle );

	const lightSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	lightSubmenuTitle.add( lightSubmenu );

	// Light / Ambient

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/ambient' ) );
	option.onClick( function () {

		const color = 0x222222;

		const light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Directional

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/directional' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;

		const light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight';
		light.target.name = 'DirectionalLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Hemisphere

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/hemisphere' ) );
	option.onClick( function () {

		const skyColor = 0x00aaff;
		const groundColor = 0xffaa00;
		const intensity = 1;

		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight';

		light.position.set( 0, 10, 0 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Point

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/point' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;

		const light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Spot

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/spot' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;
		const angle = Math.PI * 0.1;
		const penumbra = 0;

		const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
		light.name = 'SpotLight';
		light.target.name = 'SpotLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Camera

	const cameraSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/camera' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	cameraSubmenuTitle.onMouseOver( function () {

		const { top, right } = cameraSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		cameraSubmenu.setLeft( right + 'px' );
		cameraSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		cameraSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		cameraSubmenu.setDisplay( 'block' );

	} );
	cameraSubmenuTitle.onMouseOut( function () {

		cameraSubmenu.setDisplay( 'none' );

	} );
	options.add( cameraSubmenuTitle );

	const cameraSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	cameraSubmenuTitle.add( cameraSubmenu );

	// Camera / Orthographic

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/camera/orthographic' ) );
	option.onClick( function () {

		const aspect = editor.camera.aspect;
		const camera = new THREE.OrthographicCamera( - aspect, aspect );
		camera.name = 'OrthographicCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	cameraSubmenu.add( option );

	// Camera / Perspective

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/camera/perspective' ) );
	option.onClick( function () {

		const camera = new THREE.PerspectiveCamera();
		camera.name = 'PerspectiveCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	cameraSubmenu.add( option );

	// UI

	const uiSubmenuTitle = new UIRow().setTextContent( 'UI' ).addClass( 'option' ).addClass( 'submenu-title' );
	uiSubmenuTitle.onMouseOver( function () {

		const { top, right } = uiSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		uiSubmenu.setLeft( right + 'px' );
		uiSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		uiSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		uiSubmenu.setDisplay( 'block' );

	} );
	uiSubmenuTitle.onMouseOut( function () {

		uiSubmenu.setDisplay( 'none' );

	} );
	options.add( uiSubmenuTitle );

	const uiSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	uiSubmenuTitle.add( uiSubmenu );

	// UI / Imagen
	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/other/imagen' ) );
	option.onClick( function () {

		// Create hidden file input
		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.style.display = 'none';
		document.body.appendChild( fileInput );

		fileInput.addEventListener( 'change', function ( e ) {

			const file = e.target.files[ 0 ];
			if ( ! file ) {

				document.body.removeChild( fileInput );
				return;

			}

			const validMimeTypes = [ 'image/jpeg', 'image/png', 'image/webp', 'image/gif' ];
			if ( ! validMimeTypes.includes( file.type ) ) {

				alert( 'Invalid image format. Supported formats: JPEG, PNG, WebP, GIF' );
				document.body.removeChild( fileInput );
				return;

			}

			// Convert to base64
			const reader = new FileReader();
			reader.onload = function ( event ) {

				const base64 = event.target.result;

				// Create element using helper function
				const newElement = createImageElement( base64, file.name );

				editor.uiState.canvas.elements.push( newElement );
				editor.signals.uiElementTransformed.dispatch();

				document.body.removeChild( fileInput );

			};

			reader.readAsDataURL( file );

		} );

		fileInput.click();

	} );
	uiSubmenu.add( option );

	// UI / Boton
	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/other/boton' ) );
	option.onClick( function () {

		const existingButton = editor.uiState.canvas.elements.find( element => element.type === ELEMENT_TYPE.BUTTON );

		if ( existingButton ) {

			alert( 'Solo se permite un boton de evento' );
			return;

		}

		const buttonCount = editor.uiState.canvas.elements.filter( element => element.type === ELEMENT_TYPE.BUTTON ).length;
		const buttonNumber = buttonCount + 1;

		// Create element using helper function
		const newElement = createButtonElement( buttonNumber );

		editor.uiState.canvas.elements.push( newElement );
		editor.signals.uiElementTransformed.dispatch();

	} );
	uiSubmenu.add( option );

	// Other

	const otherSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/other' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	otherSubmenuTitle.onMouseOver( function () {

		const { top, right } = otherSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		otherSubmenu.setLeft( right + 'px' );
		otherSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		otherSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		otherSubmenu.setDisplay( 'block' );

	} );
	otherSubmenuTitle.onMouseOut( function () {

		otherSubmenu.setDisplay( 'none' );

	} );
	options.add( otherSubmenuTitle );

	const otherSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	otherSubmenuTitle.add( otherSubmenu );

	// Other / Evento

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/other/evento' ) );
	option.onClick( function () {

		if ( editor.selected === null || ! editor.selected.isMesh ) {

			alert( 'Please select a mesh first' );

		} else {

			editor.selected.userData.activeEvent = 'Ninguno';
			editor.signals.objectChanged.dispatch( editor.selected );

		}

	} );
	otherSubmenu.add( option );

	// Other / Imagen (añade un plano con imagen)

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/other/imagen' ) );
	option.onClick( function () {

		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = 'image/jpeg,image/png,image/webp';
		fileInput.style.display = 'none';
		document.body.appendChild( fileInput );

		fileInput.addEventListener( 'change', function ( e ) {

			const file = e.target.files[ 0 ];
			if ( ! file ) {

				document.body.removeChild( fileInput );
				return;

			}

			const validTypes = [ 'image/jpeg', 'image/png', 'image/webp' ];
			if ( ! validTypes.includes( file.type ) ) {

				alert( 'Please select a JPG, PNG or WebP image.' );
				document.body.removeChild( fileInput );
				return;

			}

			const imageUrl = URL.createObjectURL( file );
			const image = new Image();
			image.onload = function () {

				const loader = new THREE.TextureLoader();
				const texture = loader.load( imageUrl );
				texture.colorSpace = THREE.SRGBColorSpace;

				const aspectRatio = image.width / image.height;
				let width = 1;
				let height = 1;

				if ( aspectRatio > 1 ) {

					height = 1 / aspectRatio;

				} else {

					width = aspectRatio;

				}

				const geometry = new THREE.PlaneGeometry( width, height );
				const material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide, transparent: true, opacity: 1 } );
				const mesh = new THREE.Mesh( geometry, material );

				if ( editor.imageCount === undefined ) {

					editor.imageCount = 0;

				}

				editor.imageCount ++;
				mesh.name = 'Imagen ' + editor.imageCount;

				mesh.userData.type = 'ui-image';

				editor.execute( new AddObjectCommand( editor, mesh ) );
				editor.select( mesh );

				URL.revokeObjectURL( imageUrl );
				document.body.removeChild( fileInput );

			};

			image.src = imageUrl;

		} );

		fileInput.click();

	} );
	otherSubmenu.add( option );

	return container;

}

export { MenubarAdd };
