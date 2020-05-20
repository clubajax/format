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
        const n = toNumber(value);
        return `(${n.substring(0, 3)}) ${n.substring(3, 6)}-${n.substring(6)}`;
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

    function cap(value) {
        value = toString(value);
        return `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`;
    }

    const words2 = 'ax, ex, ox, by, my, ok, ah, aw, eh, ha, he, hi, if, of, we, am, be, me, up, ad, do, go, an, ar, as, at, et, in, is, it, lo, no, on, so, to, us'.split(', ');
    const words3 = [
        'a', 'for', 'the', 'and', 'nor', 'but', 'yet'
    ];
    const specWord = {
        'po': 1,
        'po.': 1,
        'p.o.': 1
    };
    function isAbbr(word) {
        return !/[aeiou]/.test(word);
    }

    function toTitleCase(value) {
        return toString(value).toLowerCase().split(' ').map((word, i) => {
            if (specWord[word] || isAbbr(word)) {
                return word.toUpperCase();
            }
            if (i === 0) {
                return cap(word);
            }
            if (words2.includes(word) || words3.includes(word)) {
                return word;
            }

            // less than three uppercase?

            return cap(word);
        }).join(' ');
    }

    function toZipCode(value) {
        value = toNumber(value);
        if (value.length < 6) {
            return value;
        }
        return `${value.substring(0, 5)}-${value.substring(5, 9)}`;
    }

    function toString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return value.toString().trim();
    }

    const formatters = {
        accounting: {
            from(value) {
                const isNeg = /^\(/.test(value);
                return parseFloat(toDecimal(value) || 0) * (isNeg ? -1 : 1);
            },
            to(value, isHtml) {
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
            toHtml(value) {
                return formatters.accounting.to(value, true);
            },
        },
        currency: {
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml) {
                if (value === 0) {
                    return '$0.00';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return formatMoney(value).replace('$-', '-$');
            },
            toHtml(value) {
                return formatters.currency.to(value, true);
            },
        },
        percentage: {
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml) {
                if (value === 0) {
                    return '0%';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                return toDecimal(value) + '%';
            },
            toHtml(value) {
                return formatters.percentage.to(value, true);
            },
        },
        integer: {
            from(value) {
                return parseInt(toDecimal(value) || 0, 10);
            },
            to(value, isHtml) {
                if (value === 0) {
                    return '0';
                }
                if (!value) {
                    return isHtml ? SPACE : '';
                }
                const isNeg = /^-/.test(value);
                return (isNeg ? '-' : '') + toString(value).split('.')[0].replace(/\D/g, '');
            },
            toHtml(value) {
                return formatters.integer.to(value, true);
            },
        },
        number: {
            from(value) {
                return parseFloat(toDecimal(value) || 0);
            },
            to(value, isHtml) {
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
            toHtml(value) {
                return formatters.number.to(value, true);
            },
        },
        phone: {
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
            }
        },
        titleCase: {
            from(value){
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
            }
        },
        zipcode: {
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

    return formatters;
});
