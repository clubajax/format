/* eslint-disable max-lines-per-function, object-shorthand, sort-vars, no-nested-ternary, indent, indent-legacy, complexity, no-plusplus, prefer-reflect*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
        root.formatters = factory();
    }
})(this, function () {
    const SPACE = '&nbsp;';

    function split(str, chunkAmount) {
        // splits a string into segments, based on an amount, not a char
        // ex: split('123456789', 3) => ['123', '456', '789']
        const chunks = [];
        while (str.length) {
            chunks.unshift(str.substring(str.length - chunkAmount, str.length));
            str = str.substring(0, str.length - chunkAmount);
        }
        return chunks;
    }

    function stripExtraZeros(value) {
        while (value.length && value[0] === '0') {
            value = value.substring(1);
        }

        while (/\.\d\d0/.test(value) && /\d\d0$/.test(value)) {
            value = value.substring(0, value.length - 1);
        }

        if (/^\./.test(value)) {
            return `0${value}`;
        }
        return value;
    }

    function formatMoney(amount) {
        let str = toDecimal(amount.toString());
        const neg = /^-/.test(str) ? '-' : '';
        str = str.replace('-', '');
        const cents = /\./.test(str) ? formatCents(str.split('.')[1]) : '00';
        const dollars = split(str.split('.')[0], 3).join(',') || '0';
        return `${neg}$${dollars}.${cents}`;
    }

    function formatCents(amount) {
        let amt = parseFloat(`0.${amount}`);
        // 0.009
        amt = Math.round(amt * 100);
        return amt > 9 ? `${amt}` : `0${amt}`;
    }

    function formatPhone(value) {
        if (!value) {
            return value;
        }
        const n = toNumber(value);
        if (n.length <= 12) {
            return `(${n.substring(0, 3)}) ${n.substring(3, 6)}-${n.substring(6, 10)}`;
        }
        return `(${n.substring(0, 3)}) ${n.substring(3, 6)}-${n.substring(6, 10)} x${n.substring(10)}`;
    }

    function toDigits(value) {
        return (toString(value).match(/\d/g) || []).join('');
    }

    function toNumber(value) {
        return (toString(value).match(/\d/g) || []).join('');
    }

    function toDecimal(value) {
        value = toString(value).replace('$', '');
        const result = value.match(/-*\d|\./g);
        if (result !== null) {
            return stripExtraZeros(result.join(''));
        }
        return '';
    }

    function toFloat(value) {
        value = parseFloat(value);
        value = Math.round(value * 100) * 0.01;
        return value.toFixed(2);
    }

    function isUpperCase(value) {
        value = toString(value);
        return value.toUpperCase() === value;
    }

    function cap(value) {
        value = toString(value);
        return `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`;
    }

    const words2 =
        'in, ax, ex, ox, by, my, ok, ah, aw, eh, ha, he, hi, if, of, we, am, be, me, up, ad, do, go, an, ar, as, at, et, in, is, it, lo, no, on, so, to, us'.split(
            ', ',
        );
    const words3 = ['a', 'for', 'the', 'and', 'nor', 'but', 'yet'];
    const specWord = {
        po: 1,
        'po.': 1,
        'p.o.': 1,
    };
    function isAbbr(word) {
        return !/[aeiouy]/.test(word) && word !== 'inc';
    }

    function isState(word) {
        word = word.trim();
        if (word.length > 3) {
            return false;
        }
        const str = word.match(/\w*/g);
        if (str) {
            word = str[0];
        }
        return states.includes(word.toUpperCase());
    }

    function toTitleCase(value) {
        let words = toString(value);

        words = words
            .toLowerCase()
            .split(' ')
            .map((word, i) => {
                if (specWord[word] || isAbbr(word) || isState(word)) {
                    return word.toUpperCase();
                }

                if (i === 0) {
                    return cap(word);
                }

                if (words2.includes(word) || words3.includes(word)) {
                    return word;
                }
                return cap(word);
            })
            .join(' ');

        words = words.replace(/([\/,;-]|\.)\w/g, (word) => {
            // not actually a word, it is punctuation followed by a letter
            return word.substring(0, 1) + word.substring(1, 2).toUpperCase();
        });

        words = words.replace(/\W\w{1,3}\W/g, (word) => {
            if (words2.includes(word.trim()) || words3.includes(word.trim())) {
                return word;
            }
            return word.toUpperCase();
        });
        words = words.replace(/\W\w{1,3}$/g, (word) => {
            if (words2.includes(word.trim()) || words3.includes(word.trim())) {
                return word;
            }
            return word.toUpperCase();
        });

        words = words.replace('INC', 'Inc');
        words = words.replace("'S", "'s");
        words = words.replace('-IN', '-In');
        words = words.replace('IN-', 'In-');

        return words;
    }

    function toZipCode(value) {
        value = toNumber(value);
        if (value.length < 6) {
            return value;
        }
        return `${value.substring(0, 5)}-${value.substring(5, 9)}`;
    }

    function toSSN(value) {
        value = toNumber(value);
        if (value.length < 9) {
            return value;
        }
        return `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 9)}`;
    }

    function toEIN(value) {
        value = toNumber(value);
        if (value.length < 9) {
            return value;
        }
        return `${value.substring(0, 2)}-${value.substring(2, 9)}`;
    }

    function toString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return value.toString().trim();
    }

    function handleOptions(value, options) {
        let val = parseFloat(value);
        if (options.min && val < options.min) {
            return options.min;
        }
        if (options.max && val > options.max) {
            return options.max;
        }
        return value;
    }

    const formatters = {
        accounting: {
            name: 'accounting',
            from(value) {
                const isNeg = /^\(/.test(value);
                return parseFloat(toDecimal(value) || 0) * (isNeg ? -1 : 1);
            },
            to(value, isHtml, options = {}) {
                value = handleOptions(value, options);
                if (value === 0) {
                    return '$0.00';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                value = formatters.currency.toHtml(value);
                if (/^-/.test(value)) {
                    value = `(${value.replace('-', '')})`;
                }
                return value;
            },
            toHtml(value, options) {
                return formatters.accounting.to(value, true, options);
            },
        },
        currency: {
            name: 'currency',
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml, options = {}) {
                value = handleOptions(value, options);
                if (value === 0) {
                    return '$0.00';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return formatMoney(value).replace('$-', '-$');
            },
            toHtml(value, options) {
                return formatters.currency.to(value, true, options);
            },
        },
        percentage: {
            name: 'percentage',
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml, options = {}) {
                value = handleOptions(value, options);
                if (value === 0 || value === '0') {
                    return '0.00%';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toFloat(toDecimal(value)) + '%';
            },
            toHtml(value, options) {
                return formatters.percentage.to(value, true, options);
            },
        },
        integer: {
            name: 'integer',
            from(value) {
                return parseInt(toDecimal(value) || 0, 10);
            },
            to(value, isHtml, options = {}) {
                value = handleOptions(value, options);
                if (value === 0) {
                    return '0';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                const isNeg = /^-/.test(value);
                value = (isNeg ? '-' : '') + toString(value).split('.')[0].replace(/\D/g, '');
                return value;
            },
            toHtml(value, options) {
                return formatters.integer.to(value, true, options);
            },
        },
        number: {
            name: 'number',
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml, options = {}) {
                value = handleOptions(value, options);
                if (value === 0) {
                    return '0';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                const isNeg = /^-/.test(value);
                return toDecimal(value);
                // return (isNeg ? '-' : '') + toDecimal(value);
            },
            toHtml(value, options) {
                return formatters.number.to(value, true, options);
            },
        },
        digits: {
            name: 'digits',
            from(value) {
                return toNumber(value);
            },
            to(value, isHtml) {
                if (value === 0) {
                    return '';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                const isNeg = /^-/.test(value);
                return toNumber(value);
            },
            toHtml(value) {
                return formatters.number.to(value, true);
            },
        },
        phone: {
            name: 'phone',
            from(value) {
                return formatPhone(value);
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return formatPhone(value);
            },
            toHtml(value) {
                return formatters.phone.to(value, true);
            },
        },
        titleCase: {
            name: 'titleCase',
            from(value) {
                return toTitleCase(value);
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toTitleCase(value);
            },
            toHtml(value) {
                return formatters.titleCase.to(value, true);
            },
        },
        upperToTitleCase: {
            name: 'titleCase',
            from(value) {
                return value;
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                if (!isUpperCase(value)) {
                    return value;
                }
                return toTitleCase(value);
            },
            toHtml(value) {
                return formatters.titleCase.to(value, true);
            },
        },
        zipcode: {
            name: 'zipcode',
            from(value) {
                return value;
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toZipCode(value);
            },
            toHtml(value) {
                return formatters.zipcode.to(value, true);
            },
        },
        ssn: {
            name: 'ssn',
            from(value) {
                return value;
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toSSN(value);
            },
            toHtml(value) {
                return formatters.ssn.to(value, true);
            },
        },
        ein: {
            name: 'ein',
            from(value) {
                return value;
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toEIN(value);
            },
            toHtml(value) {
                return formatters.ein.to(value, true);
            },
        },
        default: {
            from(value) {
                return value;
            },
            to(value, isHtml) {
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return value;
            },
            toHtml(value) {
                return formatters.default.to(value, true);
            },
        },
    };

    const states = [
        'AL',
        'AK',
        'AS',
        'AZ',
        'AR',
        'CA',
        'CO',
        'CT',
        'DE',
        'DC',
        'FM',
        'FL',
        'GA',
        'GU',
        'HI',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'ME',
        'MH',
        'MD',
        'MA',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NH',
        'NJ',
        'NM',
        'NY',
        'NC',
        'ND',
        'MP',
        'OH',
        'OK',
        'OR',
        'PW',
        'PA',
        'PR',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VT',
        'VI',
        'VA',
        'WA',
        'WV',
        'WI',
        'WY',
    ];

    return formatters;
});
