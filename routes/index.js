
/*
 * GET home page.
 */

exports.index = function(req, res){
	
	var options = {
		title: "nextRIPTA",
		examples: [
			{
				text: "When is the next bus from the Thayer Tunnel?",
				code: "thayer"
			}
			,
			{
				text: "When is the next 92 bus from East Side Market?",
				code: "esm 92"
			},
			{
				text: "When is the next 42 inbound bus from the Thayer Tunnel?",
				code: "thayer 42 in"
			}
		]
	}
	res.render('index', options);
};
