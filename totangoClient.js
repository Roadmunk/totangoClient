const JS            = require('JSClass/JS');
const url           = require('url');
const request       = require('request');
const querystring   = require('querystring');
const extend        = require('util')._extend;

const TotangoClient = module.exports = JS.class('TotangoClient');


JS.class(TotangoClient, {
	fields : {
		serviceID : '',
	},

	constructor : function(serviceId) {
		this.serviceID    = serviceId;
	},

	methods : {
		/**
		 * Track user activities to Totango.
		 * @param {String} [accountId]
		 * @param {String} [userId]
		 * @param {String} [activity]
		 * @param {String} [module]
		 */
		trackActivity : function(accountId, userId, activity, module, callback) {
			callback = callback || function() {};

			if (typeof accountId !== 'string' ||
	            typeof userId !== 'string' ||
	            typeof activity !== 'string' ||
	            typeof module !== 'string' ||
	            typeof callback !== 'function') {
				callback(new Error('totangoClient.trackActivity: Invalid parameters'));
			}
			else {
				const params = {
					sdr_s : this.serviceID,
					sdr_o : accountId,
					sdr_u : userId,
					sdr_a : activity,
					sdr_m : module,
				};

				this.sendSDR(params, callback);
			}
		},

		/**
		 * Send user attributes to Totango.
		 * @param {String} [accountId]
		 * @param {String} [userId]
		 * @param {Object} [attributes]
		 */
		setUserAttributes : function(accountId, userId, attributes, callback) {
			if (typeof accountId !== 'string' || typeof userId !== 'string') {
				callback(new Error('totangoClient.setUserAttributes: Invalid parameters'));
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

		/**
		 * Send account attributes to Totango.
		 * @param {String} [accountId]
		 * @param {Object} [attributes]
		 */
		setAccountAttributes : function(accountId, attributes, callback) {
	        if (typeof accountId !== 'string') {
		callback(new Error('totangoClient.setAccountAttributes: Invalid parameters'));
	        }
	        else {
	            const initialParams = {};
	            if (attributes.name) {
	                initialParams['sdr_odn'] = attributes.name;
	                delete attributes.name;
	            }
	            this.setAttributes('sdr_o.', initialParams, { accountId : accountId }, attributes, callback);
	        }
	 	},

		setAttributes : function(prefix, initialParams, identity, attributes, callback) {
			callback = callback || function() {};

			if (typeof attributes !== 'object' || typeof callback !== 'function') {
				callback(new Error('totangoClient: Invalid attributes'));
			}
			else {

				let params = {
					sdr_s : this.serviceID,
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
		},
	},
});
