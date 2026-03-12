/**
 * UIConstants - Magic numbers and constants for UI 2D System
 * Centralizes all configuration values for easy maintenance
 */

export const UI = {

	// Position constraints
	POSITION: {
		MIN: 0,
		MAX: 100,
		STEP: 0.5
	},

	// Element size constraints
	SIZE: {
		MIN: 5,
		DEFAULT_IMAGE_WIDTH: 20,
		DEFAULT_IMAGE_HEIGHT: 20,
		DEFAULT_BUTTON_WIDTH: 15,
		DEFAULT_BUTTON_HEIGHT: 5,
		DEFAULT_X: 10,
		DEFAULT_Y: 10
	},

	// Hit area padding for element selection (percentage)
	HIT_PADDING: 3,

	// Canvas aspect ratio
	ASPECT_RATIO: '4/3',

	// Overlay defaults
	OVERLAY: {
		WIDTH_PERCENT: '50%',
		MAX_HEIGHT_PERCENT: '50%',
		Z_INDEX: 1000
	},

	// Animation timing
	ANIMATION: {
		COLOR_DURATION: 1 / 3 // 333ms per color (1 second total)
	}
};

/**
 * Predefined colors for button light animation
 */
export const UI_BUTTON_COLORS = [
	0xff0000, // Red
	0x00ff00, // Green
	0x0000ff // Blue
];

/**
 * Element type identifiers
 */
export const ELEMENT_TYPE = {
	IMAGE: 'image',
	BUTTON: 'button'
};

/**
 * Generate unique element ID
 * @param {string} type - Element type ('image' or 'button')
 * @return {string} Unique ID
 */
export function generateElementId( type ) {

	return type + '_' + Date.now();

}

/**
 * Validate element has required properties
 * @param {Object} element - Element to validate
 * @return {boolean} True if valid
 */
export function isValidElement( element ) {

	return element &&
		element.id &&
		element.type &&
		( element.type === 'image' || element.type === 'button' ) &&
		typeof element.x === 'number' &&
		typeof element.y === 'number' &&
		typeof element.width === 'number' &&
		typeof element.height === 'number';

}

/**
 * Create new image element
 * @param {string} src - Image source (base64)
 * @param {string} name - Element name
 * @return {Object} New element object
 */
export function createImageElement( src, name ) {

	return {
		id: generateElementId( 'img' ),
		type: ELEMENT_TYPE.IMAGE,
		x: UI.SIZE.DEFAULT_X,
		y: UI.SIZE.DEFAULT_Y,
		width: UI.SIZE.DEFAULT_IMAGE_WIDTH,
		height: UI.SIZE.DEFAULT_IMAGE_HEIGHT,
		src: src,
		name: name
	};

}

/**
 * Create new button element
 * @param {number} buttonNumber - Button number for naming
 * @return {Object} New element object
 */
export function createButtonElement( buttonNumber ) {

	return {
		id: generateElementId( 'btn' ),
		type: ELEMENT_TYPE.BUTTON,
		x: UI.SIZE.DEFAULT_X,
		y: UI.SIZE.DEFAULT_Y,
		width: UI.SIZE.DEFAULT_BUTTON_WIDTH,
		height: UI.SIZE.DEFAULT_BUTTON_HEIGHT,
		name: 'Button ' + buttonNumber
	};

}
