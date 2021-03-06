google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var count = 0;
var starttime = null;
var endtime = null;
var machine_clicked = null;

var chart = null;
var pie = null;
// var machines = [];

var initialized = false;

var timeLine = new Object();
timeLine.options = {};
timeLine.chartrange_end = null;
timeLine.Chart = null;

var tables = new Object();
var pieChart = new Object();
var lastID = 0;
var lastResponse = {
		value: {},
		events: {},
		setValue: function(value) {
				this.value = value;
				this.notify('value', this.value);
		},

		addEvent: function(name) {
				if (typeof this.events[name] === "undefined") {
						this.events[name] = [];
				}
		},

		register: function(event, subscriber) {
				if (typeof subscriber === "object" && typeof subscriber.notify === "function") {
						this.addEvent(event);
						this.events[event].push(subscriber);
				}
		},

		notify: function(event, data) {
				var events = this.events[event];
				for(var e in events) {
						events[e].notify(data);
				}
		}
};

var loadChart = function() {
		chart.fadeOut(0);
		starttime = document.getElementById("start").value;
		endtime = document.getElementById("end").value;
		machine_clicked = document.getElementById("machineClicked").textContent;
		timeLine.options = {
				//width: 1280,
				//height: 128 * machines.length,
				timeline: { showBarLabels: false },
				hAxis: {
						viewWindowMode: 'pretty',
						minValue: new Date(starttime),
						maxValue: new Date(endtime),
						format: 'h:mm aa'
				}
		};

		if (new Date(endtime) <= new Date(starttime)) {
				var txt = $("#alertText");
				txt.text('End time ought to be after start time.');
				$("#modalAlert").modal('show');
				return;
		}
		drawMultSeries(starttime, endtime, machine_clicked);
};

var arrange_data_with_warning = function(indata) {
		if (!Array.isArray(indata) || indata.length < 1) {
				var chart = $('#chart');
				chart.fadeOut(0);
				var txt = $("#alertText");
				txt.text('No data found.');
				$("#modalAlert").modal('show');
				return [];
		}
		return arrange_data(indata);
};

var arrange_data = function(indata) {
		res = [];
		if (!Array.isArray(indata) || indata.length < 1) {
				return res;
		}
		indata.sort();
		lastID = indata[indata.length - 1][0];
		for (i = 0, d = indata.length; i < d; i++) {
				machine = indata[i][1];
				// if (machines.indexOf(indata[i][1]) < 0) {
				// 		machines.push(indata[i][1]);
				// }
				if (new Date(indata[i][3]) > new Date(starttime)) {
						res.push([indata[i][1], indata[i][2],
											new Date(indata[i][3]),
											new Date(indata[i][4])]);
				}
		}
		return res;
};

var GetDatestring = function() {
		starttime = document.getElementById("start").value;
		endtime = document.getElementById("end").value;
		machine_clicked = document.getElementById("machineClicked").textContent;
		timeLine.options = {
				//width: 1280,
				//height: 128 * machines.length,
				timeline: { showBarLabels: false },
				hAxis: {
						viewWindowMode: 'pretty',
						minValue: new Date(starttime),
						maxValue: new Date(endtime),
						format: 'h:mm aa'
				}
		};
		timeLine.chartrange_end = timeLine.options.hAxis.maxValue;
		var datstring = "start=" + new Date(starttime).toUTCString() + "&end=" + new Date(endtime).toUTCString();
		if (machine_clicked != '') {
				datstring += "&machine=" + machine_clicked;
		}
		return datstring;
};

var GetNowDatestring = function() {
		var _st = document.getElementById("start").value;
		var _nd = document.getElementById("end").value;

		timeLine.options = {
				//width: 1280,
				//height: 128 * machines.length,
				timeline: { showBarLabels: false },
				hAxis: {
						viewWindowMode: 'pretty',
						minValue: new Date(_st),
						maxValue: new Date(_nd),
						format: 'h:mm aa'
				}
		};

		if (new Date(endtime) > new Date()) {
				_nd = new Date();
		}

		var _mc = document.getElementById("machineClicked").textContent;
		timeLine.chartrange_end = timeLine.options.hAxis.maxValue;
		var datstring = "start=" + new Date(_st).toUTCString() + "&end=" + new Date(_nd).toUTCString();
		if (_mc != '') {
				datstring += "&machine=" + _mc;
		}
		return datstring;
};

