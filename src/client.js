import axios from 'axios';
import _has from 'lodash.has';
import _get from 'lodash.get';
import _isNull from 'lodash.isnull';
import _isBoolean from 'lodash.isboolean';
import _forEach from 'lodash.foreach';

export default class Client {
  constructor(config) {
    this.config = {
      clientId: null,
      clientSecret: null,
      region: null,
      accessToken: null,
      refreshToken: null,
      sandbox: false
    };
    this.apiVersion = 'v1';
    this.applicationVersion = '1.0';
    this.userAgent = `AdvertisingAPI Javascript Client Library v${this.applicationVersion}`;
    this.endpoint = null;
    this.tokenUrl = null;
    this.requestId = null;
    this.endpoints = {
      na: {
        'prod': 'advertising-api.amazon.com',
        'sandbox': 'advertising-api-test.amazon.com',
        'tokenUrl': 'api.amazon.com/auth/o2/token'
      },
      eu: {
        'prod': 'advertising-api-eu.amazon.com',
        'sandbox': 'advertising-api-test.amazon.com',
        'tokenUrl': 'api.amazon.com/auth/o2/token'
      }
    };
    this.versionStrings = null;

    this.profileId = null;

    this._validateConfig(config);
    this._validateConfigParameters();

    this.axios = axios.create({
      baseURL: this.endpoint,
      timeout: 1000,
      headers: {
        'User-Agent': this.userAgent
      }
    });

    this._setEndpoints();

    if (_isNull(this.config.accessToken) && !_isNull(this.config.refreshToken)) {
      /* convenience */
      this.doRefreshToken();
    }
  }

  setBaseUrl(baseUrl) {
    this.axios.defaults.baseURL = baseUrl;
    return this;
  }

  setAccessToken(token) {
    this.config.accessToken = token;
    this.axios.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return this;
  }

  setProfileId(profileId) {
    this.profileId = profileId;
    return this;
  }

  doRefreshToken() {
    let params = {
      'grant_type': 'refresh_token',
      'refresh_token': this.config.refreshToken,
      'client_id': this.config.clientId,
      'client_secret': this.config.clientSecret
    };

    let baseUrl = `https://${this.tokenUrl}`;

    return this.axios.get('', { baseUrl: baseUrl, params: params })
      .then((response) => {
        let accessToken = _get('response.data.access_token');

        if (accessToken) {
          this.setAccessToken(accessToken);
        } else {
          this._logAndThrow('Unable to refresh token. \'access_token\' not found in response');
        }
        return response;
      });
  }

  listProfiles() {
    return this.axios.get('profiles');
  }

  registerProfile(data) {
    return this.axios.put('profiles/register', data);
  }

  registerProfileStatus(profileId) {
    return this.axios.get(`profiles/register/${profileId}/status`);
  }

  getProfile(profileId) {
    return this.axios.get(`profiles/${profileId}`);
  }

  updateProfiles(data) {
    return this.axios.put('profiles', data);
  }

  getCampaign(campaignId) {
    return this.axios.get(`campaigns/${campaignId}`);
  }

  getCampaignEx(campaignId) {
    return this.axios.get(`campaigns/extended/${campaignId}`);
  }

  createCampaigns(data) {
    return this.axios.post('campaigns', data);
  }

  updateCampaigns(data) {
    return this.axios.put('campaigns', data);
  }

  archiveCampaign(campaignId) {
    return this.axios.delete(`campaigns/${campaignId}`);
  }

  listCampaigns(params = null) {
    return this.axios.get('campaigns', { params: params });
  }

  listCampaignsEx(params = null) {
    return this.axios.get('campaigns/extended', { params: params });
  }

  getAdGroup(adGroupId) {
    return this.axios.get(`adGroups/${adGroupId}`);
  }

  getAdGroupEx(adGroupId) {
    return this.axios.get(`adGroups/extended/${adGroupId}`);
  }

  createAdGroups(data) {
    return this.axios.post('adGroups', data);
  }

  updateAdGroups(data) {
    return this.axios.put('adGroups', data);
  }

  archiveAdGroup(adGroupId) {
    return this.axios.delete(`adGroups/${adGroupId}`);
  }

