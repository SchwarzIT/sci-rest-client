import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import SCIRestClient from '../../lib/client/SCIRestClient.js';
import { v4 as uuidv4 } from 'uuid';
import { setup, teardown } from '../setupAndTeardown.js';
import { IntegrationPackage } from '../../lib/types/Artifact';

let sciRestClient: SCIRestClient;
let randomPackageId = uuidv4().replaceAll('-', '');

beforeAll(async () => {
    const setupResult = await setup();
    sciRestClient = setupResult.sciRestClient;
    randomPackageId = setupResult.randomPackageId;
});

afterAll(async () => {
    await teardown();
});

describe('Integration packages', () => {
    it('fetch all integratation packages', async () => {
        const integrationPackages = (await sciRestClient.getIntegrationPackages()) as IntegrationPackage[];
        expect(Array.isArray(integrationPackages)).toBe(true);
        const randomPackage = integrationPackages.find((integrationPackage) => integrationPackage.Id === randomPackageId);
        expect(randomPackage).toBeDefined();
    });

    it('fetch a single integration package ', async () => {
        const integrationPackage = (await sciRestClient.getIntegrationPackage(randomPackageId)) as IntegrationPackage;
        expect(integrationPackage.Id).toBe(randomPackageId);
    });

    it('check if integration package exists', async () => {
        const integrationPackageExists = await sciRestClient.isIntegrationPackageExisting(randomPackageId);
        expect(integrationPackageExists).toBeTruthy();
    });

    it('check if integration package does not exist', async () => {
        const integrationPackageExists = await sciRestClient.isIntegrationPackageExisting('dummyIdThatShouldNotExist');
        expect(integrationPackageExists).toBeFalsy();
    });
});
