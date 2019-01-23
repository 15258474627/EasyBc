const express = require("express")
const path = require("path")
const db = require("./backend/db")
const {SUCCESS, PARAM_ERR, OTH_ERR} = require("./constant")
const {getTransactionState} = require("./backend/chat")

const log4js= require("./logConfig")
const logger = log4js.getLogger()
const errlogger = log4js.getLogger("err")
const othlogger = log4js.getLogger("oth")

const app = express();
log4js.useLogger(app, logger);
app.use("/", express.static(path.join(__dirname + "/dist")));

const server = app.listen(9090, function() {
    let host = server.address().address;
    let port = server.address().port;
    console.log("server listening at http://%s:%s", host, port);
});

app.get("/generateKeyPiar", function(req, res) {
  db.generateKeyPiar(function(err, value) {
  	res.send({
        code: !!err ? OTH_ERR : SUCCESS,
        msg: err,
        data: value
    });
  });
});

app.get("/getFromHistory", function(req, res) {
  db.getFromHistory(function(err, value) {
  	res.send({
        code: !!err ? OTH_ERR : SUCCESS,
        msg: err,
        data: value
    });
  })
});

app.get("/getToHistory", function(req, res) {
  db.getToHistory(function(err, value) {
  	res.send({
        code: !!err ? OTH_ERR : SUCCESS,
        msg: err,
        data: value
    });
  });
});

app.get("/sendTransaction", function(req, res) {
	if(!req.query.from) {
    res.send({
        code: PARAM_ERR,
        msg: "param error, need from"
    });
    return;
  }

  if(!req.query.to) {
    res.send({
        code: PARAM_ERR,
        msg: "param error, need to"
    });
    return;
  }

  if(!req.query.value) {
    res.send({
        code: PARAM_ERR,
        msg: "param error, need value"
    });
    return;
  }

  db.sendTransaction(req.query, function(err, transactionHashHexString) {
    if(!!err)
    {
      res.send({
        code: OTH_ERR,
        msg: err
      });
      return;
    }
  	
    res.send({
      code: SUCCESS,
      msg: "",
      data: transactionHashHexString
    });
  });
});

app.get("/getTransactionState", function(req, res) {

  const TRANSACTION_STATE_UNCONSISTENT = 1;
  const TRANSACTION_STATE_CONSISTENT = 2;
  const TRANSACTION_STATE_PACKED = 3;
  const TRANSACTION_STATE_NOT_EXISTS = 4;

  let returnData;

  if(!req.query.hash) {
    res.send({
        code: PARAM_ERR,
        msg: "param error, need hash"
    });
    return;
  }

  const hash = Buffer.from(req.query.hash, "hex");

  getTransactionState(hash, function(err, transactionState) {
    if(!!err)
    {
      res.send({
        code: OTH_ERR,
        msg: err
      });
      return;
    }

    if(transactionState == TRANSACTION_STATE_UNCONSISTENT)
    {
      returnData = "transaction not consistent";
    }
    
    if(transactionState == TRANSACTION_STATE_CONSISTENT)
    {
      returnData = "transaction consistent";
    }

    if(transactionState == TRANSACTION_STATE_PACKED)
    {
      returnData = "transaction packed";
    }

    if(transactionState == TRANSACTION_STATE_NOT_EXISTS)
    {
      returnData = "transaction not exists";
    }

    res.send({
      code: SUCCESS,
      msg: "",
      data: returnData
    });
  })
});