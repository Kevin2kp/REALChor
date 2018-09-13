//Imports

const fs = require('fs');
const http = require('http');

//Modules

const Template_Engine = require('./modules/template_engine');
const utilities = require('./modules/utilities');

//Controllers

const index = require('./controllers/index');
const songs = require('./controllers/songs');
const error_handler = require('./controllers/error');


//App Parameters

const 	routes = {},
		parameters = set_up_parameters(),
		template_engine = Template_Engine(parameters),
		static_resource_handler = utilities.serve_static_resource(parameters);

//Add routes

routes['/'] =  index;
routes['/songs'] = songs;

modify_response_object_prototype();

http.createServer(request_handler).listen(3000);

/*----------------------------------------------------------------------------------------------------------------------
 SET UP
 ----------------------------------------------------------------------------------------------------------------------*/


function set_up_parameters(){


	//Environment dependent

	let is_win = process.platform === 'win32',
		line_break = is_win? '\r\n' : '\n',
		slash = is_win? '\\' : '/',
		parameters;

	parameters = {
		public_dir: [__dirname, 'public'].join(slash),
		views_dir:[__dirname, 'views'].join(slash),
		songs_dir: [__dirname, 'songs'].join(slash),
		song_index: [__dirname, 'songs', 'song_index.json'].join(slash),
		env: {
			line_break: line_break,
			slash: slash
		}
	};

	return parameters;
}

function modify_response_object_prototype(){

	function send (content, headers){

		this.writeHead(this.statusCode, headers);
		this.write(content || '');
		this.end();
	}

	function status(statusCode){
		this.statusCode = statusCode;
	}

	http.ServerResponse.prototype.render = template_engine;
	http.ServerResponse.prototype.send = send;
	http.ServerResponse.prototype.status = status;
}

/*----------------------------------------------------------------------------------------------------------------------
HANDLE INCOMING REQUESTS
----------------------------------------------------------------------------------------------------------------------*/

function request_handler (req,res){

	function handle_request(){

		utilities.parse_url(req);
		utilities.log_request(req,res);

		let route = routes[req.url];
		if(route)
			return route.call(parameters, req,res, handle_error);

		static_resource_handler(req,res, (error, file) =>{

			if(error){

				res.status(404);
				return handle_error(error);
			}

			send(file);
		});
	}

	function handle_error(error){
		res.on('finish', ()=>{
			console.log(error);
		});
		error_handler(req,res,error);
	}

	handle_request();
}

