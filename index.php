<?php
//Start the session
session_start();
?>

<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certus Diagnostics</title>
        <link rel="icon" href="Logo.jpg" type="image/x-icon">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
              integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

        <script>

            function go() {
                window.location.href = "search.php";
            }
            function changeButtonColor() {
                let buttons = document.querySelectorAll("button");
                buttons.forEach(button => {
                    button.style.backgroundColor = "purple";
                    console.log('mouse over');
                });
            }
        </script>
        <style>
            * {
                margin: 0px;
                padding: 0px;
                box-sizing: border-box;
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trubuchet MS', sans-serif;

            }

            #particles-js {
                width: 100%;
                height: 100vh;

            }
        </style>
    </head>

    <body  style="background-color: rgb(226, 180, 255);" >
        <div class="container mt-lg-2">
            <div style="flex-direction: row;" class="row ">
                <div class="col-sm-6 my-lg-2 ">
                    <img src="lwb.png" style="width:250px;height:100px; margin-left: -25px; margin-top: 7px;"
                         alt="Certus Diagnostics" class="img img-fluid">
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
                                        <a class="nav-link" href="reports.php">Your Reports</a>
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

                                    <li class="nav-item dropdown mt-lg-2">
                                        <a class="nav-link <?php
                                        if($_SESSION["username"]!=null)
                                        {
                                            echo "dropdown-toggle";
                                        }
                                        ?>" href="login.php" 
                                        <?php 
                                        if($_SESSION["username"]!=null)
                                        { 
                                         echo 'id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"';}?>>
                                            <?php
                                            if($_SESSION["username"]==null)
                                            {
                                                echo "Login";
                                            }
                                            else
                                            {
                                                echo $_SESSION["username"];
                                            }
                                            ?>
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a class="dropdown-item" href="#">Certus Id:&nbsp;&nbsp;C-<?php
                                            echo $_SESSION["sno"];
                                            ?></a></li>
                                            <li><a class="dropdown-item" href="#">Phone: &nbsp;<?php
                                            echo substr($_SESSION["phone"],0,4)."****".substr($_SESSION["phone"],-2,2);
                                            ?></a></li>
                                            <li><a class="dropdown-item" href="#">Email: &nbsp;<?php
                                            echo substr($_SESSION["email"],0,5)."*******".substr($_SESSION["email"],-10,10);
                                            ?></a></li>
                                            <li>
                                                <hr class="dropdown-divider">
                                            </li>
                                            <li><a class="dropdown-item" href="logout.php">Log Out</a></li>
                                        </ul>
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
            <div class="alert alert-success alert-dismissible fade show" id="alert" role="alert" style="opacity:0; margin-top: 20px;">
                
                <strong id="alert_heading">Welcome <?php echo $_SESSION["username"];
                ?></strong><p id="alert_message">Log in Successful</p>
              </div>
            <div class="row mx-sm-auto" style="height:970px;">
                <div class="col-sm-6 w-auto" style="margin-top: 10px; color: rgb(36, 33, 33)">
                    <h1 style="font-family: sans-serif; font-size: 3rem;">Private Blood Tests Amritsar</h1>
                    <p class="  py-3 mr-11" style="font-family: ui-serif, Georgia, Cambria, Times New Roman, Times, serif; font-size: 1.125rem;
                       line-height: 1.75rem;font-style: italic;">
                        Behind every test is a person, a fellow human, who deserves our very best. Their lives may depend on
                        it. We help in identifying disease markers earlier. We make it easier for people to live longer and
                        healthier lives.
                    </p>
                    <div class="button pl-7 py-4">
                        <button class=" btn  w-auto mx-sm-auto"
                                style="background-color: rgb(147 51 234); color:white; border-radius: 0.6rem"
                                >In-Store Tests</button>
                        <button class=" btn  w-auto mx-4"
                                style="background-color: rgb(147 51 234); color:white; border-radius: 0.6rem"
                                onmouseover="changeButtonColor()">At-Home Tests</button>

                    </div>
                </div>

                <div class="col-sm-6 w-auto">
                    <img src="a4_1.png" style="transform: scale(0.3); margin-left: -980px; margin-top: -1350px;"
                         alt="Happy Family" class="img" />
                </div>
            </div>

            <div style="margin-top: 40px;" class="row">
                <div class="col-sm-2">
                    
                </div>
                <!-- Carousel -->
                <div id="demo" class="carousel slide col-sm-4" data-bs-ride="carousel" style="margin-left: 30px;">
                    <!-- Indicators/dots -->
                    <div class="carousel-indicators" style="margin-bottom:-40px; margin-left: -14px;">
                        <button type="button" data-bs-target="#demo" data-bs-slide-to="0" class="active"></button>
                        <button type="button" data-bs-target="#demo" data-bs-slide-to="1"></button>
                        <button type="button" data-bs-target="#demo" data-bs-slide-to="2"></button>
                        <button type="button" data-bs-target="#demo" data-bs-slide-to="3"></button>
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <div class="card col-sm-2" style="width: 18rem; margin-right: 7px;">
                                <img class="card-img-top" src="sources/Bronze-Package-Graphics-Design.png"
                                     alt="Bronze Package Certus Diagnostics">
                                <div class="card-body" style="background-color: rgb(147 51 234); width:100%;">
                                    <h5 class="card-title text-white font-bold text-center">Blood Profile</h5>

                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item text-white font-bold flex justify-between"
                                        style="background-color: rgb(147 51 234);">Full Blood Count <svg style="position: absolute;
                                                                                                     right: 1;
                                                                                                     margin-right: 10px; background-color: rgb(34 197 94); margin-left: 106px;"
                                                                                                     xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                                                                     class=" mt-1" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Fasting Glucose <svg style="position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94); margin-left: 110px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-24 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Lipid Profile <svg style="position: absolute;
                                                                                                  right: 1;
                                                                                                  margin-right: 10px; background-color: rgb(34 197 94); margin-left: 140px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                  width="24" height="24" fill="currentColor"
                                                                                                  class="bi bi-check-lg ml-32 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Kidney Function Test <svg style="position: absolute;
                                                                                                         right: 1;
                                                                                                         margin-right: 10px; background-color: rgb(34 197 94);margin-left: 72px;"
                                                                                                         style="background-color: rgb(34 197 94); " xmlns="http://www.w3.org/2000/svg"
                                                                                                         width="24" height="24" fill="currentColor"
                                                                                                         class="bi bi-check-lg ml-14 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Urinalysis <svg style="position: absolute;
                                                                                               right: 1;
                                                                                               margin-right: 10px; background-color: rgb(34 197 94);margin-left: 153px;" xmlns="http://www.w3.org/2000/svg"
                                                                                               width="24" height="24" fill="currentColor"
                                                                                               class="bi bi-check-lg ml-36 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Liver Function Test <svg style="position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 86px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-20 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Thyroid Function Test<br>(T3,T4,TSH 3rd
                                        Gen) <svg style="position: absolute;
                                                  right: 1;
                                                  margin-right: 10px; background-color: rgb(34 197 94);margin-left: 74px;" xmlns="http://www.w3.org/2000/svg"
                                                  width="24" height="24" fill="currentColor"
                                                  class="bi bi-check-lg ml-16 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">ESR <svg style="position: absolute;
                                                                                        right: 1;
                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 192px;" xmlns="http://www.w3.org/2000/svg"
                                                                                        width="24" height="24" fill="currentColor"
                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">HbA1C <svg style="position: absolute;
                                                                                          right: 1;
                                                                                          margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 171px;" xmlns="http://www.w3.org/2000/svg"
                                                                                          width="24" height="24" fill="currentColor"
                                                                                          class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">C- Reactive Protein <svg style="position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 80px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Iron / Ferritin <svg
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                            class="bi bi-x-lg font-extrabold text-red-600" style="position: absolute;
                                            right: 1;
                                            margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 130px;" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin D <svg style="    position: absolute;
                                                                                              right: 1;
                                                                                              margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 150px;"
                                                                                              xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                                                              class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin B12 <svg style="    position: absolute;
                                                                                                right: 1;
                                                                                                margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 135px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                width="24" height="24" fill="currentColor"
                                                                                                class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Electrolytes <svg style="    position: absolute;
                                                                                                 right: 1;
                                                                                                 margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 133px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                 width="24" height="24" fill="currentColor"
                                                                                                 class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white bg-purple-600 text-center font-extrabold "
                                        style="background-color: rgb(147 51 234);">Rs. 799</li>
                                </ul>
                                <div class="card-body" style="background-color: rgb(168 85 247 )">
                                    <a href="#" class="card-link text-white">Buy Now</a>
                                    <a href="#" class="card-link text-white px-4 mx-4">Go to Store</a>
                                </div>
                            </div>
                        </div>
                        <div class="carousel-item">
                            <div class="card col-sm-2 " style="width: 18rem; margin-right: 7px;">
                                <img class="card-img-top" src="sources/Silver-Package-Graphics-Design.png"
                                     alt="Bronze Package Certus Diagnostics">
                                <div class="card-body" style="background-color: rgb(147 51 234); width:100%;">
                                    <h5 class="card-title text-white font-bold text-center">Blood Profile</h5>

                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item text-white font-bold flex justify-between"
                                        style="background-color: rgb(147 51 234);">Full Blood Count <svg style="    position: absolute;
                                                                                                     right: 1;
                                                                                                     margin-right: 10px; background-color: rgb(34 197 94); margin-left: 106px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                     width="24" height="24" fill="currentColor" class=" mt-1" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Fasting Glucose <svg style="    position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94); margin-left: 110px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-24 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Lipid Profile <svg style="    position: absolute;
                                                                                                  right: 1;
                                                                                                  margin-right: 10px; background-color: rgb(34 197 94); margin-left: 140px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                  width="24" height="24" fill="currentColor"
                                                                                                  class="bi bi-check-lg ml-32 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Kidney Function Test <svg style="    position: absolute;
                                                                                                         right: 1;
                                                                                                         margin-right: 10px; background-color: rgb(34 197 94);margin-left: 72px;" style="background-color: rgb(34 197 94);"
                                                                                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                                                                         class="bi bi-check-lg ml-14 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Urinalysis <svg style="    position: absolute;
                                                                                               right: 1;
                                                                                               margin-right: 10px; background-color: rgb(34 197 94);margin-left: 153px;" xmlns="http://www.w3.org/2000/svg"
                                                                                               width="24" height="24" fill="currentColor"
                                                                                               class="bi bi-check-lg ml-36 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Liver Function Test <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 86px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-20 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Thyroid Function Test<br>(T3,T4,TSH 3rd
                                        Gen) <svg style="    position: absolute;
                                                  right: 1;
                                                  margin-right: 10px; background-color: rgb(34 197 94);margin-left: 74px;"
                                                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                  class="bi bi-check-lg ml-16 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">ESR <svg style="    position: absolute;
                                                                                        right: 1;
                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 192px;" xmlns="http://www.w3.org/2000/svg"
                                                                                        width="24" height="24" fill="currentColor"
                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">HbA1C <svg style="    position: absolute;
                                                                                          right: 1;
                                                                                          margin-right: 10px; background-color: rgb(34 197 94);margin-left: 172px;" xmlns="http://www.w3.org/2000/svg"
                                                                                          width="24" height="24" fill="currentColor"
                                                                                          class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">C- Reactive Protein <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 80px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Iron / Ferritin <svg
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                            class="bi bi-x-lg font-extrabold text-red-600" style="    position: absolute;
                                            right: 1;
                                            margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 130px;" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin D <svg style="    position: absolute;
                                                                                              right: 1;
                                                                                              margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 150px;" xmlns="http://www.w3.org/2000/svg"
                                                                                              width="24" height="24" fill="currentColor"
                                                                                              class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin B12 <svg style="    position: absolute;
                                                                                                right: 1;
                                                                                                margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 135px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                width="24" height="24" fill="currentColor"
                                                                                                class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Electrolytes <svg style="    position: absolute;
                                                                                                 right: 1;
                                                                                                 margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 133px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                 width="24" height="24" fill="currentColor"
                                                                                                 class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white bg-purple-600 text-center font-extrabold "
                                        style="background-color: rgb(147 51 234);">Rs. 1199</li>
                                </ul>
                                <div class="card-body" style="background-color: rgb(168 85 247 )">
                                    <a href="#" class="card-link text-white">Buy Now</a>
                                    <a href="#" class="card-link text-white px-4 mx-4">Go to Store</a>
                                </div>
                            </div>
                        </div>
                        <div class="carousel-item">
                            <div class="card col-sm-2" style="width: 18rem; margin-right: 7px;">
                                <img class="card-img-top" src="sources/Gold-Package-Graphics-Design.png"
                                     alt="Bronze Package Certus Diagnostics">
                                <div class="card-body" style="background-color: rgb(147 51 234); width:100%;">
                                    <h5 class="card-title text-white font-bold text-center">Blood Profile</h5>

                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item text-white font-bold flex justify-between"
                                        style="background-color: rgb(147 51 234);">Full Blood Count <svg style="    position: absolute;
                                                                                                     right: 1;
                                                                                                     margin-right: 10px; background-color: rgb(34 197 94); margin-left: 106px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                     width="24" height="24" fill="currentColor" class=" mt-1" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Fasting Glucose <svg style="    position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94); margin-left: 110px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-24 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Lipid Profile <svg style="    position: absolute;
                                                                                                  right: 1;
                                                                                                  margin-right: 10px; background-color: rgb(34 197 94); margin-left: 140px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                  width="24" height="24" fill="currentColor"
                                                                                                  class="bi bi-check-lg ml-32 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Kidney Function Test <svg style="    position: absolute;
                                                                                                         right: 1;
                                                                                                         margin-right: 10px; background-color: rgb(34 197 94);margin-left: 72px;" style="background-color: rgb(34 197 94);"
                                                                                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                                                                         class="bi bi-check-lg ml-14 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Urinalysis <svg style="    position: absolute;
                                                                                               right: 1;
                                                                                               margin-right: 10px; background-color: rgb(34 197 94);margin-left: 153px;" xmlns="http://www.w3.org/2000/svg"
                                                                                               width="24" height="24" fill="currentColor"
                                                                                               class="bi bi-check-lg ml-36 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Liver Function Test <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 86px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-20 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Thyroid Function Test<br>(T3,T4,TSH 3rd
                                        Gen) <svg style="    position: absolute;
                                                  right: 1;
                                                  margin-right: 10px; background-color: rgb(34 197 94);margin-left: 74px;" xmlns="http://www.w3.org/2000/svg"
                                                  width="24" height="24" fill="currentColor"
                                                  class="bi bi-check-lg ml-16 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">ESR <svg style="    position: absolute;
                                                                                        right: 1;
                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 192px;" xmlns="http://www.w3.org/2000/svg"
                                                                                        width="24" height="24" fill="currentColor"
                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">HbA1C <svg style="    position: absolute;
                                                                                          right: 1;
                                                                                          margin-right: 10px; background-color: rgb(34 197 94);margin-left: 172px;" xmlns="http://www.w3.org/2000/svg"
                                                                                          width="24" height="24" fill="currentColor"
                                                                                          class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">C- Reactive Protein <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 80px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Iron / Ferritin <svg style="    position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94);margin-left: 128px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin D <svg style="    position: absolute;
                                                                                              right: 1;
                                                                                              margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 150px;" xmlns="http://www.w3.org/2000/svg"
                                                                                              width="24" height="24" fill="currentColor"
                                                                                              class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin B12 <svg style="    position: absolute;
                                                                                                right: 1;
                                                                                                margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 135px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                width="24" height="24" fill="currentColor"
                                                                                                class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Electrolytes <svg style="    position: absolute;
                                                                                                 right: 1;
                                                                                                 margin-right: 10px; background-color: rgb(247, 20, 20);margin-left: 133px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                 width="24" height="24" fill="currentColor"
                                                                                                 class="bi bi-x-lg font-extrabold text-red-600" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                        </svg></li>
                                    <li class="list-group-item text-white bg-purple-600 text-center font-extrabold "
                                        style="background-color: rgb(147 51 234);">Rs. 1599</li>
                                </ul>
                                <div class="card-body" style="background-color: rgb(168 85 247 )">
                                    <a href="#" class="card-link text-white">Buy Now</a>
                                    <a href="#" class="card-link text-white px-4 mx-4">Go to Store</a>
                                </div>
                            </div>
                        </div>
                        <div class="carousel-item">
                            <div class="card col-sm-2" style="width: 18rem;">
                                <img class="card-img-top" src="sources/Platinum-Package-Graphics-Design.png"
                                     alt="Bronze Package Certus Diagnostics">
                                <div class="card-body" style="background-color: rgb(147 51 234); width:100%;">
                                    <h5 class="card-title text-white font-bold text-center">Blood Profile</h5>

                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item text-white font-bold flex justify-between"
                                        style="background-color: rgb(147 51 234);">Full Blood Count <svg style="    position: absolute;
                                                                                                     right: 1;
                                                                                                     margin-right: 10px; background-color: rgb(34 197 94); margin-left: 106px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                     width="24" height="24" fill="currentColor" class=" mt-1" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Fasting Glucose <svg style="    position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94); margin-left: 110px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-24 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Lipid Profile <svg style="    position: absolute;
                                                                                                  right: 1;
                                                                                                  margin-right: 10px; background-color: rgb(34 197 94); margin-left: 140px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                  width="24" height="24" fill="currentColor"
                                                                                                  class="bi bi-check-lg ml-32 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Kidney Function Test <svg style="    position: absolute;
                                                                                                         right: 1;
                                                                                                         margin-right: 10px; background-color: rgb(34 197 94);margin-left: 72px;" style="background-color: rgb(34 197 94);"
                                                                                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                                                                                         class="bi bi-check-lg ml-14 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Urinalysis <svg style="    position: absolute;
                                                                                               right: 1;
                                                                                               margin-right: 10px; background-color: rgb(34 197 94);margin-left: 153px;" xmlns="http://www.w3.org/2000/svg"
                                                                                               width="24" height="24" fill="currentColor"
                                                                                               class="bi bi-check-lg ml-36 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Liver Function Test <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 86px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-20 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Thyroid Function Test<br>(T3,T4,TSH 3rd
                                        Gen) <svg style="    position: absolute;
                                                  right: 1;
                                                  margin-right: 10px; background-color: rgb(34 197 94);margin-left: 74px;" xmlns="http://www.w3.org/2000/svg"
                                                  width="24" height="24" fill="currentColor"
                                                  class="bi bi-check-lg ml-16 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">ESR <svg style="    position: absolute;
                                                                                        right: 1;
                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 192px;" xmlns="http://www.w3.org/2000/svg"
                                                                                        width="24" height="24" fill="currentColor"
                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">HbA1C <svg style="    position: absolute;
                                                                                          right: 1;
                                                                                          margin-right: 10px; background-color: rgb(34 197 94);margin-left: 172px;" xmlns="http://www.w3.org/2000/svg"
                                                                                          width="24" height="24" fill="currentColor"
                                                                                          class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">C- Reactive Protein <svg style="    position: absolute;
                                                                                                        right: 1;
                                                                                                        margin-right: 10px; background-color: rgb(34 197 94);margin-left: 80px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="24" height="24" fill="currentColor"
                                                                                                        class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Iron / Ferritin <svg style="    position: absolute;
                                                                                                    right: 1;
                                                                                                    margin-right: 10px; background-color: rgb(34 197 94);margin-left: 128px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="24" height="24" fill="currentColor"
                                                                                                    class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin D <svg style="    position: absolute;
                                                                                              right: 1;
                                                                                              margin-right: 10px; background-color: rgb(34 197 94);margin-left: 152px;" xmlns="http://www.w3.org/2000/svg"
                                                                                              width="24" height="24" fill="currentColor"
                                                                                              class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Vitamin B12 <svg style="    position: absolute;
                                                                                                right: 1;
                                                                                                margin-right: 10px; background-color: rgb(34 197 94);margin-left: 137px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                width="24" height="24" fill="currentColor"
                                                                                                class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white font-bold bg-purple-600 flex justify-between"
                                        style="background-color: rgb(147 51 234);">Electrolytes <svg style="    position: absolute;
                                                                                                 right: 1;
                                                                                                 margin-right: 10px; background-color: rgb(34 197 94);margin-left: 137px;" xmlns="http://www.w3.org/2000/svg"
                                                                                                 width="24" height="24" fill="currentColor"
                                                                                                 class="bi bi-check-lg ml-48 mt-1 text-green-500" viewBox="0 0 16 16">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                        </svg></li>
                                    <li class="list-group-item text-white bg-purple-600 text-center font-extrabold "
                                        style="background-color: rgb(147 51 234);">Rs. 2399</li>
                                </ul>
                                <div class="card-body" style="background-color: rgb(168 85 247 )">
                                    <a href="#" class="card-link text-white">Buy Now</a>
                                    <a href="#" class="card-link text-white px-4 mx-4">Go to Store</a>
                                </div>
                            </div>
                        </div>

                    </div>
                    <!-- Left and right controls/icons -->
                    <button class="carousel-control-prev" type="button" data-bs-target="#demo" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" style="margin-left:-72px;"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#demo" data-bs-slide="next">
                        <span class="carousel-control-next-icon" style="margin-left:-53px;"></span>
                    </button>
                </div>
            </div>


        </div>


        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
                integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
        <script>
        window.onload = function exampleFunction() {
            console.log("Function called");

            // Use PHP to output JavaScript-friendly values
            var isSessionSet = <?php echo isset($_SESSION["username"]) ? 'true' : 'false'; ?>;

            if (isSessionSet) {
                document.getElementById("alert").style.opacity=1;
                setTimeout(changeOpacity,5000);
            } else {

            }
        }
        function changeOpacity()
        {
            document.getElementById("alert").style.opacity=0;
        }
    </script>
    </body>

</html>