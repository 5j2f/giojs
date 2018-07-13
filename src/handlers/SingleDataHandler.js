import { CountryData } from "../countryInfo/CountryData.js";
import { Utils } from "../utils/Utils.js";

function SingleDataHandler(controller) {

	function createMentionedCountries() {

		var inputData = controller.inputData;

		for ( var i in inputData ) {

			var dataSet = inputData[ i ];

			if (CountryData[ dataSet.i ] === undefined) {
				return;
			}

			if (CountryData[ dataSet.e ] === undefined) {
				return;
			}

			var importCountryCode = CountryData[ dataSet.i ].colorCode;
			var exportCountryCode = CountryData[ dataSet.e ].colorCode;

			// add mentioned color to controller's mentionedCountryCodes ( an array to store the code )

			if ( controller.mentionedCountryCodes.indexOf( importCountryCode ) === - 1 ) {

				controller.mentionedCountryCodes.push( importCountryCode );

			}

			if ( controller.mentionedCountryCodes.indexOf( exportCountryCode ) === - 1 ) {

				controller.mentionedCountryCodes.push( exportCountryCode );

			}

		}


	}

	function flattenData() {

		var minDataValue = 800000, maxDataValue = 5000000;

		var inputData = controller.inputData;

		Utils.flattenCountryData(inputData, controller.inputValueKey, minDataValue, maxDataValue);

	}

	function createFakeData() {

		var inputData = controller.inputData;

		for ( var i in inputData ) {

			var set = inputData[ i ];
			set.fakeData = set.v;

		}

		// update input value key

		controller.inputValueKey = "fakeData";

	}

	function createGeometry() {

		var vec3_origin = new THREE.Vector3( 0, 0, 0 );

		if ( controller.inputData === null ) {

			return;

		}

		for ( var s in controller.inputData ) {

			var set = controller.inputData[ s ];

			var exporterName = set.e.toUpperCase();
			var importerName = set.i.toUpperCase();

			if (exporterName == "ZZ" || importerName == "ZZ") {
				console.group("ZZ unknown country");
				console.log("ZZ country code detected for current ;countries this will not be print on the globe");
				console.log(exporterName + ", " + importerName);
				console.groupEnd();

				delete controller.inputData[s];

				continue;
			}

			var exporter = CountryData[ exporterName ];
			var importer = CountryData[ importerName ];

			if (exporter==null) throw exporterName+" is not referenced as a country code! See the full list there : https://github.com/syt123450/giojs/blob/master/src/countryInfo/CountryData.js";
			if (importer==null) throw importerName+" is not referenced as a country code! See the full list there : https://github.com/syt123450/giojs/blob/master/src/countryInfo/CountryData.js";

			set.lineGeometry = makeConnectionLineGeometry( exporter, importer, set.fakeData );

		}

		function makeConnectionLineGeometry ( exporter, importer, value ) {

			var exporterCenter = exporter.center.clone();
			var distanceBetweenCountryCenter = exporterCenter.subVectors( exporterCenter, importer.center ).length();

			var start = exporter.center;
			var end = importer.center;

			var mid = start.clone().lerp( end, 0.5 );
			var midLength = mid.length();
			mid.normalize();
			mid.multiplyScalar( midLength + distanceBetweenCountryCenter * 0.7 );

			var normal = ( new THREE.Vector3() ).subVectors( start, end );
			normal.normalize();

			var distanceHalf = distanceBetweenCountryCenter * 0.5;

			var startAnchor = start;

			var midStartAnchor = mid.clone().add( normal.clone().multiplyScalar( distanceHalf ) );
			var midEndAnchor = mid.clone().add( normal.clone().multiplyScalar( -distanceHalf ) );

			var endAnchor = end;

			var splineCurveA = new THREE.CubicBezierCurve3( start, startAnchor, midStartAnchor, mid );
			var splineCurveB = new THREE.CubicBezierCurve3( mid, midEndAnchor, endAnchor, end );

			var vertexCountDesired = Math.floor( distanceBetweenCountryCenter * 0.02 + 6 ) * 2;

			var points = splineCurveA.getPoints( vertexCountDesired );

			points = points.splice( 0, points.length - 1 );
			points = points.concat( splineCurveB.getPoints( vertexCountDesired ) );
			points.push( vec3_origin );

			var val = value * 0.0003;

			var size = ( 10 + Math.sqrt( val ) );


			size = Utils.constrain( size, 0.1, 60 );

			var curveGeometry = new THREE.Geometry();

			for ( var i = 0; i < points.length; i++ ) {

				curveGeometry.vertices.push( points[ i ] );

			}

			curveGeometry.size = size;

			return curveGeometry;

		}

	}

	function dumpData() {
		controller.globalData = controller.inputData;
	}

	return {

		createMentionedCountries: createMentionedCountries,

		flattenData: flattenData,

		createFakeData: createFakeData,

		createGeometry: createGeometry,

		dumpData: dumpData

	}

}

export { SingleDataHandler }