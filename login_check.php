<?php
//Start the Session
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
$username=$_GET["username"];
$password=$_GET["password"];

$sql= "SELECT * FROM `users` WHERE username='$username' and password='$password';";

$result=$conn->query($sql);
//This will create the result set and return it in result
//echo $sql;
//If number of rows in result set is greater that zero, then username and password have been matched successfully
    if($result->num_rows > 0)
    {
        echo "success";
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
    else
    {
        echo "Incorrect Username or Password";
    }

$conn->close();
?>