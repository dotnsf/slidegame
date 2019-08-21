//.  app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    ejs = require( 'ejs' ),
    Mysql = require( 'mysql' ),
    settings = require( './settings' ),
    app = express();

var mysql = Mysql.createConnection({
  host: settings.mysql_hostname,
  user: settings.mysql_username,
  password: settings.mysql_password,
  database: settings.mysql_database
});
mysql.connect();

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );


app.get( '/', function( req, res ){
  res.render( 'index', { image_url: settings.image_url } );
});


app.post( '/score', function( req, res ){
  var sql = 'insert into scores set ?';
  mysql.query( sql, { name: req.body.name, seconds: req.body.seconds, moves: req.body.moves, created: ( new Date() ).getTime() }, function( err, result ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
      res.end();
    }else{
      res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
      res.end();
    }
  });
});

app.get( '/scores', function( req, res ){
  var sql = 'select * from scores order by created desc';
  mysql.query( sql, function( err, results, fields ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
      res.end();
    }else{
      res.write( JSON.stringify( { status: true, results: results }, 2, null ) );
      res.end();
    }
  });
});

app.delete( '/score/:id', function( req, res ){
  var id = req.params.id;
  if( id ){
    var sql = 'delete from scores where id = ' + id;
    mysql.query( sql, function( err, results, fields ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
        res.end();
      }else{
        res.write( JSON.stringify( { status: true }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: "parameter id not specified." }, 2, null ) );
    res.end();
  }
});

var appEnv = cfenv.getAppEnv();
var port = appEnv.port || 3000;
app.listen( port );
console.log( "server starting on " + port + " ..." );
