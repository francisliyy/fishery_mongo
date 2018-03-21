$(function() {

	$('#mt1FilePath').change(function () {
	    console.log(this.files[0].mozFullPath);
	});

	$("#process-part").accwizard({		
		onNext:function(parent, panel){
			$panel = $(panel);
			if($panel.prop("id")=='generalinput'){
				console.log('in step1');
				var data = {};
				var time_step = $('input[name=time_step]:checked', '#form-generalinput').val()||'M';
				var start_projection = $("#start_projection").find("input").val()||moment().startOf('month').format('YYYY-MM-DD');
				var short_term_mgt = $("#short_term_mgt").val()||0;
				var short_term_unit = $("#short_term_unit").val()||'Y';
				var long_term_mgt = $("#long_term_mgt").val()||0;
				var long_term_unit = $("#long_term_unit").val()||'Y';
				var stock_per_mgt_unit = $("#stock_per_mgt_unit").val()||0;
				var mixing_pattern = $('input[name=mixing_pattern]:checked', '#form-generalinput').val()||1
				var last_age = $('#last_age').val()||0;
				var no_of_interations = $('#no_of_interations').val()||0;
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step1/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"time_step":time_step,"start_projection":start_projection,
		            "short_term_mgt":short_term_mgt,"short_term_unit":short_term_unit,
		            "long_term_mgt":long_term_mgt,"long_term_unit":long_term_unit,
		            "stock_per_mgt_unit":stock_per_mgt_unit,"mixing_pattern":mixing_pattern,
		            "last_age":last_age,"no_of_interations":no_of_interations},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step1 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='stockassessment1'){
				console.log('in step2');
				var data = {};
				var unit1to1 = parseFloat($("#unit1to1").val())||0;
				var unit1to2 = parseFloat($("#unit1to2").val())||(100.0-unit1to1);
				var unit2to1 = parseFloat($("#unit2to1").val())||0;
				var unit2to2 = parseFloat($("#unit2to2").val())||(100.0-unit2to1);
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step2/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"unit1to1":unit1to1,"unit1to2":unit1to2,
		            "unit2to1":unit2to1,"unit2to2":unit2to2},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step2 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='stockassessment2'){
				console.log('in step3');
				var data = {};
				var stock1_model_type = $('input[name=stock1_model_type]:checked', '#form-stockassessment2').val()||'1';
				var stock1_filepath = $("#stock1_filepath").val()||'';
				var stock2_model_type = $('input[name=stock2_model_type]:checked', '#form-stockassessment2').val()||'1';
				var stock2_filepath = $("#stock2_filepath").val()||'';
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step3/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"stock1_model_type":stock1_model_type,"stock1_filepath":stock1_filepath,
		            "stock2_model_type":stock2_model_type,"stock2_filepath":stock2_filepath},
		            success: function(data) 
		            {
		            	getIniPopu(data);
		            }
		        });
			}else if($panel.prop("id")=='ibParam'){
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step4/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify($("#table-ibParam").bootstrapTable('getData')),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step4 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='bioParam'){
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step5/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify($("#table-bioParam").bootstrapTable('getData')),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step5 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='naturalmortality'){
				var inputdata = {};
				if($("#hidden-mortality").data('mortalitycomplex')==1){
					var simple_mean = parseFloat($("#simple_mean").val())||0;
					var simple_cv = parseFloat($("#simple_cv").val())||0;
					var simple_spawning = parseFloat($("#simple_spawning").val())||0;
					inputdata = JSON.stringify({"mortality_complexity":1,"simple_mean":simple_mean,"simple_cv":simple_cv,
		            "simple_spawning":simple_spawning,mortality:[]});
		            

				}else if($("#hidden-mortality").data('mortalitycomplex')==2){
					inputdata =JSON.stringify({"mortality_complexity":2,"simple_mean":0,"simple_cv":0,
		            "simple_spawning":0,mortality:$("#table-mortality").bootstrapTable('getData')});	
				}
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step6/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: inputdata,
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     if($("#hidden-mortality").data('mortalitycomplex')==1){
		                     	getMortality();//TODO:get data right but table not refresh
		                     }else if($("#hidden-mortality").data('mortalitycomplex')==2){
		                        $("#simple_mean").val(0);
		                        $("#simple_cv").val(0);
		                        $("#simple_spawning").val(0);
		                     }
		                 }
		            }
		        });
			}else if($panel.prop("id")=='recruitment'){
				console.log('in step7');
				var data = {};

				//stock1				
				var recruitTypeStock1 = $('input[name=recruitTypeStock1]:checked', '#form-recruitment').val()||'0';
				alert($('input[name=historySt1]:checked', '#form-recruitment').val());
				var historySt1 = $('input[name=historySt1]:checked', '#form-recruitment').val()||'0';
				var hst1_lower = $("#hst1-lower:enabled").val()||0;
				var hst1_median = $("#hst1-median:enabled").val()||0;
				var hst1_mean = $("#hst1-mean:enabled").val()||0;
				var hst1_upper = $("#hst1-upper:enabled").val()||0;
				var hst1_other = $('#hst1-other:enabled').val()||0;
				var hst1_cal = $('#hst1-cal:enabled').val()||0;

				var formulaStock1 = $('input[name=formulaStock1]:checked', '#form-recruitment').val()||'0';
				var fml1Bmalpha1 = $("#fml1Bmalpha1:enabled").val()||0;
				var fml1Bmbeta1 = $("#fml1Bmbeta1:enabled").val()||0;
				var fml1Rmalpha1 = $("#fml1Rmalpha1:enabled").val()||0;
				var fml1Rmbeta1 = $("#fml1Rmbeta1:enabled").val()||0;
				var fml1MbhmSSB0 = $("#fml1MbhmSSB0:enabled").val()||0;
				var fml1MbhmR0 = $("#fml1MbhmR0:enabled").val()||0;
				var fml1MbhmSteep = $("#fml1MbhmSteep:enabled").val()||0;

				var auto1R0 = $("#auto1R0:enabled").val()||0;
				var auto1h = $("#auto1h:enabled").val()||0;
				var auto1Rave = $("#auto1Rave:enabled").val()||0;

				var cv1Recruit = $("#cv1Recruit:enabled").val()||0;

				//stock2
				var recruitTypeStock2 = $('input[name=recruitTypeStock2]:checked', '#form-recruitment').val()||'0';
				
				var historySt2 = $('input[name=historySt2]:checked', '#form-recruitment').val()||'0';
				var hst2_lower = $("#hst2-lower:enabled").val()||0;
				var hst2_median = $("#hst2-median:enabled").val()||0;
				var hst2_mean = $("#hst2-mean:enabled").val()||0;
				var hst2_upper = $("#hst2-upper:enabled").val()||0;
				var hst2_other = $('#hst2-other:enabled').val()||0;
				var hst2_cal = $('#hst2-cal:enabled').val()||0;

				var formulaStock2 = $('input[name=formulaStock2]:checked', '#form-recruitment').val()||'0';
				var fml2Bmalpha1 = $("#fml1Bmalpha1:enabled").val()||0;
				var fml2Bmbeta1 = $("#fml1Bmbeta1:enabled").val()||0;
				var fml2Rmalpha1 = $("#fml1Rmalpha1:enabled").val()||0;
				var fml2Rmbeta1 = $("#fml1Rmbeta1:enabled").val()||0;
				var fml2MbhmSSB0 = $("#fml1MbhmSSB0:enabled").val()||0;
				var fml2MbhmR0 = $("#fml1MbhmR0:enabled").val()||0;
				var fml2MbhmSteep = $("#fml1MbhmSteep:enabled").val()||0;

				var auto2R0 = $("#auto1R0:enabled").val()||0;
				var auto2h = $("#auto1h:enabled").val()||0;
				var auto2Rave = $("#auto1Rave:enabled").val()||0;

				var cv2Recruit = $("#cv2Recruit:enabled").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step7/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'recruitTypeStock1':recruitTypeStock1,'historySt1':historySt1,'hst1_lower':hst1_lower,'hst1_median':hst1_median,
		        'hst1_mean':hst1_mean,'hst1_upper':hst1_upper,'hst1_other':hst1_other,'hst1_cal':hst1_cal,'formulaStock1':formulaStock1,
		        'fml1Bmalpha1':fml1Bmalpha1,'fml1Bmbeta1':fml1Bmbeta1,'fml1Rmalpha1':fml1Rmalpha1,'fml1Rmbeta1':fml1Rmbeta1,
		        'fml1MbhmSSB0':fml1MbhmSSB0,'fml1MbhmR0':fml1MbhmR0,'fml1MbhmSteep':fml1MbhmSteep,'auto1R0':auto1R0,'auto1h':auto1h,
		        'auto1Rave':auto1Rave,'cv1Recruit':cv1Recruit,'recruitTypeStock2':recruitTypeStock2,'historySt2':historySt2,'hst2_lower':hst2_lower,'hst2_median':hst2_median,
		        'hst2_mean':hst2_mean,'hst2_upper':hst2_upper,'hst2_other':hst2_other,'hst2_cal':hst2_cal,'formulaStock2':formulaStock2,
		        'fml2Bmalpha1':fml2Bmalpha1,'fml2Bmbeta1':fml2Bmbeta1,'fml2Rmalpha1':fml2Rmalpha1,'fml2Rmbeta1':fml2Rmbeta1,
		        'fml2MbhmSSB0':fml2MbhmSSB0,'fml2MbhmR0':fml2MbhmR0,'fml2MbhmSteep':fml2MbhmSteep,'auto2R0':auto2R0,'auto2h':auto2h,
		        'auto2Rave':auto2Rave,'cv2Recruit':cv2Recruit}),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step7 successfully");
		                 }
		            }
		        });
			}
		}
	});

    $('#start_projection').datetimepicker({
    	format:'YYYY-MM-DD',
    }).on('dp.change', function(e) {
    	
    });

    $('#fishingStartDate').datetimepicker({
    	format:'YYYY-MM-DD',
    });

    $('#fishingEndDate').datetimepicker({
    	format:'YYYY-MM-DD',
    });

    $("#rnd_seed_file").uploadFile({
		url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/'+$("#step1_id").data("step1id"),
	    maxFileCount: 1,                		   //上传文件个数（多个时修改此处
	    allowedTypes: 'txt',  				       //允许上传的文件式
	    showDone: false,                           //是否显示"Done"(完成)按钮
	    showDelete: true,                          //是否显示"Delete"(删除)按钮
	    showDownload:false,
		downloadCallback:function(){
			$.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/download/'+$("#step1_id").data("step1id"),
	            type: "GET",
	            responseType : 'blob',
	            success: function(data) 
	            {
	            }
	        });
		},
	    onLoad: function(obj)
	    {
	    	var filename = $("#step1_id").data("rndfilename");

	        //页面加载时，onLoad回调。如果有需要在页面初始化时显示（比如：文件修改时）的文件需要在此方法中处理
	        filename&&obj.createProgress(filename);        //createProgress方法可以创建一个已上传的文件
	    },
	    deleteCallback: function(data,pd)
	    {
	        //文件删除时的回调方法。
	        //如：以下ajax方法为调用服务器端删除方法删除服务器端的文件
	        $.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/'+$("#step1_id").data("step1id"),
	            type: "DELETE",
	            dataType: "json",
	            success: function(data) 
	            {
	                if(!data){
	                    pd.statusbar.hide();        //删除成功后隐藏进度条等
	                 }else{
	                    console.log(data.message);  //打印服务器返回的错误信息
	                 }
	              }
	        }); 
	    },
	    onSuccess: function(files,data,xhr,pd)
	    {
	    	//$(".ajax-file-upload-statusbar").width("600px");
	        //上传成功后的回调方法。本例中是将返回的文件名保到一个hidden类开的input中，以便后期数据处理
	        // if(data&&data.code===0){
	        //     console.log(data);
	        // }
	    }
	});

	function getIniPopu(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getIniPopuTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.iniPopu||result;
	    	$("#table-ibParam").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-ibParam").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
		        method: 'get',                      //请求方式（*）
		        toolbar: '#toolbar',                //工具按钮用哪个容器
		        striped: true,                      //是否显示行间隔色
		        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		        pagination: false,                   //是否显示分页（*）
		        sortable: false,                     //是否启用排序
		        sortOrder: "asc",                   //排序方式
		        //queryParams: ibParamTable.queryParams,//传递参数（*）
		        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
		        pageNumber:1,                       //初始化加载第一页，默认第一页
		        pageSize: 10,                       //每页的记录行数（*）
		        pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
		        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
		        strictSearch: true,
		        showColumns: false,                  //是否显示所有的列
		        showRefresh: false,                  //是否显示刷新按钮
		        minimumCountColumns: 2,             //最少允许的列数
		        clickToSelect: true,                //是否启用点击选中行
		        height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
		        uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
		        showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
		        cardView: false,                    //是否显示详细视图
		        detailView: false,                   //是否显示父子表
		    	columns:[
		    		[
		    			{
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 1 mean",
		    				field:"stock_1_mean",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 1 mean',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 1 mean must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 1 mean must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"CV",
		    				field:"cv_1",
		    				editable: {
			                    type: 'text',
			                    title: 'cv_1',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'CV must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'CV must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Stock 2 mean",
		    				field:"stock_2_mean",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 2 mean',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 2 mean must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 2 mean must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"CV",
		    				field:"cv_2",
		    				editable: {
			                    type: 'text',
			                    title: 'CV',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'CV must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'CV must larger than 0';
				                }
		                    }
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	$("#mask").removeClass('lmask');
	    });
        
	}

	function getBioParam(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getBioParamTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.bioParam||result;
	    	$("#table-bioParam").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-bioParam").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
		        method: 'get',                      //请求方式（*）
		        toolbar: '#toolbar',                //工具按钮用哪个容器
		        striped: true,                      //是否显示行间隔色
		        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		        pagination: false,                   //是否显示分页（*）
		        sortable: false,                     //是否启用排序
		        sortOrder: "asc",                   //排序方式
		        //queryParams: ibParamTable.queryParams,//传递参数（*）
		        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
		        pageNumber:1,                       //初始化加载第一页，默认第一页
		        pageSize: 10,                       //每页的记录行数（*）
		        pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
		        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
		        strictSearch: true,
		        showColumns: false,                  //是否显示所有的列
		        showRefresh: false,                  //是否显示刷新按钮
		        minimumCountColumns: 2,             //最少允许的列数
		        clickToSelect: true,                //是否启用点击选中行
		        height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
		        uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
		        showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
		        cardView: false,                    //是否显示详细视图
		        detailView: false,                   //是否显示父子表
		    	columns:[
		    		[
		    			{
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Maturity Stock 1",
		    				field:"maturity_stock_1",
		    				editable: {
			                    type: 'text',
			                    title: 'Maturity Stock 1',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Maturity Stock 1 must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Maturity Stock 1 must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Maturity Stock 2",
		    				field:"maturity_stock_2",
		    				editable: {
			                    type: 'text',
			                    title: 'Maturity Stock 2',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Maturity Stock 2 must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Maturity Stock 2 must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Fecundity",
		    				field:"fecundity",
		    				editable: {
			                    type: 'text',
			                    title: 'Fecundity',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Fecundity must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Fecundity must larger than 0';
				                }
		                    }
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	$("#mask").removeClass('lmask');
	    });
        
	}

	function showRightComplexity(complexity){
		if(complexity==1){
			$("#table-mortality").closest(".bootstrap-table").css('display', 'none');
			$("#simpleMortality").css('display', 'block');
		}else if(complexity==2){
			$("#table-mortality").closest(".bootstrap-table").css('display', 'block');
			$("#simpleMortality").css('display', 'none');
		}

	}

	function getMortality(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getMortalityTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.mortality||result;
	    	$("#table-mortality").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-mortality").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
		        method: 'get',                      //请求方式（*）
		        toolbar: '#toolbar',                //工具按钮用哪个容器
		        striped: true,                      //是否显示行间隔色
		        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		        pagination: false,                   //是否显示分页（*）
		        sortable: false,                     //是否启用排序
		        sortOrder: "asc",                   //排序方式
		        //queryParams: ibParamTable.queryParams,//传递参数（*）
		        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
		        pageNumber:1,                       //初始化加载第一页，默认第一页
		        pageSize: 10,                       //每页的记录行数（*）
		        pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
		        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
		        strictSearch: true,
		        showColumns: false,                  //是否显示所有的列
		        showRefresh: false,                  //是否显示刷新按钮
		        minimumCountColumns: 2,             //最少允许的列数
		        clickToSelect: true,                //是否启用点击选中行
		        height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
		        uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
		        showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
		        cardView: false,                    //是否显示详细视图
		        detailView: false,                   //是否显示父子表
		    	columns:[
		    		[
		    			{
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Mean",
		    				field:"mean",
		    				editable: {
			                    type: 'text',
			                    title: 'Mean',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Mean must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Mean must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"CV",
		    				field:"cv",
		    				editable: {
			                    type: 'text',
			                    title: 'CV',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'CV must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'CV must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Fraction before spawning",
		    				field:"spawning",
		    				editable: {
			                    type: 'text',
			                    title: 'Fraction before spawning',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Fraction before spawning must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Fraction before spawning must larger than 0';
				                }
		                    }
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	showRightComplexity($("#hidden-mortality").data('mortalitycomplex'));
	    	$("#mask").removeClass('lmask');
	    });
        
	}

	$("#mortality-pre-btn").on('click', function(event) {
		event.preventDefault();
		if($("#hidden-mortality").data('mortalitycomplex')==1){
			$(this).removeClass('btn-disable');
			$(this).addClass('btn-danger');
			$("#mortality-next-btn").removeClass('btn-danger');
			$("#mortality-next-btn").addClass('btn-disable');
		}else{
			if(parseInt($("#hidden-mortality").data('mortalitycomplex'))>1){
				$("#hidden-mortality").data('mortalitycomplex', parseInt($("#hidden-mortality").data('mortalitycomplex'))-1)
				$("#mortality-next-btn").removeClass('btn-disable');
				$("#mortality-next-btn").addClass('btn-danger');
				showRightComplexity($("#hidden-mortality").data('mortalitycomplex'));
			}
			$(this).removeClass('btn-danger');
			$(this).addClass('btn-disable');
		}
		/* Act on the event */
	});

	$("#mortality-next-btn").on('click', function(event) {
		event.preventDefault();
		if($("#hidden-mortality").data('mortalitycomplex')==2){
			$(this).removeClass('btn-disable');
			$(this).addClass('btn-danger');
			$("#mortality-pre-btn").removeClass('btn-danger');
			$("#mortality-pre-btn").addClass('btn-disable');
		}else{
			if(parseInt($("#hidden-mortality").data('mortalitycomplex'))<2){
				$("#hidden-mortality").data('mortalitycomplex', parseInt($("#hidden-mortality").data('mortalitycomplex'))+1);
				$("#mortality-pre-btn").removeClass('btn-disable');
				$("#mortality-pre-btn").addClass('btn-danger');
				showRightComplexity($("#hidden-mortality").data('mortalitycomplex'));
			}
			$(this).removeClass('btn-danger');
			$(this).addClass('btn-disable');
		}
	});

	function initHistroySt(stock){
		$("input[name^='hst"+stock+"']").prop('disabled','disabled');
		$("input[name='historySt"+stock+"']:checked").val()==1&&$("#hst"+stock+"-lower").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==2&&$("#hst"+stock+"-median").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==3&&$("#hst"+stock+"-mean").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==4&&$("#hst"+stock+"-upper").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==5&&$("#hst"+stock+"-other").prop('disabled','');
		$("#hst"+stock+"-cal").prop('disabled','');
	}

	function initFormulaStock(stock){
		$("input[name^='fml"+stock+"']").prop('disabled','disabled');
		$("input[name='formulaStock"+stock+"']:checked").val()==1&&$("[name^='fml"+stock+"Bm']").prop('disabled','');
		$("input[name='formulaStock"+stock+"']:checked").val()==2&&$("[name^='fml"+stock+"Rm']").prop('disabled','');
		$("input[name='formulaStock"+stock+"']:checked").val()==3&&$("[name^='fml"+stock+"Mbhm']").prop('disabled','');
	}


	$("input[name='recruitTypeStock1']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		$("#form-recruitment input[name='historySt1'],input[name^='hst1'],input[name='formulaStock1'],input[name^='fml1'],input[name^='auto1']").prop('disabled','disabled');
		
		if($("input[name='recruitTypeStock1']:checked").val()==1){

			$("#form-recruitment input[name='historySt1']").prop('disabled','');
			initHistroySt(1);

		}else if($("input[name='recruitTypeStock1']:checked").val()==2){
			
			$("#form-recruitment input[name='formulaStock1']").prop('disabled','');
			initFormulaStock(1);

		}else{

			$("#form-recruitment input[name^='auto1']").prop('disabled','');

		}
	
	});

	$("input[name='historySt1']").on('change', function(event) {
		initHistroySt(1);
	});

	$("input[name='formulaStock1']").on('change', function(event) {
		initFormulaStock(1);
	});

	$("input[name='recruitTypeStock2']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		$("#form-recruitment input[name='historySt2'],input[name^='hst2'],input[name='formulaStock2'],input[name^='fml2'],input[name^='auto2']").prop('disabled','disabled');
		
		if($("input[name='recruitTypeStock2']:checked").val()==1){

			$("#form-recruitment input[name='historySt2']").prop('disabled','');
			initHistroySt(2);

		}else if($("input[name='recruitTypeStock2']:checked").val()==2){
			
			$("#form-recruitment input[name='formulaStock2']").prop('disabled','');
			initFormulaStock(2);

		}else{

			$("#form-recruitment input[name^='auto2']").prop('disabled','');

		}
	});

	$("input[name='historySt2']").on('change', function(event) {
		initHistroySt(2);
	});

	$("input[name='formulaStock2']").on('change', function(event) {
		initFormulaStock(2);
	});

	getIniPopu();
	getBioParam();
	getMortality();
	$("#form-recruitment input[name='historySt1'],input[name^='hst1'],input[name='formulaStock1'],input[name^='fml1'],input[name^='auto1']").prop('disabled','disabled');
	$("#form-recruitment input[name='historySt2'],input[name^='hst2'],input[name='formulaStock2'],input[name^='fml2'],input[name^='auto2']").prop('disabled','disabled');


	

	// 

    

    /*let ibParamTable = new Object();
    //得到查询的参数
    ibParamTable.queryParams = function (params) {
        var temp = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
            limit: params.limit,   //页面大小
            offset: params.offset,  //页码
            departmentname: $("#txt_search_departmentname").val(),
            statu: $("#txt_search_statu").val()
        };
        //return temp;
    };*/

});