'use strict';
/**
 * Word2Vec Module
 */
const curdir = __dirname;
const Reader = require('bindings')('word2vec').Reader;
const _ = require("lodash");
const path = require("path");
const debug = require('debug')('word2vec');
const Q = require('q');

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
    let deferred = Q.defer();
    if (word2vecModelPath)
        this.word2vecModelPath = word2vecModelPath;
    if (this.isInited)
        return deferred.resolve();
    try {
        this.R.initialize(this.word2vecModelPath, () => {
            this.isInited = true;
            deferred.resolve();
        }, (err) => {
            deferred.reject(err);
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

Word2vec.prototype.nearby = function(word, topk = 10) {
    let deferred = Q.defer();
    try {
        this.R.findClosestWords(word, topk, (rc, data) => {
            if (rc === 0) {
                deferred.resolve(data);
            } else if (rc === 1) {
                deferred.reject({
                    rc: rc,
                    error: "Exception: Out of vocabulary."
                })
            } else {
                deferred.reject({
                    rc: 2,
                    error: "unknown error."
                })
            }
        });
    } catch (e) {
        deferred.reject({
            rc: 4,
            error: "init fails."
        });
    }
    return deferred.promise;
}

Word2vec.prototype.v = function(word) {
    let deferred = Q.defer();
    try {
        this.R.getVector(word, (rc, v) => {
            if (rc == 0) {
                deferred.resolve(v);
            } else if (rc == 1) {
                deferred.reject({
                    rc: 1,
                    error: `warning: ${word} word not found`
                });
            } else {
                deferred.reject({
                    rc: 2,
                    error: "empty word"
                });
            }
        })
    } catch (e) {
        debug("v error: %o", e);
        deferred.reject({
            rc: 4,
            error: "init fails."
        });
    }
    return deferred.promise;
}


/**
 * Get vectors for words
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
    Q.allSettled(promises)
        .then((results) => {
            for (let x in results) {
                if (results[x]["state"] === "fulfilled") {
                    vectors.push(results[x]["value"]);
                } else {
                    debug("_vectors error: %j", results[x]);
                }
            }

            if (vectors.length > 0)
                return deferred.resolve(vectors);
            deferred.reject("Invalid vectors length: " + JSON.stringify(words));
        }, function(err) {
            deferred.reject(err);
        })

    return deferred.promise;
}

/**
 * Get Bag of Words Vector
 * @param  {[type]} words [description]
 * @return {[type]}       [description]
 */
Word2vec.prototype.bow = function(words) {
    let deferred = Q.defer();
    debug("bow words: %j", words);
    this.vectors(words)
        .then((vectors) => {
            // bag of words
            let v = [];
            for (let x in vectors) {
                _.each(vectors[x], (val, index) => {
                    if (v[index] !== undefined) {
                        v[index] += val;
                    } else {
                        v.push(val);
                    }
                })
            }
            if (v.length > 0)
                return deferred.resolve(v);
            debug("bow get length 0");
            deferred.reject("Empty vector after Bag of Words:" + sen);
        }, (err) => {
            debug("bow get error %o", err);
            deferred.reject(err);
        });

    return deferred.promise;
}

/**
 * Get vocal size
 * @return {Promise} [description]
 */
Word2vec.prototype.getVocabSize = function() {
    let deferred = Q.defer();
    try {
        Q.fcall(() => {
                if (this.isInited)
                    return;
                if (!this.word2vecModelPath)
                    throw new Error("Empty Word2vec Model Path");
                return this.init();
            })
            .then(() => {
                this.R.getVocabSize((num) => {
                    deferred.resolve(num);
                })
            })
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}

/**
 * Get embedding dim
 * @return {Promise} [description]
 */
Word2vec.prototype.getEmbeddingDim = function() {
    let deferred = Q.defer();
    try {
        Q.fcall(() => {
                if (this.isInited)
                    return;
                if (!this.word2vecModelPath)
                    throw new Error("Empty Word2vec Model Path");
                return this.init();
            })
            .then(() => {
                this.R.getEmbeddingDim((num) => {
                    deferred.resolve(num);
                })
            })
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}


exports = module.exports = Word2vec;
