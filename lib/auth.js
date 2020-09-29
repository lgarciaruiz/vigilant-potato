'use babel';

const axios = require('axios');

export default class AuthToken {

  getAuthToken(url, clientID, clientSecret){
    const authConfig = {
      method: 'POST',
      url: url + '.auth.marketingcloudapis.com/v2/token',
      headers: {
        'Content-Type': 'application/json'
      },
      data : {
        "client_id": clientID,
        "client_secret": clientSecret,
        "grant_type":"client_credentials"
      }
    };

    return new Promise((resolve, reject) => {
      axios(authConfig)

      .then((response) => {
          //console.log(response);
          let token = response.data.access_token;
          resolve(token);
      }, (error)=> {
        reject(error);
      });

    });

  };

}
