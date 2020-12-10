const Promise = require('bluebird')
const hubspotClient = require('./client')
const wistia = require('./wistia')
const lazyloadImg = require('./lazyload-img')
const youtube = require('./youtube')

let total
let updatedCount = 0

const updateBlogByIds = async (postList) => {
	await Promise.map(postList, async postId => {
		try {
			const blog = await hubspotClient.apiRequest({
			    method: 'GET',
			    path: `/content/api/v2/blog-posts/${postId}`
			})

			if (blog) {
				let updatedPostBody = wistia(blog.post_body)
				updatedPostBody = lazyloadImg(updatedPostBody, blog.enable_google_amp_output_override)
				updatedPostBody = youtube(updatedPostBody)

				// Update blog
				await hubspotClient.apiRequest({
				    method: 'PUT',
				    path: `/content/api/v2/blog-posts/${blog.id}`,
				    body: {
				    	post_body: updatedPostBody,
				    	publish_immediately: true
				    }
				})

				console.log('Updated blog:', blog.id)
			} else {
				console.log('Blog not exist')
			}
		} catch (e) {
			console.log('Error:', e)
		}
	}, { concurrency: 5 })
}

const fetchBlogList = async (start, end, type) => {
	let path = `/content/api/v2/blog-posts?state=PUBLISHED&offset=${updatedCount}`

	if (start) {
		path = `${path}&${type}__gt=${new Date(start).getTime()}`
	}

	if (end) {
		path = `${path}&${type}__lt=${new Date(end).getTime()}`
	}

	try {
		const blogs = await hubspotClient.apiRequest({
		    method: 'GET',
		    path
		})
		total = blogs.total
		updatedCount += blogs.objects.length

		await Promise.map(blogs.objects, async obj => {
			try {
				let updatedPostBody = wistia(obj.post_body)
				updatedPostBody = lazyloadImg(updatedPostBody, obj.enable_google_amp_output_override)
				updatedPostBody = youtube(updatedPostBody)

				// Update blog
				await hubspotClient.apiRequest({
				    method: 'PUT',
				    path: `/content/api/v2/blog-posts/${obj.id}`,
				    body: {
				    	post_body: updatedPostBody,
				    	publish_immediately: true
				    }
				})

				console.log('Updated blog:', obj.id)
			} catch (e) {
				console.log('Error:', e)
			}
		}, { concurrency: 5 })

		if (updatedCount < total) {
			fetchBlogList(start, end, type)
		} else {
			// Ended
			updatedCount = 0
		}
	} catch (e) {
		console.log('Error:', e)
	}
}

module.exports = (postIds, start, end, type) => {
	console.log('Refreshing token...')
	hubspotClient.refreshAccessToken().then(() => {
		let postList = []
		if (postIds.trim()) {
			postList = postIds.trim().replace(/ +/g, '').split(',')
			console.log('Update list:', postList)
			updateBlogByIds(postList)
		} else {
			console.log('Update all blogs')
			fetchBlogList(start, end, type)
		}
	})
}
