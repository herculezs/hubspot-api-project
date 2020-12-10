const matchAll = require('string.prototype.matchall')
const UglifyJS = require('uglify-js')

// Find and lazyload wistia videos for performance improvement
module.exports = (body) => {
	let rawBody = body
	const wistiaRegex = /{{[\s+]?script_embed[(]'wistia'[\s+]?,[\s+]?'([a-zA-Z0-9]+)'[\s+]?,[\s+]?'[\s+]?,[\s+]?'[\s+]?,[\s+]?'inline,responsive(,align=(top|bottom|center|right|left)|)(,marginTop=([0-9]+px|auto)|)(,marginRight=([0-9]+px|auto)|)(,marginBottom=([0-9]+px|auto)|)(,marginLeft=([0-9]+px|auto)|)'[)][\s+]?}}/g
	const wistiaList = [...matchAll(rawBody, wistiaRegex)]
	for (let i = 0; i < wistiaList.length; i++) {
		const match = wistiaList[i]
		const containerId = `wistia-embed-${new Date().getTime()}`
		const rawCode = `var parentScript = document.getElementById('${containerId}');
	    var embedContainer = document.createElement('div');
	    embedContainer.className = 'wistia_responsive_padding';
	    embedContainer.style = 'padding:56.25% 0 0 0;position:relative;';
	    parentScript.parentNode.insertBefore(embedContainer, parentScript);
	    embedContainer.innerHTML = '<div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;"><div class="wistia_embed wistia_async_${match[1]} videoFoam=true" style="height:100%;width:100%"><img class="wistia-loader" src="https://www.internationalteflacademy.com/hubfs/loader.svg"></div></div>';
	  	window.addEventListener('load', function() {
	      setTimeout(function() {
	        var wistiaJsonp = document.createElement('script');
	        wistiaJsonp.async = true;
	        wistiaJsonp.src = 'https://fast.wistia.com/embed/medias/${match[1]}.jsonp';
	        var wistiaScript = document.createElement('script');
	        wistiaScript.async = true;
	        wistiaScript.src = 'https://fast.wistia.com/assets/external/E-v1.js';
	        parentScript.parentNode.insertBefore(wistiaJsonp, parentScript);
	        parentScript.parentNode.insertBefore(wistiaScript, parentScript);
	      }, 3000);
	    });`
	    let minizedCode
	    const result = UglifyJS.minify(rawCode)
	    if (result.error) {
	    	minizedCode = rawCode
	    } else {
	    	minizedCode = result.code
	    }
		const wistiaScript = `<script id="${containerId}">${minizedCode}</script>`
		rawBody = rawBody.replace(match[0], wistiaScript)
	}
	return rawBody
}
