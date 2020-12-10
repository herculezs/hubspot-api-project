const matchAll = require('string.prototype.matchall')

// Find and lazyload blog post images for performance improvement
module.exports = (body, googleAmpEnabled, className = 'lazy shrink') => {
	let rawBody = body

	// Not updated blogs
	const imgRegex = /<img[\s]+(src|srcset)="([^<>]*)"[\s]+alt="([^<>]*)"[\s+]?>/g
	const imgList = [...matchAll(rawBody, imgRegex)]
	for (let i = 0; i < imgList.length; i++) {
		const match = imgList[i]

		const googleAmpMatch = `{% if request.query_dict.hs_amp %}${match[0]}{% else %}`
		if (rawBody.indexOf(googleAmpMatch) > -1) {
			continue;
		}

		let lazyloadImg
		if (googleAmpEnabled) {
			lazyloadImg = `${googleAmpMatch}<img class="${className}" src="https://www.internationalteflacademy.com/hubfs/loader.svg" data-${match[1]}="${match[2]}" alt="${match[3]}">{% endif %}`
		} else {
			lazyloadImg = `<img class="${className}" src="https://www.internationalteflacademy.com/hubfs/loader.svg" data-${match[1]}="${match[2]}" alt="${match[3]}">`
		}
		rawBody = rawBody.replace(match[0], lazyloadImg)
	}

	// Already updated blogs
	if (googleAmpEnabled) {
		const lazyRegex = /<img[\s]+class="lazy[\s]+shrink"[\s]+src="([^<>]*)"[\s]+data-(src|srcset)="([^<>]*)"[\s]+alt="([^<>]*)"[\s+]?>/g
		const lazyImgList = [...matchAll(rawBody, lazyRegex)]
		for (let i = 0; i < lazyImgList.length; i++) {
			const match = lazyImgList[i]

			const googleAmpMatch = `{% else %}${match[0]}{% endif %}`
			if (rawBody.indexOf(googleAmpMatch) > -1) {
				continue;
			}

			const lazyloadImg = `{% if request.query_dict.hs_amp %}<img src="${match[3]}" alt="${match[4]}">${googleAmpMatch}`
			rawBody = rawBody.replace(match[0], lazyloadImg)
		}
	}

	// eliminate "... loaded" and data-processed="true"
	const bugRegex = /<img(.*?)>/g
	const imgBugList = [...matchAll(rawBody, bugRegex)]
	let updated_img
	for(const match of imgBugList){
		updated_img = match[0].replace(' loaded"', '"').replace('data-processed="true"', '')
		if(updated_img.indexOf('alt=') === -1){
			updated_img = updated_img.replace('>', 'alt="some text">')
		}
		rawBody = rawBody.replace(match[0], updated_img)
	}

	return rawBody
}
