$(function() {

	$("input[name='defaultfile']").click(function(event) {	
		 var cnfrm = confirm('Are you sure ? You want to set this file as default ?');
             if(cnfrm == true){

             	$("#mask").addClass('lmask');

             	var fileid = $(this).data('fileid');
             	console.log(fileid);

             	$.ajax({
		            cache: false,
		            url: 'http://localhost:8000/defaultFile',
		            crossDomain: true,
		            type: "POST",
		            dataType: "json",
		            data: JSON.stringify({"file_id":fileid,"store_path":"~/msedata/"}),
		            success: function(data) 
		            {
		                 $("#mask").removeClass('lmask');
		            }
		        });

             }else{
                 return false;
             }
	});
})