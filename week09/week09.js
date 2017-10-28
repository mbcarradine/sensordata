var request = require('request');
const { Client } = require('pg');

// PARTICLE PHOTON
var device_id = '260038000651353530373132';
var access_token = 'a525c2297e901f27e9e6b8737f77cbc26f56371e';
//var device_id = process.env.PHOTON_ID;
//var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'json';
//var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;
var device_url= 'https://api.particle.io/v1/devices/260038000651353530373132/json?access_token=a525c2297e901f27e9e6b8737f77cbc26f56371e';
//console.log(device_url);
// AWS RDS POSTGRESQL INSTANCE


// Make environment variables

var db_credentials = new Object();
db_credentials.user = 'mbcarradine';
//db_credentials.host = process.env.AWSRDS_EP;
db_credentials.host = 'datastructures.cwa4xwjfcya6.us-east-1.rds.amazonaws.com';
db_credentials.database = 'fernsaysdb';
db_credentials.password = process.env.AWSRDS_P;
db_credentials.port = 5432;

var getAndWriteData = function() {
    // Make request to the Particle API to get sensor values
    request(device_url, function(error, response, body) {
     //   Store sensor values in variables
        var device_json_string = JSON.parse(body).result;
        var tiltsensor = JSON.parse(device_json_string).tiltvalue;
        var tempsensor = JSON.parse(device_json_string).TempCvalue;
      //  console.log(tempsensor);


        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        var thisQuery = "INSERT INTO sensordata VALUES (" + tiltsensor + "," + tempsensor + ", DEFAULT);";
       console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
   });
};

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 300000);