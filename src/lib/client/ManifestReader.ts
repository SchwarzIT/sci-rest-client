import fs from 'fs';
import path from 'path';
import log from 'loglevel';

import { Artifact, ArtifactType } from '../types/Artifact.js';

export default class ManifestReader {
    private manifestEntries: Map<string, string>;

    constructor(artifactDirectory: string) {
        log.info(`Reading manifest from ${artifactDirectory}...`);
        this.manifestEntries = new Map();
        const lines = fs.readFileSync(path.join(artifactDirectory, 'META-INF', 'MANIFEST.MF'), 'utf-8').split(/\r?\n/);

        let lastLineKey = '';
        lines.forEach((line) => {
            const [key, value] = line.split(':');
            if (key && value && key.match(/^[^\s]+$/)) {
                const keyTrimmed = key.trim();
                this.manifestEntries.set(keyTrimmed, value.trim());
                lastLineKey = keyTrimmed;
            } else if (lastLineKey) {
                const lastValue = this.manifestEntries.get(lastLineKey);
                this.manifestEntries.set(lastLineKey, `${lastValue}${key.trim()}`);
            }
        });
    }

    get(key: string) {
        return this.manifestEntries.get(key);
    }

    getArtifactMetadata(): Artifact {
        return {
            Id:
                (this.manifestEntries.get('Bundle-SymbolicName') as string).split(';')[0] ||
                (this.manifestEntries.get('Origin-Bundle-SymbolicName') as string),
            Version: this.manifestEntries.get('Bundle-Version') as string,
            Name: this.manifestEntries.get('Bundle-Name') as string,
            Type: this.manifestEntries.get('SAP-BundleType') as ArtifactType,
        };
    }
}
