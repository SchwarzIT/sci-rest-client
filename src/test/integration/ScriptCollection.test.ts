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
let scriptCollectionDirectory: string;

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    artiFactDirectory = setupResult.artiFactDirectory;
    randomPackageId = setupResult.randomPackageId;
    scriptCollectionDirectory = path.join(artiFactDirectory, 'Testpackage', 'ScriptCollection');
});

afterAll(async () => {
    await teardown();
});

describe('Script collection', () => {
    it('create a script collection', async () => {
        const integrationFlow = await sciRestClient.createArtifactFromDirectory(randomPackageId, scriptCollectionDirectory);
        expect(integrationFlow).toBeDefined();
    });

    it('update the script collection', async () => {
        const ScriptCollection = await sciRestClient.updateArtifactFromDirectory(scriptCollectionDirectory);
        expect(ScriptCollection).toBe(undefined);
    });

    it('fetch a script collection', async () => {
        const readStream = (await sciRestClient.getArtifact('ScriptCollection', '1.0.0', 'ScriptCollection')) as ReadStream;

        const writer = fs.createWriteStream(path.join(artiFactDirectory, 'test.zip'));
        const finishPromise = new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        readStream.pipe(writer);
        await finishPromise;
        expect(fs.existsSync(path.join(artiFactDirectory, 'test.zip'))).toBe(true);
    });

    it('upload a new version of the script collection', async () => {
        await replace({
            files: path.join(scriptCollectionDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const scriptCollection = await sciRestClient.updateArtifactFromDirectory(scriptCollectionDirectory);
        expect(scriptCollection).toBe(undefined);
    });

    it('determine the artifact type', () => {
        expect(sciRestClient.getArtifactType(scriptCollectionDirectory)).toBe('ScriptCollection');
    });

    it('check the supported API actions', () => {
        expect(sciRestClient.isActionSupported(APIAction.Create, scriptCollectionDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Update, scriptCollectionDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.New_Version, scriptCollectionDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Delete, scriptCollectionDirectory)).toBe(false);
    });

    it('provides the metadata for the artifact in the given directory', () => {
        expect(sciRestClient.getArtifactMetadata(scriptCollectionDirectory).Id).toBe('ScriptCollection');
        expect(sciRestClient.getArtifactMetadata(scriptCollectionDirectory).Version).toBe('2.0.0');
        expect(sciRestClient.getArtifactMetadata(scriptCollectionDirectory).Name).toBe('ScriptCollection');
        expect(sciRestClient.getArtifactMetadata(scriptCollectionDirectory).Type).toBe('ScriptCollection');
    });
});
