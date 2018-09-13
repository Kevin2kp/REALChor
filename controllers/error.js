/*

This controller handles all error responses
 */

function handler (req,res, error){

	//Won't be using this

	function create_return_link (){

		let out = '';

		if(req.headers.referer){
			out += 'Click <a href=\"' + req.headers.referer + '\">here</a> to go back.'
		}

		return out;
	}

	//Collect data for template

	let data = {
		url: req.url,
		referer_link: create_return_link(),
		error_code: res.statusCode,
		error_description: ''
	};

	//If request accepts html render error page, else send empty response

	if(req.headers.accept.indexOf('html') < 0){
		return res.send();
	}

	res.render('error.html', data, (error, html) =>{

		if(error){
			res.status(500);
			return res.send();
		}

		res.send(html, {'Content-Type': 'text/html'});
	});
}

module.exports = handler;