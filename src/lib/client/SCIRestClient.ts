import fs from 'fs';
import APIAction from './APIAction.js';
import ArtifactAPIMetadata from './ArtifactAPIMetaData.js';
import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import ManifestReader from './ManifestReader.js';
import { zipArtifactAsBase64 } from './Zipper.js';
import log from 'loglevel';
import { Artifact, ArtifactType, ArtifactActionFunc, ArtifactMetadata, DesignTimeArtifact, IntegrationPackage } from '../types/Artifact.js';
import { SCIRestClientConfig, ODataResponse, ODataResponseSet, APIError, Action } from '../types/API.js';

export default class SCIRestClient {
    private basicAuth: string;
    private csrfToken: string;
    private cookie: string[];
    private retryOnce: boolean;
    private axiosInstance: Axios;

    /**
     * Initiailzing the rest client with the given config.
     *
     * @param {SCIRestClientConfig} clientConfig - The config for the rest client.
     */
    constructor(clientConfig: SCIRestClientConfig) {
        log.info(`Initializing SCIRestClient with config: ${JSON.stringify(clientConfig)}...`);

        this.basicAuth = `Basic ${Buffer.from(`${clientConfig.username}:${clientConfig.password}`, 'utf-8').toString('base64')}`;
        this.csrfToken = '';
        this.cookie = [];
        this.retryOnce = false;
        this.axiosInstance = axios.create({
            baseURL: clientConfig.apiEndpoint,
        });
    }

    /**
     * Read all integration packages
     *
     */
    public async getIntegrationPackages(): Promise<IntegrationPackage[] | void> {
        try {
            log.info('Reading all integration packages...');
            const response = (
                await this.axiosInstance.get('/IntegrationPackages', {
                    headers: await this.getHeader(APIAction.Read),
                })
            ).data as ODataResponseSet;
            return response.d.results as IntegrationPackage[];
        } catch (error: unknown) {
            void this.checkResponse(error);
        }
    }

    /**
     * Read the integration package with the given id.
     *
     * @param {string} integrationPackageId - The id of the integration package.
     *
     * @returns {Promise<IntegrationPackage | void>} - The integration package or void if an error occurred.
     */
    public async getIntegrationPackage(integrationPackageId: string): Promise<IntegrationPackage | void> {
        try {
            log.info(`Reading integration package ${integrationPackageId}...`);
            const response = (
                await this.axiosInstance.get(`/IntegrationPackages('${integrationPackageId}')`, {
                    headers: await this.getHeader(APIAction.Read),
                })
            ).data as ODataResponse;
            return response.d as IntegrationPackage;
        } catch (error: unknown) {
            void this.checkResponse(error);
        }
    }

    /**
     * Create a new integration package.
     *
     * @param {IntegrationPackage} integrationPackage
     *
     * @returns {Promise<Artifact | void>} - The created integration package or void if an error occurred.
     */
    public async createIntegrationPackage(integrationPackage: IntegrationPackage): Promise<Artifact | void> {
        log.info(`Create integration package ${integrationPackage.Id}...`);

        try {
            const response = (
                await this.axiosInstance.post(
                    '/IntegrationPackages',
                    {
                        Id: integrationPackage.Id,
                        Name: integrationPackage.Name,
                        Description: integrationPackage.Description,
                        ShortText: integrationPackage.ShortText,
                        Version: integrationPackage.Version,
                        SupportedPlatform: integrationPackage.SupportedPlatform,
                        Products: integrationPackage.Products,
                        Keywords: integrationPackage.Keywords,
                        Countries: integrationPackage.Countries,
                        Industries: integrationPackage.Industries,
                        LineOfBusiness: integrationPackage.LineOfBusiness,
                    },
                    {
                        headers: await this.getHeader(APIAction.Create),
                    }
                )
            ).data as ODataResponse;
            return response.d;
        } catch (error: unknown) {
            return await this.checkResponse(error, async () => {
                return await this.createIntegrationPackage(integrationPackage);
            });
        }
    }

