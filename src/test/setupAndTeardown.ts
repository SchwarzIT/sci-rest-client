import { expect } from 'vitest';
import SCIRestClient from '../lib/client/SCIRestClient.js';
import * as dotenv from 'dotenv';
import { isolated } from 'isolated';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const sciRestClient = new SCIRestClient({
    apiEndpoint: process.env.SCI_API_ENDPOINT,
    username: process.env.SCI_API_USER,
    password: process.env.SCI_API_PASSWORD,
});
const artiFactDirectory = await isolated({
    files: [path.join(__dirname, './Testpackage')],
});

const randomPackageId = uuidv4().replaceAll('-', '');

async function setup() {
    const integrationPackage = await sciRestClient.createIntegrationPackage({
        Id: randomPackageId,
        Name: randomPackageId,
        Description: randomPackageId,
        ShortText: randomPackageId,
        Version: '1.0.0',
        SupportedPlatform: 'SAP Cloud Integration',
        Products: '',
        Keywords: '',
        Countries: '',
        Industries: '',
        LineOfBusiness: '',
    });
    expect(integrationPackage.Id).toBe(randomPackageId);

    return {
        artiFactDirectory,
        sciRestClient,
        randomPackageId,
    };
}

async function teardown() {
    const response = await sciRestClient.deleteIntegrationPackage(randomPackageId);
    expect(response).toBeUndefined();
}

export { setup, teardown };
