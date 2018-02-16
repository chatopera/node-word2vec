# node-word2vec
Word2vec model reader for Node.js Client.

![](https://camo.githubusercontent.com/ae91a5698ad80d3fe8e0eb5a4c6ee7170e088a7d/687474703a2f2f37786b6571692e636f6d312e7a302e676c622e636c6f7564646e2e636f6d2f61692f53637265656e25323053686f74253230323031372d30342d30342532306174253230382e32302e3437253230504d2e706e67)

# Welcome

```
npm install node-word2vec-reader
var Word2vec = require("node-word2vec-reader");
var word2vec = new Word2vec();
```

**为了保证性能，使用Node.js [C ++ Addon模块](https://github.com/Samurais/node-word2vec/tree/master/app)管理词表和加载模型。**

# APIs

**所有接口都返回Promise**。

## word2vec#init(model_file_path)

```
word2vec.init(model_file_path); 
```

实例化后的word2vec 先进行初始化，```model_file_path```是通过[word2vec](app/google)训练后得到的模型。

## word2vec#getVocabSize()
获得词表的大小

```
word2vec.getVocabSize()
    .then(function(num){
        // do your magic
        })
```


## word2vec#getEmbeddingDim()
获得词向量的维度

```
word2vec.getEmbeddingDim()
    .then(function(num){
        // do your magic
        })
```

## word2vec#v(word)
获得一个词语的向量

```
word2vec.v("飞机")
    .then(function(vector){
        // do your magic
        })
```

## word2vec#nearby(word, [topK])
获得一个词语最近的k个词语及分数。

```
word2vec.nearby("飞机", 10)
    .then(function(data){
        // do your magic
        })
```

* 返回值 JSONArray

```[[words], [scores]]```，包含两个列表，第一个是词语，第二个是对应位置词语的距离分数，同样是在[0~1]区间，越接近于1越相似。

比如：
```
[
    ["股市","股价","股票市场","股灾","楼市","股票","香港股市","行情","恒指","金融市场"],
    [1,0.786284,0.784575,0.751607,0.712255,0.712179,0.710806,0.694434,0.67501,0.666439]
]
```

## word2vec#bow(words)
对传入的词语的列表返回BoW向量。

```
word2vec.bow(["飞机", "航母"])
    .then(function(vector){
        // do your magic
        })
```

**[更多详情](./app/test/index.js)。**


# Contribute
```
admin/rebuilt.sh # 重新编译C++ Addon
admin/test.sh # 单元测试
```

# Word2vec
word2vec是用来训练词向量模型的工具，为了方便，将word2vec也放在代码库中。编译和使用word2vec：
```
cd app/google
make clean
make
./word2vec
```

关于Word2vec更多信息，参考 [word2vec/google/README](app/word2vec/google/README.txt)。

# Give credits to

[ofxMSAWord2Vec](https://github.com/memo/ofxMSAWord2Vec)

# LICENSE
Word2vec model reader for Node.js Client.
Copyright (C) 2018  Hai Liang Wang<hailiang.hl.wang@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

