import { Action } from './API.js';

export interface Artifact {
    Id: string;
    Version?: string;
    Name: string;
    Description?: string;
    Type: ArtifactType;
}

export interface DesignTimeArtifact extends Artifact {
    PackageId?: string;
    Content: string;
}

export interface ArtifactMetadata {
    artifactEntityName: string;
    supportedActions: Action[];
    newVersionEntity: string | undefined;
}

export interface IntegrationPackage extends Artifact {
    ShortText: string;
    SupportedPlatform: string;
    Products: string;
    Keywords: string;
    Countries: string;
    Industries: string;
    LineOfBusiness: string;
}

export type ArtifactActionFunc = () => Promise<Artifact | void>;

export type ArtifactType = 'IntegrationFlow' | 'ValueMapping' | 'MessageMapping' | 'ScriptCollection';
