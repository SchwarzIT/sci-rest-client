import { Action } from '../types/API.js';

const APIAction: { [k: string]: Action } = {
    Read: 'Read',
    Create: 'Create',
    Update: 'Update',
    Delete: 'Delete',
    New_Version: 'NewVersion',
};
export default APIAction;
