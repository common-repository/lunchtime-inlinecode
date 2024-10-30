/* global tinymce */
/* global mmlt_data */

(function() {
	tinymce.create('tinymce.plugins.' + mmlt_data.constants.TMCE_PLUGIN_NAME, {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			var menu_items = [];
			for (var index = 0; index < mmlt_data.aSnippets.length; index++) {
				menu_items.push({
					text: mmlt_data.aSnippets[index].snippet_name,
					onclick: function() {
						tinymce.activeEditor.execCommand(
							'mceInsertContent',
							false,
							'[mmlt-inline-code snippet_name=' + this.settings.text + ']'
						);
					}
				});
			}
			ed.addButton(
				mmlt_data.constants.TMCE_PLUGIN_NAME,
				{
					type:  'menubutton',
					title: mmlt_data.constants.TMCE_PLUGIN_BTN_TEXT,
					image: url + '/../images/mce_button.jpg',
					menu:  menu_items
				}
			);
		},

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname:  mmlt_data.constants.PLUGIN_NAME,
				author:    mmlt_data.constants.AUTHOR,
				authorurl: mmlt_data.constants.AUTHOR_URL,
				version:   mmlt_data.constants.VERSION
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add(
		mmlt_data.constants.TMCE_PLUGIN_NAME,
		tinymce.plugins[ mmlt_data.constants.TMCE_PLUGIN_NAME ]
	);
})();