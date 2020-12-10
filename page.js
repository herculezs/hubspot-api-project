const hubspotClient = require('./client')
const Promise = require('bluebird')
const lazyloadImg = require('./lazyload-img')
const wistia = require('./wistia')
const iframe = require('./iframe')

hubspotClient.refreshAccessToken().then(async () => {
	const res = await hubspotClient.apiRequest({
	    method: 'GET',
	    path: `/content/api/v2/pages/28923034607`
	})

	for (const widgetId in res.widgets) {
		if (res.widgets[widgetId].label === 'JM - Accordion Content') {
			res.widgets[widgetId].body.accordion_items.forEach(accordionItem => {
				let updatedBody = lazyloadImg(accordionItem.item_answer, false, 'lazy')
				updatedBody = wistia(updatedBody)
				updatedBody = iframe(updatedBody)
				accordionItem.item_answer = updatedBody
			})
		}
	}
	await hubspotClient.apiRequest({
		method: 'PUT',
		path: `/content/api/v2/pages/28923034607`,
		body: {
	    	widgets: res.widgets
	    }
	})
})
