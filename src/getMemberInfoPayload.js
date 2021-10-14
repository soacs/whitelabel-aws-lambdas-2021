exports.handler = async (event) => {

    console.log('event received', event);
    console.log('event received passthrough', JSON.stringify(event.Input.Payload));
    
    const input = event.Input.Payload.Input;
    const path = `/restapi/v1/members/${input.username}`;

    const passThroughData = {
            advisorInfo: {
            username: input.username,
            email: input.email,
            authorization: input.authorization,
            memberOid: input.memberOid,
            vendor: input.vendor,
            firmOid: input.firmOid,
        },
        path: path
    };

    return {
        status: 200,
        source: 'getMemberInfoPayload',
        passThroughData: passThroughData,
        httpMethod: 'GET',
        path: path
    };
    
};
