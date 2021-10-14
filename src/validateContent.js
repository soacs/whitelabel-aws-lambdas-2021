exports.handler = async (event) => {
    console.log('event received', event);
    const inputData = event.Input.inputData;
    
    if (!isInputCSV(inputData)) {
        return {
            nextState: 2,
            errors: [{
                message: 'File cannot be other than csv. Please correct and Resubmit.'
            }],
            status: 500
        };        
    }
    
    
    const base64Data = inputData.split(';base64,')[1];
    const buffered = Buffer.from(base64Data,'base64');

    let allocations = 'Allocations uploaded!';
    const csvParams = process.env.csvParams.split('#');
    

    if(csvParams.some(csvParam => buffered.includes(csvParam))) {
        allocations = 'Allocations not uploaded!';
        console.log('invalid chars found');
        return {
            nextState: 2,
            errors: [{
                message: 'File cannot contain Special Characters = and @. Please correct and Resubmit.'
            }],
            status: 500
        };
    }
    
    allocations = 'valid Allocations  uploaded!';
    return {
        nextState: 1,
        response: allocations,
        base64Data: base64Data,
        advisorInfo: {
         loginId: event.Input.loginId,
         email: event.Input.email,
         firmOid: event.Input.firmOid,
         memberOid: event.Input.memberOid
        }
    }; 

    function isInputCSV() {
        return inputData.includes('data:text/csv;base64') || inputData.includes('data:application/vnd.ms-excel;base64');
    }

};
