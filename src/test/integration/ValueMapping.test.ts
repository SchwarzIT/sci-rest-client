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

describe('Value mapping', () => {
    it('create a value mapping', async () => {
        const valueMapping = await sciRestClient.createArtifactFromDirectory(
            randomPackageId,
            path.join(artiFactDirectory, 'Testpackage', 'ValueMapping')
        );
        expect(valueMapping).toBeDefined();
    });

    it.skip('update the value mapping', async () => {
        const valueMapping = await sciRestClient.updateArtifactFromDirectory(path.join(artiFactDirectory, 'Testpackage', 'ValueMapping'));
        expect(valueMapping).toBe(undefined);
    });

    it.skip('fetch a value mapping', async () => {
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

    it.skip('upload a new version of the value mapping', async () => {
        const valueMappingDirectory = path.join(artiFactDirectory, 'Testpackage', 'ValueMapping');
        await replace({
            files: path.join(valueMappingDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const valueMapping = await sciRestClient.updateArtifactFromDirectory(path.join(artiFactDirectory, 'Testpackage', 'ValueMapping'));
        expect(valueMapping).toBe(undefined);
    });
});
