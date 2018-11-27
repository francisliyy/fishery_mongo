$(function() {
	

	var radarChart = echarts.init(document.getElementById('radarChart'));
	var meanChart = echarts.init(document.getElementById('meanChart'));
	var catchChart = echarts.init(document.getElementById('catchChart'));
	var varChart = echarts.init(document.getElementById('varChart'));
	var terminalChart = echarts.init(document.getElementById('terminalChart'));
	var lowestChart = echarts.init(document.getElementById('lowestChart'));

	var mseNames = $("#cmpDiv").data("msenames");
	var greenMeans = $("#cmpDiv").data("greenmeans");
	var totalCatchs = $("#cmpDiv").data("totalcatchs");
	var catchVars = $("#cmpDiv").data("catchvars");
	var terminalSSBs = $("#cmpDiv").data("terminalssbs");
	var lowestSSBs = $("#cmpDiv").data("lowestssbs");

	var barOtion = {
	    xAxis: {
	        type: 'category',
	        data: mseNames,
	        axisLabel:{
	        	rotate:30,
	        }
	    },
	    yAxis: {
	        type: 'value'
	    },
	    tooltip: {},
	    series: [{
	        data: [],
	        type: 'bar'
	    }]
	};
	var meanOption = $.extend(true,{title:{text:'Year_to_green_mean'},series:[{data:greenMeans}]}, barOtion);
	var catchOption =  $.extend(true,{title:{text:'Total_catch_MSEcomp'},series:[{data:totalCatchs}]}, barOtion);
	var varOption =  $.extend(true,{title:{text:'Catch_var_MSEcomp'},series:[{data:catchVars}]}, barOtion);
	var terminalOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Terminal_SSB_MSEcomp'},series:[{data:terminalSSBs}]}, barOtion);
	var lowestOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Lowest_SSB_MSEcomp'},series:[{data:lowestSSBs}]}, barOtion);

	var radarOption = {
	    title: {
	        text: ''
	    },
	    tooltip: {},
	    legend: {
	        data: mseNames,
	        left:'0',
	        top:'0',
	    },
	    radar: {
	        // shape: 'circle',
	        name: {
	            textStyle: {
	                color: '#fff',
	                backgroundColor: '#999',
	                borderRadius: 3,
	                padding: [3, 5]
	           }
	        },
	        indicator: [
	           { name: 'Year_to_green_mean', max: 100},
	           { name: 'total_catch_MSEcomp', max: 30000},
	           { name: 'catch_var_MSEcomp', max: 1000},
	           { name: 'terminal_SSB_MSEcomp', max: 70000000000},
	           { name: 'lowest_SSB_MSEcomp', max: 70000000000}
	        ]
	    },
	    series: [{
	        name: 'Budget vs spending',
	        type: 'radar',
	        // areaStyle: {normal: {}},
	        data : []
	    }]
	};

	var radarDataArry = [];
	for(var i=0;i<mseNames.length;i++){
		var seriesData = {};
		seriesData.name = mseNames[i];
		seriesData.value = [];
		seriesData.value.push(greenMeans[i]);
		seriesData.value.push(totalCatchs[i]);
		seriesData.value.push(catchVars[i]);
		seriesData.value.push(terminalSSBs[i]);
		seriesData.value.push(lowestSSBs[i]);
		radarDataArry.push(seriesData);
	}
	radarOption.series[0].data = radarDataArry;

	radarChart.setOption(radarOption);
	meanChart.setOption(meanOption);
	catchChart.setOption(catchOption);
	varChart.setOption(varOption);
	terminalChart.setOption(terminalOption);
	lowestChart.setOption(lowestOption);

})