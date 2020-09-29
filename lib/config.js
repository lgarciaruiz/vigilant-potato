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
    base_uri: {
      title: 'Base URI',
      type: 'string',
      default: '',
      description: 'Base URI from SFMC',
      order: 3
    }
  }
};

export default Config;
