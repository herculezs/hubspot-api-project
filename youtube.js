const matchAll = require('string.prototype.matchall')
const UglifyJS = require('uglify-js')

// Find and lazyload youtube videos for performance improvement
module.exports = (body) => {
	let rawBody = body
	const youtubeRegex = /<iframe([^<>]*)src="([^<>"']*)"([^<>]*)><\/iframe>/g
	const youtubeList = [...matchAll(rawBody, youtubeRegex)]
	for (let i = 0; i < youtubeList.length; i++) {
		const match = youtubeList[i]
		const containerId = `youtube-embed-${i + 1}`
		const videoEmbedUrl = match[2]

		let rawCode = `window.addEventListener('load', function() {
	      setTimeout(function() {
	    var parentScript = document.getElementById('${containerId}');
	    var iframeContainer = document.createElement('iframe');
	    iframeContainer.src = '${videoEmbedUrl}';`;

	    for (const attrMatch of [...matchAll(match[1], /([^=]*)="([^=]*)"/g)]) {
	    	const name = attrMatch[1].trim()
	    	const value = attrMatch[2].trim()
	    	rawCode = `${rawCode}iframeContainer.setAttribute('${name}', '${value}');`
	    }

	    for (const attrMatch of [...matchAll(match[3], /([^=]*)="([^=]*)"/g)]) {
	    	const name = attrMatch[1].trim()
	    	const value = attrMatch[2].trim()
	    	rawCode = `${rawCode}iframeContainer.setAttribute('${name}', '${value}');`
	    }

	    rawCode = `${rawCode}parentScript.parentNode.insertBefore(iframeContainer, parentScript);
	      }, 3000);
	    });`
	    let minizedCode
	    const result = UglifyJS.minify(rawCode)
	    if (result.error) {
	    	minizedCode = rawCode
	    } else {
	    	minizedCode = result.code
	    }
		const youtubeScript = `<div class="youtube-loader"></div><script id="${containerId}">${minizedCode}</script>`
		rawBody = rawBody.replace(match[0], youtubeScript)
	}
	return rawBody
}
