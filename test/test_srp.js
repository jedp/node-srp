const vows = require('vows'),
      assert = require('assert'),
      bigint = require('bigint'),
      params = require('../lib/params'),
      srp = require('../lib/srp'),
      s = new Buffer("salty"),
      I = new Buffer("alice"),
      P = new Buffer("password123"),
      N = params[4096].N,
      g = params[4096].g,
      ALG_NAME = 'sha256';

var a, A;
var b, B;
var v;
var S_client, S_server;

vows.describe("srp.js")

.addBatch({
  "getv": function() {
    v = srp.getv(s, I, P, N, g, ALG_NAME);
    assert(v.bitLength() > 0);
  },

  "getx": function() {
    assert(srp.getx(s, I, P, ALG_NAME).bitLength() > 0);
  },

  "with a": {
    topic: function() {
      var cb = this.callback;
      srp.genKey(64, function(err, key) {
        a = key;
        cb(err, a);
      });
    }, 

    "getA": function(err, a) {
      assert(err === null);

      A = srp.getA(g, a, N);
      assert(A.bitLength() > 0);
    },

    "with b": {
      topic: function() {
        var cb = this.callback;
        srp.genKey(32, function(err, key) {
          b = key;
          cb(err, b);
        });
      },
      
      "getB": function(err, b) {
        assert(err === null);

        B = srp.getB(v, g, b, N, ALG_NAME);
        assert(B.bitLength() > 0);
      },

      "getS": {
        "by client": function() {
          S_client = srp.client_getS(s, I, P, N, g, a, B, ALG_NAME);
          assert(S_client.bitLength() > 0);
        },

        "by server": function() {
          S_server = srp.server_getS(s, v, N, g, A, b, ALG_NAME);
          assert(S_server.bitLength() > 0);
        },

        "by client and server are equal": function() {
          assert(S_server.eq(S_client));
        }
      }
    }
  }
})

.export(module);
