const yaspeller = require('../lib/yaspeller');
const dictionary = require('../lib/dictionary');
const exitCodes = require('../lib/exit-codes');
const assert = require('chai').assert;

describe('Dictionary', function() {
    it('removeDictWords(), strings', function() {
        const dict = dictionary.prepareDictionary([
            'контрол',
            'юзабилити'
        ]);
        const typos = [
            {
                code: 1,
                word: 'юзабилити'
            },
            {
                code: 2,
                word: 'москва'
            },
            {
                code: 1,
                word: 'блабла'
            },
            {
                code: 1,
                word: 'контрол'
            }
        ];

        dictionary._dict = dict;

        assert.deepEqual(dictionary.removeDictWords(typos), [
            {
                code: 2,
                word: 'москва'
            },
            {
                code: 1,
                word: 'блабла'
            }
        ]);
    });

    it('prepareDictionary()', function() {
        const dict = dictionary.prepareDictionary([
            'контрол',
            '/(Ю|юзабилити/',
            '/москв[а/i',
        ]);

        assert.equal(dict.length, 1);
    });

    it('isTypo()', function() {
        [
            {
                dict: [
                    'контрол'
                ],
                word: 'Контрол',
                result: false
            },
            {
                dict: [
                    'Контрол'
                ],
                word: 'контрол',
                result: true
            },
            {
                dict: [
                    'митап'
                ],
                word: 'митап',
                result: false
            },
            {
                dict: [
                    'митап'
                ],
                word: 'тестмитап',
                result: true
            },
            {
                dict: [
                    'митап'
                ],
                word: 'немитап',
                result: true
            },
            {
                dict: [
                    'митап'
                ],
                word: 'багмитапбаг',
                result: true
            }
        ].forEach(item => {
            const dict = dictionary.prepareDictionary(item.dict);
            assert.equal(item.result, dictionary.isTypo(item.word, dict), item.word);
        });
    });

    it('removeDuplicates()', function() {
        const typos = [
            {
                code: 1,
                word: 'юзабилити'
            },
            {
                code: 1,
                word: 'юзабилити'
            },
            {
                code: 1,
                word: 'мосКва'
            },
            {
                code: 1,
                word: 'мосКва'
            },
            {
                code: 1,
                word: 'блабла'
            }
        ];

        const result = yaspeller.removeDuplicates(typos);
        assert.equal(result.length, 3);
    });

    it('getDictionary(), empty params', function() {
        dictionary.set();
        assert.deepEqual(dictionary._dict, []);
    });

    it('set(), dictionary from config', function() {
        dictionary.set([], ['a']);
        assert.deepEqual(dictionary._dict, [/^[aA]$/]);
    });

    it('set()', function() {
        dictionary.set(['test/dict/a.json', 'test/dict/b.json'], ['a']);
        assert.deepEqual(dictionary._dict, [
            /^[aA]$/,
            /^[xX]yz$/,
            /^[aA]bc$/,
            /^CLI$/,
            /^[dD]eps$/
        ]);
    });

    it('set(), is not utf8', function() {
        dictionary.set(['test/dict/not_utf8.json']);
        assert.equal(process.exit.args[0], exitCodes.ERROR_DICTIONARY);
    });

    it('set(), error parsing', function() {
        dictionary.set(['test/dict/error_parsing.json']);
        assert.equal(process.exit.args[0], exitCodes.ERROR_DICTIONARY);
    });

    it('set(), not exists', function() {
        dictionary.set(['test/dict/not_exists.json']);
        assert.equal(process.exit.args[0], exitCodes.ERROR_DICTIONARY);
    });

    it('isNotOptimizedRegExp()', function() {
        assert.isFalse(dictionary.isNotOptimizedRegExp('/Unknownword/'));
        assert.isTrue(dictionary.isNotOptimizedRegExp('[U]nknownword'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('Unknownwor[d]'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('()Unknownword'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('Unknownword()'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('Unknow[]nword'));

        assert.isFalse(dictionary.isNotOptimizedRegExp('Unknow[ab]nword'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('Unknow[a]nword'));

        assert.isTrue(dictionary.isNotOptimizedRegExp('Unknow(a)nword'));
    });
});
