import {Dimensions, Platform} from 'react-native';
import _ from 'lodash';
require('string.fromcodepoint');

export const toEmoji = code => {
    return String.fromCodePoint(...code.split('-').map(u => '0x' + u));
};

export const isIphoneXorAbove = () => {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 ||
            dimen.width === 812 ||
            (dimen.height === 896 || dimen.width === 896))
    );
};

export const isAndroid = () => {
    return Platform.OS === 'android';
};

const getUnicodeVersion = () => {
    const version = parseFloat(Platform.Version);
    if (Platform.OS === 'ios') {
        return version < 13.2 ? 11 : 12.1;
    } else {
        if (version < 24) {
            return 7.0;
        } else if (version < 26) {
            return 8.0;
        } else if (version < 28) {
            return 9.0;
        } else if (version < 29) {
            return 10.0;
        } else {
            return 12.1;
        }
    }
};

export const handleDefaultEmoji = (data, blackList) => {
    const unicodeVersion = getUnicodeVersion();
    console.log('unicodeVersion', unicodeVersion);
    const checkedData = data.filter(e => parseFloat(e.added_in) <= unicodeVersion && e[hasImageOS] === true);
    const filteredData = checkedData.filter(e => !_.includes(blackList, e.short_name));
    const sortedData = _.orderBy(filteredData, 'sort_order');
    const groupedData = _.groupBy(sortedData, 'category');

    const transformData = _.mapValues(groupedData, group =>
        group.map(value => {
            let skins = null;
            if (value.skin_variations) {
                skins = _.toArray(value.skin_variations).map(skin => {
                    return {
                        code: toEmoji(skin.unified),
                        name: value.name
                    };
                });
            }
            return {
                code: toEmoji(value.unified),
                name: value.short_name,
                added_in: value.added_in,
                skins
            };
        })
    );
    return transformData;
};

export const handleCustomEmoji = (data, blackList) => {
    const filteredData = data.filter(e => !_.includes(blackList, e.name));
    const sortedData = _.orderBy(filteredData, 'sort_order');
    const groupedData = _.groupBy(sortedData, 'category');

    const transformData = _.mapValues(groupedData, group =>
        group.map(value => {
            return {
                code: value.code || null,
                img: value.img || null,
                name: value.name || null,
                skins: value.skins || null
            };
        })
    );
    return transformData;
};
