const applicationClass = pc.AppBase || pc.Application;

applicationClass.prototype.configure = function (url, callback) {
    const packedConfigURL = url + '.pack';

    console.log('Preloading compressed config.json.pack...');

    const rawResponse = fetch(packedConfigURL)
        .then(response => response.blob())
        .then(async data => {

            console.log('unpacking config.json.pack...');
            const startTime = performance.now();

            // Convert Blob to an ArrayBuffer
            const arrayBuffer = await data.arrayBuffer();

            // decompress ArrayBuffer into a JSON string
            const compressedData = new Uint8Array(arrayBuffer);
            const decompressedData = pako.inflate(compressedData, {to: 'string'});
            const response = JSON.parse(decompressedData);

            const finishTime = performance.now();
            console.log('config.json.pack decompressed in ' + ~~(finishTime - startTime) + ' ms');

            const props = response.application_properties;
            const scenes = response.scenes;
            const assets = response.assets;

            this._parseApplicationProperties(props, (err) => {
                this._parseScenes(scenes);
                this._parseAssets(assets);
                if (!err) {
                    callback(null);
                } else {
                    callback(err);
                }
            });

        })
        .catch(err => callback(err));
};