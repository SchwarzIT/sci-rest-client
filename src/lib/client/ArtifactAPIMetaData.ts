const ArtifactMetadata = {
    IntegrationFlow: {
        artifactEntityName: 'IntegrationDesigntimeArtifacts',
        supportedActions: ['Update', 'Create', 'NewVersion'],
        newVersionEntity: 'IntegrationDesigntimeArtifactSaveAsVersion',
    },
    MessageMapping: {
        artifactEntityName: 'MessageMappingDesigntimeArtifacts',
        supportedActions: ['Update', 'Create', 'NewVersion'],
        newVersionEntity: 'MessageMappingDesigntimeArtifactSaveAsVersion',
    },
    ValueMapping: {
        artifactEntityName: 'ValueMappingDesigntimeArtifacts',
        supportedActions: ['Create', 'NewVersion'],
        newVersionEntity: 'ValueMappingDesigntimeArtifactSaveAsVersion',
    },
    ScriptCollection: {
        artifactEntityName: 'ScriptCollectionDesigntimeArtifacts',
        supportedActions: ['Update', 'Create', 'NewVersion'],
        newVersionEntity: 'ScriptCollectionDesigntimeArtifactSaveAsVersion',
    },
};
export default ArtifactMetadata;
