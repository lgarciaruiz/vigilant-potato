'use babel';

const axios = require('axios');

export default class AuthToken {

  constructor() {
    this.restEndpoint;
    this.authType;
  };

  getAuthToken(url, clientID, clientSecret) {
    const authConfig = {
      method: 'POST',
      url: url + 'v2/token',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        "client_id": clientID,
        "client_secret": clientSecret,
        "grant_type": "client_credentials"
      }
    };

    return new Promise((resolve, reject) => {
      axios(authConfig)

        .then((response) => {
          //console.log(response);
          let token = response.data.access_token;
          this.restEndpoint = response.data.rest_instance_url;
          this.authType = response.data.token_type;
          resolve(token);
        }, (error) => {
          reject(error);
        });

    });

  };

  getRestEndPoint() {
    return this.restEndpoint;
  };

  getTokenType() {
    return this.authType;
  };

}
