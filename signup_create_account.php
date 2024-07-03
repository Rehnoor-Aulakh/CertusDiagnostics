<?php
//Start the session
session_start();
?>
<?php
//MySQL Database Connectivity
$server="localhost";
$user="root";
$pass="";
$dbname="users";
$conn=mysqli_connect($server,$user,$pass,$dbname);

if(!$conn)
{
    die("connection to database failed due to ".mysqli_connect_error());

}
else
{
    //echo"Connection Made to Database";
}
$name=$_GET["name"];
$username=$_GET["username"];
$phone=$_GET["phone"];
$password=$_GET["password"];
$email=$_GET["email"];

$sql="INSERT INTO `users` (`name`, `phone`, `email`, `username`, `password`, `dt`) VALUES ('$name', '$phone', '$email', '$username', '$password', current_timestamp());";

//echo $sql;
if($conn->query($sql))
{
    echo "success";
    $_SESSION["username"]=$username;
}
else
{
    echo "<br>Error: $sql <br> $conn->error";
}

$sql2= "SELECT * FROM `users` WHERE username='$username' and password='$password';";

$result=$conn->query($sql2);

if($result->num_rows > 0)
    {
        //echo "success";
        //If Log in is successful, set the username in session
        //$_SESSION["username"]=$username;
        //echo $_SESSION["username"];
        while($row = $result->fetch_assoc())
        {
            $_SESSION["username"]=$row["username"];
            $_SESSION["sno"]=$row["sno"];
            $_SESSION["phone"]=$row["phone"];
            $_SESSION["email"]=$row["email"];
        }
    }    


$conn->close();
?>