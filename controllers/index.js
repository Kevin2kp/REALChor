const template_engine = require('../modules/template_engine');
const fs = require('fs');


/*
This Controller handles the homepage
 */

function handler (req,res, next){

	const 	song_index = this.song_index,
			line_break = this.env.line_break;

	function populate_song_list(){

		fs.readFile(song_index, 'utf8',(error, file) =>{

			if(error){
				res.status(500);
				return next(error);
			}

			let song_table = JSON.parse(file),
				keys = Object.keys(song_table);

			let out = [];

			for(let i = 0; i < keys.length; i++){

				let song = song_table[keys[i]];

				out.push('<option value=\"' +
					keys[i] + '\">' +
					song.display_name +
					'</option>');

			}

			let data = {
				'title': 'Home',
				'song_list': out.join(line_break)
			};

			fill_template(data);
		});
	}

	function fill_template (data){

		res.render('index.html', data, (error, html) => {

			if(error){
				res.status(500);
				return next(error);
			}

			res.status(200);
			res.send(html, {'Content-Type': 'text/html'});
		});
	}

	populate_song_list();
}

module.exports = handler;
