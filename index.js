/* eslint-disable max-lines-per-function, object-shorthand, sort-vars, no-nested-ternary, indent, indent-legacy, complexity, no-plusplus, prefer-reflect*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
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

    function stripLeadingZeros(value) {
        while (value.length && value[0] === '0') {
            value = value.substring(1);
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
        return value.toString().match(/\d/g).join('');
    }

    function toDecimal(value) {
        value = toString(value).replace('$', '');
        const result = value.match(/-*\d|\./g);
        if (result) {
            return stripLeadingZeros(result.join(''));
        }
        return '';
    }

    function cap(value) {
        value = toString(value);
        return `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`;
    }

    const shortWords = [
        'a', 'for', 'so', 'an', 'in', 'the', 'and', 'nor', 'to', 'at', 'of', 'up', 'but', 'on', 'yet', 'by', 'or', 'is', 'do'
    ];
    function toTitleCase(value) {
        return toString(value).toLowerCase().split(' ').map((word, i) => {
            if (i === 0) {
                return cap(word);
            }
            if (shortWords.includes(word)) {
                return word;
            }
            return cap(word);
        }).join(' ');
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
                const isNeg = /^\(|^-/.test(value);
                return (isNeg ? '-' : '') + toDecimal(value).replace('-', '');
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
                return toDecimal(value);
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
                return toDecimal(value);
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
                return formatters.integer.toHtml(value);
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
        default: {
            from(value) {
                return value;
            },
            to(value) {
                return value;  
            },
            toHtml(value) {
                return value;
            },
        },
    };

    return formatters;
});
