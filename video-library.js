const hubspotClient = require('./client')

hubspotClient.refreshAccessToken().then(async () => {
	const pages = await hubspotClient.apiRequest({
	    method: 'GET',
	    path: `/content/api/v2/pages`
	})
	console.log(pages.objects.map(page => page.url))
})