timeLine.lastEnrtyStopTime = function() {
		var last_entry_stoptime = new Date(new Date(document.getElementById('start').value).toUTCString());
		for (i = 0, j = this.data.og.length; i < j; i++) {
				var val = this.data.og[i].c[3].v;
				if (val > last_entry_stoptime) {
						last_entry_stoptime = val;
				}
		};
		console.log("last Entry: " + last_entry_stoptime);
		return last_entry_stoptime;
};

timeLine.createTable = function() {
		var _tmp = data = new google.visualization.DataTable();
		_tmp.addColumn({type: 'string', id: 'Machine'});
		_tmp.addColumn({type: 'string', id: 'Program'});
		_tmp.addColumn({type: 'date', id: 'Start'});
		_tmp.addColumn({type: 'date', id: 'End'});
		return _tmp;
};

timeLine.Render = function(response) {
		this.data = this.createTable();
		lastResponse.setValue(response);
		var parsed = lastResponse.value.responseJSON;
		this.data.addRows(arrange_data_with_warning(parsed));

		chart.fadeIn(2000);
		this.Chart = new google.visualization.Timeline(document.getElementById('chart'));
		this.options['height'] = machines.length * 60;
		this.Chart.draw(this.data, this.options);

		var t = setInterval(timeLine.Update, 10000);
		setTimeout(function() { clearInterval(t); }, Math.abs(timeLine.chartrange_end - new Date()));
};

timeLine.Update = function() {
		var now = new Date();
		if (timeLine.chartrange_end > now) {
				var mach = $('#machineClicked').text();
				var datstring = "after=" + lastID;

				var reDraw = function(d) {
						if (d.responseJSON.length > 0) {
								lastResponse.setValue(d);
								var jdata = d.responseJSON;
								x = arrange_data(jdata);
								timeLine.data.addRows(x);
								timeLine.Chart.draw(timeLine.data, timeLine.options);
								// pieChart.Render();
						}
				};

				if (mach != '') {
						datstring += "&machine=" + mach;
				}
				console.log(++count + " Update query: " + datstring);
				$.ajax({url: 'getMachineTimes.php',
								data: datstring,
								dataType: "json",
								complete: reDraw});
		}
};


tables.innerArray = [];

tables.createTable = function () {
		var _tmp = new google.visualization.DataTable();
		_tmp.addColumn('string', 'Machine', 'Machine');
		_tmp.addColumn('string', 'Program', 'Machine');
		_tmp.addColumn('date', 'Start', 'Start');
		_tmp.addColumn('date', 'End', 'End');
		_tmp.addColumn('string', 'Diff (min:sec)', 'Diff');
		return _tmp;

};

tables.Render = function() {
		for (var i = 0, len = machines.length; i < len; i++) {
				var machine = machines[i];
				this.AddItem(machine);
		}
		this.Update();
};

tables.AddItem = function(machine) {
		if (document.getElementById("#t" + machine) === null) {
				$("#tbls").append("<button type=\"button\" class=\"btn btn-info\" " +
													"data-toggle=\"collapse\" data-target=\"#t" + machine +
													"\"></ br>"	 + machine +
													"</button>" +
													"<div id=\"t" + machine +
													"\" class=\"collapse\"></div>");
		}
		tables.innerArray[machine] =
				{
						"table":
						new google.visualization.Table(document.getElementById("t" + machine)),
						"dataTable": this.createTable()
				};
};

checkMachine = function(machine) {
		$.ajax(
				{
						url: 'ping.php',
						data: "machine=" + machine,
						dataType: "json",
						complete: function(j) {
								if (j.responseJSON[machine] == 0) {
										var el = document.getElementById(machine);
										el.style['background-color'] = '#AA1111';
										el.style['color'] = '#C0BE00';
								}
						}
				}
		);
};

