<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certus Diagnostics | Signup</title>
    <link rel="icon" href="Logo.jpg" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    
    <style>
        *
        {
            margin:0px;
            padding:0px;
            box-sizing: border-box;
            font-family: 'Gill Sans','Gill Sans MT',Calibri,'Trubuchet MS',sans-serif;
        }
        #particles-js
        {
            width:100%;
            height:100vh;
            
        }
    </style>
    <script>
        var allok=false;
        function check()
        {
            document.getElementById("d1").style.opacity=1;
            var p=document.getElementById("pass").value;
            var len=false,uc=false,lc=false,digit=false;
            if(p.length>7)
            {
                len=true;
            }
            for(var i=0;i<p.length;i++)
            {
                if(p[i]>='A' && p[i]<='Z')
                {
                    uc=true;
                }
                else if(p[i]>='a' && p[i]<='z')
                {
                    lc=true;
                }
                else if(p[i]>='0' && p[i]<='9')
                {
                    digit=true;
                }
            }
            allok=len&&uc&&lc&&digit;
            if(len)
            {
                document.getElementById("len").style.color='green';

            }
            else
            {
                document.getElementById("len").style.color='red';
            }
            if(uc)
            {
                document.getElementById("uc").style.color='green';
            }
            else{
                document.getElementById("uc").style.color='red';
            }
            if(lc){
                document.getElementById("lc").style.color='green';
            }
            else
            {
                document.getElementById("lc").style.color='red';
            }
            if(digit)
            {
                document.getElementById("digit").style.color='green';
            }
            else
            {
                document.getElementById("digit").style.color='red';
            }



            if(allok)
            {
                document.getElementById("btn1").style.opacity=1;
            }
            
            
        }

        function go()
        {
            var check=false;
            var name=document.getElementById("name").value;
            var phone=document.getElementById("phone").value;
            var email=document.getElementById("email").value;
            var username=document.getElementById("username").value;
            var check_name=false,check_phone=false,check_username=false;
            var pass=document.getElementById("pass").value;
            if(name.length<5)
            {
                document.getElementById("name_label").innerHTML+=" *";
                document.getElementById("name_label").style.color="red";
               
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML+="Full Name Not Entered Correctly!!!<br>";    
            }
            else
            {
                check_name=true;
            }
            if(phone.length<10 || isNaN(phone))
            {
                document.getElementById("phone_label").innerHTML+=" *";
                document.getElementById("phone_label").style.color="red";
               
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML+="Phone Number Must be 10 Digits!!!<br>";    
            }
            else
            {
                check_phone=true;
            }
            var valid_email=false;
            for(var i=0;i<email.length;i++)
            {
                if(email[i]=='@')
                {
                    valid_email=true;
                }
                else if(email[i]=='.')
                {
                    valid_email=valid_email&true;
                }
            }
            if(!valid_email || email.len<7)
            {
                document.getElementById("email_label").innerHTML+=" *";
                document.getElementById("email_label").style.color="red";
               
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML+="Email Not Entered Correctly!!!<br>";    
            }
            if(username.length<5)
            {
                document.getElementById("username_label").innerHTML+=" *";
                document.getElementById("username_label").style.color="red";
               
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML+="Username Not Entered Correctly!!!<br>";    
            }
            else
            {
                check_username=true;
            }
            if(!allok)
            {
                document.getElementById("pass_label").innerHTML+=" *";
                document.getElementById("pass_label").style.color="red";
               
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML+="Password Not Entered Correctly!!!<br>";    
            }
            check=allok&&valid_email&&check_name&&check_phone&&check_username;
            if(check)
            {
                document.getElementById("btn1").style.opacity=1;
                document.getElementById("alert").style.opacity=0;
                //Sending Ajax request to php server
                var xhttp=new XMLHttpRequest();
                xhttp.onreadystatechange=function()
                {
                    if(this.readyState==4 && this.status==200)
                    {
                        var ans=xhttp.responseText.trim();
                        if(ans=='success')
                        {
                            window.location.href = "index.php";
                        }
                        else
                        {
                            document.getElementById("alert").style.opacity=1;
                            document.getElementById("alert_message").innerHTML="Error in Creating Account!!!<br>Please Try Again with Another username";
                        }
                    }
                };
                xhttp.open("GET","signup_create_account.php?username="+username+"&password="+pass+"&name="+name+"&phone="+phone+"&email="+email,true);
                xhttp.send();
            }
            
        }


   </script>
