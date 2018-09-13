function chord_pro_parser (line_break) {

	this.parse_file = (file) => {

		function parse_line (line){

			let chords = '',
				lyrics = '';

			for(let i = 0; i < line.length; i++){

				//Look for square bracket

				if(line[i] === '['){

					//Fill chords line with spaces to make sure both lines have the same width

					while(chords.length < lyrics.length){
						chords += ' ';
					}

					//Write to chords line until a square bracket is found

					while(++i < line.length && line[i] !== ']'){
						chords += line[i];
					}

					chords += ' ';
				}

				else {

					//If character is not a square bracket, write to lyrics line

					lyrics += line[i];
				}
			}

			return {chords: chords, lyrics: lyrics};
		}

		function create_lyrics_objects(lyrics){

			let lyric_objects = [];

			for(let y = 0; y < lyrics.length; y++){

				//Split line into words and remove empty strings

				let line = lyrics[y].split(' ').filter((str) =>{return str}),
					word_set = {};

				for(let i = 0; i < line.length; i++){


					let start_index = 0, x;

					//If word has been seen before, look for next occurrence

					if(word_set[line[i]]){
						start_index = word_set[line[i]];
					}

					x = lyrics[y].indexOf(line[i], start_index);

					//Write coordinates

					lyric_objects.push({
						word: line[i],
						x: x,
						y: y
					});

					word_set[line[i]] = x + 1;
				}
			}

			return lyric_objects;
		}

		let lyrics = [];
		file = file.split(line_break);

		for(let i = 0; i < file.length; i++){

			let line = parse_line(file[i]);

			lyrics.push(line.chords);
			lyrics.push(line.lyrics);
		}

		return create_lyrics_objects(lyrics);
	};

	return this;
}

module.exports = chord_pro_parser;




