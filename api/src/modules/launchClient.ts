import express, { type Express, type Request, type Response } from "express";
import path from "path";
import paths from "@/modules/paths.util";
import fs from "fs";
import * as process from "node:process";

const IS_DEV = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local';

export default function launchClient(app: Express) {
    console.log('Environment:', IS_DEV ? 'Development' : 'Production');
    console.log(process.env.NODE_ENV)

    if (IS_DEV) {
        return;
    }

    const indexPath = path.resolve(paths.distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.error(`Error: index.html not found at ${indexPath}`);
        process.exit(1);
    }

    app.use(express.static(paths.distPath));

    app.get(/^\/(?!api).*/, (req: Request, res: Response) : void => {
        console.log(`Serving index.html for ${req.path}`);
        res.sendFile(indexPath, (err : unknown) => {
            if (err) {
                console.error('Error sending index.html:', err);
                res.status(500).send('Internal Server Error');
            }
        });
    });
}
