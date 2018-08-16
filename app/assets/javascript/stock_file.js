$(function() {

	$("input[name='defaultfile']").click(function(event) {	
		 var cnfrm = confirm('Are you sure ? You want to set this file as default ?');
             if(cnfrm == true){

             }else{
                 return false;
             }
	});
})