exports.handler = async (event) => {

    console.log('event received', event);
    console.log('event received passthrough', JSON.stringify(event.Input));
    
    const input = event.Input;
    const advisorInfo = input[0].Payload.Input.Payload.passThroughData.advisorInfo;
    const getAccountsResponse = input[0].Payload.response;
    const getMemberInfoResponse = input[1].Payload.response;

    const path = `/restapi/v1/accounts/RA4604300Z`;

    const passThroughData = {
            advisorInfo: {
            username: advisorInfo.username,
            email: advisorInfo.email,
            authorization: advisorInfo.authorization,
            memberOid: advisorInfo.memberOid,
            vendor: advisorInfo.vendor,
            firmOid: advisorInfo.firmOid,
            firstName: getMemberInfoResponse.firstName,
            lastName: getMemberInfoResponse.lastName,
            phone: getMemberInfoResponse.dayTelephone
        },
        path: path
    };

    return {
        status: 200,
        source: 'getAccountInfoPayload',
        passThroughData: passThroughData,
        path: path
    };
    
};
