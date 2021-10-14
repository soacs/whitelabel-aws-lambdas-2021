var crypto = require('crypto');

exports.handler = async (event) => {
    console.log('Reeived event', event);
    let base64Data = event.Input.Payload.base64Data;
    var fileBuffer = Buffer.from(base64Data, 'base64');

        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        
        const hex = hashSum.digest('hex');
        
        console.log(hex);

    const memberOid = event.Input.Payload.advisorInfo.memberOid;
    
    const path = `/ria/v2/trades/allocations/upload/check?advisor=${memberOid}&fileChecksum=${hex}&fileScanSuccess=true`;    

    const passThroughData = {
        base64Data: base64Data,
        checkSum: hex,
        advisorInfo: event.Input.Payload.advisorInfo,
    }


    // TODO implement
    return {
            status: 200,
            passThroughData: passThroughData,
            path: path
        };
};
