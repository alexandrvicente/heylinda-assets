# Audio compression

To add new meditations with compression, install this projects deps with `yarn` and run the following command:

`yarn compress-audio example1.wav example2.wav`

The output directory defaults to `public/meditations` and can be set using the `--output` argument.

The generated files keep the input file names, with the extension being replaced by mp3.

## Note

For the best quality, use lossless audio formats like WAV, AIFF and FLAC when possible.