checkMachines = function() {
		$.ajax(
				{
						url: 'ping.php',
						dataType: "json",
						complete: function(j) {
								var jr = j.responseJSON;
								for (machine in jr) {
										if (jr[machine] == 0) {
												var el = document.getElementById(machine);
												el.style['background-color'] = '#AA1111';
												el.style['color'] = '#C0BE00';
										}
								}
						}
				}
		);
};

tables.Update = function () {
		console.log('table update triggered');
		var raw_data = lastResponse.value.responseJSON;
		var fmt_data = [];
		for(var i = 0; i < machines.length; i++) {
				var machine = machines[i];
				// checkMachine(machine);
				var data = tables.innerArray[machine].dataTable;
				for(var j = 0, jn = raw_data.length; j < jn; j++) {
						if (raw_data[j][1] === machines[i]) {
								var sDate = new Date(raw_data[j][3].toString());
								var eDate = new Date(raw_data[j][4].toString());
								var dDate = (eDate - sDate) / 60000;
								var min = Math.floor(dDate);
								var sec = (('.' + dDate.toString().split('.')[1]) * 60);
								min = min.toString().search('NaN') > -1 ? 0 : min;
								sec = sec.toString().search('NaN') > -1 ? 0 : sec;
								sec = sec < 10 ? '0' + sec : sec;
								var strDate = (min + ':' + sec).split('.')[0];
								var _tmp =[raw_data[j][1],
													 raw_data[j][2],
													 sDate,
													 eDate,
													 strDate];
								fmt_data.push(_tmp);
						}
				}
				data.addRows(fmt_data);
				if (i <= this.innerArray.length && this.innerArray[machine].table != undefined) {
						var tbl = this.innerArray[machine].table;
					  data = this.innerArray[machine].dataTable;
						fmt = new google.visualization.DateFormat(
								{ pattern: 'MMM d, yyyy h:mm:ss aa' });
						fmt.format(data, 2);
						fmt.format(data, 3);
						tbl.draw(data,
										 { showRowNumber: true,
											 width: 1280,
											 //height: 256
										 }
										);
						fmt_data = [];
				}
		}
};

pieChart.Render = function() {
		var draw = function(response) {
				console.log("Updating pies...");
				input = response.responseJSON;
				////////////////////////////////////////////////////////////////////////////////
				// Pie 1
				////////////////////////////////////////////////////////////////////////////////
				var idle = input[0]['total'] - (input[0]['setup'] + input[0]['cycle']);
				var piedata = google.visualization.arrayToDataTable([
						['Task', 'Hours per Day'],
						['Setup', input[0]['setup'] / 60],
						['Cycle', input[0]['cycle'] / 60],
						['Idle',	idle / 60]
				]);

				var pie_options = {
						title: 'Selected Range',
						colors: ['#f3f01e', '#108a00', '#e60000' ],
						pieHole: 0.2,
						slices: { 0: {offset: 0.1},
											1: {offset: 0.1}}
				};

				var pie = document.getElementById('pie');
				var pie_chart = new google.visualization.PieChart(pie);
				pie_chart.draw(piedata, pie_options);
				////////////////////////////////////////////////////////////////////////////////
				// Pie 2
				////////////////////////////////////////////////////////////////////////////////
				var idle2 = input[1]['total'] - (input[1]['setup'] + input[1]['cycle']);
				var piedata2 = google.visualization.arrayToDataTable([
						['Task', 'Hours per Day'],
						['Setup', input[1]['setup'] / 60],
						['Cycle', input[1]['cycle'] / 60],
						['Idle',	idle2 / 60]
				]);

				var pie_options2 = {
						title: 'Last Week',
						colors: ['#f3f01e', '#108a00', '#e60000' ],
						pieHole: 0.2,
						slices: { 0: {offset: 0.1},
											1: {offset: 0.1}}
						//chartArea: {width:'105%', height:'105%'}
				};

				var pie2 = document.getElementById('pie2');
				var pie_chart2 = new google.visualization.PieChart(pie2);
				pie_chart2.draw(piedata2, pie_options2);
		};
		$.ajax({url: 'getPieValues.php',
						data: GetNowDatestring(),
						dataType: "json",
						complete: draw});
};

