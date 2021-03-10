const Request = require('tedious').Request;
const Connection = require('tedious').Connection;

module.exports.getDestinationDetails = (event, context) => {  
const server = process.env.dbServer;
const userName = process.env.dbUsername;
const password = process.env.dbPassword;
const LSdatabase = process.env.dbLSName;
const LTdatabase = process.env.dbLTName;
const spGetDestinationCodeLS = process.env.spGetDestinationCodeLS;
const spGetDestinationCodeLT = process.env.spGetDestinationCodeLT;

let schoolType = "";
let destinationList = [];
let lsRecordCount = 0, lsRecordsProcesed = 0;
let ltRecordCount = 0, ltRecordsProcesed = 0;

function getLSDestinationDetails() {
  console.log('Start - getLSDestinationDetails');

  let LSconfig = {
    server: server,
    userName: userName,
    password: password,
    debug: true,
    options: {
            database: LSdatabase,
            useColumnNames: true,
            rowCollectionOnDone: true
    }
  };
  let LSConnection = new Connection(LSconfig);
  
  LSConnection.on('connect', function (err) {
      if (err) {
          console.log('LS Connection failed');
      }
      else {
          console.log('LS Connection successful!');
          var request = new Request(spGetDestinationCodeLS,
			  function (err) {
				  if (err) {
					  console.log('error in getLSDestinationDetails');
				  }
			  });
            LSConnection.callProcedure(request);            

		  request.on('doneInProc', function (rowCount, more, rows) {
			  if (rows != undefined && rows.length > 0) {      
                  console.log(rows.length + " - LS record(s)");
                  
                  lsRecordCount = rows.length;
                  rows.forEach(function (row) { 
                    destinationList.push(
                        {
                            "SchoolType" : "LS",
                            "Code" : (row.Code.value).trim(),
                            "Name" : row.Name.value,
                            "Region" : row.RegionName.value,
                            "Center" : ""
                        }
                    );         
                    lsRecordsProcesed = lsRecordsProcesed + 1;
                    if (lsRecordsProcesed >= lsRecordCount)
                    {
                        if(schoolType == "All")
                        {
                            getLTDestinationDetails();
                        }
                        else
                        {
                            var response = {
                                "statusCode": 200, 
                                "headers": {
                                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                                  },               
                                "body": JSON.stringify(destinationList)
                            };
                            context.succeed(response);  
                        }
                    }
                    }); 
			  }
		  });  
      }
  });

  console.log('End - getLSDestinationDetails');     
}

function getLTDestinationDetails() {
  console.log('Start - getLTDestinationDetails');

  let LTconfig = {
    server: server,
    userName: userName,
    password: password,
    debug: true,
    options: {
            database: LTdatabase,
            useColumnNames: true,
            rowCollectionOnDone: true
    }
  };
  let LTConnection = new Connection(LTconfig);
  
  LTConnection.on('connect', function (err) {
      if (err) {
          console.log('LT Connection failed');
      }
      else {
          console.log('LT Connection successful!');
          var request = new Request(spGetDestinationCodeLT,
			  function (err) {
				  if (err) {
					  console.log('error in getLTDestinationDetails');
				  }
			  });
            LTConnection.callProcedure(request);

		  request.on('doneInProc', function (rowCount, more, rows) {
			  if (rows != undefined && rows.length > 0) {      
				  console.log(rows.length + " - LT record(s)");
                  
                  ltRecordCount = rows.length;
                  rows.forEach(function (row) {   
                    destinationList.push(
                        {
                            "SchoolType" : "LT",
                            "Code" : row.SiteId.value,
                            "Name" : row.SiteName.value,
                            "Region" : row.RegionName.value,
                            "Center" : row.CenterName.value
                        }
                    );       
                    ltRecordsProcesed = ltRecordsProcesed + 1;
                    if (ltRecordsProcesed >= ltRecordCount)
                    {
                        var response = {
                            "statusCode": 200, 
                            "headers": {
                                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                              },              
                            "body": JSON.stringify(destinationList)
                        };
                        context.succeed(response);  
                    }
                    }); 
			  }
		  });   
      }
  });

  console.log('End - getLTDestinationDetails'); 
}

function getDestinationDetails(event) {
	console.log('Start - getDestinationDetails');
    
    schoolType = JSON.parse(event.body).SchoolType;

    if (schoolType == "LT")
    {
        getLTDestinationDetails();
    }
    else if (schoolType == "LS" || schoolType == "All")
    {
        getLSDestinationDetails();
    }

	console.log('End - getDestinationDetails');
}

  getDestinationDetails(event);
};
