const fs = require('fs');

module.exports = (drive, file_id, filename) => {
    return new Promise((resolve, reject) => {
        dest = fs.createWriteStream(filename);
        drive.files.get(
            { fileId: file_id, alt: "media" },
            { responseType: "stream" },
            (err, { data }) => {
                if (err) {
                    reject(err)
                }
                data
                    .on("end", () => resolve(filename))
                    .on("error", (err) => {
                        reject(err)
                    })
                    .pipe(dest);
            }
        );

    })
}