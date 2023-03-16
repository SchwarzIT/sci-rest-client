import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import SCIRestClient from '../../lib/client/SCIRestClient.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs, { ReadStream } from 'fs';
import replace from 'replace-in-file';
import { setup, teardown } from '../setupAndTeardown.js';
import APIAction from '../../lib/client/APIAction.js';

let sciRestClient: SCIRestClient;
let artiFactDirectory: string;
let randomPackageId = uuidv4().replaceAll('-', '');
let iFlowDirectory: string;

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    artiFactDirectory = setupResult.artiFactDirectory;
    randomPackageId = setupResult.randomPackageId;
    iFlowDirectory = path.join(artiFactDirectory, 'Testpackage', 'IntegrationFlow');
});

afterAll(async () => {
    await teardown();
});

describe('Integration flow', () => {
    it('create an integration flow', async () => {
        const integrationFlow = await sciRestClient.createArtifactFromDirectory(randomPackageId, iFlowDirectory);
        expect(integrationFlow).toBeDefined();
    });

    it('fetch an integration flow ', async () => {
        const readStream = (await sciRestClient.getArtifact('IntegrationFlow', '1.0.0', 'IntegrationFlow')) as ReadStream;

        const writer = fs.createWriteStream(path.join(artiFactDirectory, 'test.zip'));
        const finishPromise = new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        readStream.pipe(writer);
        await finishPromise;
        expect(fs.existsSync(path.join(artiFactDirectory, 'test.zip'))).toBe(true);
    });

    it('update an integration flow', async () => {
        const integrationFlow = await sciRestClient.updateArtifactFromDirectory(iFlowDirectory);
        expect(integrationFlow).toBe(undefined);
    });

    it('upload a new version of an integration flow', async () => {
        await replace({
            files: path.join(iFlowDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const integrationFlow = await sciRestClient.updateArtifactFromDirectory(
            path.join(artiFactDirectory, 'Testpackage', 'IntegrationFlow')
        );
        expect(integrationFlow).toBe(undefined);
    });

    it('determine the artifact type', () => {
        expect(sciRestClient.getArtifactType(iFlowDirectory)).toBe('IntegrationFlow');
    });

    it('check the supported API actions', () => {
        expect(sciRestClient.isActionSupported(APIAction.Create, iFlowDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Update, iFlowDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.New_Version, iFlowDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Delete, iFlowDirectory)).toBe(false);
    });

    it('provides the metadata for the artifact in the given directory', () => {
        expect(sciRestClient.getArtifactMetadata(iFlowDirectory).Id).toBe('IntegrationFlow');
        expect(sciRestClient.getArtifactMetadata(iFlowDirectory).Version).toBe('2.0.0');
        expect(sciRestClient.getArtifactMetadata(iFlowDirectory).Name).toBe('Integration Flow');
        expect(sciRestClient.getArtifactMetadata(iFlowDirectory).Type).toBe('IntegrationFlow');
    });
});