var makeTable = function () {
		var rLog = function(indata) {
				var jdata = indata.responseJSON;
				var fmt_data = [];
				var fmt_datatable = new google.visualization.DataTable();
				fmt_datatable.addColumn('date', 'Timestamp', 'Timestamp');
				fmt_datatable.addColumn('string', 'Machine', 'Machine');
				fmt_datatable.addColumn('string', 'Event', 'Event');

				for (var j = 0, jn = jdata.length; j < jn; j++) {
						var str = jdata[j]["EVENT"];
						var lDate = new Date(jdata[j]["TS"]);
						fmt_data.push([
								lDate,
								jdata[j]["MACHINE"],
								str
						]);
				}
				fmt_datatable.addRows(fmt_data);
				fmt = new google.visualization.DateFormat({ pattern: 'MMM d, yyyy h:mm:ss aa' });
				fmt.format(fmt_datatable, 0);
				if (document.getElementById("logtbl") === null) {
						$("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" " +
															"data-target=\"#logtbl\">Log</button>" +
															"<div id=\"logtbl\" class=\"collapse\"></div>");
				}
				var tbl = new google.visualization.Table(document.getElementById('logtbl'));
				tbl.draw(fmt_datatable,
								 {
										 //height: '256px',
										 showRowNumber: false
								 }
								);
		};

		$.ajax({url: 'getLog.php',
						data: GetDatestring(),
						dataType: "json",
						complete: rLog});
};

var Render = function(response) {
		timeLine.Render(response);
		if (window.innerWidth > 991) {
				$("#piepanel").height($('#controls').height());
		}
		if (!initialized) {
				tables.Render();
				pieChart.Render();
				// init events
				var updateTableNotify = {
						notify: function () {
								tables.Update();
								pieChart.Render();
								if (window.innerWidth > 991) {
										$("#piepanel").height($('#controls').height());
								}
						}
				};
				lastResponse.register('value', updateTableNotify);
				initialized = true;
		}
};

var drawMultSeries = function (strt, nd, mach) {
		if (typeof strt != "undefined" && typeof nd != "undefined" && typeof mach != "undefined") {
				starttime = new Date(document.getElementById('start').value).toUTCString();
				endtime = new Date(document.getElementById('end').value).toUTCString();
				machine_clicked = $('#machineClicked').text();
				var datstring = "start=" + starttime + "&end=" + endtime;
				if (mach != '') {
						datstring += "&machine=" + mach;
				}

				$.ajax({url: 'getMachineTimes.php',
								data: GetDatestring(),
								dataType: "json",
								complete: Render});
		}
};

$(document).ready(
		function() {
				google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
				google.charts.setOnLoadCallback(drawMultSeries);
				starttime = document.getElementById("start").value;
				endtime = document.getElementById("end").value;
				machine_clicked = document.getElementById("machineClicked").textContent;

				timeLine.options = {
						//width: 1280,
						// height: 128 * machines.length,
						timeline: { showBarLabels: false },
						hAxis: {
								viewWindowMode: 'pretty',
								minValue: new Date(starttime),
								maxValue: new Date(endtime),
								format: 'h:mm aa'
						}
				};
				timeLine.chartrange_end = timeLine.options.hAxis.maxValue;

				// init global vars
				chart = $('#chart');
				pie = $('#pie');
				$.ajax({url: 'getLastIndex.php',
								dataType: "json",
								complete: function(id) {
										console.log("Got " + id.responseJSON.MAX_ID);
										lastID = id.responseJSON.MAX_ID;
								}
							 });
				// init charts
				$('#chart').fadeOut(0);
				$('a#log').on('click', makeTable);
		}
);
