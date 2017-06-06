const JS            = require('JSClass/JS');
const extend        = require('util')._extend;
const Promise       = require('bluebird');
const axios         = require('axios');

const TotangoClient = module.exports = JS.class('TotangoClient');


JS.class(TotangoClient, {
	fields : {
		serviceID : '',
	},

	constructor : function(serviceID) {
		this.serviceID = serviceID;
	},

	methods : {
		/**
		 * Track user activities to Totango.
		 * @param {String} [accountID]
		 * @param {String} [userID]
		 * @param {String} [activity]
		 * @param {String} [module]
		 */
		trackActivity : Promise.coroutine(function*(accountID, userID, activity, module) {
			try {
				if (typeof accountID !== 'string' ||
					typeof userID !== 'string' ||
					typeof activity !== 'string' ||
					typeof module !== 'string') {
					throw new Error('totangoClient.trackActivity: Invalid parameters');
				}
				else {
					const params = {
						sdr_s : this.serviceID,
						sdr_o : accountID,
						sdr_u : userID,
						sdr_a : activity,
						sdr_m : module,
					};
					yield this.sendSDR(params);
				}
			}
			catch (error) {
				throw error;
			}
		}),

		/**
		 * Send user attributes to Totango.
		 * @param {String} [accountID]
		 * @param {String} [userID]
		 * @param {Object} [attributes]
		 */
		setUserAttributes : Promise.coroutine(function*(accountID, userID, attributes) {
			try {
				if (typeof accountID !== 'string' || typeof userID !== 'string') {
					throw new Error('totangoClient.setUserAttributes: Invalid parameters');
				}
				else {
					const initialParams = {};
					if (attributes.name) {
						initialParams['sdr_u.name'] = attributes.name;
						delete attributes.name;
					}
					yield this.setAttributes('sdr_u.', initialParams, { accountID : accountID, userID : userID }, attributes);
				}
			}
			catch (error) {
				throw error;
			}
		}),

		/**
		 * Send account attributes to Totango.
		 * @param {String} [accountID]
		 * @param {Object} [attributes]
		 */
		setAccountAttributes : Promise.coroutine(function*(accountID, attributes) {
			try {
				if (typeof accountID !== 'string') {
					throw new Error('totangoClient.setAccountAttributes: Invalid parameters');
				}
				else {
					const initialParams = {};
					if (attributes.name) {
						initialParams['sdr_odn'] = attributes.name;
						delete attributes.name;
					}
					yield this.setAttributes('sdr_o.', initialParams, { accountID : accountID }, attributes);
				}
			}
			catch (error) {
				throw error;
			}
		}),

		setAttributes : Promise.coroutine(function*(prefix, initialParams, identity, attributes) {
			try {
				if (typeof attributes !== 'object') {
					throw new Error('totangoClient: Invalid attributes');
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

					yield this.sendSDR(params);
				}
			}
			catch (error) {
				throw error;
			}
		}),

		sendSDR : Promise.coroutine(function*(params) {
			let response;

			try {
				response = yield axios({
					method : 'GET',
					url    : 'https://sdr.totango.com/pixel.gif',
					params : params,
				});

				if (response.status !== 200 && response.status !== 201)
					throw new Error(`Invalid request, status code: ${response.status}`);
			}
			catch (error) {
				throw error;
			}
		}),
	},
});