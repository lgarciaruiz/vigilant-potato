'use babel';

import EmailCodePushView from './email-code-push-view';
import {
    CompositeDisposable
} from 'atom';
import AuthToken from './auth.js';
const axios = require('axios');
import {
    parseFileName,
    getData
} from './utilities.js';

import Config from './config';

export default {
    config: Config.schema,
    emailCodePushView: null,
    modalPanel: null,
    subscriptions: null,
    token: null,
    credentials: null,
    expired_token: null,
    rest_endpoint: null,
    token_type: null,

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
            'email-code-push:toggle': () => this.toggle()
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

    errorLog(error) {
        let message;
        if (error.response) {
            console.log(error.response);
            // Request made and server responded
            //console.log(error.response.data, 'data');
            //console.log(error.response.status, 'status');
            if (error.response.statusText === 'Unauthorized') {
                this.expired_token = true;
                message = 'Your token has likely expired try pushing again!';
            } else {
                //console.log(error.response.headers, 'headers');
                message = error.response.data.message;

            }

        } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request, 'Request');
            message = error.request;
        } else if (error = "ManyFiles") {
          message = 'There are multiple files with same name, best to update manually for now. Nothing was changed!'
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            message = error.message;
        }

        atom.notifications.addWarning('ERROR PUSHING CODE: ' + message);
    },

    async authenticate() {
        if (!this.credentials.auth_url) {
            atom.notifications.addWarning('ERROR NO AUTH URL IN PACKAGE SETTINGS! Update the settings and retry.');
        } else if (!this.credentials.client_id) {
            atom.notifications.addWarning('ERROR ClIENT ID IN PACKAGE SETTINGS! Update the settings and retry.');
        } else if (!this.credentials.client_secret) {
            atom.notifications.addWarning('ERROR NO CLIENT SECRET IN PACKAGE SETTINGS! Update the settings and retry.');
        } else {
            const authToken = new AuthToken();
            const tokenPromise = await authToken.getAuthToken(this.credentials.auth_url, this.credentials.client_id, this.credentials.client_secret);
            this.token_type = authToken.getTokenType();
            this.rest_endpoint = authToken.getRestEndPoint();
            return tokenPromise;
        }
    },

    async toggle() {
        if (!this.token || this.expired_token) {
            this.token = await this.authenticate();
        };

        //console.log(this.token);
        let editor;
        let authToken = this.token;

        if (editor = atom.workspace.getActiveTextEditor()) {

            let assetType;
            let parentFolder;
            //console.log(this.credentials);
            const fileName = parseFileName(editor.getTitle());
            const restURL = this.rest_endpoint + 'asset/v1/content/assets';
            const contentType = 'application/json';
            const authType = this.token_type;

            if (authToken) {
                //query smc for file name
                const config = {
                    method: 'GET',
                    url: restURL + '?$filter=name=' + fileName,
                    headers: {
                        'Authorization': authType + ' ' + authToken,
                        'Content-Type': contentType
                    }
                };

                axios(config)
                    .then((response) => {
                        //assetType could be many but we only want to update htmlpaste and codesnippetblock for now

                        //Raise Error if more than one file with same name
                        if(response.data.count > 1){
                          throw new Error('ManyFiles');
                        } else {
                        assetType = response.data.items[0].assetType.name;
                        //parentFolder = response.data.items
                        //console.log(response.data, assetType);
                        return response.data.items[0].id;
                      }
                    })
                    //update file by assetID
                    .then((assetID) => {
                        const emailCode = editor.getText();

                        //get data to correctly update asset
                        const data = getData(assetType, emailCode);

                        const configPatch = {
                            method: 'PATCH',
                            url: restURL + '/' + assetID,
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
                        this.errorLog(error);
                    });

            };

        };

    }

}
