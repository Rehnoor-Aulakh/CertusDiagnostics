<?php
session_start();

//Make connection to database
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

$sql = "SELECT * FROM `reports` WHERE pid=".$_SESSION["sno"]." order by sno desc;";
//echo $sql;
//execute the sql query and store the result set in result
$result=$conn->query($sql);

$main_arr=array();
while($row=$result->fetch_assoc())
{
    //Store each row of result in JSON Array
    //echo"<br>".$row["path"]." , ".$row["test"]." , ".$row["date"];
    $arr=array("path"=>$row["path"],"test"=>$row["test"],"date"=>$row["date"]);
    $main_arr[]=$arr;
}
//echo "<br><hr>";
echo json_encode($main_arr);


?>