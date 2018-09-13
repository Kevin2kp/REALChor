const fs = require('fs');

function template_engine (parameters) {

	const var_place_holder = /<%([^%>]+)?%>/g;

	function render (view, data, callback){

		//Load html 'template' file asynchronously

		function load_file (filename){

			fs.readFile(filename, 'utf8', (error, file) =>{

				//If there's an error reading the file, pass error to callback

				if(error)
					return callback(error);

				//Else continue

				fill_template(file.split(parameters.env.line_break));
			});
		}

		function fill_template (template){

			for(let i = 0; i < template.length; i++){

				//Test current_song_objects line for pattern: <%string%>

				let match = var_place_holder.exec(template[i]);

				/*
					If there is match for pattern, replace placeholder with
					its respective content
				 */

				if(match){

					let content = data[match[1]] || '';

					template[i] = template[i].replace(match[0], data[match[1]]);
				}
			}

			//Return to callback with 'rendered' page

			callback(null,template.join(parameters.env.line_break));
		}

		load_file([parameters.views_dir,view].join(parameters.env.slash));
	}

	return render;
}

//Exports

module.exports = template_engine;
