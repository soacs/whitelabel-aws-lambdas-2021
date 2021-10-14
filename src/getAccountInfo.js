const axios = require('axios');

exports.handler = async (event) => {

    
    try {
        
        console.log('event received', event);
        console.log('event received passthrough', JSON.stringify(event.Input));
        const payload = event.Input.Payload;
        const passThroughData = event.Input.Payload.passThroughData;
        
        const url =  `https://${process.env.apiHostName}${passThroughData.path}`;

        var config = {
          method: 'GET',
          url: url,
          headers: payload.hmacHeader
        };
        
        console.log('config --', config); 

        /*  let responseFromApi = await axios(config);        
        console.log('axios response', responseFromApi);
        
        const memberInfo = passThroughData.memberInfo;
        
        const accountInfo = {};
        const todaysDate = new Date();
        const timeStamp = todaysDate.toISOString().slice(0,10) + ' ' + todaysDate.toTimeString().slice(0,12);
        const memberOid = passThroughData.memberOid;
        const userType = ['R' , 'I', 'N', 'P'].includes(memberInfo.memberShipType) ? 'E' : 'B';
        
        const capeLogicUserInfo = `USER_ID=${memberOid}|TIME_STAMP=${timeStamp}|BRANCH_CODE=${accountInfo.branchCode}|USER_TYPE=
        ${userType}|FNAME=${memberInfo.firstName}|LNAME=${memberInfo.lastName}|PHONE=${memberInfo.dayTelephone}|USER_EMAIL=${accountInfo.email1}|REP=${accountInfo.repCode}
        |REF_XREF=5C02,5C03,5C04,5C05,5C06,5C07,5C08,5C09,5C10,5C11,5C12,5C014,5C15,5C16,5C40,5C41,5C42,5C43,5CHA,TE65|ENABLE_TRADING=Y`
        */
        
        const capeLogicUserInfo = 'USER_ID=24120|TIME_STAMP=05-03-2021 09:48:52 CDT|BRANCH_CODE=517|USER_TYPE=B|FNAME=Courtney|LNAME=Trenary|PHONE=(314)556-6704|USER_EMAIL=court.trenary@stifel.com|REP=5C01|REF_XREF=5C02,5C03,5C04,5C05,5C06,5C07,5C08,5C09,5C10,5C11,5C12,5C014,5C15,5C16,5C40,5C41,5C42,5C43,5CHA,TE65|ENABLE_TRADING=Y';
        
        return {
            capeLogicUserInfo: capeLogicUserInfo,
            Input: event.Input
        }; 
    
    } catch (_error) {
        console.log('error getting API', JSON.stringify(_error));
        return {
            nextState: 1,
            Input: event.Input
        }; 
      }    
    
    
};
