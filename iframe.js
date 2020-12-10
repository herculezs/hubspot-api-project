const matchAll = require('string.prototype.matchall')
const UglifyJS = require('uglify-js')

// Find and lazyload iframes for performance improvement
module.exports = (body) => {
	let rawBody = body
	const iframeRegex = /<iframe([^<>]*)src="([^<>"']*)"([^<>]*)><\/iframe>/g
	const iframeList = [...matchAll(rawBody, iframeRegex)]
	for (let i = 0; i < iframeList.length; i++) {
		const match = iframeList[i]
		const iframeUrl = match[2]

		let classNameFound = false
		let iframeEl = '<iframe'

		for (const attrMatch of [...matchAll(match[1], /([^=]*)="([^=]*)"/g)]) {
	    	const name = attrMatch[1].trim()
	    	const value = attrMatch[2].trim()
	    	if (name === 'class') {
	    		iframeEl = `${iframeEl} ${name}="lazy ${value}"`
	    		classNameFound = true
	    	} else {
	    		iframeEl = `${iframeEl} ${name}="${value}"`
	    	}
	    }

	    iframeEl = `${iframeEl} data-src="${iframeUrl}"`

	    for (const attrMatch of [...matchAll(match[3], /([^=]*)="([^=]*)"/g)]) {
	    	const name = attrMatch[1].trim()
	    	const value = attrMatch[2].trim()
	    	if (name === 'class') {
	    		iframeEl = `${iframeEl} ${name}="lazy ${value}"`
	    		classNameFound = true
	    	} else {
	    		iframeEl = `${iframeEl} ${name}="${value}"`
	    	}
	    }

	    if (classNameFound) {
	    	iframeEl = `${iframeEl}></iframe>`
	    } else {
	    	iframeEl = `${iframeEl} class="lazy"></iframe>`
	    }
		rawBody = rawBody.replace(match[0], iframeEl)
	}
	return rawBody
}
