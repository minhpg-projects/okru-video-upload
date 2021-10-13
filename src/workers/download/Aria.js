const exec = require('child_process').exec;


module.exports = (file) => {
    return new Promise((resolve, reject) => {
        const cookie = file.cookie.join('; ')
        const cmd = `aria2c "${file.url}" -o "${file.filename}" --header="Cookie: ${cookie}" --on-download-complete=exit --log-level=info -s16 -x16 -k 5M`
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            resolve(file.filename);
        });

    })

}
