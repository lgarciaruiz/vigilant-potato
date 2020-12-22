'use babel';

const Config = {
  schema: {
    client_id: {
      title: 'Client ID',
      type: 'string',
      default: '',
      description: 'Client ID From SFMC',
      order: 1
    },
    client_secret: {
      title: 'Client Secret',
      type: 'string',
      default: '',
      description: 'Client Secret From SFMC',
      order: 2
    },
    auth_url: {
      title: 'Auth Url',
      type: 'string',
      default: '',
      description: 'AUTH URL from SFMC',
      order: 3
    }
  }
};

export default Config;
