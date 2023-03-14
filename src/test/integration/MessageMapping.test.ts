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
let messageMappingDirectory: string;

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    artiFactDirectory = setupResult.artiFactDirectory;
    randomPackageId = setupResult.randomPackageId;
    messageMappingDirectory = path.join(artiFactDirectory, 'Testpackage', 'MessageMapping');
});

afterAll(async () => {
    await teardown();
});

describe('Message mapping', () => {
    it('create a message mapping', async () => {
        const messageMapping = await sciRestClient.createArtifactFromDirectory(randomPackageId, messageMappingDirectory);
        expect(messageMapping).toBeDefined();
    });

    it('update the message mapping...', async () => {
        const messageMapping = await sciRestClient.updateArtifactFromDirectory(messageMappingDirectory);
        expect(messageMapping).toBe(undefined);
    });

    it('fetch a message mapping', async () => {
        const readStream = (await sciRestClient.getArtifact('MessageMapping', '1.0.0', 'MessageMapping')) as ReadStream;

        const writer = fs.createWriteStream(path.join(artiFactDirectory, 'test.zip'));
        const finishPromise = new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        readStream.pipe(writer);
        await finishPromise;
        expect(fs.existsSync(path.join(artiFactDirectory, 'test.zip'))).toBe(true);
    });

    it('upload a new version of the message mapping', async () => {
        await replace({
            files: path.join(messageMappingDirectory, 'META-INF', 'MANIFEST.MF'),
            from: /1.0.0/g,
            to: '2.0.0',
        });
        const messageMapping = await sciRestClient.updateArtifactFromDirectory(
            path.join(artiFactDirectory, 'Testpackage', 'MessageMapping')
        );
        expect(messageMapping).toBe(undefined);
    });

    it('determine the artifact type', () => {
        expect(sciRestClient.getArtifactType(messageMappingDirectory)).toBe('MessageMapping');
    });

    it('check the supported API actions', () => {
        expect(sciRestClient.isActionSupported(APIAction.Create, messageMappingDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Update, messageMappingDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.New_Version, messageMappingDirectory)).toBe(true);
        expect(sciRestClient.isActionSupported(APIAction.Delete, messageMappingDirectory)).toBe(false);
    });
});
