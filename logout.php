<?php
session_start();

//remove all the session variables
session_unset();

//destroy the session
session_destroy();

//redirect to home page
header("Location: index.php");

?>