</head>
<body style="background-color: rgb(226, 180, 255);" id="particles-js">
    
    <div class="container mt-lg-2" >
        <div style="flex-direction: row;" class="row ">
            <div class="col-sm-6 my-lg-2 ">
                <img src="lwb.png" style="width:250px;height:100px; margin-left: -25px; margin-top: 7px;" alt="Certus Diagnostics" class="img img-fluid">
            </div>
            <div class="col-sm-6">
                <nav class="navbar navbar-expand-lg navbar-light bg-light rounded-3 m-sm-5 my-lg-3 " style=" width: 92%; margin-left: 10px; ">
                    <div class="container-fluid">
                      <a class="navbar-brand" href="index.php">Certus</a>
                      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                      </button>
                      <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                          <li class="nav-item mt-lg-2">
                            <a class="nav-link " aria-current="page" href="#">Book A Test</a>
                          </li>
                          <li class="nav-item mt-lg-2">
                            <a class="nav-link" href="#">Your Reports</a>
                          </li>
                          <li class="nav-item dropdown mt-lg-2">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Store
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                              <li><a class="dropdown-item" href="#">Action</a></li>
                              <li><a class="dropdown-item" href="#">Another action</a></li>
                              <li><hr class="dropdown-divider"></li>
                              <li><a class="dropdown-item" href="search.php">Go to Store</a></li>
                            </ul>
                          </li>
                          
                          <li class="nav-item mt-lg-2">
                            <a class="nav-link" href="login.php" data-bs-toggle="tooltip" title="Login">Login</a>
                          </li>
                          
                          <li onclick="go()" class="cursor-pointer m-lg-1 m-sm-3 mb-sm-4 mt-lg-2"><svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-search font-extrabold" viewBox="0 0 16 16" style="padding-top: 5px; width: 30px; height:23px;" data-bs-toggle="tooltip" title="Search">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                          </svg></li>
                        </ul>
                      </div>
                    </div>
                  </nav>
            </div>
        </div>
        <div>
        <form>
            <div class="mb-3 mt-3">
                <label for="name" class="form-label" id="name_label">Full Name: </label>
                <input type="text" class="form-control" id="name" placeholder="Enter Full Name" name="name">
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label" id="phone_label">Phone Number: </label>
                <input type="text" class="form-control" id="phone" placeholder="Enter Phone Number" name="phone">
              </div>
              <div class="mb-3">
              <label for="email" class="form-label" id="email_label">Email: </label>
              <input type="email" class="form-control" id="email" placeholder="Enter email" name="email">
            </div>
            <div class="mb-3">
                <label for="username" class="form-label" id="username_label">New Username: </label>
                <input type="text" class="form-control" id="username" placeholder="Enter New Username" name="username">
              </div>
            <div class="mb-3">
              <label for="pass" class="form-label" id="pass_label">New Password:</label>
              <input type="password" class="form-control" id="pass" placeholder="Enter New Password" name="pass" onkeyup="check()">
                
                </div>
            <div class="mb-3 row">
                <input type="button" class="btn btn-primary mt-3 col-sm-1" id="btn1" onclick="go()" value="Submit" style="opacity: 0.5; height:37px;">
                <div class="col-sm-3 bg-transparent"></div>
                <div id="d1" class="col-sm-8 row " style="margin-top: 10px; opacity: 0;">
                    <div class="col-sm-3 row">
                        <div class="col-5 col-ld-7"><label style="width:100px;" id="len_label">Min Length(8)</label></div>
                        <div class="col-2 col-ld-2"><label  id="len" style="color:red;">*</label></div>
                    </div>
                
                <div class="col-sm-3 row">
                    <div class="col-5"><label style="width:100px;" id="uc_label">1 Upper Case</label></div>
                    <div class="col-2"><label id="uc" style="color:red;">*</label></div>
                </div>
                <div class="col-sm-3 row">
                    <div class="col-5"><label style="width:100px;" id="lc_label">1 Lower Case</label></div>
                    <div class="col-2"><label id="lc" style="color:red;">*</label></div>
                </div>
                <div class="col-sm-3 row">
                    <div class="col-5"><label style="width:100px;" id="dig_label">1 Digit</label></div>
                    <div class="col-2"><label id="digit" style="color:red;">*</label></div>
                </div>
            </div>
            </div>
          
             </form>
             <div class="alert alert-warning alert-dismissible fade show" id="alert" style="opacity:0;">
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                <strong>Warning</strong><p id="alert_message"></p>
              </div>
              
          </div>
        
</div>








    <script src="particles.js"></script>
    <script src="app.js"></script>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    
</body>
</html>