    /**
     * Delete the integration package with the given id.
     *
     * @param {string} integrationPackageId
     *
     */
    public async deleteIntegrationPackage(integrationPackageId: string): Promise<void> {
        log.info(`Delete integration package ${integrationPackageId}...`);
        try {
            await this.axiosInstance.delete(`/IntegrationPackages('${integrationPackageId}')`, {
                headers: await this.getHeader(APIAction.Create),
            });
        } catch (error: unknown) {
            await this.checkResponse(error, async () => {
                await this.deleteIntegrationPackage(integrationPackageId);
            });
        }
    }

    /**
     * Read the artifact with the given id and version.
     *
     * @param {string} artifactId - The id of the artifact.
     * @param {string} artifactVersion - The version of the artifact.
     * @param {ArtifactType} artifactType - The type of the artifact.
     *
     */
    async getArtifact(artifactId: string, artifactVersion: string, artifactType: ArtifactType): Promise<fs.ReadStream | void> {
        log.info(`Reading artifact ${artifactId}...`);
        try {
            const response = await this.axiosInstance.get(
                this.buildEntityURL(artifactType, `(Id='${artifactId}',Version='${artifactVersion}')/$value`),
                {
                    headers: Object.assign(await this.getHeader(APIAction.Read), {
                        Accept: 'application/zip',
                    }),
                    responseType: 'stream',
                }
            );
            return response.data as fs.ReadStream;
        } catch (error: unknown) {
            void this.checkResponse(error);
        }
    }

    /**
     * Read the artifact with the given id and version.
     *
     * @param {string} artifactId - The id of the artifact.
     * @param {string} artifactVersion - The version of the artifact.
     * @param {ArtifactType} artifactType - The type of the artifact.
     *
     * @returns {Promise<Artifact | void>} - The artifact or void if an error occurred.
     */
    async createArtifact(artifact: DesignTimeArtifact): Promise<Artifact | void> {
        const artifactPackageId = artifact.PackageId as string;
        log.info(`Create artifact ${artifact.Id} in integration package ${artifactPackageId}...`);
        try {
            const response = (
                await this.axiosInstance.post(
                    this.buildEntityURL(artifact.Type),
                    {
                        Id: artifact.Id,
                        PackageId: artifactPackageId,
                        Name: artifact.Name,
                        ArtifactContent: artifact.Content,
                        Description: '',
                    },
                    {
                        headers: await this.getHeader(APIAction.Create),
                    }
                )
            ).data as ODataResponse;
            return response.d;
        } catch (error: unknown) {
            return await this.checkResponse(error, async () => {
                return await this.createArtifact(artifact);
            });
        }
    }

    /**
     * Update the given Artifact.
     *
     * @param {DesignTimeArtifact} artifact - The artifact to update
     *
     */
    async updateArtifact(artifact: DesignTimeArtifact): Promise<void> {
        const artifactVersion = artifact.Version as string;
        log.info(`Update artifact ${artifact.Id} with version ${artifactVersion}...`);
        try {
            await this.axiosInstance.put(
                this.buildEntityURL(artifact.Type, `(Id='${artifact.Id}',Version='${artifactVersion}')`),
                {
                    Name: artifact.Name,
                    ArtifactContent: artifact.Content,
                },
                {
                    headers: await this.getHeader(APIAction.Put),
                }
            );
            this.retryOnce = false;
        } catch (error: unknown) {
            if (this.isAxiosError(error)) {
                const response = error.response as AxiosResponse<APIError>;

                if (response.status === 403 && !this.retryOnce) {
                    log.warn('CSRF token expired. Try to update artifact again...');
                    this.invalidateCSRFToken();
                    void this.updateArtifact(artifact);
                } else if (
                    response.status === 404 ||
                    (response.status === 500 && response?.data?.error?.message?.value?.includes('not found'))
                ) {
                    if (response.status === 404 && !this.isActionSupportedForArtifactType(APIAction.New_Version, artifact.Type)) {
                        throw new Error(
                            `Artifact ${artifact.Id} update failed and the creation of new verisons are not supported for that artifact type.   
                   HTTP status code ${response.status} - ${response.statusText}`
                        );
                    }

                    log.info(`Artifact ${artifact.Id} with version ${artifactVersion} doesn't exist. Create new version...`);
                    await this.createNewArtifactVersion(artifact.Id, artifactVersion, artifact.Type);
                    await this.updateArtifact(artifact);
                } else {
                    throw new Error(`HTTP status code ${response.status} - ${response.statusText}`);
                }
            }
        }
    }

