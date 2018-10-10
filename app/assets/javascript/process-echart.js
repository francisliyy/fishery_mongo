$(function() {

    var colorChart = echarts.init(document.getElementById('colorChart'));
    var ruleChart = echarts.init(document.getElementById('ruleChart'));
    var colorChartOption = {
    	    color:[ 
			    '#32cd32'
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
		        'rgb(206, 245, 121,0.3)',    
		        'rgb(245, 121, 222,0.3)',
		  
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
		        'rgb(245, 121, 222,0.3)',
		        'rgb(206, 245, 121,0.3)', 
		    		]}}
		        }
		    ],
		    series : [
		        {
		          name:'2016',
		          type:'scatter',
		          data:[[1.40854,0.823]],
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
		          splitNumber:2,
		          axisLabel:{show:false},
		          splitLine:{show:false},

		        }
		    ],
		    yAxis : [
		        {
		          type : 'value',
		          name:'F',
		          min:0,
		          max:2,
		          splitNumber:2,
		          axisLabel:{show:false},
		          splitLine:{show:false},		         
		        }
		    ],
		    series : [
		        {
		          type:'line',
		          data:[[0,1],[2,1]],
		          markLine:{
		          	symbol:['none','arrow'],
		          	itemStyle:{normal:{color:'#dc143c'}},
		          	data:[
		          		  {yAxis:1,lineStyle:{type:'solid'}},
		          		[
		          		  {name:'',xAxis:1,yAxis:1.3},
		          		  {name:'',xAxis:1,yAxis:1},
		          		],
		          		[
		          		  {name:'',xAxis:1,yAxis:0.7},
		          		  {name:'',xAxis:1,yAxis:1},
		          		]
		          	],
		          },
		          itemStyle:{
		          normal:{
		              areaStyle: {type: 'default'}
		            }
                  }
                },
            ]
        };
    colorChart.setOption(colorChartOption);
    ruleChart.setOption(ruleChartOption);



	var bioChart1 = echarts.init(document.getElementById('bio-chart-1'));
	var sprChart1 = echarts.init(document.getElementById('spr-chart-1'));
	var ssbChart1 = echarts.init(document.getElementById('ssb-chart-1'));
	var fChart1 = echarts.init(document.getElementById('f-chart-1'));


	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getEchartData',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var F_std_data = [];
        var HL_E_data = [];
        var HL_W_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.Yr);
			F_std_data.push(el.F_std);
			HL_E_data.push(el.HL_E);
			HL_W_data.push(el.HL_W);
        });
		option = {
		    title: {
		        text: 'Ending year expected growth(with 95% intervals)'
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
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'F_std',
		            type:'line',
		            stack: '1',
		            lineStyle: {
		                normal: {
		                    opacity: 0
		                }
		            },
		            symbol: 'none',
		            data:F_std_data,
		        },
		        {
		            name:'HL_E',
		            type:'line',    
		            lineStyle: {
		                normal: {
		                    
		                }
		            },   
		            showSymbol: false,     
		            data:HL_E_data
		        },
		        {
		            name:'HL_W',
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
		            data:HL_W_data,
		            symbol: 'none'

		        }
		    ]
		};
		bioChart1.setOption(option);
	});

	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getEchartData',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var F_std_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.Yr);
			F_std_data.push(el.F_std);
        });
		option = {
		    title: {
		        text: ''
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
		    },
		    legend: {
		        data:['F_std'],
		        show:false,
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value',		        
		        splitLine:{show:false},
		    },
		    series: [
		        {
		            name:'F_std',
		            type:'line',
		            lineStyle: {
		                normal: {
		                    
		                }
		            },
		            showAllSymbol: true,
		            data:F_std_data,
		            markLine: {
		                data: [
		                    {type: 'average', name: 'average'}
		                ]
		            },
		        }
		    ]
		};
		sprChart1.setOption(option);
	});

	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getSsbAndFEchart',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var plot_ssb_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.plot_years);
			plot_ssb_data.push(el.plot_ssb);
        });
		option = {
		    title: {
		        text: ''
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
		    },
		    legend: {
		        data:['SSB'],
		        show:false,
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value',		        
		        splitLine:{show:false},
		    },
		    series: [
		        {
		            name:'SSB',
		            type:'line',
		            lineStyle: {
		                normal: {
		                    
		                }
		            },
		            showAllSymbol: true,
		            data:plot_ssb_data,
		            markLine: {
		                data: [
		                    {type: 'average', name: 'average'}
		                ],
		                label:{
		                	position:'middle',
		                },
		            },
		        }
		    ]
		};
		ssbChart1.setOption(option);
	});

	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getSsbAndFEchart',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var plot_F_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.plot_years);
			plot_F_data.push(el.plot_F);
        });
		option = {
		    title: {
		        text: ''
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
		    },
		    legend: {
		        data:['F'],
		        show:false,
		    },
		    grid: {
		        left: '3%',
		        right: '5%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value',		        
		        splitLine:{show:false},
		    },
		    series: [
		        {
		            name:'F',
		            type:'line',
		            lineStyle: {
		                normal: {
		                    
		                }
		            },
		            showAllSymbol: true,
		            data:plot_F_data,
		            markLine: {
		                data: [
		                    {type: 'average', name: 'average'}
		                ]
		            },
		        }
		    ]
		};
		fChart1.setOption(option);
	});

	

})