  listAdGroups(params = null) {
    return this.axios.get('adGroups', { params: params });
  }

  listAdGroupsEx(params = null) {
    return this.axios.get('adGroups/extended', { params: params });
  }

  getBiddableKeyword(keywordId) {
    return this.axios.get(`keywords/${keywordId}`);
  }

  getBiddableKeywordEx(keywordId) {
    return this.axios.get(`keywords/extended/${keywordId}`);
  }

  createBiddableKeywords(data) {
    return this.axios.post('keywords', data);
  }

  updateBiddableKeywords(data) {
    return this.axios.put('keywords', data);
  }

  archiveBiddableKeyword(keywordId) {
    return this.axios.delete(`keywords/${keywordId}`);
  }

  listBiddableKeywords(params = null) {
    return this.axios.get('keywords', { params: params });
  }

  listBiddableKeywordsEx(params = null) {
    return this.axios.get('keywords/extended', { params: params });
  }

  getNegativeKeyword(keywordId) {
    return this.axios.get(`negativeKeywords/${keywordId}`);
  }

  getNegativeKeywordEx(keywordId) {
    return this.axios.get(`negativeKeywords/extended/${keywordId}`);
  }

  createNegativeKeywords(data) {
    return this.axios.post('negativeKeywords', data);
  }

  updateNegativeKeywords(data) {
    return this.axios.put('negativeKeywords', data);
  }

  archiveNegativeKeyword(keywordId) {
    return this.axios.delete(`negativeKeywords/${keywordId}`);
  }

  listNegativeKeywords(params = null) {
    return this.axios.get('negativeKeywords', { params: params });
  }

  listNegativeKeywordsEx(params = null) {
    return this.axios.get('negativeKeywords/extended', { params: params });
  }

  getCampaignNegativeKeyword(keywordId) {
    return this.axios.get(`campaignNegativeKeywords/${keywordId}`);
  }

  getCampaignNegativeKeywordEx(keywordId) {
    return this.axios.get(`campaignNegativeKeywords/extended/${keywordId}`);
  }

  createCampaignNegativeKeywords(data) {
    return this.axios.post('campaignNegativeKeywords', data);
  }

  updateCampaignNegativeKeywords(data) {
    return this.axios.put('campaignNegativeKeywords', data);
  }

  removeCampaignNegativeKeyword(keywordId) {
    return this.axios.delete(`campaignNegativeKeywords/${keywordId}`);
  }

  listCampaignNegativeKeywords(params = null) {
    return this.axios.get('campaignNegativeKeywords', { params: params });
  }

  listCampaignNegativeKeywordsEx(params = null) {
    return this.axios.get('campaignNegativeKeywords/extended', { params: params });
  }

  getProductAd(productAdId) {
    return this.axios.get(`productAds/${productAdId}`);
  }

  getProductAdEx(productAdId) {
    return this.axios.get(`productAds/extended/${productAdId}`);
  }

  createProductAds(data) {
    return this.axios.post('productAds', data);
  }

  updateProductAds(data) {
    return this.axios.put('productAds', data);
  }

  archiveProductAd(productAdId) {
    return this.axios.delete(`productAds/${productAdId}`);
  }

  listProductAds(params = null) {
    return this.axios.get('productAds', { params: params });
  }

  listProductAdsEx(params = null) {
    return this.axios.get('productAds/extended', { params: params });
  }

  getAdGroupBidRecommendations(adGroupId) {
    return this.axios.get(`adGroups/${adGroupId}/bidRecommendations`);
  }

  getKeywordBidRecommendations(keywordId) {
    return this.axios.get(`keywords/${keywordId}/bidRecommendations`);
  }

  bulkGetKeywordBidRecommendations(adGroupId, data) {
    return this.axios.post('keywords/bidRecommendations', { adGroupId: adGroupId, keywords: data });
  }

  getAdGroupKeywordSuggestions(params) {
    let adGroupId = params.adGroupId;

    delete params.adGroupId;
    return this.axios.get(`adGroups/${adGroupId}/suggested/keywords`, { params: params });
  }

