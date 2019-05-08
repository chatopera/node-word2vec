"use strict";
/* Copyright (C) 2019 Hai Liang Wang<hailiang.hl.wang@gmail.com>
 * - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the GPL 3.0 license, which unfortunately won't be
 * written for another century.
 *
 * You should have received a copy of the GPL 3.0 license with
 * this file. If not, visit: https://www.gnu.org/licenses/gpl-howto.en.html
 */
const Reader = require("bindings")("word2vec").Reader;
const _ = require("lodash");
const debug = require("debug")("word2vec");
const Q = require("q");
const fs = require("fs");

function Word2vec() {
  this.isInited = false;
  this.word2vecModelPath = null;
  this.R = new Reader();
}

/**
 * Init word2vec reader
 * @param  {[type]} word2vecModelPath [description]
 * @return {[type]}                   [description]
 */
Word2vec.prototype.init = function(word2vecModelPath) {
  return new Promise((resolve, reject) => {
    if (word2vecModelPath && fs.existsSync(word2vecModelPath)) {
      this.word2vecModelPath = word2vecModelPath;
      this.R.initialize(
        word2vecModelPath,
        () => {
          this.isInited = true;
          resolve();
        },
        err => {
          console.log("initialize Reader failed ", err);
          reject({
            rc: 2,
            error: "initialize Reader failed."
          });
        }
      );
    } else {
      reject({
        rc: 1,
        error: "Model file is null or not exist."
      });
    }
  });
};

/**
 * Find neighbors
 */
Word2vec.prototype.nearby = function(word, topk = 10) {
  return new Promise((resolve, reject) => {
    this.R.findClosestWords(word, topk, (rc, data) => {
      if (rc === 0) {
        resolve(data);
      } else if (rc === 1) {
        reject({
          rc: rc,
          error: "Exception: Out of vocabulary."
        });
      } else {
        reject({
          rc: 2,
          error: "unknown error."
        });
      }
    });
  });
};

/**
 * Get vector by a given word.
 */
Word2vec.prototype.v = function(word) {
  return new Promise((resolve, reject) => {
    this.R.getVector(word, (rc, v) => {
      if (rc === 0) {
        resolve(v);
      } else if (rc === 1) {
        reject({
          rc: 1,
          error: `warning: ${word} word not found`
        });
      } else {
        reject({
          rc: 2,
          error: "empty word"
        });
      }
    });
  });
};

/**
 * Get vectors for words with BoW model.
 * @param  {[type]} words [description]
 * @return {[type]}       [description]
 */
Word2vec.prototype.vectors = function(words) {
  const deferred = Q.defer();
  const promises = [];
  const vectors = [];
  for (let x in words) {
    promises.push(this.v(words[x]));
  }
  Q.allSettled(promises).then(
    results => {
      for (let x in results) {
        if (results[x]["state"] === "fulfilled") {
          vectors.push(results[x]["value"]);
        } else {
          debug("_vectors error: %j", results[x]);
        }
      }

      if (vectors.length > 0) return deferred.resolve(vectors);
      deferred.reject("Invalid vectors length: " + JSON.stringify(words));
    },
    function(err) {
      deferred.reject(err);
    }
  );

  return deferred.promise;
};

/**
 * Get Bag of Words Vector
 * @param  {[type]} words [description]
 * @return {[type]}       [description]
 */
Word2vec.prototype.bow = function(words) {
  debug("bow words: %j", words);
  return new Promise((resolve, reject) => {
    this.vectors(words).then(
      vectors => {
        // bag of words
        let v = [];
        for (let x in vectors) {
          _.each(vectors[x], (val, index) => {
            if (v[index] !== undefined) {
              v[index] += val;
            } else {
              v.push(val);
            }
          });
        }
        if (v.length > 0) return resolve(v);
        debug("bow get length 0");
        reject("Empty vector after Bag of Words:" + sen);
      },
      err => {
        debug("bow get error %o", err);
        reject(err);
      }
    );
  });
};

/**
 * Get vocal size
 * @return {Promise} [description]
 */
Word2vec.prototype.getVocabSize = function() {
  return new Promise((resolve, reject) => {
    if (this.isInited) {
      this.R.getVocabSize(num => {
        resolve(num);
      });
    } else {
      reject({
        rc: 1,
        error: "Un-initialized Reader."
      });
    }
  });
};

/**
 * Get embedding dim
 * @return {Promise} [description]
 */
Word2vec.prototype.getEmbeddingDim = function() {
  return new Promise((resolve, reject) => {
    if (this.isInited) {
      this.R.getEmbeddingDim(num => {
        resolve(num);
      });
    } else {
      reject({
        rc: 1,
        error: "Un-initialized Reader."
      });
    }
  });
};

exports = module.exports = Word2vec;