    /**
     * Create a new version of the artifact with the given id, version and type.
     * This method is need if an artifact doesn't exist. Afterwards the artifact
     * can be updated via the updateArtifact method.
     *
     * @param {string} artifactId - The artifact to update
     * @param {string} artifactVersion - The version of the artifact
     * @param {ArtifactType} artifactType - The type of the artifact
     *
     */
    async createNewArtifactVersion(artifactId: string, artifactVersion: string, artifactType: ArtifactType): Promise<void> {
        log.info(`Create new version ${artifactVersion} for artifact ${artifactId}...`);
        try {
            await this.axiosInstance.post(
                this.buildNewVersionURL(artifactType, `?Id='${artifactId}'&SaveAsVersion='${artifactVersion}'`),
                {},
                {
                    headers: await this.getHeader(APIAction.Put),
                }
            );
        } catch (error: unknown) {
            void this.checkResponse(error, async () => {
                await this.createNewArtifactVersion(artifactId, artifactVersion, artifactType);
            });
        }
    }

    /**
     * Create a new artifact within the specified integration package from the given directory.
     * The specified directory must contain a folder 'META-INF' with a manifest file 'MANIFEST.MF'. Certain information from this file
     * will be used to create the artifact.
     *
     * @param {string} integrationPackageId - The id of the integration package the artifact belongs to.
     * @param {string} artifactDirectoryPath - Path to the directory containing the artifact.
     *
     * @returns {Promise<Artifact>} - The created artifact.
     */
    public async createArtifactFromDirectory(integrationPackageId: string, artifactDirectoryPath: string): Promise<Artifact> {
        log.info(`Create artifact from directory ${artifactDirectoryPath} in integration package ${integrationPackageId}...`);
        const manifestReader = new ManifestReader(artifactDirectoryPath);

        const artifactMetadata = manifestReader.getArtifactMetadata();

        const artifactzipBase64 = await zipArtifactAsBase64(artifactDirectoryPath, artifactMetadata.Name);

        const createdArtifact = <Artifact>await this.createArtifact({
            Id: artifactMetadata.Id,
            PackageId: integrationPackageId,
            Name: artifactMetadata.Name,
            Content: artifactzipBase64,
            Type: artifactMetadata.Type,
        });

        return createdArtifact;
    }

    /**
     * Update an artifact based on the given directory.
     * The specified directory must contain a folder 'META-INF' with a manifest file 'MANIFEST.MF'. Certain information from this file
     * will be used to update the artifact.
     *
     * @param {string} artifactDirectoryPath - Path to the directory containing the artifact.
     *
     * @returns {Promise<void>} - Promise resolving when the artifact has been updated.
     */
    public async updateArtifactFromDirectory(artifactDirectory: string): Promise<void> {
        log.info(`Update artifact from directory ${artifactDirectory}...`);

        const manifestReader = new ManifestReader(artifactDirectory);
        const artifactMetadata = manifestReader.getArtifactMetadata();
        const artifactzipBase64 = await zipArtifactAsBase64(artifactDirectory, artifactMetadata.Name);

        await this.updateArtifact({
            Id: artifactMetadata.Id,
            Version: artifactMetadata.Version as string,
            Name: artifactMetadata.Name,
            Content: artifactzipBase64,
            Type: artifactMetadata.Type,
        });
    }

