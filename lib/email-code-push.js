'use babel';

import EmailCodePushView from './email-code-push-view';
import {
  CompositeDisposable
} from 'atom';
import AuthToken from './auth.js';
const axios = require('axios');
import {
  parseFileName,
  getData,
  parseFilePath,
  getFilePath
} from './utilities.js';

import Config from './config';

export default {
  config: Config.schema,
  emailCodePushView: null,
  modalPanel: null,
  subscriptions: null,
  token_prod: {
    token: null,
    expired: null,
    rest_endpoint: null,
    token_type: null,
  },
  token_test: {
    token: null,
    expired: null,
    rest_endpoint: null,
    token_type: null,
  },
  credentials: null,

  activate(state) {
    this.emailCodePushView = new EmailCodePushView(state.emailCodePushViewState);
    this.credentials = atom.config.get('email-code-push');
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.emailCodePushView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    //Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'email-code-push:toggle-test': () => this.toggle('test'),
      'email-code-push:toggle-prod': () => this.toggle('prod')
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.emailCodePushView.destroy();
  },

  serialize() {
    return {
      emailCodePushViewState: this.emailCodePushView.serialize(),
    };
  },

  errorLog(error,env) {
    let message;
    if (error.response) {
      //console.log(error.response);
      // Request made and server responded
      //console.log(error.response.data, 'data');
      //console.log(error.response.status, 'status');
      if (error.response.statusText === 'Unauthorized') {
        if (env === 'prod'){this.token_prod.expired = true;}
        else {this.token_test.expired = true;}

        message = 'Your token has likely expired try pushing again!';
      } else {
        //console.log(error.response.headers, 'headers');
        message = error.response.data.message;

      }

    } else if (error.request) {
      // The request was made but no response was received
      //console.log(error.request, 'Request');
      message = error.request;
    } else if (error.message === "WrongFileType") {
      message = 'This type of file cannot be updated with this package. Only htmlemail and/or codesnippetblock types can be updated. Pleaes update your file manually!'
    } else if (error.message == "noFilesFound") {
      message = 'No files found in Marketing Cloud with current file name'
    } else if (error.message === "folderPathNotFound") {
      message = 'Multiple files with current name in Marketing Cloud but no matching file path found. Check file paths in atom and Marketing Cloud.'
    } else {
      // Something happened in setting up the request that triggered an Error
      //console.log('Error', error.message);
      message = error.message;
    }

    atom.notifications.addWarning('ERROR PUSHING CODE: ' + message);
  },

  async authenticate(env) {
    let authUrl = this.credentials.auth_url_test;
    let clientID = this.credentials.client_id_test;
    let clientSecret = this.credentials.client_secret_test;

    if (env === 'prod') {
      authUrl = this.credentials.auth_url_prod;
      clientID = this.credentials.client_id_prod;
      clientSecret = this.credentials.client_prod;
    };

    if (!authUrl) {
      atom.notifications.addWarning('ERROR NO AUTH URL IN PACKAGE SETTINGS! Update the settings and retry.');
    } else if (!clientID) {
      atom.notifications.addWarning('ERROR ClIENT ID IN PACKAGE SETTINGS! Update the settings and retry.');
    } else if (!clientSecret) {
      atom.notifications.addWarning('ERROR NO CLIENT SECRET IN PACKAGE SETTINGS! Update the settings and retry.');
    } else {
      const authToken = new AuthToken();
      console.log("requesting token");
      const tokenPromise = await authToken.getAuthToken(authUrl, clientID, clientSecret);
      console.log("got token");
      let tokenType = authToken.getTokenType();
      let restEndpoint = authToken.getRestEndPoint();

      if (env === 'prod'){
        console.log('Setting prod token');
        this.token_prod.token_type = tokenType;
        this.token_prod.rest_endpoint = restEndpoint;
      } else {
        console.log('Setting test token');
        this.token_test.token_type = tokenType;
        this.token_test.rest_endpoint = restEndpoint;
      };
      return tokenPromise;
    }
  },

  getTokenByEnvironment(env){
    return (env === 'test') ? this.token_test : this.token_prod;
  },

  async toggle(env) {
    console.log('toggled');

    let token = this.getTokenByEnvironment(env);

    if (!token.token || token.expired) {
      token.token = await this.authenticate(env);
    };

    //console.log(this.token);
    let editor;
    let authToken = token.token;

    if (editor = atom.workspace.getActiveTextEditor()) {

      let assetType;
      let parentFolder;
      let mainFolder;
      let smcFilePath;
      let atomFilePath = parseFilePath(editor.getPath());
      let assetID;
      let assetReturned;
      const fileName = parseFileName(editor.getTitle());
      const restURL = token.rest_endpoint;
      const assetQuery = restURL + 'asset/v1/content/assets';
      const contentType = 'application/json';
      const authType = token.token_type;

      if (authToken) {
        //query smc for file name
        const config = {
          method: 'GET',
          url: assetQuery + '?$filter=name=' + fileName,
          headers: {
            'Authorization': authType + ' ' + authToken,
            'Content-Type': contentType
          }
        };

        axios(config)
          .then(async (response) => {

            //object with all info about all files that match name
            assetReturned = response.data;
            //console.log(assetReturned);

            let count = assetReturned.count;
            //console.log(count);

            if (count < 1) {
              throw new Error('noFilesFound');
            }
            //sets asset ID based on file path when more than one asset is found with same name
            if (count > 1) {

              let foundFilePath = false;

              console.log("Many files");

              for (let i = 0; i < assetReturned.items.length; i++) {
                //set first folder up
                parentFolder = assetReturned.items[i].category.name;
                //console.log(parentFolder);
                //next folder
                let mainFolderID = assetReturned.items[i].category.parentId;
                //console.log(mainFolderID);

                //config to query remaining folder structure
                const queryFolderName = {
                  method: 'GET',
                  url: restURL + 'asset/v1/content/categories/' + mainFolderID,
                  headers: {
                    'Authorization': authType + ' ' + authToken,
                    'Content-Type': contentType
                  }
                };
                console.log("about to query for folder path");

                smcFilePath = await getFilePath(queryFolderName, restURL, authType, authToken, contentType);
                smcFilePath = `${smcFilePath}${parentFolder}/${fileName}.html`;
                //console.log(smcFilePath, atomFilePath);

                //check if current file path matches atom file path, set assetID to patch
                if (smcFilePath === atomFilePath) {
                  foundFilePath = true;
                  console.log('files matched');
                  assetID = assetReturned.items[i].id;
                  //set asset type
                  assetType = assetReturned.items[i].assetType.name;
                }

              }

              if (foundFilePath === false) {
                throw new Error('folderPathNotFound');
              }

              //else if only one file then update the one file
            } else {
              console.log("Only one file");
              //set asset type
              assetType = assetReturned.items[0].assetType.name;
              //console.log(assetType);

              //console.log(response.data, assetType);
              assetID = assetReturned.items[0].id;
            }

            if (assetType !== 'codesnippetblock' && assetType !== 'htmlemail') {
              console.log('wrong asset type');
              throw new Error('WrongFileType');
            };

            return assetID;
          })
          .then(() => {
            console.log("starting asset patch");
            const emailCode = editor.getText();

            //get data to correctly update asset
            const data = getData(assetType, emailCode);

            const configPatch = {
              method: 'PATCH',
              url: assetQuery + '/' + assetID,
              headers: {
                'Content-Type': contentType,
                'Authorization': authType + ' ' + authToken
              },
              data: data
            };

            return axios(configPatch);
          })
          .then((response) => {
            //console.log(response.data);
            atom.notifications.addSuccess('Code has been pushed into SMC Test file: ' + response.data.name);
          })
          .catch((error) => {
            this.errorLog(error,env);
            //console.log(error);
          });

      };

    };

  }

}
