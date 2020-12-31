'use babel';
const axios = require('axios');

//parses filename to find asset to update
export const parseFileName = function(fileName) {
  var name = fileName.replace('.html', '');
  return name;
};

//sets data to updated based on assetType
export const getData = function(assetType, code) {
  let data;
  if (assetType === 'htmlemail') {
    data = JSON.stringify({
      "views": {
        "html": {
          "content": code
        }
      }
    });
  } else if (assetType === 'codesnippetblock') {
    data = JSON.stringify({
      "content": code
    });
  };
  return data;
};

//gets filepath in atom starting from content builder
export const parseFilePath = function(filePath) {
  let index = filePath.indexOf('Content Builder');

  return filePath.substring(index, filePath.length);
};

//get file path for current asset
export const getFilePath = async function(folderQueryConfig, rest_instance_url, auth_type, auth_token, conent_type) {
  let currFolderName;
  let filePath = '';

  while (currFolderName != 'Content Builder') {
    let folder = {};

    await axios(folderQueryConfig).then((response) => {
      folder = response.data;
      currFolderName = folder.name;
      //console.log(folder.parentId);
      //console.log(currFolderName);
      filePath = currFolderName + '/' + filePath;
      //console.log(filePath);
    }).catch((error) => {
      throw new Error(error);
      //console.log(error);
    });

    folderQueryConfig = {
      method: 'GET',
      url: rest_instance_url + 'asset/v1/content/categories/' + folder.parentId,
      headers: {
        'Authorization': auth_type + ' ' + auth_token,
        'Content-Type': conent_type
      }
    };

  };

  return filePath;
};
