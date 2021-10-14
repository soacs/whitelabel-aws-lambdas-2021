const { parse } = require('fast-csv');
const { Readable } = require('stream');

exports.handler = (event, context, callback) => {

console.log('event received', event);
console.log('event advisorInfo', JSON.stringify(event.Input.Payload.advisorInfo));


let base64Data = event.Input.Payload.base64Data;
var buffered = Buffer.from(base64Data, 'base64');
const csvStringContent = buffered.toString();
const isValidBase64 = isBase64(csvStringContent);

// if still Base64 then its double encoded
if (isValidBase64) {
    return callback(null,  {
            nextState: 1,
            status: 500,
            errors: [{
                        message: `The content of csv is not a valid one. Please correct and resubmit`
                }]
        }); 
}

const stream = Readable.from(buffered.toString());
const mappedHeaders = {
    blockTradeId: 'block trade id', 
    subAccount: 'sub account', 
    quantity: 'quantity'
};
const expectedHeader = Object.values(mappedHeaders);

let isHeaderValidated = false;
const fieldErrors = {
   blockTradeId: [],
   subAccount: [],
   quantity: []
   
   // tradeOrderRefNumber: [],
   // clientName: [],
   // pincipal: [],
   // percentage: []        
};
const errors = [];
let hasErrors = false;
let currentRowCount = 0;
const blockTradeIdErrors = [];
const quantityErrors = [];

 stream
  .pipe(parse({ headers: true }))
  .transform(function(row, next) {
    validateHeader(Object.keys(row));
    validateData(Object.values(row), currentRowCount++);
    next();
  })
  .on("finish", streamFinished);

function validateData(row, currentRowCount) {
    
    const [
       blockTradeId,
       subAccount,
       quantity
    ] = row;
    
    validateNumericField('blockTradeId', blockTradeId, currentRowCount);
    validateNumericField('quantity', quantity, currentRowCount);
    validateAlphaNumericField('subAccount', subAccount, currentRowCount);

}

function validateAlphaNumericField(fieldType, fieldValue) {
    
    const alphaNumericRegEx = /^[a-z0-9]+$/i;

    if (!(alphaNumericRegEx.test(fieldValue))) {
        fieldErrors[fieldType].push(`Row ${currentRowCount}: ${fieldValue}`);
        hasErrors = true;
    }
}

function validateNumericField(fieldType, fieldValue) {
    
    if (!isNumeric(fieldValue)) {
        fieldErrors[fieldType].push(`Row ${currentRowCount}: ${fieldValue}`);
        hasErrors = true;
    }
}

function isNumeric(val) {
    return /^\d+$/.test(val);
}

function streamFinished() {
    console.log("finished writing file");

    if(hasErrors){
        handleErrors();        
        console.log("errors found", JSON.stringify(errors));
        callback(null,  {
            nextState: 1,
            status: 500,
            errors: errors
        });    
    } else {
        callback(null,  {
            nextState: 2,
            status: 200,
            base64Data: base64Data,
            advisorInfo: event.Input.Payload.advisorInfo
        });
        
    }    
    
}

function isBase64(csvData) {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return base64regex.test(csvData);
}

function handleErrors() {
    const fieldsTypes = Object.keys(fieldErrors);
    
    for(var i = 0; i < fieldsTypes.length; i++) {
        const currentFieldTypeErrors = fieldErrors[fieldsTypes[i]];
        if (currentFieldTypeErrors.length > 0) {
            
            const fieldTypeValue = fieldsTypes[i];
            
            if (['blockTradeId', 'quantity'].includes(fieldTypeValue)) {
                errors.push({
                        message: `${mappedHeaders[fieldTypeValue]} has to be numeric, Please correct :  ${currentFieldTypeErrors.join()}.`
                });
            } else {
                errors.push({
                        message: `${mappedHeaders[fieldTypeValue]} has to be alpanumeric, Please correct :  ${currentFieldTypeErrors.join()}.`
                });
            }
        }
    }
}

function validateHeader(header) {
    if (!isHeaderValidated) {
        header = header.map(function (el) {
          return el.trim().toLowerCase();
        });
        const validateHeaderResult = compareHeaders(header, expectedHeader);
    
         if(validateHeaderResult.inValidHeader) {
            console.log('Invalid header', header);
            hasErrors = true;
            errors.push({
                    message: `File header is not matching the standard, Please send header as ${expectedHeader.join()}. A template can be download by clicking the icon beside file upload button`
            });
    
        }
        isHeaderValidated = true;
    }    
}
 
function compareHeaders(header, expectedHeader) {
  const isValidHeader = compareArrays(header, expectedHeader);

  return {
      inValidHeader: !isValidHeader,
      expectedHeader: expectedHeader
  }
}

function isEmptyFile(csvData) {

  const firstRowData = Object.values(csvData[0]);

  return  !firstRowData.some(val => val !== '');
}

 const compareArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);

};
