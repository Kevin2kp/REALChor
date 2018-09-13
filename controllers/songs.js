const fs = require('fs');
const parser = require('../modules/chord_pro_parser');


/*
This Controller handles all /songs requests
 */


const handler = function (req,res, next){


	//Save parameters for local functions to use

	const 	parameters = this,
			chord_pro_parse = parser(parameters.env.line_break);


	//Look up song on index

	function load_song_from_index (callback){

		fs.readFile(parameters.song_index, 'utf8', function (error, file){

			//If there is no song_index.json, return server error

			if(error){
				res.status(500);
				return next(error);
			}

			//Else proceed to next step

			let song_meta = JSON.parse(file)[req.query_args.song_name];

			//If song is not on index return 404, else return song meta data to callback

			if(!song_meta){
				res.status(404);
				return next(new Error('ENOENT: ' + req.query_args.song_name));
			}

			callback(song_meta);
		});
	}

	function send_song (song_meta){

		let file_path;


		//Check if there is already an arrangeent file

		if(song_meta.arrangement_file){

			file_path = [
				parameters.songs_dir,
				song_meta.arrangement_file
			].join(parameters.env.slash);

			fs.readFile(file_path, 'utf8', (error, file) => {

				if(error){

					res.status(500);
					return next(error);
				}

				res.status(200);
				res.send(file, {'Content-Type': 'application/json'});
			});


			return;
		}


		//If no arrangement file was found, generate one from lyrics (chord pro file)


		file_path = [
			parameters.songs_dir,
			song_meta.lyrics_file
		].join(parameters.env.slash);

		fs.readFile(file_path, 'utf8', (error, file) => {

			if(error){

				res.status(500);
				return next(error);
			}

			let lyrics_objects = chord_pro_parse.parse_file(file);

			res.send(JSON.stringify(lyrics_objects), {'Content-Type': 'application/json'});
		});
	}

	function save_song (song_meta) {

		//Write arrangement file

		function write_content(content){

			let arr_file = song_meta.arrangement_file || song_meta.name + '.json',
				path;

			path = [parameters.songs_dir, arr_file].join(parameters.env.slash);

			fs.writeFile(path, content, (error) =>{

				if(error){
					res.status(404);
					return next(error);
				}

				//If file is written successfully, update song index

				song_meta.arrangement_file = arr_file;
				edit_index(song_meta);
			});
		}

		function edit_index(song_meta){

			function load_index(){

				fs.readFile(parameters.song_index, 'utf8', (error, file) =>{

					if(error){
						res.status(500);
						return next(error);
					}

					write_index(JSON.parse(file));
				})
			}

			//Write new info to index

			function write_index(index){

				index[song_meta.name] = song_meta;

				fs.writeFile(parameters.song_index, JSON.stringify(index,null, '\t'), (error) =>{

					if(error){

						res.status(500);
						return next(error);
					}


					res.status(200);
					res.send();
				});
			}

			load_index();
		}


		//Once data arrives, process

		req.on('data', write_content);
	}


	//Handle different request methods

	if(req.method === 'GET'){
		load_song_from_index(send_song);
	}

	else if(req.method === 'POST'){

		load_song_from_index(save_song);
	}

};

module.exports = handler;