/*----------------------------------------------------------------------------------------------------------------------
IMPORTS
----------------------------------------------------------------------------------------------------------------------*/


const fs = require('fs');
const colour = require('colour');


/*----------------------------------------------------------------------------------------------------------------------
MODIFY REQUEST ATTRIBUTES
----------------------------------------------------------------------------------------------------------------------*/


module.exports.parse_url = (req) => {

	const normalize_url = function (){

		function filter_url (str){

			str = str.trim();
			return str && str !== '.' && str !== '..';
		}


		//Remove white spaces, dots and repeated slashes

		let args = req.url.trim().split('/')
			.filter(filter_url);

		req.url = '/' + args.join('/');
	};

	const extract_query = function (){

		//Find ? delimiter

		let split_url = req.url.split('?');


		//Remove query from url

		req.url = split_url[0];
		req.query_args = {};
		req.query_string = split_url[1];


		//Return if there are no query arguments

		if(split_url.length <= 1)
			return;


		//Separate individual arguments with & delimiter

		let query = split_url[1].split('&');

		for(let i = 0; i < query.length; i++){

			//Separate key value pairs

			let kvp = query[i].split('=');

			//If key doesn't have value ignore

			if(kvp.length <= 1){
				continue;
			}

			//Add key value pair to query arg object

			req.query_args[kvp[0]] = kvp[1];
		}
	};

	normalize_url();
	extract_query();

};

/*----------------------------------------------------------------------------------------------------------------------
LOG REQUESTS
----------------------------------------------------------------------------------------------------------------------*/


module.exports.log_request = (req, res) => {

	let start = new Date();

	res.on('finish', () => {

		let status = res.statusCode;

		if(status >= 200 && status < 400)
			status = String(status).green;

		else
			status = String(status).red;

		if(req.query_string){

			req.url = [req.url, req.query_string].join('?');
		}


		let out = [

			req.method.blue,
			req.url,
			status,
			(Date.now() - start.getTime()) + ' ms'
		];

		console.log(out.join(' - '));
	});

};

/*----------------------------------------------------------------------------------------------------------------------
SERVE STATIC FILES
 ----------------------------------------------------------------------------------------------------------------------*/


module.exports.serve_static_resource = (parameters) => {

	function mime_type (ext){

		let types = {
			'txt': 'text/plain',
			'html': 'text/html',
			'js' : 'text/javascript',
			'css': 'text/css',
			'jpg': 'image/jpg',
			'png': 'image/png'
		};

		return types[ext] ? types[ext] : 'text/plain';
	}

	function load_file (req,res, next) {

		let file_extension = req.url.split('.')[1],
			requested_file = parameters.public_dir.split(parameters.env.slash);

		requested_file = requested_file.concat(req.url.split('/')).join(parameters.env.slash);

		fs.readFile(requested_file, function (error, file){

			if(error){
				return next(error);
			}

			res.status(200);
			res.send(file, {'Content-Type': mime_type(file_extension)});
		});
	}

	return load_file;
};





