var express = require('express'),
    app = express();
const { Pool } = require('pg');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'mbcarradine';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'fernsaysdb';
db_credentials.password = process.env.AWSRDS_PW;

db_credentials.port = 5432;

app.get('/', function(req, res) { //only responding to the root URL
    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query. I'll need to swap in my values. look at adding in an "order by"
    var q = `SELECT EXTRACT(DAY FROM sensortime AT TIME ZONE 'America/New_York') as sensorday, 
             EXTRACT(MONTH FROM sensortime AT TIME ZONE 'America/New_York') as sensormonth, 
             count(*) as num_obs, 
             tiltvalue as together,
             max(TempCvalue) as max_temp, 
             min(TempCvalue) as min_temp
             FROM sensordata 
             GROUP BY sensormonth, sensorday;
             ORDER BY sensordata`;
             
    client.connect();
    client.query(q, (qerr, qres) => {
        res.send(qres.rows);
        console.log('responded to request');
    });
    client.end();
});

app.listen(3000, function() {
    console.log('Server listening...');
});