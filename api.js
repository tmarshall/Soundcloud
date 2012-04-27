var 
	request = require('request'),
	paths = {
		users: 'users',
		user: 'users/{userId}',
		userTracks: 'users/{userId}/tracks',
		userPlaylists: 'users/{userId}/playlists',
		userFollows: ['users/{userId}/followings', 'users/{userId}/followings/{followerId}'],
		userFollowers: ['users/{userId}/followers', 'users/{userId}/followers/{followerId}'],
		userComments: 'users/{userId}/comments',
		userFavorites: ['users/{userId}/favorites', 'users/{userId}/favorites/{favoriteId}'],
		userGroups: 'users/{userId}/groups',
		userWebProfiles: 'users/{userId}/web-profiles',

		tracks: 'tracks',
		track: 'tracks/{trackId}',
		trackComments: ['tracks/{trackId}/comments', 'tracks/{trackId}/comments/{commentId}'],
		trackComment: 'tracks/{trackId}/comments/{commentId}',
		trackFavorites: ['tracks/{trackId}/favorites', 'tracks/{trackId}/favorites/{userId}'],
		trackSharedToUsers: 'tracks/{trackId}/shared-to/users',
		trackSharedToEmails: 'tracks/{trackId}/shared-to/emails',
		trackSecretToken: 'tracks/{trackId}/secret-token',

		playlists: 'playlists',
		playlist: 'playlists/{playlistId}',
		playlistSharedToUsers: 'playlists/{playlistId}/shared-to/users',
		playlistSharedToEmails: 'playlists/{playlistId}/shared-to/emails',
		playlistSecretToken: 'playlists/{playlistId}/secret-token',

		groups: 'groups',
		group: 'groups/{groupId}',
		groupModerators: 'groups/{groupId}/moderators',
		groupMembers: 'groups/{groupId}/members',
		groupContributors: 'groups/{groupId}/contributors',
		groupUsers: 'groups/{groupId}/users',
		groupTracks: 'groups/{groupId}/tracks',
		groupPendingTracks: ['groups/{groupId}/pending_tracks', 'groups/{groupId}/pending_tracks/{trackId}'],
		groupPendingTrack: 'groups/{groupId}/pending_tracks/{trackId}',
		groupContributions: ['groups/{groupId}/contributions', 'groups/{groupId}/contributions/{trackId}'],
		groupContribution: 'groups/{groupId}/contributions/{trackId}',

		comments: 'comments',
		comment: 'comments/{commentId}',

		apps: 'apps',
		app: 'apps/{appId}',
		appTracks: 'apps/{appId}/tracks',

		resolve: 'resolve?url={soundcloudUrl}'
	},
	key,
	pathArguments = /\{\w+\}/g,
	pathQuestionMark = /\?/

function soundcloudAPI(clientId) {
	this.clientId = clientId

	return this
}

function apiFunction(key, paths) {
	var pathLookup = {}

	splat(paths).forEach(function(path) {
		var
			parts = path.match(pathArguments),
			tokens = path.split(pathArguments),
			readable = parts === null ? '(callback)' : '(' + parts.reduce(function(prev, curr) {
				prev.push(curr.substr(1, curr.length - 2))
				return prev
			}, []).join(', ') + ', callback)'

		pathLookup[parts === null ? 0 : parts.length] = {
			path: path,
			parts: parts,
			tokens: tokens,
			readable: readable
		}
	})

	return function() {
		var 
			args = Array.prototype.slice.call(arguments),
			callback = args[args.length - 1],
			path = pathLookup[args.length - 1]

		if (pathLookup[args.length - 1] == undefined) throw 'Invalid arguments passed. #' + key + '() takes: ' + Object.keys(pathLookup).reduce(function(prev, curr) {
			prev.push(pathLookup[curr]).readable
			return prev
		}, []).join(' or ')

		if (typeof callback !== 'function') throw 'Invalid callback given - expecting a function'

		request('http://api.soundcloud.com/' + path.tokens.reduce(function(prev, curr, i) {
			return prev + curr + (i === path.tokens.length - 1 ? '' : args[i])
		}, '') + (pathQuestionMark.test(path.path) ? '&' : '?') + 'format=json&client_id=' + this.clientId, function(err, res, body) {
			try {
				body = JSON.parse(body)
			} catch(e) {}

			callback(err, res, body)
		})
	}
}

function splat(arg) {
    return Array.isArray(arg) ? arg : [arg]
}

for (key in paths) soundcloudAPI.prototype[key] = apiFunction(key, paths[key])

module.exports = soundcloudAPI