    /**
     * Returns true if the given action is supported
     *
     * @param {Action} action - The action to check.
     * @param {string} artifactDirectoryPath - Path to the directory containing the artifact.
     *
     * @returns {boolean} - True if the action is supported.
     */
    public isActionSupported(action: Action, artifactDirectoryPath: string) {
        const artifactType = this.getArtifactType(artifactDirectoryPath);
        const artifactAPIMetadata = ArtifactAPIMetadata[artifactType] as ArtifactMetadata;

        return artifactAPIMetadata.supportedActions.includes(action);
    }

    /**
     * Returns true if the given action is supported for the given artifact type.
     *
     * @param {Action} action - The action to check.
     * @param {ArtifactType} artifactType - The artifact type to check.
     *
     * @returns {boolean} - True if the action is supported for the artifact type.
     */
    public isActionSupportedForArtifactType(action: Action, artifactType: ArtifactType) {
        const artifactAPIMetadata = ArtifactAPIMetadata[artifactType] as ArtifactMetadata;

        return artifactAPIMetadata.supportedActions.includes(action);
    }

    /**
     * Returns the type of the artifact in the given directory.
     *
     * @param {string} artifactDirectoryPath - Path to the directory containing the artifact.
     *
     * @returns {ArtifactType} - The type of the artifact.
     */
    public getArtifactType(artifactDirectoryPath: string) {
        const manifestReader = new ManifestReader(artifactDirectoryPath);
        return manifestReader.getArtifactMetadata().Type;
    }

    private invalidateCSRFToken() {
        this.csrfToken = '';
        this.cookie = [];
        this.retryOnce = true;
    }

    private async getCSRFToken(): Promise<{ csrfToken: string; cookie: string[] }> {
        if (!this.csrfToken || !this.cookie) {
            log.trace('Fetching csrf token...');
            try {
                const response = await this.axiosInstance.get('/$metadata', {
                    headers: {
                        Authorization: this.basicAuth,
                        'X-CSRF-Token': 'fetch',
                    },
                });
                this.csrfToken = response.headers['x-csrf-token'] as string;
                this.cookie = response.headers['set-cookie'] as string[];
            } catch (error: unknown) {
                throw new Error('Fetching csrf token failed...', {
                    cause: error,
                });
            }
        }

        return {
            csrfToken: this.csrfToken,
            cookie: this.cookie,
        };
    }

    private async checkResponse(error: unknown, retryFunction?: ArtifactActionFunc): Promise<Artifact | void> {
        if (this.isAxiosError(error)) {
            const response = error.response as AxiosResponse;
            if (response.status === 403 && !this.retryOnce) {
                log.warn('CSRF token expired. Try action again...');
                this.invalidateCSRFToken();
                if (retryFunction) {
                    const result = await retryFunction();
                    return result;
                }
            }
            throw new Error(`HTTP status code ${response.status} - ${response.statusText}`, {
                cause: error,
            });
        }
        throw new Error('Unexpected error during response check', { cause: error });
    }

    private async getHeader(action: Action) {
        const header = {
            Authorization: this.basicAuth,
            Accept: 'application/json',
        };

        if (action !== APIAction.Read) {
            const { csrfToken, cookie } = await this.getCSRFToken();
            Object.assign(header, {
                'x-csrf-token': csrfToken,
                Cookie: cookie,
                'Content-Type': 'application/json',
            });
        }
        return header;
    }

    private buildEntityURL(artifactType: ArtifactType, suffix = ''): string {
        return `/${ArtifactAPIMetadata[artifactType]?.artifactEntityName}${suffix}`;
    }

    private buildNewVersionURL(artifactType: ArtifactType, suffix = '') {
        return `/${ArtifactAPIMetadata[artifactType]?.newVersionEntity}${suffix}`;
    }

    private isAxiosError(error: unknown): error is AxiosError {
        return error instanceof Error && error.name === 'AxiosError';
    }
}
