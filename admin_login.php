<?php
//Start the session
session_start();

?>
<!DOCTYPE html>
<html lang="en" >
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certus Diagnostics | Login</title>
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
    </style>

    <script>
        function go()
        {
            var username=document.getElementById("username").value;
            var password=document.getElementById("password").value;
            var allok=false;
            if(username.length<5)
            {
                document.getElementById("username_label").innerHTML+="*";
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML="Please Enter Username Correctly!!!<br>";

            }
            else
            {
                allok=true;
            }
            if(password.length<3)
            {
                document.getElementById("password_label").innerHTML+="*";
                document.getElementById("alert").style.opacity=1;
                document.getElementById("alert_message").innerHTML="Please Enter Password Correctly";
                

                allok=false;
            }
            if(allok)
            {
                document.getElementById("alert").style.opacity=0;
                //send AJAX request to php server

                var xhttp=new XMLHttpRequest();
                xhttp.onreadystatechange=function()
                {
                    if(this.readyState==4 && this.status==200)
                    {
                        var ans=xhttp.responseText.trim();
                        if(ans=='success')
                        {
                            document.getElementById("alert").style.opacity=1;
                            document.getElementById("alert_message").innerHTML="Log In Successful<br>";
                            document.getElementById("alert_message").innerHTML+="<?php
                            echo ($_SESSION["username"]);
                            ?>";
                            window.location.href="admin.php";
                        
                        }
                        else
                        {
                            document.getElementById("alert").style.opacity=1;
                            document.getElementById("alert_message").innerHTML="Invalid Username Or Password!!!<br>Please try again";
                        }
                    }
                };
                xhttp.open("GET","admin_login_check.php?username="+username+"&password="+password,true);
                xhttp.send();
            }
        }



    </script>
</head>
<body style="background-color: rgb(226, 180, 255);">
    
    <div class="container mt-lg-2" >
        <div style="flex-direction: row;" class="row ">
            <div class="col-sm-6 my-lg-2 ">
                <img src="lwb.png" style="width:250px;height:100px; margin-left: -25px; margin-top: 7px;" alt="Certus Diagnostics" class="img img-fluid">
            </div>
            <div class="col-sm-6">
            <nav class="navbar navbar-expand-lg navbar-light bg-light rounded-3 m-sm-5 my-lg-3 "
                         style=" width: 92%; margin-left: 10px; ">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="index.php">Certus</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
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
                                        <a class="nav-link dropdown-toggle" href="search.php" id="navbarDropdown"
                                           role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Store
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a class="dropdown-item" href="#">Action</a></li>
                                            <li><a class="dropdown-item" href="#">Another action</a></li>
                                            <li>
                                                <hr class="dropdown-divider">
                                            </li>
                                            <li><a class="dropdown-item" href="search.php">Go to Store</a></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item mt-lg-2">
                                        <a class="nav-link" href="login.php" data-bs-toggle="tooltip"
                                           title="Login"><?php
                                            if($_SESSION["username"]==null)
                                            {
                                                echo "Login";
                                            }
                                            else
                                            {
                                                echo $_SESSION["username"];
                                            }
                                           
                                           ?></a>
                                    </li>

                                    <li onclick="go()" class="cursor-pointer m-lg-1 m-sm-3 mb-sm-4 mt-lg-2"><svg
                                            xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                            class="bi bi-search font-extrabold" viewBox="0 0 16 16"
                                            style="padding-top: 5px; width: 30px; height:23px;" data-bs-toggle="tooltip"
                                            title="Search">
                                        <path
                                            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                        </svg></li>
                                </ul>
                            </div>
                        </div>
                    </nav>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-sm-7 text-center" style="color:rgb(44, 39, 46)">
                <h1>Login</h1>
                <form>
                    <div class="form-group form-row row">
                        <label for="username" class="col-sm-2" id="username_label">Username: </label>
                        <input type="text" class="form-control col-sm-5 mt-sm-2" id="username" name="username" placeholder="Enter Username"/>
                    </div>
                    <div class="form-group form-row row ">
                        <label for="password" class="col-sm-2 mt-sm-3" id="password_label">Password: </label>
                        <input type="password" class="form-control col-sm-5 mt-sm-2" id="password" name="password" placeholder="Enter Password"/>
                    </div><br>
                    <div class="form-group form-row row">
                        <input type="button" class="btn btn-primary form-control col-sm-7 mt-sm-2" value="Log In" onclick="go()"/> 
                    </div><br>
                    
                </form>
            </div>
            <div class="col-sm-5 ">
                <img src="login_photo.jpg" style="margin-top: 13px;" class="img img-fluid img-thumbnail img-rounded  m-lg-4 " alt="Certus Diagnostics India">
            </div>
            <div class="alert alert-warning alert-dismissible fade show" id="alert" style="opacity:0;">
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                <strong>Warning</strong><p id="alert_message"></p>
              </div>
        </div>


        
</div>








    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    
</body>
</html>