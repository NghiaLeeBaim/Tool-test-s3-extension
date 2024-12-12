document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("test-all").addEventListener("click", async() => {
        const endpoint = document.getElementById("endpoint").value;
        const region = document.getElementById("region").value;
        const accessKey = document.getElementById("accessKey").value;
        const secretKey = document.getElementById("secretKey").value;
        const bucket = document.getElementById("bucket").value;
        const file = document.getElementById("file").files[0];

        if (!endpoint || !region || !accessKey || !secretKey || !bucket || !file) {
            alert("Please fill all fields and select a file.");
            return;
        }

        const s3Config = {
            endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
            region: region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        };

        AWS.config.update(s3Config);
        const S3 = new AWS.S3();

        try {
            // Upload Test
            const uploadParams = {
                Bucket: bucket,
                Key: file.name,
                Body: file,
            };

            const uploadStart = performance.now();
            await S3.upload(uploadParams, {
                partSize: 1024 * 1024 * 1024 * 1024, // 1GB per part
                queueSize: 10,
            }).promise();
            const uploadEnd = performance.now();
            const uploadTime = (uploadEnd - uploadStart) / 1000; // in seconds
            const uploadSpeed = file.size / (1024 * 1024) / uploadTime; // MB/s

            console.log(`File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`Upload time: ${uploadTime.toFixed(2)} seconds`);
            console.log(`Upload speed: ${uploadSpeed.toFixed(2)} MB/s`);

            // Download Test
            const downloadParams = {
                Bucket: bucket,
                Key: file.name,
            };

            const downloadStart = performance.now();
            const downloadedFile = await S3.getObject(downloadParams).promise();
            const downloadEnd = performance.now();
            const downloadTime = (downloadEnd - downloadStart) / 1000; // in seconds
            const downloadSpeed =
                downloadedFile.Body.byteLength / (1024 * 1024) / downloadTime; // MB/s

            console.log(
                `Download size: ${(
          downloadedFile.Body.byteLength /
          (1024 * 1024)
        ).toFixed(2)} MB`
            );
            console.log(`Download time: ${downloadTime.toFixed(2)} seconds`);
            console.log(`Download speed: ${downloadSpeed.toFixed(2)} MB/s`);

            // Display results
            alert(
                `Upload Speed: ${uploadSpeed.toFixed(2)} MB/s\n` +
                `Download Speed: ${downloadSpeed.toFixed(2)} MB/s\n` +
                `Total Time: ${(uploadTime + downloadTime).toFixed(2)} seconds`
            );
        } catch (error) {
            console.error("Error during upload/download:", error);
            alert("Operation failed. Check console for details.");
        }
    });
});