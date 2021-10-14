exports.handler = async (event) => {
    console.log('event received', event);
    console.log('event received passthrough', JSON.stringify(event.Input));

    return {
        nextState: 1,
        Input: event.Input
    }; 

};
