$(function() {

	$('.stock1_input_file_type').on('click', '.selector', function(event) {
		event.preventDefault();
		/* Act on the event */
	});

	$("input[name='stock1_input_file_type']").on('change', function(event) {
		event.preventDefault();
		if($("input[name='stock1_input_file_type']:checked").val()==1){
			$('#stock1_upload_div').css('display','none');
		}else{
			$('#stock1_upload_div').css('display','block');
		}

	});

	$("input[name='rnd_seed_setting']").on('change', function(event) {
		event.preventDefault();
		if($("input[name='rnd_seed_setting']:checked").val()==1){
			$('#seed_upload_div').css('display','none');
		}else{
			$('#seed_upload_div').css('display','block');
		}

	});

	$('#mt1FilePath').change(function () {
	    console.log(this.files[0].mozFullPath);
	});

	$("#form-stockassessment").validate({
		ignore:"input[type=file]",
		rules: {
	      // no quoting necessary
	      stock1_model_type:{
	      	required: true,
	      },  
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest("div"));
		}
	});

	$("#form-generalinput").validate({
	 	ignore:"input[type=file]",
	    rules: {
	      // no quoting necessary
	      rnd_seed_setting:{
	      	required: true,
	      },      
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest(".form-group") );
		}
	});

	$("#form-naturalmortality").validate({
		rules: {
	      // no quoting necessary
	      
	      simple_mean:{
	      	required: true,
	      	number:true,
	      },
	      simple_cv:{
	      	required: true,
	      	number:true,
	      	max:100,
	      },
	      simple_spawning:{
	      	required: true,
	      	number:true,
	      }       
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest(".form-group"));
		}
	});

	$("#form-recruitment").validate({
	    rules: {
	      // part1
	      recruitTypeStock1:{
	      	required: true,
	      },
	      hst1_lower:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_median:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_mean:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_upper:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_other:{
	      	required: true,
	      	number:true,
	      	max:100,
	      },
	      hst1_cal:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      //part2
	      formulaStock1:{
	      	required: true,
	      },
	      fml1Bmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Bmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Rmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Rmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmSSB0:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmR0:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmSteep:{
	      	required: true,
	      	number:true,
	      },
	      //part3
	      auto1R0:{
	      	required: true,
	      	number:true,
	      },
	      auto1h:{
	      	required: true,
	      	number:true,
	      },
	      auto1Rave:{
	      	required: true,
	      	number:true,
	      },
	      cv1Recruit:{
	      	required: true,
	      	number:true,
	      },
	    },
	    messages:{
	    	recruitTypeStock1:{
	    		//required: "Stock 1 recruit type is required",
	    	},

	    },
	    errorPlacement: function(error, element) {
	    	error.appendTo( element.closest("div") );	    
		}
	});

	$("#form-mgtopt1").validate({
		rules: {
	      // no quoting necessary
	      bio_biomass_points:{
	      	required: true,
	      	number:true,
	      },
	      bio_catch_mt:{
	      	required: true,
	      	number:true,
	      },
	      bio_f_percent:{
	      	required: true,
	      	number:true,
	      },
	      hrt_threshold1:{
	      	required: true,
	      	number:true,
	      },
	      hrt_threshold2:{
	      	required: true,
	      	number:true,
	      },  
	      hst_catch_thh1:{
	      	required: true,
	      	number:true,
	      },
	      hst_catch_thh2:{
	      	required: true,
	      	number:true,
	      },     
	      hst_f_thh1:{
	      	required: true,
	      	number:true,
	      },
	      hst_f_thh2:{
	      	required: true,
	      	number:true,
	      }, 
	      sec_recreational:{
	      	required: true,
	      	number:true,
	      	min:0,
	      	max:100,
	      },
	      sec_commercial:{
	      	required: true,
	      	number:true,
	      },
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest("div"));
		}
	});

	$("#process-part").accwizard({		
		onNext:function(parent, panel){
			$panel = $(panel);
			if($panel.prop("id")=='generalinput'){
				
				if(!$("#form-generalinput").valid()){
					return false;
				}
				var rnd_seed_setting = $('input[name=rnd_seed_setting]:checked', '#form-generalinput').val()||1
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step1/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"rnd_seed_setting":rnd_seed_setting},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save generalinput successfully");
		                 }
		            }
		        });
				
			}else if($panel.prop("id")=='stockassessment'){
				
				if(!$("#form-stockassessment").valid()){
					return false;
				}
				var data = {};
				var stock1_input_file_type = $('input[name=stock1_input_file_type]:checked', '#form-stockassessment').val()||'1';
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step3/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"stock1_input_file_type":stock1_input_file_type,//"stock1_filepath":stock1_filepath,
		            },
		            success: function(data) 
		            {
		            	 if(data.status=1){
		                     console.log("save stockassessment successfully");
		                 }
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
				var simple_spawning = parseFloat($("#simple_spawning").val())||0;
					inputdata =JSON.stringify({"mortality_complexity":2,
		            "simple_spawning":simple_spawning,mortality:$("#table-mortality").bootstrapTable('getData')});	
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
		                     
		                 }
		            }
		        });
			}else if($panel.prop("id")=='recruitment'){
				
				var data = {};
				if(!$("#form-recruitment").valid()){
					return false;
				};

				//stock1	
				var cvForRecu = $("#cvForRecu").val()||0;
				var stock1_amount = $("#stock1_amount").val()||0;
				var stock2_amount = $("#stock2_amount").val()||0;			
				var recruitTypeStock1 = $('input[name=recruitTypeStock1]:checked', '#form-recruitment').val()||'1';
				var fromHisStock1 = $('input[name=fromHisStock1]:checked', '#form-recruitment').val()||'0';
				
				var historySt1 = $('input[name=historySt1]:checked', '#form-recruitment').val()||'0';
				var hst1_lower = $("#hst1_lower:enabled").val()||0;
				var hst1_median = $("#hst1_median:enabled").val()||0;
				var hst1_mean = $("#hst1_mean:enabled").val()||0;
				var hst1_upper = $("#hst1_upper:enabled").val()||0;
				var hst1_other = $('#hst1_other:enabled').val()||0;
				var hst1_cal = $('#hst1_cal:enabled').val()||0;

				var historySt1_early = $('input[name=historySt1_early]:checked', '#form-recruitment').val()||'0';
				var hst1_lower_early = $("#hst1_lower_early:enabled").val()||0;
				var hst1_median_early = $("#hst1_median_early:enabled").val()||0;
				var hst1_mean_early = $("#hst1_mean_early:enabled").val()||0;
				var hst1_upper_early = $("#hst1_upper_early:enabled").val()||0;
				var hst1_other_early = $('#hst1_other_early:enabled').val()||0;
				var hst1_cal_early = $('#hst1_cal_early:enabled').val()||0;

				var formulaStock1 = $('input[name=formulaStock1]:checked', '#form-recruitment').val()||'0';
				var fromFmlStock1 = $('input[name=fromFmlStock1]:checked', '#form-recruitment').val()||'0';
				var fml1MbhmSSB0 = $("#fml1MbhmSSB0:enabled").val()||0;
				var fml1MbhmR0 = $("#fml1MbhmR0:enabled").val()||0;
				var fml1MbhmSteep = $("#fml1MbhmSteep:enabled").val()||0;
				var fml1MbhmR0_early = $("#fml1MbhmR0_early:enabled").val()||0;


				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step7/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'cvForRecu':cvForRecu,'stock1_amount':stock1_amount,'stock2_amount':stock2_amount,'recruitTypeStock1':recruitTypeStock1,'fromHisStock1':fromHisStock1
		        ,'historySt1':historySt1,'hst1_lower':hst1_lower,'hst1_median':hst1_median,'hst1_mean':hst1_mean,'hst1_upper':hst1_upper,'hst1_other':hst1_other,'hst1_cal':hst1_cal
		        ,'historySt1_early':historySt1_early,'hst1_lower_early':hst1_lower_early,'hst1_median_early':hst1_median_early,'hst1_mean_early':hst1_mean_early,'hst1_upper_early':hst1_upper_early,'hst1_other_early':hst1_other_early,'hst1_cal_early':hst1_cal_early
		        ,'formulaStock1':formulaStock1,'fromFmlStock1':fromFmlStock1,'fml1MbhmSSB0':fml1MbhmSSB0,'fml1MbhmR0':fml1MbhmR0,'fml1MbhmSteep':fml1MbhmSteep,'fml1MbhmR0_early':fml1MbhmR0_early}),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save recruitment successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='mgtopt1'){

				if(!$("#form-mgtopt1").valid()){
					return false;
				};
				var data = {};
				//var bio_biomass_points = $("#bio_biomass_points").val()||0;

				//var bio_harvest_radio = $('input[name=bio_harvest_radio]:checked', '#form-mgtopt1').val()||'C';
				var bio_catch_mt = $("#bio_catch_mt:enabled").val()||0;
				var bio_f_percent = $("#bio_f_percent:enabled").val()||0;
				var mg1_cv = $("#mg1_cv:enabled").val()||0;

				var hrt_harvest_rule = $('input[name=hrt_harvest_rule]:checked', '#form-mgtopt1').val()||'CC';
				var hrt_threshold1 = $("#hrt_threshold1").val()||0;
				var hrt_threshold2 = $("#hrt_threshold2").val()||0;

				var hrt_harvest_radio = $('input[name=hrt_harvest_radio]:checked', '#form-mgtopt1').val()||'C';
				var hst_catch_thh1 = $("#hst_catch_thh1:enabled").val()||0;
				var hst_catch_thh2 = $("#hst_catch_thh2:enabled").val()||0;
				var hst_f_thh1 = $("#hst_f_thh1:enabled").val()||0;
				var hst_f_thh2 = $('#hst_f_thh2:enabled').val()||0;

				//var bio_f_percent = $("#ex1").val()||0.0588;
				var sec_recreational = $("#sec_recreational").val()||0;
				var sec_commercial = $("#sec_commercial").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step8/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'mg1_cv':mg1_cv}),
		            success: function(data) 
		            {
		            }
		        });
			}else if($panel.prop("id")=='mgtopt2'){

				if(!$("#form-mgtopt2").valid()){
					return false;
				};
				
				var sec_recreational = $("#sec_recreational").val()||0;
				var sec_commercial = $("#sec_commercial").val()||0;
				var sec_hire = $("#sec_hire").val()||0;
				var sec_private = $("#sec_private").val()||0;
				var sec_headboat = $("#sec_headboat").val()||0;
				var sec_charterboat = $("#sec_charterboat").val()||0;
				var sec_pstar = $("#sec_pstar").val()||0;
				var sec_act_com = $("#sec_act_com").val()||0;
				var sec_act_pri = $("#sec_act_pri").val()||0;
				var sec_act_hire = $("#sec_act_hire").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step9/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({"sec_recreational":sec_recreational,"sec_commercial":sec_commercial
		        						,"sec_hire":sec_hire,"sec_private":sec_private
		        						,"sec_headboat":sec_headboat,"sec_charterboat":sec_charterboat
		        						,"sec_pstar":sec_pstar,"sec_act_com":sec_act_com
		        						,"sec_act_pri":sec_act_pri,"sec_act_hire":sec_act_hire}),
		            success: function(data) 
		            {
		            	 
		            }
		        });
			}else if($panel.prop("id")=='mgtopt3'){

				if(!$("#form-mgtopt3").valid()){
					return false;
				};
				var data = {};
				var mg3_commercial = $("#mg3_commercial").val()||0;
				var mg3_recreational = $("#mg3_recreational").val()||0;
				var mg3_forhire = $("#mg3_forhire").val()||0;
				var mg3_private = $("#mg3_private").val()||0;
				var	mg3_rec_east_open = $("#mg3_rec_east_open").val()||0;
				var	mg3_rec_east_closed = $("#mg3_rec_east_closed").val()||0;
				var	mg3_rec_west_open = $("#mg3_rec_west_open").val()||0;
				var	mg3_rec_west_closed = $("#mg3_rec_west_closed").val()||0;
				var	mg3_comhard_east_open = $("#mg3_comhard_east_open").val()||0;
				var	mg3_comhard_east_closed = $("#mg3_comhard_east_closed").val()||0;
				var	mg3_comhard_west_open = $("#mg3_comhard_west_open").val()||0;
				var	mg3_comhard_west_closed = $("#mg3_comhard_west_closed").val()||0;
				var	mg3_comlong_east_open = $("#mg3_comlong_east_open").val()||0;
				var	mg3_comlong_east_closed = $("#mg3_comlong_east_closed").val()||0;
				var	mg3_comlong_west_open = $("#mg3_comlong_west_open").val()||0;
				var	mg3_comlong_west_closed = $("#mg3_comlong_west_closed").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step10/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'mg3_commercial':mg3_commercial,'mg3_recreational':mg3_recreational,'mg3_forhire':mg3_forhire
		        						,'mg3_private':mg3_private,'mg3_rec_east_open':mg3_rec_east_open,'mg3_rec_east_closed':mg3_rec_east_closed
		        						,'mg3_rec_west_open':mg3_rec_west_open,'mg3_rec_west_closed':mg3_rec_west_closed,'mg3_comhard_east_open':mg3_comhard_east_open,'mg3_comhard_east_closed':mg3_comhard_east_closed
		        						,'mg3_comhard_west_open':mg3_comhard_west_open,'mg3_comhard_west_closed':mg3_comhard_west_closed,'mg3_comlong_east_open':mg3_comlong_east_open,'mg3_comlong_east_closed':mg3_comlong_east_closed
		        						,'mg3_comlong_west_open':mg3_comlong_west_open,'mg3_comlong_west_closed':mg3_comlong_west_closed}),
		            success: function(data) 
		            {		            	
		            }

		        });
		        	$("#act_mg3_bag_hire").text(mg3_forhire||10);
	            	$("#act_mg3_bag_private").text(mg3_private||10);
	            	$("#input_mg3_bag_hire").text(mg3_forhire||10);
	            	$("#input_mg3_bag_private").text(mg3_private||10);
			}else if($panel.prop("id")=='mgtopt4'){

				$("#mask").addClass('lmask');

				console.log('in step11');
				//if(!$("#form-mgtopt4").valid()){
				//	return false;
				//};
				var data = {};
				var mg4_season = $('input[name=mg4_season]:checked', '#form-mgtopt4').val()||'1';
				var mg4_act_catch_hire = $("#mg4_act_catch_hire:enabled").val()||0;
				var mg4_act_catch_private = $("#mg4_act_catch_private:enabled").val()||0;
				var mg4_input_hire = $("#mg4_input_hire:enabled").val()||0;
				var mg4_hire_length = $("#mg4_hire_length:enabled").val()||0;
				var mg4_input_private = $("#mg4_input_private:enabled").val()||0;
				var mg4_private_length = $("#mg4_private_length:enabled").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step11/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'mg4_season':mg4_season,'mg4_act_catch_hire':mg4_act_catch_hire,'mg4_act_catch_private':mg4_act_catch_private
		        						,'mg4_input_hire':mg4_input_hire,'mg4_hire_length':mg4_hire_length
		        						,'mg4_input_private':mg4_input_private,'mg4_private_length':mg4_private_length}),
		            success: function(data) 
		            {
		            	var bio_f_percent = $("#bio_f_percent:enabled").val()||0.0588;

		                 if(data.status=1){
		                     console.log("save step9 successfully");
		                     $.ajax({
					            cache: false,
					            url: 'http://gomredsnappermsetool.fiu.edu:8000/runmse',
					            crossDomain: true,
					            type: "POST",
					            dataType: "json",
					            data: JSON.stringify({"store_path":"~/","seed_file":"seed.csv","F_plan":bio_f_percent/0.75,"comm":sec_commercial,"process_gen_id":$("#step1_id").data("step1id")}),
					            success: function(data) 
					            {
					                 $("#mask").removeClass('lmask');
					                 drawChart(data);
					            }
					        });
		                 }
		            }
		        });
			}
		}
	});

	$("#process-result").accwizard({

	});

	/*part 1 Stock Assessment Model Input 2 start*/

	$("#stock1_filepath").uploadFile({
		url: $SCRIPT_ROOT+'/prostepview/stock1file/'+$("#step1_id").data("step1id"),
	    maxFileCount: 1,                		   //上传文件个数（多个时修改此处
	    //allowedTypes: 'csv',  				       //允许上传的文件式
	    showFileSize: false,
	    showDone: false,                           //是否显示"Done"(完成)按钮
	    showDelete: true,                          //是否显示"Delete"(删除)按钮
	    showDownload:true,
	    statusBarWidth:600,
		downloadCallback:function(){			
	        window.open($SCRIPT_ROOT+'/prostepview/stock1file/download/'+$("#step1_id").data("step1id"))
		},
	    onLoad: function(obj)
	    {
	    	var filename = $("#step1_id").data("stock1filename");
	    	var initfiles = setInterval(function(){
	    		if (typeof obj.createProgress !== "undefined") {
		    		filename&&obj.createProgress(filename); 
		    		clearInterval(initfiles);
	    		}
	    	},3000)

	        //页面加载时，onLoad回调。如果有需要在页面初始化时显示（比如：文件修改时）的文件需要在此方法中处理
	                //createProgress方法可以创建一个已上传的文件
	    },
	    deleteCallback: function(data,pd)
	    {
	        //文件删除时的回调方法。
	        //如：以下ajax方法为调用服务器端删除方法删除服务器端的文件
	        $.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/stock1file/'+$("#step1_id").data("step1id"),
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
/*
	$("#stock2_filepath").uploadFile({
		url: $SCRIPT_ROOT+'/prostepview/stock2file/'+$("#step1_id").data("step1id"),
	    maxFileCount: 1,                		   //上传文件个数（多个时修改此处
	    //allowedTypes: 'csv',  				       //允许上传的文件式
	    showFileSize: false,
	    showDone: false,                           //是否显示"Done"(完成)按钮
	    showDelete: true,                          //是否显示"Delete"(删除)按钮
	    showDownload:true,
	    statusBarWidth:600,
		downloadCallback:function(){			
	        window.open($SCRIPT_ROOT+'/prostepview/stock2file/download/'+$("#step1_id").data("step1id"))
		},
	    onLoad: function(obj)
	    {
	    	var filename = $("#step1_id").data("stock2filename");
	    	if (typeof obj.createProgress !== "undefined") {
	    	 	filename&&obj.createProgress(filename); 
	    	}

	        //页面加载时，onLoad回调。如果有需要在页面初始化时显示（比如：文件修改时）的文件需要在此方法中处理
	                //createProgress方法可以创建一个已上传的文件
	    },
	    deleteCallback: function(data,pd)
	    {
	        //文件删除时的回调方法。
	        //如：以下ajax方法为调用服务器端删除方法删除服务器端的文件
	        $.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/stock2file/'+$("#step1_id").data("step1id"),
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
*/
	/*part 1 Stock Assessment Model Input 2 end*/

	/*part 2 general input start */
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
	    //maxFileCount: 1,                		   //上传文件个数（多个时修改此处
	    allowedTypes: 'csv',  				       //允许上传的文件式
	    showFileSize: false,
	    showDone: false,                           //是否显示"Done"(完成)按钮
	    showDelete: true,                          //是否显示"Delete"(删除)按钮
	    showDownload:true,
	    statusBarWidth:600,
		downloadCallback:function(data){		
	        window.open($SCRIPT_ROOT+'/prostepview/rndSeedFile/download/'+$("#step1_id").data("step1id")+"/"+data[0])
		},
	    onLoad: function(obj)
	    {
	    	var filenames = $("#step1_id").data("rndfiles");
	    	var initfiles = setInterval(function(){
	    		if (typeof obj.createProgress !== "undefined") {
		    		filenames.forEach(function(ele){
		    			obj.createProgress(ele);
		    		});
		    		clearInterval(initfiles);
	    		}
	    	},3000)
	    	
	    	//filename&&obj.createProgress(filename);
	        //页面加载时，onLoad回调。如果有需要在页面初始化时显示（比如：文件修改时）的文件需要在此方法中处理
	               //createProgress方法可以创建一个已上传的文件
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
	            contentType:"application/json",
	            data:JSON.stringify({'filename':data[0]}),
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


	/*part 2 general input end */

	/* part 4 initial population start */
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
		        //height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
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
		    				title:"Stock 1 Mean (1000s)",
		    				field:"stock_1_mean",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 1 Mean (1000s)',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 1 mean must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 1 mean must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Stock 2 Mean (1000s)",
		    				field:"stock_2_mean",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 2 Mean (1000s)',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 2 mean must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 2 mean must larger than 0';
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
	    	$("#table-ibParam").parent('.bootstrap-table').css('margin-bottom', '30px');
	    });
        
	}
	/* part 4 initial population end */

	/* part 5 biological parameters start */
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
		        //height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
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
		    				title:"Stock 1 Weight-at-age (kg)",
		    				field:"weight_at_age_1",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 1 Weight-at-age',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 1 Weight-at-age must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 1 Weight-at-age must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Stock 1 Fecundity</br>(# of eggs)",
		    				field:"fec_at_age_1",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 1 Fecundity',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 1 Fecundity must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 1 Fecundity must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Stock 2 Weight-at-age (kg)",
		    				field:"weight_at_age_2",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 2 Weight-at-age',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 2 Weight-at-age must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 2 Weight-at-age must larger than 0';
				                }
		                    }
		    			},
		    			{
		    				title:"Stock 2 Fecundity</br>(# of eggs)",
		    				field:"fec_at_age_2",
		    				editable: {
			                    type: 'text',
			                    title: 'Stock 2 Fecundity',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'Stock 2 Fecundity must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'Stock 2 Fecundity must larger than 0';
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
	    	$("#table-bioParam").parent('.bootstrap-table').css('margin-bottom', '30px');
	    });
        
	}
	/* part 5 biological parameters end */

	/* part 6 natural mortality start */
	

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
		        //height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
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
		    				title:"Mean 1 (year<sup>-1</sup>)",
		    				field:"mean_1",
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
		    			/*
		    			{
		    				title:"CV 1 (Log-normal Dist.)",
		    				field:"cv_mean_1",
		    				editable: {
			                    type: 'text',
			                    title: 'CV (Log-normal Dist.)',
			                    validate: function (v) {
			                        if (isNaN(v)) return 'CV must be number';
			                        var stockmean = parseFloat(v);
			                        if (stockmean <= 0) return 'CV must larger than 0';
				                }
		                    }
		    			},
		    			*/
		    			{
		    				title:"Mean 2 (year<sup>-1</sup>)",
		    				field:"mean_2",
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
	    	$("#table-mortality").parent('.bootstrap-table').css('margin-bottom', '30px');
	    });
        
	}
	
	/* part 6 natural mortality end */

	/* part 7 recruitment start */
	function initRecrument(){

		$("#form-recruitment input[name='fromHisStock1'],input[name='fromFmlStock1'],input[name='historySt1'],input[name^='hst1'],input[name='historySt1_early'],input[name^='hst1_early'],input[name='formulaStock1'],input[name^='fml1']").prop('disabled','disabled');
		
		if($("input[name='recruitTypeStock1']:checked").val()==1){

			$("#form-recruitment input[name='fromHisStock1']").prop('disabled','');
			if(!$("input[name='fromHisStock1']:checked").val()||$("input[name='fromHisStock1']:checked").val()==0){
				$("#hisin1984").prop('checked', true);
				$("input[name='historySt1_early']").prop('disabled','');
			}
			if($("input[name='historySt1']:checked").val()!=0){
				initHistroySt();
			}
			if($("input[name='historySt1_early']:checked").val()!=0){
				initHistroySt('_early');
			}			
			$("#form-recruitment input[name='formulaStock1']").prop('checked', false);
			$("#form-recruitment input[name='fromFmlStock1']").prop('checked', false);			

		}else if($("input[name='recruitTypeStock1']:checked").val()==2){

			$("#form-recruitment input[name='fromFmlStock1']").prop('disabled','');
			$("#form-recruitment input[name='formulaStock1']").prop('disabled','');
			$("input[name^='fml1Mbhm']").prop('disabled','');
			$("#fml1radioBHM").prop('checked', true);
			if(!$("input[name='fromFmlStock1']:checked").val()||$("input[name='fromFmlStock1']:checked").val()==0){
				$("#fmlin1984").prop('checked', true);
				$("input[name='fml1MbhmR0']").prop('disabled','disabled');
				$("input[name='fml1MbhmR0_early']").prop('disabled','');
			}else if($("input[name='fromFmlStock1']:checked").val()==2){				
				$("input[name='fml1MbhmR0']").prop('disabled','');
				$("input[name='fml1MbhmR0_early']").prop('disabled','disabled');
			}			
			$("#form-recruitment input[name='fromHisStock1']").prop('checked', false);
			$("#form-recruitment input[name='historySt1']").prop('checked', false);

		}

	}

	function initHistroySt(early){
		$("input[name^='hst1']").prop('disabled','disabled');
		$("input[name='historySt1"+early+"']:checked").val()==1&&$("#hst1"+"_lower"+early).prop('disabled','');
		$("input[name='historySt1"+early+"']:checked").val()==2&&$("#hst1"+"_median"+early).prop('disabled','');
		$("input[name='historySt1"+early+"']:checked").val()==3&&$("#hst1"+"_mean"+early).prop('disabled','');
		$("input[name='historySt1"+early+"']:checked").val()==4&&$("#hst1"+"_upper"+early).prop('disabled','');
	}

	$("input[name='recruitTypeStock1']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		initRecrument();
	
	});

	$("input[name='fromHisStock1']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */		
		if($("input[name='fromHisStock1']:checked").val()==1){
			$("input[name='historySt1']").prop('disabled','disabled');
			$("input[name='historySt1_early']").prop('disabled','');
			initHistroySt("_early");
		}else if($("input[name='fromHisStock1']:checked").val()==2){
			$("input[name='historySt1']").prop('disabled','');
			$("input[name='historySt1_early']").prop('disabled','disabled');
			initHistroySt();
		}
	
	});

	$("input[name='historySt1']").on('change', function(event) {
		initHistroySt('');
	});

	$("input[name='historySt1_early']").on('change', function(event) {
		initHistroySt('_early');
	});

	$("input[name='fromFmlStock1']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		if($("input[name='fromFmlStock1']:checked").val()==1){
			$("input[name='fml1MbhmR0']").prop('disabled','disabled');
			$("input[name='fml1MbhmR0_early']").prop('disabled','');
		}else if($("input[name='fromFmlStock1']:checked").val()==2){
			$("input[name='fml1MbhmR0']").prop('disabled','');
			$("input[name='fml1MbhmR0_early']").prop('disabled','disabled');
		}
	});

	/* part 7 recruitment end */

	/* part 10 Management Options Part IV start */
	$("input[name='mg4_season']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		if($("input[name='mg4_season']:checked").val()==1){
			$("#mg4_act_catch_hire").prop('disabled','');
			$("#mg4_act_catch_private").prop('disabled','');
			$("#mg4_input_hire").prop('disabled','disabled');
			$("#mg4_hire_length").prop('disabled','disabled');
			$("#mg4_input_private").prop('disabled','disabled');
			$("#mg4_private_length").prop('disabled','disabled');

		}else if($("input[name='mg4_season']:checked").val()==2){
			
			$("#mg4_act_catch_hire").prop('disabled','disabled');
			$("#mg4_act_catch_private").prop('disabled','disabled');
			$("#mg4_input_hire").prop('disabled','');
			$("#mg4_hire_length").prop('disabled','');
			$("#mg4_input_private").prop('disabled','');
			$("#mg4_private_length").prop('disabled','');
			

		}
	});

	/* part 10 Management Options Part IV end */

	$('#stock1_amount').on('input',function(e) {
		cur_value = parseFloat($(this).val());
		console.log(cur_value);
		if(cur_value>=0&&cur_value<=100){
			$('#stock2_amount').val(100-cur_value);
		}

	});

	$('#sec_recreational').on('input',function(e) {
		cur_value = parseFloat($(this).val());
		console.log(cur_value);
		if(cur_value>=0&&cur_value<=100){
			$('#sec_commercial').val(100.00-cur_value);
		}

	});

	$('#sec_hire').on('input',function(e) {
		cur_value = parseFloat($(this).val());
		console.log(cur_value);
		if(cur_value>=0&&cur_value<=100){
			$('#sec_private').val(100.00-cur_value);
		}

	});

	$('#sec_headboat').on('input',function(e) {
		cur_value = parseFloat($(this).val());
		console.log(cur_value);
		if(cur_value>=0&&cur_value<=100){
			$('#sec_charterboat').val(100.00-cur_value);
		}

	});


	/* initialization start*/
	//$("#start_projection").find("input").val(moment('2017-01-01').format('YYYY-MM-DD'));
	getIniPopu();
	getBioParam();
	getMortality();
	initRecrument();
    /* initialization end*/
	

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