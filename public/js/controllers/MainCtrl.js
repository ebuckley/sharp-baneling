angularSkeleton.controller('MainCtrl', function($scope, $http, $filter) {
	//abstracted urls to this object
	var urlConfig = {
		getQuery: function(id) { return '/api/query/' + id },
		getDataSources: function(probename) {
			return '/data/visiondatasources?probe=' + probename;
		},
		getRun: function() { return '/run'; },
		createQuery: function() {
			return '/api/query';
		}
	};

	$scope.state = {
		areSourcesSelected: false,
		isStateDirty: false,
	};
	/**
	 * IIFE
	 * Peek at the dom to see if the queryid isloaded onto the page, if it is 
	 * get data from the rest endpoint and load it into our query object
	 */
	(function (arguments) {
		var id = $("#queryID").attr('value');
		id = parseInt(id);
		if (_.isNumber(id) && !_.isNaN(id)) {
			$http.get(urlConfig.getQuery(id))
			.success(function (data, status, headers, config) {
				$scope.query = data;
				re = /^(.):/
				// hmlapp-3000-5:9097/vision-query-service/api-queries/v2/queries
				var probename = data.queryURL.match(/^(\w|\W)*:/)[0];
				probename = probename.slice(0, probename.length - 1);
				$scope.probename = "hmlapp-3000-5";
				$scope.getDataSources()
				.then(function (response) {
					$scope.state.areSourcesSelected = true;
					$scope.saveButtonString = 'Delete';
				});

			})
			return id;
		} else {
			return "";
		}
	})();

	$scope.saveButtonString = "Save";
	// scope query object which is updated from form controls
	$scope.query = {
		name:"",
		queryObject:{
			breakdown_type: 'dport',
			type: "TrafficBreakdown",
			order_by: 'bytes',
			order_direction: 'desc',
			other_required: true,
			auto_pivot: true,
			points: 4,
		},
		queryURL: "",
		responseObject: {}
	};

	$scope.datasources = [
	];


	$scope.$watch('query', function (newVal, oldVal) {
		if ($scope.saveButtonString === 'Delete') {
			$scope.state.isStateDirty = true;
			$scope.saveButtonString = 'Update';
			$scope.oldQuery = angular.copy(oldVal);
		}else if ($scope.saveButtonString === 'Update' &&
				_.isEqual($scope.oldQuery, $scope.query)) {
			$scope.state.isStateDirty = false;
			$scope.saveButtonString = 'Delete';
		}
	}, true);
	/**
	 * Event that is called when the selection of sources change
	 */
	$scope.sourcesSelected = function(sources) {
		if (sources.length > 0) {
			$scope.state.areSourcesSelected = true;
		} else {
			$scope.state.areSourcesSelected = false;
		}
		var startAndEndTimes = _.chain(sources).pluck('metadataTimerange').pluck('visionObjectValue').value();
		$scope.query.queryObject.start_time = $filter('ISO8601Local')(
			_.chain(startAndEndTimes).pluck('start').pluck('seconds').min().value()
		);
		$scope.query.queryObject.end_time = $filter('ISO8601Local')(
			_.chain(startAndEndTimes).pluck('end').pluck('seconds').max().value()
		);
		//datasource guids
		$scope.query.queryObject.datasource_guids =_.pluck(sources, 'id'); 
	};

	/*
	 * Save button clicked, changes based on context
	 */
	$scope.saveButtonClick = function(query) {
		if ($scope.saveButtonString == "Save") {
			saveQuery(query);
		} else {
			if ($scope.state.isStateDirty) {
				updateQuery();
			} else{
				deleteQuery();
			}
		};
	};

	/**
	 * Make a request to the endpoint to get data sources
	 */
	$scope.getDataSources = function() {
		return $http.get( urlConfig.getDataSources($scope.probename))
		.success(function(data, status) {
			$scope.datasources = data.payload;
			$scope.query.queryURL = $scope.probename + ":9097/vision-query-service/api-queries/v2/queries";
		})
		.error(function(error) {
			$scope.datasources = [];
			console.log('could not get data sources');
		});
	};

	/**
	 * Run a query, updates response object on completion of run
	 */
	$scope.runQuery = function(query) {
		return $http.post(urlConfig.getRun(), JSON.stringify(query))
		.success(function (data, status, headers, config) {
			$scope.query.responseObject = data.response;
		});
	};
	var updateQuery = function () {
		console.log("update not implemented")
	}
	/**
	 * Delete a query from the db
	 */
	var deleteQuery = function () {
		console.log('delete handler not implemented');
	};

	/**
	 * Make a post to the endpoint to adda  new query
	 */
	var saveQuery = function(query) {
		console.log('saving');
		$http.post(urlConfig.createQuery(), query)
		.success( function (data, status, headers, config) {
			console.log('data');
			console.log(data);
			$scope.saveButtonString = "Delete"
		})
		.error(function (data, status, headers, config) {
			console.log(status);
		});
	};
});
