import esbuild from 'esbuild';

const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch');

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'chrome/content/zotserver/main.js',
    platform: 'node',
    external: ['fs', 'path'], // Add other external modules as necessary
    watch: isWatchMode ? {
        onRebuild(error, result) {
            if (error) {
                console.error('watch build failed:', error);
            } else {
                console.log('watch build succeeded:', result);
            }
        },
    } : false,
}).then(() => {
    if (isWatchMode) {
        console.log('watching for changes...');
    }
}).catch(() => process.exit(1));
