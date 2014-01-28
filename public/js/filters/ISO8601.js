angularSkeleton.filter('ISO8601UTC', function() {
	return function (unix) {
		return (unix ? moment.unix(unix).utc().format() : '');
	};
});

angularSkeleton.filter('ISO8601Local', function() {
	return function (unix) {
		return (unix ? moment.unix(unix).format() : '');
	};
});
