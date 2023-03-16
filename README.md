[![SIT](https://img.shields.io/badge/SIT-About%20us-%236e1e6e)](https://it.schwarz)
[![SIT](https://img.shields.io/badge/SIT-awesome-blueviolet.svg)](https://jobs.schwarz)

# Integration Content API client for SAP Cloud Integration

This package simplifies the access to the [Integration Content API for SAP Cloud Integration](https://api.sap.com/api/IntegrationContent/overview). It hides all the technical implementation details like

-   url construction
-   csrf token handling
-   zipping and encoding of artifact content

and offers a clean and easy-to-use interface for managing and querying integration artifacts of design and runtime.

By now the following artifact types are supported

-   **Integration packages** (C(reate), R(ead), U(pdate), D(elete))
-   **Integration flows** (CRU)
-   **Message mappings** (CRU)
-   **Value mappings** (CR)
-   **Script collections** (CRU)

Furthermore the package offers methods to create and update artifacts based on artifact directories by reading and extracting the required information for the corresponding API call from the artifact metadata file.

# Getting Started

#### Install the package

```bash
npm install sci-rest-client
```

#### Import the package like follows and initialize the client (ESM)

```js
import SCIRestClient from 'sci-rest-client';

const SCIRestClient = new SCIRestClient({
    apiEndpoint: '<apiEndpoint>', // e.g. https://sandbox.api.sap.com/cpi/api/v1
    username: '<username>',
    password: '<password>',
});
```

#### Get all integration packages

```js
const integrationPackages = await SCIRestClient.getIntegrationPackages();
```

#### Get a single integration package

```js
const integrationPackage = await SCIRestClient.getIntegrationPackage('packageId');
```

#### Delete an integration package

```js
await sciRestClient.deleteIntegrationPackage('packageId');
```

#### Create an artifact

```js
const artifact = await this.createArtifact({
    Id: '<artifactId>',
    Type: '<IntegrationFlow | MessageMapping | ValueMapping | ScriptCollection>',
    Name: '<artifactName>'
    Content: '<base64EncodedZip>'
    PackageId: '<integrationPackageId>',
});
```

#### Update an artifact

```js
await this.updateArtifact({
    Id: '<artifactId>',
    Version: '<artifactVersion'>,
    Type: '<IntegrationFlow | MessageMapping | ValueMapping | ScriptCollection>',
    Name: '<artifactName>'
    Content: '<base64EncodedZip>'
});
```

This method is a little special. If the update fails due to a version that doesn't exist, a new version is created under the hood and the update is triggered again automatically.

#### Create an artifact from an artifact directory

```js
const integrationFlow = await SCIRestClient.createArtifactFromDirectory('<integrationPackageId>', '<pathToArtifactDirectory>');
```

The method reads and extracts the required information (id, version, name and artifact type) from the artifacts `metadata file` found under `META-INF/MANIFEST.MF` inside the artifact diretory.

#### Update an artifact from an artifact directory

```js
await SCIRestClient.updateArtifactFromDirectory('<pathToArtifactDirectory>');
```

Again the method reads and extracts the necessary infos from the metadata file mentioned above.
`updateArtifact(...)` is used under the hood, so new versions will be created automatically if necessary.

#### Create new artifact version

```js
await this.createNewArtifactVersion('<artifactId>', '<artifactVersion>', '<artifactType');
```

The method creates a new version of the artifact, but this is just a placeholder. Afterwards to content needs to uploaded via `updateArtifact(...)`. It's recommended to just call the update method directly in case you don't need any special logic for creating new versions.

#### Check if API action is supported for artifact

```js
import APIAction from 'sci-rest-client/client/APIAction';

// const isActionSupported = sciRestClient.isActionSupported(APIAction.Update, '<pathToArtifactDirectory>');
const isActionSupported = sciRestClient.isActionSupportedForArtifactType(APIAction.Update, 'IntegrationFlow');

if(isActionSupported) {
    ...
}
```

The available APIActions are: `Create`, `Read`, `Update`, `Delete` and `New_Version`.

#### Get artifact type

```js
const artifactType = sciRestClient.getArtifactType('<pathToArtifactDirectory>');
```

#### Get artifact artifact metadata

```js
const artifactMetadata = sciRestClient.getArtifactMetadata('<pathToArtifactDirectory>');
```

Returns an object containing the id, name, version and type of the artifact in the specified directory.

# Test

The package is implemented in TypeScript and [Vitest](https://vitest.dev/) is used as a test framework. The tests need to run against a real Integration content API endpoint. The API endpoint and the credentials are read from environment variables. For executing the tests create a `.env`file inside the root directory of the package

```bash
SCI_API_USER=<Username>
SCI_API_PASSWORD=<Password>
SCI_API_ENDPOINT=https://sandbox.api.sap.com/cpi/api/v1
```

or set the necessary environment variables manually.

In order to run tests execute

```bash
npm test
```

which will display the test runs and their results on the terminal.

For more details run

```bash
npm run test:ui
```

which will show the test results (and much more) on a web page.

Both commands will listen to file changes and execute the corresponding tests again.

# Contributing

We welcome any type of contribution (code contributions, pull requests, issues) to this project equally.

ESLint and SonarQube are used to ensure code quality. A Git commit hook will fix lint findings automatically (if possible) and prevent commits with linting errors. Prettier is used for formatting. Staged changes will be formatted automatically before committing.

# Release management

[release-please](https://github.com/googleapis/release-please) is used for release management and automatic CHANGELOG generation. For the latter it's important that commit messages follow the [Conventional Commit messages style](https://www.conventionalcommits.org/en/v1.0.0/).

# Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

# License

This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the LICENSE file.
