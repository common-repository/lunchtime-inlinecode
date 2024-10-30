<?php
	defined('ABSPATH') or die('No script kiddies please!');
?>
<!--
	### mmltMark Templates ###
-->
<div class="mmlt-templates">
	<div class="mmltPowered">
		powered by
		<a href="poweredLink" target="_blank"
		>powered host</a
		>
	</div>
	<div class="mmltNoData translatable mmltLabel mmltFixed_noData">
	</div>

	<div class="mmltPdfLink translatable">
		<a
			class="mmltLabel mmltFixed_downloadPdf"
			href="http://www.lunchtime.de/pdf/Speisekarte_restaurant_uid.pdf"
			></a
		>
	</div>

	<div class="mmltCards translatable mmltLabel mmltFixed_menus">
	</div>

	<div class="mmltWeekDayTitle translatable mmltLabel">
		Montag
	</div>

	<label onclick="ommltProcessor.fFilterBy(this);" class="cursorDefault mmltFilter">
		<input type="checkbox" cat_id="CAT_ID" checked="checked" class="catSelector">&nbsp;
		<span class="translatable mmltLabel">
			<span class="title" title="DE_TITLE">
				DE_TITLE
			</span>
		</span>
	</label>

	<div class="mmltHeading mmltCardTitle translatable mmltLabel">
		title
	</div>

	<div class="mmltInfo translatable mmltLabel">
		info
	</div>

	<div class="mmltColumnContainer">
	</div>

	<div class="mmltEntryImage">
		<img />
	</div>

	<div class="mmltMenu filterable translatable mmlt-fc mmltLabel" mmltallergens="0" mmltadditives="0">
		<div class="mmltMenuText">
			<span class="mmltName">
				menu name
			</span>
			<span class="mmltDescr">
				menu description
			</span>
			<span class="mmltAdditives">&nbsp;</span>
			<span class="mmltAllergens">&nbsp;</span>
		</div>
		<div class="mmltPrices">
		</div>
	</div>

	<div class="mmltPrice mmlt-fc">
		<div class="mmltAmountBlock">
			<span class="mmltAmount">
				1,00
			</span>
			<span class="mmltCurrency">
				€
			</span>
		</div>
		<span class="mmltTitle">
			100 gr.
		</span>
	</div>

	<div class="mmltBusinessLunch">
		<div class="mmltTitle translatable mmltLabel">
			BlTitle
		</div>
		<div class="mmltMenus">
		</div>
		<div class="mmltPrices translatable mmltLabel">
		</div>
	</div>

	<div class="mmltBlCourseContainer">
	</div>

	<div class="mmltBlMenu filterable translatable mmltLabel" mltallergens="0" mltadditives="0">
		<span class="mmltName">
			mmltMenuName
		</span>
		<span class="mmltDescr">
			menu description
		</span>
		<span class="mmltAdditives">&nbsp;</span>
		<span class="mmltAllergens">&nbsp;</span>
	</div>

	<div class="mmltBlMenuSeparator translatable mmltLabel mmltFixed_or">
	</div>

	<div class="mmltBlPrice">
		<span class="mmltTitle">
			price title
		</span>
		<span class="mmltCurrency">
			€
		</span>
		<span class="mmltAmount">
			75
		</span>
	</div>

</div>