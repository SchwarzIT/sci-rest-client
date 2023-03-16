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
let valueMappingDirectory: string;

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    artiFactDirectory = setupResult.artiFactDirectory;
    randomPackageId = setupResult.randomPackageId;
    valueMappingDirectory = path.join(artiFactDirectory, 'Testpackage', 'ValueMapping');
});

afterAll(async () => {
    await teardown();
});

describe('Value mapping', () => {
    it('create a value mapping', async () => {
        const valueMapping = await sciRestClient.createArtifactFromDirectory(randomPackageId, valueMappingDirectory);
        expect(valueMapping).toBeDefined();
    });

    it.skip('update the value mapping', async () => {
        const valueMapping = await sciRestClient.updateArtifactFromDirectory(valueMappingDirectory);
        expect(valueMapping).toBe(undefined);
    });

    it('fetch a value mapping', async () => {
        const readStream = (await sciRestClient.getArtifact('ValueMapping', '1.0.0', 'ValueMapping')) as ReadStream;

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
        await replace({
            files: path.join(valueMappingDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const valueMapping = await sciRestClient.updateArtifactFromDirectory(valueMappingDirectory);
        expect(valueMapping).toBe(undefined);
    });

    it('determine the artifact type', () => {
        expect(sciRestClient.getArtifactType(valueMappingDirectory)).toBe('ValueMapping');
    });

    it('check the supported API actions', () => {
        expect(sciRestClient.isActionSupported(APIAction.Create, valueMappingDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Update, valueMappingDirectory)).toBe(false);
        expect(sciRestClient.isActionSupported(APIAction.New_Version, valueMappingDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Delete, valueMappingDirectory)).toBe(false);
    });

    it('provides the metadata for the artifact in the given directory', () => {
        expect(sciRestClient.getArtifactMetadata(valueMappingDirectory).Id).toBe('ValueMapping');
        expect(sciRestClient.getArtifactMetadata(valueMappingDirectory).Version).toBe('1.0.0');
        expect(sciRestClient.getArtifactMetadata(valueMappingDirectory).Name).toBe('ValueMapping');
        expect(sciRestClient.getArtifactMetadata(valueMappingDirectory).Type).toBe('ValueMapping');
    });
});
