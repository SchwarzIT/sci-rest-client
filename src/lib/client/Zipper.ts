import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { zip } from 'zip-a-folder';
import log from 'loglevel';

async function zipArtifact(artifactDirectoryPath: string, artifactName: string) {
    log.info(`Zipping artifact ${artifactName} from ${artifactDirectoryPath}...`);
    const artifactZipDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'artifactZipDir'));
    const zipFilePath = `${path.join(artifactZipDirectory, artifactName)}.zip`;

    await zip(artifactDirectoryPath, zipFilePath);

    return zipFilePath;
}

async function zipArtifactAsBase64(artifactDirectoryPath: string, artifactName: string) {
    const artifactZipPath = await zipArtifact(artifactDirectoryPath, artifactName);

    log.info('Encoding artifact zip as base64...');
    const artifactZipBase64 = await fs.readFile(artifactZipPath, 'base64');

    return artifactZipBase64;
}

export { zipArtifact, zipArtifactAsBase64 };
