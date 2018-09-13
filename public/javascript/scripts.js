//Locals

let song_area = $('#song_area'),
	get_button = $('#submit_button'),
	save_button = $('#save_button'),
	undo_button = $('#undo_button');




/*----------------------------------------------------------------------------------------------------------------------
HANDLE MOUSE EVENTS
----------------------------------------------------------------------------------------------------------------------*/


let selection,
	mouse_is_down;

function mouse_move (e){

	if(!(mouse_is_down && selection))
		return;

	let i = parseInt(selection.data('i'));

	if(isNaN(i))
		return;


	let top = Math.round(e.pageY - selection.height()/2),
		left = Math.round(e.pageX - selection.width()/2),
		curr_obj = current_song_obj[i];


	selection.offset({
		top: top,
		left: left
	});

	let reg_exp = /[^-\d\.]/;
	top = parseInt(selection.css('top').replace(reg_exp, ''));
	left = parseInt(selection.css('left').replace(reg_exp, ''));

	curr_obj['y'] = em(top/2);
	curr_obj['x'] = em(left)*2;

}

function mouse_down (e) {
	mouse_is_down =true;
	selection = $(e.target);
}

function mouse_up(e){
	mouse_is_down =false;
	selection = null;
}


/*----------------------------------------------------------------------------------------------------------------------
SONGS
----------------------------------------------------------------------------------------------------------------------*/


let current_song,
	current_song_obj,
	current_backup;

function get_song(){

	let val = $('#song_selector').val();
	current_song = val;

	function request_song() {

		return $.ajax({
			url: '/songs?song_name=' + val,
			type: 'GET',
			accepts: 'application/JSON',
			async: true,
		});
	}

	function render_song(lyrics) {

		current_song_obj = lyrics;
		current_backup = JSON.parse(JSON.stringify(lyrics));
		set_lyrics(lyrics);
	}

	request_song().done(render_song);
}

function save_song(){

	function post_song() {

		return $.ajax({
			url: '/songs?song_name=' + current_song,
			type: 'POST',
			accepts: 'application/JSON',
			async: true,
			data: JSON.stringify(current_song_obj, null, '\t')
		});
	}

	post_song().done(()=>{alert('Song ' + current_song + ' saved')});
}

function undo_changes(){

	set_lyrics(current_backup);
}


/*----------------------------------------------------------------------------------------------------------------------
DISPLAY SONGS
----------------------------------------------------------------------------------------------------------------------*/


function set_lyrics (lyrics) {

	song_area.empty();


	for(let i = 0; i < lyrics.length; i++){

		let word = document.createElement('button');


		word.onmousedown = mouse_down;
		word.onmouseup = mouse_up;

		word = $(word);

		word.data('i',i);
		word.text(lyrics[i].word);
		word.offset({top: 2*px(lyrics[i].y), left: px(lyrics[i].x/2)});

		song_area.append(word);
	}

}

function px(input) {
	let emSize = parseFloat($('body').css('font-size'));
	return (emSize * input);
}

function em(input) {

	let emSize = parseFloat($('body').css('font-size'));
	return input / emSize;
}


/*----------------------------------------------------------------------------------------------------------------------
SET UP EVENT HANDLERS
----------------------------------------------------------------------------------------------------------------------*/



song_area.mousemove(mouse_move);
get_button.click(get_song);
save_button.click(save_song);
undo_button.click(undo_changes);




