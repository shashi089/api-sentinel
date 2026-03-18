import fs from 'node:fs';
import path from 'node:path';

export function loadSpec(specPath: string): Record<string, any> {
    const resolved = path.resolve(process.cwd(), specPath);

    if (!fs.existsSync(resolved)) {
        throw new Error(`[reqprobe/openapi] Spec file not found: ${resolved}`);
    }

    let raw: string;
    try {
        raw = fs.readFileSync(resolved, 'utf-8');
    } catch (err: any) {
        throw new Error(`[reqprobe/openapi] Failed to read spec file: ${err.message}`);
    }

    try {
        return JSON.parse(raw);
    } catch (err: any) {
        throw new Error(`[reqprobe/openapi] Spec file is not valid JSON: ${err.message}`);
    }
}
