const authDrive = require('./serviceAccountAuth');
const fs = require('fs');
const uuid = require('uuid');

module.exports = (drive, file, parent_folder) => {
  return new Promise((resolve, reject) => {
    const fileMetadata = {
      name: uuid.v4()+'.png',
      parents: [parent_folder]
    };
    const media = {
      mimeType: 'image/png',
      body: fs.createReadStream(file),
    };
    drive.files.create({
      resource: fileMetadata,
      media: media,
      supportsAllDrives: true,
      fields: 'id'
    }, (err, image) => {
      if (err) {
        reject(err);
      } else {
        console.log(`uploaded ${file} to ${image.data.id}`)
        resolve(image.data.id)
      }
    });

  })

}