exports.handler = async (event) => {
    console.log('event received', event);
    console.log('event received passthrough', JSON.stringify(event.Input.passThroughData));
    const passThroughData = event.Input.passThroughData;
    const advisorInfo = passThroughData.advisorInfo;
    const path = `/ria/v2/trades/allocations/upload?advisor=${advisorInfo.memberOid}&fileChecksum=${passThroughData.checksum}`;
    passThroughData.path = path;
    return {
        nextState: 1,
        passThroughData,
        path
    }; 

};
