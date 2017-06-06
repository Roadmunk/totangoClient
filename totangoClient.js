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

	constructor : function(serviceID) {
		this.serviceID    = serviceID;
	},

	methods : {
		/**
		 * Track user activities to Totango.
		 * @param {String} [accountID]
		 * @param {String} [userID]
		 * @param {String} [activity]
		 * @param {String} [module]
		 */
		trackActivity : function(accountID, userID, activity, module, callback) {
			callback = callback || function() {};

			if (typeof accountID !== 'string' ||
	            typeof userID !== 'string' ||
	            typeof activity !== 'string' ||
	            typeof module !== 'string' ||
	            typeof callback !== 'function') {
				callback(new Error('totangoClient.trackActivity: Invalid parameters'));
			}
			else {
				const params = {
					sdr_s : this.serviceID,
					sdr_o : accountID,
					sdr_u : userID,
					sdr_a : activity,
					sdr_m : module,
				};

				this.sendSDR(params, callback);
			}
		},

		/**
		 * Send user attributes to Totango.
		 * @param {String} [accountID]
		 * @param {String} [userID]
		 * @param {Object} [attributes]
		 */
		setUserAttributes : function(accountID, userID, attributes, callback) {
			if (typeof accountID !== 'string' || typeof userID !== 'string') {
				callback(new Error('totangoClient.setUserAttributes: Invalid parameters'));
			}
			else {
				const initialParams = {};
				if (attributes.name) {
					initialParams['sdr_u.name'] = attributes.name;
					delete attributes.name;
				}
				this.setAttributes('sdr_u.', initialParams, { accountID : accountID, userID : userID }, attributes, callback);
			}
		},

		/**
		 * Send account attributes to Totango.
		 * @param {String} [accountID]
		 * @param {Object} [attributes]
		 */
		setAccountAttributes : function(accountID, attributes, callback) {
	        if (typeof accountID !== 'string') {
				callback(new Error('totangoClient.setAccountAttributes: Invalid parameters'));
	        }
	        else {
	            const initialParams = {};
	            if (attributes.name) {
	                initialParams['sdr_odn'] = attributes.name;
	                delete attributes.name;
	            }
	            this.setAttributes('sdr_o.', initialParams, { accountID : accountID }, attributes, callback);
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
					sdr_o : identity.accountID,
				};
				if (identity.userID)  params['sdr_u'] = identity.userID;
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
