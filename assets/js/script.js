/* global immltRestaurantUid */
/* global ommltAdditives */
/* global ommltAllergens */
/* global ommltCTMenuData */
/* global ommltCollectionsData */
/* global ommltCurrentDate */
/* global ommltError */
/* global ommltPowered */
/* global smmltCARD_TYPE_MENUS */
/* global smmltDEFAULT_LANG */
/* global smmltENTRY_IMAGES_PATH */
/* global smmltENTRY_TYPE_BUSINESS_LUNCH */
/* global smmltENTRY_TYPE_DRINK */
/* global smmltENTRY_TYPE_ENTRY_IMAGES */
/* global smmltENTRY_TYPE_HEADING */
/* global smmltENTRY_TYPE_HEADING2 */
/* global smmltENTRY_TYPE_INFO1 */
/* global smmltENTRY_TYPE_INFO2 */
/* global smmltENTRY_TYPE_MENU */
/* global smmltMENU_TYPE_DAY */

function cmmltProcessor(
	oTranslations,
	sLangKey,
	bPowered
) {
	var oGlobaljQuery        = $;
	var self                 = this;
	this.$                   = oGlobaljQuery;
	this.bAllergensTest      = 0;
	this.sPayloadClass       = 'mmltPayload';
	this.iCollectionCategory = null;
	this.sLangKey            = sLangKey;
	this.bPowered            = bPowered;
	this.oTranslations       = oTranslations;

	this.fSetjQuery = function(jQuery) {
		$ = jQuery;
	};//this.fSetjQuery = function()

	this.fPadNumber = function(sNumber, iCount, sPadding) {
		sPadding      += '';
		sNumber       += '';
		var sPadPrefix = '';
		while((sNumber.length + sPadPrefix.length) < iCount) {
			sPadPrefix += sPadding;
		}
		return sPadPrefix + sNumber;
	};//this.fPadNumber = function()

	this.fGetCalendarWeek = function(oDate) {
		var oFirstJan = new Date(oDate.getFullYear(), 0, 1);
		return Math.ceil((((oDate - oFirstJan) / 86400000) + oFirstJan.getDay() + 1) / 7);
	};//this.fGetCalendarWeek = function()

	this.fHasId = function(sIdList, sId) {
		if ((sId == '') || (sIdList == '')) {
			return 0;
		}
		sIdList = ',' + sIdList + ',';
		if (sIdList.indexOf(',' + sId + ',') > -1) {
			return 1;
		}
		return 0;
	};//this.fHasId = function()

	this.fHtmlEntityEncode = function(sString) {
		var oDiv = $('<d' + 'iv></d' + 'iv>');
		$(oDiv).text(sString);
		return $(oDiv).html();
	};//this.fHtmlEntityEncode = function()

	/**
	 * The keys inside oDataFields correspond to properties inside oDataItem, that
	 * should be filled inside oDomElement
	 *
	 * String values are interpreted as css classes of elements inside oDomElement, that
	 * should be filled with data belonging to the key inside oDataItem
	 *
	 * object values inside oDataFields must have at least a sCssClass property
	 * which indicates the element inside oDomElement which should be filled with the data
	 * besides the sCssClass there are two optional properties (both functions accepting
	 * a string parameter) for
	 * - preprocessing the data value (before html entities encoding) and
	 * - postprocessing the data value (after html entities encoding)
	 *
	 * Here's an example with all the possibilities:
	 * var oDataFields = {
	 *	"sTitle":  "mmltTitle", // (fills element with class mmltTitle inside oDomElement with sTitle property inside oDataItem)
	 *	"sAmount": {
	 *		"sCssClass": "mmltAmount", // required (fills element with class mmltAmount inside oDomElement with sAmount property inside oDataItem)
	 *		"fPreprocess": function(sString) { // optional
	 *			return sString.replace('.', ',');
	 *		},
	 *		"fPostprocess": function(sString) { // optional
	 *			// do something with the string and return it
	 *			return sString;
	 *		}
	 *	}
	 * }
	 *
	 * @param {object} oDataItem         contains data which should be filled into oDomElement
	 * @param {object} oDomElement       DOM-parent which should be filled with data
	 * @param {object} oDataFields       setup for fields, that should be filled (contents see above)
	 */
	this.fFillStringDataFields = function(oDataItem, oDomElement, oDataFields) {
		$.each(oDataFields, function(sParamName, xParamSettings) {
			var sCssClass      = '';
			var fPreprocess    = null;
			var fPostprocess   = null;
			var oTextContainer = null;
			var sParamValue    = '';
			if (typeof(xParamSettings) == 'string') {
				sCssClass = xParamSettings;
			} else {
				sCssClass    = xParamSettings['sCssClass'];
				fPreprocess  = xParamSettings['fPreprocess'];
				fPostprocess = xParamSettings['fPostprocess'];
			}
			if ($('.' + sCssClass, oDomElement).length > 0) {
				oTextContainer = $('.' + sCssClass, oDomElement);
			} else if ($(oDomElement).hasClass(sCssClass)) {
				oTextContainer = oDomElement;
			} else {
				return true;
			}
			if (typeof(oDataItem[sParamName]) != 'undefined') {
				sParamValue = oDataItem[sParamName];
			} else if (typeof(oDataItem) == 'string') {
				sParamValue = oDataItem;
			}

			if (typeof(fPreprocess) == 'function') {
				sParamValue = fPreprocess(sParamValue);
			}
			sParamValue = self.fHtmlEntityEncode(sParamValue);

			if (typeof(fPostprocess) == 'function') {
				sParamValue = fPostprocess(sParamValue);
			}
			$(oTextContainer).html(sParamValue);
		});
	};//this.fFillStringDataFields = function()

	this.fSetupAdditAllerg = function(sAllAdditives, sAllAllergens, oParent) {
		var aAdditAllergens = {
			'mmltAllergens': {
				'sSelectedList': sAllAllergens,
				'oListData':     ommltAllergens
			},
			'mmltAdditives': {
				'sSelectedList': sAllAdditives,
				'oListData':     ommltAdditives
			}
		};
		var bFiltersShown = 0;
		$.each(aAdditAllergens, function (sClassPrefix, oData) {
			sClassPrefix         = sClassPrefix.toString();
			var oFilterContainer = $('.' + sClassPrefix + 'Filters', oParent)[0];
			var bFiltersExist    = 0;
			var sSelectedList    = oData['sSelectedList'];
			if (sSelectedList == '') {
				return true;
			}
			$.each(oData['oListData'], function(sCatId, oCatData) {
				if (sSelectedList.indexOf(',' + sCatId + ',') <= -1) {
					return true;
				}

				bFiltersExist = 1;
				$('.mmltAdditAllergButton', oParent).show();
				// this item is contained inside sSelectedList, append the filter
				var oFilterClone = $('.mmlt-templates .mmltFilter').clone();
				$('.catSelector', oFilterClone).attr('cat_id', sCatId);
				$('.title', oFilterClone)
					.attr('title', oCatData['oTranslations'][self.sLangKey]['sTitle'])
					.html(
						oCatData['sNumber'] + ')&nbsp;' +
						self.fHtmlEntityEncode(oCatData['oTranslations'][self.sLangKey]['sTitle'])
					)
				;
				$(oFilterContainer).append(oFilterClone);
			});

			if (bFiltersExist) {
				$('.filtersSelector.' + sClassPrefix, oParent).show();
				if (!bFiltersShown) {
					bFiltersShown = 1;
					$('.filtersSelector.' + sClassPrefix, oParent).addClass('active');
					$('.menuFilters.' + sClassPrefix + 'Filters', oParent).show();
				}
			}
		});
	};//this.fSetupAdditAllerg = function()

	this.fFilterBy = function(oElement) {
		self.fSetjQuery(jQuery);
		var oFiltersContainer = $(oElement).parents('.mmltAdditAllergFiltersContainer');
		var oParent           = $(oElement).parents('.mmltParent')[0];
		var aFilterTypes      = [
			'mmltAdditives',
			'mmltAllergens'
		];
		$('.filterable', oParent).each(function () {
			var oMenu       = this;
			var bIsFiltered = 0;

			// first unfilter that filterable element
			$(oMenu).removeClass('filtered');

			$.each(aFilterTypes, function () {
				var sFilterType = this.toString();
				if (bIsFiltered) {
					// menu is already filtered
					// => no need to check further
					return false;
				}

				// check if menu is filtered by that filter type
				$('.' + sFilterType + 'Filters .catSelector', oFiltersContainer).each(function() {
					if ($(this)[0].checked) {
						return true;
					}

					var sCatSearch = ',' + $(this).attr('cat_id') + ',';
					if ($(oMenu).attr(sFilterType).indexOf(sCatSearch) > -1) {
						bIsFiltered = 1;
						return false;
					}
				});
			});

			if (bIsFiltered) {
				$(oMenu).addClass('filtered');
			}
		});
	};//this.fFilterBy = function()

	this.fToggleAdditAllergFiltersContainer = function(oElement) {
		self.fSetjQuery(jQuery);
		var oParent = $(oElement).parents('.mmltParent')[0];
		$(
			'.mmltBlMenu .mmltAdditives,' +
			'.mmltBlMenu .mmltAllergens,' +
			'.mmltMenu   .mmltAdditives,' +
			'.mmltMenu   .mmltAllergens',
			oParent
		).show();
		$('.mmltAdditAllergFiltersContainer', oParent).slideToggle();
	};//this.fToggleAdditAllergFiltersContainer = function()

	this.fSwitchAdditAllerg = function(oElement) {
		self.fSetjQuery(jQuery);
		var oFiltersContainer   = $(oElement).parents('.mmltAdditAllergFiltersContainer');
		var sHideClass          = 'mmltAllergens';
		var sShowClass          = 'mmltAdditives';
		if ($(oElement).hasClass('mmltAllergens')) {
			sHideClass = 'mmltAdditives';
			sShowClass = 'mmltAllergens';
		}
		$('.filtersSelector', oFiltersContainer).removeClass('active');
		$(oElement).addClass('active');

		$('.' + sHideClass + 'Filters', oFiltersContainer).hide();
		$('.' + sShowClass + 'Filters', oFiltersContainer).show();
	};//this.fSwitchAdditAllerg = function()

	this.fTestAllergens = function(oMenu) {
		if (!self.bAllergensTest) {
			return;
		}
		console.error('self.bAllergensTest is active!');
		oMenu['sAllergens']      = '0,1,4,8,0';
		oMenu['sPrintAllergens'] = 'A,D,H';
		oMenu['sAdditives']      = '0,1,4,6,0';
		oMenu['sPrintAdditives'] = '1,4,6';
	};//this.fTestAllergens = function()

	this.fCreateMenu = function(oMenu, sCloneClass) {
		self.fTestAllergens(oMenu);
		var oMenuClone  = $('.mmlt-templates .' + sCloneClass).clone();
		$(oMenuClone)
			.attr('mmltAllergens', oMenu['sAllergens'])
			.attr('mmltAdditives', oMenu['sAdditives'])
		;
		var oMenuParams = {
			"sMenuName":       "mmltName",
			"sMenuDescr":      "mmltDescr"
		};
		var oNotTranslatableParams = {
			"sPrintAdditives": "mmltAdditives",
			"sPrintAllergens": "mmltAllergens"
		};
		var oPriceParams = {
			"sTitle":       "mmltTitle",
			"sAmount":      {
				"sCssClass":   "mmltAmount",
				"fPreprocess": function(sString) {
					return sString.replace('.', ',');
				}
			}
		};
		self.fFillStringDataFields(oMenu, $(oMenuClone), oNotTranslatableParams);
		var oTranslatedMenu = oMenu;
		if (self.sLangKey != smmltDEFAULT_LANG) {
			if (typeof(oMenu['oTranslations'][self.sLangKey]) != 'undefined') {
				oTranslatedMenu = oMenu['oTranslations'][self.sLangKey];
			}
		}
		self.fFillStringDataFields(oTranslatedMenu, $(oMenuClone), oMenuParams);
		$.each(oTranslatedMenu.aPrices, function() {
			var oPrice      = this;
			var oPriceClone = $('.mmlt-templates .mmltPrice').clone();
			self.fFillStringDataFields(oPrice, oPriceClone, oPriceParams);
			if (oPrice.sTitle == '') {
				$(oPriceClone).removeClass('mmlt-fc');
				$('.mmltMenuText', oMenuClone).prepend(oPriceClone);
			} else {
				$('.mmltPrices', oMenuClone).append(oPriceClone);
			}
		});
		return oMenuClone;
	};//this.fCreateMenu = function()

	this.fProcessBusinessLunch = function(oBlClone, oBusinessLunch, oMenuCopies) {
		var sAllAllergens  = '';
		var sAllAdditives  = '';
		var oBlPriceParams = {
			"sTitle":       "mmltTitle",
			"sAmount":      {
				"sCssClass":   "mmltAmount",
				"fPreprocess": function(sString) {
					return sString.replace('.', ',');
				}
			}
		};
		var oTranslatedBl = oBusinessLunch['oTranslations'][smmltDEFAULT_LANG];
		if (typeof(oBusinessLunch['oTranslations'][self.sLangKey]) != 'undefined') {
			oTranslatedBl = oBusinessLunch['oTranslations'][self.sLangKey];
		}

		if (oTranslatedBl['aPrices'].length < 1) {
			$('.mmltPrices', oBlClone).remove();
		}
		$.each(oTranslatedBl['aPrices'], function() {
			var oPrice = this;
			var oPriceClone = $('.mmlt-templates .mmltBlPrice').clone();
			self.fFillStringDataFields(oPrice, oPriceClone, oBlPriceParams);
			$('.mmltPrices', oBlClone).append(oPriceClone);
		});

		var sText = oTranslatedBl['sTitle'];
		if (sText == '') {
			$('.mmltTitle', oBlClone).remove();
			return true;
		}
		$('.mmltTitle', oBlClone).html(self.fHtmlEntityEncode(sText));

		$.each(oBusinessLunch['aCourses'], function() {
			var oCourseData      = this;
			var bFirstMenu       = 1;
			var oCourseContainer = $('.mmlt-templates .mmltBlCourseContainer').clone();
			$('.mmltMenus', oBlClone).append(oCourseContainer);
			$.each(oCourseData['aMenus'], function() {
				var sCopyRefUid = this.toString();
				var oMenu       = oMenuCopies[sCopyRefUid];
				if (!bFirstMenu) {
					$(oCourseContainer).append($('.mmlt-templates .mmltBlMenuSeparator').clone());
				}
				bFirstMenu = 0;

				var oMenuClone = self.fCreateMenu(oMenu, "mmltBlMenu");
				$(oCourseContainer).append(oMenuClone);

				if (oMenu['sAllergens'] != '0') {
					sAllAllergens += ',' + oMenu['sAllergens'];
				}
				if (oMenu['sAdditives'] != '0') {
					sAllAdditives += ',' + oMenu['sAdditives'];
				}
			});//$.each(oCourseData['aMenus'])
		});//$.each(oBusinessLunch['aCourses'])

		return {
			'sAllAllergens': sAllAllergens,
			'sAllAdditives': sAllAdditives
		};
	};//self.fProcessBusinessLunch = function()

	this.fFillLabels = function() {
		// fill all the labels
		$.each(oTranslations.oFixedStrings, function(sKey, sTranslation) {
			var oTranslationDom = $('.mmltFixed_' + sKey);
			$(oTranslationDom).html(sTranslation);
		});
	};//this.fFillLabels = function()

	this.fProcess = function() {
		self.fSetjQuery(jQuery);
		if (typeof(ommltError) != 'undefined') {
			var oClone = $('.mmlt-templates .mmltNoData').clone();
			$(oClone).html('<div style="color: red;">' + ommltError.errorDescription + '</div>');
			$('.' + self.sPayloadClass).children().hide();
			$('.' + self.sPayloadClass).append(oClone);
			return;
		}
		self.fFillLabels();

		var sAllAllergens       = '';
		var sAllAdditives       = '';
		var bDataFound          = 0;
		var oColumnContainer    = null;

		if (
			!(
				(typeof(ommltCTMenuData)                       == 'undefined') ||
				(typeof(ommltCTMenuData[smmltCARD_TYPE_MENUS]) == 'undefined') ||
				(ommltCTMenuData[smmltCARD_TYPE_MENUS].length  <= 0)
			)
		) {
			var oMenuData            = ommltCTMenuData[smmltCARD_TYPE_MENUS][0];
			var iCurrentWeekDayIndex = (ommltCurrentDate.getDay() + 6) % 7;
			if (oMenuData['iMenuType'] == smmltMENU_TYPE_DAY) {
				$('.mmltTimespan').html(
					self.fPadNumber(ommltCurrentDate.getDate(),      2, '0') + '.' +
					self.fPadNumber(ommltCurrentDate.getMonth() + 1, 2, '0') + '.' +
					self.fPadNumber(ommltCurrentDate.getFullYear(),  4, '0')
				);
			} else {
				var oFirstDate = oMenuData['aMenuDays'][oMenuData['iFirstWeekDayIndex']]['oDate'];
				var oLastDate  = oMenuData['aMenuDays'][oMenuData['iLastWeekDayIndex']]['oDate'];
				$('.mmltTimespan').html(
					self.fPadNumber(oFirstDate.getDate(),      2, '0') + '.' +
					self.fPadNumber(oFirstDate.getMonth() + 1, 2, '0') + '. - ' +
					self.fPadNumber(oLastDate.getDate(),       2, '0') + '.' +
					self.fPadNumber(oLastDate.getMonth() + 1,  2, '0') + '.' +
					self.fPadNumber(oLastDate.getFullYear(),   4, '0')
				);
			}

			if (typeof(oMenuData['oTranslations']) != 'undefined') {
				var sText = '';
				if (typeof(oMenuData['oTranslations'][self.sLangKey]) != 'undefined') {
					sText = oMenuData['oTranslations'][self.sLangKey];
				} else if (typeof(oMenuData['oTranslations'][smmltDEFAULT_LANG]) != 'undefined') {
					sText = oMenuData['oTranslations'][smmltDEFAULT_LANG];
				}
				if (sText != '') {
					bDataFound = 1;
					var oClone = $('.mmlt-templates .mmltInfo').clone();
					$(oClone).html(self.fHtmlEntityEncode(sText));
					$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oClone);
				}
			}

			if (
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_HEADING]        ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_HEADING2]       ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_INFO1]          ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_INFO2]          ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_BUSINESS_LUNCH] ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_DRINK]          ||
				oMenuData.aEntryTypesExist[smmltENTRY_TYPE_MENU]
			) {
				$.each(oMenuData['aEntries'], function() {
					var oEntry = this;
					if (
						!(
							(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH) ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)        ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)       ||
							oColumnContainer
						)
					) {
						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
					}
					if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO1)    ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO2)    ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)
					) {
						var sText  = '';
						var oClone = null;
						if (typeof(oMenuData['oHeadings'][oEntry['sData']]['oTranslations'][self.sLangKey]) != 'undefined') {
							sText = oMenuData['oHeadings'][oEntry['sData']]['oTranslations'][self.sLangKey];
						} else if (typeof(oMenuData['oHeadings'][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG]) != 'undefined') {
							sText = oMenuData['oHeadings'][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG];
						}
						if (sText != '') {
							bDataFound = 1;
						}

						if (
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)
						) {
							oClone = $('.mmlt-templates .mmltHeading').clone();
							$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oClone);

							oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
							$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
						} else {
							oClone = $('.mmlt-templates .mmltInfo').clone();
							$(oColumnContainer).append(oClone);
						}
						$(oClone).html(self.fHtmlEntityEncode(sText));
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH)
					) {
						bDataFound         = 1;
						var oBusinessLunch = oMenuData['oBusinessLunches'][oEntry['sData']];
						var oBlClone       = $('.mmlt-templates .mmltBusinessLunch').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oBlClone);
						var oAllAdditAllerg = self.fProcessBusinessLunch(oBlClone, oBusinessLunch, oMenuData['oMenuCopies']);
						sAllAllergens += ',' + oAllAdditAllerg['sAllAllergens'];
						sAllAdditives += ',' + oAllAdditAllerg['sAllAdditives'];

						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_MENU)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_DRINK)
					) {
						bDataFound     = 1;
						var oMenu      = oMenuData['oMenuCopies'][oEntry['sData']];
						var oMenuClone = self.fCreateMenu(oMenu, "mmltMenu");
						$(oColumnContainer).append(oMenuClone);

						if (oMenu['sAllergens'] != '0') {
							sAllAllergens += ',' + oMenu['sAllergens'];
						}
						if (oMenu['sAdditives'] != '0') {
							sAllAdditives += ',' + oMenu['sAdditives'];
						}
					}
				});//$.each(oMenuData['aEntries'])
			}//if (renderable items exist)

			oColumnContainer = null;
			$.each(oMenuData['aMenuDays'], function(iWeekDayIndex, oDayData) {
				if (
					!(
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_INFO1]          ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_INFO2]          ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_HEADING]        ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_HEADING2]       ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_BUSINESS_LUNCH] ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_DRINK]          ||
						oDayData.aEntryTypesExist[smmltENTRY_TYPE_MENU]
					)
				) {
					return true;
				}
				if (
					!(
						(oMenuData['iMenuType'] != smmltMENU_TYPE_DAY) ||
						(iCurrentWeekDayIndex   == iWeekDayIndex)
					)
				) {
					return true;
				}
				var oClone = $('.mmlt-templates .mmltWeekDayTitle').clone();
				$(oClone).html(self.fHtmlEntityEncode(oTranslations.aWeekDayNames[iWeekDayIndex]));
				$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oClone);

				oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
				$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);

				$.each(oDayData['aEntries'], function() {
					var oEntry = this;
					if (
						!(
							(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH) ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)        ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)       ||
							oColumnContainer
						)
					) {
						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
					}

					if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO1)    ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO2)    ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)
					) {
						var sEntryContainer = 'oHeadings';
						var sText           = '';
						var oClone          = null;
						if (typeof(oMenuData[sEntryContainer][oEntry['sData']]['oTranslations'][self.sLangKey]) != 'undefined') {
							sText = oMenuData[sEntryContainer][oEntry['sData']]['oTranslations'][self.sLangKey];
						} else if (typeof(oMenuData[sEntryContainer][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG]) != 'undefined') {
							sText = oMenuData[sEntryContainer][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG];
						}
						if (sText != '') {
							bDataFound = 1;
						}

						if (
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)
						) {
							oClone = $('.mmlt-templates .mmltHeading').clone();
							$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oClone);

							oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
							$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
						} else {
							oClone = $('.mmlt-templates .mmltInfo').clone();
							$(oColumnContainer).append(oClone);
						}
						$(oClone).html(self.fHtmlEntityEncode(sText));
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH)
					) {
						bDataFound         = 1;
						var oBusinessLunch = oMenuData['oBusinessLunches'][oEntry['sData']];
						var oBlClone       = $('.mmlt-templates .mmltBusinessLunch').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oBlClone);
						var oAllAdditAllerg = self.fProcessBusinessLunch(oBlClone, oBusinessLunch, oMenuData['oMenuCopies']);
						sAllAllergens += ',' + oAllAdditAllerg['sAllAllergens'];
						sAllAdditives += ',' + oAllAdditAllerg['sAllAdditives'];

						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass + ' .mmltLunchContainer').append(oColumnContainer);
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_MENU)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_DRINK)
					) {
						bDataFound     = 1;
						var oMenu      = oMenuData['oMenuCopies'][oEntry['sData']];
						var oMenuClone = self.fCreateMenu(oMenu, "mmltMenu");
						$(oColumnContainer).append(oMenuClone);

						if (oMenu['sAllergens'] != '0') {
							sAllAllergens += ',' + oMenu['sAllergens'];
						}
						if (oMenu['sAdditives'] != '0') {
							sAllAdditives += ',' + oMenu['sAdditives'];
						}
					}
				});//$.each(oDayData['aEntries'])
			});//$.each(oMenuData['aMenuDays'])

			$('.mmltPdfLink a').attr(
				'href',
				$('.mmltPdfLink a').attr('href').replace('restaurant_uid', immltRestaurantUid)
			);
			$('.' + self.sPayloadClass + ' .mmltLunchContainer').append($('.mmlt-templates .mmltPdfLink').clone());
		}//if (lunch menus exist)

		if (!bDataFound) {
			$('.' + self.sPayloadClass + ' .mmltLunchContainer').hide();
		}

		oColumnContainer = null;
		if (typeof(ommltCollectionsData) != 'undefined') {
			if (ommltCollectionsData['aCollections'].length > 0) {
				bDataFound = 1;
				var oClone = $('.mmlt-templates .mmltCards').clone();
				$('.' + self.sPayloadClass).append(oClone);
			}

			$.each(ommltCollectionsData['aCollections'], function() {
				var oCollection = this;
				if (self.iCollectionCategory != null) {
					if (!self.fHasId(oCollection.sCategories, self.iCollectionCategory)) {
						return true;
					}
				}

				var sText = '';
				if (typeof(oCollection['oTranslations'][self.sLangKey]) != 'undefined') {
					sText = oCollection['oTranslations'][self.sLangKey].sTitle;
				} else if (typeof(oCollection['oTranslations'][smmltDEFAULT_LANG]) != 'undefined') {
					sText = oCollection['oTranslations'][smmltDEFAULT_LANG].sTitle;
				}
				if (sText != '') {
					bDataFound = 1;
					var oClone = $('.mmlt-templates .mmltCardTitle').clone();
					$('.' + self.sPayloadClass).append(oClone);
					$(oClone).html(self.fHtmlEntityEncode(sText));
				}

				$.each(oCollection['aEntries'], function() {
					var oEntry = this;
					if (
						!(
							(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH) ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_ENTRY_IMAGES)   ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)        ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)       ||
							oColumnContainer
						)
					) {
						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass).append(oColumnContainer);
					}
					if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2) ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO1)    ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_INFO2)
					) {
						var sText  = '';
						var oClone = null;
						if (typeof(ommltCollectionsData['oInfos'][oEntry['sData']]['oTranslations'][self.sLangKey]) != 'undefined') {
							sText = ommltCollectionsData['oInfos'][oEntry['sData']]['oTranslations'][self.sLangKey];
						} else if (typeof(ommltCollectionsData['oInfos'][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG]) != 'undefined') {
							sText = ommltCollectionsData['oInfos'][oEntry['sData']]['oTranslations'][smmltDEFAULT_LANG];
						}
						if (sText != '') {
							bDataFound = 1;
						}

						if (
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING)  ||
							(oEntry['sEntryType'] == smmltENTRY_TYPE_HEADING2)
						) {
							oClone = $('.mmlt-templates .mmltHeading').clone();
							$('.' + self.sPayloadClass).append(oClone);

							oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
							$('.' + self.sPayloadClass).append(oColumnContainer);
						} else {
							oClone = $('.mmlt-templates .mmltInfo').clone();
							$(oColumnContainer).append(oClone);
						}

						$(oClone).html(self.fHtmlEntityEncode(sText));
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_BUSINESS_LUNCH)
					) {
						bDataFound         = 1;
						var oBusinessLunch = ommltCollectionsData['oBusinessLunches'][oEntry['sData']];
						var oBlClone       = $('.mmlt-templates .mmltBusinessLunch').clone();
						$('.' + self.sPayloadClass).append(oBlClone);
						var oAllAdditAllerg = self.fProcessBusinessLunch(oBlClone, oBusinessLunch, ommltCollectionsData['oMenuCopies']);
						sAllAllergens += ',' + oAllAdditAllerg['sAllAllergens'];
						sAllAdditives += ',' + oAllAdditAllerg['sAllAdditives'];

						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass).append(oColumnContainer);
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_ENTRY_IMAGES)
					) {
						bDataFound       = 1;
						var oEntryImages = ommltCollectionsData['oEntryImages'][oEntry['sData']];
						$.each(oEntryImages['aImages'], function() {
							var oImage = this;
							var oClone = $('.mmlt-templates .mmltEntryImage').clone();
							$('img', oClone).attr(
								'src',
								smmltENTRY_IMAGES_PATH + oImage['sFileName']
							);
							$('.' + self.sPayloadClass).append(oClone);
						});

						oColumnContainer = $('.mmlt-templates .mmltColumnContainer').clone();
						$('.' + self.sPayloadClass).append(oColumnContainer);
					} else if (
						(oEntry['sEntryType'] == smmltENTRY_TYPE_MENU)  ||
						(oEntry['sEntryType'] == smmltENTRY_TYPE_DRINK)
					) {
						bDataFound     = 1;
						var oMenu      = ommltCollectionsData['oMenuCopies'][oEntry['sData']];
						var oMenuClone = self.fCreateMenu(oMenu, "mmltMenu");
						$(oColumnContainer).append(oMenuClone);

						if (oMenu['sAllergens'] != '0') {
							sAllAllergens += ',' + oMenu['sAllergens'];
						}
						if (oMenu['sAdditives'] != '0') {
							sAllAdditives += ',' + oMenu['sAdditives'];
						}
					}
				});//$.each(oCollection['aEntries'])
			});//$.each(ommltCollectionsData['aCollections'])
		}//if (typeof(ommltCollectionsData) != 'undefined')

		self.fSetupAdditAllerg(sAllAdditives, sAllAllergens, null);

		if (!bDataFound) {
			$('.' + self.sPayloadClass).append($('.mmlt-templates .mmltNoData').clone());
		}

		if (self.bPowered) {
			var oPoweredClone = $('.mmlt-templates .mmltPowered').clone();
			$('a', oPoweredClone)
				.html(ommltPowered['sHostName'])
				.attr('href', ommltPowered['sPoweredLink'])
			;
			$(oPoweredClone).append(ommltPowered['sTrackingPixel']);
			$('.' + self.sPayloadClass).append(oPoweredClone);
		}
	};//this.fProcess = function()

}//function cmmltProcessor()
