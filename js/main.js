$(document).ready(function(){
	// Javascript to enable link to tab
	var url = document.location.toString();
	if (url.match('#')) {
		$('.nav-tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
		history.pushState( null, null, $(this).attr('href') );
		window.scrollTo(0, 0);
	} 

	// Change hash for page-reload
	$('.nav-tabs a').on('shown.bs.tab', function (e) {
		window.location.hash = e.target.hash;
		history.pushState( null, null, $(this).attr('href') );
	});

	$('.nav-tabs li a').click( function(e) {
		history.pushState( null, null, $(this).attr('href') );
	});

	$("#submit_btn").click(function() { 
	   
		var proceed = true;
		//simple validation at client's end
		//loop through each field and we simply change border color to red for invalid fields       
		$("#contact input[required=true], #contact textarea[required=true]").each(function(){
			$(this).css('border-color',''); 
			if(!$.trim($(this).val())){ //if this field is empty 
				$(this).css('border-color','red'); //change border color to red   
				proceed = false; //set do not proceed flag
			}
			//check invalid email
			var email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/; 
			if($(this).attr("type")=="email" && !email_reg.test($.trim($(this).val()))){
				$(this).css('border-color','red'); //change border color to red   
				proceed = false; //set do not proceed flag              
			}
		});
	   
		if(proceed) //everything looks good! proceed...
		{
			//get input field values data to be sent to server
			post_data = {
				'sender_name'   : $('input[name=sender_name]').val(), 
				'email'    		: $('input[name=email]').val(), 
				'phone'  		: $('input[name=phone]').val(), 
				'subject'       : $('select[name=subject]').val(), 
				'body'          : $('textarea[name=body]').val(),
				'recaptcha_challenge_field' : $('input[name=recaptcha_challenge_field]').val(),
				'recaptcha_response_field' : $('input[name=recaptcha_response_field]').val()
			};
			
			//Ajax post data to server
			$.post('mailout.php', post_data, function(response){  
				if(response.type == 'error'){ //load json data from server and output message     
					output = '<div class="error">'+response.text+'</div>';
				}else{
					output = '<div class="success">'+response.text+'</div>';
					//reset values in all input fields
					$("#contact  input[required=true], #contact textarea[required=true]").val(''); 
					$("#contact #contactBody").slideUp(); //hide form after success
				}
				$("#contact #contactResults").hide().html(output).slideDown();
			}, 'json');
		}
	});
	
	//reset previously set border colors and hide all message on .keyup()
	$("#contact  input[required=true], #contact textarea[required=true]").keyup(function() { 
		$(this).css('border-color',''); 
		$("#result").slideUp();
	});

});
