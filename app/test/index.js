/* Copyright (C) 2018 Hai Liang Wang<hailiang.hl.wang@gmail.com> - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the GPL 3.0 license, which unfortunately won't be
 * written for another century.
 *
 * You should have received a copy of the GPL 3.0 license with
 * this file. If not, visit: https://www.gnu.org/licenses/gpl-howto.en.html
 */
const test = require("ava");
const curdir = __dirname;
const path = require("path");
const debug = require("debug")("word2vec:test");
const Word2vec = require(path.resolve(curdir, "..", "index.js"));
const w2v_model_ = path.resolve(curdir, "..", "..", "tmp", "words.vector");
const SYN_MODEL_W2V_PATH =
  "SYN_MODEL_W2V_PATH" in process.env
    ? process.env["SYN_MODEL_W2V_PATH"]
    : w2v_model_;

const word2vec = new Word2vec();
word2vec.init(SYN_MODEL_W2V_PATH);

test("word2vec#vector", async t => {
  debug("word2vec#vector");
  let v = await word2vec.v("飞机");
  debug("word2vec#v", v);
  let nearby = await word2vec.nearby("飞机", 10);
  debug("word2vec#nearby %j", nearby);
  t.pass();
});

test("word2vec#info", async t => {
  debug("word2vec#info");
  let v = await word2vec.getEmbeddingDim();
  debug("word2vec#getEmbeddingDim", v);
  v = await word2vec.getVocabSize();
  debug("word2vec#getVocabSize %j", v);
  t.pass();
});

test("word2vec#sentence_vector", async t => {
  debug("word2vec#sentence_vector");
  let v = await word2vec.bow(["飞机", "航母"]);
  debug("sentence_vector:", JSON.stringify(v));
  t.pass();
});
