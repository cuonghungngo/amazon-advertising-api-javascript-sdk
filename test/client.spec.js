/* global describe, it, before */

import chai from 'chai';
import Client from '../src/client';

chai.expect();

const expect = chai.expect;

let client;
const config = {
  clientId: 'amzn1.application-oa2-client.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  clientSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  region: 'na',
  accessToken: 'Atza|test',
  refreshToken: 'Atzr|test',
  sandbox: false
};

// US, CA, UK, DE, FR, ES, IT, IN, CN, JP

describe('Given an instance of my Client library', () => {
  before(() => {
    client = new Client(config);
  });

  describe('When I check the version', () => {
    it('should return the version', () => {
      expect(client.apiVersion).to.be.equal('v1');
    });
  });

});
