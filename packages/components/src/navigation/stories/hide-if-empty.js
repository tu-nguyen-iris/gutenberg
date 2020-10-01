/**
 * Internal dependencies
 */
import Navigation from '..';
import NavigationItem from '../item';
import NavigationMenu from '../menu';

export function HideIFEmptyStory() {
	return (
		<>
			<Navigation>
				<NavigationMenu title="Home" menu="root" isEmpty={ false }>
					<NavigationItem
						navigateToMenu="root-sub-1"
						title="To sub 1 (hidden)"
						hideIfTargetMenuEmpty
					/>

					<NavigationItem
						navigateToMenu="root-sub-2"
						title="To sub 2 (visible)"
						hideIfTargetMenuEmpty
					/>

					<NavigationItem
						navigateToMenu="root-sub-1-sub-1"
						title="To sub 1-1 (hidden)"
						hideIfTargetMenuEmpty
					/>
				</NavigationMenu>

				<NavigationMenu
					menu="root-sub-1"
					parentMenu="root"
					isEmpty={ true }
				/>
				<NavigationMenu
					menu="root-sub-2"
					parentMenu="root"
					isEmpty={ false }
				/>
				<NavigationMenu
					menu="root-sub-1-sub-1"
					parentMenu="root-sub-1"
					isEmpty={ true }
				/>
			</Navigation>

			<p>
				This story contains 3 navigation items and 4 menus. You should
				only see one item: <strong>To sub 2 (visible)</strong>
			</p>
		</>
	);
}
