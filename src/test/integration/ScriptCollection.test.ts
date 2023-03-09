import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import SCIRestClient from '../../lib/client/SCIRestClient.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs, { ReadStream } from 'fs';
import replace from 'replace-in-file';
import { setup, teardown } from '../setupAndTeardown.js';

let sciRestClient: SCIRestClient;
let artiFactDirectory: string;
let randomPackageId = uuidv4().replaceAll('-', '');

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    artiFactDirectory = setupResult.artiFactDirectory;
    randomPackageId = setupResult.randomPackageId;
});

afterAll(async () => {
    await teardown();
});

describe('Script collection', () => {
    it('create a script collection', async () => {
        const integrationFlow = await sciRestClient.createArtifactFromDirectory(
            randomPackageId,
            path.join(artiFactDirectory, 'Testpackage', 'ScriptCollection')
        );
        expect(integrationFlow).toBeDefined();
    });

    it('update the script collection', async () => {
        const ScriptCollection = await sciRestClient.updateArtifactFromDirectory(
            path.join(artiFactDirectory, 'Testpackage', 'ScriptCollection')
        );
        expect(ScriptCollection).toBe(undefined);
    });

    it.skip('fetch a script collection', async () => {
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

    it('upload a new version of the script collection', async () => {
        const scriptCollectionDirectory = path.join(artiFactDirectory, 'Testpackage', 'ScriptCollection');
        await replace({
            files: path.join(scriptCollectionDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const scriptCollection = await sciRestClient.updateArtifactFromDirectory(
            path.join(artiFactDirectory, 'Testpackage', 'ScriptCollection')
        );
        expect(scriptCollection).toBe(undefined);
    });
});
