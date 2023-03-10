import fs from 'fs';
import path from 'path';
import log from 'loglevel';

import { Artifact, ArtifactType } from '../types/Artifact.js';

export default class ManifestReader {
    private manifestEntries: Map<string, string>;

    constructor(artifactDirectory: string) {
        log.info(`Reading manifest from ${artifactDirectory}...`);
        this.manifestEntries = new Map();
        fs.readFileSync(path.join(artifactDirectory, 'META-INF', 'MANIFEST.MF'), 'utf-8')
            .split(/\r?\n/)
            .forEach((line) => {
                const [key, value] = line.split(':');
                if (key && value) {
                    this.manifestEntries.set(key.trim(), value.trim());
                }
            });
    }

    get(key: string) {
        return this.manifestEntries.get(key);
    }

    getArtifactMetadata(): Artifact {
        return {
            Id:
                (this.manifestEntries.get('Origin-Bundle-SymbolicName') as string) ||
                (this.manifestEntries.get('Bundle-SymbolicName') as string).split(';')[0],
            Version: this.manifestEntries.get('Bundle-Version') as string,
            Name: this.manifestEntries.get('Bundle-Name') as string,
            Type: this.manifestEntries.get('SAP-BundleType') as ArtifactType,
        };
    }
}