  getAdGroupKeywordSuggestionsEx(params) {
    let adGroupId = params.adGroupId;

    delete params.adGroupId;
    return this.axios.get(`adGroups/${adGroupId}/suggested/keywords/extended`, { params: params });
  }

  getAsinKeywordSuggestions(params) {
    let asin = params.asin;

    delete params.asin;
    return this.axios.get(`asins/${asin}/suggested/keywords`, params);
  }

  bulkGetAsinKeywordSuggestions(data) {
    return this.axios.post('asins/suggested/keywords', data);
  }

  requestSnapshot(recordType, data = null) {
    return this.axios.post(`${recordType}/snapshot`, data);
  }

  getSnapshot(snapshotId) {

    this.axios.get(`snapshots/${snapshotId}`)
      .then((response) => {
        let location = _get(response, 'data.location');

        return this._download(location);
      });
  }

  requestReport(recordType, data = null) {
    return this.axios.post(`${recordType}/report`, data);
  }

  getReport(reportId) {
    return this.axios.get(`reports/${reportId}`)
      .then((response) => {
        let location = _get(response, 'data.location');

        return this.axios._download(location);
      });
  }

  _download(location, gunzip = false) {
    let requestConfig = {
      headers: {}
    };

    if (!_isNull(this.profileId)) {
      requestConfig.headers['Amazon-Advertising-API-Scope'] = this.profileId;
    }
    if (gunzip) {
      /* only send authorization header when not downloading actual file */
      requestConfig.transformRequest = axios.defaults.transformRequest.concat((data, headers) => {
        // Do whatever you want to transform the data
        delete headers['Authorization'];
        return data;
      });
    }
    return this.axios.get(location, requestConfig);
  }

  _validateConfig(config) {
    if (_isNull(config)) {
      this._logAndThrow('\'config\' cannot be null.');
    }
    _forEach(config, (value, key) => {
      if (_has(this.config, key)) {
        this.config[key] = value;
      } else {
        this._logAndThrow(`Unknown parameter '${key}' in config.`);
      }
    });
    return true;
  }

  _validateConfigParameters() {

    _forEach(this.config, (value, key) => {
      if (_isNull(value) && key !== 'accessToken' && key !== 'refreshToken') {
        this._logAndThrow(`Missing required parameter '${key}'.`);
      }
      switch (key) {
        case 'clientId':
          if (!value.match(/^amzn1\.application-oa2-client\.[a-z0-9]{32}$/i)) {
            this._logAndThrow('Invalid parameter value for clientId.');
          }
          break;
        case 'clientSecret':
          if (!value.match(/^[a-z0-9]{64}$/i)) {
            this._logAndThrow('Invalid parameter value for clientSecret.');
          }
          break;
        case 'accessToken':
          if (!_isNull(value)) {
            if (!value.match(/^Atza(\||%7C|%7c).*$/)) {
              this._logAndThrow('Invalid parameter value for accessToken.');
            }
          }
          break;
        case 'refreshToken':
          if (!_isNull(value)) {
            if (!value.match(/^Atzr(\||%7C|%7c).*$/)) {
              this._logAndThrow('Invalid parameter value for refreshToken.');
            }
          }
          break;
        case 'sandbox':
          if (!_isBoolean(value)) {
            this._logAndThrow('Invalid parameter value for sandbox.');
          }
          break;
      }
    });
    return true;
  }

  _setEndpoints() {
    /* check if region exists and set api/token endpoints */
    if (_has(this.endpoints, this.config.region)) {
      let regionCode = this.config.region.toLowerCase();

      if (this.config.sandbox) {
        this.endpoint = `https://${_get(this.endpoints, regionCode + '.sandbox')}/${this.apiVersion}`;
      } else {
        this.endpoint = `https://${_get(this.endpoints, regionCode + '.prod')}/${this.apiVersion}`;
      }
      this.setBaseUrl(this.endpoint);
      this.tokenUrl = _get(this.endpoints, regionCode + '.tokenUrl');
    } else {
      this._logAndThrow('Invalid region.');
    }
    return true;
  }

  _logAndThrow(message) {
    console.log(message);
    throw new Error(message);
  }
}
