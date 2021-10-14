exports.handler = async (event) => {
    // TODO implement
    
    console.log("received envet", event);
    
    if(event.Input.Payload.status === 200) {
        return {
            statusCode: 200,
            body: JSON.stringify('You have got your allocations processed!'),
        }
    }

    
        return {
            statusCode: 500,
            errors: event.Input.Payload.errors,
        }

    
};
