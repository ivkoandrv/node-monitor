import { pathToFileURL } from 'node:url';
import os from 'node:os';

/**
 * Converts a file path to a URL for dynamic import.
 * On Windows, it prepends 'file://' to the path.
 * @param {string} filePath - The file path to convert.
 * @returns {string} - The file URL for dynamic import.
 */
function getImportPath(filePath: string): string {
    if (os.platform() === 'win32') {
        return pathToFileURL(filePath).href;
    }
    return filePath;
}

export default getImportPath;
