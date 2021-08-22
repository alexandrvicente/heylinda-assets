const path = require('path')
const fs = require('fs')
const os = require('os')
const { program } = require('commander')
const cliProgress = require('cli-progress')
const ffmpeg = require('fluent-ffmpeg')
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg')

ffmpeg.setFfmpegPath(ffmpegPath)

const root = path.parse(__dirname).dir
const defaultOutput = path.join(root, 'public', 'meditations')

program
  .option('-o --output', 'Output directory', defaultOutput)
  .argument('<files...>', 'Audio files')

const command = program.parse()

const output = command.getOptionValue('output') || defaultOutput
const files = command.args
const cores = os.cpus().length

const bar = new cliProgress.SingleBar({
  format: 'Converting files [{bar}] {percentage}%'
})
bar.start(files.length, 0)

const convertFile = (file) => {
  const filePath = path.parse(file)
  const outputFile = path.join(output, `${filePath.name}.mp3`)

  let totalProgress = 0

  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .audioCodec('libmp3lame')
      .audioQuality(2)
      .on('progress', ({ percent }) => {
        const newProgress = percent - totalProgress
        bar.increment(newProgress / 100)
        totalProgress += newProgress
      })
      .on('error', (err) => {
        bar.stop()
        console.error(`Error converting ${file}: ${err}`)
        reject(err)
      })
      .on('end', () => {
        bar.increment(1 - totalProgress / 100)
        resolve()
      })
      .save(outputFile)
  })
}

;(async () => {
  for (let i = 0; i < files.length; i += cores) {
    const filesSlice = files.slice(i, cores)
    await Promise.all(
      filesSlice.map(convertFile)
    )
  }
  bar.stop()
})()