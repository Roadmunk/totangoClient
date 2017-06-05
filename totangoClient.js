const url = require('url');
const request = require('request');
const querystring = require('querystring');
const extend = require('util')._extend;


module.exports = function(serviceId) {

	let service_id;

	if (serviceId === undefined || typeof serviceId !== 'string')  throw new Error('Please provide a service id (String)');

	service_id = serviceId;

	const trackActivity = function(accountId, userId, activity, module, callback) {
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
				sdr_s : service_id,
				sdr_o : accountId,
				sdr_u : userId,
				sdr_a : activity,
				sdr_m : module,
			};

			sendSDR(params, callback);
		}
	};

	const setUserAttributes = function(accountId, userId, attributes, callback) {
		if (typeof accountId !== 'string' || typeof userId !== 'string') {
			callback(new Error('totango-tracker.setUserAttributes: Invalid parameters'));
		}
		else {
			const initialParams = {};
			if (attributes.name) {
				initialParams['sdr_u.name'] = attributes.name;
				delete attributes.name;
			}
			setAttributes('sdr_u.', initialParams, { accountId : accountId, userId : userId }, attributes, callback);
		}
	};

	const setAccountAttributes = function(accountId, attributes, callback) {
		if (typeof accountId !== 'string') {
			callback(new Error('totango-tracker.setAccountAttributes: Invalid parameters'));
		}
		else {
			const initialParams = {};
			if (attributes.name) {
				initialParams['sdr_odn'] = attributes.name;
				delete attributes.name;
			}
			setAttributes('sdr_o.', initialParams, { accountId : accountId }, attributes, callback);
		}
	};

	var setAttributes = function(prefix, initialParams, identity, attributes, callback) {
		callback = callback || function() {};

		if (typeof attributes !== 'object' || typeof callback !== 'function') {
			callback(new Error('totango-tracker: Invalid attributes'));
		}
		else {

			let params = {
				sdr_s : service_id,
				sdr_o : identity.accountId,
			};
			if (identity.userId)  params['sdr_u'] = identity.userId;
			params = extend(params, initialParams);

			for (const attr in attributes)
				params[prefix + attr] = attributes[attr];


			sendSDR(params, callback);
		}
	};

	var sendSDR = function(params, callback) {

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
	};


	return {
		trackActivity        : trackActivity,
		setUserAttributes    : setUserAttributes,
		setAccountAttributes : setAccountAttributes,
	};

};
