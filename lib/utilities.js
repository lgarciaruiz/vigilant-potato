'use babel';

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
