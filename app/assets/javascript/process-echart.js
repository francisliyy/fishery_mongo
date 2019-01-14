var kobeChart1 = echarts.init(document.getElementById('kobe-plot'));
var bioChart1 = echarts.init(document.getElementById('bio-chart-1'));
var sprChart1 = echarts.init(document.getElementById('spr-chart-1'));
var hireChart1 = echarts.init(document.getElementById('hire-chart'));
var privateChart1 = echarts.init(document.getElementById('private-chart'));
var ssbChart1 = echarts.init(document.getElementById('ssb-chart-1'));
var fChart1 = echarts.init(document.getElementById('f-chart-1'));
var ssb1Chart1 = echarts.init(document.getElementById('ssb1-chart'));
var ssb2Chart1 = echarts.init(document.getElementById('ssb2-chart'));

function drawChart(chartdata){

    var kobe_low_data = [];
    var kobe_median_data = [];
    var kobe_high_data = [];

	var comm_xAxisData = [];
    var comm_low_data = [];
    var comm_median_data = [];
    var comm_high_data = [];

    var recr_xAxisData = [];
    var recr_low_data = [];
    var recr_median_data = [];
    var recr_high_data = [];

    var hire_xAxisData = [];
    var hire_low_data = [];
    var hire_median_data = [];
    var hire_high_data = [];

    var private_xAxisData = [];
    var private_low_data = [];
    var private_median_data = [];
    var private_high_data = [];

    var ssb_xAxisData = [];
    var ssb_low_data = [];
    var ssb_median_data = [];
    var ssb_high_data = [];

    var f_xAxisData = [];
    var f_low_data = [];
    var f_median_data = [];
    var f_high_data = [];

    var ssb1_xAxisData = [];
    var ssb1_low_data = [];
    var ssb1_median_data = [];
    var ssb1_high_data = [];

    var ssb2_xAxisData = [];
    var ssb2_low_data = [];
    var ssb2_median_data = [];
    var ssb2_high_data = [];

    var kobe_option = {
    	title: {
	        text: 'Kobe Plot'
	    },
	    color:[ 
		    '#1e90ff'
		], 
	    tooltip : {
	        trigger: 'item',
	        formatter:function(params){
	        	return params.data;
	        }
	    },
	    xAxis : [
	        {
	            type : 'value',
	          min:0,
	            max:2,
	            name:'SSB',
	          axisLabel:{
	            show:true,
	            formatter: function(value){
	              if(value==1) return 'MSSF';
	          },
	          },
	          splitNumber:2,
	          splitLine:{show:true},
	          splitArea:{
	            show:true,
	            areaStyle:{
	                     color: [
	        'rgb(255,0,0,0.5)',    
	        'rgb(77, 255, 0,0.5)',
	  
	    		]}}
	        }
	    ],
	    yAxis : [
	        {
	          type : 'value',
	          name:'F',
	          min:0,
	          max:2,
	          axisLabel:{
	            show:true,
	            formatter: function(value){
	              if(value==1) return 'MFMT';
	            }
	          },
	          splitNumber:2,
	          splitLine:{show:true},
	          splitArea:{
	            show:true,
	             areaStyle:{
	                     color: [
	        'rgb(77, 255, 0,0.5)',
	        'rgb(255,0,0,0.5)', 
	    		]}}
	        }
	    ],
	    series : [
	        {
	          name:'',
	          type:'scatter',
	          data:[],
	          itemStyle:{
	          normal:{
	              label:{
	                show:true,
	                position:'right',
	                formatter:function(params){
	                  return params.seriesName;
	                }
	              }
	            }
              }
            },
        ]
    };
    kobeChart1.setOption(kobe_option);

	var	comm_option = {
	    title: {
	        text: 'Commercial Catch'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '5%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Annual Commercial Catch(mt)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	bioChart1.setOption(comm_option);

	var recr_option = {
	    title: {
	        text: 'Recreational Catch'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Annual Catch(mt)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	sprChart1.setOption(recr_option);

	var hire_option = {
	    title: {
	        text: 'For Hire Catch'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Annual Catch(mt)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	hireChart1.setOption(hire_option);

	var private_option = {
	    title: {
	        text: 'Private Catch'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Annual Catch(mt)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	privateChart1.setOption(private_option);

	var f_option = {
	    title: {
	        text: 'General Fishing Mortality'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '10%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'General Annual Fishing Mortality(year \u207B\u00B9)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	fChart1.setOption(f_option);

	var ssb_option = {
	    title: {
	        text: 'Total SSB'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Stock Spawning Biomass(No. of Eggs)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	ssbChart1.setOption(ssb_option);

	var ssb1_option = {
	    title: {
	        text: 'SSB in Stock1'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Stock Spawning Biomass(No. of Eggs)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	ssb1Chart1.setOption(ssb1_option);

	var ssb2_option = {
	    title: {
	        text: 'SSB in Stock2'
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    textStyle: {
                        color: '#222'
                    }
                }
            },
            formatter: function (params) {
                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
            }
	    },
	    legend: {
	        data:['F_std','HL_E','HL_W'],
	        show:false,
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [],
	    },
	    yAxis: {
	        type: 'value',
	        name: 'Stock Spawning Biomass(No. of Eggs)',
	    },
	    series: [
	        {
	            name:'Lower 2.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            symbol: 'none',
	            data:[],
	        },
	        {
	            name:'Median',
	            type:'line',    
	            lineStyle: {
	                normal: {
	                    
	                }
	            },   
	            showSymbol: false,     
	            data:[]
	        },
	        {
	            name:'Upper 97.5%',
	            type:'line',
	            stack: '1',
	            lineStyle: {
	                normal: {
	                    opacity: 0
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: '#ccc',
	                    shadowColor: 'rgba(0, 0, 0, 0.5)',
	                }
	            },
	            data:[],
	            symbol: 'none'

	        }
	    ]
	};
	ssb2Chart1.setOption(ssb2_option);



    if(chartdata){
    	try {
	        chartdata = JSON.parse(chartdata);
	    } catch (e) {
	    }

	    $.each(chartdata,function(index, el) {
			kobe_median_data.push([el.SSB_total_ratio_median,el.F_general_ratio_median]);
        });

        kobe_option.series[0].data = kobe_median_data;
		kobeChart1.setOption(kobe_option);

        $.each(chartdata,function(index, el) {
        	comm_xAxisData.push(el.year);
			comm_low_data.push(el.AM_comm_025);
			comm_median_data.push(el.AM_comm_median);
			comm_high_data.push(el.AM_comm_975);
        });
        comm_option.xAxis.data = comm_xAxisData;
        comm_option.series[0].data = comm_low_data;
        comm_option.series[1].data = comm_median_data;
        comm_option.series[2].data = comm_high_data;
		bioChart1.setOption(comm_option);

        $.each(chartdata,function(index, el) {
        	recr_xAxisData.push(el.year);
			recr_low_data.push(el.AM_recr_025);
			recr_median_data.push(el.AM_recr_median);
			recr_high_data.push(el.AM_recr_975);
        });

        recr_option.xAxis.data = recr_xAxisData;
        recr_option.series[0].data = recr_low_data;
        recr_option.series[1].data = recr_median_data;
        recr_option.series[2].data = recr_high_data;
		sprChart1.setOption(recr_option);

		$.each(chartdata,function(index, el) {
        	hire_xAxisData.push(el.year);
			hire_low_data.push(el.Forhire_planned_season_length_025);
			hire_median_data.push(el.Forhire_planned_season_length_median);
			hire_high_data.push(el.Forhire_planned_season_length_975);
        });

        hire_option.xAxis.data = hire_xAxisData;
        hire_option.series[0].data = hire_low_data;
        hire_option.series[1].data = hire_median_data;
        hire_option.series[2].data = hire_high_data;
		hireChart1.setOption(hire_option);

		$.each(chartdata,function(index, el) {
        	private_xAxisData.push(el.year);
			private_low_data.push(el.Forhire_planned_season_length_025);
			private_median_data.push(el.Forhire_planned_season_length_median);
			private_high_data.push(el.Forhire_planned_season_length_975);
        });

        private_option.xAxis.data = private_xAxisData;
        private_option.series[0].data = private_low_data;
        private_option.series[1].data = private_median_data;
        private_option.series[2].data = private_high_data;
		privateChart1.setOption(private_option);

		$.each(chartdata,function(index, el) {
        	f_xAxisData.push(el.year);
			f_low_data.push(el.F_general_025);
			f_median_data.push(el.F_general_median);
			f_high_data.push(el.F_general_975);
        });
        f_option.xAxis.data = f_xAxisData;
        f_option.series[0].data = f_low_data;
        f_option.series[1].data = f_median_data;
        f_option.series[2].data = f_high_data;
       	fChart1.setOption(f_option);

		$.each(chartdata,function(index, el) {
        	ssb_xAxisData.push(el.year);
			ssb_low_data.push(el.SSB_total_025);
			ssb_median_data.push(el.SSB_total_median);
			ssb_high_data.push(el.SSB_total_975);
        });

        ssb_option.xAxis.data = ssb_xAxisData;
        ssb_option.series[0].data = ssb_low_data;
        ssb_option.series[1].data = ssb_median_data;
        ssb_option.series[2].data = ssb_high_data;
		ssbChart1.setOption(ssb_option);

		$.each(chartdata,function(index, el) {
        	ssb1_xAxisData.push(el.year);
			ssb1_low_data.push(el.SSB_1_025);
			ssb1_median_data.push(el.SSB_1_median);
			ssb1_high_data.push(el.SSB_1_975);
        });

        ssb1_option.xAxis.data = ssb1_xAxisData;
        ssb1_option.series[0].data = ssb1_low_data;
        ssb1_option.series[1].data = ssb1_median_data;
        ssb1_option.series[2].data = ssb1_high_data;
		ssb1Chart1.setOption(ssb1_option);

		$.each(chartdata,function(index, el) {
        	ssb2_xAxisData.push(el.year);
			ssb2_low_data.push(el.SSB_2_025);
			ssb2_median_data.push(el.SSB_2_median);
			ssb2_high_data.push(el.SSB_2_975);
        });

        ssb2_option.xAxis.data = ssb2_xAxisData;
        ssb2_option.series[0].data = ssb2_low_data;
        ssb2_option.series[1].data = ssb2_median_data;
        ssb2_option.series[2].data = ssb2_high_data;
		ssb2Chart1.setOption(ssb2_option);

	}

}

$(function() {

    var colorChart = echarts.init(document.getElementById('colorChart'));
    var ruleChart = echarts.init(document.getElementById('ruleChart'));
    var current_f_ratio = $('#step1_id').data('current_f_ratio');
    var current_ssb_ratio = $('#step1_id').data('current_ssb_ratio');
    var start_projection = $('#start_projection').find("input").val();
    start_projection = start_projection.substring(0,4);

    var colorChartOption = {
    	    color:[ 
			    '#1e90ff'
			], 
		    tooltip : {
		        trigger: 'item',
		        formatter:function(params){
		        	return params.data;
		        }
		    },
		    xAxis : [
		        {
		            type : 'value',
		          min:0,
		            max:2,
		            name:'SSB',
		          axisLabel:{
		            show:true,
		            formatter: function(value){
		              if(value==1) return 'MSSF';
		          },
		          },
		          splitNumber:2,
		          splitLine:{show:true},
		          splitArea:{
		            show:true,
		            areaStyle:{
		                     color: [
		        'rgb(255,0,0,0.5)',    
		        'rgb(77, 255, 0,0.5)',
		  
		    		]}}
		        }
		    ],
		    yAxis : [
		        {
		          type : 'value',
		          name:'F',
		          min:0,
		          max:2,
		          axisLabel:{
		            show:true,
		            formatter: function(value){
		              if(value==1) return 'MFMT';
		            }
		          },
		          splitNumber:2,
		          splitLine:{show:true},
		          splitArea:{
		            show:true,
		             areaStyle:{
		                     color: [
		        'rgb(77, 255, 0,0.5)',
		        'rgb(255,0,0,0.5)', 
		    		]}}
		        }
		    ],
		    series : [
		        {
		          name:start_projection,
		          type:'scatter',
		          data:[[current_ssb_ratio,current_f_ratio]],
		          itemStyle:{
		          normal:{
		              label:{
		                show:true,
		                position:'right',
		                formatter:function(params){
		                  return params.seriesName;
		                }
		              }
		            }
                  }
                },
            ]
        };

    var ruleChartOption = {
    	    color:['#87cefa'],
		    tooltip : {
		        trigger: 'axis',
		        formatter:function(params){
		        	return params.data;
		        }
		    },
		    xAxis : [
		        {
		          type : 'value',
		          min:0,
		          max:2,
		          name:'SSB',
		          splitNumber:2,
		          axisLabel:{show:false},
		          axisTick:{show:false},
		          splitLine:{show:false},

		        }
		    ],
		    yAxis : [
		        {
		          type : 'value',
		          name:'F',
		          min:0.03,
		          max:0.08,
		          axisLabel:{
		            show:true,
		            formatter: function(value){
		              if(value==0.0588) return 'MFMT';
		            }
		          },
		          axisTick:{show:false},
		          splitLine:{show:false},		         
		        }
		    ],
		    series : [
		        {
		          type:'line',
		          data:[[0,0.0500],[2,0.0500]],
		          markLine:{
		          	symbol:['none','arrow'],
		          	itemStyle:{normal:{color:'#dc143c'}},
		          	data:[
		          		[
		          		  {name:'',xAxis:0,yAxis:0.0500},
		          		  {name:'',xAxis:2,yAxis:0.0500},
		          		],
		          		[
		          		  {name:'',xAxis:1,yAxis:0.0550},
		          		  {name:'',xAxis:1,yAxis:0.0500},
		          		],
		          		[
		          		  {name:'',xAxis:1,yAxis:0.0450},
		          		  {name:'',xAxis:1,yAxis:0.0500},
		          		]
		          	],
		          },
		          itemStyle:{
		          normal:{
		              areaStyle: {type: 'default'}
		            }
                  },
                  label:{show:true}
                },
                {
		          type:'line',
		          data:[[0,0.0588],[2,0.0588]],
		          label:{show:true}
                },
            ]
        };
    colorChart.setOption(colorChartOption);
    ruleChart.setOption(ruleChartOption);

    $('#ex1').slider({

		formatter: function(value) {

			ruleChartOption.series[0].data=[];
    		ruleChartOption.series[0].data.push([0,value]);
    		ruleChartOption.series[0].data.push([2,value]);
    		ruleChartOption.series[0].markLine.data[0][0].yAxis=value;
    		ruleChartOption.series[0].markLine.data[0][1].yAxis=value;
    		ruleChartOption.series[0].markLine.data[1][0].yAxis=value+0.005;
    		ruleChartOption.series[0].markLine.data[1][1].yAxis=value;
    		ruleChartOption.series[0].markLine.data[2][0].yAxis=value-0.005;
    		ruleChartOption.series[0].markLine.data[2][1].yAxis=value;
    		ruleChart.setOption(ruleChartOption);
    		//$("#bio_f_percent").val(parseFloat(value/0.75).toPrecision(3));

			return 'Current value: ' + value;
		}
	});

    var chartdata;
	$.ajax({
    	url: $SCRIPT_ROOT+'/prostepview/getMesResult/'+$("#step1_id").data("step1id"),
    	type: 'get',
    	dataType: 'JSON',
    	data: {},
    })
    .done(function(result) {
    	chartdata = result.resultlist;   	
    })
    .always(function(result){
    	drawChart(chartdata);
    })

    $("#btnReport").on('click', function(event) {
    	event.preventDefault();
    	$("#mask").addClass('lmask');

		$.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getMesInput/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    }).done(function(result) {

	    	console.log(result);

		    var kobeChart1ImgData = kobeChart1.getDataURL();
	    	var bioChart1ImgData = bioChart1.getDataURL();
	    	var sprChart1ImgData = sprChart1.getDataURL();
	    	var ssbChart1ImgData = ssbChart1.getDataURL();
	    	var fChart1ImgData = fChart1.getDataURL();
	    	var hireChart1ImgData = hireChart1.getDataURL();
	    	var privateChart1ImgData = privateChart1.getDataURL();
	    	var ssb1Chart1ImgData = ssb1Chart1.getDataURL();
	    	var ssb2Chart1ImgData = ssb2Chart1.getDataURL();

		    var doc = new jsPDF('p', 'pt', 'a4', false);

		    var pageHeight= doc.internal.pageSize.height;
			doc.setFontSize(36);
		    doc.text('MSE Report', 200, 80);
		    //steo1 : Stock Assessment Model Input
		    //Section font size
		    doc.setFontSize(20);
		    doc.text('Stock Assessment Model Input', 50, 120)
		    //aritcle title font size
		    doc.setFontSize(12);
		    doc.text('Stock1:', 70, 140)
		    //aritcle font size
		    doc.setFontSize(10);
		    if(result.stock1_model_type==1){		    	
		    	doc.text('Model type: Stock Synthesis 3', 90, 160);
		    }else if(result.stock1_model_type==2){
		    	doc.text('Model type: Virtual Population Analysis', 90, 160);
		    }else{
		    	doc.text('Model type: Statistical-catch-at-age', 90, 160);
		    }
		    if(result.stock1_input_file_type==1){
		    	doc.text('Input File: Official Stock Assessment Model', 90, 180);
		    }else{
		    	doc.text('Input File: Self-defined Model', 90, 180);
		    }

			//steo2 : General Input
		    //Section font size
		    doc.setFontSize(20);
		    doc.text('General Input', 50, 210)
		    //aritcle font size
		    doc.setFontSize(10);
		    if(result.time_step=='Y'){		    	
		    	doc.text('Time Step: 1 year', 90, 230);
		    }else{
		    	doc.text('Time Step: half year', 90, 230);
		    }
		    doc.text('Start Projection: 2016-01-01', 90, 250);
		    doc.text('Short-term Management: '+result.short_term_mgt+' Years', 90, 270);
		    doc.text('Long-term Management: '+result.long_term_mgt+' Years', 90, 290);
		    doc.text('Stock per Management: '+result.stock_per_mgt_unit, 90, 310);
		    doc.text('Mixing Pattern: No mixing', 90, 330);
		    doc.text('Last Age in the Plus Group: '+result.last_age, 90, 350);
		    doc.text('Number of Iteratons: '+result.no_of_interations, 90, 370);
		    doc.text('Effective Sample Size For Initial Distribution: '+result.sample_size, 90, 390);
		    if(result.rnd_seed_setting==1){
		    	doc.text('Random Seed Setting: Default Seed CSV', 90, 410);
		    }else{
		    	doc.text('Random Seed Setting: Self-defined CSV', 90, 410);
		    }

		    //steo3 : Initial Population
		    //Section font size
		    doc.setFontSize(20);
		    doc.text('Initial Population', 50, 440)
		    doc.setFontSize(10);
		    doc.text('Stock 1 Population CV (Normal Dist.): '+result.ip_cv_1, 90, 460);
		    doc.text('Stock 2 Population CV (Normal Dist.): '+result.ip_cv_2, 90, 480);
		    doc.text('Stock mean: see Table-1 below', 90, 500);
		    
		    //steo4 : Biological Parameter
		    //Section font size
		    doc.setFontSize(20);
		    doc.text('Biological Parameters', 50, 530)
		    doc.setFontSize(10);
		    doc.text('Stock Weight-at-age & Fecundity: see Table-2 below', 90, 550);

		    //steo5 : Natural Mortality
		    //Section font size
		    doc.setFontSize(20);
		    doc.text('Natural Mortality', 50, 580)
		    doc.setFontSize(10);
		    if(result.nm_m=='h'){		    	
		    	doc.text('High M', 90, 600);
		    }else if(result.nm_m=='l'){
		    	doc.text('Low M', 90, 600);
		    }else{
		    	doc.text('Current M', 90, 600);
		    }
		    doc.text('CV for Stock1 Population(Log-normal Dist.): '+result.nm_cv_1, 90, 620);
		    doc.text('CV for Stock2 Population(Log-normal Dist.): '+result.nm_cv_1, 90, 640);
		    doc.text('Fraction before Spawning: '+result.simple_spawning, 90, 660);
		    doc.text('Mean M for Stock: see Table-3 below', 90, 680);

		    doc.addPage();
		    doc.setFontSize(10);
		    doc.text('Table-1:',90,80);
		    var tableIP = $('#form-ibParam .fixed-table-body').clone();
		    tableIP.find("div.fixed-table-loading").remove();
		    tableIP.find("#table-ibParam").css("font-size", "10px");
		    doc.fromHTML(tableIP[0],90,90);
		    
		    doc.addPage();
		    doc.setFontSize(10);
		    doc.text('Table-2:',90,80);
		    var tableBP = $('#form-bioParam .fixed-table-body').clone();
		    tableBP.find("div.fixed-table-loading").remove();
		    tableBP.find("#table-bioParam").css("font-size", "10px");		    
		    doc.fromHTML(tableBP[0],90,90);

		    doc.addPage();
		    doc.setFontSize(10);
		    doc.text('Table-3:',90,80);
		    var tableNM = $('#form-naturalmortality .fixed-table-body').clone();
		    tableNM.find("div.fixed-table-loading").remove();
		    tableNM.find("#table-mortality").css("font-size", "10px")
		    doc.fromHTML(tableNM[0],90,90);

		    
		    doc.addPage();
		    doc.addImage(kobeChart1ImgData, 'jpg', 50, 50,500, 350, undefined, 'none');
		    doc.addImage(bioChart1ImgData, 'jpg', 50, 450, 500, 350, undefined, 'none');
		    doc.addPage();
		    doc.addImage(sprChart1ImgData, 'jpg', 50, 50,500, 350, undefined, 'none');
		    doc.addImage(ssbChart1ImgData, 'jpg', 50, 450, 500, 350, undefined, 'none');
		    doc.addPage();
		    doc.addImage(fChart1ImgData, 'jpg', 50, 50,500, 350, undefined, 'none');
		    doc.addImage(hireChart1ImgData, 'jpg', 50, 450, 500, 350, undefined, 'none');
		    doc.addPage();
		    doc.addImage(privateChart1ImgData, 'jpg', 50, 50,500, 350, undefined, 'none');
		    doc.addImage(ssb1Chart1ImgData, 'jpg', 50, 450, 500, 350, undefined, 'none');
		    doc.addPage();
		    doc.addImage(ssb2Chart1ImgData, 'jpg', 50, 50,500, 350, undefined, 'none');
		    doc.save( 'colorchart.pdf')		    
	    	
	    }).always(function(result){
	    	$("#mask").removeClass('lmask');
	    })

    	/* Act on the event */

    });	



})
