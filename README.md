# email-code-push package

A package to push html paste email code and code snippets to SFMC environment using REST API endpoint. Only for Content Builder!

The file name in your local directory must match the file name in SFMC exactly.

When multiple files have the same name the program will look to match the asset based on file path down to the content builder root folder. This means your local file must have the same path in your local directory. Example Content Builder/FolderName/OtherFolder/file.html

If only one file exists with the file name in content builder then the file path does not need to match.

## Instructions

1. Before you can use this atom package you need to create a package in SFMC that you can hook up to. Follow the [SFMC documentation](https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/index.htm) to create this package.
  - Make sure your package has documents_and_images_write, documents_and_images_read permissions, and email_write, email_read. No other permissions needed.

2. Enter your SFMC Auth URL exactly as it appears in SFMC in the auth URL Field
3. Enter your SFMC Client Secret
4. Enter your SFMC Client ID
