const JS          = require('JSClass/JS');
const url = require('url');
const request = require('request');
const querystring = require('querystring');
const extend = require('util')._extend;

const TotangoClient   = module.exports = JS.class('TotangoClient');


JS.class(TotangoClient, {
	fields : {
		service_id : '',
	},

	constructor : function(serviceId) {
		this.service_id    = serviceId;
	},

	methods : {
		/**
		 * Login to Pardot.
		 * This is called automatically by any other API call if there is no valid this.apiKey.
		 * @param {String} [email]
		 * @param {String} [password]
		 * @param {String} [userKey]
		 */

		trackActivity : function(accountId, userId, activity, module, callback) {
			callback = callback || function() {};

			if (typeof accountId !== 'string' ||
	            typeof userId !== 'string' ||
	            typeof activity !== 'string' ||
	            typeof module !== 'string' ||
	            typeof callback !== 'function') {
				callback(new Error('totango-tracker.trackActivity: Invalid parameters'));
			}
			else {
				const params = {
					sdr_s : this.service_id,
					sdr_o : accountId,
					sdr_u : userId,
					sdr_a : activity,
					sdr_m : module,
				};

				this.sendSDR(params, callback);
			}
		},

		setUserAttributes : function(accountId, userId, attributes, callback) {
			if (typeof accountId !== 'string' || typeof userId !== 'string') {
				callback(new Error('totango-tracker.setUserAttributes: Invalid parameters'));
			}
			else {
				const initialParams = {};
				if (attributes.name) {
					initialParams['sdr_u.name'] = attributes.name;
					delete attributes.name;
				}
				this.setAttributes('sdr_u.', initialParams, { accountId : accountId, userId : userId }, attributes, callback);
			}
		},

		setAttributes : function(prefix, initialParams, identity, attributes, callback) {
			callback = callback || function() {};

			if (typeof attributes !== 'object' || typeof callback !== 'function') {
				callback(new Error('totango-tracker: Invalid attributes'));
			}
			else {

				let params = {
					sdr_s : this.service_id,
					sdr_o : identity.accountId,
				};
				if (identity.userId)  params['sdr_u'] = identity.userId;
				params = extend(params, initialParams);

				for (const attr in attributes)
					params[prefix + attr] = attributes[attr];


				this.sendSDR(params, callback);
			}
		},


		sendSDR : function(params, callback) {

			const options = {
				url : url.format({
					protocol : 'https',
					host     : 'sdr.totango.com',
					pathname : 'pixel.gif/',
					search   : querystring.stringify(params),
				}),
				method : 'GET',
				jar    : false,
			};

			request(options, function(err, res, body) {
				if (err)
					callback(err);

				else if (res.statusCode !== 200 && res.statusCode !== 201)
					callback(new Error(`Invalid request, status code: ${res.statusCode}`));

				else
	                callback(null);
			});

			return {
				trackActivity        : this.trackActivity(),
				setUserAttributes    : this.setUserAttributes(),
				setAccountAttributes : this.setAccountAttributes(),
			};
		},
	},
});
