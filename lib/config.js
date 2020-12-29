'use babel';

const Config = {
  schema: {
    client_id_test: {
      title: 'Client ID Test',
      type: 'string',
      default: '',
      description: 'Client ID From Test SFMC',
      order: 1
    },
    client_secret_test: {
      title: 'Client Secret Test',
      type: 'string',
      default: '',
      description: 'Client Secret From Test SFMC',
      order: 2
    },
    auth_url_test: {
      title: 'Auth Url Test',
      type: 'string',
      default: '',
      description: 'AUTH URL from Test SFMC',
      order: 3
    },
    client_id_prod: {
      title: 'Client ID Prod',
      type: 'string',
      default: '',
      description: 'Client ID From Prod SFMC',
      order: 4
    },
    client_secret_prod: {
      title: 'Client Secret Prod',
      type: 'string',
      default: '',
      description: 'Client Secret From Prod SFMC',
      order: 5
    },
    auth_url_prod: {
      title: 'Auth Url Prod',
      type: 'string',
      default: '',
      description: 'AUTH URL from Prod SFMC',
      order: 6
    }
  }
};

export default Config;
