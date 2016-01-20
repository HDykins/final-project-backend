var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var app = express();

var CONFIG = require('./config.json');
var PORT = parseInt(CONFIG.server.port, 10);
var HOST_NAME = CONFIG.server.hostName;
var DATABASE_NAME = CONFIG.database.name;
var TOKEN_SECRET = CONFIG.token.secret;
var TOKEN_EXPIRES = parseInt(CONFIG.token.expiresInSeconds, 10);
var User = require('./models/user');
var Order = require('./models/orders');
var cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cors());

mongoose.connect('mongodb://' + HOST_NAME + '/' + DATABASE_NAME);

var apiRouter = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/users/authenticate', function authenticateUser(request, response) {

  // find the user
  User.findOne({
    email: request.body.email
  }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! user) {

      response.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      });

      return;
    }

    bcrypt.compare(request.body.password, user.password, function (error, result) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      if (! result) {

        response.status(401).json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });

        return;
      }

      // if user is found and password is right
      // create a token
      var token = jsonwebtoken.sign({ email: user.email }, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRES
      });

      var id = user.id

      // return the information including token as JSON
      response.json({
        success: true,
        token: token,
        id: id
      });

    });
  });
});

apiRouter.post('/users/', function createUser(request, response) {

  console.log(request.body.id)

  // find the user
  User.findOne({
    email: request.body.email
  }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (user) {
      response.status(409).json({
        success: false,
        message: '\'' + request.body.email + '\' already exists.'
      });

      return;
    }

    bcrypt.genSalt(10, function (error, salt) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      bcrypt.hash(request.body.password, salt, function (error, hash) {

        if (error) {
          response.status(500).json({
            success: false,
            message: 'Internal server error'
          });

          throw error;
        }

        var user = new User({
          email: request.body.email,
          password: hash,
          phoneNumber: request.body.phoneNumber,
          id: request.body.id
        });

        console.log(request.body)

        user.save(function (error) {

          if (error) {
            response.status(500).json({
              success: false,
              message: 'Internal server error'
            });

            throw error;
          }

          response.json({
            success: true
          });
        });
      });
    });
  });
});

apiRouter.patch('/orders/:orderId', function handleUpdateOrder(request, response) {

  // find the user
  Order.findOne({
    id: request.params.orderId
  }, function handleQuery(error, order) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! order) {

      response.status(404).json({
        success: false,
        message: 'Order not found.'
      });

      return;
    }

    User.findOne({
      id: request.body.userId

    }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! user) {

      response.status(404).json({
        success: false,
        message: 'User not found.'
      });

      return;
    }

    order.userId = user.id;

    order.save(function (error) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      // return the information including token as JSON
      response.json({
        success: true,
        order: order
      });

    });
  });
});
});

apiRouter.post('/orders/', function postOrder(request, response) {


User.findOne({
  id: request.body.userId
  }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }


  var order = new Order({
    userChoices: request.body.userChoices,
    id: request.body.id,
    userId: user.id
  });

  console.log(order);

  order.save(function (error) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.json({
      success: true
    });
  });
});
});


// route middleware to verify a token
apiRouter.use(function verifyToken(request, response, next) {

  // check header or url parameters or post parameters for token
  var token = request.body.token || request.query.token || request.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jsonwebtoken.verify(token, TOKEN_SECRET, function (error, decoded) {

      if (error) {

        response.status(403).json({
          success: false,
          message: 'Failed to authenticate token.'
        });

        return;
      }

      // if everything is good, save to request for use in other routes
      request.decoded = decoded;

      next();
    });

  } else {

    // if there is no token
    // return an error
    response.status(403).json({
      success: false,
      message: 'No token provided.'
    });
  }
});


apiRouter.get('/orders/user/:userId/', function getAllOrders(request, response) {

  console.log(request.params);

  var id = request.params.userId;

  console.log(id);
  console.log(request.body);

  Order.find( { userId: id }, function handleGetOrders(error, orders) {

    if (error) {
          response.status(500).json({
            success: false,
            message: 'Internal server error'
          });

          throw error;
        }

    response.json(orders);
  });
});


apiRouter.get('/orders/:id/', function getOrder(request, response) {

  console.log(request.params);

  var id = request.params.id;

  console.log(id);
  console.log(request.body);

  Order.findOne( { id: id }, function handleGetOrders(error, order) {

    if (error) {
          response.status(500).json({
            success: false,
            message: 'Internal server error'
          });

          throw error;
        }

    response.json(order);
  });
});



apiRouter.delete('/orders/:id/', function deleteOrder(request, response) {

  console.log(request.params);

  var id = request.params.id;

  console.log(id);
  console.log(request.body);

  Order.findOne( { id: id }, function handleGetOrders(error, order) {

    if (error) {
          response.status(500).json({
            success: false,
            message: 'Internal server error'
          });

          throw error;
        }

      if (order) {
        order.remove(function (error) {
          if (error) {
          response.status(500).send(error);
          return;
        }

        response.status(204);
      });
      return;
    }
    response.status(404).json({});
  });
});



app.use('/api', apiRouter);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
