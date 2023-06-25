'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = AWS.util.uuid.v4

module.exports.post = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const first_name = requestBody.first_name;
  const last_name = requestBody.last_name;

  if (typeof first_name !== 'string' || typeof last_name !== 'string') {
    callback(null, jsonResponse(
      400,
      {
        error: "Validation error, check the first_name, last_name field types"
      }
    ))
  }

  submitVisitorP(candidateInfo(first_name, last_name))
    .then(res => {
      callback(null, jsonResponse(
        201,
        res
      ));
    })
    .catch(err => {
      callback(null, jsonResponse(
        500,
        {
          error: err
        }))
    });
};

module.exports.list = (event, context, callback) => {
    var params = {
        TableName: process.env.VISITORS_TABLE,
    };

    const onScan = (err, data) => {
        if (err) {
            callback(null, jsonResponse(
              400,
              {
                error: err
              }
            ));
        } else {
            return callback(null, jsonResponse(
              200,
              {
                data
              }
            ));
        }

    };

    dynamoDb.scan(params, onScan);

};

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.VISITORS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      callback(null, jsonResponse(
        200,
          result.Item
      ));
    })
    .catch(err => {
      callback(null, jsonResponse(
        500,
        {
          error: err
        }))
    });
};

module.exports.put = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const first_name = requestBody.first_name;
  const last_name = requestBody.last_name;

  if (typeof first_name !== 'string' || typeof last_name !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit candidate because of validation errors.'));
    return;
  }

  submitVisitorP({
    ...candidateInfo(first_name, last_name),
    id: event.pathParameters.id
  })
    .then(res => {
      callback(null, jsonResponse(
        201,
        res
      ));
    })
    .catch(err => {
      callback(null, jsonResponse(
        500,
        {
          error: err
        }))
    });
};

module.exports.delete = (event, context, callback) => {
  const params = {
    TableName: process.env.VISITORS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamoDb.delete(params).promise()
    .then(result => {
      callback(null, jsonResponse(
        204,
          result
      ));
    })
    .catch(err => {
      callback(null, jsonResponse(
        500,
        {
          error: err
        }))
    });
};

const submitVisitorP = visitor => {
  console.log('Submitting Visitor');
  const visitorInfo = {
    TableName: process.env.VISITORS_TABLE,
    Item: visitor,
  };
  return dynamoDb.put(visitorInfo).promise()
    .then(res => visitor);
};

const candidateInfo = (first_name, last_name) => {
  const timestamp = new Date().toISOString();
  return {
    id: uuidv4(),
    first_name: first_name,
    last_name: last_name,
    time: timestamp
  };
};

const jsonResponse = (status_code, body) => {
  return {
    statusCode: status_code,
    body: JSON.stringify(
      body
    ),
    headers: {
      "Content-Type": "application/json",
    },
  }
}
