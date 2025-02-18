import path from "path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    root: path.resolve(__dirname, '..', '..', '..'),
    clientPath: path.resolve(__dirname, '..', '..', '..', 'client'),
    distPath: path.resolve(__dirname, '..', '..', '..', 'client', 'dist'),
    assets: path.resolve(__dirname, '..', '..', '..', 'client', 'public', 'assets'),
    imageOutput: path.resolve(__dirname, '..', '..', '..', 'client', 'public','images'),
    routesDir: path.resolve(__dirname, '..', '..', '..', 'api', 'src', 'routes'),
    apiDir: path.resolve(__dirname, '..', '..', '..', 'api'),
}