import archiver from 'archiver'
import fs, { promises as fsPromises } from 'fs'
import path from 'path'

const outdir = 'build'

async function deleteOldDir() {
    await fsPromises.rm(outdir, { recursive: true, force: true })
}

async function zipFolder(dir) {
    const output = fs.createWriteStream(`${dir}.zip`)
    const archive = archiver('zip', {
        zlib: { level: 9 },
    })
    archive.pipe(output)
    archive.directory(dir, false)
    await archive.finalize()
}

async function copyFiles(entryPoints, targetDir) {
    await Promise.all(
        entryPoints.map(async (entryPoint) => {
            const targetPath = `${targetDir}/${entryPoint.dst}`
            await fsPromises.mkdir(
                path.dirname(targetPath),
                { recursive: true },
            )
            await fsPromises.copyFile(entryPoint.src, targetPath)
        }),
    )
}

async function build() {
    await deleteOldDir()

    const files = [
        { src: 'src/assets/logo.jpg', dst: 'assets/logo.jpg' },
        { src: 'src/chat-gpt-soliloquy.js', dst: 'chat-gpt-soliloquy.js' },
        { src: 'src/manifest.json', dst: 'manifest.json' }
    ]

    await copyFiles(
        files,
        `./${outdir}/chromium`,
    )

    await zipFolder(`./${outdir}/chromium`)
}

build()
