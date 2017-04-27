function get_value_array() {
    return $.get("http://localhost:5000/timeseriesdata/",
		 "where={\"name\":\"temperature\"}",
		 function(data) {
		     return data.responseJSON._items[0].values;
		 }
		);
}

function get_ts() {
    return $.get("http://localhost:5000/timeseriesdata/",
		 "where={\"name\":\"temperature\"}",
		 function(data) {
		     return data.responseJSON._items[0].ts_hour;
		 }
		);
}
