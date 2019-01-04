$(function() {
	

	var radarChart = echarts.init(document.getElementById('radarChart'));
	var meanChart = echarts.init(document.getElementById('meanChart'));
	var catchChart = echarts.init(document.getElementById('catchChart'));
	var varChart = echarts.init(document.getElementById('varChart'));
	var terminalChart = echarts.init(document.getElementById('terminalChart'));
	var lowestChart = echarts.init(document.getElementById('lowestChart'));
	var recrCatchChart = echarts.init(document.getElementById('recrCatchChart'));
	var recrVarChart = echarts.init(document.getElementById('recrVarChart'));
	var commCatchChart = echarts.init(document.getElementById('commCatchChart'));
	var commVarChart = echarts.init(document.getElementById('commVarChart'));

	var mseNames = $("#cmpDiv").data("msenames");
	var greenMeans = $("#cmpDiv").data("greenmeans");
	var totalCatchs = $("#cmpDiv").data("totalcatchs");
	var catchVars = $("#cmpDiv").data("catchvars");
	var terminalSSBs = $("#cmpDiv").data("terminalssbs");
	var lowestSSBs = $("#cmpDiv").data("lowestssbs");
	var totalRecrCatchs = $("#cmpDiv").data("totalrecrcatchs");
	var catchRecrVars = $("#cmpDiv").data("catchrecrvars");
	var totalCommCatchs = $("#cmpDiv").data("totalcommcatchs");
	var catchCommVars = $("#cmpDiv").data("catchcommvars");

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
	var totalRecrOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Total_Recr_Catch_MSEcomp'},series:[{data:totalRecrCatchs}]}, barOtion);
	var catchRecrOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Catch_Recr_Var_MSEcomp'},series:[{data:catchRecrVars}]}, barOtion);
	var totalCommOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Total_Comm_Catch_MSEcomp'},series:[{data:totalCommCatchs}]}, barOtion);
	var catchCommOption =  $.extend(true,{grid:{left:'20%'},title:{text:'Catch_Comm_Var_MSEcomp'},series:[{data:catchCommVars}]}, barOtion);

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
	           { name: 'lowest_SSB_MSEcomp', max: 70000000000},
	           { name: 'total_recr_catch_MSEcomp', max: 30000},
	           { name: 'catch_recr_var_MSEcomp', max: 1000},
	           { name: 'total_comm_catch_MSEcomp', max: 70000000000},
	           { name: 'catch_comm_var_MSEcomp', max: 70000000000}
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
	var greenMeansMax = 0;
	var totalCatchsMax = 0;
	var catchVarsMax = 0;
	var terminalSSBsMax = 0;
	var lowestSSBsMax = 0;
	var totalRecrCatchsMax = 0;
	var catchRecrVarsMax = 0;
	var totalCommCatchsMax = 0;
	var catchCommVarsMax = 0; 
	for(var i=0;i<mseNames.length;i++){
		var seriesData = {};
		seriesData.name = mseNames[i];
		seriesData.value = [];
		seriesData.value.push(greenMeans[i]);
		seriesData.value.push(totalCatchs[i]);
		seriesData.value.push(catchVars[i]);
		seriesData.value.push(terminalSSBs[i]);
		seriesData.value.push(lowestSSBs[i]);
		seriesData.value.push(totalRecrCatchs[i]);
		seriesData.value.push(catchRecrVars[i]);
		seriesData.value.push(totalCommCatchs[i]);
		seriesData.value.push(catchCommVars[i]);
		greenMeansMax += greenMeans[i];
		totalCatchsMax += totalCatchs[i];
		catchVarsMax += catchVars[i];
		terminalSSBsMax += terminalSSBs[i];
		lowestSSBsMax += lowestSSBs[i];
		totalRecrCatchsMax += totalRecrCatchs[i];
		catchRecrVarsMax += catchRecrVars[i];
		totalCommCatchsMax += totalCommCatchs[i];
		catchCommVarsMax += catchCommVars[i]; 
		radarDataArry.push(seriesData);
	}
	greenMeansMax = greenMeansMax/mseNames.length*3;
	totalCatchsMax = totalCatchsMax/mseNames.length*3;
	catchVarsMax = catchVarsMax/mseNames.length*3;
	terminalSSBsMax = terminalSSBsMax/mseNames.length*3;
	lowestSSBsMax = lowestSSBsMax/mseNames.length*3;
	totalRecrCatchsMax = totalRecrCatchsMax/mseNames.length*3;
	catchRecrVarsMax = catchRecrVarsMax/mseNames.length*3;
	totalCommCatchsMax = totalCommCatchsMax/mseNames.length*3;
	catchCommVarsMax = catchCommVarsMax/mseNames.length*3;
	radarOption.series[0].data = radarDataArry;
	radarOption.radar.indicator[0].max = parseInt(greenMeansMax);
	radarOption.radar.indicator[1].max = parseInt(totalCatchsMax);
	radarOption.radar.indicator[2].max = parseInt(catchVarsMax);
	radarOption.radar.indicator[3].max = parseInt(terminalSSBsMax);
	radarOption.radar.indicator[4].max = parseInt(lowestSSBsMax);
	radarOption.radar.indicator[5].max = parseInt(totalRecrCatchsMax);
	radarOption.radar.indicator[6].max = parseInt(catchRecrVarsMax);
	radarOption.radar.indicator[7].max = parseInt(totalCommCatchsMax);
	radarOption.radar.indicator[8].max = parseInt(catchCommVarsMax);
	console.log(radarOption);

	radarChart.setOption(radarOption);
	meanChart.setOption(meanOption);
	catchChart.setOption(catchOption);
	varChart.setOption(varOption);
	terminalChart.setOption(terminalOption);
	lowestChart.setOption(lowestOption);
	recrCatchChart.setOption(totalRecrOption);
	recrVarChart.setOption(catchRecrOption);
	commCatchChart.setOption(totalCommOption);
	commVarChart.setOption(catchCommOption);

})