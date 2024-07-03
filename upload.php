<?php
//print_r($_FILES["f1"]);
if($_FILES["f1"])
{
    $path=$_FILES["f1"]["name"];
    $upload_path="reports/".$path;
    //echo"$upload_path";
    if(move_uploaded_file($_FILES["f1"]["tmp_name"] , $upload_path))
    {
        echo "<br><h1>File Uploaded Successfully at ".$upload_path."</h1>";
    }
    else
    {
        echo "<br><h1>Failed to Upload File</h1>";
    }

}
else
{
    echo "<br><h1>File Not Found</h1>";
}

$pid=$_POST["pid"];
$test=$_POST["test"];

echo"<br>Patient Id: ".$pid."<br>Test: ".$test."<br>";

//Database Connectivity

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

$sql="INSERT INTO `reports` (`pid`, `test`, `path`, `date`) VALUES ( '$pid', '$test', '$upload_path', current_timestamp());";

//echo $sql;
if($conn->query($sql))
{
    echo "<h1>Success, Entry Added to Database</h1>";
    
}
else
{
    echo "<br>Error: $sql <br> $conn->error";
}
$conn->close();

?>