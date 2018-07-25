/**
 * External dependencies
 */
import { castArray, first, last, every } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { cloneBlock, hasBlockSupport } from '@wordpress/blocks';
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';

const shortcuts = {
	duplicate: {
		raw: rawShortcut.primary( 'd' ),
		display: displayShortcut.primary( 'd' ),
	},
};

const withBlockSettingsActions = compose( [
	withSelect( ( select, { clientIds, rootClientId } ) => {
		const {
			getBlocksByClientId,
			getBlockIndex,
			getTemplateLock,
		} = select( 'core/editor' );

		return {
			blocks: getBlocksByClientId( clientIds ),
			index: getBlockIndex( last( castArray( clientIds ) ), rootClientId ),
			isLocked: !! getTemplateLock( rootClientId ),
			shortcuts,
		};
	} ),
	withDispatch( ( dispatch, { blocks, index, isLocked, rootClientId } ) => ( {
		onDuplicate() {
			const canDuplicate = every( blocks, ( block ) => {
				return hasBlockSupport( block.name, 'multiple', true );
			} );

			if ( isLocked || ! canDuplicate ) {
				return;
			}

			const clonedBlocks = blocks.map( ( block ) => cloneBlock( block ) );
			dispatch( 'core/editor' ).insertBlocks(
				clonedBlocks,
				index + 1,
				rootClientId
			);
			if ( clonedBlocks.length > 1 ) {
				dispatch( 'core/editor' ).multiSelect(
					first( clonedBlocks ).clientId,
					last( clonedBlocks ).clientId
				);
			}
		},
	} ) ),
] );

export default withBlockSettingsActions;
