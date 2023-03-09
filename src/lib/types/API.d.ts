import { Artifact } from './Artifact.js';

export interface ODataResponseSet {
    d: {
        results: Artifact[];
    };
}

export interface ODataResponse {
    d: Artifact;
}

export interface SCIRestClientConfig {
    apiEndpoint: string;
    username: string;
    password: string;
}

export interface APIError {
    error?: {
        message?: {
            value?: string;
        };
    };
}

export type Action = 'Read' | 'Create' | 'NewVersion' | 'Update' | 'Delete';
