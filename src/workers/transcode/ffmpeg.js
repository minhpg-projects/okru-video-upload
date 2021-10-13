const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

module.exports = (filename, callback) => {
  try {
    const folder = filename.toString().replace('.mp4', '')
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    const process = ffmpeg(filename).outputOptions([
      // '-c:v libx264',
      '-c copy',
      '-g 3',
      '-keyint_min 3',
      '-hls_list_size 0',
      '-hls_time 3',
    ])
    process.on('start', function (commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })

    process.on('codecData', function (data) {
      console.log('Input is ' + data.audio + ' audio ' +
        'with ' + data.video + ' video');
        console.log(data)
    });

    process.on('progress', function (progress) {
      console.log('Processing: ' + progress.percent + '% done');
    });

    process.on('error', function (err, stdout, stderr) {
      return callback(err)
    });

    process.on('end', function (stdout, stderr) {
      console.log('Transcoding succeeded !');
      return callback(null, folder)
    });

    process.save(`${folder}/video.m3u8`)

  }
  catch (err) {
    callback(err);
  }
}
