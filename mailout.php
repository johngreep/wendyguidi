<?php
    if($_SERVER['HTTP_ORIGIN'] == "http://wendyguidi.com")
    {
        header('Access-Control-Allow-Origin: http://wendyguidi.com');
    }
    else
    {    
        header('Content-Type: text/html');
        echo "<html>";
        echo "<head>";
        echo "   <title>Mailout Function</title>";
        echo "</head>";
        echo "<body>",
            "<p>This resource behaves two-fold:";
        echo "<ul>",
                "<li>If accessed from <code>http://wendyguidi.com</code> it performs its function.</li>";
        echo " <li>If accessed from any other origin including from simply typing in the URL into the browser's address bar,";
        echo "you get this HTML document</li>", 
            "</ul>",
        "</body>",
        "</html>";
        die();
    }
    
    // http://www.sanwebe.com/2011/12/making-simple-jquery-ajax-contact-form

    require_once('recaptchalib.php');
    $privatekey = "6LdXse8SAAAAALuSpyS4P9YVYhEM6m1gmjyND29r";


if($_POST)
{    
    //check if its an ajax request, exit if not
    if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
        
        $output = json_encode(array( //create JSON data
            'type'=>'error', 
            'text' => 'Sorry Request must be Ajax POST'
        ));
        die($output); //exit script outputting json data
    } 

    $resp = recaptcha_check_answer ($privatekey,
                                $_SERVER["REMOTE_ADDR"],
                                $_POST["recaptcha_challenge_field"],
                                $_POST["recaptcha_response_field"]);
    
    if (!$resp->is_valid) {
        // What happens when the CAPTCHA was entered incorrectly
        $output = json_encode(array('type'=>'error', 'text' => "The reCAPTCHA wasn't entered correctly. (" . $resp->error . ")"));
        die($output);
    }

    //Sanitize input data using PHP filter_var().
    $email          = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $subject        = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
    $body           = filter_var($_POST['body'], FILTER_SANITIZE_STRING);
    $phone          = filter_var($_POST["phone"], FILTER_SANITIZE_NUMBER_INT);
    $sender_name    = filter_var($_POST["sender_name"], FILTER_SANITIZE_STRING);
    switch ($subject) {
        case "Webmaster":
            $to_email = "john@wendyguidi.com";    
            break;
        case "Request for Information":
        case "Product Inquiry":
        case "Other Inquiry":
            $to_email = "wendy@wendyguidi.com, john@wendyguidi.com";
            break;
        default:
            $subject = "Invalid Subject";
            $to_email = "john@wendyguidi.com";
            break;
    }

    //additional php validation
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){ //email validation
        $output = json_encode(array('type'=>'error', 'text' => 'Please enter a valid email!'));
        die($output);
    }
    if(!filter_var($phone, FILTER_SANITIZE_NUMBER_FLOAT)){ //check for valid numbers in phone number field
        $output = json_encode(array('type'=>'error', 'text' => 'Enter only digits in phone number'));
        die($output);
    }
    if(strlen($body)<3){ //check emtpy message
        $output = json_encode(array('type'=>'error', 'text' => 'Too short message! Please enter something.'));
        die($output);
    }
    if (substr_count($body,'http') + substr_count($body,'href')>1) {
       $output = json_encode(array('type'=>'error', 'text' => "Message not sent.  This looks like spam. <br/>Messages are not displayed publicly, and spam is ignored."));
       die($output);
    }

    if (getenv(HTTP_X_FORWARDED_FOR)){ 
        $ip=getenv(HTTP_X_FORWARDED_FOR); 
    } 
    else { 
        $ip=getenv(REMOTE_ADDR); 
    }
    
    $sender = "$sender_name <".$email.">";

    //email body
    $message_body = "Message to www.wendyguidi.com from $sender_name :\n" .
                    "----------------\n\n$body\n\n----------------\nPhone Number: ".$phone."\nIP:$ip\n";

    //proceed with PHP email.
    $headers = 'From: '.$email.'' . "\r\n" .
    'Reply-To: '. $sender . "\r\n" .
    'X-Mailer: PHP/' . phpversion();
    
    $send_mail = mail($to_email, "[wendyguidi.com] " . $subject, $message_body, $headers);
    
    if(!$send_mail)
    {
        //If mail couldn't be sent output error. Check your PHP email configuration (if it ever happens)
        $output = json_encode(array('type'=>'error', 'text' => 'Could not send mail! Please check your PHP mail configuration.'));
        die($output);
    }else{
        $output = json_encode(array('type'=>'message', 'text' => 'Hi '.$sender_name .'!<br/> Thank you for your email'));
        die($output);
    }
}
?>